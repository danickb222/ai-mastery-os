import { NextRequest, NextResponse } from 'next/server';
import type { AutopsyResult } from '@/core/types/drills';

const SYSTEM_PROMPT = `You are an expert prompt engineering analyst performing a forensic breakdown of a submitted prompt.

Your job is to analyze the prompt text and return a structured JSON object identifying how each phrase, clause, or token group contributes to or hurts the prompt's quality.

Return ONLY valid JSON, no markdown, no preamble.

JSON structure:
{
  "segments": [
    {
      "text": "exact text from submission",
      "type": "critical" | "good" | "neutral" | "weak" | "bad",
      "explanation": "one sentence explaining why",
      "criterion": "which rubric criterion this affects, or null"
    }
  ],
  "fatalIssues": [
    "string description of any fatal problems"
  ],
  "exemplarPrompt": "a rewritten version of the prompt that would score 85+, written in the same style/domain",
  "topInsight": "the single most important thing to understand about why this prompt scored as it did"
}

Segment types:
- critical: strongly positive, directly addresses a criterion
- good: positive, helpful but not critical
- neutral: neither helps nor hurts
- weak: vague or underspecified, loses points
- bad: actively harmful to the score, creates ambiguity

Cover every word in the submission — segments must concatenate to reconstruct the full submission text.
Keep explanations under 15 words each.
The exemplarPrompt should be 3-6 sentences, addressing all rubric criteria explicitly.`;

function safeJsonParse(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const first = trimmed.indexOf('{');
    const last = trimmed.lastIndexOf('}');
    if (first >= 0 && last > first) {
      return JSON.parse(trimmed.slice(first, last + 1));
    }
    throw new Error('Failed to parse JSON from model output');
  }
}

const VALID_TYPES = new Set(['critical', 'good', 'neutral', 'weak', 'bad']);

function validateAutopsyResult(data: unknown): AutopsyResult {
  if (!data || typeof data !== 'object') throw new Error('Invalid response structure');
  const d = data as Record<string, unknown>;

  if (!Array.isArray(d.segments)) throw new Error('Missing segments array');
  if (!Array.isArray(d.fatalIssues)) throw new Error('Missing fatalIssues array');
  if (typeof d.exemplarPrompt !== 'string') throw new Error('Missing exemplarPrompt');
  if (typeof d.topInsight !== 'string') throw new Error('Missing topInsight');

  const segments = (d.segments as unknown[]).map((s, i) => {
    if (!s || typeof s !== 'object') throw new Error(`Segment ${i} is not an object`);
    const seg = s as Record<string, unknown>;
    if (typeof seg.text !== 'string') throw new Error(`Segment ${i} missing text`);
    const type = VALID_TYPES.has(seg.type as string)
      ? (seg.type as AutopsyResult['segments'][number]['type'])
      : 'neutral';
    return {
      text: seg.text,
      type,
      explanation: typeof seg.explanation === 'string' ? seg.explanation : '',
      criterion: typeof seg.criterion === 'string' ? seg.criterion : null,
    };
  });

  return {
    segments,
    fatalIssues: (d.fatalIssues as unknown[]).filter(f => typeof f === 'string') as string[],
    exemplarPrompt: d.exemplarPrompt,
    topInsight: d.topInsight,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const { submission, drillTitle, rubricCriteria } = body;

    if (typeof submission !== 'string' || !submission.trim()) {
      return NextResponse.json({ error: 'submission is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

    const criteriaStr = Array.isArray(rubricCriteria)
      ? rubricCriteria
          .map((c: unknown) => {
            const cr = c as Record<string, unknown>;
            return `${cr.name} (${cr.maxPoints} pts)`;
          })
          .join(', ')
      : 'See drill rubric';

    const userMessage = `Drill: ${drillTitle}\nRubric criteria: ${criteriaStr}\nSubmitted prompt: ${submission}\n\nAnalyze this prompt and return the autopsy JSON.`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`OpenAI call failed (${resp.status}): ${text}`);
    }

    const data = await resp.json() as Record<string, unknown>;
    const choices = data?.choices as Array<Record<string, unknown>> | undefined;
    const content = choices?.[0]?.message as Record<string, unknown> | undefined;
    const rawContent = content?.content;
    if (typeof rawContent !== 'string' || !rawContent) {
      throw new Error('OpenAI returned empty content');
    }

    const parsed = safeJsonParse(rawContent);
    const result = validateAutopsyResult(parsed);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
