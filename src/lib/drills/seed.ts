// src/lib/drills/seed.ts
import type { DrillSpec } from '../contracts/drill';

export const drillsDatabase: Record<string, DrillSpec> = {
  'pe_001': {
    id: 'pe_001',
    domainId: 1,
    domainName: 'Prompt Engineering',
    tierId: 'structured-operator',
    skillId: 'specificity',
    skillName: 'Specificity',
    title: 'The Vague Request Problem',
    scenario:
      'You are a marketing manager at a B2B SaaS company with 5,000 newsletter subscribers. You need a weekly email covering industry trends written for founders and operators who run companies.',
    task:
      "A complete newsletter with a compelling subject line under 60 characters, a one-sentence opening on the week's dominant theme, three bold-headed insight sections each with a specific data point or named example, and a single CTA. Tone is direct and expert. Length 300-400 words.",
    deliverableFormat:
      'A complete prompt (not the newsletter itself) that an AI model can execute to produce the newsletter. The prompt must be independently actionable — someone should be able to paste it into ChatGPT or Claude and receive a correctly formatted newsletter without any additional context.',
    constraints: [
      'Prompt must specify the target audience with role and context',
      'Prompt must define exact sections, order, and format requirements',
      'Prompt must explicitly state voice and style expectations',
      'Prompt must provide specific word or character limits',
      'Prompt must specify subject line, headers, and CTA requirements',
    ],
    rubric: [
      {
        id: 'c1',
        label: 'Audience Definition',
        description: 'Specifies who the content is for with role and context',
        maxPoints: 20,
        scoringSignals: [
          'Names the audience role explicitly (founders, operators, etc.)',
          'Includes company context (B2B SaaS, company size, etc.)',
          'Audience definition would constrain tone and content choices',
        ],
        failureSignals: [
          'No audience specified',
          'Audience is generic (e.g., "business professionals")',
          'Role mentioned but no context or specificity',
        ],
      },
      {
        id: 'c2',
        label: 'Structure Specification',
        description: 'Defines exact sections, order, and format requirements',
        maxPoints: 25,
        scoringSignals: [
          'Lists required sections explicitly (subject line, opening, insight sections, CTA)',
          'Specifies section order',
          'Defines format for each section (bold headers, data points, etc.)',
        ],
        failureSignals: [
          'No section structure defined',
          'Vague structural references (e.g., "include sections")',
          'Only partial structure specified',
        ],
      },
      {
        id: 'c3',
        label: 'Tone Definition',
        description: 'Explicitly states voice and style expectations',
        maxPoints: 20,
        scoringSignals: [
          'Names specific tone attributes (direct, expert, etc.)',
          'Prohibits unwanted tones (no fluff, no jargon, etc.)',
          'Tone is specific enough to constrain output style',
        ],
        failureSignals: [
          'No tone guidance',
          'Vague tone instruction (e.g., "professional")',
          'Tone described but not actionable',
        ],
      },
      {
        id: 'c4',
        label: 'Length Constraint',
        description: 'Provides specific word or character limits',
        maxPoints: 15,
        scoringSignals: [
          'Specifies word count range or maximum',
          'Length constraint is specific (e.g., "300-400 words")',
          'Length applied to overall piece or individual sections',
        ],
        failureSignals: [
          'No length constraint',
          'Vague length guidance (e.g., "keep it short")',
        ],
      },
      {
        id: 'c5',
        label: 'Format Elements',
        description: 'Specifies subject line, headers, CTA requirements',
        maxPoints: 20,
        scoringSignals: [
          'Subject line constraint included (character limit, no clickbait, etc.)',
          'Header format specified for insight sections',
          'CTA format defined (single sentence, action-oriented, etc.)',
        ],
        failureSignals: [
          'No subject line requirement',
          'Headers not specified',
          'CTA omitted or vaguely referenced',
        ],
      },
    ],
    timeEstimateMinutes: 8,
  },

  'pe_004': {
    id: 'pe_004',
    domainId: 1,
    domainName: 'Prompt Engineering',
    tierId: 'systems-builder',
    skillId: 'classification_logic',
    skillName: 'Classification Logic',
    title: 'The Ambiguity Eliminator',
    scenario:
      'A product team needs AI to triage feature requests from customers. Requests come in various formats (emails, support tickets, sales calls). The AI must categorize each as: bug, feature request, or question, then assign priority (P0/P1/P2/P3) and route to the correct team. Current system produces inconsistent categorizations.',
    task:
      'A prompt that produces identical categorizations when the same request is submitted multiple times, handles edge cases explicitly, and provides reasoning for each decision.',
    deliverableFormat:
      'A complete prompt addressed to an AI model that instructs it to categorize customer requests. The prompt must be independently actionable — paste it into ChatGPT or Claude and it should be ready to process requests without additional context.',
    constraints: [
      'Prompt must define each category with clear, measurable boundaries',
      'Prompt must include a decision tree or step-by-step logic for categorization',
      'Prompt must specify measurable criteria for each priority level (P0–P3)',
      'Prompt must define behavior for ambiguous, multi-category, and invalid requests',
    ],
    rubric: [
      {
        id: 'c1',
        label: 'Explicit Category Definitions',
        description: 'Defines each category with clear boundaries',
        maxPoints: 25,
        scoringSignals: [
          'Bug, feature request, and question each have distinct definitions',
          'Definitions use measurable or observable criteria',
          'No overlap between category definitions',
        ],
        failureSignals: [
          'Categories undefined or defined only by example',
          'Definitions overlap (a single request could fit multiple categories)',
          'Vague category language (e.g., "if something seems broken")',
        ],
      },
      {
        id: 'c2',
        label: 'Decision Tree Logic',
        description: 'Provides step-by-step categorization process',
        maxPoints: 25,
        scoringSignals: [
          'Step-by-step decision sequence provided',
          'Multi-category conflict resolution defined',
          'Logic produces same result for same input every time',
        ],
        failureSignals: [
          'No decision logic — relies on model judgment',
          'Steps incomplete or ambiguous',
          'No guidance for requests that fit multiple categories',
        ],
      },
      {
        id: 'c3',
        label: 'Priority Rubric Defined',
        description: 'Specifies measurable criteria for each priority level',
        maxPoints: 25,
        scoringSignals: [
          'P0–P3 each have specific, measurable criteria',
          'Criteria include user impact thresholds (e.g., percentage affected)',
          'Borderline priority handling specified',
        ],
        failureSignals: [
          'Priority levels undefined or vague (e.g., "high priority")',
          'Criteria not measurable (e.g., "seems important")',
          'Missing one or more priority levels',
        ],
      },
      {
        id: 'c4',
        label: 'Edge Case Handling',
        description: 'Defines behavior for ambiguous, multi-category, and invalid requests',
        maxPoints: 25,
        scoringSignals: [
          'Unclear requests handled with a specific output (e.g., NEEDS CLARIFICATION)',
          'Invalid or spam requests handled explicitly',
          'Multi-category requests resolved by a defined priority rule',
        ],
        failureSignals: [
          'No edge case handling',
          'Edge cases mentioned but behavior not defined',
          'Model left to guess for ambiguous inputs',
        ],
      },
    ],
    timeEstimateMinutes: 9,
  },

  'pe_006': {
    id: 'pe_006',
    domainId: 1,
    domainName: 'Prompt Engineering',
    tierId: 'strategic-architect',
    skillId: 'hallucination_prevention',
    skillName: 'Hallucination Prevention',
    title: 'The Anti-Hallucination Framework',
    scenario:
      "A research team uses AI to generate literature reviews. The AI frequently cites papers that don't exist, misattributes findings, and invents statistics. Standard prompts like \"be accurate\" don't work. You need a prompt framework that systematically prevents hallucination.",
    task:
      "A multi-constraint prompt that forces the model to distinguish between what it knows vs what it's inferring, requires explicit uncertainty markers, and prevents fabrication of specific data types.",
    deliverableFormat:
      'A complete prompt addressed to an AI model that instructs it to write a literature review using anti-hallucination rules. The prompt must be independently actionable — paste it into ChatGPT or Claude and it should constrain the model\'s output without any additional context.',
    constraints: [
      'Prompt must define exactly what constitutes a valid citation',
      'Prompt must require explicit uncertainty markers when the model is uncertain',
      'Prompt must prohibit inventing specific data types (names, years, statistics)',
      'Prompt must include a self-check or verification step before making claims',
    ],
    rubric: [
      {
        id: 'c1',
        label: 'Citation Constraints',
        description: 'Defines exactly what constitutes a valid citation',
        maxPoints: 30,
        scoringSignals: [
          'Specifies required citation elements (e.g., author, year, title)',
          'Defines what to output when a valid citation cannot be produced',
          'Prohibits inventing citation elements',
        ],
        failureSignals: [
          'No citation rules defined',
          'Citation rules vague (e.g., "cite your sources")',
          'No fallback behavior for missing citation information',
        ],
      },
      {
        id: 'c2',
        label: 'Uncertainty Markers',
        description: 'Requires explicit markers when model is uncertain',
        maxPoints: 25,
        scoringSignals: [
          'Specific marker syntax defined (e.g., [UNCERTAIN], [CITATION NEEDED])',
          'Markers required for different types of uncertainty (citations, statistics, findings)',
          'Model instructed to use markers proactively, not just when asked',
        ],
        failureSignals: [
          'No uncertainty markers required',
          'Markers mentioned but not defined or mandated',
          'Vague instruction (e.g., "note when you are unsure")',
        ],
      },
      {
        id: 'c3',
        label: 'Fabrication Prevention',
        description: 'Prohibits inventing specific data types',
        maxPoints: 25,
        scoringSignals: [
          'Explicitly prohibits fabricating statistics',
          'Explicitly prohibits inventing author names or paper titles',
          'Prohibits presenting estimates as precise data',
        ],
        failureSignals: [
          'No explicit fabrication prohibition',
          'Only general instruction to be accurate',
          'Specific high-risk data types (names, numbers, dates) not addressed',
        ],
      },
      {
        id: 'c4',
        label: 'Verification Mechanism',
        description: 'Includes self-check before making claims',
        maxPoints: 20,
        scoringSignals: [
          'Model instructed to self-check before writing each claim',
          'Self-check includes a specific question (e.g., "Can I cite a specific source?")',
          'Verification step is mandatory, not optional',
        ],
        failureSignals: [
          'No self-check or verification step',
          'Verification mentioned but not operationalized',
          'Model left to decide when to verify',
        ],
      },
    ],
    timeEstimateMinutes: 10,
  },

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