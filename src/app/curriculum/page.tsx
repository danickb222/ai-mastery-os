"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DOMAINS, getDomainDrillCount } from "@/core/content/domains";
import { getDrillsByDomain } from "@/core/content/drills";
import type { DrillResult } from "@/core/types/drills";
import {
  getItem,
  STORAGE_KEYS,
} from "@/core/storage";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function CurriculumPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [drillHistory, setDrillHistory] = useState<DrillResult[]>([]);

  useEffect(() => {
    const history = getItem<DrillResult[]>(STORAGE_KEYS.DRILL_HISTORY) || [];
    setDrillHistory(history);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 rounded bg-white/10" />
        <div className="h-4 w-64 rounded bg-white/10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  const domainData = DOMAINS.map((domain) => {
    const drills = getDrillsByDomain(domain.id);
    const completedDrills = drillHistory.filter(h => {
      const drill = drills.find(d => d.id === h.drillId);
      return drill !== undefined;
    });
    
    const avgScore = completedDrills.length > 0
      ? Math.round(completedDrills.reduce((sum, h) => sum + h.score, 0) / completedDrills.length)
      : 0;

    return {
      ...domain,
      totalDrills: drills.length,
      completedDrills: completedDrills.length,
      avgScore,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Curriculum</h1>
        <p className="text-[var(--color-text-secondary)]">
          Master AI prompt engineering through construction-based drills across 8 domains.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domainData.map((domain) => (
          <Card key={domain.id} onClick={() => router.push(`/run?domain=${domain.id}`)}>
            <div className="p-6 space-y-4 cursor-pointer hover:bg-[var(--color-surface)] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{domain.name}</h3>
                  <Badge variant="default">{domain.difficulty}</Badge>
                </div>
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: `${domain.color}20`, color: domain.color }}
                >
                  {domain.completedDrills > 0 ? domain.avgScore : '—'}
                </div>
              </div>

              <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                {domain.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-secondary)]">
                    {domain.completedDrills} / {domain.totalDrills} drills
                  </span>
                  <span className="text-[var(--color-text-secondary)]">
                    ~{domain.estimatedMinutes}m
                  </span>
                </div>
                <ProgressBar
                  value={domain.totalDrills > 0 ? (domain.completedDrills / domain.totalDrills) * 100 : 0}
                  size="sm"
                  color={domain.avgScore >= 80 ? 'green' : domain.avgScore >= 65 ? 'yellow' : 'red'}
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {domain.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
                  >
                    {skill.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
        <h2 className="text-xl font-semibold mb-2">About the Curriculum</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          This curriculum replaces traditional MCQ drills with five construction-based drill types:
        </p>
        <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-primary)]">•</span>
            <span><strong>Prompt Construction:</strong> Build prompts from scratch to meet specific requirements</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-primary)]">•</span>
            <span><strong>Prompt Debug:</strong> Identify and fix flaws in broken prompts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-primary)]">•</span>
            <span><strong>Output Analysis:</strong> Detect errors and hallucinations in AI outputs</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-primary)]">•</span>
            <span><strong>Live Challenge:</strong> Design solutions for real-world scenarios</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-primary)]">•</span>
            <span><strong>Scenario Simulation:</strong> Build complete systems and workflows</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
