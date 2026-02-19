import type { Topic } from "../../types/topic";

export const week16: Topic[] = [
  {
    id: "w16-t01-system-guardrails",
    weekNumber: 16, phase: 3, domain: "AI System Design",
    title: "Guardrails in AI Systems",
    lesson: [
      { type: "text", content: "System-level guardrails operate across the entire AI pipeline, not just within a single prompt. They protect against: prompt failures, model misbehavior, data leaks, and cascading errors.\n\nGuardrail layers:\n1. Input layer: Validate, sanitize, rate-limit incoming requests\n2. Prompt layer: Injection defense, role enforcement, output format\n3. Output layer: Validate schema, check safety, filter PII\n4. System layer: Circuit breakers, monitoring, kill switches" },
      { type: "text", content: "Critical guardrail design principle: guardrails must be INDEPENDENT of the AI model. If the model can override a guardrail, it's not a guardrail — it's a suggestion.\n\nImplement guardrails in code, not in prompts. Prompts can be tricked. Code cannot be prompt-injected." },
    ],
    examples: [
      { title: "Layered Guardrails", input: "Input: Check file type, scan for malware, enforce size limit (code)\nPrompt: Anti-injection, role anchoring, output format (prompt)\nOutput: JSON schema validation (code), PII regex filter (code), safety classifier (separate model)\nSystem: Rate limiter (infra), circuit breaker (code), audit log (infra)", output: "Four layers with enforcement in code, not just prompts.", explanation: "Even if the AI model ignores all prompt-level guardrails, the code-level guardrails still catch problems." },
    ],
    drills: [
      { id: "w16-t01-d1", type: "design", prompt: "Design a 4-layer guardrail system for an AI chatbot that handles financial transactions. For each layer, define at least 3 guardrails and specify whether each is implemented in code or prompt.", requiredElements: ["4 layers", "3+ guardrails per layer", "code vs prompt designation", "financial safety focus"], evaluationCriteria: ["All layers covered", "Critical guardrails in code not prompt", "Financial risks addressed", "Designations are appropriate"] },
      { id: "w16-t01-d2", type: "analyze", prompt: "This system relies entirely on prompt-level guardrails:\n'Never share personal data. Never provide financial advice. Always be helpful.'\n\nExplain why this is dangerous and redesign with code-level enforcement.", requiredElements: ["prompt-only risks", "bypass scenarios", "code-level redesign", "defense in depth"], evaluationCriteria: ["Identifies injection bypass risk", "Shows specific attack scenarios", "Redesigns with code enforcement", "Multiple defense layers"] },
    ],
    challenge: {
      id: "w16-t01-ch", type: "system_design",
      scenario: "Design a comprehensive guardrail system for an AI-powered healthcare advisory platform. The system provides health information (not diagnosis) and must comply with HIPAA-like privacy requirements and never cross into medical advice territory.",
      constraints: ["Must have 4 independent guardrail layers", "Critical safety guardrails must be in code, not prompts", "Must prevent PII leakage in any direction", "Must prevent medical diagnosis/prescription", "Must include audit trail for compliance", "Must have emergency shutdown capability"],
      requiredSections: ["Input guardrails", "Prompt guardrails", "Output guardrails", "System guardrails", "Code vs prompt designation matrix", "Audit trail design", "Emergency shutdown protocol"],
    },
    rubric: [
      { id: "w16-t01-r1", dimension: "Layer completeness", description: "All 4 layers with appropriate guardrails", weight: 0.25 },
      { id: "w16-t01-r2", dimension: "Independence", description: "Critical guardrails in code, not prompts", weight: 0.25 },
      { id: "w16-t01-r3", dimension: "Privacy design", description: "PII protection is comprehensive", weight: 0.25 },
      { id: "w16-t01-r4", dimension: "Compliance", description: "Audit trail and shutdown capabilities", weight: 0.25 },
    ],
    reviewSummary: "System guardrails must be independent of the model. Implement critical ones in code, not prompts. Four layers: input, prompt, output, system. Prompts can be tricked — code cannot be prompt-injected.",
    artifactType: "system_design", passThreshold: 80, xpValue: 200,
  },
  {
    id: "w16-t02-failure-recovery",
    weekNumber: 16, phase: 3, domain: "AI System Design",
    title: "Failure Recovery Strategies",
    lesson: [
      { type: "text", content: "When an AI system fails, recovery must be fast, safe, and predictable. Recovery strategies depend on failure type and business impact.\n\nRecovery patterns:\n1. Retry: Try the same operation again (transient failures)\n2. Fallback: Switch to alternative method (model failure)\n3. Degrade: Provide reduced functionality (partial failure)\n4. Queue: Save for later processing (capacity failure)\n5. Escalate: Route to human (quality failure)\n6. Abort: Stop and report (critical failure)" },
      { type: "text", content: "Recovery design rules:\n- Every operation must have a defined failure mode and recovery path\n- Retries must have limits and backoff\n- Fallbacks must be pre-tested, not improvised\n- Degradation must be communicated to users\n- Escalation must have defined response time SLAs\n- Abort must preserve data integrity" },
    ],
    examples: [
      { title: "Recovery Decision Tree", input: "Failure: Model returns invalid JSON\n→ Retry with stricter prompt (max 2 retries)\n→ If still fails: Fallback to regex extraction\n→ If still fails: Degrade — return raw text with warning\n→ If critical data: Escalate to human\n\nFailure: Model timeout (>10s)\n→ Retry once with 15s timeout\n→ If still fails: Queue for batch processing\n→ If user waiting: Return 'processing' status, deliver async", output: "Each failure has a clear recovery path with escalation.", explanation: "No failure goes unhandled. Each path ends at a defined state." },
    ],
    drills: [
      { id: "w16-t02-d1", type: "build", prompt: "Design a recovery strategy for each step of an AI document processing pipeline: upload → extract → classify → summarize → store. For each step, define: possible failures, recovery action, max retries, fallback, and escalation trigger.", requiredElements: ["per-step failures", "recovery actions", "retry limits", "fallbacks", "escalation"], evaluationCriteria: ["All 5 steps covered", "Failures are realistic", "Recovery actions are practical", "Escalation criteria clear"] },
      { id: "w16-t02-d2", type: "design", prompt: "Design a graceful degradation plan for an AI search system. Define 4 degradation levels from full functionality to minimal functionality. At each level, specify: what still works, what's disabled, user communication, and recovery trigger.", requiredElements: ["4 degradation levels", "per-level capabilities", "user communication", "recovery triggers"], evaluationCriteria: ["Levels are distinct", "Capabilities decrease gradually", "Users informed at each level", "Recovery is defined"] },
    ],
    challenge: {
      id: "w16-t02-ch", type: "system_design",
      scenario: "Design the failure recovery system for an AI-powered trading alert system. The system monitors market data, detects patterns, and sends alerts to traders. Failures could mean missed opportunities or false alerts — both costly.",
      constraints: ["Must have recovery strategy for every component", "Must prioritize alert delivery (missed alert > false alert for critical alerts)", "Must have sub-second recovery for transient failures", "Must have fallback to rule-based alerts if AI fails", "Must preserve alert queue during failures", "Must include post-recovery reconciliation"],
      requiredSections: ["Component failure catalog", "Per-failure recovery strategy", "Priority-based recovery (critical vs informational alerts)", "Fallback alert system design", "Queue preservation mechanism", "Post-recovery reconciliation protocol"],
    },
    rubric: [
      { id: "w16-t02-r1", dimension: "Coverage", description: "Every component has failure/recovery defined", weight: 0.25 },
      { id: "w16-t02-r2", dimension: "Priority awareness", description: "Critical alerts prioritized in recovery", weight: 0.25 },
      { id: "w16-t02-r3", dimension: "Speed", description: "Recovery times match business requirements", weight: 0.25 },
      { id: "w16-t02-r4", dimension: "Data integrity", description: "No data lost during failures", weight: 0.25 },
    ],
    reviewSummary: "Six recovery patterns: retry, fallback, degrade, queue, escalate, abort. Every operation needs a defined failure mode and recovery path. Retries need limits. Fallbacks must be pre-tested.",
    artifactType: "system_design", passThreshold: 80, xpValue: 200,
  },
  {
    id: "w16-t03-retry-strategies",
    weekNumber: 16, phase: 3, domain: "AI System Design",
    title: "Retry & Fallback Design",
    lesson: [
      { type: "text", content: "Retries seem simple but are full of traps. Bad retry logic causes: thundering herds, wasted money, delayed failures, and user frustration.\n\nRetry best practices:\n1. Exponential backoff: Wait 1s, 2s, 4s, 8s... not 1s, 1s, 1s\n2. Jitter: Add randomness to prevent synchronized retries\n3. Max attempts: Always cap retries (usually 3)\n4. Idempotency: Ensure retrying doesn't duplicate side effects\n5. Different prompt on retry: If the prompt caused the error, retrying the same prompt is insanity" },
      { type: "text", content: "Fallback chain design:\n1. Primary: Best model/approach\n2. Secondary: Slightly worse but more reliable\n3. Tertiary: Minimal functionality, maximum reliability\n4. Emergency: Human takeover\n\nEach fallback must be tested independently. An untested fallback is not a fallback." },
    ],
    examples: [
      { title: "Retry with Prompt Variation", input: "Attempt 1: Full prompt with JSON schema → Invalid JSON\nAttempt 2: Same prompt + 'Output ONLY valid JSON, nothing else' → Still invalid\nAttempt 3: Simplified prompt with fewer fields → Valid JSON (partial)\nFallback: Regex extraction from raw text → Structured data with gaps\nEmergency: Route to human data entry", output: "Each retry changes something. Fallbacks are progressively simpler.", explanation: "Retrying the exact same prompt is pointless. Each retry should change the approach, not just repeat." },
    ],
    drills: [
      { id: "w16-t03-d1", type: "build", prompt: "Design a retry strategy for an AI email classifier that sometimes returns invalid output. Define: retry triggers, backoff schedule, prompt variation per retry, max attempts, fallback chain (3 levels), and monitoring for retry rate.", requiredElements: ["retry triggers", "backoff schedule", "prompt variation", "max attempts", "3-level fallback", "monitoring"], evaluationCriteria: ["Triggers are specific", "Backoff is exponential with jitter", "Each retry varies approach", "Attempts are capped", "Fallbacks degrade gracefully", "Retry rate monitored"] },
      { id: "w16-t03-d2", type: "analyze", prompt: "This retry logic causes problems:\n- On failure, retry immediately\n- Retry up to 10 times\n- Always use the same prompt\n- No fallback\n\nIdentify all problems, calculate the impact (wasted time/money for 1000 failures), and redesign.", requiredElements: ["problem identification", "cost calculation", "redesigned retry", "fallback addition"], evaluationCriteria: ["Identifies no backoff", "Identifies excessive retries", "Calculates wasted resources", "Redesign is sound"] },
    ],
    challenge: {
      id: "w16-t03-ch", type: "system_design",
      scenario: "Design the complete retry and fallback system for an AI-powered real-time translation service handling 50K+ requests/hour. The service must maintain <3 second latency and <1% error rate while being cost-effective.",
      constraints: ["Must handle: model timeouts, invalid output, rate limits, model outage", "Must have retry strategy per failure type", "Must have 3-level fallback chain", "Must maintain latency SLA during retries", "Must track and alert on retry rates", "Must include cost optimization (don't retry expensive models unnecessarily)"],
      requiredSections: ["Failure type catalog", "Per-type retry strategy", "Fallback chain with testing plan", "Latency budget allocation", "Cost optimization rules", "Monitoring and alerting"],
    },
    rubric: [
      { id: "w16-t03-r1", dimension: "Retry design", description: "Per-failure-type retry with backoff and variation", weight: 0.25 },
      { id: "w16-t03-r2", dimension: "Fallback chain", description: "3+ levels, each independently tested", weight: 0.25 },
      { id: "w16-t03-r3", dimension: "Latency awareness", description: "Retries don't blow latency budget", weight: 0.25 },
      { id: "w16-t03-r4", dimension: "Cost optimization", description: "Retries are cost-aware", weight: 0.25 },
    ],
    reviewSummary: "Retry with exponential backoff, jitter, max attempts, and prompt variation. Fallback chains: primary → secondary → tertiary → human. Each fallback must be pre-tested. Monitor retry rates.",
    artifactType: "system_design", passThreshold: 80, xpValue: 200,
  },
];
