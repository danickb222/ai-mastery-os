import type { Topic } from "../../types/topic";

export const week18: Topic[] = [
  {
    id: "w18-t01-monitoring",
    weekNumber: 18, phase: 3, domain: "Automation & Integration",
    title: "Monitoring AI Systems",
    lesson: [
      { type: "text", content: "You cannot improve what you cannot measure. AI monitoring goes beyond uptime — you must track quality, cost, latency, and drift.\n\nMonitoring dimensions:\n1. Quality: Accuracy, consistency, hallucination rate\n2. Performance: Latency p50/p95/p99, throughput\n3. Cost: Per-request cost, daily/monthly totals, cost per feature\n4. Reliability: Error rate, retry rate, fallback usage\n5. Drift: Quality trends over time, input distribution changes" },
      { type: "text", content: "Monitoring anti-patterns:\n- Only monitoring uptime (system is up but quality tanked)\n- Only monitoring averages (hides tail failures)\n- No baseline (can't tell if current performance is good or bad)\n- Alert fatigue (too many alerts = all ignored)\n- No actionable alerts (alert fires but nobody knows what to do)" },
    ],
    examples: [
      { title: "Monitoring Dashboard", input: "Real-time panel:\n- Requests/min, error rate, p95 latency\n- Quality score (rolling 1h average from canary inputs)\n- Cost accumulator (today vs budget)\n\nDaily panel:\n- Quality trend (7-day rolling)\n- Top 5 failure types\n- Cost breakdown by feature\n\nWeekly panel:\n- Drift detection (input distribution shift)\n- Regression test results\n- Cost projection for month", output: "Three time horizons with different metrics at each.", explanation: "Real-time catches fires. Daily catches trends. Weekly catches strategic drift." },
    ],
    drills: [
      { id: "w18-t01-d1", type: "design", prompt: "Design a monitoring system for an AI chatbot. Define metrics for each of the 5 dimensions (quality, performance, cost, reliability, drift). For each metric: data source, calculation method, alert threshold, and response action.", requiredElements: ["5 dimensions", "metrics per dimension", "thresholds", "response actions"], evaluationCriteria: ["All dimensions covered", "Metrics are measurable", "Thresholds are practical", "Actions are specific"] },
      { id: "w18-t01-d2", type: "analyze", prompt: "An AI system's monitoring shows: 99.9% uptime, 200ms avg latency, $3K/month cost. The team says everything is fine. But users are complaining about wrong answers. What monitoring is missing? Design the missing components.", requiredElements: ["gap identification", "quality monitoring", "user satisfaction metrics", "corrective design"], evaluationCriteria: ["Identifies missing quality monitoring", "Proposes accuracy tracking", "Includes user feedback loop", "Designs actionable system"] },
    ],
    challenge: {
      id: "w18-t01-ch", type: "automation_design",
      scenario: "Design a comprehensive monitoring and observability system for an AI platform running 8 different AI features in production, serving 500K+ requests/day. The system must detect quality issues before users report them.",
      constraints: ["Must monitor all 5 dimensions for each feature", "Must include proactive quality detection (canary inputs)", "Must have tiered alerting (P1-P4 with different response times)", "Must include cost attribution per feature", "Must detect cross-feature issues (shared model degradation)", "Must produce weekly health reports for stakeholders"],
      requiredSections: ["Per-feature metric definitions", "Canary input system", "Alert tiering and routing", "Cost attribution model", "Cross-feature correlation", "Stakeholder reporting template"],
    },
    rubric: [
      { id: "w18-t01-r1", dimension: "Coverage", description: "All 5 dimensions across all features", weight: 0.25 },
      { id: "w18-t01-r2", dimension: "Proactive detection", description: "Issues caught before user reports", weight: 0.25 },
      { id: "w18-t01-r3", dimension: "Alert design", description: "Tiered, actionable, not fatiguing", weight: 0.25 },
      { id: "w18-t01-r4", dimension: "Reporting", description: "Stakeholder-friendly health reports", weight: 0.25 },
    ],
    reviewSummary: "Monitor 5 dimensions: quality, performance, cost, reliability, drift. Three time horizons: real-time (fires), daily (trends), weekly (strategy). Proactive detection beats reactive user complaints.",
    artifactType: "workflow_blueprint", passThreshold: 80, xpValue: 200,
  },
  {
    id: "w18-t02-iteration-loops",
    weekNumber: 18, phase: 3, domain: "Automation & Integration",
    title: "System Iteration Loops",
    lesson: [
      { type: "text", content: "AI systems are never 'done.' They require continuous iteration: monitor → identify issues → prioritize → fix → verify → deploy. The teams that build great AI systems are the ones with the fastest, most disciplined iteration loops.\n\nIteration cadences:\n1. Continuous: Automated monitoring, canary checks, auto-rollback\n2. Daily: Review error logs, triage failures, patch critical issues\n3. Weekly: Quality trends, regression tests, prompt version reviews\n4. Monthly: Architecture review, cost optimization, strategy alignment" },
    ],
    examples: [
      { title: "Weekly Iteration", input: "Monday: Review last week's quality metrics and error logs\nTuesday: Prioritize top 3 issues by user impact\nWednesday: Develop fixes (prompt changes, guardrail updates)\nThursday: Test fixes against regression suite + new test cases\nFriday: Deploy to canary → monitor for 24h before full rollout", output: "Structured weekly cycle with built-in safety.", explanation: "Every week, the system gets better. The cadence prevents both stagnation and reckless changes." },
    ],
    drills: [
      { id: "w18-t02-d1", type: "build", prompt: "Design a complete iteration process for an AI content moderation system. Define: what you review daily/weekly/monthly, how you prioritize issues, how you test fixes, and how you deploy safely. Include a template for the weekly review meeting.", requiredElements: ["3 cadences", "prioritization framework", "testing protocol", "deployment process", "meeting template"], evaluationCriteria: ["All cadences defined", "Prioritization is impact-based", "Testing prevents regressions", "Deployment is staged", "Meeting template is practical"] },
      { id: "w18-t02-d2", type: "design", prompt: "Design a feedback loop that captures user corrections to AI output and automatically feeds them back into the evaluation system. Define: how corrections are captured, validated, stored, and used to improve quality metrics and test suites.", requiredElements: ["capture mechanism", "validation rules", "storage design", "feedback integration"], evaluationCriteria: ["Corrections easily captured", "Validation prevents noise", "Storage supports analysis", "Feedback improves system"] },
    ],
    challenge: {
      id: "w18-t02-ch", type: "automation_design",
      scenario: "Design the complete iteration and improvement system for an AI-powered enterprise search platform. The platform has been in production for 6 months and quality has slowly degraded from 92% to 84% relevance. Design the system that prevents this degradation and continuously improves quality.",
      constraints: ["Must include all 4 iteration cadences (continuous/daily/weekly/monthly)", "Must include automated degradation detection", "Must include user feedback integration", "Must include A/B testing for improvements", "Must include knowledge base freshness management", "Must define roles and responsibilities for the iteration team"],
      requiredSections: ["Degradation root cause analysis framework", "Per-cadence activities", "User feedback loop", "A/B testing integration", "Knowledge base maintenance", "Team roles and responsibilities"],
    },
    rubric: [
      { id: "w18-t02-r1", dimension: "Cadence design", description: "All 4 cadences with specific activities", weight: 0.25 },
      { id: "w18-t02-r2", dimension: "Feedback integration", description: "User corrections improve system", weight: 0.25 },
      { id: "w18-t02-r3", dimension: "Testing rigor", description: "A/B testing for all improvements", weight: 0.25 },
      { id: "w18-t02-r4", dimension: "Sustainability", description: "Process is maintainable long-term", weight: 0.25 },
    ],
    reviewSummary: "AI systems need continuous iteration: monitor → identify → prioritize → fix → verify → deploy. Four cadences: continuous, daily, weekly, monthly. Fastest iteration loop wins.",
    artifactType: "workflow_blueprint", passThreshold: 80, xpValue: 200,
  },
  {
    id: "w18-t03-improving-systems",
    weekNumber: 18, phase: 3, domain: "Automation & Integration",
    title: "Systematic AI Improvement",
    lesson: [
      { type: "text", content: "Improving an AI system is not about making random changes and hoping. It's a systematic process:\n\n1. Measure current performance (baseline)\n2. Identify the biggest quality gap (impact analysis)\n3. Hypothesize the root cause\n4. Design a targeted intervention\n5. Test the intervention in isolation\n6. Measure improvement against baseline\n7. Deploy if improved, revert if not" },
      { type: "text", content: "Common improvement interventions:\n- Prompt refinement: Fix specific failure modes\n- Data improvement: Better context, cleaner documents\n- Architecture change: Add a step, split a step, reorder\n- Model upgrade/downgrade: Better model for hard tasks, cheaper for easy\n- Guardrail addition: Catch outputs that slip through\n- Evaluation tightening: Raise the bar on what 'pass' means" },
    ],
    examples: [
      { title: "Improvement Cycle", input: "Baseline: 84% accuracy on document classification\nGap: 16% error rate, concentrated in 'contracts' category (40% error rate)\nHypothesis: Contract language is too varied for current prompt\nIntervention: Add 3 contract subtypes with specific classification criteria\nTest: Run on 100 contract samples — accuracy improved to 88%\nRegression: Non-contract accuracy unchanged\nDeploy: Roll out → overall accuracy now 91%", output: "Targeted improvement on the worst-performing category.", explanation: "By identifying WHERE the errors concentrate, the fix was small but high-impact. Broad changes would have been less effective." },
    ],
    drills: [
      { id: "w18-t03-d1", type: "analyze", prompt: "An AI email response generator has 85% satisfaction rate overall. Disaggregate by: complaint emails (72%), inquiry emails (91%), and escalation emails (68%). Design a prioritized improvement plan targeting the lowest-performing categories.", requiredElements: ["priority analysis", "root cause per category", "targeted interventions", "expected impact"], evaluationCriteria: ["Correctly prioritizes escalation emails", "Root causes are plausible", "Interventions are targeted", "Impact estimates are reasonable"] },
      { id: "w18-t03-d2", type: "build", prompt: "Design an improvement experiment for a RAG system where 20% of answers cite the wrong source document. Define: hypothesis, experiment design, success criteria, rollback plan, and what you'll learn regardless of outcome.", requiredElements: ["hypothesis", "experiment design", "success criteria", "rollback plan", "learning objectives"], evaluationCriteria: ["Hypothesis is testable", "Experiment isolates the variable", "Success criteria are measurable", "Rollback is defined", "Learning is captured either way"] },
    ],
    challenge: {
      id: "w18-t03-ch", type: "automation_design",
      scenario: "You inherit an AI-powered customer service system with these problems:\n1. 78% resolution rate (target: 90%)\n2. 12-second average response time (target: 4s)\n3. $18K/month cost (budget: $8K)\n4. 5% hallucination rate (target: <1%)\n\nDesign a 90-day improvement plan that addresses all four issues in priority order.",
      constraints: ["Must prioritize issues by business impact", "Must design specific interventions for each issue", "Must include measurement plan for each intervention", "Must include risk assessment (intervention might make things worse)", "Must include monthly milestones", "Must stay within current team capacity (3 engineers)"],
      requiredSections: ["Priority ranking with justification", "Per-issue root cause analysis", "Per-issue intervention design", "90-day timeline with milestones", "Measurement plan", "Risk mitigation"],
    },
    rubric: [
      { id: "w18-t03-r1", dimension: "Prioritization", description: "Issues ranked by true business impact", weight: 0.25 },
      { id: "w18-t03-r2", dimension: "Intervention quality", description: "Targeted, testable, specific fixes", weight: 0.25 },
      { id: "w18-t03-r3", dimension: "Planning rigor", description: "Timeline is realistic with clear milestones", weight: 0.25 },
      { id: "w18-t03-r4", dimension: "Risk awareness", description: "Risks identified with mitigation plans", weight: 0.25 },
    ],
    reviewSummary: "Systematic improvement: measure → identify gap → hypothesize → intervene → test → measure → deploy/revert. Target the worst-performing category first. Small targeted fixes beat broad changes.",
    artifactType: "workflow_blueprint", passThreshold: 80, xpValue: 200,
  },
];
