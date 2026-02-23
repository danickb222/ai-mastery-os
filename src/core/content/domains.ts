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
}

export const DOMAINS: DomainInfo[] = [
  {
    id: 'prompt_engineering',
    name: 'Prompt Engineering',
    description: 'The fundamentals of crafting prompts that produce consistent, high-quality outputs across any model or task.',
    difficulty: 'foundational',
    estimatedMinutes: 72,
    skills: ['specificity', 'task_definition', 'output_format', 'constraint_design'],
    color: '#4f6ef7'
  },
  {
    id: 'system_prompts',
    name: 'System Prompts',
    description: 'Design instruction sets that define AI behavior across entire conversations — the foundation of any production AI system.',
    difficulty: 'foundational',
    estimatedMinutes: 60,
    skills: ['role_definition', 'boundary_setting', 'persona_stability', 'escalation_logic'],
    color: '#8b5cf6'
  },
  {
    id: 'reasoning_chains',
    name: 'Reasoning Chains',
    description: 'Force AI to reason step by step before answering. Produces dramatically more accurate outputs on complex problems.',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    skills: ['chain_of_thought', 'step_decomposition', 'assumption_surfacing', 'audit_trails'],
    color: '#10b981'
  },
  {
    id: 'output_control',
    name: 'Output Control',
    description: 'Specify exactly what you want and receive it consistently. Format contracts, schema design, structured output.',
    difficulty: 'foundational',
    estimatedMinutes: 60,
    skills: ['format_specification', 'schema_design', 'validation_logic', 'consistency_enforcement'],
    color: '#f59e0b'
  },
  {
    id: 'ai_workflows',
    name: 'AI Workflows',
    description: 'Design multi-stage prompt pipelines that handle tasks no single prompt can. The difference between using AI and building with it.',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    skills: ['pipeline_design', 'stage_definition', 'quality_gates', 'workflow_architecture'],
    color: '#f97316'
  },
  {
    id: 'context_management',
    name: 'Context Management',
    description: 'Handle long documents, complex conversations, and multi-source data without losing coherence or accuracy.',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    skills: ['document_chunking', 'multi_stage_processing', 'cross_reference_tracking', 'memory_systems'],
    color: '#06b6d4'
  },
  {
    id: 'role_prompting',
    name: 'Role Prompting',
    description: 'Deploy expert personas, multi-perspective panels, and specialized agents to unlock domain-expert quality output.',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    skills: ['multi_role_prompting', 'perspective_engineering', 'persona_stability', 'synthesis_design'],
    color: '#ec4899'
  },
  {
    id: 'data_extraction',
    name: 'Data Extraction',
    description: 'Extract structured data from unstructured text consistently. Contracts, transcripts, reports, emails.',
    difficulty: 'advanced',
    estimatedMinutes: 48,
    skills: ['schema_design', 'extraction_consistency', 'normalization', 'confidence_scoring'],
    color: '#84cc16'
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
