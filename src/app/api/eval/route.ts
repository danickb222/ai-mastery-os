'use client';

import { useState } from 'react';
import { getDrillById } from '@/lib/drills/seed';
import type { EvaluationResult } from '@/lib/contracts/evaluation';

interface PageProps {
  params: { drillId: string };
}

export default function TrainPage({ params }: PageProps) {
  const drillId = params.drillId;
  const drill = getDrillById(drillId);

  // Call your existing /api/eval route
  const evaluateDrill = async (payload: {
    drillId: string;
    submission: string;
  }) => {
    const res = await fetch('/api/eval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return res.json();
  };

  const [submission, setSubmission] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!drill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Drill not found: {drillId}</div>
      </div>
    );
  }

    const drill = getDrillById(drillId);
    if (!drill) {
      return NextResponse.json(
        { success: false, error: `Drill not found: ${drillId}` },
        { status: 404 }
      );
    }

    const injectionSignals = detectPromptInjection(submission);
    const { system, user } = buildEvaluatorPrompt({
      drill,
      submission,
      injectionSignals,
    });

    let lastError = '';

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const { content } = await callOpenAI({
          systemPrompt: system,
          userPrompt: user,
          model: 'gpt-4o-2024-08-06',
          temperature: 0.2,
          maxTokens: 4000,
          responseFormat: 'json_object',
        });

        let parsed: unknown;
        try {
          parsed = JSON.parse(content);
        } catch (parseError) {
          lastError = `Invalid JSON response`;
          continue;
        }

        const validationResult = EvaluationResultSchema.safeParse(parsed);
        if (!validationResult.success) {
          lastError = `Schema validation failed`;
          continue;
        }

        const evaluation = validationResult.data;

        for (const rubricScore of evaluation.rubricScores) {
          assertEvidenceQuotesAreSubstrings(
            submission,
            rubricScore.evidenceQuotes
          );
        }

        const computedScore = computeOverallScoreFromRubric(
          drill,
          evaluation.rubricScores
        );

        evaluation.overallScore = computedScore;

        return NextResponse.json({
          success: true,
          data: evaluation,
        });
      } catch (error) {
        lastError =
          error instanceof Error ? error.message : 'Unknown evaluation error';
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: `Evaluation failed after retries. ${lastError}`,
      },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Malformed request',
      },
      { status: 400 }
    );
  }
}