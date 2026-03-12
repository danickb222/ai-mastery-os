import type { DrillDomain } from '../types/drills';

// ─── Domain Clusters (for result display) ────────────────────────────────────
export interface DomainCluster {
  id: string;
  label: string;
  description: string;
  domains: DrillDomain[];
  color: string;
  recommendedPath: string; // href to start training
}

export const DOMAIN_CLUSTERS: DomainCluster[] = [
  {
    id: 'prompt_craft',
    label: 'Prompt Craft',
    description: 'Writing specific, constrained prompts that consistently produce high-quality output.',
    domains: ['prompt_engineering', 'output_control'],
    color: '#4f6ef7',
    recommendedPath: '/run?domain=prompt_engineering',
  },
  {
    id: 'system_design',
    label: 'System Design',
    description: 'Designing system instructions, personas, and role-based AI behavior.',
    domains: ['system_prompts', 'role_prompting'],
    color: '#8b5cf6',
    recommendedPath: '/run?domain=system_prompts',
  },
  {
    id: 'reasoning',
    label: 'Reasoning & Context',
    description: 'Chain-of-thought prompting, document handling, and multi-source synthesis.',
    domains: ['reasoning_chains', 'context_management'],
    color: '#10b981',
    recommendedPath: '/run?domain=reasoning_chains',
  },
  {
    id: 'workflows',
    label: 'Workflows & Automation',
    description: 'Multi-step AI pipelines, automation architecture, and workflow orchestration.',
    domains: ['ai_workflows', 'workflow_automation'],
    color: '#f59e0b',
    recommendedPath: '/run?domain=ai_workflows',
  },
  {
    id: 'professional',
    label: 'Professional & Scale',
    description: 'Evaluating AI output, tool selection, multi-agent systems, and responsible deployment.',
    domains: ['ai_evaluation', 'data_extraction', 'tool_ecosystem', 'multi_agent_systems', 'professional_ethics'],
    color: '#ef4444',
    recommendedPath: '/run?domain=ai_evaluation',
  },
];

// ─── Scenario Questions (Phase 1) ────────────────────────────────────────────
export interface ScenarioQuestion {
  id: string;
  domains: DrillDomain[];
  question: string;
  context?: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
}

