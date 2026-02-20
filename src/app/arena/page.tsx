"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { arenaChallenges, type ArenaChallenge } from "@/core/content/arenaChallenges";
import { safeRead, safeWrite } from "@/core/storage/local";

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

type ArenaPhase = "select" | "active" | "result";

const STORAGE_KEY = "ai_mastery_arena_attempts";

// --- Scoring ---

function scoreResponse(response: string): { score: number; feedback: string[] } {
  const feedback: string[] = [];
  let score = 0;
  const text = response.trim();

  // Length
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

  // Structure markers
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

  // Constraints language
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

  // Verification language
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

const difficultyVariant: Record<string, "default" | "warning" | "info" | "success"> = {
  Easy: "success",
  Medium: "warning",
  Hard: "info",
};

// --- Component ---

export default function ArenaPage() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<ArenaPhase>("select");
  const [selectedId, setSelectedId] = useState(arenaChallenges[0].id);
  const [response, setResponse] = useState("");
  const [remaining, setRemaining] = useState(600);
  const [result, setResult] = useState<{ score: number; feedback: string[] } | null>(null);
  const [attempts, setAttempts] = useState<ArenaAttempt[]>([]);
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);

  const startTimeRef = useRef<string>("");
  const timerStartRef = useRef<number>(0);
  const timeLimitRef = useRef<number>(600);

  // Load attempts from localStorage on mount
  useEffect(() => {
    setMounted(true);
    setAttempts(safeRead<ArenaAttempt[]>(STORAGE_KEY, []));
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== "active") return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStartRef.current) / 1000);
      const left = Math.max(timeLimitRef.current - elapsed, 0);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
      }
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
    setResult({ score, feedback });
    setPhase("result");
  }, [response, selectedChallenge, attempts]);

  const handleReset = useCallback(() => {
    setPhase("select");
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Arena</h1>
        <p className="mt-1 text-gray-400">Timed operator challenges</p>
      </div>

      {/* SELECT PHASE */}
      {phase === "select" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Challenge</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {arenaChallenges.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                    selectedId === c.id
                      ? "border-indigo-500/50 bg-indigo-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{c.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={difficultyVariant[c.difficulty] ?? "default"}>
                        {c.difficulty}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTime(c.timeLimitSeconds)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={handleStart}>Start Challenge</Button>
            </div>
          </Card>

          {/* Recent Attempts */}
          {recentAttempts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Attempts</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {recentAttempts.map((a) => (
                  <div key={a.id}>
                    <button
                      onClick={() =>
                        setExpandedAttemptId(expandedAttemptId === a.id ? null : a.id)
                      }
                      className="w-full text-left rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">{a.challengeTitle}</span>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-mono ${
                              a.score >= 70
                                ? "text-emerald-400"
                                : a.score >= 40
                                ? "text-amber-400"
                                : "text-red-400"
                            }`}
                          >
                            {a.score}%
                          </span>
                          <span className="text-[10px] text-gray-600">
                            {mounted ? new Date(a.submittedAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                      </div>
                    </button>
                    {expandedAttemptId === a.id && (
                      <div className="mt-1 rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-2">
                        <div className="text-xs text-gray-500">
                          Duration: {formatTime(a.durationSeconds)}
                        </div>
                        <ul className="space-y-1">
                          {a.feedback.map((f, i) => (
                            <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                              <span className="text-indigo-400 mt-0.5 text-xs">-</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                        <div className="text-xs text-gray-600 mt-2">
                          {a.response.slice(0, 200)}
                          {a.response.length > 200 ? "…" : ""}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ACTIVE PHASE */}
      {phase === "active" && (
        <div className="space-y-4">
          {/* Timer bar */}
          <Card className={remaining <= 60 ? "border-red-500/30" : "border-indigo-500/30"}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={difficultyVariant[selectedChallenge.difficulty] ?? "default"}>
                  {selectedChallenge.difficulty}
                </Badge>
                <h2 className="text-lg font-semibold text-white">
                  {selectedChallenge.title}
                </h2>
              </div>
              <div
                className={`text-2xl font-mono font-bold ${
                  remaining <= 60 ? "text-red-400" : "text-indigo-400"
                }`}
              >
                {mounted ? formatTime(remaining) : formatTime(selectedChallenge.timeLimitSeconds)}
              </div>
            </div>
          </Card>

          {/* Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Challenge Prompt</CardTitle>
            </CardHeader>
            <div className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">
              {selectedChallenge.prompt}
            </div>
          </Card>

          {/* Response */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Response</CardTitle>
            </CardHeader>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Write your response here. Use headings, numbered steps, and be specific about constraints and validation..."
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:outline-none min-h-[300px] resize-y font-mono"
              disabled={remaining <= 0}
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {response.length} characters
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleReset}>
                  Abandon
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={response.trim().length === 0}
                >
                  Submit
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* RESULT PHASE */}
      {phase === "result" && result && (
        <div className="space-y-4">
          <Card
            className={
              result.score >= 70
                ? "border-emerald-500/30"
                : result.score >= 40
                ? "border-amber-500/30"
                : "border-red-500/30"
            }
          >
            <div className="text-center py-4">
              <div
                className={`text-6xl font-bold mb-2 ${
                  result.score >= 70
                    ? "text-emerald-400"
                    : result.score >= 40
                    ? "text-amber-400"
                    : "text-red-400"
                }`}
              >
                {result.score}%
              </div>
              <Badge
                variant={result.score >= 70 ? "success" : result.score >= 40 ? "warning" : "default"}
                className="text-base px-4 py-1"
              >
                {result.score >= 70
                  ? "STRONG"
                  : result.score >= 40
                  ? "DEVELOPING"
                  : "NEEDS WORK"}
              </Badge>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <ul className="space-y-2">
              {result.feedback.map((f, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5 text-xs">-</span>
                  {f}
                </li>
              ))}
            </ul>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleReset}>Back to Challenges</Button>
            <Button variant="secondary" onClick={handleStart}>
              Retry Same Challenge
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
