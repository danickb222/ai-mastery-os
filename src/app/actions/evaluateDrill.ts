'use server';

import { getDrillById } from '@/lib/drills/seed';
import { EvaluationResultSchema } from '@/lib/contracts/evaluation';
import {
  detectPromptInjection,
  assertEvidenceQuotesAreSubstrings,
  computeOverallScoreFromRubric,
} from '@/lib/contracts/guards';
import { buildEvaluatorPrompt } from '@/lib/prompts/evaluator';

type EvaluateDrillArgs = {
  drillId: string;
  submission: string;
};

async function callOpenAIJSON(system: string, user: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const model = process.env.OPENAI_EVAL_MODEL ?? 'gpt-4o-mini';

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI call failed (${resp.status}): ${text}`);
  }

  const data = (await resp.json()) as any;
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') throw new Error('OpenAI returned empty content');
  return content;
}

function safeJsonParse(raw: string): any {
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

function normalizeMasteryDecision(value: unknown): 'not_yet' | 'mastered' | undefined {
  if (typeof value !== 'string') return undefined;

  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s-]+/g, '_');

  if (cleaned === 'mastered') return 'mastered';
  if (cleaned === 'not_yet' || cleaned === 'notyet') return 'not_yet';
  if (cleaned === 'not_yet_' || cleaned === '_not_yet') return 'not_yet';

  return undefined;
}

function coerceAndPatch(parsed: any) {
  if (parsed && typeof parsed === 'object') {
    const md = normalizeMasteryDecision(parsed.masteryDecision);
    parsed.masteryDecision = md ?? 'not_yet';
  }
  return parsed;
}

/**
 * Strong, model-independent checks for the *submission quality*.
 * These do NOT look at rubric item IDs at all.
 */
function hasMeasurableThreshold(text: string): boolean {
  const t = text ?? '';

  // number + unit (time, %, counts)
  const unitPattern =
    /\b\d+(?:\.\d+)?\s*(minutes?|mins?|hours?|hrs?|days?|weeks?|months?|%|percent|patients?|slots?|appointments?|requests?)\b/i;

  // comparator + number
  const comparatorPattern =
    /(?:>=|<=|>|<|=)\s*\d+|\b(at least|no more than|no less than|maximum of|minimum of)\s+\d+\b/i;

  // time-bound phrases
  const timeBoundPattern =
    /\b(within|no later than|by)\s+\d+\s*(minutes?|mins?|hours?|hrs?|days?)\b/i;

  return unitPattern.test(t) || comparatorPattern.test(t) || timeBoundPattern.test(t);
}

function hasExplicitJsonSchema(text: string): boolean {
  const t = text ?? '';
  const jsonObjectWithQuotedKeys = /\{[\s\S]*?"[A-Za-z0-9_ -]+"\s*:\s*[\s\S]*?\}/.test(t);
  const codeFenceJson = /```(?:json)?[\s\S]*?\{[\s\S]*?"[A-Za-z0-9_ -]+"\s*:[\s\S]*?\}[\s\S]*?```/i.test(
    t
  );
  return codeFenceJson || jsonObjectWithQuotedKeys;
}

function hasPriorityHierarchy(text: string): boolean {
  const t = text ?? '';

  const precedenceLanguage =
    /\b(order of precedence|precedence|priority stack|priority order|hierarchy|tie-?break(?:er)?|override rule|conflict resolution)\b/i;

  const deterministicConflict =
    /\b(if|when)\b[\s\S]{0,80}\b(conflict|collide|cannot both be satisfied)\b[\s\S]{0,120}\b(then)\b[\s\S]{0,120}\b(override|wins|takes precedence|supersedes)\b/i;

  return precedenceLanguage.test(t) || deterministicConflict.test(t);
}

function enforcementIsNonDeterministic(text: string): boolean {
  const t = text ?? '';
  const modalHits =
    (t.match(/\b(should|may|might|prefer|ideally|if appropriate|as appropriate|where possible)\b/gi) ??
      []).length;
  const hardHits =
    (t.match(/\b(must|shall|required|will not|must not|always|never)\b/gi) ?? []).length;

  return modalHits >= 6 && hardHits < modalHits;
}

/**
 * Deterministic penalty applied to recomputed overall score.
 * This is the "fix everything" lever: it works regardless of rubric item IDs.
 *
 * Important: penalties are only for *structural* violations we care about in this drill.
 */
function applyStructuralPenalty(submission: string) {
  const t = submission ?? '';

  const measurable = hasMeasurableThreshold(t);
  const jsonSchema = hasExplicitJsonSchema(t);
  const hierarchy = hasPriorityHierarchy(t);
  const nondet = enforcementIsNonDeterministic(t);

  // HIPAA mention is a useful signal (still not sufficient), but in this drill it’s required.
  const mentionsHipaa = /\bHIPAA\b/i.test(t) || /\bPHI\b/i.test(t) || /\bprotected health information\b/i.test(t);

  // Lead-time / minimum notice signal
  const mentionsLeadTime =
    /\b(lead time|minimum notice|advance notice|no sooner than|at least)\b/i.test(t) &&
    /\b(hours?|days?)\b/i.test(t);

  const penalties: Array<{ key: string; points: number; reason: string }> = [];

  if (!measurable) {
    penalties.push({
      key: 'measurability',
      points: 12,
      reason: 'No measurable thresholds (numbers with units/comparators/time bounds).',
    });
  }

  if (!jsonSchema) {
    penalties.push({
      key: 'json_schema',
      points: 12,
      reason: 'No explicit JSON schema/example with quoted keys.',
    });
  }

  if (!hierarchy) {
    penalties.push({
      key: 'priority_hierarchy',
      points: 10,
      reason: 'No explicit precedence stack / deterministic tie-break rules.',
    });
  }

  if (nondet) {
    penalties.push({
      key: 'non_determinism',
      points: 8,
      reason: 'Enforcement language dominated by "should/may/prefer" rather than "must/shall".',
    });
  }

  if (!mentionsHipaa) {
    penalties.push({
      key: 'hipaa_absent',
      points: 10,
      reason: 'No HIPAA/PHI safeguards mentioned (required constraint category).',
    });
  }

  if (!mentionsLeadTime) {
    penalties.push({
      key: 'lead_time_absent',
      points: 6,
      reason: 'No minimum lead-time / advance notice constraints detected.',
    });
  }

  // Cap total penalty so we don’t nuke everything beyond usefulness.
  const total = Math.min(
    40,
    penalties.reduce((sum, p) => sum + p.points, 0)
  );

  return { totalPenalty: total, penaltyBreakdown: penalties };
}

export async function evaluateDrill(args: EvaluateDrillArgs) {
  const { drillId, submission } = args;

  if (!drillId || !submission?.trim()) throw new Error('drillId and submission are required');

  const drill = getDrillById(drillId);
  if (!drill) throw new Error(`Drill not found: ${drillId}`);

  const injectionSignals = detectPromptInjection(submission);
  const { system, user } = buildEvaluatorPrompt({ drill, submission, injectionSignals });

  let lastErr: any = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const raw = await callOpenAIJSON(system, user);
      const parsed = coerceAndPatch(safeJsonParse(raw));

      const validated = EvaluationResultSchema.parse(parsed);

      // evidence quotes must be literal substrings
      for (const r of validated.rubricScores) {
        assertEvidenceQuotesAreSubstrings(submission, r.evidenceQuotes);
      }

      // recompute overall score from rubric
      const recomputed = computeOverallScoreFromRubric(drill, validated.rubricScores);

      // deterministic structural penalty (model-independent)
      const { totalPenalty, penaltyBreakdown } = applyStructuralPenalty(submission);
      const penalizedScore = Math.max(0, recomputed - totalPenalty);

      // force mastery rule deterministically (don’t trust model)
      const criticalMisses = (validated.missedConstraints ?? []).length > 0;
      const masteryDecision: 'not_yet' | 'mastered' =
        penalizedScore >= 85 && !criticalMisses ? 'mastered' : 'not_yet';

      return {
        ...validated,
        overallScore: penalizedScore,
        masteryDecision,
        // Optional debug output (remove if you don’t want it in UI)
        structuralPenalty: {
          totalPenalty,
          breakdown: penaltyBreakdown,
        },
      } as any;
    } catch (e: any) {
      lastErr = e;
    }
  }

  throw new Error(lastErr?.message ?? 'Evaluation failed after retries');
}