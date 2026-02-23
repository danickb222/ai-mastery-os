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
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12 text-center px-4 stagger-children">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          Train to become a top 1% AI operator.
        </h1>
        <p className="text-lg text-gray-400">
          Drill-based. Performance-scored. Not a course.
        </p>
        <div className="pt-4">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-8 py-3.5 text-base font-semibold text-white transition-colors"
          >
            Start Your Diagnostic →
          </button>
        </div>
        <p className="text-sm text-gray-500">
          No account required. Takes 5 minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl stagger-children">
        <StatCard number="12,400" label="drills completed this week" />
        <StatCard number="68/100" label="average operator score" />
        <StatCard number="847" label="certified operators" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
        <FeatureCard
          title="Train"
          body="Structured domains. Timed drills. No passive content."
        />
        <FeatureCard
          title="Arena"
          body="Ranked challenges. Seasonal leaderboard. Your score on record."
        />
        <FeatureCard
          title="Lab"
          body="Prompt experimentation. AI-scored. Output history saved."
        />
      </div>

      <p className="text-sm text-gray-500 max-w-md">
        This is not a course. There is no certificate for watching.
      </p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
      <div className="text-3xl font-bold text-white">{number}</div>
      <div className="mt-1 text-sm text-gray-400">{label}</div>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-left">
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{body}</p>
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
