import type { Topic } from "../../types/topic";

export const week12: Topic[] = [
  {
    id: "w12-t01-prompt-to-workflow",
    weekNumber: 12, phase: 3, domain: "AI System Design",
    title: "From Prompt to Workflow",
    lesson: [
      { type: "text", content: "A single prompt solves a single task. A workflow chains multiple prompts and logic to solve complex problems. The jump from prompt to workflow is the jump from operator to system designer.\n\nWorkflow anatomy:\n1. Trigger: What starts the workflow\n2. Steps: Sequence of operations (prompts, logic, data transforms)\n3. Data flow: What each step passes to the next\n4. Error handling: What happens when a step fails\n5. Output: Final deliverable" },
      { type: "text", content: "Design principle: Each step should do ONE thing well. A step that does three things is three steps that happen to share a prompt. Separate them.\n\nAnti-pattern: One massive prompt that tries to do everything. This is brittle, undebugable, and untestable." },
    ],
    examples: [
      { title: "Workflow Design", input: "Task: Process customer feedback into action items\n\nStep 1: CLASSIFY — Categorize feedback (product/service/billing/other)\nStep 2: EXTRACT — Pull specific issues mentioned\nStep 3: PRIORITIZE — Rank issues by frequency and severity\nStep 4: GENERATE — Create action items for each priority issue\nStep 5: FORMAT — Structure as weekly report\n\nData flow: Raw feedback → categories → issues → ranked issues → action items → report", output: "5 discrete steps, each with one responsibility and clear data passing.", explanation: "Each step can be tested, debugged, and improved independently. If classification breaks, you fix step 1 without touching steps 2-5." },
    ],
    drills: [
      { id: "w12-t01-d1", type: "design", prompt: "Decompose this monolithic task into a multi-step workflow:\n'Take a job posting, find matching candidates in our database, rank them, and send personalized outreach emails.'\nDefine each step, its input/output, and the data flow between steps.", requiredElements: ["step decomposition", "input/output per step", "data flow diagram", "error handling"], evaluationCriteria: ["Each step does one thing", "Data flow is explicit", "Error handling at each step", "Steps are independently testable"] },
      { id: "w12-t01-d2", type: "analyze", prompt: "This workflow has a critical design flaw:\nStep 1: Extract data from document\nStep 2: Validate and enrich data\nStep 3: Generate report\n\nIf Step 1 extracts wrong data, Steps 2-3 produce a confident wrong report. Design safeguards.", requiredElements: ["flaw identification", "validation gates", "confidence passing", "human checkpoint"], evaluationCriteria: ["Identifies cascading error risk", "Adds inter-step validation", "Confidence propagates through steps", "Human review at critical points"] },
    ],
    challenge: {
      id: "w12-t01-ch", type: "system_design",
      scenario: "Design a complete workflow for processing insurance claims. The workflow takes a raw claim submission and produces: a classified claim, extracted key data, preliminary assessment, required documentation checklist, and assignment to the right adjuster team.\n\nThe workflow must handle: simple claims (auto-process), complex claims (human review), and fraudulent claims (flag and escalate).",
      constraints: ["At least 6 discrete steps", "Each step has defined input/output schema", "Error handling at every step", "Three processing paths (simple/complex/fraud)", "Human-in-the-loop at appropriate points", "End-to-end data flow documented"],
      requiredSections: ["Step definitions with I/O", "Data flow diagram", "Branching logic", "Error handling per step", "Human checkpoints", "End-to-end example"],
    },
    rubric: [
      { id: "w12-t01-r1", dimension: "Decomposition", description: "Steps are well-separated with single responsibility", weight: 0.25 },
      { id: "w12-t01-r2", dimension: "Data flow", description: "Clear I/O contracts between steps", weight: 0.25 },
      { id: "w12-t01-r3", dimension: "Error handling", description: "Each step has failure behavior defined", weight: 0.25 },
      { id: "w12-t01-r4", dimension: "Routing logic", description: "Three paths correctly implemented", weight: 0.25 },
    ],
    reviewSummary: "Workflows chain prompts and logic. Each step: one responsibility, defined I/O, error handling. Anti-pattern: one massive prompt. Design principle: separate, test independently, handle errors per step.",
    artifactType: "workflow_blueprint", passThreshold: 80, xpValue: 175,
  },
  {
    id: "w12-t02-triggers-actions",
    weekNumber: 12, phase: 3, domain: "AI System Design",
    title: "Trigger → Action → Output",
    lesson: [
      { type: "text", content: "Every AI system follows the pattern: something triggers it, it performs actions, and it produces output. Clear trigger-action-output (TAO) design prevents systems from doing the wrong thing at the wrong time.\n\nTrigger types:\n1. Event: New email arrives, form submitted, file uploaded\n2. Schedule: Every hour, daily at 9am, weekly\n3. Threshold: Metric crosses limit, queue exceeds capacity\n4. Manual: User clicks button, admin initiates\n5. Cascade: Output of another system triggers this one" },
      { type: "text", content: "Action design rules:\n- Actions must be idempotent when possible (running twice = same result)\n- Actions must be reversible or have undo mechanisms\n- Actions must log what they did\n- Actions must have timeout limits\n- Actions must have failure fallbacks" },
    ],
    examples: [
      { title: "TAO Design", input: "Trigger: New support ticket created\nValidation: Ticket has subject and body (reject if empty)\nAction 1: Classify priority (P1-P4)\nAction 2: Route to department\nAction 3: If P1, notify on-call engineer\nOutput: Classified, routed ticket with notification status\nFallback: If classification fails, route to general queue as P2", output: "Clear trigger, validated input, sequenced actions, defined output, fallback.", explanation: "Nothing ambiguous. Every path is defined, including the failure path." },
    ],
    drills: [
      { id: "w12-t02-d1", type: "build", prompt: "Design a TAO system for automated invoice processing: trigger (email with attachment), actions (extract data, validate, match to PO, flag discrepancies), output (processed invoice or exception report). Include all validation, fallbacks, and logging.", requiredElements: ["trigger definition", "input validation", "action sequence", "output schema", "fallbacks", "logging"], evaluationCriteria: ["Trigger is specific", "Validation catches bad input", "Actions are ordered correctly", "Fallbacks for each action", "Logging captures key decisions"] },
      { id: "w12-t02-d2", type: "harden", prompt: "This TAO design has problems:\nTrigger: User uploads file\nAction: Process file with AI\nOutput: Results\n\nWhat's missing? Add: input validation, action decomposition, error handling, output schema, fallbacks, timeout, and idempotency.", requiredElements: ["input validation", "decomposed actions", "error handling", "output schema", "timeout", "idempotency"], evaluationCriteria: ["Validates file type/size/content", "Action decomposed into steps", "Each step has error handling", "Output schema defined", "Timeout prevents hanging", "Idempotent design"] },
    ],
    challenge: {
      id: "w12-t02-ch", type: "system_design",
      scenario: "Design a complete TAO system for a content publishing pipeline. Triggers: author submits draft, editor approves, scheduled publish time. Actions: AI review, SEO optimization, image generation, compliance check, publishing. Outputs: published content or rejection with reasons.",
      constraints: ["Multiple trigger types (event, manual, schedule)", "At least 5 distinct actions with I/O", "Idempotent actions where possible", "Rollback mechanism for published content", "Complete logging of all decisions", "Timeout and retry for each action"],
      requiredSections: ["Trigger definitions", "Action sequence with I/O", "Idempotency design", "Rollback mechanism", "Logging strategy", "Timeout and retry policies"],
    },
    rubric: [
      { id: "w12-t02-r1", dimension: "Trigger design", description: "Multiple trigger types properly defined", weight: 0.25 },
      { id: "w12-t02-r2", dimension: "Action quality", description: "Actions are idempotent, logged, and reversible", weight: 0.25 },
      { id: "w12-t02-r3", dimension: "Error resilience", description: "Timeouts, retries, and fallbacks for each action", weight: 0.25 },
      { id: "w12-t02-r4", dimension: "Completeness", description: "All paths including failures fully defined", weight: 0.25 },
    ],
    reviewSummary: "TAO: Trigger → Action → Output. Actions must be idempotent, reversible, logged, with timeouts and fallbacks. Every path including failures must be defined.",
    artifactType: "workflow_blueprint", passThreshold: 80, xpValue: 175,
  },
  {
    id: "w12-t03-workflow-patterns",
    weekNumber: 12, phase: 3, domain: "AI System Design",
    title: "Common Workflow Patterns",
    lesson: [
      { type: "text", content: "Most AI workflows follow a few common patterns. Knowing these saves you from reinventing architecture every time.\n\nPatterns:\n1. Pipeline: A → B → C → D (linear, each step feeds next)\n2. Fan-out/Fan-in: Split input, process in parallel, merge results\n3. Router: Classify input, route to different processing paths\n4. Loop: Iterate until quality threshold met\n5. Supervisor: Orchestrator decides which step to run next\n6. Fallback chain: Try A, if fails try B, if fails try C" },
    ],
    examples: [
      { title: "Router Pattern", input: "Input: Customer message\nRouter: Classify as complaint/question/feedback/spam\n\nComplaint path: Extract issue → assess severity → generate response → queue for review\nQuestion path: Search FAQ → generate answer → confidence check → deliver or escalate\nFeedback path: Categorize → store → if actionable, create ticket\nSpam path: Log and discard", output: "One input, four completely different processing paths.", explanation: "The router pattern handles diverse inputs by sending each to the right specialized pipeline." },
    ],
    drills: [
      { id: "w12-t03-d1", type: "design", prompt: "Design a fan-out/fan-in workflow for analyzing a business document. Fan-out: simultaneously extract financial data, legal risks, and market mentions. Fan-in: merge all three analyses into a unified report. Handle: one analysis failing while others succeed.", requiredElements: ["fan-out design", "parallel processing", "fan-in merge logic", "partial failure handling"], evaluationCriteria: ["Clear parallel paths", "Independent processing", "Merge logic handles missing data", "Partial failure is graceful"] },
      { id: "w12-t03-d2", type: "build", prompt: "Design a quality loop workflow for generating marketing copy. The loop: generate → evaluate → if score < 80, revise → re-evaluate. Define: max iterations, what feedback passes between iterations, exit conditions (pass, max iterations, diminishing returns).", requiredElements: ["loop structure", "evaluation criteria", "feedback mechanism", "exit conditions"], evaluationCriteria: ["Loop is well-defined", "Evaluation is specific", "Feedback improves next iteration", "All exit conditions covered"] },
    ],
    challenge: {
      id: "w12-t03-ch", type: "system_design",
      scenario: "Design a document processing system that handles: contracts, invoices, reports, and correspondence. Each document type requires different processing. Some documents need multiple analyses. The system must handle 500+ documents per day with varying quality.",
      constraints: ["Must use router pattern for document classification", "Must use pipeline pattern for each document type", "Must use fan-out for documents needing multiple analyses", "Must include a quality loop for low-confidence outputs", "Must include fallback chain for processing failures"],
      requiredSections: ["Router design", "Per-type pipeline definitions", "Fan-out scenarios", "Quality loop parameters", "Fallback chain", "Throughput and scaling considerations"],
    },
    rubric: [
      { id: "w12-t03-r1", dimension: "Pattern application", description: "Multiple patterns correctly applied", weight: 0.3 },
      { id: "w12-t03-r2", dimension: "Integration", description: "Patterns work together coherently", weight: 0.25 },
      { id: "w12-t03-r3", dimension: "Error resilience", description: "Failures handled at every level", weight: 0.25 },
      { id: "w12-t03-r4", dimension: "Scalability", description: "Design handles stated throughput", weight: 0.2 },
    ],
    reviewSummary: "Six workflow patterns: pipeline, fan-out/fan-in, router, loop, supervisor, fallback chain. Most real systems combine 2-3 patterns. Choose based on input diversity and quality requirements.",
    artifactType: "workflow_blueprint", passThreshold: 80, xpValue: 175,
  },
];
