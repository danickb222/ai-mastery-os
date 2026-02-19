import type { Topic } from "../../types/topic";

export const week15: Topic[] = [
  {
    id: "w15-t01-agent-fundamentals",
    weekNumber: 15, phase: 3, domain: "AI System Design",
    title: "Agent Fundamentals",
    lesson: [
      { type: "text", content: "An AI agent is a system that can plan, decide which tools to use, execute actions, observe results, and iterate. Unlike a simple prompt→response, an agent loops: think → act → observe → think again.\n\nWhen to use agents vs simple prompts:\n- Simple prompt: Single-step, well-defined task\n- Workflow: Multi-step but predetermined path\n- Agent: Dynamic multi-step where the path depends on intermediate results" },
      { type: "text", content: "Agent components:\n1. Planner: Decides what to do next\n2. Tool set: Available actions (search, calculate, lookup, write)\n3. Memory: What has been done and learned\n4. Stopping criteria: When to stop iterating\n5. Guardrails: What the agent must NOT do" },
    ],
    examples: [
      { title: "Agent vs Workflow", input: "Task: Research a company and write a summary\n\nWorkflow approach: Step 1 search → Step 2 extract → Step 3 summarize (fixed path)\nAgent approach: Search company → [if public] get financials → [if startup] find funding → [if news] get recent articles → summarize what was found (dynamic path)", output: "Agent adapts its path based on what it finds.", explanation: "The workflow always runs the same steps. The agent decides based on intermediate results — more flexible but harder to control." },
    ],
    drills: [
      { id: "w15-t01-d1", type: "design", prompt: "Design an agent for researching competitors. Define: the planning prompt, available tools (at least 5), memory structure, stopping criteria, and guardrails. The agent should produce a structured competitor analysis.", requiredElements: ["planner prompt", "5+ tools", "memory design", "stopping criteria", "guardrails"], evaluationCriteria: ["Planner is well-constrained", "Tools are practical", "Memory tracks progress", "Stops appropriately", "Guardrails prevent runaway"] },
      { id: "w15-t01-d2", type: "analyze", prompt: "An agent designed to answer customer questions keeps looping: it searches, doesn't find a good answer, searches again with slightly different terms, and repeats 20+ times before timing out. Diagnose the problem and design fixes.", requiredElements: ["loop diagnosis", "stopping criteria fix", "fallback behavior", "max iteration limit"], evaluationCriteria: ["Identifies missing stopping criteria", "Proposes iteration limits", "Adds graceful fallback", "Prevents infinite loops"] },
    ],
    challenge: {
      id: "w15-t01-ch", type: "system_design",
      scenario: "Design an AI agent for automated due diligence on potential business partners. The agent receives a company name and must: research the company, check for legal issues, verify financial health, assess reputation, and produce a structured due diligence report.\n\nThe agent must be thorough but not waste resources on low-priority leads.",
      constraints: ["Must define planner prompt with clear decision logic", "Must have at least 6 tools with defined I/O", "Must include budget awareness (max API calls per research)", "Must have tiered depth (quick scan vs deep dive based on initial findings)", "Must include guardrails against accessing restricted data", "Must produce structured output regardless of research depth"],
      requiredSections: ["Agent architecture", "Planner prompt", "Tool definitions", "Memory and state management", "Budget and depth tiers", "Guardrails", "Output format"],
    },
    rubric: [
      { id: "w15-t01-r1", dimension: "Architecture", description: "Clear agent loop with all components", weight: 0.25 },
      { id: "w15-t01-r2", dimension: "Tool design", description: "Tools are well-defined and practical", weight: 0.25 },
      { id: "w15-t01-r3", dimension: "Control", description: "Budget, stopping, and guardrails prevent runaway", weight: 0.25 },
      { id: "w15-t01-r4", dimension: "Adaptability", description: "Depth adjusts based on findings", weight: 0.25 },
    ],
    reviewSummary: "Agents loop: think → act → observe → think. Components: planner, tools, memory, stopping criteria, guardrails. Use when path depends on intermediate results. Always set iteration limits.",
    artifactType: "system_design", passThreshold: 80, xpValue: 200,
  },
  {
    id: "w15-t02-tool-reasoning",
    weekNumber: 15, phase: 3, domain: "AI System Design",
    title: "Tool Reasoning & Selection",
    lesson: [
      { type: "text", content: "Tool reasoning is the agent's ability to choose the right tool for each step. Poor tool reasoning = wasted calls, wrong tools, or missed tools.\n\nTool design principles:\n1. Each tool does ONE thing\n2. Tool descriptions must be unambiguous\n3. Input/output schemas must be explicit\n4. Include examples of when to use AND when NOT to use each tool\n5. Provide a tool selection prompt that helps the agent choose" },
      { type: "text", content: "Common tool reasoning failures:\n- Using a search tool when a lookup would suffice (expensive)\n- Using a calculation tool for estimation (overkill)\n- Not using any tool when one is clearly needed\n- Using the same tool repeatedly with slight variations (loop)\n- Using tools in wrong order (dependent steps)" },
    ],
    examples: [
      { title: "Tool Definition", input: "Tool: search_knowledge_base\nDescription: Searches the internal knowledge base for relevant articles. Use when the user's question is about company policies, procedures, or products. Do NOT use for general knowledge questions.\nInput: {query: string, max_results: number}\nOutput: {results: [{title: string, content: string, relevance: float}]}\nWhen to use: User asks about company-specific information\nWhen NOT to use: User asks general questions, math questions, or personal questions", output: "Complete tool specification with positive and negative guidance.", explanation: "The 'when NOT to use' is as important as 'when to use' for preventing tool misuse." },
    ],
    drills: [
      { id: "w15-t02-d1", type: "build", prompt: "Define a tool set (5 tools) for a customer support agent. Each tool: name, description, input/output schema, when to use, when NOT to use. Tools should cover: knowledge base search, ticket creation, order lookup, escalation, and response generation.", requiredElements: ["5 tool definitions", "I/O schemas", "positive guidance", "negative guidance"], evaluationCriteria: ["Tools are distinct", "Schemas are typed", "Guidance prevents misuse", "No overlapping responsibilities"] },
      { id: "w15-t02-d2", type: "debug", prompt: "An agent with 3 tools (search, calculate, summarize) always chooses 'search' even for math questions. The tool descriptions are:\n- search: 'Find information'\n- calculate: 'Do math'\n- summarize: 'Shorten text'\n\nDiagnose why and fix the tool descriptions.", requiredElements: ["diagnosis of vague descriptions", "improved descriptions", "selection guidance", "examples per tool"], evaluationCriteria: ["Identifies descriptions are too vague", "New descriptions are specific", "Includes when-to-use guidance", "Agent would choose correctly with fixes"] },
    ],
    challenge: {
      id: "w15-t02-ch", type: "system_design",
      scenario: "Design the complete tool set and tool reasoning system for an AI research assistant that helps analysts prepare investment memos. The agent needs tools for: data retrieval, financial calculation, document search, comparison, risk assessment, and report generation.",
      constraints: ["At least 7 tools with full specifications", "Tool selection prompt that prevents misuse", "Dependency chain (some tools require output from others)", "Cost-awareness (some tools are expensive, use sparingly)", "Fallback when preferred tool is unavailable", "Tool composition rules (which tools can be chained)"],
      requiredSections: ["Tool catalog with full specs", "Tool selection prompt", "Dependency graph", "Cost model", "Fallback strategy", "Composition rules"],
    },
    rubric: [
      { id: "w15-t02-r1", dimension: "Tool design", description: "Tools are well-specified with clear boundaries", weight: 0.25 },
      { id: "w15-t02-r2", dimension: "Selection logic", description: "Agent can reliably choose correct tool", weight: 0.25 },
      { id: "w15-t02-r3", dimension: "Dependency handling", description: "Tool chains are well-defined", weight: 0.25 },
      { id: "w15-t02-r4", dimension: "Cost awareness", description: "Expensive tools used sparingly", weight: 0.25 },
    ],
    reviewSummary: "Each tool: one job, clear description, typed I/O, when to use AND when not to use. Prevent misuse with negative examples. Define tool chains and dependencies explicitly.",
    artifactType: "system_design", passThreshold: 80, xpValue: 200,
  },
  {
    id: "w15-t03-step-planning",
    weekNumber: 15, phase: 3, domain: "AI System Design",
    title: "Agent Step Planning",
    lesson: [
      { type: "text", content: "Step planning is how an agent decides what to do next. Without good planning, agents either do too much (wasting resources) or too little (incomplete results).\n\nPlanning approaches:\n1. Plan-then-execute: Create full plan first, then execute\n2. Incremental: Plan one step, execute, plan next based on result\n3. Hierarchical: Create high-level plan, decompose each step\n4. ReAct: Reason about what to do, Act, Observe result, repeat" },
      { type: "text", content: "Planning prompt design:\n- Give the agent a clear goal\n- Show available tools\n- Require the agent to explain WHY before each action\n- Require the agent to check if the goal is met after each action\n- Set a maximum number of steps" },
    ],
    examples: [
      { title: "ReAct Pattern", input: "Goal: Find the current stock price and P/E ratio for Apple.\n\nThought: I need financial data for Apple. I'll use the stock_lookup tool.\nAction: stock_lookup({ticker: 'AAPL'})\nObservation: {price: 178.50, pe_ratio: 28.3, ...}\nThought: I have both pieces of information. Goal is met.\nFinal answer: Apple (AAPL) — Price: $178.50, P/E: 28.3", output: "Thought-action-observation loop with explicit goal checking.", explanation: "Each step has reasoning (thought), execution (action), and verification (observation). The agent explicitly checks if the goal is met." },
    ],
    drills: [
      { id: "w15-t03-d1", type: "build", prompt: "Design a planning prompt for an agent that helps users plan travel itineraries. The agent has tools for: flight search, hotel search, activity search, weather check, and budget calculator. Define the planning template and a sample 4-step execution.", requiredElements: ["planning template", "tool awareness", "goal checking", "4-step example", "budget tracking"], evaluationCriteria: ["Template is clear and reusable", "Agent reasons about tool choice", "Goal checked after each step", "Example is realistic"] },
      { id: "w15-t03-d2", type: "compare", prompt: "Compare plan-then-execute vs incremental planning for a research task: 'Analyze the competitive landscape of the EV market.' Which approach is better and why? Show a sample execution trace for each.", requiredElements: ["both approaches described", "execution traces", "comparison analysis", "recommendation"], evaluationCriteria: ["Both approaches correctly implemented", "Traces are realistic", "Comparison identifies strengths/weaknesses", "Recommendation is justified"] },
    ],
    challenge: {
      id: "w15-t03-ch", type: "system_design",
      scenario: "Design the planning system for an AI agent that automates quarterly business review preparation. The agent must gather data from multiple sources, perform analyses, identify trends, and produce a structured presentation deck outline. Different quarters may require different analyses based on business context.",
      constraints: ["Must use hierarchical planning (high-level then detailed)", "Must adapt plan based on data availability", "Must have explicit goal verification at each major step", "Must handle plan failures (data unavailable, analysis inconclusive)", "Must respect time budget (complete within defined step limit)", "Must produce traceable plan execution log"],
      requiredSections: ["High-level plan template", "Step decomposition rules", "Adaptive replanning triggers", "Goal verification protocol", "Failure handling in planning", "Execution log format"],
    },
    rubric: [
      { id: "w15-t03-r1", dimension: "Planning structure", description: "Hierarchical with clear decomposition", weight: 0.25 },
      { id: "w15-t03-r2", dimension: "Adaptability", description: "Plan adjusts based on intermediate results", weight: 0.25 },
      { id: "w15-t03-r3", dimension: "Verification", description: "Goals checked at each step", weight: 0.25 },
      { id: "w15-t03-r4", dimension: "Traceability", description: "Every decision logged and explainable", weight: 0.25 },
    ],
    reviewSummary: "Planning approaches: plan-then-execute, incremental, hierarchical, ReAct. Always: explain reasoning before action, check goal after action, set max steps. Adapt plan when reality differs from expectation.",
    artifactType: "system_design", passThreshold: 80, xpValue: 200,
  },
];
