export type DrillType =
  | 'prompt_construction'
  | 'prompt_debug'
  | 'output_analysis'
  | 'live_challenge'
  | 'scenario_simulation';

export type DifficultyLevel = 'foundational' | 'advanced' | 'expert';

export type DrillDomain =
  | 'prompt_engineering'
  | 'system_prompts'
  | 'reasoning_chains'
  | 'output_control'
  | 'ai_workflows'
  | 'context_management'
  | 'role_prompting'
  | 'data_extraction'
  | 'ai_evaluation'
  | 'workflow_automation'
  | 'tool_ecosystem'
  | 'multi_agent_systems'
  | 'professional_ethics';

export interface BaseDrill {
  id: string;
  type: DrillType;
  domain: DrillDomain;
  difficulty: DifficultyLevel;
  title: string;
  timeLimit: number;
  points: number;
  explanation: string;
  skills: string[];
}

export interface PromptCriteria {
  id: string;
  label: string;
  description: string;
  maxPoints: number;
}

export interface FlawDescription {
  id: string;
  type: 'ambiguity' | 'conflict' | 'missing_context' | 'format_issue' | 'scope_issue';
  description: string;
  location: string;
}

export interface OutputFlaw {
  id: string;
  type: 'hallucination' | 'missed_instruction' | 'logical_error' | 'format_violation';
  description: string;
  evidence: string;
}

export interface RubricItem {
  id: string;
  label: string;
  description: string;
  maxPoints: number;
}

export interface PromptConstructionDrill extends BaseDrill {
  type: 'prompt_construction';
  context: string;
  targetOutput: string;
  brokenPrompt: string;
  referencePrompt: string;
  successCriteria: PromptCriteria[];
}

export interface PromptDebugDrill extends BaseDrill {
  type: 'prompt_debug';
  taskContext: string;
  brokenPrompt: string;
  flaws: FlawDescription[];
  referencePrompt: string;
  successCriteria: PromptCriteria[];
}

export interface OutputAnalysisDrill extends BaseDrill {
  type: 'output_analysis';
  originalPrompt: string;
  aiOutput: string;
  hiddenFlaws: OutputFlaw[];
  correctionTask: string;
  successCriteria: PromptCriteria[];
}

export interface LiveChallengeDrill extends BaseDrill {
  type: 'live_challenge';
  scenario: string;
  requirements: string[];
  constraints: string[];
  exampleOutput: string;
  successCriteria: PromptCriteria[];
}

export interface ScenarioSimulationDrill extends BaseDrill {
  type: 'scenario_simulation';
  scenario: string;
  role: string;
  objective: string;
  requiredElements: string[];
  scoringRubric: RubricItem[];
}

export type AnyDrill =
  | PromptConstructionDrill
  | PromptDebugDrill
  | OutputAnalysisDrill
  | LiveChallengeDrill
  | ScenarioSimulationDrill;

export interface DrillResult {
  drillId: string;
  score: number;
  timeSpent: number;
  userInput: string | Record<string, string>;
  submittedAt: string;
  scoringResult: {
    totalScore: number;
    maxScore: number;
    percentage: number;
    criteriaResults: Array<{
      criterionId: string;
      label: string;
      score: number;
      maxPoints: number;
      feedback: string;
    }>;
    performanceLabel: string;
    feedbackSummary: string;
  };
}

export function getDrillById(id: string, drills: AnyDrill[]): AnyDrill | undefined {
  return drills.find((d) => d.id === id);
}

export function getDrillsByDomain(domain: DrillDomain, drills: AnyDrill[]): AnyDrill[] {
  return drills.filter((d) => d.domain === domain);
}

export function getNextDrill(
  currentId: string,
  domain: DrillDomain,
  drills: AnyDrill[]
): AnyDrill | undefined {
  const domainDrills = getDrillsByDomain(domain, drills);
  const currentIndex = domainDrills.findIndex((d) => d.id === currentId);
  if (currentIndex === -1 || currentIndex === domainDrills.length - 1) return undefined;
  return domainDrills[currentIndex + 1];
}
