// src/lib/drills/seed.ts
import type { DrillSpec } from '../contracts/drill';

export const drillsDatabase: Record<string, DrillSpec> = {
  'pe-constraint-001': {
    id: 'pe-constraint-001',
    domainId: 1,
    domainName: 'Prompt Engineering',
    tierId: 'structured-operator',
    skillId: 'constraint-encoding',
    skillName: 'Constraint Encoding',
    title: 'Medical Appointment Scheduler with Compliance Constraints',
    scenario:
      'You are working as a junior AI engineer at a healthcare technology company. Your team is building an AI assistant that helps schedule patient appointments via natural language. The system must comply with HIPAA privacy requirements, handle emergency vs. routine appointments differently, respect provider availability windows, and enforce minimum lead times for different appointment types. Your task is to design the constraint layer that ensures the AI never violates these rules, even when patients make urgent or unusual requests.',
    task:
      'Write a system prompt that encodes all scheduling constraints so the AI assistant can handle appointment requests safely and compliantly. The prompt must prevent the AI from making scheduling decisions that violate any constraint, while still being helpful to patients.',
    deliverableFormat:
      'A complete system prompt (400-600 words) that can be deployed to production. Include explicit constraint definitions, handling instructions, and output format specification.',
    constraints: [
      'Must explicitly define all 4 constraint categories: HIPAA compliance, emergency vs routine triage, provider availability, and minimum lead times',
      'Must include at least 2 specific rules per constraint category (8+ total rules)',
      'Must specify exact output format as structured JSON with required fields: appointmentType, suggestedDate, suggestedTime, providerId, and complianceChecks',
      'Must include instructions for handling constraint violations (what to do when a request cannot be fulfilled)',
      'Must not exceed 600 words',
      'Must include at least one concrete example of a valid scheduling decision',
    ],
    rubric: [
      {
        id: 'constraint-completeness',
        label: 'Constraint Completeness',
        description: 'All 4 constraint categories are defined with specific, measurable rules',
        maxPoints: 25,
        failureSignals: [
          'Missing one or more constraint categories',
          'Fewer than 2 rules per category',
          'Vague or unmeasurable rules (e.g., "be reasonable")',
          'Rules lack specific thresholds or criteria',
        ],
        scoringSignals: [
          'All 4 categories explicitly defined',
          'At least 2 concrete rules per category',
          'Rules include specific values (e.g., "24-hour minimum lead time")',
          'Rules are verifiable and measurable',
        ],
      },
      {
        id: 'constraint-enforcement',
        label: 'Constraint Enforcement Mechanism',
        description: 'Clear instructions on how to enforce constraints and handle violations',
        maxPoints: 20,
        failureSignals: [
          'No violation handling instructions',
          'Unclear what happens when constraints conflict',
          'No priority ordering for constraints',
          'Missing guidance on edge cases',
        ],
        scoringSignals: [
          'Explicit violation handling procedure',
          'Constraint priority hierarchy defined',
          'Instructions for conflicting constraints',
          'Fallback behavior specified',
        ],
      },
      {
        id: 'hipaa-compliance',
        label: 'HIPAA Compliance Safeguards',
        description: 'Specific privacy and security rules are encoded to prevent PHI exposure',
        maxPoints: 20,
        failureSignals: [
          'No mention of PHI protection',
          'Missing authentication requirements',
          'No restrictions on information sharing',
          'Vague privacy language',
        ],
        scoringSignals: [
          'Explicit PHI handling rules',
          'Authentication/verification requirements stated',
          'Information disclosure limits defined',
          'Specific prohibited actions listed',
        ],
      },
      {
        id: 'output-format',
        label: 'Output Format Specification',
        description: 'JSON structure is precisely defined with all required fields and types',
        maxPoints: 15,
        failureSignals: ['Output format not specified', 'Missing required fields', 'Field types not defined', 'No example provided'],
        scoringSignals: [
          'Complete JSON schema with all 5 required fields',
          'Field types and constraints specified',
          'Valid example included',
          'Format is unambiguous',
        ],
      },
      {
        id: 'emergency-triage',
        label: 'Emergency vs Routine Triage Logic',
        description: 'Clear differentiation and handling rules for emergency appointments',
        maxPoints: 15,
        failureSignals: [
          'No distinction between emergency and routine',
          'Missing triage criteria',
          'No expedited handling for emergencies',
          'Unclear escalation path',
        ],
        scoringSignals: [
          'Emergency criteria clearly defined',
          'Different handling procedures for each type',
          'Expedited scheduling rules for emergencies',
          'Escalation procedure specified',
        ],
      },
      {
        id: 'production-readiness',
        label: 'Production Readiness',
        description: 'Prompt is clear, professional, and ready for deployment without modification',
        maxPoints: 5,
        failureSignals: ['Exceeds 600 words', 'Contains placeholders or TODOs', 'Ambiguous phrasing', 'Unprofessional tone'],
        scoringSignals: ['Within 400-600 word range', 'No placeholders', 'Professional, clear language', 'Deployment-ready'],
      },
    ],
    timeEstimateMinutes: 30,
    starterInput: 'You are a medical appointment scheduling assistant...',
  },
};

/**
 * Bulletproof getter:
 * - accepts undefined (client param not ready)
 * - accepts string[]
 * - trims whitespace
 */
export function getDrillById(drillId: string | string[] | undefined): DrillSpec | null {
  if (!drillId) return null;
  const id = Array.isArray(drillId) ? drillId[0] : drillId;
  const normalized = String(id).trim();
  return drillsDatabase[normalized] ?? null;
}