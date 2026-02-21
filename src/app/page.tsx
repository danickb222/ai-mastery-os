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
  getScoreDelta,
  STORAGE_KEYS,
  type OperatorProfile,
  type DomainScore,
  type ArenaState,
  type LabSession,
  type LastDrillSession,
} from "@/core/storage";
import { topics, getTopicsByDomain } from "@/core/content/registry";
import { ALL_DOMAINS } from "@/core/types/topic";

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
      // Update streak
      p = updateStreak(p);

      // Load dependent data
      const ds = getItem<DomainScore[]>(STORAGE_KEYS.DOMAIN_SCORES) || [];
      const as = getItem<ArenaState>(STORAGE_KEYS.ARENA_STATE);
      const ls = getItem<LabSession[]>(STORAGE_KEYS.LAB_SESSIONS) || [];
      const lastDrill = getItem<LastDrillSession>(STORAGE_KEYS.LAST_DRILL_SESSION);

      // Recompute operator score
      const newScore = computeOperatorScore(ds, as, ls);
      const newPercentile = Math.max(1, Math.round(100 - newScore));
      p = {
        ...p,
        operatorScore: newScore,
        rankPercentile: newPercentile,
        rankLabel: getRankLabel(newPercentile),
        lastActive: new Date().toISOString(),
      };
      setOperatorProfile(p);

      // Compute days since last active
      const lastActive = getItem<string>(STORAGE_KEYS.LAST_ACTIVE);
      if (lastActive) {
        const diff = Math.floor((Date.now() - new Date(lastActive).getTime()) / 86400000);
        setDaysSinceActive(diff);
      }

      // Update last active
      setItem(STORAGE_KEYS.LAST_ACTIVE, new Date().toISOString());

      setDomainScores(ds);
      setArenaState(as);
      setLastSession(lastDrill);
      setScoreDelta(getScoreDelta());
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

  // --- Condition A: First-run (no profile) ---
  if (!profile) {
    return <FirstRunDashboard onStart={() => router.push("/run?mode=diagnostic")} />;
  }

  // --- Condition B: Returning user (profile exists) ---
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

// ============================================================
// First-Run Layout
// ============================================================

