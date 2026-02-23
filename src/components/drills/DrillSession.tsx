"use client";
import { useState } from 'react';
import type { AnyDrill, DrillResult } from '@/core/types/drills';
import { PromptConstructionDrill } from './PromptConstructionDrill';
import { PromptDebugDrill } from './PromptDebugDrill';
import { OutputAnalysisDrill } from './OutputAnalysisDrill';
import { LiveChallengeDrill } from './LiveChallengeDrill';
import { ScenarioSimulationDrill } from './ScenarioSimulationDrill';
import { DrillFeedback } from './DrillFeedback';

interface DrillSessionProps {
  drill: AnyDrill;
  onComplete: (result: DrillResult) => void;
  onExit: () => void;
}

type SessionPhase = 'active' | 'feedback' | 'complete';

export function DrillSession({ drill, onComplete, onExit }: DrillSessionProps) {
  const [phase, setPhase] = useState<SessionPhase>('active');
  const [result, setResult] = useState<DrillResult | null>(null);

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
      {drill.type === 'prompt_construction' && (
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
