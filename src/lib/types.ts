export type SkillDomain =
  | "Prompting"
  | "Evaluation"
  | "APIs"
  | "Automation"
  | "RAG"
  | "Agents"
  | "Security"
  | "Strategy";

export const SKILL_DOMAINS: SkillDomain[] = [
  "Prompting",
  "Evaluation",
  "APIs",
  "Automation",
  "RAG",
  "Agents",
  "Security",
  "Strategy",
];

export interface Resource {
  name: string;
  where: string;
  url?: string;
}

export interface Week {
  id: number;
  title: string;
  objectives: string[];
  resources: Resource[];
  deliverables: string[];
  skills: Partial<Record<SkillDomain, number>>;
}

export interface SessionData {
  weekId: number;
  completedLearn: boolean;
  completedPractice: boolean;
  completedReflect: boolean;
  minutes: number;
  reflectionText: string;
}

export interface QuizQuestion {
  id: number;
  type: "mc" | "short";
  question: string;
  options?: string[];
  correctAnswer: string;
  keywords?: string[];
  domain: SkillDomain;
}

export interface QuizAttempt {
  id: string;
  weekId: number;
  score: number;
  total: number;
  answers: { questionId: number; answer: string; correct: boolean }[];
  feedback: string[];
  weakestDomains: SkillDomain[];
  date: string;
}

export interface PromptAsset {
  id: string;
  systemPrompt: string;
  userPrompt: string;
  temp: number;
  jsonMode: boolean;
  tags: string[];
  notes: string;
  date: string;
  output?: string;
}

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
  mode?: TutorMode;
}

export type TutorMode = "Explain" | "Coach" | "Drill" | "Debug";

export interface UserSettings {
  startDate: string;
  provider: "openai" | "local";
  darkMode: boolean;
}

export interface AppState {
  streakCount: number;
  lastSessionDate: string;
  sessionsByDate: Record<string, SessionData>;
  quizAttempts: QuizAttempt[];
  promptAssets: PromptAsset[];
  notesByWeek: Record<string, string>;
  settings: UserSettings;
  tutorHistory: TutorMessage[];
}
