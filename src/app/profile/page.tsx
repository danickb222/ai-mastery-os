"use client";

import { useEffect, useState } from "react";
import {
  getOperatorProfile,
  getItem,
  STORAGE_KEYS,
  type OperatorProfile,
  type DomainScore,
  type ArenaState,
} from "@/core/storage";
import { DOMAINS } from "@/core/content/domains";
import { getDrillsByDomain } from "@/core/content/drills";
import type { DrillResult } from "@/core/types/drills";
import { ScoreCounter } from "@/components/ui/ScoreCounter";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function ProfilePage() {
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [domainScores, setDomainScores] = useState<DomainScore[]>([]);
  const [arenaState, setArenaState] = useState<ArenaState | null>(null);
  const [drillHistory, setDrillHistory] = useState<DrillResult[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = getOperatorProfile();
    setProfile(p);
    
    const history = getItem<DrillResult[]>(STORAGE_KEYS.DRILL_HISTORY) || [];
    setDrillHistory(history);

    const ds: DomainScore[] = DOMAINS.map(domain => {
      const domainDrills = getDrillsByDomain(domain.id);
      const completedDrills = history.filter(h => 
        domainDrills.some(d => d.id === h.drillId)
      );
      const avgScore = completedDrills.length > 0
        ? Math.round(completedDrills.reduce((sum, h) => sum + h.score, 0) / completedDrills.length)
        : 0;
      
      return {
        domainId: domain.id,
        score: avgScore,
        drillsCompleted: completedDrills.length,
        drillsTotal: domainDrills.length,
        lastAttempted: completedDrills.length > 0 ? completedDrills[completedDrills.length - 1].submittedAt : ""
      };
    });
    setDomainScores(ds);

    const as = getItem<ArenaState>(STORAGE_KEYS.ARENA_STATE);
    setArenaState(as);

    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-white/10" />
        <div className="h-32 rounded-xl bg-white/10" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <h1 className="text-3xl font-bold text-white">Operator Profile</h1>
        <p className="text-gray-400">Complete the diagnostic to create your profile.</p>
        <a
          href="/run?mode=diagnostic"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
        >
          Start Your Diagnostic →
        </a>
      </div>
    );
  }

  const handleCopy = async () => {
    const text = `AI Mastery OS · Operator Score: ${profile.operatorScore}/100 · ${profile.rankLabel} · Top ${profile.rankPercentile}% globally · ${profile.streakDays} day streak`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Silent fail
      }
    }
  };

  const activeDomains = domainScores.filter(ds => ds.drillsCompleted > 0).length;
  const totalDrills = drillHistory.length;
  const bestArenaScore = arenaState?.bestScore || 0;

  const domainsWithScores = domainScores.filter(ds => ds.drillsCompleted > 0);
  const allDomainsComplete = DOMAINS.every(domain => {
    const ds = domainScores.find(d => d.domainId === domain.id);
    return ds && ds.drillsCompleted >= ds.drillsTotal;
  });
  const certificationEligible = allDomainsComplete && profile.operatorScore >= 75;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <div className="t-label">OPERATOR PROFILE</div>
      </div>

      {/* Score Hero */}
      <div className="text-center py-12">
        <div className="t-score score-glow">
          <ScoreCounter target={profile.operatorScore} />
        </div>
        <Badge variant="default" className="mt-4 bg-[var(--accent)] text-white">
          {profile.rankLabel}
        </Badge>
        <p className="t-body text-[var(--text-muted)] mt-3">
          Top {profile.rankPercentile}% globally
        </p>
      </div>

      {/* Three Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover">
          <div className="p-6 text-center">
            <div className="t-display-sm">{profile.streakDays}</div>
            <div className="t-label mt-2">Day Streak</div>
            {profile.streakDays > 0 && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-[var(--success-bg)]" />
                <span className="text-xs text-[var(--success-text)]">Active</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="card-hover">
          <div className="p-6 text-center">
            <div className="t-display-sm">{activeDomains}</div>
            <div className="t-label mt-2">Domains Trained</div>
          </div>
        </Card>

        <Card className="card-hover">
          <div className="p-6 text-center">
            <div className="t-display-sm">{totalDrills}</div>
            <div className="t-label mt-2">Drills Completed</div>
          </div>
        </Card>
      </div>

      {/* Domain Breakdown */}
      <div>
        <div className="t-label mb-4">DOMAIN PERFORMANCE</div>
        {domainsWithScores.length === 0 ? (
          <Card>
            <div className="p-10 text-center border border-dashed border-[var(--border-default)] rounded-lg">
              <p className="t-body">Complete drills to build your performance profile.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {domainsWithScores.map((ds, idx) => {
              const domain = DOMAINS.find(d => d.id === ds.domainId);
              if (!domain) return null;

              return (
                <Card 
                  key={ds.domainId} 
                  className="card-hover animate-fade-up"
                  style={{ 
                    animationDelay: `${idx * 50}ms`,
                    borderLeft: `3px solid ${domain.color}`
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="t-heading">{domain.name}</h3>
                      <div className="t-mono text-sm">{ds.score}/100</div>
                    </div>
                    <ProgressBar 
                      value={(ds.drillsCompleted / ds.drillsTotal) * 100} 
                      size="sm"
                      color={ds.score >= 80 ? "green" : ds.score >= 60 ? "yellow" : "red"}
                    />
                    <div className="t-label text-[var(--text-muted)] mt-2">
                      {ds.drillsCompleted}/{ds.drillsTotal} drills
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Operator Card (Shareable) */}
      <div>
        <div className="t-label mb-4">OPERATOR CREDENTIAL</div>
        <div className="max-w-[400px] mx-auto">
          <Card className="card-elevated">
            <div className="p-7 space-y-6">
              <div className="flex items-start justify-between">
                <div className="t-label">AI MASTERY OS</div>
              </div>

              <div className="text-center">
                <div className="t-score">{profile.operatorScore}</div>
                <Badge variant="default" className="mt-2 bg-[var(--accent)] text-white">
                  {profile.rankLabel}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="t-display-sm text-sm">{profile.streakDays}</div>
                  <div className="t-label text-xs">Streak</div>
                </div>
                <div>
                  <div className="t-display-sm text-sm">{activeDomains}</div>
                  <div className="t-label text-xs">Domains</div>
                </div>
                <div>
                  <div className="t-display-sm text-sm">{totalDrills}</div>
                  <div className="t-label text-xs">Drills</div>
                </div>
                <div>
                  <div className="t-display-sm text-sm">{bestArenaScore}</div>
                  <div className="t-label text-xs">Arena</div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-default)] text-right">
                <div className="t-label text-xs">Verified Operator</div>
              </div>
            </div>
          </Card>

          <Button 
            variant="secondary" 
            onClick={handleCopy}
            className="w-full mt-4"
          >
            {copied ? "✓ Copied" : "Copy to Clipboard"}
          </Button>
        </div>
      </div>

      {/* Certification Section */}
      <Card className="border-dashed">
        <div className="p-6">
          <div className="t-label mb-3">CERTIFICATION</div>
          <p className="t-body mb-4">
            Certification exams open quarterly to operators who complete all core domains and achieve an Operator Score above 75.
          </p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="t-label text-xs mb-2">
                {domainsWithScores.length}/{DOMAINS.length} domains complete
              </div>
              <ProgressBar 
                value={(domainsWithScores.length / DOMAINS.length) * 100}
                size="sm"
                color="blue"
              />
            </div>
          </div>
          <Button 
            variant="secondary" 
            disabled={!certificationEligible}
          >
            {certificationEligible ? "Apply for Certification" : "Not Yet Eligible"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
