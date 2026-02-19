import { NextRequest, NextResponse } from "next/server";

/**
 * Optional LLM-powered evaluation endpoint.
 * Falls back to a structured mock response if no OPENAI_API_KEY is set.
 *
 * POST /api/eval
 * Body: { topicId, challengeType, rubricDimensions: string[], response: string }
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topicId,
      challengeType,
      rubricDimensions,
      response: userResponse,
    } = body as {
      topicId: string;
      challengeType: string;
      rubricDimensions: string[];
      response: string;
    };

    if (!userResponse || !rubricDimensions?.length) {
      return NextResponse.json(
        { error: "Missing required fields: response, rubricDimensions" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      // Real LLM evaluation
      const systemPrompt = `You are a rigorous certification evaluator for an AI operator competency program.

You are evaluating a "${challengeType}" certification submission for topic "${topicId}".

You MUST score the submission on each of these rubric dimensions: ${rubricDimensions.join(", ")}.

For each dimension, provide:
- A score from 0 to 100
- Specific, actionable feedback (2-3 sentences)

Also provide:
- An overall score (weighted average)
- Whether the submission passes (score >= 80)
- A list of weaknesses (dimensions scoring below 60)
- A confidence level: "high" if you can fully evaluate, "medium" if partially, "low" if submission is too vague

Respond with ONLY valid JSON matching this schema:
{
  "score": <number>,
  "passed": <boolean>,
  "breakdown": [
    { "dimension": "<string>", "score": <number>, "feedback": "<string>" }
  ],
  "confidence": "high" | "medium" | "low",
  "weaknesses": ["<string>", ...]
}

Do not include any text outside the JSON. Be strict but fair. No MCQs. Evaluate demonstrated capability only.`;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Evaluate this certification submission:\n\n${userResponse}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("OpenAI API error:", errText);
        return NextResponse.json(mockEvaluation(rubricDimensions));
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return NextResponse.json(mockEvaluation(rubricDimensions));
      }

      try {
        const cleaned = content
          .replace(/```json\s*/g, "")
          .replace(/```/g, "")
          .trim();
        const parsed = JSON.parse(cleaned);
        return NextResponse.json(parsed);
      } catch {
        console.error("Failed to parse LLM evaluation response");
        return NextResponse.json(mockEvaluation(rubricDimensions));
      }
    }

    // No API key — return deterministic mock
    return NextResponse.json(mockEvaluation(rubricDimensions));
  } catch (error) {
    console.error("Eval API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function mockEvaluation(rubricDimensions: string[]) {
  const breakdown = rubricDimensions.map((dimension) => ({
    dimension,
    score: 65 + Math.floor(Math.random() * 20),
    feedback: `Mock evaluation: Your response shows foundational understanding of ${dimension.toLowerCase()}. To improve, provide more specific examples and address edge cases explicitly.`,
  }));

  const avgScore = Math.round(
    breakdown.reduce((sum, b) => sum + b.score, 0) / breakdown.length
  );

  return {
    score: avgScore,
    passed: avgScore >= 80,
    breakdown,
    confidence: "low" as const,
    weaknesses: breakdown
      .filter((b) => b.score < 60)
      .map((b) => b.dimension),
    _mock: true,
  };
}
