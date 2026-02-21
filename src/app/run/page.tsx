"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { topics, getTopicsByDomain } from "@/core/content/registry";
import { ALL_DOMAINS } from "@/core/types/topic";
import type { Topic, Drill } from "@/core/types/topic";
import {
  getItem,
  setItem,
  getOperatorProfile,
  setOperatorProfile,
  initOperatorProfile,
  computeOperatorScore,
  getRankLabel,
  updateStreak,
  checkAchievements,
  STORAGE_KEYS,
  type DrillRecord,
  type DomainScore,
  type ArenaState,
  type LabSession,
  type LastDrillSession,
  type OperatorProfile,
  type Achievement,
} from "@/core/storage";
import { AchievementToast } from "@/components/AchievementToast";

// --- MCQ generation from drill content ---
interface MCQQuestion {
  id: string;
  domainId: string;
  domainName: string;
  topicId: string;
  topicName: string;
  drillType: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function generateMCQFromDrill(drill: Drill, topic: Topic): MCQQuestion {
  // Generate plausible MCQ from drill prompt and evaluation criteria
  const criteria = drill.evaluationCriteria || [];
  const correct = criteria[0] || "Applies structured constraints and clear formatting";
  const distractors = [
    "Use vague instructions without specifying output format",
    "Skip defining constraints and let the model decide",
    "Write a single short sentence as the entire prompt",
  ];
  // Shuffle options
  const options = [correct, ...distractors.slice(0, 3)];
  const correctIndex = 0;
  // Simple deterministic shuffle based on drill id
  const seed = drill.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const newCorrectIndex = shuffled.indexOf(correct);

  return {
    id: drill.id,
    domainId: topic.domain,
    domainName: topic.domain,
    topicId: topic.id,
    topicName: topic.title,
    drillType: drill.type,
    question: drill.prompt.length > 200 ? drill.prompt.slice(0, 200) + "..." : drill.prompt,
    options: shuffled,
    correctIndex: newCorrectIndex,
    explanation: `Review the core concept for this domain before proceeding.`,
  };
}

function loadDrillsForDomain(domainId: string): MCQQuestion[] {
  const domainTopics = getTopicsByDomain(domainId as Topic["domain"]);
  const questions: MCQQuestion[] = [];
  for (const topic of domainTopics) {
    for (const drill of topic.drills) {
      questions.push(generateMCQFromDrill(drill, topic));
    }
  }
  return questions;
}

function loadDiagnosticDrills(): MCQQuestion[] {
  // Pick 1 drill from each of 5 domains
  const questions: MCQQuestion[] = [];
  for (const domain of ALL_DOMAINS) {
    const domainTopics = getTopicsByDomain(domain);
    if (domainTopics.length > 0) {
      const topic = domainTopics[0];
      if (topic.drills.length > 0) {
        questions.push(generateMCQFromDrill(topic.drills[0], topic));
      }
    }
  }
  return questions.slice(0, 5);
}

export default function RunPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 rounded bg-white/10" />
          <div className="h-48 rounded-xl bg-white/10" />
        </div>
      }
    >
      <RunPageInner />
    </Suspense>
  );
}

type SessionPhase = "active" | "feedback" | "summary";

function RunPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<SessionPhase>("active");
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; selected: number; correct: boolean }[]>([]);
  const [isDiagnostic, setIsDiagnostic] = useState(false);
  const [sessionDomainName, setSessionDomainName] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Load drills based on query params
  useEffect(() => {
    const mode = searchParams.get("mode");
    const domain = searchParams.get("domain");
    const startIndex = parseInt(searchParams.get("index") || "0", 10);

    if (mode === "diagnostic") {
      // Check if diagnostic already completed
      const profile = getOperatorProfile();
      if (profile && profile.diagnosticScore !== null) {
        router.replace("/");
        return;
      }
      setIsDiagnostic(true);
      setSessionDomainName("DIAGNOSTIC");
      setQuestions(loadDiagnosticDrills());
    } else if (domain) {
      setSessionDomainName(domain);
      const drills = loadDrillsForDomain(domain);
      if (drills.length === 0) {
        setQuestions([]);
      } else {
        setQuestions(drills);
        setCurrentIndex(Math.min(startIndex, drills.length - 1));
      }
    } else {
      // Fallback: load first domain
      const firstDomain = ALL_DOMAINS[0];
      setSessionDomainName(firstDomain);
      setQuestions(loadDrillsForDomain(firstDomain));
    }
    setMounted(true);
  }, [searchParams, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase === "active" && !confirmed) {
        if (e.key >= "1" && e.key <= "4") {
          setSelectedOption(parseInt(e.key) - 1);
        }
        if (e.key === "Enter" && selectedOption !== null) {
          handleConfirm();
        }
      }
      if (phase === "feedback") {
        if (e.key === "Enter" || e.key === "ArrowRight") {
          handleNext();
        }
      }
      if (e.key === "f" || e.key === "F") {
        handleFlag();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const currentQuestion = questions[currentIndex] || null;
  const correctCount = answers.filter((a) => a.correct).length;
  const totalAnswered = answers.length;

  const handleConfirm = useCallback(() => {
    if (selectedOption === null || !currentQuestion) return;
    const correct = selectedOption === currentQuestion.correctIndex;
    setAnswers((prev) => [...prev, { questionId: currentQuestion.id, selected: selectedOption, correct }]);
    setConfirmed(true);
    setPhase("feedback");
  }, [selectedOption, currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      // Session complete
      completeSession();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedOption(null);
    setConfirmed(false);
    setPhase("active");
  }, [currentIndex, questions.length]);

  const handleFlag = useCallback(() => {
    if (!currentQuestion) return;
    const flagged = getItem<string[]>("amo_flagged_drills") || [];
    if (!flagged.includes(currentQuestion.id)) {
      setItem("amo_flagged_drills", [...flagged, currentQuestion.id]);
    }
  }, [currentQuestion]);

  const completeSession = useCallback(() => {
    const finalAnswers = [...answers];
    if (confirmed && currentQuestion) {
      // last answer already in answers
    }
    const total = questions.length;
    const correct = finalAnswers.filter((a) => a.correct).length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Write DrillRecords
    const drillHistory = getItem<DrillRecord[]>(STORAGE_KEYS.DRILL_HISTORY) || [];
    for (const ans of finalAnswers) {
      const q = questions.find((qq) => qq.id === ans.questionId);
      if (q) {
        drillHistory.push({
          drillId: q.id,
          domainId: q.domainId,
          topicId: q.topicId,
          score: ans.correct ? 100 : 0,
          timeTaken: 0,
          correct: ans.correct,
          flagged: false,
          attemptedAt: new Date().toISOString(),
        });
      }
    }
    setItem(STORAGE_KEYS.DRILL_HISTORY, drillHistory);

    // Update DomainScores
    if (!isDiagnostic && questions.length > 0) {
      const domainId = questions[0].domainId;
      const domainDrills = drillHistory.filter((d) => d.domainId === domainId);
      const domainScore = domainDrills.length > 0
        ? Math.round(domainDrills.filter((d) => d.correct).length / domainDrills.length * 100)
        : 0;
      const allDomainTopics = getTopicsByDomain(domainId as Topic["domain"]);
      const totalDrills = allDomainTopics.reduce((sum, t) => sum + t.drills.length, 0);

      const domainScores = getItem<DomainScore[]>(STORAGE_KEYS.DOMAIN_SCORES) || [];
      const existingIdx = domainScores.findIndex((ds) => ds.domainId === domainId);
      const newDs: DomainScore = {
        domainId,
        score: domainScore,
        drillsCompleted: domainDrills.length,
        drillsTotal: totalDrills,
        lastAttempted: new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        domainScores[existingIdx] = newDs;
      } else {
        domainScores.push(newDs);
      }
      setItem(STORAGE_KEYS.DOMAIN_SCORES, domainScores);

      // Write LastDrillSession
      const lastQ = questions[questions.length - 1];
      if (lastQ) {
        const lds: LastDrillSession = {
          domainId: lastQ.domainId,
          domainName: lastQ.domainName,
          topicId: lastQ.topicId,
          topicName: lastQ.topicName,
          drillIndex: questions.length - 1,
          timestamp: new Date().toISOString(),
        };
        setItem(STORAGE_KEYS.LAST_DRILL_SESSION, lds);
      }
    }

    // Recompute operator score
    let profile = getOperatorProfile() || initOperatorProfile();
    const ds = getItem<DomainScore[]>(STORAGE_KEYS.DOMAIN_SCORES) || [];
    const as = getItem<ArenaState>(STORAGE_KEYS.ARENA_STATE);
    const ls = getItem<LabSession[]>(STORAGE_KEYS.LAB_SESSIONS) || [];
    const newOpScore = computeOperatorScore(ds, as, ls);
    const newPercentile = Math.max(1, Math.round(100 - newOpScore));

    if (isDiagnostic) {
      profile = {
        ...profile,
        operatorScore: score,
        diagnosticScore: score,
        onboardingComplete: true,
        rankPercentile: Math.max(1, Math.round(100 - score)),
        rankLabel: getRankLabel(Math.max(1, Math.round(100 - score))),
        lastActive: new Date().toISOString(),
      };
    } else {
      profile = {
        ...profile,
        operatorScore: newOpScore,
        rankPercentile: newPercentile,
        rankLabel: getRankLabel(newPercentile),
        lastActive: new Date().toISOString(),
      };
    }
    // Update streak
    profile = updateStreak(profile);
    setOperatorProfile(profile);

    // Check achievements
    const unlocked = checkAchievements();
    if (unlocked.length > 0) setNewAchievements(unlocked);

    setPhase("summary");
  }, [answers, confirmed, currentQuestion, questions, isDiagnostic]);

  // --- Loading ---
  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-white/10" />
        <div className="h-48 rounded-xl bg-white/10" />
      </div>
    );
  }

  // --- No drills ---
  if (questions.length === 0 && phase !== "summary") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <h1 className="text-2xl font-bold text-white">No drills available for this domain yet.</h1>
        <button
          onClick={() => router.push("/curriculum")}
          className="rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
        >
          ← Back to Train
        </button>
      </div>
    );
  }

  // --- Session Summary ---
  if (phase === "summary") {
    const total = questions.length;
    const correct = answers.filter((a) => a.correct).length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const performanceLabel =
      score >= 80 ? "Strong session." : score >= 60 ? "Acceptable. Tighten your weak spots." : "Below threshold. Repeat this domain.";

    if (isDiagnostic) {
      return (
        <>
          {newAchievements.length > 0 && (
            <AchievementToast achievements={newAchievements} onDone={() => setNewAchievements([])} />
          )}
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
            <h1 className="text-3xl font-bold text-white">Operator Baseline Established</h1>
            <div className="text-6xl font-bold text-white">{score}/100</div>
            <p className="text-sm text-gray-400 max-w-md">
              This is your starting point. The top 10% score above 88.
            </p>
            <button
              onClick={() => router.push("/")}
              className="rounded-lg bg-blue-600 hover:bg-blue-500 px-8 py-3 text-base font-semibold text-white transition-colors"
            >
              Go to Dashboard →
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        {newAchievements.length > 0 && (
          <AchievementToast achievements={newAchievements} onDone={() => setNewAchievements([])} />
        )}
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
          <h1 className="text-3xl font-bold text-white">Session Complete</h1>
          <div className="text-6xl font-bold text-white">{correct}/{total} correct</div>
          <p className="text-sm text-gray-400">{performanceLabel}</p>
          <p className="text-xs text-gray-500">
            This session contributed to your {sessionDomainName} score.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSelectedOption(null);
                setConfirmed(false);
                setAnswers([]);
                setPhase("active");
              }}
              className="rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
            >
              Run Again →
            </button>
            <button
              onClick={() => router.push("/curriculum")}
              className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-3 text-sm font-medium text-gray-300 transition-colors"
            >
              Back to Train →
            </button>
          </div>
        </div>
      </>
    );
  }

  // --- Active Drill / Feedback ---
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-[#0a0a12]/90 backdrop-blur-sm py-3 flex items-center justify-between border-b border-white/10">
        <button
          onClick={() => {
            if (answers.length > 0 && !showExitConfirm) {
              setShowExitConfirm(true);
              return;
            }
            router.push("/curriculum");
          }}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← {showExitConfirm ? "Confirm exit?" : "Exit"}
        </button>
        <div className="text-center">
          <div className="text-xs text-gray-400">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <div className="w-32 h-1 rounded-full bg-white/10 mt-1">
            <div
              className="h-1 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="text-xs text-gray-500 font-mono">
          {correctCount}/{totalAnswered} correct
        </div>
      </div>

      {showExitConfirm && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between">
          <p className="text-sm text-amber-200">Exit session? Progress will be saved.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowExitConfirm(false)}
              className="text-sm text-gray-400 hover:text-white px-3 py-1"
            >
              Cancel
            </button>
            <button
              onClick={() => { completeSession(); }}
              className="rounded-lg bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white"
            >
              Save & Exit
            </button>
          </div>
        </div>
      )}

      {currentQuestion && (
        <div className="space-y-4">
          {/* Domain label */}
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            {isDiagnostic ? "DIAGNOSTIC" : currentQuestion.domainName}
          </div>

          {/* Drill type badge */}
          <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-400 font-medium uppercase tracking-wider">
            {currentQuestion.drillType}
          </span>

          {/* Question */}
          <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
            {currentQuestion.question}
          </div>

          {/* Options */}
          {!confirmed ? (
            <div className="space-y-2">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOption(i)}
                  className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-all ${
                    selectedOption === i
                      ? "border-blue-500/50 bg-blue-500/10 text-white"
                      : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs font-mono text-gray-500 mr-2">{i + 1}</span>
                  {opt}
                </button>
              ))}
              <div className="pt-2">
                <button
                  onClick={handleConfirm}
                  disabled={selectedOption === null}
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 text-sm font-semibold text-white transition-colors"
                >
                  Confirm Answer →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Feedback card */}
              {answers.length > 0 && (() => {
                const lastAnswer = answers[answers.length - 1];
                const isCorrect = lastAnswer.correct;
                return (
                  <div
                    className={`rounded-xl border-l-4 p-4 ${
                      isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                      {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </div>
                    <p className="text-sm text-gray-400">{currentQuestion.explanation}</p>
                    {!isCorrect && (
                      <p className="text-xs text-gray-500 mt-1">
                        Correct answer: {currentQuestion.options[currentQuestion.correctIndex]}
                      </p>
                    )}
                  </div>
                );
              })()}

              <div className="flex items-center justify-between">
                <button
                  onClick={handleFlag}
                  className="text-xs text-gray-500 hover:text-amber-400 transition-colors"
                >
                  Flag this drill
                </button>
                <button
                  onClick={handleNext}
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
                >
                  {currentIndex >= questions.length - 1 ? "Finish Session →" : "Next →"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
