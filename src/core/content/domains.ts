import type { DrillDomain } from '../types/drills';
import { getDrillsByDomain, DRILLS } from './drills';

export interface DomainInfo {
  id: DrillDomain;
  name: string;
  description: string;
  difficulty: 'foundational' | 'advanced' | 'expert';
  estimatedMinutes: number;
  skills: string[];
  color: string;
  order?: number;
}

export const DOMAINS: DomainInfo[] = [
  {
    id: 'prompt_engineering',
    name: 'Prompt Engineering',
    description: 'The fundamentals of crafting prompts that produce consistent, high-quality outputs across any model or task.',
    difficulty: 'foundational',
    estimatedMinutes: 72,
    skills: ['specificity', 'task_definition', 'output_format', 'constraint_design'],
    color: '#4f6ef7',
    order: 1
  },
  {
    id: 'system_prompts',
    name: 'System Prompts',
    description: 'Design instruction sets that define AI behavior across entire conversations — the foundation of any production AI system.',
    difficulty: 'foundational',
    estimatedMinutes: 60,
    skills: ['role_definition', 'boundary_setting', 'persona_stability', 'escalation_logic'],
    color: '#8b5cf6',
    order: 2
  },
  {
    id: 'reasoning_chains',
    name: 'Reasoning Chains',
    description: 'Force AI to reason step by step before answering. Produces dramatically more accurate outputs on complex problems.',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    skills: ['chain_of_thought', 'step_decomposition', 'assumption_surfacing', 'audit_trails'],
    color: '#10b981',
    order: 3
  },
  {
    id: 'output_control',
    name: 'Output Control',
    description: 'Specify exactly what you want and receive it consistently. Format contracts, schema design, structured output.',
    difficulty: 'foundational',
    estimatedMinutes: 60,
    skills: ['format_specification', 'schema_design', 'validation_logic', 'consistency_enforcement'],
    color: '#f59e0b',
    order: 4
  },
  {
    id: 'ai_workflows',
    name: 'AI Workflows',
    description: 'Design multi-stage prompt pipelines that handle tasks no single prompt can. The difference between using AI and building with it.',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    skills: ['pipeline_design', 'stage_definition', 'quality_gates', 'workflow_architecture'],
    color: '#f97316',
    order: 5
  },
  {
    id: 'context_management',
    name: 'Context Management',
    description: 'Handle long documents, complex conversations, and multi-source data without losing coherence or accuracy.',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    skills: ['document_chunking', 'multi_stage_processing', 'cross_reference_tracking', 'memory_systems'],
    color: '#06b6d4',
    order: 6
  },
  {
    id: 'role_prompting',
    name: 'Role Prompting',
    description: 'Deploy expert personas, multi-perspective panels, and specialized agents to unlock domain-expert quality output.',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    skills: ['multi_role_prompting', 'perspective_engineering', 'persona_stability', 'synthesis_design'],
    color: '#ec4899',
    order: 7
  },
  {
    id: 'data_extraction',
    name: 'Data Extraction',
    description: 'Extract structured data from unstructured text consistently. Contracts, transcripts, reports, emails.',
    difficulty: 'advanced',
    estimatedMinutes: 48,
    skills: ['schema_design', 'extraction_consistency', 'normalization', 'confidence_scoring'],
    color: '#84cc16',
    order: 8
  },
  {
    id: 'ai_evaluation',
    name: 'AI Evaluation & Quality Control',
    description: 'Know when AI output is trustworthy and when it is not. Catch hallucinations, verify claims, and build quality control systems before errors reach professional contexts.',
    difficulty: 'advanced',
    estimatedMinutes: 96,
    skills: ['hallucination_detection', 'source_verification', 'instruction_compliance', 'logical_audit', 'confidence_calibration'],
    color: '#ef4444',
    order: 9
  },
  {
    id: 'workflow_automation',
    name: 'Workflow Automation',
    description: 'Build multi-step AI automations using Make, Zapier, and n8n that connect tools and run without human intervention — eliminating entire categories of manual work.',
    difficulty: 'advanced',
    estimatedMinutes: 120,
    skills: ['trigger_action_mapping', 'prompt_in_workflow', 'error_handling', 'pipeline_orchestration', 'webhook_integration'],
    color: '#f97316',
    order: 10
  },
  {
    id: 'tool_ecosystem',
    name: 'AI Tool Ecosystem',
    description: 'Evaluate, select, and switch between AI tools confidently — knowing which tool to use for which task and building the organizational AI stack.',
    difficulty: 'foundational',
    estimatedMinutes: 72,
    skills: ['use_case_matching', 'capability_mapping', 'model_selection', 'tool_evaluation', 'cost_optimization'],
    color: '#3b82f6',
    order: 11
  },
  {
    id: 'multi_agent_systems',
    name: 'Multi-Agent Systems',
    description: 'Design, deploy, and manage systems where multiple AI agents work autonomously — understanding when they succeed, when they fail, and how to build them safely.',
    difficulty: 'expert',
    estimatedMinutes: 144,
    skills: ['agent_vs_tool', 'failure_mode_recognition', 'human_in_loop', 'multi_agent_roles', 'safety_architecture'],
    color: '#a855f7',
    order: 12
  },
  {
    id: 'professional_ethics',
    name: 'Professional Ethics & Risk',
    description: 'Make sound professional judgments about when to use AI, when not to, and how to avoid legal, reputational, and ethical exposure in professional contexts.',
    difficulty: 'advanced',
    estimatedMinutes: 84,
    skills: ['confidentiality_assessment', 'hallucination_liability', 'attribution_standards', 'regulatory_mapping', 'governance_design'],
    color: '#64748b',
    order: 13
  }
];

export function getDomainInfo(domainId: DrillDomain): DomainInfo | undefined {
  return DOMAINS.find(d => d.id === domainId);
}

export function getDomainDrillCount(domainId: DrillDomain): number {
  return getDrillsByDomain(domainId).length;
}

export function getDomainEstimatedMinutes(domainId: DrillDomain): number {
  const drills = getDrillsByDomain(domainId);
  return drills.reduce((sum, drill) => sum + (drill.timeLimit > 0 ? Math.ceil(drill.timeLimit / 60) : 12), 0);
}