function FirstRunDashboard({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12 text-center px-4 stagger-children">
      {/* Hero */}
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl stagger-children">
        <StatCard number="12,400" label="drills completed this week" />
        <StatCard number="68/100" label="average operator score" />
        <StatCard number="847" label="certified operators" />
      </div>

      {/* Feature Cards */}
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

// ============================================================
// Returning User Dashboard
// ============================================================

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

  // Find weakest domain
  const weakestDomain = domainScores.length > 0
    ? domainScores.reduce((min, ds) => (ds.score < min.score ? ds : min), domainScores[0])
    : null;
  const weakestDomainId = weakestDomain?.domainId || ALL_DOMAINS[0];

  // Build domain grid data
  const allDomains = ALL_DOMAINS.map((domain, idx) => {
    const domainTopics = getTopicsByDomain(domain);
    const ds = domainScores.find((d) => d.domainId === domain);
    const totalDrills = domainTopics.reduce((sum, t) => sum + t.drills.length, 0);
    const third = Math.ceil(ALL_DOMAINS.length / 3);
    const difficulty = idx < third ? "Foundational" : idx < third * 2 ? "Advanced" : "Expert";
    return {
      domainId: domain,
      name: domain,
      difficulty,
      drillsCompleted: ds?.drillsCompleted ?? 0,
      drillsTotal: ds?.drillsTotal ?? totalDrills,
      score: ds?.score ?? 0,
    };
  });

  // Arena data
  const arena = arenaState ?? {
    seasonNumber: 1,
    seasonEndDate: "2025-03-31",
    totalParticipants: 3840,
    userRank: 999,
    sessionsCompleted: 0,
    bestScore: 0,
    lastSessionScore: null,
  };
  const daysUntilSeasonEnd = Math.max(
    0,
    Math.ceil((new Date(arena.seasonEndDate).getTime() - Date.now()) / 86400000)
  );

  // Relative time helper
  const relativeTime = (ts: string) => {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const lastActiveDate = profile.lastActive
    ? new Date(profile.lastActive).toLocaleDateString()
    : "—";

  return (
    <div className="space-y-6 stagger-children">
      {/* Re-engagement Alert */}
      {daysSinceActive > 3 && (
        <div className="rounded-xl border-l-4 border-amber-500 bg-amber-500/10 p-4 flex items-center justify-between">
          <p className="text-sm text-amber-200">
            You haven&apos;t trained in {daysSinceActive} days. Your relative rank has dropped. Resume now.
          </p>
          <button
            onClick={() => router.push(`/run?domain=${encodeURIComponent(weakestDomainId)}`)}
            className="ml-4 whitespace-nowrap rounded-lg bg-amber-600 hover:bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            Resume Drill →
          </button>
        </div>
      )}

      {/* Section 1: Operator Header Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-bold text-white">{profile.operatorScore}</span>
            {scoreDelta !== 0 && (
              <span className={`text-sm font-semibold ${scoreDelta > 0 ? "text-green-400" : "text-red-400"}`}>
                {scoreDelta > 0 ? `↑${scoreDelta}` : `↓${Math.abs(scoreDelta)}`}
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-gray-400">Operator Score</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
          <div className="text-4xl font-bold text-indigo-400">
            Top {profile.rankPercentile}%
          </div>
          <div className="mt-1 text-sm text-gray-400">Global Rank</div>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300">
            {profile.rankLabel}
          </span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
          <div className="text-4xl font-bold text-amber-400">{profile.streakDays}</div>
          <div className="mt-1 text-sm text-gray-400">Day Streak</div>
          <div className="text-xs text-gray-500 mt-1">Last active: {lastActiveDate}</div>
        </div>
      </div>

      {/* Section 2: Continue Where You Left Off */}
      {lastSession && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-1">Continue</div>
            <div className="text-sm font-medium text-white">{lastSession.domainName}</div>
            <div className="text-xs text-gray-400">{lastSession.topicName}</div>
            <div className="text-xs text-gray-500 mt-1">Last session: {relativeTime(lastSession.timestamp)}</div>
          </div>
          <button
            onClick={() =>
              router.push(
                `/run?domain=${encodeURIComponent(lastSession.domainId)}&topic=${encodeURIComponent(lastSession.topicId)}&index=${lastSession.drillIndex}`
              )
            }
            className="rounded-lg bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            Resume →
          </button>
        </div>
      )}

      {/* Section 3: Today's Recommended Drill */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 border-l-4 border-l-blue-500">
        <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-1">Recommended</div>
        <div className="text-sm font-medium text-white">{weakestDomainId}</div>
        <p className="text-xs text-gray-400 mt-1">Your weakest domain. Close the gap.</p>
        <button
          onClick={() => router.push(`/run?domain=${encodeURIComponent(weakestDomainId)}`)}
          className="mt-3 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors"
        >
          Start Drill →
        </button>
      </div>

      {/* Section 4: Domain Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allDomains.map((d) => {
          const progress = d.drillsTotal > 0 ? Math.round((d.drillsCompleted / d.drillsTotal) * 100) : 0;
          const isFinished = d.drillsCompleted > 0 && d.drillsCompleted >= d.drillsTotal;
          return (
            <button
              key={d.domainId}
              onClick={() => router.push("/curriculum")}
              className="rounded-xl border border-white/10 bg-white/5 p-5 text-left hover:border-white/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">{d.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wider ${
                    d.difficulty === "Foundational"
                      ? "bg-green-500/15 text-green-400"
                      : d.difficulty === "Advanced"
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {d.difficulty}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {d.drillsCompleted}/{d.drillsTotal} drills
                {isFinished && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 text-[10px] font-medium">
                    Finished
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 mb-1">
                <div
                  className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {d.score > 0 && (
                <div className="text-xs text-gray-500 mt-1">{d.score}/100</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Section 5: Arena Widget */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white">
              Arena — Season {arena.seasonNumber}
            </div>
            <div className="text-xs text-gray-400">
              Ends in {daysUntilSeasonEnd} days
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {arenaState ? (
              <>Rank: {arena.userRank} of {arena.totalParticipants} · Best Score: {arena.bestScore}/100</>
            ) : (
              <>Rank: Unranked</>
            )}
          </div>
          <button
            onClick={() => router.push("/arena")}
            className="rounded-lg bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors whitespace-nowrap"
          >
            {arenaState ? "Compete →" : "Enter Arena →"}
          </button>
        </div>
      </div>
    </div>
  );
}