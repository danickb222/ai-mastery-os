import type { Topic } from "../../types/topic";

export const week01: Topic[] = [
  {
    id: "w01-t01-how-llms-work",
    weekNumber: 1, phase: 1, domain: "Prompt Engineering",
    title: "What LLMs Actually Do",
    lesson: [
      { type: "text", content: "An LLM is a next-token predictor. It reads your input and generates the statistically most likely continuation. It does not think or reason — it predicts.\n\nThis means: output quality is directly determined by input quality. Vague input → vague output. Structured input → structured output." },
      { type: "callout", content: "Key mental model: You are not asking a question. You are programming a text-generation machine by constraining its output space. Every word in your prompt either narrows or widens what the model can produce." },
      { type: "text", content: "Practical implications:\n1. The model has no memory between calls.\n2. It will confidently produce wrong answers if your prompt allows it.\n3. It follows the path of least resistance.\n4. Longer, more specific prompts almost always produce better results." },
    ],
    examples: [
      { title: "Vague vs. Specific", input: "Tell me about customer churn.", output: "Customer churn refers to... [generic essay]", explanation: "Without constraints, the model produces a generic overview. No signal about format, depth, or angle." },
      { title: "Constrained", input: "List exactly 5 leading indicators of customer churn for a B2B SaaS company. For each: metric name, measurement method, warning threshold. Numbered list.", output: "1. Login Frequency Drop — Weekly active logins. Warning: >30% decline over 2 weeks.\n2. Support Ticket Spike — Tickets per account/month. Warning: >3x baseline...", explanation: "Specifying count, context, structure, and format narrows the output space to only useful responses." },
    ],
    drills: [
      { id: "w01-t01-d1", type: "rewrite", prompt: "Rewrite this vague prompt into a specific, constrained prompt:\n\n\"Help me with my marketing strategy.\"", hint: "Think about: industry, channels, format, timeframe, constraints.", requiredElements: ["specific context", "output format", "at least 2 constraints", "measurable deliverable"], evaluationCriteria: ["Specifies a concrete business context", "Defines expected output format", "Includes explicit constraints", "Requests something actionable"] },
      { id: "w01-t01-d2", type: "analyze", prompt: "Analyze why this prompt produces inconsistent results:\n\n\"Summarize this article and give your thoughts.\"\n\nExplain at least 3 reasons and how to fix each.", requiredElements: ["ambiguity in summarize", "subjectivity in thoughts", "missing format", "fixes"], evaluationCriteria: ["Identifies summarize lacks length spec", "Identifies thoughts introduces randomness", "Identifies missing format", "Provides concrete fixes"] },
    ],
    challenge: {
      id: "w01-t01-ch", type: "prompt_engineering",
      scenario: "Design a prompt for a customer support system that receives raw emails and extracts: sentiment (positive/negative/neutral), issue category, urgency (1-5), and a one-sentence summary. Must produce consistent results across different email styles.",
      constraints: ["Must specify exact output format", "Must handle ambiguous or multi-issue emails", "Must define missing information behavior", "Must produce the same structure every time"],
      requiredSections: ["Output format definition", "Ambiguous input handling", "Missing info behavior", "Consistency mechanism"],
    },
    rubric: [
      { id: "w01-t01-r1", dimension: "Structure clarity", description: "Output format explicitly defined with field names and types", weight: 0.3 },
      { id: "w01-t01-r2", dimension: "Constraint specificity", description: "Constraints are measurable and unambiguous", weight: 0.25 },
      { id: "w01-t01-r3", dimension: "Edge case handling", description: "Handles ambiguous, multi-issue, or incomplete input", weight: 0.25 },
      { id: "w01-t01-r4", dimension: "Consistency design", description: "Ensures repeatable output structure", weight: 0.2 },
    ],
    reviewSummary: "LLMs are next-token predictors. Output quality = input quality. Specific, structured prompts produce consistent results. Vague prompts produce vague output.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 100,
  },
  {
    id: "w01-t02-clear-instructions",
    weekNumber: 1, phase: 1, domain: "Prompt Engineering",
    title: "Writing Clear Instructions",
    lesson: [
      { type: "text", content: "Clear instructions are unambiguous (one interpretation), complete (nothing to guess), and ordered (processed sequentially). The most common mistake is assuming the model understands context you haven't provided." },
      { type: "callout", content: "If a smart intern who knows nothing about your project could follow your instructions without asking questions, your prompt is clear enough." },
      { type: "text", content: "Pattern: 1. Role/task → 2. Input definition → 3. Output definition → 4. Constraints → 5. Edge cases" },
    ],
    examples: [
      { title: "Unclear vs. Clear", input: "Make this email better.", output: "[Model guesses: shorter? formal? fix grammar?]", explanation: "'Better' is undefined. Instead: 'Rewrite to be professional, under 100 words, with a clear call-to-action in the final sentence.'" },
    ],
    drills: [
      { id: "w01-t02-d1", type: "rewrite", prompt: "Rewrite to be unambiguous:\n\"Look at this data and tell me what's interesting.\"", requiredElements: ["specific analysis type", "output format", "defined 'interesting'"], evaluationCriteria: ["Replaces 'interesting' with criteria", "Defines output format", "Specifies analysis type"] },
      { id: "w01-t02-d2", type: "build", prompt: "Write instructions for classifying support tickets into: billing, technical, account, feedback, other. Handle: multi-category, non-English, and gibberish tickets.", requiredElements: ["category list", "single-category rule", "multi-category resolution", "language handling", "invalid input"], evaluationCriteria: ["Lists all categories", "States exactly one must be chosen", "Defines priority for ambiguous", "Handles non-English", "Handles invalid input"] },
      { id: "w01-t02-d3", type: "debug", prompt: "Find 4 problems in:\n\"You are helpful. Take the user's question and answer it well. Be concise but thorough. Use a good format.\"", requiredElements: ["vague role", "undefined 'well'", "contradiction", "undefined format", "fixes"], evaluationCriteria: ["Spots vague role", "Spots unmeasurable 'well'", "Spots concise/thorough contradiction", "Spots undefined format", "Provides fixes"] },
    ],
    challenge: {
      id: "w01-t02-ch", type: "prompt_engineering",
      scenario: "Design instructions for a prompt that takes a job description and resume, then produces a fit assessment with: match score (0-100), top 3 matching qualifications, top 3 gaps, and hiring recommendation (strong yes/yes/maybe/no).",
      constraints: ["Followable without additional context", "Every output field defined precisely", "Handle incomplete resumes", "Handle vague job descriptions", "No hedging allowed"],
      requiredSections: ["Role/task definition", "Input description", "Output format with all fields", "Edge case handling", "Anti-hedging constraint"],
    },
    rubric: [
      { id: "w01-t02-r1", dimension: "Completeness", description: "All output fields defined with types and constraints", weight: 0.3 },
      { id: "w01-t02-r2", dimension: "Unambiguity", description: "Only one valid interpretation per instruction", weight: 0.25 },
      { id: "w01-t02-r3", dimension: "Edge cases", description: "Handles incomplete or unusual input", weight: 0.25 },
      { id: "w01-t02-r4", dimension: "Actionability", description: "Produces decisive, useful output", weight: 0.2 },
    ],
    reviewSummary: "Clear instructions are unambiguous, complete, and ordered. Define role, input, output, constraints, and edge cases explicitly.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 100,
  },
  {
    id: "w01-t03-structured-formatting",
    weekNumber: 1, phase: 1, domain: "Prompt Engineering",
    title: "Structured Output Formatting",
    lesson: [
      { type: "text", content: "Three levels of format control:\n1. Natural language: 'Respond with a numbered list of 5 items'\n2. Template: 'Use this exact template: Name: ... | Score: ...'\n3. Schema: 'Respond with JSON matching this schema: {...}'\n\nRule: If code processes the output, always use schema-level formatting." },
    ],
    examples: [
      { title: "Template Formatting", input: "For each product:\nProduct: [name]\nCategory: [category]\nPrice Tier: low | mid | high\nPitch: [under 15 words]", output: "Product: SmartLamp Pro\nCategory: Smart Home\nPrice Tier: mid\nPitch: Voice-controlled lighting that adapts to your daily routine.", explanation: "Template leaves zero room for format invention. Model fills in brackets." },
    ],
    drills: [
      { id: "w01-t03-d1", type: "build", prompt: "Design a structured output template for competitor website analysis. Include: company name, value proposition, target audience, pricing model, 3 strengths, 3 weaknesses. Choose format level and justify.", requiredElements: ["all fields", "format level choice", "justification", "constraints"], evaluationCriteria: ["All sections present", "Format level justified", "Fields constrained", "Output consistent"] },
      { id: "w01-t03-d2", type: "constrain", prompt: "Add formatting constraints to force structured output:\n\"Compare these three cloud providers and help me decide.\"", requiredElements: ["comparison structure", "consistent fields", "decision framework", "format spec"], evaluationCriteria: ["Consistent comparison structure", "Same fields per provider", "Decision mechanism", "Format specified"] },
    ],
    challenge: {
      id: "w01-t03-ch", type: "prompt_engineering",
      scenario: "Design a prompt that takes a meeting transcript and produces a structured summary with: title, date, attendees, 3-5 key decisions, action items (owner + deadline), and open questions. Must work for any transcript length or formality.",
      constraints: ["Exact output structure with all fields", "Handle missing fields in transcript", "Specify max lengths", "Same structure for 2-person standup and 20-person board meeting"],
      requiredSections: ["Complete output template", "Field type definitions", "Missing field handling", "Length constraints"],
    },
    rubric: [
      { id: "w01-t03-r1", dimension: "Format precision", description: "Every field has type, constraint, and position", weight: 0.35 },
      { id: "w01-t03-r2", dimension: "Consistency", description: "Works across varying inputs", weight: 0.25 },
      { id: "w01-t03-r3", dimension: "Missing data", description: "Handles absent information", weight: 0.2 },
      { id: "w01-t03-r4", dimension: "Usability", description: "Output directly usable", weight: 0.2 },
    ],
    reviewSummary: "Three format levels: natural language, template, schema. Use schema when code processes output. Define field names, types, and constraints. Handle missing data explicitly.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 100,
  },
  {
    id: "w01-t04-verbosity-control",
    weekNumber: 1, phase: 1, domain: "Prompt Engineering",
    title: "Controlling Verbosity",
    lesson: [
      { type: "text", content: "LLMs default verbose. They pad, hedge, repeat, over-explain. In production this wastes tokens and buries useful information.\n\nEffective controls:\n1. Hard limits: 'Exactly 3 bullet points' or 'Max 50 words'\n2. Anti-padding: 'No introductory phrases, caveats, or conclusions'\n3. Density: 'Every sentence must contain new information'\n4. Stop signals: 'End immediately after the last data point'\n5. Format forcing: Structured formats naturally limit verbosity" },
    ],
    examples: [
      { title: "Controlled Output", input: "List exactly 3 risks. Each: one-line description, likelihood (high/med/low), one-line mitigation. No intros, no conclusions.", output: "1. Data leak via injection — High — Add input sanitization.\n2. Hallucination on edge cases — Medium — Add output validation.\n3. Cost overrun from retries — Low — Set per-request budget.", explanation: "3 items × 3 fields, no filler. Token usage drops 70%+ while density increases." },
    ],
    drills: [
      { id: "w01-t04-d1", type: "constrain", prompt: "Add verbosity controls to cap at 50 words while preserving 3 key points:\n\"Explain the benefits of microservices architecture.\"", requiredElements: ["word limit", "point count", "anti-padding", "density requirement"], evaluationCriteria: ["Explicit word limit", "Point count specified", "Bans filler", "Requires density"] },
      { id: "w01-t04-d2", type: "rewrite", prompt: "Create 3 versions at different verbosity levels — '1-line', '3-bullet', and 'structured brief':\n\"What should I know about deploying ML models to production?\"", requiredElements: ["1-line with word limit", "3-bullet with constraints", "structured brief with sections"], evaluationCriteria: ["Genuine 1-line version", "Constrained bullets", "Brief with section limits"] },
    ],
    challenge: {
      id: "w01-t04-ch", type: "prompt_engineering",
      scenario: "Design a prompt for a daily executive briefing generator. Takes 10-20 articles, produces a briefing readable in under 2 minutes. Must include: top 3 stories (1 sentence each), market impact (2 sentences max), action items (max 3). Total never exceeds 150 words.",
      constraints: ["Hard 150-word limit", "Per-section word limits that sum correctly", "Anti-padding and anti-hedging rules", "Handle days with few newsworthy items", "Prioritize signal over completeness"],
      requiredSections: ["Per-section word limits", "Anti-padding rules", "Prioritization logic", "Low-input handling"],
    },
    rubric: [
      { id: "w01-t04-r1", dimension: "Length control", description: "Word limits explicit and consistent", weight: 0.3 },
      { id: "w01-t04-r2", dimension: "Density", description: "Anti-padding rules prevent filler", weight: 0.25 },
      { id: "w01-t04-r3", dimension: "Adaptability", description: "Handles variable input volume", weight: 0.25 },
      { id: "w01-t04-r4", dimension: "Usability", description: "Genuinely readable in 2 minutes", weight: 0.2 },
    ],
    reviewSummary: "Control verbosity with hard limits, anti-padding rules, density requirements, and format forcing. Always specify how many items, how many words, what to exclude.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 100,
  },
];