export const SCENARIO_QUESTIONS: ScenarioQuestion[] = [
  {
    id: 'sq_01',
    domains: ['prompt_engineering'],
    question: 'Your AI outputs are technically correct but consistently miss the specific tone and nuance you need. Which single change will have the highest impact?',
    options: [
      { id: 'a', text: 'Add explicit constraints listing what the output should avoid and what to prioritize' },
      { id: 'b', text: 'Provide 2\u20133 annotated examples showing exactly what "good" looks like for this case' },
      { id: 'c', text: 'Decompose the request into smaller, more focused sub-tasks with separate prompts' },
      { id: 'd', text: 'Rewrite your instructions using more precise, domain-specific vocabulary throughout' },
    ],
    correctId: 'b',
    explanation: 'Few-shot examples with annotations are the highest-leverage technique for nuance and tone. Constraints, decomposition, and vocabulary precision all help but address different problems.',
  },
  {
    id: 'sq_02',
    domains: ['system_prompts'],
    question: 'You\'re writing a system prompt for a financial advice chatbot going to production. Which element is most critical for deployment safety?',
    options: [
      { id: 'a', text: 'A comprehensive knowledge base covering financial terms and common investment strategies' },
      { id: 'b', text: 'A professional personality with empathetic, confidence-building response patterns' },
      { id: 'c', text: 'Explicit scope boundaries defining which topics it can and cannot address at all' },
      { id: 'd', text: 'Real-time data integration so responses reflect current market conditions accurately' },
    ],
    correctId: 'c',
    explanation: 'Without scope boundaries, the bot can confidently give advice outside its competence \u2014 a liability risk. Knowledge, tone, and data freshness matter but assume the bot already knows what it should and shouldn\'t discuss.',
  },
  {
    id: 'sq_03',
    domains: ['reasoning_chains'],
    question: 'An AI consistently makes errors on problems that require three or more logical steps. Which prompting change is most likely to fix this?',
    options: [
      { id: 'a', text: 'Expand the context window by summarizing earlier conversation history more aggressively' },
      { id: 'b', text: 'Provide the expected answer format so the model targets the correct output structure' },
      { id: 'c', text: 'Add a self-verification step asking the model to review and correct its own answer' },
      { id: 'd', text: 'Require the model to output each intermediate reasoning step before the final answer' },
    ],
    correctId: 'd',
    explanation: 'Chain-of-thought prompting \u2014 forcing explicit intermediate steps \u2014 is the strongest technique for multi-step reasoning. Self-verification helps but is unreliable without the reasoning trace.',
  },
  {
    id: 'sq_04',
    domains: ['output_control'],
    question: 'You need the AI to generate data in a strict JSON schema, but it keeps adding extra fields and conversational text around the output. Best fix?',
    options: [
      { id: 'a', text: 'Provide the schema definition with a valid example and a strict "output only this JSON" instruction' },
      { id: 'b', text: 'Build a validation layer that parses the output, checks schema compliance, and retries on failure' },
      { id: 'c', text: 'Define the AI\'s role as a "JSON API endpoint" in the system prompt with no chat mode allowed' },
      { id: 'd', text: 'Reduce temperature to near-zero and append a format reminder at the end of every prompt' },
    ],
    correctId: 'a',
    explanation: 'Schema + example + strict instruction addresses the root cause directly. Validation layers, role framing, and temperature tweaks are workarounds that add complexity without fixing the prompt itself.',
  },
  {
    id: 'sq_05',
    domains: ['ai_workflows', 'workflow_automation'],
    question: 'You\'re building an AI pipeline to process customer feedback: categorize, extract themes, then generate a report. What\'s the most important design decision?',
    options: [
      { id: 'a', text: 'Selecting the highest-capability model available for each individual processing stage' },
      { id: 'b', text: 'Running all three stages in parallel to minimize total end-to-end processing time' },
      { id: 'c', text: 'Defining strict input/output contracts between stages so failures are isolated and debuggable' },
      { id: 'd', text: 'Using one model across every stage to keep interpretation and terminology fully consistent' },
    ],
    correctId: 'c',
    explanation: 'Stage contracts are the foundation of reliable pipelines \u2014 they make failures visible and stages independently testable. Model choice, parallelism, and consistency are secondary to structural soundness.',
  },
  {
    id: 'sq_06',
    domains: ['context_management'],
    question: 'You need to analyze a 200-page legal document that exceeds the model\'s context limit. Which strategy preserves the most critical information?',
    options: [
      { id: 'a', text: 'Summarize the full document progressively, then run your queries against the condensed version' },
      { id: 'b', text: 'Index key sections by topic using embeddings, then retrieve only relevant chunks per query' },
      { id: 'c', text: 'Split into equal-sized chunks and process each independently with the same analysis prompt' },
      { id: 'd', text: 'Extract the first and last 20% of the document, which typically contain key terms and conclusions' },
    ],
    correctId: 'b',
    explanation: 'Retrieval-based chunking preserves detail on demand. Progressive summarization loses nuance, equal splitting ignores document structure, and first/last sampling misses the body.',
  },
  {
    id: 'sq_07',
    domains: ['role_prompting', 'system_prompts'],
    question: 'You\'re designing an AI persona to explain complex medical topics at a patient-accessible reading level. Which element matters most for output quality?',
    options: [
      { id: 'a', text: 'Specifying the target reading level, preferred analogy style, and vocabulary constraints' },
      { id: 'b', text: 'Listing specific credentials, specializations, and years of clinical experience' },
      { id: 'c', text: 'Including a reference database of medical terms with patient-friendly definitions' },
      { id: 'd', text: 'Constraining response length and requiring section headers for scannable formatting' },
    ],
    correctId: 'a',
    explanation: 'Operational constraints on how the persona communicates (reading level, analogy style, vocabulary) drive output quality far more than backstory, reference data, or formatting rules.',
  },
  {
    id: 'sq_08',
    domains: ['data_extraction', 'output_control'],
    question: 'You\'re extracting structured data from 500 invoices. Accuracy on the first 50 is 92%, but you need 99%+. Most effective improvement?',
    options: [
      { id: 'a', text: 'Upgrade to a more advanced model with stronger document comprehension capabilities' },
      { id: 'b', text: 'Expand your few-shot examples from 2 to 8, specifically targeting the known edge cases' },
      { id: 'c', text: 'Pre-process the documents to standardize formatting before running the extraction step' },
      { id: 'd', text: 'Add field-level validation rules and flag any extractions that fall outside expected ranges' },
    ],
    correctId: 'd',
    explanation: 'At scale, validation and flagging catch the errors that better prompting alone can\'t eliminate. Model upgrades, more examples, and pre-processing all help but can\'t guarantee 99%+ without a verification layer.',
  },
  {
    id: 'sq_09',
    domains: ['ai_evaluation', 'professional_ethics'],
    question: 'You need to evaluate whether an AI-generated research summary is factually accurate. Which method is most reliable?',
    options: [
      { id: 'a', text: 'Ask a second, independent AI model to fact-check the claims and flag any inconsistencies' },
      { id: 'b', text: 'Check whether each key claim includes specific citations with verifiable publication details' },
      { id: 'c', text: 'Compare each claim in the summary directly against the original source documents provided' },
      { id: 'd', text: 'Evaluate the confidence level of the language \u2014 hedged statements are more likely accurate' },
    ],
    correctId: 'c',
    explanation: 'Source comparison is the gold standard for verification. AI cross-checking inherits hallucination risk, citation presence doesn\'t equal accuracy, and language confidence doesn\'t correlate with truthfulness.',
  },
  {
    id: 'sq_10',
    domains: ['workflow_automation', 'ai_workflows'],
    question: 'You\'re automating a content review workflow where AI classifies submissions, flags issues, and notifies reviewers. What should you build first?',
    options: [
      { id: 'a', text: 'The error handling and human escalation path for low-confidence classification decisions' },
      { id: 'b', text: 'The AI classification prompt with comprehensive, well-tested category definitions' },
      { id: 'c', text: 'A monitoring dashboard to track classification accuracy and detect model drift over time' },
      { id: 'd', text: 'An A/B test framework comparing AI classification against the current manual process' },
    ],
    correctId: 'a',
    explanation: 'Error handling and escalation are the safety net you build before the happy path. A great classifier with no fallback will silently fail \u2014 a mediocre classifier with good escalation is safe to iterate on.',
  },
  {
    id: 'sq_11',
    domains: ['tool_ecosystem', 'multi_agent_systems'],
    question: 'A task requires analyzing a spreadsheet, generating a chart, and writing a narrative summary from the data. Which approach is most practical?',
    options: [
      { id: 'a', text: 'Chain three specialized prompts: one for data analysis, one for chart specifications, one for narrative' },
      { id: 'b', text: 'Use a single powerful model with the spreadsheet as text and detailed multi-step instructions' },
      { id: 'c', text: 'Build a multi-agent system where analyst, designer, and writer agents collaborate on the task' },
      { id: 'd', text: 'Use a code-interpreter-enabled AI that can execute data analysis and generate visualizations natively' },
    ],
    correctId: 'd',
    explanation: 'Code interpreter handles data + visualization natively with actual execution \u2014 the simplest reliable approach. Chaining adds overhead, pasting as text loses structure, and multi-agent is over-engineered here.',
  },
  {
    id: 'sq_12',
    domains: ['professional_ethics', 'ai_evaluation'],
    question: 'Your AI hiring tool shows 95% overall accuracy in testing, but your team notices it performs differently across demographic groups. Correct next step?',
    options: [
      { id: 'a', text: 'Deploy with a mandatory disclaimer that all AI recommendations must be reviewed by a human' },
      { id: 'b', text: 'Retrain the model on a more balanced and representative dataset to reduce bias across groups' },
      { id: 'c', text: 'Run a stratified evaluation across each demographic group before making any deployment decision' },
      { id: 'd', text: 'Document the known performance gaps and present the tradeoffs to stakeholders for their decision' },
    ],
    correctId: 'c',
    explanation: 'You must measure the problem precisely before you can fix it. Deploying with disclaimers, retraining without data, or documenting without analysis are all premature without stratified evaluation.',
  },
];

