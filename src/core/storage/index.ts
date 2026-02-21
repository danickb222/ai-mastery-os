import {
  STORAGE_KEYS,
  type OperatorProfile,
  type DomainScore,
  type ArenaState,
  type LabSession,
  type Achievement,
} from "./schema";

// --- Generic Helpers ---

export function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`[setItem] Failed to write key "${key}"`);
  }
}

export function clearItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    // silent
  }
}

export function hasItem(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

// --- Operator Profile ---

export function getOperatorProfile(): OperatorProfile | null {
  return getItem<OperatorProfile>(STORAGE_KEYS.OPERATOR_PROFILE);
}

export function setOperatorProfile(profile: OperatorProfile): void {
  setItem(STORAGE_KEYS.OPERATOR_PROFILE, profile);
}

export function initOperatorProfile(): OperatorProfile {
  const now = new Date().toISOString();
  const profile: OperatorProfile = {
    operatorScore: 0,
    rankPercentile: 100,
    rankLabel: "Unranked",
    streakDays: 0,
    lastStreakDate: "",
    diagnosticScore: null,
    onboardingComplete: false,
    createdAt: now,
    lastActive: now,
  };
  setOperatorProfile(profile);
  return profile;
}

// --- Score Computation ---

export function computeOperatorScore(
  domainScores: DomainScore[],
  arenaState: ArenaState | null,
  labSessions: LabSession[]
): number {
  let domainAvg = 0;
  if (domainScores.length > 0) {
    const sum = domainScores.reduce((acc, ds) => acc + ds.score, 0);
    domainAvg = sum / domainScores.length;
  }

  const arenaBest = arenaState ? arenaState.bestScore : 0;

  let labAvg = 0;
  if (labSessions.length > 0) {
    const sum = labSessions.reduce((acc, ls) => acc + ls.qualityScore, 0);
    labAvg = sum / labSessions.length;
  }

  const weighted = domainAvg * 0.5 + arenaBest * 0.35 + labAvg * 0.15;
  return Math.round(Math.min(100, Math.max(0, weighted)));
}

// --- Rank ---

export function getRankLabel(percentile: number): string {
  if (percentile < 20) return "Elite Operator";
  if (percentile < 45) return "Lead Operator";
  if (percentile < 70) return "Senior Operator";
  if (percentile <= 90) return "Operator";
  return "Unranked";
}

// --- Streak ---

export function updateStreak(profile: OperatorProfile): OperatorProfile {
  const today = new Date().toISOString().split("T")[0];

  if (profile.lastStreakDate === today) {
    return profile;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (profile.lastStreakDate === yesterday) {
    return {
      ...profile,
      streakDays: profile.streakDays + 1,
      lastStreakDate: today,
    };
  }

  return {
    ...profile,
    streakDays: 1,
    lastStreakDate: today,
  };
}

// --- Score Delta ---

const PREVIOUS_SCORE_KEY = "amo_previous_operator_score";

export function getScoreDelta(): number {
  const profile = getOperatorProfile();
  if (!profile) return 0;
  const prev = getItem<number>(PREVIOUS_SCORE_KEY);
  const delta = prev !== null ? profile.operatorScore - prev : 0;
  setItem(PREVIOUS_SCORE_KEY, profile.operatorScore);
  return delta;
}

// --- Achievements ---

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  check: (ctx: AchievementContext) => boolean;
}

interface AchievementContext {
  profile: OperatorProfile;
  domainScores: DomainScore[];
  drillHistory: { drillId: string; correct: boolean }[];
  arenaState: ArenaState | null;
  labSessions: LabSession[];
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first_drill",
    title: "First Drill",
    description: "Completed your first drill session.",
    check: (ctx) => ctx.drillHistory.length >= 1,
  },
  {
    id: "ten_drills",
    title: "Drill Operator",
    description: "Completed 10 drills across any domain.",
    check: (ctx) => ctx.drillHistory.length >= 10,
  },
  {
    id: "fifty_drills",
    title: "Drill Machine",
    description: "Completed 50 drills.",
    check: (ctx) => ctx.drillHistory.length >= 50,
  },
  {
    id: "first_arena",
    title: "Arena Debut",
    description: "Completed your first Arena challenge.",
    check: (ctx) => (ctx.arenaState?.sessionsCompleted ?? 0) >= 1,
  },
  {
    id: "arena_strong",
    title: "Arena Strong",
    description: "Scored 70+ on an Arena challenge.",
    check: (ctx) => (ctx.arenaState?.bestScore ?? 0) >= 70,
  },
  {
    id: "first_lab",
    title: "Lab Initiated",
    description: "Ran your first Lab simulation.",
    check: (ctx) => ctx.labSessions.length >= 1,
  },
  {
    id: "streak_3",
    title: "3-Day Streak",
    description: "Trained 3 days in a row.",
    check: (ctx) => ctx.profile.streakDays >= 3,
  },
  {
    id: "streak_7",
    title: "Weekly Warrior",
    description: "Trained 7 days in a row.",
    check: (ctx) => ctx.profile.streakDays >= 7,
  },
  {
    id: "score_50",
    title: "Half Century",
    description: "Reached an Operator Score of 50.",
    check: (ctx) => ctx.profile.operatorScore >= 50,
  },
  {
    id: "score_80",
    title: "Elite Threshold",
    description: "Reached an Operator Score of 80.",
    check: (ctx) => ctx.profile.operatorScore >= 80,
  },
  {
    id: "all_domains",
    title: "Full Spectrum",
    description: "Attempted drills in all 5 domains.",
    check: (ctx) => ctx.domainScores.length >= 5,
  },
];

export function checkAchievements(): Achievement[] {
  const profile = getOperatorProfile();
  if (!profile) return [];

  const domainScores = getItem<DomainScore[]>(STORAGE_KEYS.DOMAIN_SCORES) || [];
  const drillHistory = getItem<{ drillId: string; correct: boolean }[]>(STORAGE_KEYS.DRILL_HISTORY) || [];
  const arenaState = getItem<ArenaState>(STORAGE_KEYS.ARENA_STATE);
  const labSessions = getItem<LabSession[]>(STORAGE_KEYS.LAB_SESSIONS) || [];

  const ctx: AchievementContext = { profile, domainScores, drillHistory, arenaState, labSessions };
  const existing = getItem<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS) || [];
  const existingIds = new Set(existing.map((a) => a.id));
  const newlyUnlocked: Achievement[] = [];

  for (const def of ACHIEVEMENT_DEFS) {
    if (existingIds.has(def.id)) continue;
    if (def.check(ctx)) {
      const achievement: Achievement = {
        id: def.id,
        title: def.title,
        description: def.description,
        unlockedAt: new Date().toISOString(),
      };
      existing.push(achievement);
      newlyUnlocked.push(achievement);
    }
  }

  if (newlyUnlocked.length > 0) {
    setItem(STORAGE_KEYS.ACHIEVEMENTS, existing);
  }

  return newlyUnlocked;
}

export function getAchievements(): Achievement[] {
  return getItem<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS) || [];
}

// Re-export schema
export { STORAGE_KEYS } from "./schema";
export type {
  OperatorProfile,
  DomainScore,
  DrillRecord,
  ArenaState,
  LabSession,
  LastDrillSession,
  Achievement,
} from "./schema";
