"use client";
import { useRef, useState } from 'react';
import type { AnyDrill, DrillResult, PromptConstructionDrill as PromptConstructionDrillType } from '@/core/types/drills';
import { PromptConstructionDrill } from './PromptConstructionDrill';
import { PromptDebugDrill } from './PromptDebugDrill';
import { OutputAnalysisDrill } from './OutputAnalysisDrill';
import { LiveChallengeDrill } from './LiveChallengeDrill';
import { ScenarioSimulationDrill } from './ScenarioSimulationDrill';
import { DrillFeedback } from './DrillFeedback';
import SniperDrill from './SniperDrill';

interface DrillSessionProps {
  drill: AnyDrill;
  onComplete: (result: DrillResult) => void;
  onExit: () => void;
}

type SessionPhase = 'active' | 'feedback' | 'complete';

export function DrillSession({ drill, onComplete, onExit }: DrillSessionProps) {
  const [phase, setPhase] = useState<SessionPhase>('active');
  const [result, setResult] = useState<DrillResult | null>(null);
  const startTimeRef = useRef(Date.now());

  const handleSubmit = (drillResult: DrillResult) => {
    setResult(drillResult);
    setPhase('feedback');
  };

  const handleContinue = () => {
    if (result) {
      onComplete(result);
    }
  };

  if (phase === 'feedback' && result) {
    return (
      <DrillFeedback
        drill={drill}
        result={result}
        onContinue={handleContinue}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {drill.type === 'prompt_construction' && drill.domain === 'prompt_engineering' && (
        <SniperDrill
          drill={drill as PromptConstructionDrillType}
          onSubmit={({ userInput, score = 0 }) => {
            const d = drill as PromptConstructionDrillType;
            handleSubmit({
              drillId: d.id,
              score,
              timeSpent: Math.floor((Date.now() - startTimeRef.current) / 1000),
              userInput,
              submittedAt: new Date().toISOString(),
              scoringResult: {
                totalScore: score,
                maxScore: 100,
                percentage: score,
                criteriaResults: d.successCriteria.map(c => ({
                  criterionId: c.id,
                  label: c.label,
                  score: Math.round((score / 100) * c.maxPoints),
                  maxPoints: c.maxPoints,
                  feedback: '',
                })),
                performanceLabel:
                  score >= 90 ? 'Precision Shot' :
                  score >= 70 ? 'On Target' :
                  score >= 50 ? 'Getting Closer' : 'Keep Refining',
                feedbackSummary: '',
              },
            });
          }}
          onExit={onExit}
        />
      )}
      {drill.type === 'prompt_construction' && drill.domain !== 'prompt_engineering' && (
        <PromptConstructionDrill
          drill={drill}
          onSubmit={handleSubmit}
          onExit={onExit}
        />
      )}
      {drill.type === 'prompt_debug' && (
        <PromptDebugDrill
          drill={drill}
          onSubmit={handleSubmit}
          onExit={onExit}
        />
      )}
      {drill.type === 'output_analysis' && (
        <OutputAnalysisDrill
          drill={drill}
          onSubmit={handleSubmit}
          onExit={onExit}
        />
      )}
      {drill.type === 'live_challenge' && (
        <LiveChallengeDrill
          drill={drill}
          onSubmit={handleSubmit}
          onExit={onExit}
        />
      )}
      {drill.type === 'scenario_simulation' && (
        <ScenarioSimulationDrill
          drill={drill}
          onSubmit={handleSubmit}
          onExit={onExit}
        />
      )}
    </div>
  );
}
