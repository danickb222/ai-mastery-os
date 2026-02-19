import type { Topic } from "../../types/topic";

export const week02: Topic[] = [
  {
    id: "w02-t01-system-user-separation",
    weekNumber: 2, phase: 1, domain: "Prompt Engineering",
    title: "System vs User Message Separation",
    lesson: [
      { type: "text", content: "Modern LLM APIs use message roles: system, user, assistant. The system message sets persistent behavior rules. The user message provides per-request input. Mixing these is the #1 architectural mistake.\n\nSystem = rules that never change. User = data that changes every call." },
      { type: "callout", content: "Think factory: system message is machine configuration. User message is raw material. Configure once, feed different materials." },
      { type: "text", content: "System message contains: role definition, output format, constraints, edge case handling, security clauses.\nUser message contains: specific input data, per-request parameters. Nothing else." },
    ],
    examples: [
      { title: "Properly Separated", input: "System: You are a sentiment classifier. Respond with exactly one word: positive, negative, or neutral. Do not explain. If uncertain, respond neutral.\n\nUser: \"The food was okay but the service was terrible.\"", output: "negative", explanation: "System has all rules. User has only data. Behaves identically regardless of input." },
    ],
    drills: [
      { id: "w02-t01-d1", type: "rewrite", prompt: "Separate into system and user messages:\n\"You are a helpful assistant. Please summarize the following article in 3 bullet points, under 100 words. Be professional. Article: [text]\"", requiredElements: ["system with rules", "user with only data", "clear separation"], evaluationCriteria: ["Rules in system message", "Only article in user message", "No rule leakage"] },
      { id: "w02-t01-d2", type: "design", prompt: "Design the system message for an email router classifying into: sales, support, billing, partnerships, spam. Must handle ANY email as user input.", requiredElements: ["role", "department descriptions", "output format", "edge cases", "classification rules"], evaluationCriteria: ["Clear role", "All departments with criteria", "Exact output format", "Handles ambiguous emails", "Works with any input"] },
    ],
    challenge: {
      id: "w02-t01-ch", type: "prompt_engineering",
      scenario: "Design a system/user architecture for a product review analyzer processing reviews from Amazon, Yelp, Google. Extract: sentiment, star rating estimate, product aspects, purchase likelihood. System message must be platform-agnostic.",
      constraints: ["System message has ALL rules", "User message has ONLY review text", "Works for 1-word to 1000-word reviews", "Handles sarcasm", "Handles multiple languages"],
      requiredSections: ["Complete system message", "User message template", "Output schema", "Sarcasm and language handling"],
    },
    rubric: [
      { id: "w02-t01-r1", dimension: "Separation discipline", description: "Clean division between rules and data", weight: 0.3 },
      { id: "w02-t01-r2", dimension: "System completeness", description: "Handles all scenarios without user-side rules", weight: 0.3 },
      { id: "w02-t01-r3", dimension: "Schema precision", description: "Output fully typed and unambiguous", weight: 0.2 },
      { id: "w02-t01-r4", dimension: "Robustness", description: "Handles sarcasm, short reviews, non-English", weight: 0.2 },
    ],
    reviewSummary: "System = permanent rules. User = per-request data only. Never mix. System must handle any user input without modification.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 100,
  },
  {
    id: "w02-t02-role-prompting",
    weekNumber: 2, phase: 1, domain: "Prompt Engineering",
    title: "Role Prompting & Persona Design",
    lesson: [
      { type: "text", content: "Role prompting constrains behavior by giving the model a specific identity with expertise, limitations, and style. A well-designed role narrows output space more than any other technique.\n\nBad: 'You are a helpful assistant.' (constrains nothing)\nGood: 'You are a senior DB architect with 15 years PostgreSQL experience. Direct recommendations only. Never suggest solutions you haven't used in production.'" },
      { type: "text", content: "Effective roles define:\n1. Expertise boundary — what it knows and doesn't\n2. Communication style — tone, length, technicality\n3. Decision framework — how it recommends\n4. Limitations — what it refuses to do" },
    ],
    examples: [
      { title: "Weak vs. Strong Role", input: "Weak: 'You are a coding assistant.'\nStrong: 'You are a Python code reviewer. Only comment on bugs, security, and performance. Ignore style. Rate findings as critical/major/minor. Never rewrite code — describe issue and fix.'", output: "Strong role produces consistent, focused reviews. Weak role produces everything from tutoring to style opinions.", explanation: "Strong role has expertise boundary, style, framework, and limitations." },
    ],
    drills: [
      { id: "w02-t02-d1", type: "build", prompt: "Design a role for a financial risk analyst. Must: focus only on downside risks, give probability estimates, refuse investment recommendations, communicate in bullet points only.", requiredElements: ["expertise boundary", "style", "framework", "limitations"], evaluationCriteria: ["Defines expertise", "Specifies format and tone", "Includes evaluation method", "States refusals"] },
      { id: "w02-t02-d2", type: "compare", prompt: "Write two role prompts for analyzing a business plan — 'supportive mentor' and 'skeptical investor.' Show how same input produces different outputs. Explain which is better for which use case.", requiredElements: ["mentor role", "investor role", "output differences", "use case match"], evaluationCriteria: ["Both well-constrained", "Clear output differences", "Identifies use cases", "Neither is generic"] },
    ],
    challenge: {
      id: "w02-t02-ch", type: "prompt_engineering",
      scenario: "Design a role for a legal contract reviewer used by non-lawyers. Must translate complex legal language to plain English, identify top risks, rate severity, and never provide actual legal advice.",
      constraints: ["Precise expertise boundary", "Liability disclaimer mechanism", "Non-expert communication style", "Handles uninterpretable clauses", "Useful despite refusing legal advice"],
      requiredSections: ["Role with expertise boundary", "Communication style rules", "Risk assessment framework", "Disclaimer mechanism", "Uncertainty handling"],
    },
    rubric: [
      { id: "w02-t02-r1", dimension: "Role precision", description: "Clear expertise boundary and limitations", weight: 0.3 },
      { id: "w02-t02-r2", dimension: "Safety design", description: "Appropriate disclaimers and refusal boundaries", weight: 0.25 },
      { id: "w02-t02-r3", dimension: "Audience fit", description: "Style matches non-expert audience", weight: 0.25 },
      { id: "w02-t02-r4", dimension: "Utility", description: "Genuinely useful despite constraints", weight: 0.2 },
    ],
    reviewSummary: "Good roles define expertise boundary, communication style, decision framework, and limitations. Generic roles constrain nothing.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 100,
  },
  {
    id: "w02-t03-step-reasoning",
    weekNumber: 2, phase: 1, domain: "Prompt Engineering",
    title: "Step-by-Step Reasoning Control",
    lesson: [
      { type: "text", content: "Chain-of-thought forces the model to show work before answering. This improves accuracy and makes errors debuggable. But 'think step by step' is not enough.\n\nIn production, define: exact steps, their order, and what each produces. Unstructured reasoning produces inconsistent paths." },
      { type: "callout", content: "Never use open-ended chain-of-thought in production. Define: how many steps, step names, and per-step output." },
    ],
    examples: [
      { title: "Structured CoT", input: "Analyze in exactly 4 steps:\nStep 1 MARKET: Size and competition (2-3 sentences)\nStep 2 RISKS: Top 3 with likelihood\nStep 3 REQUIREMENTS: Regulatory, operational, financial\nStep 4 VERDICT: Go/No-go with confidence 0-100", output: "Consistent dimensions every time, making outputs comparable across analyses.", explanation: "Structured version guarantees same reasoning path. RISKS section always exists with same format." },
    ],
    drills: [
      { id: "w02-t03-d1", type: "build", prompt: "Design a 5-step reasoning framework for evaluating whether a software feature should be built. Each step: name, required output, max length.", requiredElements: ["5 named steps", "output per step", "length limits", "final decision"], evaluationCriteria: ["5 clear steps", "Each defines output", "Length constrained", "Clear decision format"] },
      { id: "w02-t03-d2", type: "debug", prompt: "This prompt skips steps and jumps to conclusion. Fix:\n\"Analyze step by step. Consider pros, cons, risks. Give recommendation.\"", requiredElements: ["diagnosis", "mandatory markers", "per-step output", "fixed prompt"], evaluationCriteria: ["Identifies optional/vague steps", "Adds mandatory markers", "Defines step output format", "Prevents skipping"] },
    ],
    challenge: {
      id: "w02-t03-ch", type: "prompt_engineering",
      scenario: "Design a structured reasoning prompt for hiring decisions. Takes candidate profile and job requirements. Must produce transparent, auditable, comparable recommendation across candidates.",
      constraints: ["4-6 named reasoning steps", "Each step produces specific artifact", "Includes self-verification step", "Final recommendation with confidence", "Reasoning is auditable"],
      requiredSections: ["Named steps", "Per-step output", "Self-verification", "Recommendation format", "Auditability"],
    },
    rubric: [
      { id: "w02-t03-r1", dimension: "Step structure", description: "Named, ordered, defined output per step", weight: 0.3 },
      { id: "w02-t03-r2", dimension: "Consistency", description: "Same path for every candidate", weight: 0.25 },
      { id: "w02-t03-r3", dimension: "Verification", description: "Self-check before final answer", weight: 0.25 },
      { id: "w02-t03-r4", dimension: "Auditability", description: "Each step traceable and reviewable", weight: 0.2 },
    ],
    reviewSummary: "Define exact steps, order, and per-step outputs. Never use open-ended CoT. Always add a self-check step. Per-step formats ensure consistency.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 100,
  },
  {
    id: "w02-t04-output-constraints",
    weekNumber: 2, phase: 1, domain: "Prompt Engineering",
    title: "Output Constraints & Boundaries",
    lesson: [
      { type: "text", content: "Three types of constraints:\n1. Positive: 'Always include...' / 'Must contain...'\n2. Negative: 'Never mention...' / 'Do not include...'\n3. Boundary: 'Exactly 5 items' / 'Between 50-100 words'\n\nStack constraints to narrow output space. But ensure no contradictions." },
    ],
    examples: [
      { title: "Constraint Stacking", input: "- Exactly 3 bullets\n- Each under 20 words\n- Each must contain a number\n- No 'very', 'really', 'significantly'\n- End each with period, not exclamation", output: "• CAC dropped 23% after referral program.\n• Response time improved from 4.2h to 47min.\n• MRR grew to $2.1M from $890K.", explanation: "Five stacked constraints produce dense, precise output." },
    ],
    drills: [
      { id: "w02-t04-d1", type: "build", prompt: "Design 6+ output constraints for product feature announcements. Control: length, tone, structure, forbidden content, required content, format.", requiredElements: ["length", "tone", "structure", "forbidden", "required", "format"], evaluationCriteria: ["6+ distinct constraints", "All categories covered", "No contradictions", "Testable"] },
      { id: "w02-t04-d2", type: "debug", prompt: "Find contradictions and fix:\n1. 'Keep under 50 words'\n2. 'Include detailed explanation of each point'\n3. 'List at least 5 examples'\n4. 'Do not use bullet points or lists'\n5. 'Present in scannable list format'", requiredElements: ["concise vs detailed conflict", "list contradiction", "word count impossibility", "fixed constraints"], evaluationCriteria: ["Spots concise/detailed conflict", "Spots list contradiction", "Notes 50 words can't hold 5 detailed items", "Provides consistent replacements"] },
    ],
    challenge: {
      id: "w02-t04-ch", type: "prompt_engineering",
      scenario: "Design a constraint system for a medical symptom checker chatbot. Must be useful while never crossing into diagnosis. Cover: what it can say, must never say, format, safety disclaimers, escalation triggers, language boundaries.",
      constraints: ["8+ non-contradicting constraints", "Positive, negative, and boundary types", "Safety-critical for medical context", "Escalation rules for emergencies", "Each constraint is testable"],
      requiredSections: ["Positive constraints", "Negative constraints", "Boundary constraints", "Safety constraints", "Escalation rules"],
    },
    rubric: [
      { id: "w02-t04-r1", dimension: "Coverage", description: "All three constraint types, 8+ total", weight: 0.25 },
      { id: "w02-t04-r2", dimension: "Non-contradiction", description: "No conflicting constraints", weight: 0.25 },
      { id: "w02-t04-r3", dimension: "Safety", description: "Medical safety constraints thorough", weight: 0.25 },
      { id: "w02-t04-r4", dimension: "Testability", description: "Each constraint verifiable in output", weight: 0.25 },
    ],
    reviewSummary: "Three constraint types: positive, negative, boundary. Stack to narrow output space. No contradictions. Every constraint must be testable.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 100,
  },
];
