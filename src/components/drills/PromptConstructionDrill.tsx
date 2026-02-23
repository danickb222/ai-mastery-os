"use client";
import { useState, useEffect } from 'react';
import type { PromptConstructionDrill as PromptConstructionDrillType, DrillResult } from '@/core/types/drills';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { scorePromptConstruction } from '@/core/scoring/engine';

interface PromptConstructionDrillProps {
  drill: PromptConstructionDrillType;
  onSubmit: (result: DrillResult) => void;
  onExit: () => void;
}

export function PromptConstructionDrill({ drill, onSubmit, onExit }: PromptConstructionDrillProps) {
  const [userPrompt, setUserPrompt] = useState('');
  const [startTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const handleSubmit = () => {
    if (!userPrompt.trim()) return;

    const scoringResult = scorePromptConstruction(userPrompt, drill.successCriteria);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    const result: DrillResult = {
      drillId: drill.id,
      score: scoringResult.percentage,
      timeSpent,
      userInput: userPrompt,
      submittedAt: new Date().toISOString(),
      scoringResult,
    };

    onSubmit(result);
  };

  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="default">{drill.domain.replace('_', ' ')}</Badge>
            <Badge variant="default">{drill.difficulty}</Badge>
            <span className="text-sm text-[var(--color-text-secondary)]">
              {drill.points} points
            </span>
          </div>
          <h1 className="text-3xl font-bold">{drill.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-mono font-bold">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">
              {drill.timeLimit > 0 ? `${Math.floor(drill.timeLimit / 60)}m limit` : 'No limit'}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onExit}>
            Exit
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Context</h2>
            <p className="text-[var(--color-text-secondary)]">{drill.context}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Target Output</h2>
            <p className="text-[var(--color-text-secondary)]">{drill.targetOutput}</p>
          </div>

          <div className="p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
            <h3 className="text-sm font-semibold mb-2 text-[var(--color-warning)]">Broken Prompt</h3>
            <code className="text-sm text-[var(--color-text-secondary)]">{drill.brokenPrompt}</code>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Your Improved Prompt</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Write a prompt that addresses all the issues in the broken prompt above.
            </p>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Write your improved prompt here..."
              className="w-full h-64 p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono text-sm"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Success Criteria</h3>
            <div className="space-y-2">
              {drill.successCriteria.map((criterion) => (
                <div key={criterion.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">{criterion.label}</span>
                    <span className="text-[var(--color-text-secondary)]"> ({criterion.maxPoints} pts)</span>
                    <p className="text-[var(--color-text-secondary)] mt-1">{criterion.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="ghost" onClick={onExit}>
          Exit
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={!userPrompt.trim()}
        >
          Submit Solution
        </Button>
      </div>
    </div>
  );
}
