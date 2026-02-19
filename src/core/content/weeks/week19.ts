import type { Topic } from "../../types/topic";

export const week19: Topic[] = [
  {
    id: "w19-t01-business-translation",
    weekNumber: 19, phase: 4, domain: "Operator Strategy",
    title: "Translating Business Problems into AI Tasks",
    lesson: [
      { type: "text", content: "Most AI projects fail not because of bad models but because of bad problem translation. A business stakeholder says 'we need AI to improve customer satisfaction.' That's not a task — it's a wish.\n\nTranslation framework:\n1. What is the actual decision being made?\n2. What data is available right now?\n3. What would a human do with perfect information?\n4. Which part of that process can AI handle reliably?\n5. What's the cost of AI being wrong?" },
      { type: "text", content: "Translation anti-patterns:\n- 'Use AI for everything' → No. Identify the specific bottleneck.\n- 'AI will figure it out' → No. Define the exact input and output.\n- 'We need a chatbot' → Maybe. What problem does the chatbot solve?\n- 'Automate the whole process' → Start with the highest-value, lowest-risk step." },
    ],
    examples: [
      { title: "Problem Translation", input: "Business request: 'We need AI to reduce customer churn.'\n\nTranslation:\n1. Decision: Which customers to proactively contact\n2. Data: Usage logs, support tickets, billing history\n3. Human process: Analyst reviews data, identifies at-risk accounts\n4. AI role: Score accounts by churn risk, rank for outreach\n5. Wrong cost: False positive (unnecessary outreach) = low cost. False negative (missed churner) = high cost.\n\nResult: Build a churn risk scorer, not a chatbot.", output: "The business wanted 'AI for churn.' The operator translated it to a specific, buildable system.", explanation: "Without translation, the team would build a generic chatbot. With translation, they build a targeted risk scorer." },
    ],
    drills: [
      { id: "w19-t01-d1", type: "translate", prompt: "Translate this business request into an AI task specification:\n'Our sales team spends too much time on proposals. Can AI help?'\n\nUse the 5-question framework. Define the specific AI system that would help.", requiredElements: ["5 framework questions answered", "specific AI task defined", "input/output specified", "error cost analyzed"], evaluationCriteria: ["Questions answered concretely", "Task is specific and buildable", "I/O is well-defined", "Error costs considered"] },
      { id: "w19-t01-d2", type: "analyze", prompt: "A company wants to 'use AI to improve hiring.' List 5 different AI tasks this could mean, rank them by feasibility and impact, and recommend which to build first. Justify with the translation framework.", requiredElements: ["5 distinct AI tasks", "feasibility ranking", "impact ranking", "recommendation with justification"], evaluationCriteria: ["Tasks are genuinely different", "Feasibility assessment is realistic", "Impact considers business value", "Recommendation follows framework"] },
    ],
    challenge: {
      id: "w19-t01-ch", type: "strategy_design",
      scenario: "A mid-size law firm (50 lawyers, 200 support staff) asks you: 'We're losing to bigger firms because they're using AI. We need an AI strategy.' Translate this into a concrete, prioritized plan of specific AI systems to build.\n\nYou must identify the highest-value opportunities, assess feasibility, and produce a phased implementation roadmap.",
      constraints: ["Must identify at least 5 specific AI opportunities", "Must use the translation framework for each", "Must assess feasibility considering law firm constraints (confidentiality, accuracy)", "Must produce a phased 12-month roadmap", "Must include quick wins (month 1-3) and strategic builds (month 4-12)", "Must estimate ROI for each opportunity"],
      requiredSections: ["Opportunity identification", "Per-opportunity translation", "Feasibility assessment", "Phased roadmap", "Quick wins vs strategic builds", "ROI estimates"],
    },
    rubric: [
      { id: "w19-t01-r1", dimension: "Translation quality", description: "Vague requests converted to specific systems", weight: 0.3 },
      { id: "w19-t01-r2", dimension: "Feasibility realism", description: "Constraints of law firm context considered", weight: 0.25 },
      { id: "w19-t01-r3", dimension: "Roadmap quality", description: "Phased plan with clear milestones", weight: 0.25 },
      { id: "w19-t01-r4", dimension: "Business impact", description: "ROI estimates are grounded", weight: 0.2 },
    ],
    reviewSummary: "Translate business wishes into AI tasks with: What decision? What data? What would a human do? What can AI handle? What's the cost of being wrong? Start with highest-value, lowest-risk step.",
    artifactType: "strategy_brief", passThreshold: 80, xpValue: 225,
  },
  {
    id: "w19-t02-problem-framing",
    weekNumber: 19, phase: 4, domain: "Operator Strategy",
    title: "Problem Framing & Scope Definition",
    lesson: [
      { type: "text", content: "Framing determines everything. The same business problem framed differently leads to completely different AI solutions.\n\nFraming dimensions:\n1. Scope: What's in and out of the system's responsibility\n2. Precision: How accurate does the system need to be?\n3. Autonomy: Does it decide, recommend, or just inform?\n4. Latency: Real-time, near-real-time, or batch?\n5. Scale: 10 requests/day or 10M requests/day?" },
      { type: "text", content: "Scope creep is the #1 killer of AI projects. Start narrow:\n- V1: Classify support tickets into 5 categories\n- NOT V1: Build an AI that handles all customer service\n\nThe narrow version ships, learns, and expands. The broad version never ships." },
    ],
    examples: [
      { title: "Scope Definition", input: "Broad: 'AI-powered recruitment system'\nNarrow V1: 'Resume screening that scores candidates 1-100 on job requirement match'\n\nScope IN: Parse resume, compare to job requirements, score match\nScope OUT: Interview scheduling, compensation, cultural fit, final decision\n\nPrecision: 80%+ agreement with human screener\nAutonomy: Recommend (rank), human decides\nLatency: Batch (process overnight)\nScale: 500 resumes/week", output: "From vague to buildable in one framing exercise.", explanation: "The narrow version can be built, tested, and deployed in weeks. The broad version would take years and probably fail." },
    ],
    drills: [
      { id: "w19-t02-d1", type: "design", prompt: "Frame an AI project for 'automating financial report generation.' Define: scope (in/out), precision requirements, autonomy level, latency, and scale. Then define V1, V2, and V3 with expanding scope.", requiredElements: ["scope in/out", "5 framing dimensions", "V1/V2/V3 definitions", "expansion rationale"], evaluationCriteria: ["V1 is genuinely narrow and buildable", "Each version meaningfully expands", "Dimensions are appropriate", "Expansion is justified"] },
      { id: "w19-t02-d2", type: "analyze", prompt: "A team's V1 scope for an AI contract review system includes: parsing contracts, identifying risks, suggesting edits, negotiating terms, and tracking compliance. Explain why this scope is too broad and propose a proper V1.", requiredElements: ["scope critique", "risk identification", "narrowed V1", "expansion path"], evaluationCriteria: ["Identifies excessive scope", "Explains shipping risk", "V1 is focused and buildable", "Path to broader scope defined"] },
    ],
    challenge: {
      id: "w19-t02-ch", type: "strategy_design",
      scenario: "A healthcare startup wants to build 'an AI system that helps doctors make better diagnoses.' Frame this into a shippable V1 with clear scope boundaries. Consider: regulatory constraints, accuracy requirements, liability, and integration with existing workflows.",
      constraints: ["V1 must be shippable within 3 months", "Must clearly define what the system does NOT do", "Must specify precision requirements with regulatory awareness", "Must define autonomy level (inform only, never diagnose)", "Must include a scope expansion roadmap (V1→V2→V3)", "Must address liability and compliance"],
      requiredSections: ["V1 scope definition (in/out)", "Framing dimensions", "Regulatory constraints", "Liability framework", "Expansion roadmap", "Success metrics for V1"],
    },
    rubric: [
      { id: "w19-t02-r1", dimension: "Scope discipline", description: "V1 is narrow, buildable, and shippable", weight: 0.3 },
      { id: "w19-t02-r2", dimension: "Regulatory awareness", description: "Healthcare constraints properly addressed", weight: 0.25 },
      { id: "w19-t02-r3", dimension: "Expansion path", description: "Clear V1→V2→V3 with rationale", weight: 0.25 },
      { id: "w19-t02-r4", dimension: "Success definition", description: "Measurable criteria for V1 success", weight: 0.2 },
    ],
    reviewSummary: "Frame with 5 dimensions: scope, precision, autonomy, latency, scale. Start narrow — V1 ships, learns, expands. Scope creep kills AI projects. Define what's OUT as clearly as what's IN.",
    artifactType: "strategy_brief", passThreshold: 80, xpValue: 225,
  },
  {
    id: "w19-t03-stakeholder-scope",
    weekNumber: 19, phase: 4, domain: "Operator Strategy",
    title: "Stakeholder Communication & Scope Management",
    lesson: [
      { type: "text", content: "Operators must communicate with non-technical stakeholders who have unrealistic expectations about AI. Your job: set expectations correctly, communicate tradeoffs clearly, and manage scope ruthlessly.\n\nKey messages stakeholders need to hear:\n1. AI is probabilistic, not perfect. Define acceptable error rates.\n2. Better AI = more time + more data + more cost. Pick two.\n3. V1 will be limited. That's intentional.\n4. Measuring success requires defining it upfront.\n5. AI systems need ongoing maintenance, not one-time setup." },
    ],
    examples: [
      { title: "Stakeholder Brief", input: "Project: AI-powered lead scoring\n\nWhat it does: Scores leads 1-100 based on likelihood to convert\nWhat it does NOT do: Predict revenue, suggest messaging, replace sales judgment\nExpected accuracy: 75-80% agreement with top salesperson's intuition\nTimeline: V1 in 6 weeks, needs 3 months of data to calibrate\nCost: $2K/month for model calls + 4 hours/week maintenance\nRisk: Cold start period where scores may be unreliable", output: "Six clear points. No hype. No jargon. Honest about limitations.", explanation: "Stakeholders who receive this brief won't be surprised when V1 isn't perfect. They'll be prepared." },
    ],
    drills: [
      { id: "w19-t03-d1", type: "build", prompt: "Write a stakeholder brief for an AI document classification system. Include: what it does, what it doesn't, expected accuracy, timeline, cost, risks, and maintenance requirements. Write for a non-technical executive audience.", requiredElements: ["capabilities", "limitations", "accuracy expectation", "timeline", "cost", "risks", "maintenance"], evaluationCriteria: ["No jargon", "Honest about limitations", "Numbers are specific", "Maintenance acknowledged"] },
      { id: "w19-t03-d2", type: "analyze", prompt: "A stakeholder says: 'The AI should be 99.9% accurate, cost nothing extra, and be ready in 2 weeks.' Explain why this is unrealistic and propose a realistic alternative that still addresses their underlying need.", requiredElements: ["reality check", "underlying need identification", "realistic alternative", "tradeoff explanation"], evaluationCriteria: ["Respectfully challenges unrealistic expectations", "Identifies what they actually need", "Alternative is achievable", "Tradeoffs clearly communicated"] },
    ],
    challenge: {
      id: "w19-t03-ch", type: "strategy_design",
      scenario: "You're presenting an AI strategy to the C-suite of a retail company. They've heard competitors are using AI and want to 'catch up.' They have a $500K annual budget and a team of 2 engineers. Design the presentation that sets realistic expectations and proposes a viable 12-month plan.",
      constraints: ["Must communicate in non-technical language", "Must set realistic expectations about AI capabilities", "Must propose 3-4 specific AI initiatives within budget", "Must include risk assessment for each initiative", "Must define success metrics the C-suite can track", "Must include ongoing costs, not just build costs"],
      requiredSections: ["Executive summary", "Realistic AI capability framing", "Proposed initiatives with ROI", "Resource requirements", "Risk assessment", "Success metrics dashboard", "12-month timeline"],
    },
    rubric: [
      { id: "w19-t03-r1", dimension: "Communication clarity", description: "Non-technical, honest, no hype", weight: 0.3 },
      { id: "w19-t03-r2", dimension: "Realism", description: "Expectations are achievable within constraints", weight: 0.25 },
      { id: "w19-t03-r3", dimension: "Strategic value", description: "Proposed initiatives address real business needs", weight: 0.25 },
      { id: "w19-t03-r4", dimension: "Completeness", description: "Budget, timeline, risks, and maintenance covered", weight: 0.2 },
    ],
    reviewSummary: "Communicate honestly: AI is probabilistic, V1 will be limited, systems need maintenance. Set expectations with specific numbers. Manage scope ruthlessly. No jargon with stakeholders.",
    artifactType: "strategy_brief", passThreshold: 80, xpValue: 225,
  },
];
