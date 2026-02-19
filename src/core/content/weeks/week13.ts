import type { Topic } from "../../types/topic";

export const week13: Topic[] = [
  {
    id: "w13-t01-api-thinking",
    weekNumber: 13, phase: 3, domain: "AI System Design",
    title: "API Thinking for AI Systems",
    lesson: [
      { type: "text", content: "API thinking means treating every AI component as a service with a defined contract: it accepts specific input, returns specific output, and handles errors predictably. Even if you never write code, understanding API design makes you a better AI system designer.\n\nAPI contract elements:\n1. Endpoint: What capability is exposed\n2. Input schema: What data it accepts\n3. Output schema: What data it returns\n4. Error responses: What happens when things go wrong\n5. Rate limits: How often it can be called\n6. Authentication: Who can call it" },
    ],
    examples: [
      { title: "AI Feature as API", input: "Endpoint: /classify-ticket\nInput: {text: string, metadata?: {source: string, timestamp: string}}\nOutput: {category: enum, priority: 1-5, confidence: 0-1}\nErrors: 400 (empty text), 429 (rate limit), 500 (model failure)\nRate limit: 100 requests/minute\nLatency SLA: < 2 seconds", output: "Complete contract for one AI capability.", explanation: "Anyone integrating this service knows exactly what to send, what to expect, and what can go wrong." },
    ],
    drills: [
      { id: "w13-t01-d1", type: "design", prompt: "Design API contracts for 3 AI capabilities: sentiment analysis, text summarization, and entity extraction. Each must have: input schema, output schema, error codes, rate limits, and latency expectations.", requiredElements: ["3 API contracts", "input/output schemas", "error codes", "rate limits", "latency SLAs"], evaluationCriteria: ["All 3 fully specified", "Schemas are typed", "Errors are comprehensive", "Limits are realistic"] },
      { id: "w13-t01-d2", type: "analyze", prompt: "An AI API returns different output schemas depending on the input length — short inputs get a simple response, long inputs get a detailed one. Explain why this is bad API design and propose a fix.", requiredElements: ["problem identification", "consistency argument", "fixed design", "versioning suggestion"], evaluationCriteria: ["Identifies inconsistent contract", "Explains integration problems", "Proposes consistent schema", "Suggests handling via parameters not magic"] },
    ],
    challenge: {
      id: "w13-t01-ch", type: "system_design",
      scenario: "Design the API layer for an AI-powered document intelligence platform. The platform offers: document classification, key information extraction, summarization, compliance checking, and similarity search. Design the complete API surface.",
      constraints: ["At least 5 endpoints with full contracts", "Consistent error handling across all endpoints", "Authentication and rate limiting design", "Batch processing capability", "Webhook support for async operations", "API versioning strategy"],
      requiredSections: ["Endpoint catalog", "Per-endpoint contracts", "Error handling standards", "Authentication design", "Batch and async patterns", "Versioning strategy"],
    },
    rubric: [
      { id: "w13-t01-r1", dimension: "Contract completeness", description: "Every endpoint fully specified", weight: 0.3 },
      { id: "w13-t01-r2", dimension: "Consistency", description: "Patterns consistent across endpoints", weight: 0.25 },
      { id: "w13-t01-r3", dimension: "Error design", description: "Errors are informative and actionable", weight: 0.25 },
      { id: "w13-t01-r4", dimension: "Operational", description: "Rate limits, auth, versioning addressed", weight: 0.2 },
    ],
    reviewSummary: "Treat AI components as APIs with contracts: input schema, output schema, errors, rate limits, latency SLAs. Consistent contracts make systems integrable and debuggable.",
    artifactType: "system_design", passThreshold: 80, xpValue: 175,
  },
  {
    id: "w13-t02-request-response",
    weekNumber: 13, phase: 3, domain: "AI System Design",
    title: "Request/Response Design",
    lesson: [
      { type: "text", content: "In AI systems, the request/response cycle has unique challenges: non-deterministic outputs, variable latency, potential for expensive retries, and the need for context management.\n\nDesign considerations:\n1. Request enrichment: Add context before hitting the model\n2. Response validation: Check output before returning to caller\n3. Caching: Same input → cached output (save cost and time)\n4. Retry logic: When and how to retry failed requests\n5. Timeout handling: What to return when the model is slow" },
    ],
    examples: [
      { title: "Enriched Request Flow", input: "User sends: 'What's my order status?'\n1. ENRICH: Lookup user ID → get recent orders → attach order context\n2. PROMPT: System message + enriched context + user question\n3. CALL: Send to LLM with 10s timeout\n4. VALIDATE: Check response mentions an actual order ID\n5. CACHE: Store response keyed by (user_id, question_hash)\n6. RETURN: Validated response to user", output: "Six-step flow instead of raw prompt call.", explanation: "Raw prompt calls are fragile. This flow adds context, validates output, caches results, and handles timeouts." },
    ],
    drills: [
      { id: "w13-t02-d1", type: "build", prompt: "Design a request/response flow for an AI-powered product search. User sends natural language query. System must: parse intent, enrich with inventory data, call LLM for recommendations, validate products exist, handle no-results gracefully.", requiredElements: ["intent parsing", "data enrichment", "LLM call", "response validation", "no-results handling"], evaluationCriteria: ["Flow is complete", "Each step has clear purpose", "Validation prevents hallucinated products", "Empty results handled gracefully"] },
      { id: "w13-t02-d2", type: "design", prompt: "Design a caching strategy for an AI FAQ system. Consider: when to cache (same question), when to invalidate (FAQ updated), cache key design (exact vs semantic matching), and cache warming (pre-populate common questions).", requiredElements: ["cache conditions", "invalidation rules", "key design", "warming strategy"], evaluationCriteria: ["Caching criteria are clear", "Invalidation prevents stale answers", "Keys handle variation", "Warming reduces cold starts"] },
    ],
    challenge: {
      id: "w13-t02-ch", type: "system_design",
      scenario: "Design the complete request/response architecture for an AI-powered customer service platform handling 10K+ conversations daily. The system must: understand intent, retrieve relevant context, generate responses, validate safety, and track conversation state.",
      constraints: ["Must handle multi-turn conversations", "Must include request enrichment with customer history", "Must include response validation before delivery", "Must include caching for common queries", "Must handle timeouts and retries gracefully", "Must support human handoff mid-conversation"],
      requiredSections: ["Request enrichment pipeline", "Context management", "Response validation", "Caching strategy", "Timeout and retry design", "Human handoff mechanism"],
    },
    rubric: [
      { id: "w13-t02-r1", dimension: "Flow completeness", description: "All stages from request to response covered", weight: 0.25 },
      { id: "w13-t02-r2", dimension: "Context design", description: "Multi-turn and history management", weight: 0.25 },
      { id: "w13-t02-r3", dimension: "Resilience", description: "Timeouts, retries, fallbacks designed", weight: 0.25 },
      { id: "w13-t02-r4", dimension: "Efficiency", description: "Caching and enrichment reduce cost/latency", weight: 0.25 },
    ],
    reviewSummary: "AI request/response needs: enrichment, validation, caching, retry logic, timeout handling. Never send raw user input directly to a model. Always validate output before returning.",
    artifactType: "system_design", passThreshold: 80, xpValue: 175,
  },
  {
    id: "w13-t03-error-handling",
    weekNumber: 13, phase: 3, domain: "AI System Design",
    title: "Error Handling in AI Systems",
    lesson: [
      { type: "text", content: "AI systems fail differently than traditional software. Failures are often partial (output is 80% correct), probabilistic (fails 5% of the time), and silent (wrong output with high confidence).\n\nError categories:\n1. Hard errors: API timeout, rate limit, invalid response\n2. Soft errors: Low confidence, partial extraction, schema violation\n3. Semantic errors: Factually wrong but syntactically valid output\n4. Cascade errors: One step's error propagates through the system" },
      { type: "text", content: "Error handling strategies:\n1. Retry with backoff: For transient hard errors\n2. Fallback models: If primary model fails, try secondary\n3. Graceful degradation: Return partial results with warning\n4. Circuit breaker: Stop calling after N consecutive failures\n5. Human escalation: Route to human when AI confidence is low" },
    ],
    examples: [
      { title: "Error Handling Matrix", input: "Error → Strategy → User Impact\nAPI timeout → Retry 3x with backoff → Slight delay\nRate limit → Queue and retry → Delayed response\nLow confidence → Flag + partial result → User sees warning\nInvalid JSON → Retry with stricter prompt → Slight delay\nSemantic error → Cannot detect automatically → Needs monitoring\nCascade → Circuit breaker + fallback path → Degraded but functional", output: "Each error type mapped to strategy and user impact.", explanation: "You can't prevent all errors, but you can define how each type is handled." },
    ],
    drills: [
      { id: "w13-t03-d1", type: "build", prompt: "Design an error handling strategy for an AI data extraction pipeline. Define handling for: API failures, malformed output, low confidence scores, missing fields, and contradictory extractions. Include retry limits and fallback behaviors.", requiredElements: ["5 error types handled", "retry policies", "fallback behaviors", "user communication"], evaluationCriteria: ["All error types addressed", "Retries have limits", "Fallbacks maintain functionality", "Users informed appropriately"] },
      { id: "w13-t03-d2", type: "design", prompt: "Design a circuit breaker system for an AI service. Define: failure threshold to open circuit, cool-down period, half-open testing protocol, and what alternative service handles requests while circuit is open.", requiredElements: ["failure threshold", "cool-down period", "half-open protocol", "alternative service"], evaluationCriteria: ["Threshold is reasonable", "Cool-down prevents thrashing", "Half-open tests safely", "Alternative maintains service"] },
    ],
    challenge: {
      id: "w13-t03-ch", type: "system_design",
      scenario: "Design a comprehensive error handling system for an AI-powered healthcare triage platform. Errors here can be life-threatening. The system must NEVER silently fail, NEVER provide incorrect triage without flagging uncertainty, and ALWAYS have a human fallback path.",
      constraints: ["Must categorize errors by patient safety impact", "Must have different handling for safety-critical vs non-critical errors", "Must include automatic escalation for any uncertainty", "Must have circuit breaker for systematic failures", "Must log all errors with full context for review", "Must have <30 second recovery for any error type"],
      requiredSections: ["Error categorization by safety impact", "Per-category handling strategy", "Automatic escalation rules", "Circuit breaker design", "Error logging specification", "Recovery time targets"],
    },
    rubric: [
      { id: "w13-t03-r1", dimension: "Safety awareness", description: "Error handling prioritizes patient safety", weight: 0.3 },
      { id: "w13-t03-r2", dimension: "Coverage", description: "All error categories with handling strategies", weight: 0.25 },
      { id: "w13-t03-r3", dimension: "Escalation design", description: "Human fallback is always available", weight: 0.25 },
      { id: "w13-t03-r4", dimension: "Recovery speed", description: "Recovery targets met for all error types", weight: 0.2 },
    ],
    reviewSummary: "AI errors are partial, probabilistic, and silent. Four categories: hard, soft, semantic, cascade. Strategies: retry, fallback models, graceful degradation, circuit breakers, human escalation.",
    artifactType: "system_design", passThreshold: 80, xpValue: 175,
  },
];
