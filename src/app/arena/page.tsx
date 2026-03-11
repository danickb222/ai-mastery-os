"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArenaCountdown } from "@/components/ArenaCountdown";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreCounter } from "@/components/ui/ScoreCounter";
import {
  getItem,
  setItem,
  STORAGE_KEYS,
  type ArenaState,
} from "@/core/storage";

type ChallengeMode = "quick" | "standard" | "endurance";

const SEASON_START = new Date("2025-01-01");
const SEASON_END = new Date("2025-03-31");
const TOTAL_PARTICIPANTS = 12847;

function generateLeaderboard() {
  const firstParts = ['j.', 'k.', 'm.', 'a.', 'p.', 'd.', 's.', 'r.', 'l.', 'c.'];
  const lastParts = ['hartmann', 'okafor', 'mehta', 'chen', 'wilson', 'rodriguez', 'kim', 'patel', 'müller', 'santos'];
  const scores = [96, 94, 93, 91, 90, 88, 87, 85, 84, 82];
  const domains = ['Prompt Engineering', 'System Prompts', 'Reasoning Chains', 'Output Control', 'AI Workflows', 'Context Management', 'Role Prompting', 'Data Extraction'];
  const trends = ['↑', '↓', '↑', '↓', '↑', '↓', '↑', '↓', '↑', '↓'];

  return scores.map((score, idx) => ({
    rank: idx + 1,
    handle: `${firstParts[idx]}${lastParts[idx]}`,
    score,
    domain: domains[idx % domains.length],
    trend: trends[idx]
  }));
}

