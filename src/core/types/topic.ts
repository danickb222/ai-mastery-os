// ===== 5 Training Pillars =====

export type Domain =
  | "Prompt Engineering"
  | "Evaluation & Reliability"
  | "AI System Design"
  | "Automation & Integration"
  | "Operator Strategy";

export const ALL_DOMAINS: Domain[] = [
  "Prompt Engineering",
  "Evaluation & Reliability",
  "AI System Design",
  "Automation & Integration",
  "Operator Strategy",
];

// ===== Topic Schema =====

export type LessonBlock = {
  type: "text" | "example" | "callout";
  content: string;
};

export type WorkedExample = {
  title: string;
  input: string;
  output: string;
  explanation: string;
};

export type DrillType =
  | "rewrite"
  | "constrain"
  | "debug"
  | "harden"
  | "design"
  | "analyze"
  | "evaluate"
  | "optimize"
  | "compare"
  | "failure_inject"
  | "build"
  | "translate";

export type Drill = {
  id: string;
  type: DrillType;
  prompt: string;
  hint?: string;
  requiredElements: string[];
  evaluationCriteria: string[];
};

export type ChallengeType =
  | "prompt_engineering"
  | "evaluation_design"
  | "system_design"
  | "automation_design"
  | "strategy_design"
  | "capstone";

export type Challenge = {
  id: string;
  type: ChallengeType;
  scenario: string;
  constraints: string[];
  requiredSections: string[];
  hints?: string[];
  testCases?: {
    input: string;
    expectedShape: string;
  }[];
};

export type RubricCriterion = {
  id: string;
  dimension: string;
  description: string;
  weight: number;
};

export type ArtifactType =
  | "prompt_template"
  | "evaluation_harness"
  | "system_design"
  | "workflow_blueprint"
  | "security_framework"
  | "strategy_brief"
  | "capstone_proposal";

export type Topic = {
  id: string;
  weekNumber: number;
  phase: number;
  domain: Domain;
  title: string;
  lesson: LessonBlock[];
  examples: WorkedExample[];
  drills: Drill[];
  challenge: Challenge;
  rubric: RubricCriterion[];
  reviewSummary: string;
  artifactType: ArtifactType;
  passThreshold: number;
  xpValue: number;
};

// ===== Progress & State =====

export type TopicStatus = "locked" | "available" | "in_progress" | "passed" | "failed";

export type DrillAttempt = {
  drillId: string;
  response: string;
  score: number;
  feedback: string;
  timestamp: string;
};

export type ChallengeAttempt = {
  challengeId: string;
  response: string;
  score: number;
  passed: boolean;
  breakdown: {
    criterionId: string;
    score: number;
    feedback: string;
  }[];
  weaknesses: string[];
  suggestedImprovements: string[];
  timestamp: string;
};

export type Artifact = {
  id: string;
  topicId: string;
  domain: Domain;
  type: ArtifactType;
  title: string;
  content: string;
  score: number;
  timestamp: string;
};

export type TopicProgress = {
  topicId: string;
  status: TopicStatus;
  drillAttempts: DrillAttempt[];
  drillsAttempted: number;
  challengeAttempts: ChallengeAttempt[];
  bestScore: number;
  artifact?: Artifact;
};

export type DomainMastery = {
  domain: Domain;
  topicsTotal: number;
  topicsPassed: number;
  averageScore: number;
  weakestDimensions: string[];
};

export type Badge = {
  id: string;
  title: string;
  description: string;
  earnedAt: string;
};

export type MasteryState = {
  topicProgress: Record<string, TopicProgress>;
  artifacts: Artifact[];
  currentTopicId: string | null;
  totalPassed: number;
  xp: number;
  streak: number;
  lastChallengeDate: string | null;
  badges: Badge[];
};

export type EvaluationResult = {
  score: number;
  passed: boolean;
  breakdown: {
    criterionId: string;
    score: number;
    feedback: string;
  }[];
  confidence: "high" | "medium" | "low";
  weaknesses: string[];
  suggestedImprovements: string[];
};
