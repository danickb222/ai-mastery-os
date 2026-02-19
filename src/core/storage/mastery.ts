import type {
  MasteryState,
  TopicProgress,
  TopicStatus,
  DrillAttempt,
  ChallengeAttempt,
  Artifact,
  DomainMastery,
  Badge,
} from "../types/topic";
import { topics, getNextTopic } from "../content/registry";
import { ALL_DOMAINS } from "../types/topic";

const STORAGE_KEY = "ai-mastery-os-v3";

function defaultState(): MasteryState {
  const topicProgress: Record<string, TopicProgress> = {};

  for (let i = 0; i < topics.length; i++) {
    const t = topics[i];
    topicProgress[t.id] = {
      topicId: t.id,
      status: i === 0 ? "available" : "locked",
      drillAttempts: [],
      drillsAttempted: 0,
      challengeAttempts: [],
      bestScore: 0,
    };
  }

  return {
    topicProgress,
    artifacts: [],
    currentTopicId: topics[0]?.id || null,
    totalPassed: 0,
    xp: 0,
    streak: 0,
    lastChallengeDate: null,
    badges: [],
  };
}

export function getMasteryState(): MasteryState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as MasteryState;
    // Ensure new topics are included
    const def = defaultState();
    for (const t of topics) {
      if (!parsed.topicProgress[t.id]) {
        parsed.topicProgress[t.id] = def.topicProgress[t.id];
      }
      // Ensure drillsAttempted exists on old records
      if (parsed.topicProgress[t.id] && parsed.topicProgress[t.id].drillsAttempted === undefined) {
        parsed.topicProgress[t.id].drillsAttempted = parsed.topicProgress[t.id].drillAttempts?.length || 0;
      }
    }
    // Ensure new fields exist
    if (parsed.xp === undefined) parsed.xp = 0;
    if (parsed.streak === undefined) parsed.streak = 0;
    if (parsed.lastChallengeDate === undefined) parsed.lastChallengeDate = null;
    if (parsed.badges === undefined) parsed.badges = [];
    return parsed;
  } catch {
    return defaultState();
  }
}

