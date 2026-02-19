"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Toast } from "@/components/ui/Toast";
import { topics, getTopicById, getNextTopic } from "@/core/content/registry";
import {
  getMasteryState,
  startTopic,
  saveDrillAttempt,
  saveChallengeAttempt,
} from "@/core/storage/mastery";
import { evaluateDrill, evaluateTopicChallenge } from "@/core/evaluation/engine";
import type {
  Topic,
  MasteryState,
  DrillAttempt,
  EvaluationResult,
  Artifact,
} from "@/core/types/topic";

type RunPhase = "learn" | "examples" | "drills" | "challenge" | "review";
const STEPS: RunPhase[] = ["learn", "examples", "drills", "challenge", "review"];
const STEP_LABELS: Record<RunPhase, string> = {
  learn: "Learn",
  examples: "Example",
  drills: "Drills",
  challenge: "Challenge",
  review: "Review",
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export default function RunPage() {
  const [state, setState] = useState<MasteryState | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [phase, setPhase] = useState<RunPhase>("learn");
  const [lessonIdx, setLessonIdx] = useState(0);
  const [exampleIdx, setExampleIdx] = useState(0);

  // Drill state
  const [currentDrillIdx, setCurrentDrillIdx] = useState(0);
  const [drillResponse, setDrillResponse] = useState("");
  const [drillFeedback, setDrillFeedback] = useState<{
    score: number;
    feedback: string;
  } | null>(null);
  const [drillScores, setDrillScores] = useState<number[]>([]);

  // Challenge state
  const [challengeResponse, setChallengeResponse] = useState("");
  const [challengeResult, setChallengeResult] = useState<EvaluationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const s = getMasteryState();
    setState(s);
    const currentId = s.currentTopicId;
    if (currentId) {
      const t = getTopicById(currentId);
      if (t) {
        setTopic(t);
        if (s.topicProgress[currentId]?.status === "available") {
          const updated = startTopic(currentId);
          setState(updated);
        }
      }
    }
  }, []);

  const selectTopic = useCallback((id: string) => {
    const t = getTopicById(id);
    if (!t) return;
    const s = getMasteryState();
    const tp = s.topicProgress[id];
    if (tp?.status === "locked") return;
    setTopic(t);
    setPhase("learn");
    setLessonIdx(0);
    setExampleIdx(0);
    setCurrentDrillIdx(0);
    setDrillResponse("");
    setDrillFeedback(null);
    setDrillScores([]);
    setChallengeResponse("");
    setChallengeResult(null);
    setShowHint(false);
    if (tp?.status === "available") {
      const updated = startTopic(id);
      setState(updated);
    } else {
      setState(s);
    }
  }, []);

  // --- Handlers ---

  const handleNextLesson = () => {
    if (!topic) return;
    if (lessonIdx < topic.lesson.length - 1) {
      setLessonIdx(lessonIdx + 1);
    } else {
      setPhase("examples");
      setExampleIdx(0);
    }
  };

  const handleNextExample = () => {
    if (!topic) return;
    if (exampleIdx < topic.examples.length - 1) {
      setExampleIdx(exampleIdx + 1);
    } else {
      setPhase("drills");
      setCurrentDrillIdx(0);
      setDrillResponse("");
      setDrillFeedback(null);
    }
  };

  const handleSubmitDrill = () => {
    if (!topic || !drillResponse.trim()) return;
    const drill = topic.drills[currentDrillIdx];
    const result = evaluateDrill(drill, drillResponse);
    setDrillFeedback(result);
    const attempt: DrillAttempt = {
      drillId: drill.id,
      response: drillResponse,
      score: result.score,
      feedback: result.feedback,
      timestamp: new Date().toISOString(),
    };
    const updated = saveDrillAttempt(topic.id, attempt);
    setState(updated);
    setDrillScores([...drillScores, result.score]);
  };

  const handleNextDrill = () => {
    if (!topic) return;
    if (currentDrillIdx < topic.drills.length - 1) {
      setCurrentDrillIdx(currentDrillIdx + 1);
      setDrillResponse("");
      setDrillFeedback(null);
      setShowHint(false);
    } else {
      setPhase("challenge");
      setChallengeResponse("");
      setChallengeResult(null);
      setShowHint(false);
    }
  };

  // Challenge is locked until all drills are attempted
  const allDrillsAttempted = topic ? drillScores.length >= topic.drills.length : false;

  const handleSubmitChallenge = () => {
    if (!topic || !challengeResponse.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      const result = evaluateTopicChallenge(topic, challengeResponse);
      setChallengeResult(result);

      const artifact: Artifact | null = result.passed
        ? {
            id: generateId(),
            topicId: topic.id,
            domain: topic.domain,
            type: topic.artifactType,
            title: `${topic.title} — Certification`,
            content: challengeResponse,
            score: result.score,
            timestamp: new Date().toISOString(),
          }
        : null;

      const attempt = {
        challengeId: topic.challenge.id,
        response: challengeResponse,
        score: result.score,
        passed: result.passed,
        breakdown: result.breakdown,
        weaknesses: result.weaknesses,
        suggestedImprovements: result.suggestedImprovements,
        timestamp: new Date().toISOString(),
      };

      const updated = saveChallengeAttempt(topic.id, attempt, artifact);
      setState(updated);
      setPhase("review");
      setSubmitting(false);
      if (result.passed) {
        setToast(`Certification passed! +${topic.xpValue} XP`);
      }
    }, 800);
  };

  const handleContinueToNext = () => {
    if (!topic) return;
    const next = getNextTopic(topic.id);
    if (next) selectTopic(next.id);
  };

  // --- Loading / No topic ---

  if (!state) {
    return <div className="flex h-64 items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!topic) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">Run</h1>
        <p className="text-gray-400">Select a topic to begin training.</p>
        <div className="space-y-2">
          {topics.map((t) => {
            const tp = state.topicProgress[t.id];
            const status = tp?.status || "locked";
            return (
              <Card
                key={t.id}
                onClick={status !== "locked" ? () => selectTopic(t.id) : undefined}
                className={`cursor-pointer ${status === "locked" ? "opacity-30 cursor-not-allowed" : "hover:border-indigo-500/30"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{t.title}</span>
                      <Badge variant={status === "passed" ? "success" : status === "in_progress" ? "info" : status === "available" ? "warning" : "default"}>
                        {status}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">W{t.weekNumber} · {t.domain} · {t.xpValue} XP</span>
                  </div>
                  {tp?.bestScore > 0 && <span className="text-sm font-mono text-gray-400">{tp.bestScore}%</span>}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Stepper + Phase rendering ---
  const tp = state.topicProgress[topic.id];
  const stepIdx = STEPS.indexOf(phase);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="info">W{topic.weekNumber} · {topic.domain}</Badge>
            {tp?.status === "passed" && <Badge variant="success">Certified</Badge>}
          </div>
          <h1 className="text-2xl font-bold text-white">{topic.title}</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { setTopic(null); setPhase("learn"); }}>
          ← Topics
        </Button>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1.5 w-full rounded-full ${i < stepIdx ? "bg-indigo-500/60" : i === stepIdx ? "bg-indigo-500" : "bg-white/10"}`} />
            <span className={`text-[10px] ${i === stepIdx ? "text-indigo-400 font-semibold" : "text-gray-600"}`}>
              {STEP_LABELS[s]}
            </span>
          </div>
        ))}
      </div>

      {/* LEARN PHASE */}
      {phase === "learn" && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">Block {lessonIdx + 1} / {topic.lesson.length}</span>
              <Badge>{topic.lesson[lessonIdx].type}</Badge>
            </div>
            <div className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed">
              {topic.lesson[lessonIdx].content}
            </div>
          </Card>
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => lessonIdx > 0 && setLessonIdx(lessonIdx - 1)} disabled={lessonIdx === 0}>← Prev</Button>
            <span className="text-xs text-gray-500">{lessonIdx + 1} / {topic.lesson.length}</span>
            <Button onClick={handleNextLesson}>{lessonIdx < topic.lesson.length - 1 ? "Next →" : "Examples →"}</Button>
          </div>
        </div>
      )}

      {/* EXAMPLES PHASE */}
      {phase === "examples" && (
        <div className="space-y-4">
          {topic.examples.length === 0 ? (
            <Card>
              <p className="text-sm text-gray-400">No worked examples for this topic. Proceed to drills.</p>
              <div className="mt-3"><Button onClick={() => { setPhase("drills"); setCurrentDrillIdx(0); setDrillResponse(""); setDrillFeedback(null); }}>Start Drills →</Button></div>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{topic.examples[exampleIdx].title}</CardTitle>
                    <span className="text-xs text-gray-500">{exampleIdx + 1} / {topic.examples.length}</span>
                  </div>
                </CardHeader>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1">Input:</label>
                    <div className="rounded-lg bg-white/5 p-3 text-sm text-gray-300 font-mono whitespace-pre-wrap">{topic.examples[exampleIdx].input}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1">Output:</label>
                    <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3 text-sm text-gray-300 font-mono whitespace-pre-wrap">{topic.examples[exampleIdx].output}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1">Explanation:</label>
                    <p className="text-sm text-gray-400">{topic.examples[exampleIdx].explanation}</p>
                  </div>
                </div>
              </Card>
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => exampleIdx > 0 && setExampleIdx(exampleIdx - 1)} disabled={exampleIdx === 0}>← Prev</Button>
                <Button onClick={handleNextExample}>{exampleIdx < topic.examples.length - 1 ? "Next Example →" : "Start Drills →"}</Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* DRILLS PHASE */}
      {phase === "drills" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {topic.drills.map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full ${i < currentDrillIdx ? "bg-emerald-500" : i === currentDrillIdx ? "bg-indigo-500" : "bg-white/10"}`} />
            ))}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Drill {currentDrillIdx + 1}: {topic.drills[currentDrillIdx].type.replace(/_/g, " ")}</CardTitle>
                <Badge variant="warning">{topic.drills[currentDrillIdx].type}</Badge>
              </div>
            </CardHeader>
            <div className="whitespace-pre-wrap text-sm text-gray-300 mb-4 leading-relaxed">{topic.drills[currentDrillIdx].prompt}</div>

            {topic.drills[currentDrillIdx].hint && (
              <div className="mb-3">
                {showHint ? (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-300">{topic.drills[currentDrillIdx].hint}</div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setShowHint(true)}>Show Hint</Button>
                )}
              </div>
            )}

            <div className="space-y-2 mb-3">
              <label className="text-xs text-gray-500 font-medium">Required elements:</label>
              <div className="flex flex-wrap gap-1">
                {topic.drills[currentDrillIdx].requiredElements.map((el) => (
                  <Badge key={el} variant="default">{el}</Badge>
                ))}
              </div>
            </div>

            <textarea
              value={drillResponse}
              onChange={(e) => setDrillResponse(e.target.value)}
              placeholder="Write your response here..."
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:outline-none min-h-[200px] resize-y font-mono"
              disabled={!!drillFeedback}
            />

            {!drillFeedback ? (
              <div className="mt-3"><Button onClick={handleSubmitDrill} disabled={!drillResponse.trim()}>Submit Drill</Button></div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-white">{drillFeedback.score}%</span>
                  <Badge variant={drillFeedback.score >= 60 ? "success" : "warning"}>{drillFeedback.score >= 60 ? "Adequate" : "Needs work"}</Badge>
                </div>
                <div className="rounded-lg bg-white/5 p-3 text-sm text-gray-300 whitespace-pre-wrap">{drillFeedback.feedback}</div>
                <Button onClick={handleNextDrill}>
                  {currentDrillIdx < topic.drills.length - 1 ? "Next Drill →" : "Proceed to Challenge →"}
                </Button>
              </div>
            )}
          </Card>

          {drillScores.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Drill Scores</CardTitle></CardHeader>
              <div className="flex gap-2 flex-wrap">
                {drillScores.map((s, i) => (
                  <div key={i} className={`rounded-lg px-3 py-1.5 text-xs font-mono ${s >= 60 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                    D{i + 1}: {s}%
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* CHALLENGE PHASE */}
      {phase === "challenge" && (
        <div className="space-y-4">
          {!allDrillsAttempted ? (
            <Card className="border-amber-500/30">
              <div className="text-center py-8">
                <div className="text-amber-400 text-lg font-semibold mb-2">Challenge Locked</div>
                <p className="text-sm text-gray-400 mb-4">Complete all {topic.drills.length} drills before attempting the challenge.</p>
                <Button onClick={() => { setPhase("drills"); setCurrentDrillIdx(drillScores.length); setDrillResponse(""); setDrillFeedback(null); setShowHint(false); }}>
                  Continue Drills ({drillScores.length}/{topic.drills.length})
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="border-indigo-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Certification Challenge</CardTitle>
                  <Badge variant="info">{topic.challenge.type.replace(/_/g, " ")}</Badge>
                </div>
              </CardHeader>
              <div className="whitespace-pre-wrap text-sm text-gray-300 mb-4 leading-relaxed">{topic.challenge.scenario}</div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-2">Constraints:</label>
                  <ul className="space-y-1">
                    {topic.challenge.constraints.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="text-red-400 mt-0.5 text-xs">*</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-2">Required sections:</label>
                  <div className="flex flex-wrap gap-1">
                    {topic.challenge.requiredSections.map((s) => (<Badge key={s} variant="warning">{s}</Badge>))}
                  </div>
                </div>
                {topic.challenge.hints && topic.challenge.hints.length > 0 && (
                  <div>
                    {showHint ? (
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-300 space-y-1">
                        {topic.challenge.hints.map((h, i) => <p key={i}>{h}</p>)}
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setShowHint(true)}>Show Hints</Button>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4">
                <textarea
                  value={challengeResponse}
                  onChange={(e) => setChallengeResponse(e.target.value)}
                  placeholder="Write your complete certification response..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:outline-none min-h-[300px] resize-y font-mono"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">Pass: {topic.passThreshold}% | XP: {topic.xpValue}</span>
                <Button size="lg" onClick={handleSubmitChallenge} disabled={!challengeResponse.trim() || submitting}>
                  {submitting ? "Evaluating..." : "Submit for Certification"}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* REVIEW PHASE */}
      {phase === "review" && challengeResult && (
        <div className="space-y-4">
          <Card className={challengeResult.passed ? "border-emerald-500/30" : "border-amber-500/30"}>
            <div className="text-center py-4">
              <div className={`text-6xl font-bold mb-2 ${challengeResult.passed ? "text-emerald-400" : "text-amber-400"}`}>
                {challengeResult.score}%
              </div>
              <Badge variant={challengeResult.passed ? "success" : "warning"} className="text-base px-4 py-1">
                {challengeResult.passed ? "CERTIFICATION PASSED" : "NOT YET — RETRY"}
              </Badge>
              <div className="mt-2 text-xs text-gray-500">Confidence: {challengeResult.confidence} | Threshold: {topic.passThreshold}%</div>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Rubric Breakdown</CardTitle></CardHeader>
            <div className="space-y-4">
              {challengeResult.breakdown.map((b) => {
                const criterion = topic.rubric.find((r) => r.id === b.criterionId);
                return (
                  <div key={b.criterionId}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-200">{criterion?.dimension || b.criterionId}</span>
                      <span className={`text-sm font-mono ${b.score >= 80 ? "text-emerald-400" : b.score >= 60 ? "text-amber-400" : "text-red-400"}`}>{b.score}%</span>
                    </div>
                    <ProgressBar value={b.score} showPercent={false} size="sm" color={b.score >= 80 ? "bg-emerald-500" : b.score >= 60 ? "bg-amber-500" : "bg-red-500"} />
                    <p className="mt-1 text-xs text-gray-500">{b.feedback}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {challengeResult.weaknesses.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Focus Areas</CardTitle></CardHeader>
              <div className="flex flex-wrap gap-2">
                {challengeResult.weaknesses.map((w) => (<Badge key={w} variant="warning">{w}</Badge>))}
              </div>
            </Card>
          )}

          {challengeResult.suggestedImprovements && challengeResult.suggestedImprovements.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Suggested Improvements</CardTitle></CardHeader>
              <ul className="space-y-1">
                {challengeResult.suggestedImprovements.map((s, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5 text-xs">-</span>{s}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Review summary */}
          <Card>
            <CardHeader><CardTitle>Topic Review</CardTitle></CardHeader>
            <p className="text-sm text-gray-300">{topic.reviewSummary}</p>
          </Card>

          <div className="flex gap-3">
            {challengeResult.passed ? (
              <>
                {getNextTopic(topic.id) && (<Button onClick={handleContinueToNext}>Next Topic →</Button>)}
                <Button variant="secondary" onClick={() => { setTopic(null); setPhase("learn"); }}>Back to Topics</Button>
              </>
            ) : (
              <>
                <Button onClick={() => { setPhase("challenge"); setChallengeResponse(""); setChallengeResult(null); }}>Retry Challenge</Button>
                <Button variant="ghost" onClick={() => setPhase("learn")}>Review Lesson</Button>
              </>
            )}
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
