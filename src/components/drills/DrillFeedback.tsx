"use client";
import type { AnyDrill, DrillResult } from '@/core/types/drills';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScoreCounter } from '@/components/ui/ScoreCounter';

interface DrillFeedbackProps {
  drill: AnyDrill;
  result: DrillResult;
  onContinue: () => void;
  onExit: () => void;
}

export function DrillFeedback({ drill, result, onContinue, onExit }: DrillFeedbackProps) {
  const percentage = result.scoringResult.percentage;
  const isPassing = percentage >= 65;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-[var(--color-surface)] border-4 border-[var(--color-border)]">
            <div className="text-5xl font-bold t-score">
              <ScoreCounter target={percentage} />%
            </div>
          </div>
          
          <h1 className="text-3xl font-bold">{drill.title}</h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            {result.scoringResult.performanceLabel}
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-[var(--color-text-secondary)]">
              Score: {result.scoringResult.totalScore} / {result.scoringResult.maxScore}
            </span>
            <span className="text-[var(--color-text-secondary)]">•</span>
            <span className="text-[var(--color-text-secondary)]">
              Time: {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
            </span>
          </div>
        </div>

        <Card>
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Performance Breakdown</h2>
              <div className="space-y-4">
                {result.scoringResult.criteriaResults.map((criterion) => (
                  <div key={criterion.criterionId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{criterion.label}</span>
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        {criterion.score} / {criterion.maxPoints}
                      </span>
                    </div>
                    <ProgressBar
                      value={(criterion.score / criterion.maxPoints) * 100}
                      size="sm"
                      color={criterion.score / criterion.maxPoints >= 0.7 ? 'green' : criterion.score / criterion.maxPoints >= 0.5 ? 'yellow' : 'red'}
                    />
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {criterion.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)]">
              <h3 className="font-semibold mb-2">Key Insight</h3>
              <p className="text-[var(--color-text-secondary)]">{drill.explanation}</p>
            </div>

            {!isPassing && (
              <div className="p-4 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 rounded-lg">
                <p className="text-sm">
                  <strong>Recommendation:</strong> Review the reference solution and retry this drill before advancing. Mastery requires consistent performance above 65%.
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button variant="ghost" onClick={onExit}>
            Exit to Curriculum
          </Button>
          <Button variant="primary" onClick={onContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