// ─── Spot & Fix Exercises (Phase 2) ──────────────────────────────────────────
export interface SpotFixExercise {
  id: string;
  domains: DrillDomain[];
  title: string;
  setup: string;
  artifact: string;
  artifactLabel: string;
  question: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
}

export const SPOT_FIX_EXERCISES: SpotFixExercise[] = [
  {
    id: 'sf_01',
    domains: ['prompt_engineering', 'output_control'],
    title: 'The Unfocused Blog Post',
    setup: 'A content marketer sent this prompt and received a 2,000-word unfocused essay covering everything about machine learning with no clear angle or structure.',
    artifact: 'Write me a blog post about machine learning.',
    artifactLabel: 'The Prompt',
    question: 'What is the PRIMARY flaw causing the poor output?',
    options: [
      { id: 'a', text: 'The prompt lacks a defined structure, section format, and target word count' },
      { id: 'b', text: 'The prompt provides no audience, angle, or success criteria to constrain the response' },
      { id: 'c', text: 'The prompt should include example blog posts for the AI to reference and pattern-match' },
      { id: 'd', text: 'The prompt needs a specific tone instruction like "professional" or "conversational"' },
    ],
    correctId: 'b',
    explanation: 'Audience, angle, and success criteria are the root constraints \u2014 without them, format, examples, and tone choices are arbitrary. Structure and tone only help once you know what the post is trying to achieve.',
  },
  {
    id: 'sf_02',
    domains: ['system_prompts', 'professional_ethics'],
    title: 'The Risky Medical Bot',
    setup: 'A startup deployed this system prompt for their health Q&A chatbot. Users are asking it about medications, dosages, and symptoms.',
    artifact: 'You are a helpful medical assistant. Answer all health questions accurately and thoroughly. Be warm and reassuring.',
    artifactLabel: 'The System Prompt',
    question: 'What critical element is MISSING from this system prompt?',
    options: [
      { id: 'a', text: 'A structured response template with sections for symptoms, causes, and recommended next steps' },
      { id: 'b', text: 'Scope boundaries, medical disclaimers, and escalation rules for serious or emergency symptoms' },
      { id: 'c', text: 'A knowledge-cutoff disclaimer noting that medical information may be outdated or incomplete' },
      { id: 'd', text: 'Instructions to always ask clarifying questions before providing any health-related guidance' },
    ],
    correctId: 'b',
    explanation: 'Without scope boundaries, disclaimers, and escalation rules, the bot will confidently answer questions it shouldn\'t \u2014 a serious liability. Response format, knowledge disclaimers, and clarifying questions all improve quality but don\'t address the safety gap.',
  },
  {
    id: 'sf_03',
    domains: ['reasoning_chains', 'context_management'],
    title: 'The Missing Context',
    setup: 'A business analyst sent this prompt and was surprised when the AI gave a generic, caveat-heavy response that could apply to any company.',
    artifact: 'Based on our Q3 financials, should we expand into the European market? Give me a clear recommendation.',
    artifactLabel: 'The Prompt',
    question: 'Why did this prompt produce a useless response?',
    options: [
      { id: 'a', text: 'The decision criteria and risk tolerance haven\'t been defined for the expansion analysis' },
      { id: 'b', text: 'The actual Q3 financial data wasn\'t included \u2014 the AI has no numbers to reason from' },
      { id: 'c', text: 'The prompt combines analysis and recommendation, which should be handled in separate steps' },
      { id: 'd', text: 'The European market context needs specific countries and regulatory details to be useful' },
    ],
    correctId: 'b',
    explanation: 'The prompt references "our Q3 financials" but never provides them. Without actual data in context, no amount of criteria, decomposition, or market specificity can produce a real recommendation.',
  },
];

