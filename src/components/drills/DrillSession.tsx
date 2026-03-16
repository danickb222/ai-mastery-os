"use client";
import { useEffect, useRef, useState } from 'react';
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
  drillIndex?: number;
  totalDrills?: number;
}

type SessionPhase = 'active' | 'feedback' | 'complete';

export function DrillSession({ drill, onComplete, onExit, drillIndex, totalDrills }: DrillSessionProps) {
  const [phase, setPhase] = useState<SessionPhase>('active');
  const [result, setResult] = useState<DrillResult | null>(null);
  const startTimeRef = useRef(Date.now());

  // Hide AppShell nav during drill exercises
  useEffect(() => {
    window.dispatchEvent(new Event('drill-session-start'));
    return () => { window.dispatchEvent(new Event('drill-session-end')); };
  }, []);

  const handleSubmit = (drillResult: DrillResult) => {
    console.log('DrillSession handleSubmit called');
    console.log('DrillSession setting result - evalData:', drillResult?.evalData);
    setResult(drillResult);
    setPhase('feedback');
  };

  const handleContinue = () => {
    if (result) {
      onComplete(result);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setPhase('active');
    startTimeRef.current = Date.now();
  };

  if (phase === 'feedback' && result) {
    return (
      <DrillFeedback
        drill={drill}
        result={result}
        onContinue={handleContinue}
        onExit={onExit}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {drill.type === 'prompt_construction' && drill.domain === 'prompt_engineering' && (
        <SniperDrill
          drill={drill as PromptConstructionDrillType}
          drillIndex={drillIndex}
          totalDrills={totalDrills}
          onSubmit={({ userInput, score = 0, evalResult }) => {
            const d = drill as PromptConstructionDrillType;
            const rubricMap: Record<string, { score: number; justification: string }> = {};
            if (evalResult?.rubricScores) {
              for (const r of evalResult.rubricScores) {
                rubricMap[r.rubricItemId] = { score: r.score, justification: r.justification ?? '' };
              }
            }
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
                  score: rubricMap[c.id]?.score ?? Math.round((score / 100) * c.maxPoints),
                  maxPoints: c.maxPoints,
                  feedback: rubricMap[c.id]?.justification ?? '',
                })),
                performanceLabel:
                  score >= 90 ? 'Precision Shot' :
                  score >= 70 ? 'On Target' :
                  score >= 50 ? 'Getting Closer' : 'Keep Refining',
                feedbackSummary: '',
              },
              evalData: evalResult ? {
                rubricScores: evalResult.rubricScores ?? [],
                strengths: evalResult.strengths ?? [],
                weaknesses: evalResult.weaknesses ?? [],
                missedConstraints: evalResult.missedConstraints ?? [],
                revisionInstructions: evalResult.revisionInstructions ?? [],
                improvedVersionOutline: evalResult.improvedVersionOutline ?? '',
                masteryDecision: evalResult.masteryDecision ?? 'not_yet',
              } : undefined,
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