export default function ArenaPage() {
  const router = useRouter();

  // Beta gate: Arena is not yet available
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>
          Coming Soon
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 16 }}>
          Arena
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 32, fontFamily: 'var(--font-body)' }}>
          Timed challenges, global leaderboards, and ranked competition are coming in the next update. Build your skills in the Curriculum first.
        </p>
        <button
          onClick={() => router.push('/curriculum')}
          style={{
            padding: '13px 28px', background: '#fff', border: 'none', borderRadius: 12,
            color: '#000', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
        >
          Go to Curriculum
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );

  // eslint-disable-next-line no-unreachable
  const [mounted, setMounted] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ChallengeMode>("standard");
  const [isRanked, setIsRanked] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [arenaState, setArenaState] = useState<ArenaState>({
    seasonNumber: 1, seasonEndDate: "", totalParticipants: 0,
    userRank: 0, bestScore: 0, sessionsCompleted: 0,
    lastSessionScore: null,
  });

  useEffect(() => {
    const state = getItem<ArenaState>(STORAGE_KEYS.ARENA_STATE);
    if (!state) {
      const initialState: ArenaState = {
        seasonNumber: 1,
        seasonEndDate: SEASON_END.toISOString(),
        totalParticipants: TOTAL_PARTICIPANTS,
        userRank: 0,
        sessionsCompleted: 0,
        bestScore: 0,
        lastSessionScore: null
      };
      setItem(STORAGE_KEYS.ARENA_STATE, initialState);
      setArenaState(initialState);
    } else {
      setArenaState(state);
    }
    setMounted(true);
  }, []);

  const daysRemaining = Math.ceil((SEASON_END.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const seasonProgress = ((Date.now() - SEASON_START.getTime()) / (SEASON_END.getTime() - SEASON_START.getTime())) * 100;

  const leaderboard = generateLeaderboard();

  const handleEnterChallenge = () => {
    setShowCountdown(true);
  };

  const handleCountdownComplete = () => {
    const drillCount = selectedMode === "quick" ? 8 : selectedMode === "standard" ? 20 : 50;
    router.push(`/run?mode=arena&type=${selectedMode}&ranked=${isRanked}&count=${drillCount}`);
  };

  const modeConfig = {
    quick: { drills: 8, time: 10, desc: "High volume. Low time." },
    standard: { drills: 20, time: 25, desc: "Full session. Ranked." },
    endurance: { drills: 50, time: 60, desc: "Top operators only." }
  };

  if (!mounted) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {showCountdown && <ArenaCountdown onComplete={handleCountdownComplete} />}

      {/* Header */}
      <div className="animate-fade-up">
        <p className="t-tag" style={{ marginBottom: 20 }}>The Arena</p>
        <h1 className="t-hero" style={{ marginBottom: 8 }}>Compete.</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", letterSpacing: "0.02em" }}>Ranked. Timed. Unforgiving.</p>
      </div>

      {/* Season Header Card */}
      <div className="animate-fade-up" style={{ animationDelay: "50ms", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 32px", marginBottom: 32 }}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 400, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>SEASON 1</div>
              <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>{daysRemaining} days remaining</div>
            </div>
            <div className="text-right">
              <div style={{ fontFamily: "var(--font-code)", fontSize: 32, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{TOTAL_PARTICIPANTS.toLocaleString()}</div>
              <div style={{ fontFamily: "var(--font-code)", fontSize: 8, letterSpacing: "0.14em", color: "var(--text-dim)", textTransform: "uppercase" }}>operators competing</div>
            </div>
          </div>
          <div className="mt-4">
            <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  background: "rgba(255,255,255,0.5)",
                  width: `${seasonProgress}%`,
                  transition: "width 0.5s ease",
                  boxShadow: "0 0 6px rgba(255,255,255,0.25)",
                }}
              />
            </div>
          </div>
      </div>

      {/* User Rank Card */}
      <div
        className="animate-fade-up"
        style={{
          animationDelay: "100ms",
          background: "var(--bg3)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 24,
          marginBottom: 32
        }}
      >
          <div className="grid grid-cols-3 divide-x divide-[rgba(255,255,255,0.06)]">
            <div className="stat-block">
                {arenaState!.userRank > 0 ? (
                  <ScoreCounter target={arenaState!.userRank} className="stat-num" />
                ) : (
                  <span className="stat-num">—</span>
                )}
              <span className="stat-label">RANK</span>
            </div>
            <div className="stat-block">
              <span className="stat-num">{arenaState?.bestScore || 0}</span>
              <span className="stat-label">BEST SCORE</span>
            </div>
            <div className="stat-block">
              <span className="stat-num">{arenaState?.sessionsCompleted || 0}</span>
              <span className="stat-label">SESSIONS</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            {arenaState?.userRank && arenaState?.userRank > 0 ? (
              <span style={{ fontFamily: "var(--font-code)", fontSize: 9, letterSpacing: "0.12em", color: "var(--cyan)", textTransform: "uppercase", padding: "4px 10px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 6, display: "inline-block" }}>
                RANKED
              </span>
            ) : (
              <>
                <span style={{ fontFamily: "var(--font-code)", fontSize: 9, letterSpacing: "0.12em", color: "var(--amber)", textTransform: "uppercase", padding: "4px 10px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6, display: "inline-block" }}>
                  UNRANKED
                </span>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>Complete a session to enter the leaderboard.</p>
              </>
            )}
          </div>
      </div>

      {/* Leaderboard */}
      <div className="animate-fade-up" style={{ animationDelay: "150ms", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: 32 }}>
        <div style={{ padding: "24px 24px 0 24px" }}>
          <div className="flex items-center gap-3 mb-4">
            <span style={{ fontFamily: "var(--font-code)", fontSize: 9, letterSpacing: "0.2em", color: "var(--text-dim)", textTransform: "uppercase" }}>SEASON LEADERBOARD</span>
            <span className="badge badge-advanced">Top 10</span>
          </div>
        </div>

          <div>
            {leaderboard.map((entry, idx) => (
              <div
                key={entry.rank}
                className="lb-row"
              >
                <span className="lb-rank">{entry.rank}</span>
                <span className="lb-name">{entry.handle}</span>
                <span className="lb-score">{entry.score}</span>
                <span className="lb-domain">{entry.domain}</span>
                <span
                  className="text-sm"
                  style={{ color: entry.trend === "↑" ? "var(--cyan)" : "var(--text-dim)" }}
                >
                  {entry.trend}
                </span>
              </div>
            ))}

            {arenaState!.userRank > 10 && arenaState!.bestScore > 0 && (
              <>
                <div className="text-center py-2" style={{ color: "rgba(255,255,255,0.55)" }}>···</div>
                <div
                  className="lb-row"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderLeft: "2px solid var(--cyan)"
                  }}
                >
                  <span className="lb-rank">{arenaState?.userRank}</span>
                  <span className="lb-name">
                    <span className="badge badge-foundational" style={{ marginRight: 8 }}>YOU</span>
                    you
                  </span>
                  <span className="lb-score">{arenaState?.bestScore}</span>
                  <span className="lb-domain">—</span>
                  <span className="text-sm">—</span>
                </div>
              </>
            )}
          </div>
        </div>

      {/* Challenge Type Selector */}
      <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
        <p className="t-tag" style={{ marginBottom: 16 }}>Select Challenge Type</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["quick", "standard", "endurance"] as ChallengeMode[]).map(mode => (
            <div
              key={mode}
              className={`challenge-card${selectedMode === mode ? " selected" : ""}`}
              onClick={() => setSelectedMode(mode)}
            >
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400, color: "var(--text-primary)", marginBottom: 6, letterSpacing: "-0.01em", textTransform: "capitalize" }}>{mode} Fire</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>{modeConfig[mode].desc}</p>
              <p style={{ fontFamily: "var(--font-code)", fontSize: 9, letterSpacing: "0.12em", color: "var(--text-dim)", textTransform: "uppercase" }}>
                {modeConfig[mode].drills} drills · {modeConfig[mode].time} min
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Ranked/Practice Toggle */}
      <div className="animate-fade-up" style={{ animationDelay: "250ms" }}>
        <div className="flex items-center gap-4">
          <p className="t-tag" style={{ marginBottom: 0 }}>Mode</p>
          <div className="mode-toggle">
            <button
              onClick={() => setIsRanked(true)}
              className={`mode-btn${isRanked ? " active" : ""}`}
            >
              Ranked
            </button>
            <button
              onClick={() => setIsRanked(false)}
              className={`mode-btn${!isRanked ? " active" : ""}`}
            >
              Practice
            </button>
          </div>
        </div>

        {!isRanked && (
          <div className="mt-4" style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderLeft: "3px solid var(--amber)", borderRadius: 14, padding: 16 }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Practice mode active. Results are not ranked and do not affect your Operator Score.
            </p>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
        <button
          className="btn btn-primary"
          onClick={handleEnterChallenge}
          disabled={showCountdown}
          style={{ width: "100%", padding: "16px 24px", fontSize: 14, fontWeight: 700, borderRadius: 12, marginTop: 24 }}
        >
          Enter {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Challenge →
        </button>
      </div>
    </div>
  );
}