// ─── Confidence Calibration (Phase 4) ────────────────────────────────────────
export interface ConfidenceItem {
  id: string;
  clusterIds: string[];
  statement: string;
  domains: DrillDomain[];
}

export const CONFIDENCE_ITEMS: ConfidenceItem[] = [
  {
    id: 'conf_1',
    clusterIds: ['prompt_craft'],
    statement: 'I can write prompts that consistently produce the exact output I want',
    domains: ['prompt_engineering', 'output_control'],
  },
  {
    id: 'conf_2',
    clusterIds: ['system_design'],
    statement: 'I can design system instructions and AI personas for production use',
    domains: ['system_prompts', 'role_prompting'],
  },
  {
    id: 'conf_3',
    clusterIds: ['reasoning'],
    statement: 'I can handle complex documents and force AI to reason step-by-step',
    domains: ['reasoning_chains', 'context_management'],
  },
  {
    id: 'conf_4',
    clusterIds: ['workflows'],
    statement: 'I can build multi-step AI pipelines and automated workflows',
    domains: ['ai_workflows', 'workflow_automation'],
  },
  {
    id: 'conf_5',
    clusterIds: ['professional'],
    statement: 'I can evaluate AI output for errors, select the right tools, and deploy AI responsibly',
    domains: ['ai_evaluation', 'data_extraction', 'tool_ecosystem', 'multi_agent_systems', 'professional_ethics'],
  },
];

