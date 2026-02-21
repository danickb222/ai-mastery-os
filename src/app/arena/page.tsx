"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { arenaChallenges, type ArenaChallenge } from "@/core/content/arenaChallenges";
import { safeRead, safeWrite } from "@/core/storage/local";
import {
  getItem,
  setItem,
  getOperatorProfile,
  setOperatorProfile,
  computeOperatorScore,
  getRankLabel,
  updateStreak,
  checkAchievements,
  STORAGE_KEYS,
  type ArenaState,
  type DomainScore,
  type LabSession,
  type Achievement,
} from "@/core/storage";
import { AchievementToast } from "@/components/AchievementToast";

// --- Types ---

interface ArenaAttempt {
  id: string;
  challengeId: string;
  challengeTitle: string;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  score: number;
  feedback: string[];
  response: string;
}

type ArenaPhase = "lobby" | "active" | "result";

const STORAGE_KEY = "ai_mastery_arena_attempts";

// --- Scoring ---

function scoreResponse(response: string): { score: number; feedback: string[] } {
  const feedback: string[] = [];
  let score = 0;
  const text = response.trim();

  if (text.length >= 800) {
    score += 25;
    feedback.push("Comprehensive response length — good depth.");
  } else if (text.length >= 400) {
    score += 18;
    feedback.push("Decent length, but could be more thorough.");
  } else if (text.length >= 200) {
    score += 10;
    feedback.push("Response is short — add more detail and examples.");
  } else {
    score += 2;
    feedback.push("Response is too brief to demonstrate competency.");
  }

  const hasHeadings = /^#{1,3}\s|^\d+[.)]\s|^[-*]\s/m.test(text);
  const hasNumberedSteps = /\d+[.)]\s/.test(text);
  if (hasHeadings && hasNumberedSteps) {
    score += 25;
    feedback.push("Well-structured with headings and numbered steps.");
  } else if (hasHeadings || hasNumberedSteps) {
    score += 15;
    feedback.push("Some structure present — consider adding both headings and numbered steps.");
  } else {
    score += 3;
    feedback.push("Lacks structural markers — use headings, bullets, or numbered steps.");
  }

  const constraintWords = ["must", "avoid", "criteria", "require", "constraint", "limit", "boundary", "rule"];
  const constraintHits = constraintWords.filter((w) => text.toLowerCase().includes(w)).length;
  if (constraintHits >= 3) {
    score += 25;
    feedback.push("Strong use of constraint and requirements language.");
  } else if (constraintHits >= 1) {
    score += 12;
    feedback.push("Some constraint language — be more explicit about requirements and boundaries.");
  } else {
    score += 2;
    feedback.push("Missing constraint language — specify what must and must not happen.");
  }

  const verifyWords = ["test", "check", "validate", "verify", "assert", "monitor", "measure", "evaluate", "metric"];
  const verifyHits = verifyWords.filter((w) => text.toLowerCase().includes(w)).length;
  if (verifyHits >= 3) {
    score += 25;
    feedback.push("Excellent verification and testing awareness.");
  } else if (verifyHits >= 1) {
    score += 12;
    feedback.push("Some verification language — add concrete test cases or validation steps.");
  } else {
    score += 2;
    feedback.push("No verification or testing mentioned — always include how to validate your design.");
  }

  return { score: Math.min(score, 100), feedback };
}

// --- Helpers ---

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// --- Component ---

