export const STORAGE_KEYS = {
  OPERATOR_PROFILE: "amo_operator_profile",
  DOMAIN_SCORES: "amo_domain_scores",
  DRILL_HISTORY: "amo_drill_history",
  ARENA_STATE: "amo_arena_state",
  LAB_SESSIONS: "amo_lab_sessions",
  STREAK: "amo_streak",
  ONBOARDING_COMPLETE: "amo_onboarding_complete",
  LAST_ACTIVE: "amo_last_active",
  LAST_DRILL_SESSION: "amo_last_drill_session",
  ACHIEVEMENTS: "amo_achievements",
} as const;

export interface OperatorProfile {
  operatorScore: number;
  rankPercentile: number;
  rankLabel: string;
  streakDays: number;
  lastStreakDate: string;
  diagnosticScore: number | null;
  onboardingComplete: boolean;
  createdAt: string;
  lastActive: string;
}

export interface DomainScore {
  domainId: string;
  score: number;
  drillsCompleted: number;
  drillsTotal: number;
  lastAttempted: string;
}

export interface DrillRecord {
  drillId: string;
  domainId: string;
  topicId: string;
  score: number;
  timeTaken: number;
  correct: boolean;
  flagged: boolean;
  attemptedAt: string;
}

export interface ArenaState {
  seasonNumber: number;
  seasonEndDate: string;
  totalParticipants: number;
  userRank: number;
  sessionsCompleted: number;
  bestScore: number;
  lastSessionScore: number | null;
}

export interface LabSession {
  id: string;
  prompt: string;
  output: string;
  qualityScore: number;
  feedback: string;
  domainTag: string;
  savedAt: string;
  flagged: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
}

export interface LastDrillSession {
  domainId: string;
  domainName: string;
  topicId: string;
  topicName: string;
  drillIndex: number;
  timestamp: string;
}
