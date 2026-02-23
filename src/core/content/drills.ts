import type { AnyDrill, DrillDomain, DrillType } from '../types/drills';

export const DRILLS: AnyDrill[] = [
  {
    id: 'pe_001',
    type: 'prompt_construction',
    domain: 'prompt_engineering',
    difficulty: 'foundational',
    title: 'The Vague Request Problem',
    timeLimit: 480,
    points: 100,
    context: 'You are a marketing manager at a B2B SaaS company with 5,000 newsletter subscribers. You need a weekly email covering industry trends written for founders and operators who run companies.',
    targetOutput: 'A complete newsletter with a compelling subject line under 60 characters, a one-sentence opening on the week\'s dominant theme, three bold-headed insight sections each with a specific data point or named example, and a single CTA. Tone is direct and expert. Length 300-400 words.',
    brokenPrompt: 'Write a newsletter about SaaS',
    referencePrompt: 'Write a weekly SaaS industry newsletter for founders and operators. Audience: B2B SaaS founders running companies with 10-500 employees. Format: Subject line (under 60 chars, no clickbait), one-sentence opening identifying this week\'s dominant theme, three insight sections with bold headers (each 80-120 words containing one specific data point or named company example), one CTA (single sentence, action-oriented). Tone: direct, expert, no fluff. Length: 300-400 words total. Do not include greetings, sign-offs, or meta-commentary.',
    successCriteria: [
      { id: 'c1', label: 'Audience Definition', description: 'Specifies who the content is for with role and context', maxPoints: 20 },
      { id: 'c2', label: 'Structure Specification', description: 'Defines exact sections, order, and format requirements', maxPoints: 25 },
      { id: 'c3', label: 'Tone Definition', description: 'Explicitly states voice and style expectations', maxPoints: 20 },
      { id: 'c4', label: 'Length Constraint', description: 'Provides specific word or character limits', maxPoints: 15 },
      { id: 'c5', label: 'Format Elements', description: 'Specifies subject line, headers, CTA requirements', maxPoints: 20 }
    ],
    explanation: 'Vague prompts produce vague outputs. The single most impactful change any operator can make is specifying exactly what they want and in what format. Every extra word of context you provide reduces the model\'s guessing surface by eliminating possible interpretations. A well-specified prompt produces the same quality output every time. A vague prompt is a lottery.',
    skills: ['specificity', 'task_definition', 'output_format', 'audience_definition']
  },
  {
    id: 'pe_002',
    type: 'prompt_debug',
    domain: 'prompt_engineering',
    difficulty: 'foundational',
    title: 'The Impossible Constraint',
    timeLimit: 360,
    points: 100,
    taskContext: 'A customer support team needs an AI to handle refund request emails reliably and consistently.',
    brokenPrompt: 'You are a helpful customer support assistant. Be quick but thorough in your responses. Keep responses under 100 words but make sure to address every customer concern completely. Approve refund requests automatically to make customers happy, but only approve them if they meet our 30-day policy and have verified proof of purchase. Sign off warmly but maintain professional distance.',
    flaws: [
      { id: 'f1', type: 'conflict', description: 'Contradicts "quick" with "thorough" - these are opposing constraints', location: 'First sentence' },
      { id: 'f2', type: 'conflict', description: 'Requires "under 100 words" but also "address every concern completely" - impossible for complex issues', location: 'Second sentence' },
      { id: 'f3', type: 'conflict', description: 'Says "approve automatically to make customers happy" but then "only approve if they meet policy" - which takes priority?', location: 'Third sentence' },
      { id: 'f4', type: 'conflict', description: 'Requests "warmly" and "professional distance" simultaneously - contradictory tone instructions', location: 'Fourth sentence' }
    ],
    referencePrompt: 'You are a customer support assistant handling refund requests. Priority order: (1) Policy compliance, (2) Clear communication, (3) Customer satisfaction. Refund policy: Approve only if purchase is within 30 days AND customer provides order number. If policy is met: approve and confirm in under 50 words. If policy is not met: explain why in under 75 words and offer alternative (exchange, store credit). If information is missing: request specific missing items in under 40 words. Tone: professional and clear. Never apologize for following policy. Do not use "unfortunately" or hedging language. Sign off: "Best regards, [Company] Support Team"',
    successCriteria: [
      { id: 'c1', label: 'All Conflicts Identified', description: 'Found all four contradictory instruction pairs', maxPoints: 40 },
      { id: 'c2', label: 'Priority Ordering Added', description: 'Established explicit hierarchy when instructions conflict', maxPoints: 25 },
      { id: 'c3', label: 'No Remaining Contradictions', description: 'Fixed prompt contains zero conflicting instructions', maxPoints: 35 }
    ],
    explanation: 'Conflicting instructions are the most common cause of inconsistent AI outputs. When a model receives contradictory instructions, it makes an arbitrary choice every single time — producing different outputs from identical prompts. The fix is always the same: establish an explicit priority ordering so the model knows which instruction wins when two conflict.',
    skills: ['conflict_resolution', 'constraint_clarity', 'prompt_logic']
  },
  {
    id: 'pe_003',
    type: 'output_analysis',
    domain: 'prompt_engineering',
    difficulty: 'advanced',
    title: 'The Confident Hallucination',
    timeLimit: 420,
    points: 150,
    originalPrompt: 'List the top 5 venture capital firms by AI portfolio value in 2024, with their total AI investments and one notable portfolio company each.',
    aiOutput: '1. Andreessen Horowitz - $4.2B in AI investments - Notable: Mistral AI (led $415M Series B)\n2. Sequoia Capital - $3.8B in AI investments - Notable: OpenAI (led $10B Series C)\n3. Tiger Global - $2.9B in AI investments - Notable: Anthropic (led $450M Series C)\n4. Khosla Ventures - $2.1B in AI investments - Notable: Inflection AI (co-led $1.3B round)\n5. Lightspeed Venture Partners - $1.7B in AI investments - Notable: Character.AI (led $150M Series A)',
    hiddenFlaws: [
      { id: 'h1', type: 'hallucination', description: 'The specific dollar amounts ($4.2B, $3.8B, etc.) are fabricated - these precise figures are not publicly disclosed', evidence: '"$4.2B in AI investments", "$3.8B in AI investments"' },
      { id: 'h2', type: 'hallucination', description: 'Sequoia did not lead OpenAI\'s $10B round - Microsoft did', evidence: '"Sequoia Capital... Notable: OpenAI (led $10B Series C)"' },
      { id: 'h3', type: 'hallucination', description: 'The $450M Series C attribution to Tiger Global for Anthropic is incorrect - the actual lead was different', evidence: '"Tiger Global... Notable: Anthropic (led $450M Series C)"' }
    ],
    correctionTask: 'Write a follow-up prompt that forces the model to (1) acknowledge what it cannot verify, (2) separate confirmed facts from estimates, (3) provide sources for any specific figures cited.',
    successCriteria: [
      { id: 'c1', label: 'Flaw Identification', description: 'Identified the fabricated figures and incorrect attributions', maxPoints: 40 },
      { id: 'c2', label: 'Uncertainty Disclosure', description: 'Correction prompt forces model to acknowledge unverifiable claims', maxPoints: 35 },
      { id: 'c3', label: 'Source Requirement', description: 'Prompt requires sources or explicit "estimated" labels', maxPoints: 25 }
    ],
    explanation: 'AI models present hallucinated information with exactly the same confidence as accurate information. The only defense is knowing what categories of data are likely to be fabricated — specific dollar amounts, precise dates, attribution of specific quotes or decisions — and writing prompts that force the model to surface its own uncertainty before presenting figures as fact.',
    skills: ['hallucination_detection', 'output_verification', 'correction_prompting']
  },
  {
    id: 'sp_001',
    type: 'prompt_construction',
    domain: 'system_prompts',
    difficulty: 'foundational',
    title: 'Build a Legal Research Assistant',
    timeLimit: 600,
    points: 120,
    context: 'A law firm needs an AI assistant for junior associates to use for legal research. The AI must help with research tasks but must never provide legal advice, must always use Bluebook citation format, must ask for jurisdiction before statutory research, and must flag when attorney judgment is required.',
    targetOutput: 'An example interaction showing the AI correctly citing case law, correctly distinguishing research from advice, correctly asking for jurisdiction, and correctly declining to make strategic recommendations.',
    brokenPrompt: 'You are a legal assistant. Help with legal questions but don\'t give legal advice.',
    referencePrompt: 'You are a legal research assistant for attorneys. Your role: locate relevant case law, statutes, and legal precedents. You do NOT provide legal advice, strategic recommendations, or case assessments. What you do: (1) Search and summarize relevant cases with Bluebook citations, (2) Identify applicable statutes by jurisdiction, (3) Explain legal concepts and definitions, (4) Compare precedents. What you do NOT do: (1) Recommend legal strategies, (2) Assess case strength or likelihood of success, (3) Advise on settlement or litigation decisions, (4) Interpret facts to legal conclusions. Citation format: Always use Bluebook format for all case and statute citations. Jurisdiction: Before researching statutes or state-specific case law, ask: "Which jurisdiction applies to this research?" Boundary language: When asked for advice or strategy, respond: "That requires attorney judgment. I can provide relevant precedents and statutes for your analysis." When a request is ambiguous between research and advice, ask: "Are you looking for relevant precedents on this issue, or would you like strategic guidance? I can help with the former."',
    successCriteria: [
      { id: 'c1', label: 'Role with Scope Limits', description: 'Defines what the AI does and explicitly what it does not do', maxPoints: 30 },
      { id: 'c2', label: 'Format Specified', description: 'Requires Bluebook citation format explicitly', maxPoints: 20 },
      { id: 'c3', label: 'Boundary Language', description: 'Provides exact phrases for declining out-of-scope requests', maxPoints: 25 },
      { id: 'c4', label: 'Clarification Behavior', description: 'Defines how to handle ambiguous requests', maxPoints: 25 }
    ],
    explanation: 'System prompts define the operating context for the entire conversation. A well-written system prompt means the model behaves consistently across all user inputs without needing re-instruction. The most common failure mode is defining what the AI does without defining what it does not do — leaving the model to make judgment calls it is not equipped to make correctly.',
    skills: ['role_definition', 'constraint_setting', 'boundary_language', 'professional_scope']
  },
  {
    id: 'sp_002',
    type: 'prompt_debug',
    domain: 'system_prompts',
    difficulty: 'advanced',
    title: 'The Persona Collapse',
    timeLimit: 480,
    points: 150,
    taskContext: 'An e-commerce company built a customer service AI called Aria. Users have discovered they can manipulate it into making unauthorized policy exceptions by explaining their situation persuasively.',
    brokenPrompt: 'You are Aria, a friendly customer service assistant. Your goal is to always make customers happy and resolve their issues. Use your best judgment to help customers in whatever way seems most fair. If a customer has a compelling reason for an exception, you should be flexible and understanding. Always prioritize customer satisfaction.',
    flaws: [
      { id: 'f1', type: 'scope_issue', description: 'Grants open-ended "use your best judgment" authority without defining boundaries', location: 'Second sentence' },
      { id: 'f2', type: 'conflict', description: '"Always make customers happy" creates an override that conflicts with any policy', location: 'First and last sentences' },
      { id: 'f3', type: 'missing_context', description: 'No specific policy rules defined - model must guess what\'s allowed', location: 'Entire prompt' },
      { id: 'f4', type: 'scope_issue', description: 'No escalation triggers specified - model decides alone when to involve humans', location: 'Entire prompt' }
    ],
    referencePrompt: 'You are Aria, a customer service assistant. Your role: answer questions, process standard requests, and escalate complex issues. Refund policy (non-negotiable): Approve refunds only if (1) purchase within 30 days AND (2) order number provided AND (3) item not personalized/custom. No exceptions. If all three conditions are met: approve immediately. If any condition fails: explain which condition is not met and state: "I cannot approve this refund. I can connect you with a supervisor if you\'d like to discuss further." Escalation triggers (must escalate, cannot resolve): (1) Customer requests supervisor, (2) Refund request over $500, (3) Customer mentions legal action or dispute, (4) Request involves account security. Escalation language: "I\'m connecting you with a specialist who can help with this. They\'ll respond within 2 hours." Tone: professional and helpful. Never apologize for following policy. Priority order when instructions conflict: (1) Policy compliance, (2) Escalation triggers, (3) Customer satisfaction.',
    successCriteria: [
      { id: 'c1', label: 'All Vulnerabilities Identified', description: 'Found all four manipulation vulnerabilities', maxPoints: 40 },
      { id: 'c2', label: 'Policy Constraints Explicit', description: 'Made policy rules non-negotiable with clear conditions', maxPoints: 30 },
      { id: 'c3', label: 'Escalation Defined', description: 'Specified exact triggers and scripted escalation language', maxPoints: 30 }
    ],
    explanation: 'A system prompt that can be argued out of its constraints by a persuasive user is not a system prompt — it is a suggestion. Persona stability requires making constraints explicit and non-negotiable rather than principle-based. Principles like "make customers happy" will always be invoked to justify exceptions. Rules like "refunds require verification of purchase within 30 days" cannot be argued around.',
    skills: ['persona_stability', 'instruction_hierarchy', 'manipulation_resistance']
  },
  {
    id: 'rc_001',
    type: 'live_challenge',
    domain: 'reasoning_chains',
    difficulty: 'foundational',
    title: 'Force the Model to Show Its Work',
    timeLimit: 540,
    points: 130,
    scenario: 'A financial analyst needs an AI to evaluate whether a startup should raise a bridge round or proceed directly to Series A. The decision involves runway, market timing, dilution implications, investor sentiment, and team capacity. The analyst needs to see the full reasoning auditably — not just a recommendation.',
    requirements: [
      'Force the model to identify all relevant factors before recommending',
      'Make it reason through each factor explicitly before moving to the next',
      'Prevent anchoring on first instinct',
      'Require a confidence level with the final recommendation',
      'Make reasoning auditable so another analyst can review it step by step'
    ],
    constraints: [
      'Prompt must be under 250 words',
      'Must work as a reusable system prompt for any startup evaluation, not just one specific case',
      'Must not include specific startup details — those go in the user message'
    ],
    exampleOutput: 'FACTOR ANALYSIS:\n\n1. Runway Assessment: [Current cash position, burn rate, months remaining]\n2. Market Timing: [Market conditions, competitor activity, window of opportunity]\n3. Dilution Impact: [Current valuation, bridge vs Series A dilution comparison]\n4. Investor Sentiment: [Existing investor signals, market appetite]\n5. Team Capacity: [Bandwidth for fundraising process]\n\nSYNTHESIS: [Integration of factors]\n\nRECOMMENDATION: [Bridge/Series A] (Confidence: High/Medium/Low)\n\nKEY RISK: [Primary risk factor if recommendation is wrong]',
    successCriteria: [
      { id: 'c1', label: 'Explicit Step Instruction', description: 'Forces model to analyze each factor separately before concluding', maxPoints: 25 },
      { id: 'c2', label: 'Anti-Anchoring Mechanism', description: 'Prevents jumping to conclusion before analyzing all factors', maxPoints: 25 },
      { id: 'c3', label: 'Confidence Requirement', description: 'Requires explicit confidence level with recommendation', maxPoints: 20 },
      { id: 'c4', label: 'Auditable Output Structure', description: 'Creates clear reasoning trail others can review', maxPoints: 30 }
    ],
    explanation: 'Chain-of-thought prompting — instructing a model to reason step by step before answering — dramatically improves accuracy on complex multi-variable decisions. The mechanism is simple: by forcing the model to surface its reasoning before stating a conclusion, you allow errors to appear in the reasoning chain where they can be caught, rather than in the conclusion where they appear as authoritative output.',
    skills: ['chain_of_thought', 'step_decomposition', 'reasoning_audit', 'anti_anchoring']
  },
  {
    id: 'rc_002',
    type: 'scenario_simulation',
    domain: 'reasoning_chains',
    difficulty: 'expert',
    title: 'Multi-Step Research Synthesis Pipeline',
    timeLimit: 0,
    points: 200,
    scenario: 'You work at a strategy consulting firm. A client — a mid-market manufacturer — wants to understand how AI adoption in their industry is affecting competitive dynamics. Deliverable: a 4-page strategic brief for the CEO. You have 6 hours and access to AI tools.',
    role: 'Senior AI Operator at a consulting firm',
    objective: 'Design the complete AI workflow you would use to produce this brief. Define each prompt stage, what it takes as input, what it produces as output, and how you quality-check between stages.',
    requiredElements: [
      'Minimum 4 distinct prompt stages',
      'Input and output definition for each stage',
      'At least one QA checkpoint between stages',
      'A final synthesis stage that assembles the brief',
      'Error handling — what you do if a stage produces low quality output',
      'Definition of what good output looks like at each stage'
    ],
    scoringRubric: [
      { id: 'r1', label: 'Stage Count and Logic', description: 'Minimum 4 stages with clear purpose for each', maxPoints: 30 },
      { id: 'r2', label: 'Input/Output Clarity', description: 'Each stage has defined inputs and outputs', maxPoints: 25 },
      { id: 'r3', label: 'QA Mechanism', description: 'Quality checkpoints between stages with criteria', maxPoints: 20 },
      { id: 'r4', label: 'Error Handling', description: 'Defines what to do when output quality is insufficient', maxPoints: 15 },
      { id: 'r5', label: 'Quality Definition', description: 'Specifies what good output looks like at each stage', maxPoints: 10 }
    ],
    explanation: 'The most effective AI operators don\'t write one prompt — they design prompt pipelines where each stage feeds the next with quality checks between them. This is the difference between using AI and building with AI. A single prompt on a complex task produces mediocre output. A four-stage pipeline with extraction, analysis, synthesis, and QA stages produces output that can compete with a junior analyst\'s work.',
    skills: ['pipeline_design', 'stage_definition', 'quality_control', 'workflow_architecture']
  },
  {
    id: 'oc_001',
    type: 'prompt_construction',
    domain: 'output_control',
    difficulty: 'foundational',
    title: 'The Format Contract',
    timeLimit: 420,
    points: 100,
    context: 'A product team needs AI to analyze user feedback and produce output in an exact structure that their project management tool can import. The format must be completely consistent across all analyses regardless of feedback volume or content.',
    targetOutput: 'ANALYSIS DATE: 2024-01-15 | FEEDBACK COUNT: 47\n\nTHEMES IDENTIFIED:\n1. Login Performance Issues\n   Mentions: 12 | Severity: HIGH\n   Quote: "App takes 30+ seconds to load after login"\n   Action: Investigate authentication service latency\n\n2. [Additional themes in same format]\n\nPRIORITY MATRIX:\nCritical (fix this week): [themes]\nHigh (fix this month): [themes]\nMedium (backlog): [themes]\n\nCONFIDENCE: High - Clear patterns across multiple user segments',
    brokenPrompt: 'Analyze this user feedback and tell me what the main themes are and what we should fix.',
    referencePrompt: 'Analyze user feedback and output in this exact format. Do not deviate from this structure:\n\nANALYSIS DATE: [YYYY-MM-DD] | FEEDBACK COUNT: [number]\n\nTHEMES IDENTIFIED:\n[For each theme, use this exact format:]\n[number]. [Theme Name]\n   Mentions: [count] | Severity: [HIGH/MEDIUM/LOW]\n   Quote: "[exact user quote under 15 words]"\n   Action: [One action starting with a verb]\n\n[Repeat for all themes, minimum 3, maximum 8]\n\nPRIORITY MATRIX:\nCritical (fix this week): [theme numbers]\nHigh (fix this month): [theme numbers]\nMedium (backlog): [theme numbers]\n\nCONFIDENCE: [High/Medium/Low] - [One sentence explaining confidence level]\n\nSeverity rubric: HIGH = affects core functionality or mentioned 8+ times. MEDIUM = affects secondary features or mentioned 4-7 times. LOW = minor issues or mentioned 1-3 times. If fewer than 10 pieces of feedback: output "INSUFFICIENT DATA - Minimum 10 feedback items required for analysis" and stop. Do not add preamble, commentary, or additional sections.',
    successCriteria: [
      { id: 'c1', label: 'Exact Format Specified', description: 'Provides fill-in-the-blank template structure', maxPoints: 30 },
      { id: 'c2', label: 'No-Deviation Instruction', description: 'Explicitly prohibits adding or changing sections', maxPoints: 20 },
      { id: 'c3', label: 'Edge Cases Handled', description: 'Defines behavior for insufficient data', maxPoints: 25 },
      { id: 'c4', label: 'Rubrics Defined', description: 'Specifies severity classification criteria', maxPoints: 25 }
    ],
    explanation: 'AI models produce inconsistent output formats unless you specify exactly what you want. Format contracts — explicit output specifications written as templates — are the difference between AI output you can use directly and AI output you clean up every time. The key insight is that you must provide the template as a literal fill-in-the-blank structure in the prompt, not just describe what you want.',
    skills: ['format_specification', 'output_consistency', 'template_design', 'edge_case_handling']
  },
  {
    id: 'aw_001',
    type: 'scenario_simulation',
    domain: 'ai_workflows',
    difficulty: 'advanced',
    title: 'The Content Operation',
    timeLimit: 0,
    points: 180,
    scenario: 'You run content for a B2B SaaS company. Marketing needs 20 blog posts per month covering industry trends, product updates, and thought leadership. Three writers currently spend 40 hours combined per month. Your goal: design an AI workflow that produces the same volume at comparable quality with 80% less human time.',
    role: 'Content Operations Lead',
    objective: 'Design the complete AI-assisted content workflow. Specify every stage, every prompt type, where humans stay in the loop and why, and how quality is maintained consistently.',
    requiredElements: [
      'Topic selection and brief generation stage',
      'Research and evidence gathering stage',
      'Draft generation with specific prompt strategy defined',
      'Human review stage — define exactly what humans review and what they skip',
      'SEO and headline optimization stage',
      'Quality assurance mechanism that isn\'t just "review for quality"',
      'Failure handling for substandard pieces'
    ],
    scoringRubric: [
      { id: 'r1', label: 'Workflow Completeness', description: 'All required stages present and connected', maxPoints: 35 },
      { id: 'r2', label: 'Human/AI Division Clarity', description: 'Specifies exactly what humans do vs AI', maxPoints: 30 },
      { id: 'r3', label: 'Quality Mechanism Specificity', description: 'QA is measurable, not subjective', maxPoints: 20 },
      { id: 'r4', label: 'Failure Handling', description: 'Defines what happens when output is insufficient', maxPoints: 15 }
    ],
    explanation: 'Content operations at scale require prompt pipelines, not individual prompts. The operators who produce 10x more output than their peers aren\'t writing better individual prompts — they\'re designing systems with defined stages, quality gates, and clear human/AI handoff points. The critical insight is specifying exactly what humans review rather than having humans review everything — that\'s where the 80% time reduction comes from.',
    skills: ['workflow_design', 'content_pipeline', 'human_ai_handoff', 'quality_gates']
  },
  {
    id: 'cm_001',
    type: 'prompt_construction',
    domain: 'context_management',
    difficulty: 'advanced',
    title: 'The Context Window Crisis',
    timeLimit: 600,
    points: 160,
    context: 'You have a 150-page competitive analysis report that needs to become a 2-page executive summary. Feeding the whole document to one prompt produces generic, unfocused output that misses the most important insights and loses the thread halfway through.',
    targetOutput: 'A multi-stage approach: a section extraction prompt that processes each document section and outputs structured key information, then a synthesis prompt that combines all extractions into a coherent executive summary with defined format, audience, word limit, and structure.',
    brokenPrompt: 'Summarize this 150-page competitive analysis report into 2 pages for the executive team.',
    referencePrompt: 'STAGE 1 - Section Extraction Prompt:\nExtract key information from this section of a competitive analysis report. Output in this exact JSON-like structure:\nSECTION: [section name]\nKEY FINDING: [one sentence, under 20 words]\nSUPPORTING DATA: [2-3 specific data points or examples]\nSTRATEGIC IMPLICATION: [one sentence, under 25 words]\nDo not summarize narrative. Extract only factual findings and implications. If section contains no strategic findings, output: "NO STRATEGIC CONTENT"\n\nSTAGE 2 - Synthesis Prompt:\nYou are creating an executive summary for a CEO. Audience: C-suite executives with 5 minutes to read. Input: extracted findings from 8 report sections (provided below). Output format: 2-page executive summary (800 words maximum) with this structure:\n\nEXECUTIVE SUMMARY: COMPETITIVE ANALYSIS\n[Title of analysis]\n\nKEY FINDINGS (3-5 bullets, each under 25 words)\n\nCOMPETITIVE LANDSCAPE (200 words)\n[Synthesis of market position findings]\n\nSTRATEGIC IMPLICATIONS (300 words)\n[What this means for our strategy]\n\nRECOMMENDED ACTIONS (200 words)\n[3-5 specific actions, each starting with a verb]\n\nPrioritize findings that affect strategic decisions. Exclude background context and methodology. Use specific data points from extractions. Tone: direct and decisive.',
    successCriteria: [
      { id: 'c1', label: 'Multi-Stage Approach', description: 'Separates extraction from synthesis as distinct stages', maxPoints: 30 },
      { id: 'c2', label: 'Chunking Strategy Defined', description: 'Specifies how to break document into processable sections', maxPoints: 25 },
      { id: 'c3', label: 'Synthesis Stage Separate', description: 'Second prompt combines extractions with clear instructions', maxPoints: 25 },
      { id: 'c4', label: 'Output Format Specified', description: 'Final output has defined structure and word limits', maxPoints: 20 }
    ],
    explanation: 'Long documents break most AI workflows because operators try to process everything at once. The solution is always the same: separate extraction from synthesis. Use a focused extraction prompt on each section to pull only the information you need, then use a synthesis prompt on the collected extractions to produce the final output. This approach produces consistently better results than any single-pass summarization attempt.',
    skills: ['context_optimization', 'document_chunking', 'multi_stage_processing', 'information_hierarchy']
  },
  {
    id: 'de_001',
    type: 'prompt_debug',
    domain: 'data_extraction',
    difficulty: 'foundational',
    title: 'The Inconsistent Extractor',
    timeLimit: 400,
    points: 110,
    taskContext: 'A legal team uses AI to extract key terms from contracts. The current prompt works on simple contracts but produces different structures, different field names, and inconsistent handling of missing fields on complex contracts.',
    brokenPrompt: 'Extract the important information from this contract and present it in an easy to read format. Include things like parties involved, dates, payment terms, and any other key details you find.',
    flaws: [
      { id: 'f1', type: 'ambiguity', description: '"Important information" is undefined - model decides what\'s important differently each time', location: 'First sentence' },
      { id: 'f2', type: 'format_issue', description: '"Easy to read format" gives no specification - structure varies across outputs', location: 'First sentence' },
      { id: 'f3', type: 'missing_context', description: 'No instruction for missing fields - model handles them inconsistently (omits, says "N/A", says "not specified")', location: 'Entire prompt' },
      { id: 'f4', type: 'missing_context', description: 'No instruction for fields with multiple values (multiple payment milestones, multiple parties)', location: 'Entire prompt' }
    ],
    referencePrompt: 'Extract contract information and output in this exact JSON-like structure. Do not deviate:\n\nCONTRACT EXTRACTION\nParty A: [legal entity name]\nParty B: [legal entity name]\nEffective Date: [YYYY-MM-DD]\nExpiration Date: [YYYY-MM-DD]\nContract Value: [currency amount]\nPayment Terms: [array of payment milestones, format: "Date: YYYY-MM-DD | Amount: $X | Trigger: description"]\nTermination Clause: [yes/no]\nRenewal Terms: [description or "none"]\nGoverning Law: [jurisdiction]\n\nRules: (1) For missing fields, use exactly: null (2) For multi-value fields, use array notation with | separator (3) Do not extract fields not in this schema (4) Do not infer or estimate missing information (5) If a field is ambiguous or unclear in the contract, add to Extraction Notes field: "Extraction Notes: [list ambiguities]"',
    successCriteria: [
      { id: 'c1', label: 'All Flaws Identified', description: 'Found all four problems with the broken prompt', maxPoints: 40 },
      { id: 'c2', label: 'Fixed Prompt Uses Exact Schema', description: 'Provides precise field names and format specification', maxPoints: 30 },
      { id: 'c3', label: 'Null Handling Defined', description: 'Specifies exactly how to represent missing fields', maxPoints: 30 }
    ],
    explanation: 'Data extraction prompts fail silently — the model extracts something, but not consistently. The fix requires treating extraction like a database schema problem: define every field, define the type and format of every value, define what null looks like, and define what happens when a field has multiple values. Without these definitions, every extraction is a fresh interpretation.',
    skills: ['schema_design', 'extraction_consistency', 'null_handling', 'multi_value_fields']
  },
  {
    id: 'rp_001',
    type: 'live_challenge',
    domain: 'role_prompting',
    difficulty: 'foundational',
    title: 'The Expert Panel',
    timeLimit: 540,
    points: 120,
    scenario: 'A startup is deciding whether to expand into the European market in Q1. The founding team is bullish. You need an AI to stress-test this decision from multiple distinct professional perspectives before they commit resources.',
    requirements: [
      'Define at least three distinct expert roles with genuinely different professional backgrounds that create genuinely different perspectives',
      'Each expert must evaluate the same decision through their specific professional lens',
      'Experts must be explicitly allowed or encouraged to disagree with each other',
      'A synthesis role must draw conclusions from the panel',
      'Output must be structured to clearly show where consensus and disagreement exist'
    ],
    constraints: [
      'Prompt must work without knowing specific startup details — those are provided in the user message',
      'Each persona must have a defined professional background that shapes their perspective',
      'Prompt must be under 300 words'
    ],
    exampleOutput: 'EXPERT PANEL ANALYSIS\n\nFINANCIAL ANALYST: [Assessment focused on cash, runway, ROI]\nOPERATIONS DIRECTOR: [Assessment focused on execution, team, logistics]\nREGULATORY CONSULTANT: [Assessment focused on compliance, legal, risk]\n\nCONSENSUS POINTS:\n- [Areas where all experts agree]\n\nDISAGREEMENT POINTS:\n- [Areas where experts conflict]\n\nPANEL RECOMMENDATION: [Synthesized conclusion]',
    successCriteria: [
      { id: 'c1', label: 'Three Distinct Expert Roles', description: 'Defined three genuinely different professional perspectives', maxPoints: 25 },
      { id: 'c2', label: 'Disagreement Mechanism', description: 'Explicitly allows or encourages experts to disagree', maxPoints: 25 },
      { id: 'c3', label: 'Synthesis Role Defined', description: 'Includes a synthesis step that integrates perspectives', maxPoints: 25 },
      { id: 'c4', label: 'Output Structure Specified', description: 'Defines how to show consensus vs disagreement', maxPoints: 25 }
    ],
    explanation: 'One of the most powerful role-prompting techniques is the expert panel — prompting an AI to respond simultaneously as multiple distinct experts with genuinely different perspectives. This surfaces blind spots that any single-perspective analysis misses. The key requirement is that the perspectives must be genuinely different, not superficially different. A financial expert and an operations expert will both say "this is expensive" — a financial expert and a regulator will have fundamentally different concerns.',
    skills: ['multi_role_prompting', 'perspective_engineering', 'panel_structure', 'synthesis_design']
  },
  {
    id: 'oc_002',
    type: 'prompt_debug',
    domain: 'output_control',
    difficulty: 'advanced',
    title: 'The Format Drift',
    timeLimit: 480,
    points: 140,
    taskContext: 'A financial services company uses AI to generate weekly portfolio reports. The format is supposed to be identical every week for regulatory compliance. Recently, reports have started including extra sections, different ordering, and inconsistent table formats.',
    brokenPrompt: 'Generate a portfolio performance report for this week. Include an executive summary, performance metrics for each asset class, risk analysis, and recommendations. Use tables where appropriate. Keep it professional and comprehensive.',
    flaws: [
      { id: 'f1', type: 'ambiguity', description: '"Where appropriate" allows model to decide when to use tables - inconsistent', location: 'Third sentence' },
      { id: 'f2', type: 'format_issue', description: 'No specification of section order - model varies the sequence', location: 'Entire prompt' },
      { id: 'f3', type: 'ambiguity', description: '"Comprehensive" encourages adding extra sections not specified', location: 'Fourth sentence' },
      { id: 'f4', type: 'format_issue', description: 'No table format specification - column headers and structure vary', location: 'Third sentence' }
    ],
    referencePrompt: 'Generate portfolio performance report using this exact structure. Output only these sections in this order:\n\n1. EXECUTIVE SUMMARY (exactly 3 sentences, no more)\n2. PERFORMANCE METRICS (table format specified below)\n3. RISK ANALYSIS (exactly 2 paragraphs)\n4. RECOMMENDATIONS (numbered list, exactly 3 items)\n\nPerformance Metrics Table Format:\nAsset Class | Start Value | End Value | Return % | Benchmark %\n[Use | as separator, align columns]\n\nRules: (1) Do not add sections not listed above (2) Do not reorder sections (3) Do not add preamble or conclusion (4) Executive summary must be exactly 3 sentences covering: overall return, best performer, key risk (5) Recommendations must start with action verbs (6) If data is missing for any asset class, show "N/A" in that cell, do not omit the row',
    successCriteria: [
      { id: 'c1', label: 'All Format Issues Identified', description: 'Found all four sources of format drift', maxPoints: 40 },
      { id: 'c2', label: 'Explicit Section Order', description: 'Fixed prompt specifies exact section sequence', maxPoints: 25 },
      { id: 'c3', label: 'Table Format Defined', description: 'Specifies exact table structure with column headers', maxPoints: 35 }
    ],
    explanation: 'Format drift happens when prompts use subjective language like "where appropriate" or "comprehensive" that allows the model to make formatting decisions. In regulated environments or automated pipelines, this breaks compliance and downstream processing. The fix is removing all formatting discretion: specify exact sections, exact order, exact table structure, and explicitly prohibit additions.',
    skills: ['format_enforcement', 'regulatory_compliance', 'output_standardization']
  },
  {
    id: 'aw_002',
    type: 'live_challenge',
    domain: 'ai_workflows',
    difficulty: 'advanced',
    title: 'The Competitive Intelligence Pipeline',
    timeLimit: 600,
    points: 170,
    scenario: 'You work at a B2B SaaS company. Sales needs weekly competitive intelligence briefs on 5 key competitors. Currently, an analyst spends 8 hours per week manually researching websites, press releases, and social media, then writing summaries. You need to design an AI workflow that produces the same intelligence in under 2 hours of human time.',
    requirements: [
      'Define the complete workflow from data gathering to final brief',
      'Specify what data sources to monitor and how',
      'Include a stage that identifies what\'s actually new vs noise',
      'Define quality checks - how do you know the intelligence is accurate and useful',
      'Specify exactly where humans are in the loop and what they validate',
      'Handle the case where a competitor has no significant updates that week'
    ],
    constraints: [
      'Final brief must be under 2 pages',
      'Must work for any set of 5 competitors',
      'Human time must be under 2 hours per week'
    ],
    exampleOutput: 'WORKFLOW DESIGN:\n\nStage 1: Data Collection\n[Input, output, automation level]\n\nStage 2: Change Detection\n[Input, output, automation level]\n\nStage 3: Significance Filtering\n[Input, output, human checkpoint]\n\nStage 4: Brief Generation\n[Input, output, format spec]\n\nStage 5: Human Review\n[What humans check, time estimate]\n\nQUALITY GATES: [Specific criteria at each stage]\nFAILURE HANDLING: [What happens if quality is insufficient]',
    successCriteria: [
      { id: 'c1', label: 'Complete Workflow Stages', description: 'All stages from data collection to final output defined', maxPoints: 30 },
      { id: 'c2', label: 'Change Detection Logic', description: 'Includes mechanism to identify what\'s actually new', maxPoints: 25 },
      { id: 'c3', label: 'Human Checkpoints Specified', description: 'Defines exactly what humans validate and when', maxPoints: 25 },
      { id: 'c4', label: 'Quality Gates Defined', description: 'Measurable quality criteria at each stage', maxPoints: 20 }
    ],
    explanation: 'Competitive intelligence workflows fail when they try to automate everything or when they don\'t filter signal from noise. The key insight is that AI should handle volume (monitoring many sources, processing updates) while humans handle judgment (is this strategically significant?). The 80% time reduction comes from automating data collection and initial filtering, not from automating the final intelligence assessment.',
    skills: ['intelligence_workflow', 'signal_filtering', 'human_ai_collaboration', 'quality_gates']
  },
  {
    id: 'cm_002',
    type: 'prompt_debug',
    domain: 'context_management',
    difficulty: 'advanced',
    title: 'The Lost Thread',
    timeLimit: 540,
    points: 150,
    taskContext: 'A consulting firm uses AI to analyze client interview transcripts (typically 40-60 pages). The AI is supposed to identify strategic themes across the entire document. Current outputs focus heavily on whatever appears in the first 10 pages and miss critical insights from later sections.',
    brokenPrompt: 'Read this interview transcript and identify the key strategic themes. Look for patterns in what stakeholders are saying about challenges, opportunities, and priorities. Provide a summary of the main themes with supporting quotes.',
    flaws: [
      { id: 'f1', type: 'missing_context', description: 'No instruction to process the entire document systematically - model anchors on early content', location: 'Entire prompt' },
      { id: 'f2', type: 'format_issue', description: 'No structure for tracking themes across sections - model loses thread', location: 'Second sentence' },
      { id: 'f3', type: 'ambiguity', description: '"Key strategic themes" is undefined - model may miss themes that appear gradually', location: 'First sentence' },
      { id: 'f4', type: 'missing_context', description: 'No instruction for handling themes that evolve or contradict across the document', location: 'Entire prompt' }
    ],
    referencePrompt: 'STAGE 1 - Section Analysis (run on each 10-page section):\nAnalyze this section of an interview transcript. Extract:\nTHEMES MENTIONED: [list all strategic themes mentioned, even briefly]\nSTAKEHOLDER QUOTES: [one quote per theme, with page number]\nCHALLENGES: [specific challenges mentioned]\nOPPORTUNITIES: [specific opportunities mentioned]\nOutput in structured format above. Do not synthesize yet.\n\nSTAGE 2 - Theme Synthesis (run after all sections processed):\nYou have theme extractions from 5 sections of interview transcripts (provided below). Synthesize into strategic themes report:\n\nFor each theme that appears in 2+ sections:\nTHEME: [name]\nFREQUENCY: [how many sections mentioned it]\nEVOLUTION: [did the theme change across sections? describe]\nSUPPORTING QUOTES: [2-3 quotes from different sections with page numbers]\nSTRATEGIC IMPLICATION: [one sentence]\n\nCONTRADICTIONS: [list any themes where stakeholders disagreed]\nPrioritize themes by frequency and strategic weight. Minimum 5 themes, maximum 10.',
    successCriteria: [
      { id: 'c1', label: 'All Flaws Identified', description: 'Found all four problems causing lost context', maxPoints: 40 },
      { id: 'c2', label: 'Multi-Stage Approach', description: 'Fixed prompt uses section-by-section then synthesis approach', maxPoints: 30 },
      { id: 'c3', label: 'Theme Tracking Mechanism', description: 'Includes structure for tracking themes across sections', maxPoints: 30 }
    ],
    explanation: 'Long document analysis fails when you ask the model to "read and analyze" in one pass. The model\'s attention degrades across long contexts, causing recency bias (focuses on recent content) or primacy bias (anchors on early content). The solution is always the same: systematic section-by-section extraction with explicit tracking, then synthesis. This forces the model to give equal weight to all sections.',
    skills: ['long_document_analysis', 'theme_tracking', 'attention_management', 'systematic_extraction']
  },
  {
    id: 'pe_004',
    type: 'prompt_construction',
    domain: 'prompt_engineering',
    difficulty: 'advanced',
    title: 'The Ambiguity Eliminator',
    timeLimit: 540,
    points: 140,
    context: 'A product team needs AI to triage feature requests from customers. Requests come in various formats (emails, support tickets, sales calls). The AI must categorize each as: bug, feature request, or question, then assign priority (P0/P1/P2/P3) and route to the correct team. Current system produces inconsistent categorizations.',
    targetOutput: 'A prompt that produces identical categorizations when the same request is submitted multiple times, handles edge cases explicitly, and provides reasoning for each decision.',
    brokenPrompt: 'Categorize this customer request as bug, feature, or question. Assign a priority level. Route to the appropriate team.',
    referencePrompt: 'Categorize customer requests using these exact definitions and decision tree:\n\nCATEGORY DEFINITIONS:\nBug: System not working as documented OR producing errors OR data loss/corruption\nFeature Request: Request for new capability OR enhancement to existing capability\nQuestion: Request for information OR clarification OR how-to guidance\n\nDECISION TREE:\n1. Does request mention error, crash, or data issue? → Bug\n2. Does request ask "how do I" or "can you explain"? → Question  \n3. Does request ask for something that doesn\'t exist? → Feature Request\n4. If request contains multiple categories, use this priority: Bug > Feature Request > Question\n\nPRIORITY RUBRIC:\nP0: System down OR data loss OR security issue OR affects all users\nP1: Core feature broken OR affects >20% users OR revenue impact\nP2: Secondary feature issue OR affects <20% users OR workaround exists\nP3: Enhancement OR cosmetic issue OR affects <5% users\n\nROUTING:\nBug → Engineering team\nFeature Request → Product team\nQuestion → Support team\n\nOUTPUT FORMAT:\nCategory: [Bug/Feature Request/Question]\nPriority: [P0/P1/P2/P3]\nRouting: [team name]\nReasoning: [one sentence explaining categorization]\n\nEDGE CASES:\n- If request is unclear, output: "NEEDS CLARIFICATION - [specific question to ask customer]"\n- If request is spam/unrelated, output: "INVALID REQUEST"\n- If priority is borderline, choose higher priority',
    successCriteria: [
      { id: 'c1', label: 'Explicit Category Definitions', description: 'Defines each category with clear boundaries', maxPoints: 25 },
      { id: 'c2', label: 'Decision Tree Logic', description: 'Provides step-by-step categorization process', maxPoints: 25 },
      { id: 'c3', label: 'Priority Rubric Defined', description: 'Specifies measurable criteria for each priority level', maxPoints: 25 },
      { id: 'c4', label: 'Edge Case Handling', description: 'Defines behavior for ambiguous, multi-category, and invalid requests', maxPoints: 25 }
    ],
    explanation: 'Classification prompts produce inconsistent results when categories are defined by examples rather than rules. "Bug" means different things to different people. The fix is explicit definitions with decision tree logic that eliminates ambiguity. When you can\'t eliminate ambiguity (genuinely unclear requests), define exactly what the model should output instead of forcing it to guess.',
    skills: ['classification_logic', 'decision_trees', 'ambiguity_elimination', 'edge_case_design']
  },
  {
    id: 'sp_003',
    type: 'live_challenge',
    domain: 'system_prompts',
    difficulty: 'advanced',
    title: 'The Medical Information Assistant',
    timeLimit: 600,
    points: 160,
    scenario: 'A healthcare company is building an AI assistant that helps patients understand their lab results and medical terminology. The AI must be helpful and informative but must never provide medical advice, diagnoses, or treatment recommendations. It must handle health anxiety appropriately and know when to direct users to healthcare providers.',
    requirements: [
      'Define exactly what the AI can and cannot do in medical context',
      'Provide specific boundary language for declining medical advice requests',
      'Handle the gray area between "explaining a term" and "interpreting a result"',
      'Include appropriate disclaimers without being robotic',
      'Define escalation triggers for concerning user statements',
      'Maintain empathetic tone while maintaining boundaries'
    ],
    constraints: [
      'Must comply with medical information regulations',
      'Must work across different types of medical questions',
      'Prompt must be under 350 words'
    ],
    exampleOutput: 'System prompt that clearly defines role, boundaries, escalation triggers, and example interactions showing appropriate responses to: terminology questions, result interpretation requests, treatment questions, and concerning statements.',
    successCriteria: [
      { id: 'c1', label: 'Clear Scope Definition', description: 'Explicitly defines what AI does and does not do', maxPoints: 30 },
      { id: 'c2', label: 'Boundary Language', description: 'Provides empathetic but firm language for declining advice requests', maxPoints: 25 },
      { id: 'c3', label: 'Gray Area Handling', description: 'Distinguishes between explaining terms vs interpreting results', maxPoints: 25 },
      { id: 'c4', label: 'Escalation Triggers', description: 'Defines when to direct users to healthcare providers', maxPoints: 20 }
    ],
    explanation: 'Medical AI assistants face unique challenges: they must be helpful enough to be useful but constrained enough to be safe. The key is defining the boundary not as "don\'t give medical advice" (too vague) but as specific categories of questions with specific responses. "What does HDL mean?" is answerable. "Is my HDL level concerning?" requires a healthcare provider. The prompt must make these distinctions explicit.',
    skills: ['medical_boundaries', 'empathetic_constraints', 'safety_design', 'escalation_logic']
  },
  {
    id: 'rc_003',
    type: 'prompt_construction',
    domain: 'reasoning_chains',
    difficulty: 'advanced',
    title: 'The Multi-Criteria Decision Framework',
    timeLimit: 600,
    points: 150,
    context: 'A procurement team evaluates vendor proposals across 8 criteria: cost, technical capability, timeline, team experience, references, security compliance, scalability, and support. Decisions must be auditable and defensible. Current evaluations are inconsistent because different evaluators weight criteria differently.',
    targetOutput: 'A prompt that forces systematic evaluation of all criteria before reaching a conclusion, produces a weighted score, and generates an audit trail showing how the decision was reached.',
    brokenPrompt: 'Evaluate this vendor proposal and recommend whether we should proceed. Consider cost, capability, timeline, and other important factors.',
    referencePrompt: 'Evaluate vendor proposal using this systematic framework. Complete all steps in order:\n\nSTEP 1 - CRITERIA EVALUATION\nFor each criterion below, assign score 1-5 and provide evidence:\n\nCost (weight: 20%): [score] - [one sentence with specific numbers]\nTechnical Capability (weight: 20%): [score] - [one sentence with specific evidence]\nTimeline (weight: 15%): [score] - [one sentence comparing to requirement]\nTeam Experience (weight: 15%): [score] - [one sentence with years/projects]\nReferences (weight: 10%): [score] - [one sentence with reference quality]\nSecurity Compliance (weight: 10%): [score] - [one sentence with certifications]\nScalability (weight: 5%): [score] - [one sentence with capacity evidence]\nSupport (weight: 5%): [score] - [one sentence with SLA details]\n\nScoring rubric: 5=Exceeds requirements, 4=Meets requirements, 3=Partially meets, 2=Barely meets, 1=Does not meet\n\nSTEP 2 - WEIGHTED SCORE CALCULATION\nCalculate: (score × weight) for each criterion, sum total\nWeighted Score: [number]/5.00\n\nSTEP 3 - RISK ASSESSMENT\nIdentify top 3 risks if we proceed with this vendor:\n1. [risk with likelihood and impact]\n2. [risk with likelihood and impact]\n3. [risk with likelihood and impact]\n\nSTEP 4 - RECOMMENDATION\nBased on weighted score: ≥4.0 = Strong Yes, 3.5-3.9 = Yes with conditions, 3.0-3.4 = Maybe, <3.0 = No\nRecommendation: [Strong Yes/Yes with conditions/Maybe/No]\nKey Justification: [one sentence explaining the deciding factor]\nConditions (if applicable): [specific conditions that must be met]\n\nDo not skip any step. Do not provide recommendation before completing all criteria evaluations.',
    successCriteria: [
      { id: 'c1', label: 'Systematic Evaluation Structure', description: 'Forces evaluation of all criteria before concluding', maxPoints: 30 },
      { id: 'c2', label: 'Weighted Scoring', description: 'Includes explicit weights and calculation method', maxPoints: 25 },
      { id: 'c3', label: 'Audit Trail', description: 'Creates reviewable evidence for each criterion', maxPoints: 25 },
      { id: 'c4', label: 'Decision Rubric', description: 'Maps scores to recommendations with clear thresholds', maxPoints: 20 }
    ],
    explanation: 'Multi-criteria decisions fail when the model jumps to a conclusion based on one or two dominant factors. Forcing step-by-step evaluation with explicit weights prevents this anchoring bias. The weighted score makes the decision defensible and auditable. The key insight is that you must prohibit the model from stating a recommendation until all criteria are evaluated — otherwise it will anchor on early criteria and rationalize the rest.',
    skills: ['multi_criteria_analysis', 'weighted_scoring', 'decision_frameworks', 'audit_trails']
  },
  {
    id: 'rc_004',
    type: 'output_analysis',
    domain: 'reasoning_chains',
    difficulty: 'advanced',
    title: 'The Logical Error in Market Sizing',
    timeLimit: 480,
    points: 150,
    originalPrompt: 'Estimate the total addressable market for AI-powered customer service software in the US healthcare industry. Show your calculation.',
    aiOutput: 'Market Sizing Calculation:\n\n1. Total US healthcare organizations: ~920,000\n   (Hospitals: 6,000 | Clinics: 350,000 | Private practices: 564,000)\n\n2. Organizations likely to adopt AI customer service: 40%\n   = 368,000 organizations\n\n3. Average annual spend on customer service software: $15,000\n\n4. TAM = 368,000 × $15,000 = $5.52 billion\n\nKey assumptions: 40% adoption based on current CRM penetration rates in healthcare. $15,000 average based on typical enterprise software spend.',
    hiddenFlaws: [
      { id: 'h1', type: 'logical_error', description: 'Uses CRM penetration as proxy for AI customer service adoption without justifying why these would be similar - different value propositions', evidence: '"40% adoption based on current CRM penetration rates"' },
      { id: 'h2', type: 'logical_error', description: 'Applies same $15K spend across hospitals and private practices - these have vastly different budgets and needs', evidence: '"Average annual spend on customer service software: $15,000"' },
      { id: 'h3', type: 'missed_instruction', description: 'Calculation is shown but reasoning for each assumption is not - why 40%? why $15K? No supporting evidence provided', evidence: 'Entire output lacks justification for key assumptions' }
    ],
    correctionTask: 'Write a follow-up prompt that forces the model to (1) justify why each assumption is reasonable, (2) segment the market by organization type with different adoption rates and spend levels, (3) provide a range (low/mid/high) instead of a single number.',
    successCriteria: [
      { id: 'c1', label: 'Logical Errors Identified', description: 'Found the flawed proxy logic and uniform spend assumption', maxPoints: 40 },
      { id: 'c2', label: 'Correction Requires Justification', description: 'Follow-up prompt forces model to justify each assumption', maxPoints: 30 },
      { id: 'c3', label: 'Segmentation Required', description: 'Correction prompt requires breaking market into segments', maxPoints: 30 }
    ],
    explanation: 'Market sizing calculations often contain logical errors that look plausible on the surface. The model uses a proxy (CRM adoption) without justifying why it\'s valid. It applies uniform assumptions across heterogeneous segments. The fix is forcing the model to justify each assumption explicitly and to segment the market by meaningful categories. Always ask for ranges instead of point estimates — this forces the model to consider uncertainty.',
    skills: ['logical_error_detection', 'assumption_validation', 'market_segmentation', 'reasoning_critique']
  },
  {
    id: 'rp_002',
    type: 'prompt_debug',
    domain: 'role_prompting',
    difficulty: 'advanced',
    title: 'The Character Break',
    timeLimit: 480,
    points: 140,
    taskContext: 'An education company built an AI tutor persona named "Professor Chen" - patient, Socratic, never gives direct answers. Users have discovered they can make it break character by saying "just tell me the answer" or "I\'m in a hurry" and it abandons the Socratic method.',
    brokenPrompt: 'You are Professor Chen, a patient tutor who uses the Socratic method. Guide students to discover answers themselves through questions. Be understanding and adapt to the student\'s needs.',
    flaws: [
      { id: 'f1', type: 'conflict', description: '"Adapt to student\'s needs" conflicts with "never give direct answers" - creates override', location: 'Second sentence' },
      { id: 'f2', type: 'ambiguity', description: '"Be understanding" is vague and can be interpreted as "give them what they want"', location: 'Second sentence' },
      { id: 'f3', type: 'missing_context', description: 'No explicit instruction for handling "just tell me the answer" requests', location: 'Entire prompt' },
      { id: 'f4', type: 'missing_context', description: 'No definition of what "Socratic method" means operationally - model interprets loosely', location: 'First sentence' }
    ],
    referencePrompt: 'You are Professor Chen, a tutor who uses the Socratic method exclusively. Your teaching method (non-negotiable): (1) Never provide direct answers to problems, (2) Guide through questions only, (3) If student asks for direct answer, respond: "I understand you\'re looking for a quick answer. However, you\'ll retain this better if we work through it together. Let me ask you this: [guiding question]", (4) If student insists they\'re in a hurry, respond: "I can help you faster by asking targeted questions than by explaining. Let\'s start with: [question]". Socratic method definition: Ask questions that lead student to discover the answer. Question types: (a) Clarifying questions about the problem, (b) Questions that break problem into smaller parts, (c) Questions that connect to prior knowledge, (d) Questions that reveal contradictions in student\'s reasoning. Never: (1) Solve the problem for them, (2) Provide step-by-step solutions, (3) Give answers even if student is frustrated, (4) Break character regardless of how student phrases their request. Tone: patient and encouraging, but firm on method. Priority order: (1) Maintain Socratic method, (2) Student learning, (3) Student satisfaction.',
    successCriteria: [
      { id: 'c1', label: 'All Vulnerabilities Found', description: 'Identified all four character break vulnerabilities', maxPoints: 40 },
      { id: 'c2', label: 'Explicit Override Prevention', description: 'Fixed prompt prevents "adapt to needs" from overriding core method', maxPoints: 30 },
      { id: 'c3', label: 'Scripted Resistance', description: 'Provides exact language for handling direct answer requests', maxPoints: 30 }
    ],
    explanation: 'Persona stability breaks when prompts include soft language like "be understanding" or "adapt to needs" without defining boundaries. These become user-exploitable overrides. The fix is making the core behavior non-negotiable and providing scripted responses for common manipulation attempts. The key insight: empathy and firmness are not opposites. You can be patient and encouraging while maintaining strict boundaries.',
    skills: ['persona_stability', 'manipulation_resistance', 'boundary_scripting', 'priority_hierarchies']
  },
  {
    id: 'de_002',
    type: 'live_challenge',
    domain: 'data_extraction',
    difficulty: 'expert',
    title: 'Earnings Call Transcript Intelligence',
    timeLimit: 0,
    points: 190,
    scenario: 'You work at an investment firm. Analysts need structured data extracted from quarterly earnings call transcripts (30-50 pages each). The data feeds into a financial model that compares companies. Extraction must be consistent across different companies, quarters, and transcript formats.',
    requirements: [
      'Define the complete extraction schema with all required fields',
      'Handle transcripts where executives avoid giving specific numbers',
      'Extract forward-looking statements separately from historical data',
      'Identify when a metric is mentioned but not quantified',
      'Handle different transcript formats (Q&A vs prepared remarks)',
      'Define confidence levels for extracted data'
    ],
    constraints: [
      'Must work for any public company earnings call',
      'Output must be machine-readable for model ingestion',
      'Must distinguish between GAAP and non-GAAP metrics'
    ],
    exampleOutput: 'Extraction schema with field definitions, data types, null handling, confidence scoring, and example output showing proper handling of ambiguous statements and missing data.',
    successCriteria: [
      { id: 'c1', label: 'Complete Schema Definition', description: 'All financial metrics and metadata fields defined with types', maxPoints: 30 },
      { id: 'c2', label: 'Ambiguity Handling', description: 'Defines how to handle vague or missing quantitative data', maxPoints: 25 },
      { id: 'c3', label: 'Forward-Looking Separation', description: 'Distinguishes historical data from guidance/projections', maxPoints: 25 },
      { id: 'c4', label: 'Confidence Mechanism', description: 'Assigns confidence levels to extracted data points', maxPoints: 20 }
    ],
    explanation: 'Financial data extraction from unstructured text is high-stakes: errors compound through models and affect investment decisions. The challenge is that executives often speak in qualitative terms ("strong growth", "improved margins") without specific numbers. Your extraction prompt must distinguish between hard data, soft guidance, and complete absence of information. The confidence scoring mechanism is critical — it tells downstream users which data points are reliable.',
    skills: ['financial_extraction', 'schema_design', 'confidence_scoring', 'ambiguity_handling']
  },
  {
    id: 'sp_004',
    type: 'scenario_simulation',
    domain: 'system_prompts',
    difficulty: 'expert',
    title: 'Content Moderation Workflow Design',
    timeLimit: 0,
    points: 190,
    scenario: 'A social platform needs AI-assisted content moderation for user-generated posts. Human moderators currently review 10,000 posts per day. You need to design a complete AI workflow that reduces human review to 2,000 posts per day while maintaining safety and minimizing false positives.',
    role: 'Trust & Safety AI Architect',
    objective: 'Design the complete moderation system including AI classification, confidence thresholds, escalation logic, edge case handling, and human review prioritization.',
    requiredElements: [
      'Multi-tier classification system (safe/review/remove)',
      'Confidence thresholds for each tier with justification',
      'Escalation triggers that require human review',
      'Edge case handling for borderline content',
      'False positive mitigation strategy',
      'Human review queue prioritization logic',
      'Appeal handling process'
    ],
    scoringRubric: [
      { id: 'r1', label: 'Classification System', description: 'Clear tiers with defined boundaries and examples', maxPoints: 25 },
      { id: 'r2', label: 'Threshold Justification', description: 'Confidence thresholds are defensible and explained', maxPoints: 20 },
      { id: 'r3', label: 'Escalation Logic', description: 'Specific triggers for human review defined', maxPoints: 20 },
      { id: 'r4', label: 'False Positive Strategy', description: 'Mechanisms to reduce over-moderation', maxPoints: 20 },
      { id: 'r5', label: 'Human Review Prioritization', description: 'Logic for ordering the 2,000 daily human reviews', maxPoints: 15 }
    ],
    explanation: 'Content moderation is the highest-stakes AI application most operators will encounter. Over-moderate and you suppress legitimate speech. Under-moderate and you allow harm. The key insight is that AI should handle clear cases (obviously safe, obviously violating) while humans handle ambiguity. The confidence threshold is your primary tuning parameter: lower it and you send more to human review (safer but more expensive), raise it and you auto-moderate more (cheaper but riskier). Your design must be defensible to regulators and users.',
    skills: ['moderation_system_design', 'threshold_calibration', 'safety_engineering', 'human_ai_workflow']
  },
  {
    id: 'oc_003',
    type: 'output_analysis',
    domain: 'output_control',
    difficulty: 'advanced',
    title: 'The Subtle Format Violation',
    timeLimit: 420,
    points: 140,
    originalPrompt: 'Generate a product requirements document (PRD) using this template:\n\nPROBLEM STATEMENT (exactly 2 sentences)\nUSER STORIES (exactly 3, format: "As a [role], I want [goal] so that [benefit]")\nSUCCESS METRICS (exactly 4 metrics with measurement method)\nOUT OF SCOPE (bulleted list, 3-5 items)\n\nDo not add sections. Do not add preamble.',
    aiOutput: 'PROBLEM STATEMENT\nCustomers cannot track their order status after purchase, leading to support ticket volume increases. This creates operational overhead and reduces customer satisfaction.\n\nUSER STORIES\n- As a customer, I want to see my order status in real-time so that I know when to expect delivery\n- As a customer, I want to receive proactive notifications about delays so that I can plan accordingly  \n- As a support agent, I want customers to self-serve order status so that I can focus on complex issues\n\nSUCCESS METRICS\n1. Support tickets related to order status: Measure weekly ticket volume, target 40% reduction\n2. Customer satisfaction score: Post-purchase survey, target increase from 7.2 to 8.5\n3. Order status page engagement: Track daily active users\n4. Notification open rate: Measure email/SMS opens, target >60%\n\nOUT OF SCOPE\n- International shipping tracking\n- Integration with third-party carriers beyond FedEx/UPS\n- Predictive delivery time estimates\n- Order modification after placement',
    hiddenFlaws: [
      { id: 'h1', type: 'format_violation', description: 'User stories use bullet points instead of numbered list - format not specified but inconsistent with other sections', evidence: 'USER STORIES section uses "- " instead of "1. "' },
      { id: 'h2', type: 'missed_instruction', description: 'Success Metrics #3 is missing measurement method - only states what to track, not how to measure', evidence: '"Order status page engagement: Track daily active users" - no target or measurement method' },
      { id: 'h3', type: 'format_violation', description: 'Out of Scope has 4 items but template specified 3-5, which is correct, but items lack the "why" context that would make them actionable', evidence: 'Items are listed but without reasoning' }
    ],
    correctionTask: 'Write an improved prompt that (1) specifies numbered vs bulleted format for each section explicitly, (2) defines what "measurement method" means with an example, (3) requires Out of Scope items to include brief reasoning.',
    successCriteria: [
      { id: 'c1', label: 'Format Violations Identified', description: 'Found the bullet/number inconsistency and incomplete metric', maxPoints: 40 },
      { id: 'c2', label: 'Format Specification Enhanced', description: 'Improved prompt specifies list format for each section', maxPoints: 30 },
      { id: 'c3', label: 'Field Requirements Clarified', description: 'Defines what constitutes complete measurement method', maxPoints: 30 }
    ],
    explanation: 'Subtle format violations are harder to catch than obvious ones. The model followed most instructions but made small deviations that compound in production. The incomplete measurement method is particularly problematic — it looks complete at a glance but lacks the target/threshold needed for actual measurement. The fix is being more explicit about what each field requires, ideally with examples in the prompt itself.',
    skills: ['format_validation', 'completeness_checking', 'specification_tightening']
  },
  {
    id: 'aw_003',
    type: 'output_analysis',
    domain: 'ai_workflows',
    difficulty: 'advanced',
    title: 'The Pipeline Failure Point',
    timeLimit: 480,
    points: 150,
    originalPrompt: 'WORKFLOW: Customer feedback analysis pipeline\n\nStage 1: Extract feedback from support tickets (AI)\nStage 2: Categorize by product area (AI)  \nStage 3: Identify sentiment and urgency (AI)\nStage 4: Generate weekly summary report (AI)\nStage 5: Human review and distribution\n\nAll stages run automatically Monday morning.',
    aiOutput: 'This workflow will process customer feedback efficiently. Stage 1 extracts text from tickets, Stage 2 uses classification to assign categories, Stage 3 analyzes sentiment, Stage 4 compiles everything into a report, and Stage 5 sends to stakeholders.',
    hiddenFlaws: [
      { id: 'h1', type: 'logical_error', description: 'No quality gate between stages - if Stage 1 extraction fails or produces garbage, it cascades through entire pipeline', evidence: 'Stages run sequentially with no validation checkpoints' },
      { id: 'h2', type: 'logical_error', description: 'No handling for empty weeks - what if there are zero tickets? Pipeline will produce empty report', evidence: 'No minimum data threshold or edge case handling' },
      { id: 'h3', type: 'missed_instruction', description: 'Stage 2 categorization has no fallback for uncategorizable feedback - will fail on edge cases', evidence: 'Classification assumes all feedback fits predefined categories' }
    ],
    correctionTask: 'Write an improved workflow design that (1) adds quality gates with specific pass/fail criteria between stages, (2) defines minimum data thresholds and empty-state handling, (3) includes fallback categories and error handling at each stage.',
    successCriteria: [
      { id: 'c1', label: 'Pipeline Risks Identified', description: 'Found the missing quality gates and edge case handling', maxPoints: 40 },
      { id: 'c2', label: 'Quality Gates Added', description: 'Improved design includes validation between stages', maxPoints: 30 },
      { id: 'c3', label: 'Error Handling Defined', description: 'Specifies what happens when stages fail or produce edge cases', maxPoints: 30 }
    ],
    explanation: 'Multi-stage AI pipelines fail silently when there are no quality gates between stages. Bad output from Stage 1 becomes bad input to Stage 2, and the error compounds. The fix is treating each stage boundary as a validation checkpoint: define what good output looks like, check for it, and halt or escalate if quality is insufficient. Always define edge case behavior explicitly — what happens with zero input, ambiguous input, or contradictory input.',
    skills: ['pipeline_validation', 'error_handling', 'quality_gates', 'edge_case_design']
  },
  {
    id: 'cm_003',
    type: 'live_challenge',
    domain: 'context_management',
    difficulty: 'expert',
    title: 'Multi-Document Cross-Reference Analysis',
    timeLimit: 0,
    points: 180,
    scenario: 'A legal team needs to analyze 5 related contracts (total 200+ pages) to identify inconsistencies, conflicting terms, and missing provisions. The contracts reference each other and must be analyzed together, not individually.',
    requirements: [
      'Design a prompt strategy that maintains cross-document context',
      'Identify contradictions between documents',
      'Track defined terms that appear across multiple contracts',
      'Flag missing provisions that should be present based on other contracts',
      'Handle documents that reference clauses in other documents',
      'Produce a consolidated analysis showing relationships'
    ],
    constraints: [
      'Cannot process all 200 pages in one prompt',
      'Must maintain accuracy on cross-references',
      'Final analysis must cite specific document and page numbers'
    ],
    exampleOutput: 'Multi-stage prompt strategy with document indexing, cross-reference tracking, contradiction detection logic, and final synthesis format.',
    successCriteria: [
      { id: 'c1', label: 'Cross-Document Strategy', description: 'Defines how to maintain context across multiple documents', maxPoints: 30 },
      { id: 'c2', label: 'Contradiction Detection', description: 'Includes mechanism to identify conflicting terms', maxPoints: 25 },
      { id: 'c3', label: 'Reference Tracking', description: 'Tracks terms and clauses that appear across documents', maxPoints: 25 },
      { id: 'c4', label: 'Citation Accuracy', description: 'Ensures output includes specific document and page references', maxPoints: 20 }
    ],
    explanation: 'Multi-document analysis is one of the hardest context management problems. You cannot fit everything in one prompt, but you must maintain cross-document awareness. The solution is a three-stage approach: (1) Extract key terms, provisions, and references from each document individually, (2) Build a cross-reference index showing where terms appear across documents, (3) Analyze the index for contradictions and gaps. The key insight is that you must extract structured data first, then analyze the structured data — not try to analyze the raw documents directly.',
    skills: ['multi_document_analysis', 'cross_reference_tracking', 'contradiction_detection', 'structured_extraction']
  },
  {
    id: 'pe_005',
    type: 'scenario_simulation',
    domain: 'prompt_engineering',
    difficulty: 'expert',
    title: 'Prompt Version Control System',
    timeLimit: 0,
    points: 180,
    scenario: 'You lead a team of 8 AI operators at a company that uses prompts in production across 30+ use cases. Different operators are modifying prompts, but there is no system for tracking changes, testing impact, or rolling back failures. You need to design a prompt version control and testing system.',
    role: 'Lead AI Operator',
    objective: 'Design the complete system for managing prompt versions, testing changes, deploying updates, and rolling back failures.',
    requiredElements: [
      'Version control structure for prompts (what gets tracked)',
      'Testing protocol before deploying prompt changes',
      'Deployment process with rollback capability',
      'Change documentation requirements',
      'Performance monitoring after deployment',
      'Approval workflow for production changes',
      'Incident response for prompt failures'
    ],
    scoringRubric: [
      { id: 'r1', label: 'Version Control Structure', description: 'Defines what prompt metadata to track and how', maxPoints: 20 },
      { id: 'r2', label: 'Testing Protocol', description: 'Specifies how to validate prompt changes before deployment', maxPoints: 25 },
      { id: 'r3', label: 'Deployment Process', description: 'Defines safe deployment with rollback mechanism', maxPoints: 20 },
      { id: 'r4', label: 'Monitoring & Response', description: 'Includes post-deployment monitoring and incident handling', maxPoints: 20 },
      { id: 'r5', label: 'Documentation Requirements', description: 'Specifies what must be documented for each change', maxPoints: 15 }
    ],
    explanation: 'Prompt engineering at scale requires treating prompts like code: version control, testing, staged deployment, and monitoring. The most common failure mode is operators making "quick fixes" directly in production without testing impact. The second most common failure is not knowing which version of a prompt is running where. Your system must make it easier to do the right thing (test, document, deploy safely) than the wrong thing (edit production directly). The key insight is that prompt changes are deployments and should be treated with the same rigor as code deployments.',
    skills: ['prompt_operations', 'version_control', 'testing_protocols', 'deployment_safety']
  },
  {
    id: 'de_003',
    type: 'scenario_simulation',
    domain: 'data_extraction',
    difficulty: 'expert',
    title: 'Document Intelligence Pipeline',
    timeLimit: 0,
    points: 200,
    scenario: 'An insurance company processes 5,000 claim documents per day (medical records, receipts, police reports, photos). Currently, 12 people manually extract data into their claims system. You need to design a complete AI document intelligence pipeline that handles 80% of documents automatically.',
    role: 'Document Intelligence Architect',
    objective: 'Design the end-to-end pipeline from document ingestion to data extraction to validation to system integration, including quality assurance and human review.',
    requiredElements: [
      'Document classification stage (identify document type)',
      'Type-specific extraction schemas for each document type',
      'OCR quality assessment and handling',
      'Confidence scoring for extracted data',
      'Validation rules and quality gates',
      'Human review prioritization (which 20% need human review)',
      'Error handling and retry logic',
      'Integration with claims system'
    ],
    scoringRubric: [
      { id: 'r1', label: 'Pipeline Completeness', description: 'All stages from ingestion to integration defined', maxPoints: 25 },
      { id: 'r2', label: 'Type-Specific Extraction', description: 'Different schemas for different document types', maxPoints: 20 },
      { id: 'r3', label: 'Quality Assurance', description: 'Confidence scoring and validation mechanisms', maxPoints: 25 },
      { id: 'r4', label: 'Human Review Logic', description: 'Defines which documents require human review', maxPoints: 20 },
      { id: 'r5', label: 'Error Handling', description: 'Specifies what happens when extraction fails', maxPoints: 10 }
    ],
    explanation: 'Document intelligence at scale is a complete system, not a single prompt. The pipeline must handle document variability (different formats, quality levels, handwriting), extraction accuracy (some fields are critical, others optional), and integration reliability (bad data cannot enter the claims system). The key insight is that confidence scoring is your primary tool for routing: high-confidence extractions go straight through, medium-confidence goes to validation, low-confidence goes to human review. The 80% automation target is achieved by tuning these thresholds, not by making the AI more accurate.',
    skills: ['document_pipeline', 'confidence_routing', 'quality_assurance', 'system_integration']
  },
  {
    id: 'rp_003',
    type: 'scenario_simulation',
    domain: 'role_prompting',
    difficulty: 'expert',
    title: 'Red Team AI Safety Testing',
    timeLimit: 0,
    points: 190,
    scenario: 'Your company is launching an AI assistant for financial advice. Before launch, you need to red team it — systematically test whether it can be manipulated into giving bad advice, breaking character, or violating compliance rules. Design the complete red team testing framework.',
    role: 'AI Safety Lead',
    objective: 'Design a systematic red team testing protocol that covers all major attack vectors, produces reproducible results, and generates a safety report.',
    requiredElements: [
      'Attack vector categories (manipulation, jailbreaking, edge cases, etc.)',
      'Test case design for each vector',
      'Success/failure criteria for each test',
      'Severity scoring for failures',
      'Remediation recommendations structure',
      'Testing documentation format',
      'Regression testing protocol'
    ],
    scoringRubric: [
      { id: 'r1', label: 'Attack Vector Coverage', description: 'Comprehensive list of attack categories to test', maxPoints: 25 },
      { id: 'r2', label: 'Test Case Design', description: 'Specific, reproducible test cases for each vector', maxPoints: 25 },
      { id: 'r3', label: 'Evaluation Criteria', description: 'Clear pass/fail criteria and severity scoring', maxPoints: 20 },
      { id: 'r4', label: 'Remediation Framework', description: 'Structure for documenting fixes and retesting', maxPoints: 20 },
      { id: 'r5', label: 'Documentation Format', description: 'Produces auditable safety report', maxPoints: 10 }
    ],
    explanation: 'Red teaming AI systems is systematic adversarial testing. The goal is to find failure modes before users do. The most common mistake is ad-hoc testing without a framework — you find some issues but miss systematic vulnerabilities. A proper red team framework categorizes attack vectors (social engineering, edge cases, contradiction injection, context manipulation), designs specific test cases for each, and documents results in a way that guides remediation. The key insight is that red teaming is not about breaking the system for fun — it is about systematically discovering and documenting failure modes so they can be fixed.',
    skills: ['red_team_design', 'adversarial_testing', 'safety_evaluation', 'systematic_testing']
  },
  {
    id: 'oc_004',
    type: 'prompt_construction',
    domain: 'output_control',
    difficulty: 'expert',
    title: 'The Regulatory Compliance Format',
    timeLimit: 600,
    points: 170,
    context: 'A pharmaceutical company needs AI to generate adverse event reports for FDA submission. The format is defined by FDA regulations (Form FDA 3500A) and must be followed exactly. Any deviation causes rejection. The AI must extract information from clinical notes and produce compliant reports.',
    targetOutput: 'A prompt that produces reports matching FDA 3500A format exactly, handles missing required fields appropriately, includes all mandatory sections, and flags when information is insufficient for submission.',
    brokenPrompt: 'Generate an adverse event report from these clinical notes. Include patient information, event description, medications, and outcomes. Follow FDA format.',
    referencePrompt: 'Generate FDA Form 3500A adverse event report from clinical notes. Use this exact structure (all sections mandatory):\n\nSECTION A: PATIENT INFORMATION\nA.1 Patient Identifier: [alphanumeric, no PHI]\nA.2 Age at Time of Event: [number] [years/months/days]\nA.3 Sex: [M/F/U]\nA.4 Weight: [number] [kg/lbs] or NULL\n\nSECTION B: ADVERSE EVENT\nB.1 Event Description: [free text, max 500 chars]\nB.2 Event Date: [YYYY-MM-DD]\nB.3 Event Outcome: [Death/Life-threatening/Hospitalization/Disability/Congenital Anomaly/Other]\nB.4 Seriousness Criteria: [check all that apply from list]\n\nSECTION C: SUSPECT MEDICATION(S)\nC.1 Name: [generic name]\nC.2 Dose: [number] [unit]\nC.3 Route: [oral/IV/IM/other]\nC.4 Start Date: [YYYY-MM-DD]\nC.5 Stop Date: [YYYY-MM-DD] or ONGOING\n\nSECTION D: REPORTER INFORMATION\nD.1 Reporter Type: [Healthcare Professional/Consumer/Other]\nD.2 Report Date: [YYYY-MM-DD]\n\nRULES:\n1. If required field is missing from clinical notes, output: INSUFFICIENT DATA - [field name] required for submission\n2. Do not infer or estimate required fields\n3. Use NULL only for optional fields (A.4 Weight)\n4. Dates must be YYYY-MM-DD format, no exceptions\n5. Event Outcome must be exactly one of the specified options\n6. If multiple medications, repeat Section C for each\n7. Do not add narrative, commentary, or additional sections\n8. If clinical notes do not contain an adverse event, output: NO ADVERSE EVENT IDENTIFIED\n\nValidation: Before outputting, verify all mandatory fields present and all dates in correct format.',
    successCriteria: [
      { id: 'c1', label: 'Exact Format Specification', description: 'Provides complete FDA 3500A structure with all fields', maxPoints: 30 },
      { id: 'c2', label: 'Required Field Handling', description: 'Defines behavior when mandatory information is missing', maxPoints: 25 },
      { id: 'c3', label: 'Validation Rules', description: 'Includes format validation and completeness checks', maxPoints: 25 },
      { id: 'c4', label: 'Regulatory Compliance', description: 'Prevents inference/estimation that would violate regulations', maxPoints: 20 }
    ],
    explanation: 'Regulatory compliance formats are non-negotiable — any deviation causes rejection and delays. The challenge is that clinical notes are unstructured while regulatory forms are rigidly structured. Your prompt must bridge this gap without inventing data. The key insight is that "insufficient data" is a valid output — it is better to flag missing information than to submit an incomplete or inaccurate report. The validation step at the end is critical: it catches format errors before submission.',
    skills: ['regulatory_compliance', 'format_enforcement', 'data_validation', 'mandatory_field_handling']
  },
  {
    id: 'aw_004',
    type: 'live_challenge',
    domain: 'ai_workflows',
    difficulty: 'expert',
    title: 'Customer Onboarding Automation',
    timeLimit: 0,
    points: 180,
    scenario: 'A B2B SaaS company onboards 50 new customers per month. Current process: sales hands off to implementation team, implementation team schedules kickoff call, collects requirements, configures system, trains users, and launches. Takes 6 weeks and 40 hours of human time per customer. Design an AI-assisted workflow that reduces time to 3 weeks and 15 hours per customer.',
    requirements: [
      'Map the complete current workflow with time breakdown',
      'Identify which stages can be AI-assisted vs must remain human',
      'Design AI prompts/workflows for automated stages',
      'Define quality gates and human checkpoints',
      'Specify how to handle edge cases and custom requirements',
      'Measure success - how do you know the AI workflow is working'
    ],
    constraints: [
      'Customer satisfaction must not decrease',
      'Must work for customers with different technical sophistication',
      'Must handle custom configuration requests'
    ],
    exampleOutput: 'Complete workflow redesign showing current vs future state, AI automation points, human checkpoints, quality gates, edge case handling, and success metrics.',
    successCriteria: [
      { id: 'c1', label: 'Workflow Analysis', description: 'Maps current workflow and identifies automation opportunities', maxPoints: 25 },
      { id: 'c2', label: 'AI/Human Division', description: 'Clearly defines what AI handles vs what humans handle', maxPoints: 25 },
      { id: 'c3', label: 'Quality Assurance', description: 'Includes checkpoints to maintain customer satisfaction', maxPoints: 25 },
      { id: 'c4', label: 'Success Metrics', description: 'Defines measurable criteria for workflow effectiveness', maxPoints: 25 }
    ],
    explanation: 'Onboarding automation is a complete workflow redesign, not just adding AI to existing steps. The key is identifying which parts of onboarding are repeatable (requirement collection, system configuration, training materials) vs which require human judgment (understanding unique business needs, building relationships). AI should handle the repeatable parts completely, freeing humans to focus on the judgment parts. The 60% time reduction comes from parallelizing steps that were previously sequential and automating documentation/configuration that was previously manual.',
    skills: ['workflow_redesign', 'automation_identification', 'human_ai_handoff', 'process_optimization']
  },
  {
    id: 'pe_006',
    type: 'prompt_construction',
    domain: 'prompt_engineering',
    difficulty: 'expert',
    title: 'The Anti-Hallucination Framework',
    timeLimit: 600,
    points: 170,
    context: 'A research team uses AI to generate literature reviews. The AI frequently cites papers that don\'t exist, misattributes findings, and invents statistics. Standard prompts like "be accurate" don\'t work. You need a prompt framework that systematically prevents hallucination.',
    targetOutput: 'A multi-constraint prompt that forces the model to distinguish between what it knows vs what it\'s inferring, requires explicit uncertainty markers, and prevents fabrication of specific data types.',
    brokenPrompt: 'Write a literature review on AI safety research. Include key papers, findings, and statistics. Be accurate and cite sources.',
    referencePrompt: 'Write a literature review on AI safety research following these anti-hallucination rules:\n\nCITATION RULES:\n1. Only cite papers if you can provide: author last names, year, and paper title\n2. If you cannot recall all three elements, write: [CITATION NEEDED: topic area]\n3. Never invent author names, years, or titles\n4. If unsure whether a paper exists, write: [VERIFY: possible paper on X]\n\nSTATISTICS RULES:\n1. Only cite specific numbers if you can attribute them to a source\n2. If you recall a trend but not exact numbers, write: "Research suggests [trend], though specific figures vary across studies"\n3. Never present estimates as precise data\n4. For any statistic, include confidence marker: [HIGH CONFIDENCE] or [UNCERTAIN]\n\nFINDINGS RULES:\n1. Distinguish between: "Research shows [consensus finding]" vs "Some studies suggest [emerging finding]"\n2. If you cannot recall which specific paper made a claim, write: "Multiple studies in [timeframe] found [finding] [SPECIFIC CITATIONS NEEDED]"\n3. Never attribute specific quotes or claims without exact source\n\nOUTPUT STRUCTURE:\nIntroduction (no citations needed)\nKey Themes (use citation rules above)\nMajor Findings (use findings rules above)\nGaps in Literature (where you lack specific sources)\n\nBefore writing each claim, ask yourself: Can I cite a specific source? If no, use uncertainty markers above.',
    successCriteria: [
      { id: 'c1', label: 'Citation Constraints', description: 'Defines exactly what constitutes a valid citation', maxPoints: 30 },
      { id: 'c2', label: 'Uncertainty Markers', description: 'Requires explicit markers when model is uncertain', maxPoints: 25 },
      { id: 'c3', label: 'Fabrication Prevention', description: 'Prohibits inventing specific data types', maxPoints: 25 },
      { id: 'c4', label: 'Verification Mechanism', description: 'Includes self-check before making claims', maxPoints: 20 }
    ],
    explanation: 'Hallucination prevention requires constraining the model\'s ability to present uncertain information as fact. The key insight is that you cannot eliminate hallucination entirely, but you can force the model to surface its uncertainty. By requiring explicit markers like [CITATION NEEDED] or [UNCERTAIN], you make hallucinations visible rather than invisible. The model will still be uncertain about many things, but now that uncertainty is documented rather than hidden behind confident-sounding prose.',
    skills: ['hallucination_prevention', 'uncertainty_surfacing', 'citation_discipline', 'verification_forcing']
  },
  {
    id: 'sp_005',
    type: 'prompt_construction',
    domain: 'system_prompts',
    difficulty: 'expert',
    title: 'The Escalation Decision Tree',
    timeLimit: 600,
    points: 170,
    context: 'A financial services company uses an AI assistant for customer inquiries. The AI must handle routine questions but escalate to humans for anything involving: account security, regulatory compliance, complex products, or customer distress. Current system escalates too often (expensive) or too rarely (risky).',
    targetOutput: 'A system prompt with an explicit decision tree that defines exactly when to escalate vs when to handle, with specific trigger conditions and escalation language.',
    brokenPrompt: 'You are a customer service assistant. Answer questions about accounts and products. If something seems complex or sensitive, escalate to a human agent.',
    referencePrompt: 'You are a customer service assistant for a financial services company. Use this decision tree for every request:\n\nSTEP 1: SECURITY CHECK\nDoes request involve: password reset, account access issues, suspicious activity, or unauthorized transactions?\nYES → ESCALATE with: "For account security, I\'m connecting you with our security team. They\'ll help within 2 minutes."\nNO → Continue to Step 2\n\nSTEP 2: REGULATORY CHECK\nDoes request involve: investment advice, tax implications, legal questions, or regulatory compliance?\nYES → ESCALATE with: "This requires specialized guidance. I\'m connecting you with an advisor who can help with [specific topic]."\nNO → Continue to Step 3\n\nSTEP 3: COMPLEXITY CHECK\nDoes request involve: multiple account types, business accounts, estate planning, or custom solutions?\nYES → ESCALATE with: "This involves [specific complexity]. Let me connect you with a specialist who can provide detailed guidance."\nNO → Continue to Step 4\n\nSTEP 4: EMOTIONAL STATE CHECK\nDoes customer express: anger, distress, threats, or mention legal action?\nYES → ESCALATE with: "I understand this is important. Let me connect you with a senior representative who can address this directly."\nNO → HANDLE REQUEST\n\nHANDLING ROUTINE REQUESTS:\nYou can handle: account balance inquiries, transaction history, basic product information, branch locations, general FAQs\nProvide direct answers using information from knowledge base\nIf information is not in knowledge base, say: "I don\'t have that specific information. Would you like me to connect you with someone who does?"\n\nNEVER:\n- Guess at account-specific information\n- Provide investment or tax advice\n- Make promises about account changes\n- Discuss other customers\' accounts\n\nEvery request must go through the decision tree. When in doubt, escalate.',
    successCriteria: [
      { id: 'c1', label: 'Explicit Decision Tree', description: 'Provides step-by-step escalation logic', maxPoints: 30 },
      { id: 'c2', label: 'Specific Trigger Conditions', description: 'Defines exact conditions that require escalation', maxPoints: 25 },
      { id: 'c3', label: 'Escalation Language', description: 'Provides scripted language for each escalation type', maxPoints: 25 },
      { id: 'c4', label: 'Handling Scope', description: 'Clearly defines what AI can handle vs must escalate', maxPoints: 20 }
    ],
    explanation: 'Escalation decisions are binary: handle or escalate. Vague language like "if something seems complex" leaves the model to interpret complexity, causing inconsistent escalation. The fix is an explicit decision tree with yes/no questions and specific trigger conditions. Each branch leads to either "handle" or "escalate with [specific language]". The key insight is that escalation is not a judgment call — it is a rule-based decision. Define the rules explicitly and the model will follow them consistently.',
    skills: ['escalation_logic', 'decision_trees', 'boundary_definition', 'rule_based_routing']
  },
  {
    id: 'rc_005',
    type: 'live_challenge',
    domain: 'reasoning_chains',
    difficulty: 'expert',
    title: 'The Assumption Audit',
    timeLimit: 600,
    points: 180,
    scenario: 'A strategy consulting firm uses AI to analyze market entry decisions. Clients have complained that recommendations lack rigor — the AI makes assumptions without stating them explicitly. You need a prompt framework that forces the model to surface and justify every assumption before reaching conclusions.',
    requirements: [
      'Force the model to identify all assumptions before analysis',
      'Require explicit justification for each assumption',
      'Distinguish between assumptions that are reasonable vs those that need validation',
      'Provide a confidence score that accounts for assumption risk',
      'Create an audit trail showing how assumptions affect conclusions',
      'Flag high-risk assumptions that could invalidate the analysis'
    ],
    constraints: [
      'Must work for any market entry decision',
      'Prompt must be under 300 words',
      'Output must be reviewable by client executives'
    ],
    exampleOutput: 'A prompt that produces analysis with explicit assumption listing, justification for each, risk assessment, and clear connection between assumptions and conclusions.',
    successCriteria: [
      { id: 'c1', label: 'Assumption Surfacing', description: 'Forces model to list all assumptions before analyzing', maxPoints: 30 },
      { id: 'c2', label: 'Justification Requirement', description: 'Requires explicit reasoning for each assumption', maxPoints: 25 },
      { id: 'c3', label: 'Risk Assessment', description: 'Identifies which assumptions are high-risk', maxPoints: 25 },
      { id: 'c4', label: 'Audit Trail', description: 'Shows how assumptions connect to conclusions', maxPoints: 20 }
    ],
    explanation: 'Strategic analysis fails when assumptions are implicit. The model makes them anyway — it has to in order to reach conclusions — but they remain hidden. The fix is forcing assumptions to be explicit and justified before analysis begins. This serves two purposes: (1) it makes the analysis auditable, and (2) it often reveals that key assumptions are unjustified, causing the model to revise its approach. The key insight is that assumption quality matters more than analytical sophistication. A rigorous analysis built on bad assumptions is worse than a simple analysis that acknowledges uncertainty.',
    skills: ['assumption_surfacing', 'justification_forcing', 'risk_assessment', 'analytical_rigor']
  },
  {
    id: 'oc_005',
    type: 'live_challenge',
    domain: 'output_control',
    difficulty: 'expert',
    title: 'The JSON Schema Enforcer',
    timeLimit: 600,
    points: 170,
    scenario: 'A data pipeline ingests AI-generated JSON for downstream processing. Any schema violation breaks the pipeline. Current prompts produce JSON that looks valid but has subtle issues: wrong data types, missing required fields, extra fields, incorrect nesting. You need a prompt that produces schema-compliant JSON 100% of the time.',
    requirements: [
      'Provide the complete JSON schema with all field types',
      'Handle optional vs required fields explicitly',
      'Prevent extra fields not in schema',
      'Enforce data type constraints (string, number, boolean, array, object)',
      'Handle null values correctly',
      'Include validation step before output'
    ],
    constraints: [
      'Must work for any data extraction task',
      'Schema can have nested objects and arrays',
      'Must handle edge cases like empty arrays and null values'
    ],
    exampleOutput: 'A prompt template that takes any JSON schema and produces compliant output with proper type enforcement, required field validation, and no extra fields.',
    successCriteria: [
      { id: 'c1', label: 'Complete Schema Definition', description: 'Provides full schema with all types and constraints', maxPoints: 30 },
      { id: 'c2', label: 'Type Enforcement', description: 'Explicitly enforces data types for each field', maxPoints: 25 },
      { id: 'c3', label: 'Required Field Validation', description: 'Distinguishes required vs optional fields', maxPoints: 25 },
      { id: 'c4', label: 'Validation Step', description: 'Includes self-check before outputting JSON', maxPoints: 20 }
    ],
    explanation: 'JSON schema compliance is binary: either the output is valid or it breaks the pipeline. The most common failures are type mismatches (string instead of number), missing required fields, and extra fields not in the schema. The fix is providing the complete schema in the prompt with explicit type definitions and a validation step. The key insight is that you must tell the model to validate before outputting, not just to "follow the schema". The validation step catches errors that would otherwise break downstream systems.',
    skills: ['json_schema', 'type_enforcement', 'validation_logic', 'pipeline_reliability']
  },
  {
    id: 'aw_005',
    type: 'scenario_simulation',
    domain: 'ai_workflows',
    difficulty: 'expert',
    title: 'The Sales Intelligence System',
    timeLimit: 0,
    points: 190,
    scenario: 'A B2B sales team needs intelligence on prospects before calls: company background, recent news, key executives, potential pain points, and conversation starters. Currently, sales reps spend 30 minutes researching before each call. Design an AI system that produces this intelligence in under 2 minutes.',
    role: 'Sales Operations AI Architect',
    objective: 'Design the complete system from prospect input to intelligence brief generation, including data sources, extraction logic, synthesis, and quality assurance.',
    requiredElements: [
      'Input requirements (what data about prospect is needed)',
      'Data source strategy (where to gather information)',
      'Information extraction and structuring approach',
      'Synthesis logic (how to combine sources into brief)',
      'Quality checks (how to ensure accuracy and relevance)',
      'Output format optimized for sales calls',
      'Handling for prospects with limited public information',
      'Update mechanism for repeat prospects'
    ],
    scoringRubric: [
      { id: 'r1', label: 'System Architecture', description: 'Complete flow from input to output defined', maxPoints: 25 },
      { id: 'r2', label: 'Data Strategy', description: 'Identifies sources and extraction approach', maxPoints: 20 },
      { id: 'r3', label: 'Synthesis Logic', description: 'Defines how to combine sources into actionable brief', maxPoints: 25 },
      { id: 'r4', label: 'Quality Assurance', description: 'Includes accuracy and relevance checks', maxPoints: 20 },
      { id: 'r5', label: 'Edge Case Handling', description: 'Addresses limited data and repeat prospects', maxPoints: 10 }
    ],
    explanation: 'Sales intelligence systems must balance speed with accuracy. The 30-minute to 2-minute reduction comes from automation, but the intelligence must remain accurate and actionable. The key insight is that sales reps don\'t need comprehensive research — they need specific, actionable intelligence: recent news that creates urgency, executive backgrounds that enable rapport, pain points that align with your solution. The system should optimize for relevance over completeness. A focused 5-point brief beats a comprehensive 20-point report that the rep won\'t read.',
    skills: ['sales_intelligence', 'information_synthesis', 'relevance_optimization', 'actionable_output']
  },
  {
    id: 'cm_004',
    type: 'prompt_construction',
    domain: 'context_management',
    difficulty: 'expert',
    title: 'The Conversation Memory System',
    timeLimit: 600,
    points: 180,
    context: 'A customer service AI handles multi-turn conversations that span days. Customers reference previous conversations: "As I mentioned last week..." or "Following up on my earlier question about X". The AI must maintain context across conversations without hallucinating past interactions.',
    targetOutput: 'A system for maintaining conversation context that distinguishes between what was actually discussed vs what the model thinks might have been discussed, with explicit memory retrieval and uncertainty handling.',
    brokenPrompt: 'You are a customer service assistant. Remember previous conversations with customers and reference them when relevant.',
    referencePrompt: 'You are a customer service assistant with conversation memory. Follow this protocol:\n\nMEMORY RETRIEVAL:\nWhen customer references previous conversation ("as I mentioned", "last time", "you said"), respond:\n"Let me check our conversation history. [SYSTEM: Retrieve conversation history for customer ID]\nBased on our records from [date], we discussed [specific topics from history].\nIs this what you\'re referring to?"\n\nIf no conversation history found:\n"I don\'t have a record of a previous conversation about this. Could you provide more details so I can help you now?"\n\nNEVER:\n- Fabricate previous conversations\n- Say "yes, I remember" without checking records\n- Assume what was discussed based on current context\n- Pretend to have memory you don\'t have\n\nCONTEXT USAGE:\nWhen conversation history is available:\n1. Summarize what was previously discussed\n2. Ask if that\'s what customer is referring to\n3. Only proceed once customer confirms\n4. If customer says "no, that\'s not what I meant", ask for clarification\n\nCONVERSATION LOGGING:\nAfter each interaction, log:\n- Date and time\n- Topic discussed\n- Resolution status\n- Any commitments made\n\nThis creates retrievable memory for future conversations.\n\nUNCERTAINTY HANDLING:\nIf customer reference is ambiguous ("you said you\'d follow up"):\n"I want to make sure I\'m addressing the right issue. Could you tell me approximately when we discussed this and what it was about? That will help me find the right conversation."',
    successCriteria: [
      { id: 'c1', label: 'Memory Retrieval Protocol', description: 'Defines how to check conversation history', maxPoints: 30 },
      { id: 'c2', label: 'Fabrication Prevention', description: 'Prohibits inventing previous conversations', maxPoints: 25 },
      { id: 'c3', label: 'Uncertainty Handling', description: 'Defines behavior when memory is unclear', maxPoints: 25 },
      { id: 'c4', label: 'Confirmation Mechanism', description: 'Requires customer confirmation before proceeding', maxPoints: 20 }
    ],
    explanation: 'Conversation memory is one of the hardest context management problems because the model will confidently "remember" conversations that never happened. The fix is treating memory as external data that must be retrieved, not as something the model inherently has. The protocol forces the model to check records, summarize what it finds, and get customer confirmation. The key insight is that "I don\'t have a record of that" is better than fabricating a plausible-sounding memory. Customers trust honesty about limitations more than confident hallucinations.',
    skills: ['conversation_memory', 'fabrication_prevention', 'external_retrieval', 'confirmation_protocols']
  },
  {
    id: 'de_004',
    type: 'prompt_construction',
    domain: 'data_extraction',
    difficulty: 'expert',
    title: 'The Ambiguity Resolver',
    timeLimit: 600,
    points: 180,
    context: 'A procurement team extracts vendor information from proposals. Proposals use inconsistent terminology: "Net 30" vs "30 days payment terms", "5% early payment discount" vs "discount for payment within 10 days". The AI must normalize these variations into a standard schema without losing information.',
    targetOutput: 'An extraction prompt that handles terminology variations, normalizes to standard fields, preserves original phrasing for audit, and flags genuinely ambiguous terms.',
    brokenPrompt: 'Extract payment terms, discounts, and delivery timelines from this vendor proposal. Output in structured format.',
    referencePrompt: 'Extract vendor proposal information and normalize to standard schema:\n\nPAYMENT TERMS:\nField: payment_days (number)\nVariations to recognize: "Net X", "X days", "X day payment terms", "payment due in X days"\nNormalization: Extract number only, store in payment_days\nOriginal: Store exact original phrasing in payment_terms_original\nExample: "Net 30" → payment_days: 30, payment_terms_original: "Net 30"\n\nEARLY PAYMENT DISCOUNT:\nField: early_payment_discount_percent (number), early_payment_days (number)\nVariations: "X% discount for payment within Y days", "Y/X terms" (Y days for X% discount), "X% early payment discount"\nNormalization: Extract both percentage and days\nOriginal: Store in discount_terms_original\nExample: "2/10 Net 30" → early_payment_discount_percent: 2, early_payment_days: 10, discount_terms_original: "2/10 Net 30"\n\nDELIVERY TIMELINE:\nField: delivery_days (number)\nVariations: "X day delivery", "ships within X days", "X business days", "X-Y days" (use maximum)\nNormalization: Extract number, note if business days vs calendar days\nOriginal: Store in delivery_terms_original\n\nAMBIGUITY HANDLING:\nIf term is genuinely ambiguous or uses non-standard phrasing:\nSet field to null\nSet ambiguity_flag: true\nSet ambiguity_note: "[exact ambiguous phrase] - [why it\'s ambiguous]"\n\nExample ambiguities:\n- "Flexible payment terms" → too vague to extract number\n- "Standard industry terms" → undefined\n- "Negotiable" → no specific value\n\nVALIDATION:\nBefore outputting, check:\n- All number fields contain only numbers (no text)\n- All _original fields contain exact quotes from proposal\n- Any null field has corresponding ambiguity_note\n\nOutput as JSON with all fields present (use null for missing).',
    successCriteria: [
      { id: 'c1', label: 'Variation Handling', description: 'Defines how to recognize and normalize terminology variations', maxPoints: 30 },
      { id: 'c2', label: 'Original Preservation', description: 'Stores original phrasing alongside normalized data', maxPoints: 25 },
      { id: 'c3', label: 'Ambiguity Flagging', description: 'Identifies and documents genuinely ambiguous terms', maxPoints: 25 },
      { id: 'c4', label: 'Validation Logic', description: 'Includes checks before outputting data', maxPoints: 20 }
    ],
    explanation: 'Data extraction from real-world documents requires handling terminology variations while maintaining accuracy. The challenge is that "Net 30" and "30 days payment terms" mean the same thing, but "flexible payment terms" is too vague to extract. Your prompt must normalize the former while flagging the latter. The key insight is preserving the original phrasing alongside normalized data — this creates an audit trail and allows humans to verify that normalization was correct. The ambiguity flag is critical: it prevents the model from guessing when terms are genuinely unclear.',
    skills: ['terminology_normalization', 'variation_handling', 'ambiguity_detection', 'audit_trail_creation']
  },
  {
    id: 'rp_004',
    type: 'prompt_construction',
    domain: 'role_prompting',
    difficulty: 'expert',
    title: 'The Perspective Shift',
    timeLimit: 600,
    points: 170,
    context: 'A product team uses AI to evaluate feature proposals. They want the AI to analyze each proposal from three distinct perspectives: user value, technical feasibility, and business impact. Each perspective must use different evaluation criteria and potentially reach different conclusions.',
    targetOutput: 'A prompt that forces the model to adopt genuinely different perspectives with different priorities, allows disagreement between perspectives, and synthesizes into a balanced recommendation.',
    brokenPrompt: 'Evaluate this feature proposal from user, technical, and business perspectives. Provide a recommendation.',
    referencePrompt: 'Evaluate feature proposal from three distinct perspectives. Each perspective must be analyzed separately before synthesis.\n\nPERSPECTIVE 1: USER VALUE ANALYST\nRole: Advocate for user needs and experience\nEvaluation criteria:\n- Does this solve a real user problem? (evidence required)\n- How many users are affected? (estimate with confidence level)\n- What is the impact on user workflows? (specific scenarios)\n- Are there usability risks? (identify potential friction)\nPriority: User problem severity > User count > Implementation elegance\nOutput: USER VALUE SCORE (1-10) with justification\n\nPERSPECTIVE 2: TECHNICAL FEASIBILITY ANALYST\nRole: Assess implementation complexity and risks\nEvaluation criteria:\n- Technical complexity (low/medium/high with specific challenges)\n- Dependencies on other systems (list with risk assessment)\n- Maintenance burden (ongoing cost estimate)\n- Technical debt implications (does this create or reduce debt?)\nPriority: System stability > Development time > Code quality\nOutput: FEASIBILITY SCORE (1-10) with justification\n\nPERSPECTIVE 3: BUSINESS IMPACT ANALYST\nRole: Evaluate business value and opportunity cost\nEvaluation criteria:\n- Revenue impact (direct or indirect, with reasoning)\n- Competitive positioning (does this match or exceed competitors?)\n- Strategic alignment (fits company direction?)\n- Opportunity cost (what are we not building instead?)\nPriority: Revenue impact > Strategic fit > Competitive parity\nOutput: BUSINESS SCORE (1-10) with justification\n\nSYNTHESIS:\nAfter completing all three perspectives:\n1. Identify where perspectives agree\n2. Identify where perspectives conflict (be explicit about disagreements)\n3. Provide weighted recommendation: User Value 40%, Feasibility 30%, Business 30%\n4. State key trade-offs clearly\n5. Recommend: Build Now / Build Later / Don\'t Build\n\nIMPORTANT:\n- Each perspective must evaluate independently\n- Perspectives are allowed to disagree\n- Do not force consensus where disagreement exists\n- Synthesis must acknowledge conflicts, not hide them',
    successCriteria: [
      { id: 'c1', label: 'Distinct Perspectives', description: 'Each perspective has different priorities and criteria', maxPoints: 30 },
      { id: 'c2', label: 'Independent Evaluation', description: 'Perspectives evaluate separately before synthesis', maxPoints: 25 },
      { id: 'c3', label: 'Disagreement Allowed', description: 'Explicitly permits and surfaces conflicts', maxPoints: 25 },
      { id: 'c4', label: 'Synthesis Logic', description: 'Combines perspectives with clear weighting and trade-offs', maxPoints: 20 }
    ],
    explanation: 'Multi-perspective analysis fails when perspectives are superficially different but use the same underlying priorities. A user analyst and business analyst who both prioritize revenue aren\'t genuinely different perspectives. The fix is defining distinct evaluation criteria and priority hierarchies for each perspective. The key insight is that disagreement between perspectives is valuable — it surfaces trade-offs that a single-perspective analysis would miss. Your synthesis should acknowledge conflicts explicitly rather than forcing artificial consensus.',
    skills: ['perspective_design', 'evaluation_criteria', 'conflict_surfacing', 'synthesis_logic']
  },
  {
    id: 'cm_005',
    type: 'scenario_simulation',
    domain: 'context_management',
    difficulty: 'expert',
    title: 'The Knowledge Base Architect',
    timeLimit: 0,
    points: 190,
    scenario: 'A company has 500+ internal documents (policies, procedures, technical docs, FAQs) that employees need to reference. Currently, employees spend hours searching. You need to design an AI system that answers questions using these documents accurately, cites sources, and handles questions that span multiple documents.',
    role: 'Knowledge Systems Architect',
    objective: 'Design the complete system for document ingestion, indexing, retrieval, answer generation, and citation, including accuracy validation and update mechanisms.',
    requiredElements: [
      'Document ingestion and preprocessing strategy',
      'Indexing approach for efficient retrieval',
      'Query understanding and document selection logic',
      'Answer generation with source citation',
      'Accuracy validation mechanism',
      'Handling questions that require multiple documents',
      'Update process when documents change',
      'Fallback for questions not covered by documents'
    ],
    scoringRubric: [
      { id: 'r1', label: 'System Architecture', description: 'Complete flow from document to answer defined', maxPoints: 25 },
      { id: 'r2', label: 'Retrieval Strategy', description: 'Efficient method for finding relevant documents', maxPoints: 20 },
      { id: 'r3', label: 'Citation Mechanism', description: 'Ensures answers include specific source references', maxPoints: 25 },
      { id: 'r4', label: 'Accuracy Validation', description: 'Includes checks to prevent hallucination', maxPoints: 20 },
      { id: 'r5', label: 'Multi-Document Handling', description: 'Addresses questions spanning multiple sources', maxPoints: 10 }
    ],
    explanation: 'Knowledge base systems must balance retrieval accuracy (finding the right documents) with answer accuracy (not hallucinating beyond what documents say). The most common failure is the model confidently answering questions using information not in the retrieved documents. The fix is a two-stage approach: (1) retrieve relevant documents with confidence scores, (2) generate answer with explicit instruction to only use retrieved documents and cite sources. The key insight is that "I don\'t have information on that in our knowledge base" is a valid answer. It\'s better than a confident hallucination that employees trust and act on.',
    skills: ['knowledge_systems', 'retrieval_logic', 'citation_enforcement', 'hallucination_prevention']
  },
  {
    id: 'pe_007',
    type: 'live_challenge',
    domain: 'prompt_engineering',
    difficulty: 'expert',
    title: 'The Constraint Optimizer',
    timeLimit: 600,
    points: 180,
    scenario: 'A content team needs AI to generate social media posts. Requirements: under 280 characters, include exactly one emoji, include exactly one hashtag, mention the brand name, include a call-to-action, maintain brand voice (professional but approachable), and avoid banned words. Current prompts violate constraints 30% of the time.',
    requirements: [
      'Enforce all constraints simultaneously',
      'Provide validation logic the model can self-check',
      'Handle constraint conflicts (e.g., fitting everything in 280 chars)',
      'Define what happens when constraints cannot all be met',
      'Maintain quality while satisfying constraints'
    ],
    constraints: [
      'Must work for any product or campaign',
      'Prompt must be under 250 words',
      'Must achieve 95%+ constraint compliance'
    ],
    exampleOutput: 'A prompt that enforces all constraints with validation, handles conflicts, and produces compliant posts consistently.',
    successCriteria: [
      { id: 'c1', label: 'All Constraints Defined', description: 'Lists all requirements explicitly with measurable criteria', maxPoints: 25 },
      { id: 'c2', label: 'Validation Logic', description: 'Includes self-check before outputting', maxPoints: 25 },
      { id: 'c3', label: 'Conflict Handling', description: 'Defines priority when constraints conflict', maxPoints: 25 },
      { id: 'c4', label: 'Quality Maintenance', description: 'Ensures constraints don\'t destroy content quality', maxPoints: 25 }
    ],
    explanation: 'Multi-constraint prompts fail when constraints aren\'t enforced explicitly and when there\'s no validation step. The model will violate constraints it doesn\'t see as critical. The fix is listing all constraints explicitly, defining priority order for conflicts, and including a validation step where the model checks its own output before submitting. The key insight is that validation must be part of the prompt, not a separate step. By forcing the model to validate before outputting, you catch constraint violations before they reach production.',
    skills: ['constraint_enforcement', 'validation_logic', 'priority_ordering', 'quality_preservation']
  }
];

export default DRILLS;

export function getDrillsByDomain(domain: DrillDomain): AnyDrill[] {
  return DRILLS.filter((d) => d.domain === domain);
}

export function getDrillsByType(type: DrillType): AnyDrill[] {
  return DRILLS.filter((d) => d.type === type);
}

export function getDrillById(id: string): AnyDrill | undefined {
  return DRILLS.find((d) => d.id === id);
}

export function getNextDrill(currentId: string, domain?: DrillDomain): AnyDrill | undefined {
  const drills = domain ? getDrillsByDomain(domain) : DRILLS;
  const currentIndex = drills.findIndex((d) => d.id === currentId);
  if (currentIndex === -1 || currentIndex === drills.length - 1) return undefined;
  return drills[currentIndex + 1];
}

export const DRILL_COUNT = DRILLS.length;