export default function ArenaPage() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<ArenaPhase>("lobby");
  const [selectedId, setSelectedId] = useState(arenaChallenges[0].id);
  const [response, setResponse] = useState("");
  const [remaining, setRemaining] = useState(600);
  const [result, setResult] = useState<{ score: number; feedback: string[] } | null>(null);
  const [attempts, setAttempts] = useState<ArenaAttempt[]>([]);
  const [arenaState, setArenaState] = useState<ArenaState | null>(null);
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  const startTimeRef = useRef<string>("");
  const timerStartRef = useRef<number>(0);
  const timeLimitRef = useRef<number>(600);

  useEffect(() => {
    setMounted(true);
    setAttempts(safeRead<ArenaAttempt[]>(STORAGE_KEY, []));
    const as = getItem<ArenaState>(STORAGE_KEYS.ARENA_STATE);
    setArenaState(as);
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== "active") return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStartRef.current) / 1000);
      const left = Math.max(timeLimitRef.current - elapsed, 0);
      setRemaining(left);
      if (left <= 0) clearInterval(interval);
    }, 250);
    return () => clearInterval(interval);
  }, [phase]);

  const selectedChallenge: ArenaChallenge =
    arenaChallenges.find((c) => c.id === selectedId) ?? arenaChallenges[0];

  const handleStart = useCallback(() => {
    startTimeRef.current = new Date().toISOString();
    timerStartRef.current = Date.now();
    timeLimitRef.current = selectedChallenge.timeLimitSeconds;
    setRemaining(selectedChallenge.timeLimitSeconds);
    setResponse("");
    setResult(null);
    setPhase("active");
  }, [selectedChallenge]);

  const handleSubmit = useCallback(() => {
    const now = new Date().toISOString();
    const elapsed = Math.floor((Date.now() - timerStartRef.current) / 1000);
    const { score, feedback } = scoreResponse(response);

    const attempt: ArenaAttempt = {
      id: generateId(),
      challengeId: selectedChallenge.id,
      challengeTitle: selectedChallenge.title,
      startedAt: startTimeRef.current,
      submittedAt: now,
      durationSeconds: elapsed,
      score,
      feedback,
      response,
    };

    const updated = [attempt, ...attempts].slice(0, 50);
    setAttempts(updated);
    safeWrite(STORAGE_KEY, updated);

    // Update ArenaState in new storage
    const prevArena = getItem<ArenaState>(STORAGE_KEYS.ARENA_STATE);
    const newArena: ArenaState = {
      seasonNumber: prevArena?.seasonNumber ?? 1,
      seasonEndDate: prevArena?.seasonEndDate ?? "2025-09-30",
      totalParticipants: prevArena?.totalParticipants ?? 3840,
      userRank: prevArena?.userRank ?? 999,
      sessionsCompleted: (prevArena?.sessionsCompleted ?? 0) + 1,
      bestScore: Math.max(prevArena?.bestScore ?? 0, score),
      lastSessionScore: score,
    };
    // Simulate rank improvement based on best score
    if (newArena.bestScore >= 80) {
      newArena.userRank = Math.min(newArena.userRank, Math.round(newArena.totalParticipants * 0.05));
    } else if (newArena.bestScore >= 60) {
      newArena.userRank = Math.min(newArena.userRank, Math.round(newArena.totalParticipants * 0.25));
    } else if (newArena.bestScore >= 40) {
      newArena.userRank = Math.min(newArena.userRank, Math.round(newArena.totalParticipants * 0.5));
    }
    setItem(STORAGE_KEYS.ARENA_STATE, newArena);
    setArenaState(newArena);

    // Recompute operator score + streak
    let profile = getOperatorProfile();
    if (profile) {
      const ds = getItem<DomainScore[]>(STORAGE_KEYS.DOMAIN_SCORES) || [];
      const ls = getItem<LabSession[]>(STORAGE_KEYS.LAB_SESSIONS) || [];
      const newOpScore = computeOperatorScore(ds, newArena, ls);
      const newPercentile = Math.max(1, Math.round(100 - newOpScore));
      profile = updateStreak({
        ...profile,
        operatorScore: newOpScore,
        rankPercentile: newPercentile,
        rankLabel: getRankLabel(newPercentile),
        lastActive: new Date().toISOString(),
      });
      setOperatorProfile(profile);
    }

    // Check achievements
    const unlocked = checkAchievements();
    if (unlocked.length > 0) setNewAchievements(unlocked);

    setResult({ score, feedback });
    setPhase("result");
  }, [response, selectedChallenge, attempts]);

  const handleReset = useCallback(() => {
    setPhase("lobby");
    setResponse("");
    setResult(null);
  }, []);

  // Auto-submit when timer expires
  const timerExpired = phase === "active" && remaining <= 0;
  useEffect(() => {
    if (timerExpired && response.trim().length > 0) {
      handleSubmit();
    }
  }, [timerExpired, response, handleSubmit]);

  const recentAttempts = mounted ? attempts.slice(0, 5) : [];
  const bestScore = arenaState?.bestScore ?? 0;
  const sessionsCompleted = arenaState?.sessionsCompleted ?? 0;
  const seasonNumber = arenaState?.seasonNumber ?? 1;
  const userRank = arenaState?.userRank ?? null;
  const totalParticipants = arenaState?.totalParticipants ?? 3840;

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 rounded bg-white/10" />
        <div className="h-32 rounded-xl bg-white/10" />
        <div className="h-48 rounded-xl bg-white/10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Arena</h1>
        <p className="mt-1 text-gray-400">
          Timed challenges. Ranked against all operators. Score goes on record.
        </p>
      </div>

      {/* Season + Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <div className="text-2xl font-bold text-white">{bestScore}</div>
          <div className="text-xs text-gray-400 mt-1">Best Score</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400">
            {userRank ? `#${userRank}` : "—"}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            of {totalParticipants.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{sessionsCompleted}</div>
          <div className="text-xs text-gray-400 mt-1">Sessions</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <div className="text-2xl font-bold text-gray-400">S{seasonNumber}</div>
          <div className="text-xs text-gray-400 mt-1">Current Season</div>
        </div>
      </div>

      {/* LOBBY PHASE */}
      {phase === "lobby" && (
        <div className="space-y-6">
          {/* Challenge Selection */}
          <div>
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-3">
              Select Challenge
            </div>
            <div className="space-y-2">
              {arenaChallenges.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                    selectedId === c.id
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{c.title}</span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wider ${
                          c.difficulty === "Easy"
                            ? "bg-green-500/15 text-green-400"
                            : c.difficulty === "Medium"
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {c.difficulty}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {formatTime(c.timeLimitSeconds)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <button
                onClick={handleStart}
                className="rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                Start Challenge →
              </button>
            </div>
          </div>

          {/* Recent Attempts */}
          {recentAttempts.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
                Recent Sessions
              </div>
              <div className="space-y-2">
                {recentAttempts.map((a) => (
                  <div key={a.id}>
                    <button
                      onClick={() =>
                        setExpandedAttemptId(expandedAttemptId === a.id ? null : a.id)
                      }
                      className="w-full text-left rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">{a.challengeTitle}</span>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-mono ${
                              a.score >= 70
                                ? "text-green-400"
                                : a.score >= 40
                                ? "text-amber-400"
                                : "text-red-400"
                            }`}
                          >
                            {a.score}/100
                          </span>
                          <span className="text-[10px] text-gray-600">
                            {new Date(a.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </button>
                    {expandedAttemptId === a.id && (
                      <div className="mt-1 rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2">
                        <div className="text-xs text-gray-500">
                          Duration: {formatTime(a.durationSeconds)}
                        </div>
                        <ul className="space-y-1">
                          {a.feedback.map((f, i) => (
                            <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                              <span className="text-blue-400 mt-0.5 text-xs">-</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE PHASE */}
      {phase === "active" && (
        <div className="space-y-4">
          {/* Timer bar */}
          <div
            className={`rounded-xl border p-4 flex items-center justify-between ${
              remaining <= 60 ? "border-red-500/30 bg-red-500/5" : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wider ${
                  selectedChallenge.difficulty === "Easy"
                    ? "bg-green-500/15 text-green-400"
                    : selectedChallenge.difficulty === "Medium"
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {selectedChallenge.difficulty}
              </span>
              <h2 className="text-sm font-semibold text-white">
                {selectedChallenge.title}
              </h2>
            </div>
            <div
              className={`text-2xl font-mono font-bold ${
                remaining <= 60 ? "text-red-400" : "text-white"
              }`}
            >
              {formatTime(remaining)}
            </div>
          </div>

          {/* Prompt */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Challenge Prompt
            </div>
            <div className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">
              {selectedChallenge.prompt}
            </div>
          </div>

          {/* Response */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Write your response. Use structure, constraints, and validation..."
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none min-h-[280px] resize-y font-mono"
              disabled={remaining <= 0}
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {response.length} chars
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Abandon
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={response.trim().length === 0}
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2 text-sm font-semibold text-white transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Toast */}
      {newAchievements.length > 0 && (
        <AchievementToast achievements={newAchievements} onDone={() => setNewAchievements([])} />
      )}

      {/* RESULT PHASE */}
      {phase === "result" && result && (
        <div className="space-y-4">
          <div
            className={`rounded-xl border p-6 text-center ${
              result.score >= 70
                ? "border-green-500/30 bg-green-500/5"
                : result.score >= 40
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-red-500/30 bg-red-500/5"
            }`}
          >
            <div
              className={`text-6xl font-bold mb-2 ${
                result.score >= 70
                  ? "text-green-400"
                  : result.score >= 40
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {result.score}/100
            </div>
            <div
              className={`text-sm font-semibold ${
                result.score >= 70
                  ? "text-green-400"
                  : result.score >= 40
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {result.score >= 70
                ? "STRONG"
                : result.score >= 40
                ? "DEVELOPING"
                : "NEEDS WORK"}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This score affects your Operator Score and Arena rank.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Feedback
            </div>
            <ul className="space-y-2">
              {result.feedback.map((f, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5 text-xs">-</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              Back to Challenges
            </button>
            <button
              onClick={handleStart}
              className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors"
            >
              Retry Same Challenge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
