"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getOperatorProfile,
  setOperatorProfile,
  getItem,
  setItem,
  updateStreak,
  computeOperatorScore,
  getRankLabel,
  STORAGE_KEYS,
  type OperatorProfile,
  type DomainScore,
  type ArenaState,
  type LabSession,
  type LastDrillSession,
} from "@/core/storage";
import { DOMAINS, getDomainDrillCount } from "@/core/content/domains";
import { getDrillsByDomain, DRILLS } from "@/core/content/drills";
import type { DrillResult } from "@/core/types/drills";
import { ScoreCounter } from "@/components/ui/ScoreCounter";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function Dashboard() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [domainScores, setDomainScores] = useState<DomainScore[]>([]);
  const [arenaState, setArenaState] = useState<ArenaState | null>(null);
  const [lastSession, setLastSession] = useState<LastDrillSession | null>(null);
  const [scoreDelta, setScoreDelta] = useState(0);
  const [daysSinceActive, setDaysSinceActive] = useState(0);

  useEffect(() => {
    let p = getOperatorProfile();
    if (p) {
      p = updateStreak(p);

      const drillHistory = getItem<DrillResult[]>(STORAGE_KEYS.DRILL_HISTORY) || [];
      const as = getItem<ArenaState>(STORAGE_KEYS.ARENA_STATE);
      const ls = getItem<LabSession[]>(STORAGE_KEYS.LAB_SESSIONS) || [];
      const lastDrill = getItem<LastDrillSession>(STORAGE_KEYS.LAST_DRILL_SESSION);

      // Compute domain scores from drill history
      const ds: DomainScore[] = DOMAINS.map(domain => {
        const domainDrills = getDrillsByDomain(domain.id);
        const completedDrills = drillHistory.filter(h => 
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

      const newScore = computeOperatorScore(ds, as, ls);
      const newPercentile = Math.max(1, Math.round(100 - newScore));
      
      const oldScore = p.operatorScore;
      const delta = newScore - oldScore;

      p = {
        ...p,
        operatorScore: newScore,
        rankPercentile: newPercentile,
        rankLabel: getRankLabel(newPercentile),
        lastActive: new Date().toISOString(),
      };
      setOperatorProfile(p);

      const lastActive = getItem<string>(STORAGE_KEYS.LAST_ACTIVE);
      if (lastActive) {
        const diff = Math.floor((Date.now() - new Date(lastActive).getTime()) / 86400000);
        setDaysSinceActive(diff);
      }

      setItem(STORAGE_KEYS.LAST_ACTIVE, new Date().toISOString());

      setDomainScores(ds);
      setArenaState(as);
      setLastSession(lastDrill);
      setScoreDelta(delta);
    }
    setProfile(p);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-white/10" />
        <div className="h-4 w-64 rounded bg-white/10" />
        <div className="h-48 rounded-xl bg-white/10" />
      </div>
    );
  }

  if (!profile) {
    return <FirstRunDashboard onStart={() => router.push("/run?mode=diagnostic")} />;
  }

  return (
    <ReturningDashboard
      profile={profile}
      domainScores={domainScores}
      arenaState={arenaState}
      lastSession={lastSession}
      scoreDelta={scoreDelta}
      daysSinceActive={daysSinceActive}
    />
  );
}

function FirstRunDashboard({ onStart }: { onStart: () => void }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Orb 1 */}
      <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 800, height: 800, background: "radial-gradient(ellipse, rgba(79,110,247,0.12) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0, borderRadius: "50%" }} />
      {/* Orb 2 */}
      <div style={{ position: "absolute", top: "30%", left: -100, width: 400, height: 400, background: "radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0, borderRadius: "50%" }} />
      {/* Orb 3 */}
      <div style={{ position: "absolute", top: "40%", right: -100, width: 400, height: 400, background: "radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0, borderRadius: "50%" }} />

      {/* All content */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Eyebrow pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 24 }}>
          <div style={{ width: 6, height: 6, background: "#4f6ef7", borderRadius: "50%", animation: "pulse-dot 2s infinite" }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,238,240,0.7)", letterSpacing: "0.05em", fontFamily: "var(--font-body)" }}>
            Now in Early Access
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(3rem, 8vw, 5.5rem)",
          fontWeight: 700,
          lineHeight: 1.0,
          letterSpacing: "-0.04em",
          textAlign: "center",
          maxWidth: 800,
          margin: 0,
          background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.75) 50%, rgba(139,92,246,0.9) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          The training platform for operators who take AI seriously.
        </h1>

        {/* Subtitle */}
        <p style={{ fontFamily: "var(--font-body)", fontSize: "1.125rem", color: "rgba(238,238,240,0.45)", textAlign: "center", maxWidth: 520, lineHeight: 1.7, marginTop: 20, marginBottom: 40 }}>
          12 domains. 3 competency tiers. Performance-scored drills. No passive content — only active construction.
        </p>

        {/* CTA button */}
        <button onClick={onStart} className="hero-cta">
          Start Your Diagnostic →
        </button>

        {/* Below CTA hint */}
        <p style={{ fontSize: 12, color: "rgba(238,238,240,0.3)", letterSpacing: "0.05em", marginTop: 12, fontFamily: "var(--font-body)" }}>
          5 drills · No account required · ~8 minutes
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", flexDirection: "row", gap: 16, marginTop: 80, maxWidth: 680, width: "100%" }}>
          <StatCard number="12,847" label="drills completed this week" />
          <StatCard number="71/100" label="average operator score" />
          <StatCard number="2,341" label="operators training" />
        </div>

        {/* Feature cards */}
        <div style={{ display: "flex", flexDirection: "row", gap: 16, marginTop: 16, maxWidth: 680, width: "100%" }}>
          <FeatureCard
            title="Construction-based drills"
            body="Not multiple choice. You build, debug, analyze, and design real professional outputs."
            accentColor="rgba(79,110,247,0.6)"
          />
          <FeatureCard
            title="AI-evaluated scoring"
            body="Every submission scored by AI against a professional rubric. Not pattern matching."
            accentColor="rgba(139,92,246,0.6)"
          />
          <FeatureCard
            title="12 professional domains"
            body="From prompt engineering to multi-agent systems. The complete operator curriculum."
            accentColor="rgba(16,185,129,0.6)"
          />
        </div>

        {/* Bottom tagline */}
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "rgba(238,238,240,0.2)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 64 }}>
          This is not a course. There is no certificate for watching.
        </p>
      </div>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="stat-card-hero">
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "2rem",
        fontWeight: 700,
        letterSpacing: "-0.03em",
        background: "linear-gradient(135deg, #ffffff 0%, rgba(200,200,255,0.8) 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>
        {number}
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 400, color: "rgba(238,238,240,0.35)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 6 }}>
        {label}
      </div>
    </div>
  );
}

function FeatureCard({ title, body, accentColor }: { title: string; body: string; accentColor: string }) {
  return (
    <div className="feature-card-hero" style={{ borderTop: `2px solid ${accentColor}` }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.9375rem", fontWeight: 600, color: "#eeeef0", marginBottom: 6, marginTop: 0 }}>
        {title}
      </h3>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "rgba(238,238,240,0.4)", lineHeight: 1.6, margin: 0 }}>
        {body}
      </p>
    </div>
  );
}

interface ReturningDashboardProps {
  profile: OperatorProfile;
  domainScores: DomainScore[];
  arenaState: ArenaState | null;
  lastSession: LastDrillSession | null;
  scoreDelta: number;
  daysSinceActive: number;
}

function ReturningDashboard({
  profile,
  domainScores,
  arenaState,
  lastSession,
  scoreDelta,
  daysSinceActive,
}: ReturningDashboardProps) {
  const router = useRouter();

  const weakestDomain = domainScores.length > 0
    ? domainScores.reduce((min, ds) => (ds.score < min.score ? ds : min), domainScores[0])
    : null;
  const weakestDomainId = weakestDomain?.domainId || DOMAINS[0].id;

  const totalParticipants = 12847;

  const arena = arenaState ?? {
    seasonNumber: 1,
    seasonEndDate: "2025-03-31",
    totalParticipants,
    userRank: 0,
    sessionsCompleted: 0,
    bestScore: 0,
    lastSessionScore: null,
  };

  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(arena.seasonEndDate).getTime() - Date.now()) / 86400000)
  );

  const seasonProgress = ((Date.now() - new Date("2025-01-01").getTime()) / (new Date(arena.seasonEndDate).getTime() - new Date("2025-01-01").getTime())) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Inactivity Alert */}
      {daysSinceActive > 3 && (
        <Card className="animate-fade-up" style={{ borderLeft: "3px solid var(--warning-text)" }}>
          <div className="p-4 flex items-center justify-between">
            <p className="text-sm">
              You haven&apos;t trained in {daysSinceActive} days. Your relative rank has dropped.
            </p>
            <Button onClick={() => router.push(`/run?domain=${weakestDomainId}`)}>
              Resume Now →
            </Button>
          </div>
        </Card>
      )}

      {/* Operator Header Strip */}
      <div className="grid grid-cols-3 gap-px bg-[var(--border-subtle)] animate-fade-up">
        <div className="bg-[var(--bg-card)] p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="t-score score-glow">
              <ScoreCounter target={profile.operatorScore} />
            </div>
            {scoreDelta !== 0 && (
              <div className={`text-sm font-semibold ${scoreDelta > 0 ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}>
                {scoreDelta > 0 ? `↑${scoreDelta}` : `↓${Math.abs(scoreDelta)}`}
              </div>
            )}
          </div>
          <div className="t-label mt-2">OPERATOR SCORE</div>
        </div>

        <div className="bg-[var(--bg-card)] p-6 text-center">
          <div className="t-display-sm">Top {profile.rankPercentile}%</div>
          <Badge variant="default" className="mt-2 bg-[var(--accent)] text-white">
            {profile.rankLabel}
          </Badge>
          <div className="t-label mt-2">of {totalParticipants.toLocaleString()} operators</div>
        </div>

        <div className="bg-[var(--bg-card)] p-6 text-center">
          <div className="t-display-sm">{profile.streakDays}</div>
          <div className="t-label mt-2">DAY STREAK</div>
          {profile.streakDays > 0 ? (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-[var(--success-bg)]" />
              <span className="t-label text-[var(--success-text)]">Active</span>
            </div>
          ) : (
            <div className="t-label text-[var(--text-muted)] mt-2">No active streak</div>
          )}
        </div>
      </div>

      <div className="h-px bg-[var(--border-default)]" />

      {/* Continue Block */}
      {lastSession && (
        <Card className="card-highlight animate-fade-up" style={{ animationDelay: "50ms" }}>
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="t-label">CONTINUE</div>
              <h3 className="t-heading mt-1">{lastSession.domainName}</h3>
              <p className="t-body mt-1">{lastSession.topicName}</p>
              <p className="t-label text-[var(--text-muted)] mt-2">
                {new Date(lastSession.timestamp).toLocaleString()}
              </p>
            </div>
            <Button 
              variant="primary"
              onClick={() => router.push(`/run?domain=${lastSession.domainId}&index=${lastSession.drillIndex}`)}
            >
              Resume →
            </Button>
          </div>
        </Card>
      )}

      {/* Recommended Drill Card */}
      <Card 
        className="card-elevated animate-fade-up" 
        style={{ 
          animationDelay: "100ms",
          borderLeft: `3px solid ${DOMAINS.find(d => d.id === weakestDomainId)?.color || "var(--accent)"}`,
          boxShadow: "0 0 40px rgba(79,110,247,0.06) inset"
        }}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="t-label">RECOMMENDED</div>
            <Badge variant="default" className="bg-[var(--accent)] text-white">Priority</Badge>
          </div>
          <h3 className="t-heading">{DOMAINS.find(d => d.id === weakestDomainId)?.name}</h3>
          <Badge variant="default" className="mt-2">
            {DOMAINS.find(d => d.id === weakestDomainId)?.difficulty}
          </Badge>
          <p className="t-body mt-3">Your weakest domain. Close the gap.</p>
          <Button 
            variant="primary"
            onClick={() => router.push(`/run?domain=${weakestDomainId}`)}
            className="mt-4"
          >
            Start Drill →
          </Button>
        </div>
      </Card>

      {/* Domain Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {DOMAINS.map((domain, idx) => {
          const ds = domainScores.find(d => d.domainId === domain.id);
          const completed = ds?.drillsCompleted || 0;
          const total = domain.id ? getDomainDrillCount(domain.id) : 0;
          const progress = total > 0 ? (completed / total) * 100 : 0;
          const score = ds?.score || 0;

          return (
            <Card 
              key={domain.id} 
              className="card-hover animate-fade-up"
              style={{ 
                animationDelay: `${150 + idx * 60}ms`,
                borderLeft: `3px solid ${domain.color}`
              }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="t-heading text-sm">{domain.name}</h3>
                  <Badge variant="default" className="text-xs">{domain.difficulty}</Badge>
                </div>
                <div className="t-label text-[var(--text-muted)] mb-2">
                  {completed}/{total}
                </div>
                <ProgressBar 
                  value={progress} 
                  size="sm" 
                  animated={true}
                  color={score >= 80 ? "green" : score >= 60 ? "yellow" : "red"}
                />
                <div className="flex items-center justify-between mt-3">
                  {score > 0 ? (
                    <Badge 
                      variant="default"
                      className={
                        score >= 80 
                          ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                          : score >= 60
                          ? "bg-[var(--warning-bg)] text-[var(--warning-text)]"
                          : "bg-[var(--bg-elevated)]"
                      }
                    >
                      {score}
                    </Badge>
                  ) : (
                    <Badge variant="default">—</Badge>
                  )}
                  <button 
                    onClick={() => router.push(`/run?domain=${domain.id}`)}
                    className="t-label text-[var(--accent)] hover:underline"
                  >
                    Start →
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Arena Widget */}
      <Card className="card-elevated animate-fade-up" style={{ animationDelay: "500ms" }}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <div className="t-label">ARENA · SEASON 1</div>
            <div className="t-body mt-1">{daysRemaining} days remaining</div>
            <div className="mt-3 w-48">
              <div className="h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent)] transition-all"
                  style={{ width: `${seasonProgress}%` }}
                />
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="t-display-sm">
              {arena.userRank > 0 ? `Rank ${arena.userRank}` : "Unranked"}
            </div>
          </div>
          <Button variant="secondary" onClick={() => router.push("/arena")}>
            Compete →
          </Button>
        </div>
      </Card>
    </div>
  );
}
