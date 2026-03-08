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
        <div style={{ height: 32, width: 192, borderRadius: 8, background: "rgba(255,255,255,0.1)" }} />
        <div style={{ height: 128, borderRadius: 16, background: "rgba(255,255,255,0.1)" }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 20, textAlign: "center" }}>
        <p className="t-tag" style={{ justifyContent: "center", marginBottom: 8 }}>Operator Profile</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 400, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 0.92 }}>Your profile awaits.</h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 360, lineHeight: 1.7 }}>Complete the diagnostic to generate your operator score.</p>
        <a
          href="/run?mode=diagnostic"
          className="btn btn-primary"
          style={{ marginTop: 16 }}
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
        <p className="t-tag">Operator Profile</p>
      </div>

      {/* Score Hero */}
      <div className="text-center py-12">
        <ScoreCounter target={profile.operatorScore} />
        <div style={{ marginTop: 16 }}>
          <span className="badge badge-expert">
            {profile.rankLabel}
          </span>
        </div>
        <p className="score-label" style={{ marginTop: 12 }}>
          Top {profile.rankPercentile}% globally
        </p>
      </div>

      {/* Three Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-block">
          <span className="stat-num">{profile.streakDays}</span>
          <span className="stat-label">Day Streak</span>
          {profile.streakDays > 0 && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div style={{ width: 8, height: 8, borderRadius: 4, background: "var(--cyan)" }} />
              <span style={{ fontSize: 10, color: "var(--cyan)" }}>Active</span>
            </div>
          )}
        </div>

        <div className="stat-block">
          <span className="stat-num">{activeDomains}</span>
          <span className="stat-label">Domains Trained</span>
        </div>

        <div className="stat-block">
          <span className="stat-num">{totalDrills}</span>
          <span className="stat-label">Drills Completed</span>
        </div>
      </div>

      {/* Domain Breakdown */}
      <div>
        <p className="t-tag" style={{ marginBottom: 16 }}>Domain Performance</p>
        {domainsWithScores.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", border: "1px dashed var(--border)", borderRadius: 14 }}>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Complete drills to build your performance profile.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {domainsWithScores.map((ds, idx) => {
              const domain = DOMAINS.find(d => d.id === ds.domainId);
              if (!domain) return null;

              return (
                <div
                  key={ds.domainId} 
                  className="animate-fade-up"
                  style={{ 
                    animationDelay: `${idx * 50}ms`,
                    background: "var(--bg3)",
                    border: "1px solid var(--border)",
                    borderLeft: `3px solid ${domain.color}`,
                    borderRadius: 14,
                    padding: 20,
                    transition: "all 240ms ease"
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 400, color: "var(--text-primary)" }}>{domain.name}</h3>
                    <div style={{ fontFamily: "var(--font-code)", fontSize: 12, color: "var(--text-muted)" }}>{ds.score}/100</div>
                  </div>
                  <ProgressBar 
                    value={(ds.drillsCompleted / ds.drillsTotal) * 100} 
                    size="sm"
                  />
                  <div style={{ fontFamily: "var(--font-code)", fontSize: 9, letterSpacing: "0.12em", color: "var(--text-dim)", textTransform: "uppercase", marginTop: 8 }}>
                    {ds.drillsCompleted}/{ds.drillsTotal} drills
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Operator Card (Shareable) */}
      <div>
        <p className="t-tag" style={{ marginBottom: 16 }}>Operator Credential</p>
        <div className="max-w-[400px] mx-auto">
          <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 20, padding: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="flex items-start justify-between">
                <span style={{ fontFamily: "var(--font-code)", fontSize: 8, letterSpacing: "0.2em", color: "var(--text-dim)", textTransform: "uppercase" }}>AI MASTERY OS</span>
              </div>

              <div className="text-center">
                <div className="score-big">{profile.operatorScore}</div>
                <span className="badge badge-expert" style={{ marginTop: 8, display: "inline-block" }}>
                  {profile.rankLabel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div style={{ fontFamily: "var(--font-code)", fontSize: 20, color: "var(--text-primary)" }}>{profile.streakDays}</div>
                  <div style={{ fontFamily: "var(--font-code)", fontSize: 8, letterSpacing: "0.12em", color: "var(--text-dim)", textTransform: "uppercase" }}>Streak</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-code)", fontSize: 20, color: "var(--text-primary)" }}>{activeDomains}</div>
                  <div style={{ fontFamily: "var(--font-code)", fontSize: 8, letterSpacing: "0.12em", color: "var(--text-dim)", textTransform: "uppercase" }}>Domains</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-code)", fontSize: 20, color: "var(--text-primary)" }}>{totalDrills}</div>
                  <div style={{ fontFamily: "var(--font-code)", fontSize: 8, letterSpacing: "0.12em", color: "var(--text-dim)", textTransform: "uppercase" }}>Drills</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-code)", fontSize: 20, color: "var(--text-primary)" }}>{bestArenaScore}</div>
                  <div style={{ fontFamily: "var(--font-code)", fontSize: 8, letterSpacing: "0.12em", color: "var(--text-dim)", textTransform: "uppercase" }}>Arena</div>
                </div>
              </div>

              <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)", textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-code)", fontSize: 8, letterSpacing: "0.12em", color: "var(--text-dim)", textTransform: "uppercase" }}>Verified Operator</div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            onClick={handleCopy}
            style={{ width: "100%", marginTop: 16 }}
          >
            {copied ? "✓ Copied" : "Copy to Clipboard"}
          </button>
        </div>
      </div>

      {/* Certification Section */}
      <div style={{ background: "var(--bg3)", border: "1px dashed var(--border)", borderRadius: 14, padding: 24 }}>
        <p className="t-tag" style={{ marginBottom: 12 }}>Certification</p>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.7 }}>
          Certification exams open quarterly to operators who complete all core domains and achieve an Operator Score above 75.
        </p>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div style={{ fontFamily: "var(--font-code)", fontSize: 9, letterSpacing: "0.12em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8 }}>
              {domainsWithScores.length}/{DOMAINS.length} domains complete
            </div>
            <ProgressBar 
              value={(domainsWithScores.length / DOMAINS.length) * 100}
              size="sm"
            />
          </div>
        </div>
        <button
          className="btn btn-secondary"
          disabled={!certificationEligible}
        >
          {certificationEligible ? "Apply for Certification" : "Not Yet Eligible"}
        </button>
      </div>
    </div>
  );
}