// ─── Scoring Helpers ─────────────────────────────────────────────────────────

export type DomainScores = Partial<Record<DrillDomain, { correct: number; total: number }>>;

export function computeClusterScores(
  domainScores: DomainScores,
): { clusterId: string; score: number; label: string; color: string }[] {
  return DOMAIN_CLUSTERS.map(cluster => {
    let totalCorrect = 0;
    let totalQuestions = 0;
    for (const domain of cluster.domains) {
      const ds = domainScores[domain];
      if (ds) {
        totalCorrect += ds.correct;
        totalQuestions += ds.total;
      }
    }
    const score = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    return { clusterId: cluster.id, score, label: cluster.label, color: cluster.color };
  });
}

export function getWeakestCluster(
  domainScores: DomainScores,
): DomainCluster {
  const clusterScores = computeClusterScores(domainScores);
  const weakest = clusterScores.reduce((min, c) => c.score < min.score ? c : min, clusterScores[0]);
  return DOMAIN_CLUSTERS.find(c => c.id === weakest.clusterId) ?? DOMAIN_CLUSTERS[0];
}

export function getOverallScore(domainScores: DomainScores): number {
  let totalCorrect = 0;
  let totalQuestions = 0;
  for (const ds of Object.values(domainScores)) {
    if (ds) {
      totalCorrect += ds.correct;
      totalQuestions += ds.total;
    }
  }
  return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
}

export function operatorLevel(score: number) {
  if (score >= 85) return { label: 'Advanced', color: '#00d4ff' };
  if (score >= 65) return { label: 'Proficient', color: '#22c55e' };
  if (score >= 40) return { label: 'Developing', color: '#f59e0b' };
  return { label: 'Beginner', color: '#f97316' };
}

