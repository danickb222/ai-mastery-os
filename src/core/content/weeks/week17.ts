import type { Topic } from "../../types/topic";

export const week17: Topic[] = [
  {
    id: "w17-t01-cost-awareness",
    weekNumber: 17, phase: 3, domain: "Automation & Integration",
    title: "Cost Awareness in AI Systems",
    lesson: [
      { type: "text", content: "Every AI call costs money. Token pricing, model selection, retry costs, and scaling all compound. An operator who ignores cost is not an operator — they're a hobbyist.\n\nCost levers:\n1. Model selection: GPT-4 costs 10-30x GPT-3.5 per token\n2. Prompt length: Longer prompts = more input tokens = higher cost\n3. Output length: Unconstrained output = unpredictable cost\n4. Retry rate: 10% retry rate = 10% cost increase\n5. Caching: Eliminates cost for repeated queries\n6. Batching: Bulk processing often cheaper than real-time" },
      { type: "text", content: "Cost estimation formula:\nCost per request = (input_tokens × input_price) + (output_tokens × output_price)\nMonthly cost = requests_per_day × 30 × cost_per_request × (1 + retry_rate)\n\nAlways estimate before building. A system that costs $50K/month when you budgeted $5K is a failed design." },
    ],
    examples: [
      { title: "Cost Comparison", input: "Task: Classify 100K support tickets/month\n\nOption A: GPT-4 ($0.03/1K input + $0.06/1K output)\n~200 tokens input, ~50 tokens output per ticket\nCost: ($0.006 + $0.003) × 100K = $900/month\n\nOption B: GPT-3.5 ($0.0005/1K input + $0.0015/1K output)\nSame tokens\nCost: ($0.0001 + $0.000075) × 100K = $17.50/month\n\nOption C: GPT-3.5 with 5% escalation to GPT-4\nCost: $17.50 + (5K × $0.009) = $62.50/month", output: "50x cost difference between Option A and B. Option C gets 95% of the benefit at 7% of the cost.", explanation: "Model selection is the biggest cost lever. Use the cheapest model that meets quality requirements." },
    ],
    drills: [
      { id: "w17-t01-d1", type: "analyze", prompt: "Calculate the monthly cost for an AI system that: processes 50K documents/day, uses GPT-4 for extraction (avg 500 input tokens, 200 output tokens), has a 8% retry rate, and caches 30% of repeated documents. Use current approximate pricing.", requiredElements: ["base cost calculation", "retry cost", "cache savings", "monthly total"], evaluationCriteria: ["Math is correct", "Retry cost included", "Cache savings calculated", "Total is reasonable"] },
      { id: "w17-t01-d2", type: "design", prompt: "Design a cost optimization strategy for an AI chatbot currently spending $15K/month. Propose at least 5 optimization techniques and estimate savings for each. Target: reduce to under $5K without significant quality loss.", requiredElements: ["5+ optimization techniques", "per-technique savings estimate", "quality impact assessment", "implementation priority"], evaluationCriteria: ["Techniques are practical", "Savings estimates are realistic", "Quality tradeoffs acknowledged", "Priority ordering is logical"] },
    ],
    challenge: {
      id: "w17-t01-ch", type: "automation_design",
      scenario: "Design the cost model and optimization strategy for an AI-powered content generation platform that produces 10K articles/month. The current design uses GPT-4 for everything and costs $25K/month. The budget is $5K/month. Redesign without reducing output quality below acceptable thresholds.",
      constraints: ["Must achieve 80%+ cost reduction", "Must define quality thresholds per content type", "Must use tiered model strategy (cheap model for simple, expensive for complex)", "Must include cost monitoring and alerting", "Must include cost-per-article tracking", "Must project costs for 2x and 5x scale"],
      requiredSections: ["Current cost breakdown", "Tiered model strategy", "Per-content-type quality thresholds", "Projected optimized costs", "Cost monitoring design", "Scale projections"],
    },
    rubric: [
      { id: "w17-t01-r1", dimension: "Cost analysis", description: "Current and projected costs accurately calculated", weight: 0.25 },
      { id: "w17-t01-r2", dimension: "Optimization depth", description: "Multiple techniques with realistic savings", weight: 0.25 },
      { id: "w17-t01-r3", dimension: "Quality preservation", description: "Thresholds defined and maintained", weight: 0.25 },
      { id: "w17-t01-r4", dimension: "Scalability", description: "Costs projected for growth scenarios", weight: 0.25 },
    ],
    reviewSummary: "Every AI call costs money. Biggest levers: model selection, prompt length, output constraints, caching, retry reduction. Always estimate costs before building. Use cheapest model that meets quality requirements.",
    artifactType: "workflow_blueprint", passThreshold: 80, xpValue: 200,
  },
  {
    id: "w17-t02-latency-tradeoffs",
    weekNumber: 17, phase: 3, domain: "Automation & Integration",
    title: "Latency & Performance Tradeoffs",
    lesson: [
      { type: "text", content: "Latency is how long users wait. In AI systems, latency comes from: prompt size (more tokens = slower), model choice (bigger = slower), pipeline steps (more steps = slower), and network round trips.\n\nLatency budget: Define how long users will wait, then allocate time to each step.\nExample: 3 second total budget = 0.5s preprocessing + 2s model call + 0.3s post-processing + 0.2s network" },
      { type: "text", content: "Latency reduction techniques:\n1. Streaming: Show partial output as it generates\n2. Parallel execution: Run independent steps simultaneously\n3. Caching: Instant response for known queries\n4. Smaller models: Faster inference for simple tasks\n5. Prompt optimization: Shorter prompts = faster processing\n6. Async processing: Return immediately, deliver results later" },
    ],
    examples: [
      { title: "Latency Budget", input: "User search → AI-powered results\nBudget: 2 seconds total\n\nAllocation:\n- Query parsing: 50ms (local regex)\n- Embedding generation: 100ms (small model)\n- Vector search: 200ms (database query)\n- LLM re-ranking: 800ms (GPT-3.5, short prompt)\n- Response formatting: 50ms (template)\n- Network overhead: 200ms\n- Buffer: 600ms\nTotal: 2000ms ✓", output: "Every millisecond accounted for with buffer.", explanation: "Without a budget, individual teams optimize in isolation and the total exceeds acceptable limits." },
    ],
    drills: [
      { id: "w17-t02-d1", type: "design", prompt: "Design a latency budget for an AI chatbot with a 3-second response time target. The chatbot must: retrieve context, generate response, validate safety, and format output. Allocate time to each step and identify the bottleneck.", requiredElements: ["per-step allocation", "bottleneck identification", "optimization suggestions", "buffer allocation"], evaluationCriteria: ["Allocations sum correctly", "Bottleneck correctly identified", "Optimizations target the bottleneck", "Buffer is reasonable"] },
      { id: "w17-t02-d2", type: "build", prompt: "An AI pipeline takes 8 seconds: Step A (2s) → Step B (3s) → Step C (1s) → Step D (2s). Steps A and B are independent. Step C depends on both. Step D depends on C. Redesign for minimum latency using parallelization.", requiredElements: ["dependency analysis", "parallel execution plan", "new latency calculation", "comparison"], evaluationCriteria: ["Identifies A and B as parallelizable", "New latency is 3+1+2=6s", "Correctly maintains dependencies", "Shows improvement"] },
    ],
    challenge: {
      id: "w17-t02-ch", type: "automation_design",
      scenario: "Design the latency optimization strategy for an AI-powered real-time customer support system. Current average response time is 12 seconds. Target is under 4 seconds. The pipeline: intent classification → context retrieval → response generation → safety check → formatting.",
      constraints: ["Must reduce from 12s to under 4s", "Must identify which steps to parallelize, cache, or replace", "Must define streaming strategy for long responses", "Must handle latency spikes gracefully", "Must include per-step latency monitoring", "Must define degradation behavior when latency budget exceeded"],
      requiredSections: ["Current latency breakdown", "Optimization strategy per step", "Parallelization plan", "Streaming design", "Spike handling", "Monitoring and alerting"],
    },
    rubric: [
      { id: "w17-t02-r1", dimension: "Analysis depth", description: "Current bottlenecks accurately identified", weight: 0.25 },
      { id: "w17-t02-r2", dimension: "Optimization quality", description: "Practical techniques that achieve target", weight: 0.25 },
      { id: "w17-t02-r3", dimension: "Streaming design", description: "Progressive response delivery", weight: 0.25 },
      { id: "w17-t02-r4", dimension: "Resilience", description: "Spike handling and degradation defined", weight: 0.25 },
    ],
    reviewSummary: "Define latency budgets. Allocate time per step. Reduce with: streaming, parallelization, caching, smaller models, shorter prompts, async. Target the bottleneck, not everything.",
    artifactType: "workflow_blueprint", passThreshold: 80, xpValue: 200,
  },
  {
    id: "w17-t03-caching-mindset",
    weekNumber: 17, phase: 3, domain: "Automation & Integration",
    title: "Caching for AI Systems",
    lesson: [
      { type: "text", content: "Caching is the most underused optimization in AI systems. If you've seen a query before and the answer hasn't changed, don't call the model again.\n\nCaching levels:\n1. Exact match: Same input → cached output (simple, effective)\n2. Semantic match: Similar input → cached output (more complex, higher hit rate)\n3. Component cache: Cache intermediate results (embeddings, retrieved docs)\n4. Result cache: Cache final formatted output\n5. Negative cache: Cache 'no result' to avoid repeated empty searches" },
      { type: "text", content: "Cache invalidation rules:\n- Time-based: Expire after N hours/days\n- Event-based: Invalidate when source data changes\n- Version-based: Invalidate when prompt version changes\n- Quality-based: Invalidate when output quality drops below threshold\n\nThe hardest problem in caching: knowing when cached data is stale." },
    ],
    examples: [
      { title: "Multi-Level Cache", input: "Level 1: Exact query cache (TTL: 1 hour)\n→ Hit rate: 30% (common questions)\n\nLevel 2: Semantic similarity cache (threshold: 0.95)\n→ Hit rate: additional 15%\n\nLevel 3: Embedding cache (TTL: 24 hours)\n→ Saves embedding generation cost\n\nTotal: 45% of requests never hit the LLM", output: "45% cost and latency reduction from caching alone.", explanation: "Three cache levels compound. The first is simple, the second catches variations, the third saves intermediate costs." },
    ],
    drills: [
      { id: "w17-t03-d1", type: "design", prompt: "Design a caching strategy for an AI FAQ system. Define: cache key design, TTL per cache level, invalidation triggers, warming strategy, and cache miss handling. Include: exact match, semantic match, and negative cache.", requiredElements: ["cache key design", "TTL strategy", "invalidation triggers", "warming", "negative cache"], evaluationCriteria: ["Keys handle query variations", "TTLs are appropriate", "Invalidation is event-driven", "Warming reduces cold starts", "Negative cache prevents repeated misses"] },
      { id: "w17-t03-d2", type: "analyze", prompt: "An AI system caches responses for 24 hours but the underlying data changes multiple times per day. Users report stale answers. Redesign the cache invalidation strategy to balance freshness with cost savings.", requiredElements: ["freshness problem analysis", "new invalidation strategy", "cost vs freshness tradeoff", "monitoring"], evaluationCriteria: ["Identifies staleness risk", "Proposes event-based invalidation", "Quantifies tradeoff", "Monitoring detects stale responses"] },
    ],
    challenge: {
      id: "w17-t03-ch", type: "automation_design",
      scenario: "Design a comprehensive caching architecture for an AI-powered e-commerce search and recommendation system handling 1M+ queries/day. Products change daily, prices change hourly, and inventory changes in real-time.",
      constraints: ["Must cache at multiple levels (query, embedding, retrieval, response)", "Must handle different invalidation requirements per data type", "Must achieve at least 40% cache hit rate", "Must never serve stale price or inventory data", "Must include cache warming for popular products", "Must include cache performance monitoring"],
      requiredSections: ["Multi-level cache architecture", "Per-level key design and TTL", "Per-data-type invalidation rules", "Cache warming strategy", "Hit rate optimization", "Monitoring and alerting"],
    },
    rubric: [
      { id: "w17-t03-r1", dimension: "Architecture", description: "Multi-level caching properly designed", weight: 0.25 },
      { id: "w17-t03-r2", dimension: "Invalidation", description: "Per-data-type freshness guaranteed", weight: 0.3 },
      { id: "w17-t03-r3", dimension: "Hit rate", description: "Design achieves 40%+ target", weight: 0.25 },
      { id: "w17-t03-r4", dimension: "Monitoring", description: "Cache health tracked and alerted", weight: 0.2 },
    ],
    reviewSummary: "Cache at multiple levels: exact match, semantic match, component, result, negative. Invalidate by time, event, version, or quality. The hardest problem: knowing when cached data is stale.",
    artifactType: "workflow_blueprint", passThreshold: 80, xpValue: 200,
  },
];
