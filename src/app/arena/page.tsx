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
  const [mounted, setMounted] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ChallengeMode>("standard");
  const [isRanked, setIsRanked] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [arenaState, setArenaState] = useState<ArenaState | null>(null);

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
        <div className="t-label">THE ARENA</div>
        <h1 className="t-display-sm">Compete.</h1>
        <p className="t-body">Ranked. Timed. Unforgiving.</p>
      </div>

      {/* Season Header Card */}
      <Card className="card-elevated animate-fade-up" style={{ animationDelay: "50ms" }}>
        <div
          className="p-6"
          style={{
            background: "rgba(255,255,255,0.015)"
          }}
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="t-display-sm">SEASON 1</div>
              <div className="t-body">{daysRemaining} days remaining</div>
            </div>
            <div className="text-right">
              <div className="t-display-sm">{TOTAL_PARTICIPANTS.toLocaleString()}</div>
              <div className="t-label">operators competing</div>
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
      </Card>

      {/* User Rank Card */}
      <Card
        className="animate-fade-up"
        style={{
          animationDelay: "100ms",
          borderLeft: "3px solid rgba(255,255,255,0.18)"
        }}
      >
        <div className="p-6">
          <div className="grid grid-cols-3 divide-x divide-[rgba(255,255,255,0.06)]">
            <div className="text-center">
              <div className="t-score">
                {arenaState && arenaState.userRank > 0 ? (
                  <ScoreCounter target={arenaState.userRank} />
                ) : (
                  "—"
                )}
              </div>
              <div className="t-label">RANK</div>
            </div>
            <div className="text-center">
              <div className="t-display-sm">{arenaState?.bestScore || 0}/100</div>
              <div className="t-label">BEST SCORE</div>
            </div>
            <div className="text-center">
              <div className="t-display-sm">{arenaState?.sessionsCompleted || 0}</div>
              <div className="t-label">SESSIONS</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            {arenaState && arenaState.userRank > 0 ? (
              <Badge variant="default" className="badge-white">
                RANKED
              </Badge>
            ) : (
              <>
                <Badge variant="default" className="badge-warning">
                  UNRANKED
                </Badge>
                <p className="t-body mt-2">Complete a session to enter the leaderboard.</p>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Leaderboard */}
      <Card className="card-elevated animate-fade-up" style={{ animationDelay: "150ms" }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="t-label">SEASON LEADERBOARD</div>
            <Badge variant="default">Top 10</Badge>
          </div>

          <div className="space-y-1">
            {leaderboard.map((entry, idx) => (
              <div
                key={entry.rank}
                className="flex items-center gap-4 h-[44px] px-4 rounded transition-colors"
                style={{
                  background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.035)"
                }}
              >
                <div className="t-mono text-sm w-8" style={{ color: "#ffffff" }}>{entry.rank}</div>
                <div className="t-mono text-sm flex-1" style={{ color: "rgba(255,255,255,0.55)" }}>{entry.handle}</div>
                <div
                  className="t-mono text-sm"
                  style={{ color: entry.score >= 90 ? "rgba(80,220,120,0.8)" : "rgba(255,255,255,0.8)" }}
                >
                  {entry.score}
                </div>
                <Badge variant="default">{entry.domain}</Badge>
                <div
                  className="text-sm"
                  style={{ color: entry.trend === "↑" ? "rgba(80,220,120,0.8)" : "rgba(255,80,80,0.75)" }}
                >
                  {entry.trend}
                </div>
              </div>
            ))}

            {arenaState && arenaState.userRank > 10 && arenaState.bestScore > 0 && (
              <>
                <div className="text-center py-2" style={{ color: "rgba(255,255,255,0.55)" }}>···</div>
                <div
                  className="flex items-center gap-4 h-[44px] px-4 rounded"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderLeft: "2px solid rgba(255,255,255,0.18)"
                  }}
                >
                  <div className="t-mono text-sm w-8" style={{ color: "#ffffff" }}>{arenaState.userRank}</div>
                  <div className="t-mono text-sm flex-1">
                    <Badge variant="default" className="badge-white mr-2">YOU</Badge>
                    you
                  </div>
                  <div className="t-mono text-sm" style={{ color: "#ffffff" }}>{arenaState.bestScore}</div>
                  <Badge variant="default">—</Badge>
                  <div className="text-sm">—</div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Challenge Type Selector */}
      <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
        <div className="t-label mb-4">SELECT CHALLENGE TYPE</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["quick", "standard", "endurance"] as ChallengeMode[]).map(mode => (
            <Card
              key={mode}
              className={`cursor-pointer transition-all ${
                selectedMode === mode ? "card-highlight" : "card-hover"
              }`}
              onClick={() => setSelectedMode(mode)}
            >
              <div className="p-6">
                <h3 className="t-heading capitalize">{mode} Fire</h3>
                <p className="t-body mt-2">{modeConfig[mode].desc}</p>
                <p className="t-label mt-3">
                  {modeConfig[mode].drills} drills · {modeConfig[mode].time} min
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Ranked/Practice Toggle */}
      <div className="animate-fade-up" style={{ animationDelay: "250ms" }}>
        <div className="flex items-center gap-4">
          <div className="t-label">MODE</div>
          <div
            className="inline-flex p-[3px] rounded-[20px]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <button
              onClick={() => setIsRanked(true)}
              className={`px-4 py-1.5 rounded-[17px] text-sm transition-all`}
              style={{
                background: isRanked ? "#ffffff" : "transparent",
                color: isRanked ? "#080808" : "rgba(255,255,255,0.28)",
                fontWeight: isRanked ? 600 : 400,
              }}
            >
              Ranked
            </button>
            <button
              onClick={() => setIsRanked(false)}
              className={`px-4 py-1.5 rounded-[17px] text-sm transition-all`}
              style={{
                background: !isRanked ? "#ffffff" : "transparent",
                color: !isRanked ? "#080808" : "rgba(255,255,255,0.28)",
                fontWeight: !isRanked ? 600 : 400,
              }}
            >
              Practice
            </button>
          </div>
        </div>

        {!isRanked && (
          <Card className="mt-4" style={{ borderLeft: "3px solid rgba(250,190,80,0.8)" }}>
            <div className="p-4">
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                Practice mode active. Results are not ranked and do not affect your Operator Score.
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* CTA Button */}
      <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
        <Button
          variant="primary"
          onClick={handleEnterChallenge}
          className="w-full btn-lg"
          disabled={showCountdown}
        >
          Enter {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Challenge →
        </Button>
      </div>
    </div>
  );
}