export function getRecommendedPath(domainScores: DomainScores): DomainCluster[] {
  const clusterScores = computeClusterScores(domainScores);
  const sorted = [...clusterScores].sort((a, b) => a.score - b.score);
  return sorted.map(cs => DOMAIN_CLUSTERS.find(c => c.id === cs.clusterId)!);
}

// ─── Per-Domain Scoring (individual domains, not clusters) ──────────────────

export interface DomainResult {
  domainId: DrillDomain;
  name: string;
  score: number; // 0-100 percentage
  correct: number;
  total: number;
  color: string;
  difficulty: 'foundational' | 'advanced' | 'expert';
}

const DOMAIN_META: Record<DrillDomain, { name: string; color: string; difficulty: 'foundational' | 'advanced' | 'expert'; order: number }> = {
  prompt_engineering:  { name: 'Prompt Engineering',          color: '#4f6ef7', difficulty: 'foundational', order: 1 },
  system_prompts:     { name: 'System Prompts',              color: '#8b5cf6', difficulty: 'foundational', order: 2 },
  reasoning_chains:   { name: 'Reasoning Chains',            color: '#10b981', difficulty: 'advanced',     order: 3 },
  output_control:     { name: 'Output Control',              color: '#f59e0b', difficulty: 'foundational', order: 4 },
  ai_workflows:       { name: 'AI Workflows',                color: '#f97316', difficulty: 'advanced',     order: 5 },
  context_management: { name: 'Context Management',          color: '#06b6d4', difficulty: 'advanced',     order: 6 },
  role_prompting:     { name: 'Role Prompting',              color: '#ec4899', difficulty: 'advanced',     order: 7 },
  data_extraction:    { name: 'Data Extraction',             color: '#84cc16', difficulty: 'advanced',     order: 8 },
  ai_evaluation:      { name: 'AI Evaluation',               color: '#ef4444', difficulty: 'advanced',     order: 9 },
  workflow_automation: { name: 'Workflow Automation',         color: '#f97316', difficulty: 'advanced',     order: 10 },
  tool_ecosystem:     { name: 'AI Tool Ecosystem',           color: '#3b82f6', difficulty: 'foundational', order: 11 },
  multi_agent_systems: { name: 'Multi-Agent Systems',        color: '#a855f7', difficulty: 'expert',       order: 12 },
  professional_ethics: { name: 'Professional Ethics & Risk', color: '#64748b', difficulty: 'advanced',     order: 13 },
};

export function computeIndividualDomainScores(
  domainScores: DomainScores,
): DomainResult[] {
  const allDomains = Object.keys(DOMAIN_META) as DrillDomain[];
  return allDomains.map(domainId => {
    const meta = DOMAIN_META[domainId];
    const ds = domainScores[domainId];
    const correct = ds?.correct ?? 0;
    const total = ds?.total ?? 0;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { domainId, name: meta.name, score, correct, total, color: meta.color, difficulty: meta.difficulty };
  }).sort((a, b) => DOMAIN_META[a.domainId].order - DOMAIN_META[b.domainId].order);
}

export function getRecommendedDomainPath(
  domainScores: DomainScores,
  overallScore: number,
): DomainResult[] {
  const results = computeIndividualDomainScores(domainScores);
  // Only include domains that were actually tested
  const tested = results.filter(r => r.total > 0);

  // Complete beginner: overall < 35% or no tested domains → start with Prompt Engineering
  if (overallScore < 35 || tested.length === 0) {
    const pe = results.find(r => r.domainId === 'prompt_engineering')!;
    const rest = results.filter(r => r.domainId !== 'prompt_engineering' && r.total > 0)
      .sort((a, b) => a.score - b.score);
    return [pe, ...rest];
  }

  // Otherwise: sort tested domains by score ascending (weakest first)
  return [...tested].sort((a, b) => a.score - b.score);
}
