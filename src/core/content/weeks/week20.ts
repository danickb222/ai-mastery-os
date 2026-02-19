import type { Topic } from "../../types/topic";

export const week20: Topic[] = [
  {
    id: "w20-t01-architecture-tradeoffs",
    weekNumber: 20, phase: 4, domain: "Operator Strategy",
    title: "Architecture Tradeoffs: Prompt vs RAG vs Agent",
    lesson: [
      { type: "text", content: "Every AI task can be solved multiple ways. The operator's job is choosing the right architecture — not the most impressive one.\n\nArchitecture spectrum (simplest → most complex):\n1. Single prompt: One model call, fixed behavior\n2. Prompt chain: Multiple sequential calls\n3. RAG: Retrieve context, then generate\n4. Agent: Dynamic planning with tool use\n5. Multi-agent: Multiple agents collaborating\n\nRule: Always start with the simplest architecture that could work. Only add complexity when simple fails." },
      { type: "text", content: "Decision framework:\n- Is the task well-defined with stable input/output? → Single prompt\n- Does it need external data that changes? → RAG\n- Does it need multi-step reasoning with branching? → Agent\n- Does it need different expertise for different parts? → Multi-agent\n\nComplexity costs: more latency, more cost, more failure modes, harder debugging." },
    ],
    examples: [
      { title: "Architecture Selection", input: "Task: Answer questions about company HR policies\n\nOption A (Single prompt): Embed all policies in system message\n→ ✗ Policies exceed context window\n\nOption B (RAG): Retrieve relevant policy sections, generate answer\n→ ✓ Policies are stable, questions are specific, grounding needed\n\nOption C (Agent): Search policies, cross-reference, synthesize\n→ ✗ Overkill — questions rarely need cross-referencing\n\nDecision: RAG (Option B)", output: "Considered three options, chose the simplest that works.", explanation: "The agent is cooler but unnecessary. RAG handles this perfectly with less complexity and fewer failure modes." },
    ],
    drills: [
      { id: "w20-t01-d1", type: "analyze", prompt: "For each of these tasks, recommend the simplest viable architecture and explain why more complex alternatives are unnecessary:\n1. Classifying support tickets into 5 categories\n2. Answering questions about a 500-page technical manual\n3. Planning a multi-city travel itinerary with real-time pricing\n4. Generating a weekly sales report from CRM data", requiredElements: ["architecture per task", "justification per task", "rejected alternatives", "complexity analysis"], evaluationCriteria: ["Correct architecture choices", "Simpler options preferred", "Rejections are justified", "Complexity costs acknowledged"] },
      { id: "w20-t01-d2", type: "compare", prompt: "Compare RAG vs Agent architecture for a customer support system. Analyze: latency, cost, accuracy, debuggability, failure modes, and maintenance burden. Recommend one and justify.", requiredElements: ["6-dimension comparison", "clear winner per dimension", "overall recommendation", "context-dependent caveat"], evaluationCriteria: ["All dimensions compared fairly", "Tradeoffs honestly assessed", "Recommendation is justified", "Acknowledges context matters"] },
    ],
    challenge: {
      id: "w20-t01-ch", type: "strategy_design",
      scenario: "A company wants to build 5 AI features. For each, select the optimal architecture, justify your choice, and explain what would trigger an upgrade to a more complex architecture.\n\n1. Email auto-responder for common queries\n2. Contract risk analyzer for legal team\n3. Real-time fraud detection for transactions\n4. Research assistant that synthesizes from multiple databases\n5. Automated compliance checker against evolving regulations",
      constraints: ["Must evaluate at least 2 architectures per feature", "Must select the simplest viable option", "Must define 'upgrade triggers' for each", "Must estimate cost and latency per architecture", "Must identify shared infrastructure across features", "Must produce an implementation priority order"],
      requiredSections: ["Per-feature architecture analysis", "Architecture selection with justification", "Upgrade triggers", "Cost and latency estimates", "Shared infrastructure", "Implementation roadmap"],
    },
    rubric: [
      { id: "w20-t01-r1", dimension: "Selection quality", description: "Simplest viable architecture chosen each time", weight: 0.3 },
      { id: "w20-t01-r2", dimension: "Justification depth", description: "Alternatives considered and rejected with reasoning", weight: 0.25 },
      { id: "w20-t01-r3", dimension: "Upgrade thinking", description: "Clear triggers for when to add complexity", weight: 0.25 },
      { id: "w20-t01-r4", dimension: "System thinking", description: "Shared infrastructure and implementation order", weight: 0.2 },
    ],
    reviewSummary: "Architecture spectrum: prompt → chain → RAG → agent → multi-agent. Always start simplest. Only add complexity when simple fails. Complexity costs: latency, cost, failure modes, debugging difficulty.",
    artifactType: "strategy_brief", passThreshold: 80, xpValue: 225,
  },
  {
    id: "w20-t02-when-not-to-use-ai",
    weekNumber: 20, phase: 4, domain: "Operator Strategy",
    title: "When NOT to Use AI",
    lesson: [
      { type: "text", content: "The most important skill: knowing when AI is the wrong tool. Using AI where a simple rule, database query, or human would be better is a sign of poor operator judgment.\n\nDon't use AI when:\n1. A rule-based system would be 100% accurate (e.g., tax calculations)\n2. The cost of error is catastrophic and unrecoverable\n3. The task requires real-time guarantees the model can't meet\n4. The task is simpler than it looks (regex > LLM for pattern matching)\n5. There's no way to evaluate if the AI output is correct\n6. The data is too sensitive for any model to process" },
      { type: "text", content: "Hybrid approach: Use AI for the fuzzy parts, use code for the precise parts.\n\nExample: AI classifies the email (fuzzy) → Code routes it based on classification (precise) → AI drafts response (fuzzy) → Code validates format (precise)" },
    ],
    examples: [
      { title: "AI vs Non-AI Decision", input: "Task: Validate email addresses\n\nAI approach: Send email to LLM, ask if it's valid → Expensive, slow, inconsistent\nRegex approach: ^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$ → Free, instant, 100% consistent\n\nDecision: Regex. This is not an AI task.", output: "AI is the wrong tool for a job that has a deterministic solution.", explanation: "Using AI here would be slower, more expensive, and less accurate than a 30-character regex." },
    ],
    drills: [
      { id: "w20-t02-d1", type: "evaluate", prompt: "For each task, decide: AI, non-AI, or hybrid. Justify each decision.\n1. Calculating shipping costs based on weight and destination\n2. Detecting sarcasm in customer reviews\n3. Formatting dates from various input formats\n4. Summarizing 50-page legal documents\n5. Routing requests to the correct API endpoint\n6. Generating personalized product descriptions", requiredElements: ["decision per task", "justification per task", "hybrid identification", "cost comparison"], evaluationCriteria: ["Correct AI/non-AI classification", "Justifications are sound", "Hybrid opportunities identified", "Cost awareness shown"] },
      { id: "w20-t02-d2", type: "design", prompt: "Design a hybrid system for processing insurance claims. Identify which steps should use AI (fuzzy), which should use code (precise), and which should use humans (judgment). Map the complete flow.", requiredElements: ["step breakdown", "AI/code/human assignment per step", "handoff design", "error handling per type"], evaluationCriteria: ["Assignments are appropriate", "Handoffs are clean", "AI used only where needed", "Humans involved at right points"] },
    ],
    challenge: {
      id: "w20-t02-ch", type: "strategy_design",
      scenario: "A startup wants to automate their entire customer onboarding process with AI. The process includes: account verification, document collection, data entry, compliance checks, welcome communication, and initial setup guidance.\n\nAnalyze each step and design the optimal human/AI/code split. Some steps should NOT use AI.",
      constraints: ["Must evaluate each step independently", "Must justify AI vs code vs human for each", "Must identify steps where AI would be harmful or wasteful", "Must design the hybrid system end-to-end", "Must include cost comparison: all-AI vs hybrid", "Must include error handling for each processing type"],
      requiredSections: ["Step-by-step analysis", "Processing type assignment (AI/code/human)", "Anti-AI justifications where applicable", "Hybrid system design", "Cost comparison", "Error handling matrix"],
    },
    rubric: [
      { id: "w20-t02-r1", dimension: "Judgment quality", description: "Correctly identifies where AI is wrong tool", weight: 0.3 },
      { id: "w20-t02-r2", dimension: "Hybrid design", description: "Optimal split between AI, code, and human", weight: 0.25 },
      { id: "w20-t02-r3", dimension: "Cost awareness", description: "Hybrid is cheaper and more reliable", weight: 0.25 },
      { id: "w20-t02-r4", dimension: "Completeness", description: "End-to-end system with error handling", weight: 0.2 },
    ],
    reviewSummary: "Know when NOT to use AI: deterministic tasks, catastrophic error cost, real-time guarantees, simpler alternatives, unevaluable output, sensitive data. Best systems are hybrid: AI for fuzzy, code for precise.",
    artifactType: "strategy_brief", passThreshold: 80, xpValue: 225,
  },
  {
    id: "w20-t03-build-vs-buy",
    weekNumber: 20, phase: 4, domain: "Operator Strategy",
    title: "Build vs Buy vs Assemble",
    lesson: [
      { type: "text", content: "For every AI capability, you have three options:\n1. Build: Custom prompts, custom pipeline, full control\n2. Buy: Use an AI SaaS product (pre-built solution)\n3. Assemble: Combine APIs and tools into a custom workflow\n\nDecision factors:\n- Differentiation: Is this a competitive advantage? → Build\n- Commodity: Is this a solved problem? → Buy\n- Unique combination: Standard parts, custom assembly? → Assemble\n- Timeline: Need it tomorrow? → Buy. Need it perfect? → Build\n- Data sensitivity: Can data leave your systems? → Build" },
    ],
    examples: [
      { title: "Build vs Buy Analysis", input: "Task: Document OCR and extraction\n\nBuild: Custom model fine-tuning, custom extraction pipeline\n→ 6 months, $200K, full control, high maintenance\n\nBuy: Use Document AI service (Google/AWS/Azure)\n→ 1 week, $5K/month, limited customization, vendor dependency\n\nAssemble: Buy OCR, build custom extraction prompts on top\n→ 3 weeks, $3K/month, moderate customization, moderate control\n\nDecision: Assemble (unless OCR is competitive advantage)", output: "Three options evaluated on time, cost, control, and risk.", explanation: "Assemble gets 80% of Build's customization at 20% of the cost and timeline." },
    ],
    drills: [
      { id: "w20-t03-d1", type: "analyze", prompt: "A company needs: email classification, chatbot, document summarization, and fraud detection. For each, recommend build/buy/assemble with justification. Consider: the company has 3 engineers and $100K annual AI budget.", requiredElements: ["recommendation per feature", "justification per feature", "resource constraints considered", "total budget analysis"], evaluationCriteria: ["Recommendations match constraints", "Justifications consider differentiation", "Budget is respected", "Resource allocation is realistic"] },
      { id: "w20-t03-d2", type: "design", prompt: "Design a 'technology radar' for AI capabilities — categorize common AI tasks into: always build, always buy, and depends-on-context. Define the criteria that determine each category.", requiredElements: ["three categories", "5+ tasks per category", "categorization criteria", "decision framework"], evaluationCriteria: ["Categories are well-defined", "Tasks are correctly placed", "Criteria are actionable", "Framework is reusable"] },
    ],
    challenge: {
      id: "w20-t03-ch", type: "strategy_design",
      scenario: "Design the complete AI technology strategy for a 200-person e-commerce company. They need AI for: product search, recommendation engine, customer service chatbot, fraud detection, inventory forecasting, content generation, review moderation, and pricing optimization.\n\nBudget: $300K/year. Team: 4 engineers. Timeline: 12 months to full deployment.",
      constraints: ["Must classify each capability as build/buy/assemble", "Must respect budget and team constraints", "Must produce phased implementation plan", "Must identify vendor lock-in risks", "Must include migration paths (buy now, build later)", "Must estimate TCO (total cost of ownership) for each approach"],
      requiredSections: ["Per-capability classification", "Vendor evaluation criteria", "Phased implementation plan", "Budget allocation", "Lock-in risk assessment", "Migration paths", "TCO analysis"],
    },
    rubric: [
      { id: "w20-t03-r1", dimension: "Classification quality", description: "Build/buy/assemble decisions well-justified", weight: 0.25 },
      { id: "w20-t03-r2", dimension: "Constraint awareness", description: "Budget and team limits respected", weight: 0.25 },
      { id: "w20-t03-r3", dimension: "Risk management", description: "Vendor lock-in and migration addressed", weight: 0.25 },
      { id: "w20-t03-r4", dimension: "Strategic thinking", description: "Short-term and long-term aligned", weight: 0.25 },
    ],
    reviewSummary: "Build for differentiation, buy for commodity, assemble for unique combinations. Consider: timeline, data sensitivity, budget, team size, vendor lock-in. Assemble often gives 80% of build at 20% cost.",
    artifactType: "strategy_brief", passThreshold: 80, xpValue: 225,
  },
];