export function setMasteryState(state: MasteryState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function updateMasteryState(
  updater: (s: MasteryState) => MasteryState
): MasteryState {
  const s = getMasteryState();
  const next = updater(s);
  setMasteryState(next);
  return next;
}

// --- Topic Progress Operations ---

export function getTopicStatus(topicId: string): TopicStatus {
  const state = getMasteryState();
  return state.topicProgress[topicId]?.status || "locked";
}

export function startTopic(topicId: string): MasteryState {
  return updateMasteryState((s) => ({
    ...s,
    currentTopicId: topicId,
    topicProgress: {
      ...s.topicProgress,
      [topicId]: {
        ...s.topicProgress[topicId],
        status: "in_progress",
      },
    },
  }));
}

export function saveDrillAttempt(
  topicId: string,
  attempt: DrillAttempt
): MasteryState {
  return updateMasteryState((s) => {
    const tp = s.topicProgress[topicId];
    const uniqueDrills = new Set(tp.drillAttempts.map((a) => a.drillId));
    uniqueDrills.add(attempt.drillId);
    return {
      ...s,
      topicProgress: {
        ...s.topicProgress,
        [topicId]: {
          ...tp,
          drillAttempts: [...tp.drillAttempts, attempt],
          drillsAttempted: uniqueDrills.size,
        },
      },
    };
  });
}

export function saveChallengeAttempt(
  topicId: string,
  attempt: ChallengeAttempt,
  artifact: Artifact | null
): MasteryState {
  return updateMasteryState((s) => {
    const tp = s.topicProgress[topicId];
    const newBest = Math.max(tp.bestScore, attempt.score);
    const newStatus: TopicStatus = attempt.passed ? "passed" : tp.status;

    const newState: MasteryState = {
      ...s,
      topicProgress: {
        ...s.topicProgress,
        [topicId]: {
          ...tp,
          challengeAttempts: [...tp.challengeAttempts, attempt],
          bestScore: newBest,
          status: newStatus,
          artifact: artifact || tp.artifact,
        },
      },
      artifacts: artifact ? [...s.artifacts, artifact] : s.artifacts,
      totalPassed: attempt.passed && tp.status !== "passed"
        ? s.totalPassed + 1
        : s.totalPassed,
    };

    // Unlock next topic if passed
    if (attempt.passed) {
      const nextTopic = getNextTopic(topicId);
      if (nextTopic && newState.topicProgress[nextTopic.id]?.status === "locked") {
        newState.topicProgress = {
          ...newState.topicProgress,
          [nextTopic.id]: {
            ...newState.topicProgress[nextTopic.id],
            status: "available",
          },
        };
        newState.currentTopicId = nextTopic.id;
      }

      // XP
      const topic = topics.find((t) => t.id === topicId);
      if (topic && tp.status !== "passed") {
        newState.xp = (newState.xp || 0) + topic.xpValue;
      }

      // Streak
      const today = new Date().toISOString().split("T")[0];
      if (newState.lastChallengeDate === today) {
        // same day, no streak change
      } else {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        if (newState.lastChallengeDate === yesterday) {
          newState.streak = (newState.streak || 0) + 1;
        } else {
          newState.streak = 1;
        }
        newState.lastChallengeDate = today;
      }

      // Badges
      newState.badges = newState.badges || [];
      const badgeChecks: { id: string; title: string; description: string; condition: boolean }[] = [
        { id: "first-cert", title: "First Certification", description: "Passed your first challenge", condition: newState.totalPassed === 1 },
        { id: "phase-1", title: "Phase 1 Complete", description: "Completed all Phase 1 topics", condition: topics.filter((t) => t.phase === 1).every((t) => newState.topicProgress[t.id]?.status === "passed") },
        { id: "phase-2", title: "Phase 2 Complete", description: "Completed all Phase 2 topics", condition: topics.filter((t) => t.phase === 2).every((t) => newState.topicProgress[t.id]?.status === "passed") },
        { id: "phase-3", title: "Phase 3 Complete", description: "Completed all Phase 3 topics", condition: topics.filter((t) => t.phase === 3).every((t) => newState.topicProgress[t.id]?.status === "passed") },
        { id: "capstone", title: "AI Operator", description: "Completed the capstone challenge", condition: newState.topicProgress["w24-t01-capstone"]?.status === "passed" },
        { id: "streak-7", title: "7-Day Streak", description: "Passed challenges 7 days in a row", condition: (newState.streak || 0) >= 7 },
        { id: "streak-30", title: "30-Day Streak", description: "Passed challenges 30 days in a row", condition: (newState.streak || 0) >= 30 },
        { id: "ten-certs", title: "Ten Certifications", description: "Passed 10 challenges", condition: newState.totalPassed >= 10 },
        { id: "half-way", title: "Halfway There", description: "Passed half of all topics", condition: newState.totalPassed >= Math.floor(topics.length / 2) },
      ];
      for (const bc of badgeChecks) {
        if (bc.condition && !newState.badges.find((b) => b.id === bc.id)) {
          newState.badges.push({ id: bc.id, title: bc.title, description: bc.description, earnedAt: new Date().toISOString() });
        }
      }
    }

    return newState;
  });
}

// --- Domain Mastery Computation ---

export function computeDomainMastery(): DomainMastery[] {
  const state = getMasteryState();

  return ALL_DOMAINS.map((domain) => {
    const domainTopics = topics.filter((t) => t.domain === domain);
    const topicsTotal = domainTopics.length;
    let topicsPassed = 0;
    let totalScore = 0;
    const allWeaknesses: Record<string, number> = {};

    for (const topic of domainTopics) {
      const tp = state.topicProgress[topic.id];
      if (!tp) continue;
      if (tp.status === "passed") topicsPassed++;
      totalScore += tp.bestScore;

      // Gather weaknesses from challenge attempts
      for (const attempt of tp.challengeAttempts) {
        for (const w of attempt.weaknesses) {
          allWeaknesses[w] = (allWeaknesses[w] || 0) + 1;
        }
      }
    }

    const averageScore = topicsTotal > 0 ? Math.round(totalScore / topicsTotal) : 0;

    const weakestDimensions = Object.entries(allWeaknesses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([dim]) => dim);

    return {
      domain,
      topicsTotal,
      topicsPassed,
      averageScore,
      weakestDimensions,
    };
  });
}

// --- Export / Reset ---

export function exportMasteryData(): string {
  return JSON.stringify(getMasteryState(), null, 2);
}

export function exportMasteryMarkdown(): string {
  const state = getMasteryState();
  const lines: string[] = ["# AI Mastery OS — Portfolio Export\n"];

  for (const artifact of state.artifacts) {
    lines.push(`## ${artifact.title}`);
    lines.push(`**Domain:** ${artifact.domain} | **Score:** ${artifact.score} | **Date:** ${artifact.timestamp}\n`);
    lines.push(artifact.content);
    lines.push("\n---\n");
  }

  return lines.join("\n");
}

export function resetMasteryData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// Keep old storage key removal for migration
export function migrateFromV1(): void {
  if (typeof window === "undefined") return;
  const oldKey = "ai-mastery-os";
  if (localStorage.getItem(oldKey)) {
    localStorage.removeItem(oldKey);
  }
}
