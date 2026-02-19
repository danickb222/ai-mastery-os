import type { Topic } from "../../types/topic";

export const week11: Topic[] = [
  {
    id: "w11-t01-eval-frameworks",
    weekNumber: 11, phase: 2, domain: "Evaluation & Reliability",
    title: "Evaluation Frameworks",
    lesson: [
      { type: "text", content: "An evaluation framework is a reusable system for assessing AI output quality. It combines: rubrics, test suites, scoring methods, and reporting — into a single, repeatable process.\n\nFramework components:\n1. Evaluation dimensions (what to measure)\n2. Scoring method (how to score)\n3. Test suite (what inputs to test)\n4. Aggregation (how to combine scores)\n5. Reporting (how to present results)\n6. Decision criteria (what score = pass/fail)" },
      { type: "callout", content: "A framework is only valuable if someone who has never seen the AI system can use it to evaluate output quality reliably. If it requires tribal knowledge, it's not a framework — it's a habit." },
    ],
    examples: [
      { title: "Mini Framework", input: "Framework: Email Classification Quality\nDimensions: accuracy (40%), consistency (30%), edge handling (30%)\nScoring: Per-dimension 0-100 scale with reference anchors\nTest suite: 50 labeled emails (35 normal, 10 edge, 5 adversarial)\nAggregation: Weighted average\nPass criteria: Overall ≥ 85, no dimension below 70\nReporting: Score card with per-dimension breakdown + failure examples", output: "Complete, reusable, self-contained evaluation system.", explanation: "Anyone can pick this up and evaluate a new prompt version. No guesswork." },
    ],
    drills: [
      { id: "w11-t01-d1", type: "build", prompt: "Design a complete evaluation framework for an AI-powered FAQ answering system. Include all 6 components. The framework must be usable by a non-technical QA person.", requiredElements: ["6 components defined", "non-technical usability", "specific metrics", "decision criteria"], evaluationCriteria: ["All components present", "Clear enough for non-technical user", "Metrics are measurable", "Pass/fail criteria unambiguous"] },
      { id: "w11-t01-d2", type: "evaluate", prompt: "Critique this evaluation framework:\n'We check if the output looks good and if customers are happy. If most outputs seem fine, the prompt passes.'\n\nIdentify all problems and redesign it properly.", requiredElements: ["problem identification", "vagueness critique", "missing components", "redesigned framework"], evaluationCriteria: ["Identifies 'looks good' as unmeasurable", "Identifies missing test suite", "Identifies no decision criteria", "Provides complete redesign"] },
    ],
    challenge: {
      id: "w11-t01-ch", type: "evaluation_design",
      scenario: "Design a production-grade evaluation framework for an AI system that generates personalized learning plans for students. The system takes student assessment data and produces a 12-week study plan with daily activities, resource recommendations, and progress checkpoints.",
      constraints: ["Must have at least 6 evaluation dimensions", "Must include automated and human evaluation components", "Must define inter-evaluator reliability targets", "Must include a continuous monitoring component (not just one-time)", "Must produce a score card that stakeholders can understand"],
      requiredSections: ["Dimension definitions with weights", "Automated evaluation criteria", "Human evaluation protocol", "Test suite design", "Aggregation and reporting", "Continuous monitoring plan", "Stakeholder score card template"],
    },
    rubric: [
      { id: "w11-t01-r1", dimension: "Completeness", description: "All 6 framework components fully defined", weight: 0.25 },
      { id: "w11-t01-r2", dimension: "Rigor", description: "Each component is measurable and reproducible", weight: 0.25 },
      { id: "w11-t01-r3", dimension: "Usability", description: "Framework can be used by non-creators", weight: 0.25 },
      { id: "w11-t01-r4", dimension: "Monitoring", description: "Continuous quality tracking included", weight: 0.25 },
    ],
    reviewSummary: "Evaluation framework = dimensions + scoring + test suite + aggregation + reporting + decision criteria. Must be usable by anyone, not just the creator.",
    artifactType: "evaluation_harness", passThreshold: 80, xpValue: 175,
  },
  {
    id: "w11-t02-scoring-systems",
    weekNumber: 11, phase: 2, domain: "Evaluation & Reliability",
    title: "Scoring Systems",
    lesson: [
      { type: "text", content: "A scoring system translates qualitative evaluation into quantitative metrics. The design of your scoring system determines what behaviors you incentivize and which failures you catch.\n\nScoring approaches:\n1. Binary: pass/fail per criterion\n2. Ordinal: levels (poor/fair/good/excellent)\n3. Continuous: 0-100 scale\n4. Weighted composite: Multiple dimensions combined\n5. Penalty-based: Start at 100, subtract for violations" },
      { type: "text", content: "Scoring pitfalls:\n- Mean-based aggregation hides outliers (use min-score gate instead)\n- Equal weighting treats all dimensions as equally important\n- No minimum threshold per dimension allows one great score to mask a terrible one\n- Score inflation over time without recalibration" },
    ],
    examples: [
      { title: "Gated Scoring", input: "Score = weighted average of 4 dimensions\nGate: No dimension below 60 (even if average is 85)\n\nDimension scores: Accuracy=95, Format=90, Safety=45, Speed=80\nWeighted average: 82 → would pass simple threshold\nGated result: FAIL (Safety=45 < 60 gate)\n\nThe gate catches a critical safety failure that the average hid.", output: "Gated scoring prevents dangerous averaging.", explanation: "Without gates, a terrible safety score is averaged away by good accuracy. Gates prevent this." },
    ],
    drills: [
      { id: "w11-t02-d1", type: "design", prompt: "Design a scoring system for an AI content generation pipeline with these dimensions: factual accuracy, brand voice compliance, SEO optimization, readability, originality. Define: scale type, weights, gates, and interpretation guide.", requiredElements: ["scale type per dimension", "weights with justification", "minimum gates", "interpretation guide"], evaluationCriteria: ["Appropriate scales chosen", "Weights justified by business priority", "Gates prevent critical failures", "Guide is clear"] },
      { id: "w11-t02-d2", type: "analyze", prompt: "A scoring system uses simple average of 5 dimensions (each 0-100). The team reports 88% average quality. However, 15% of outputs have at least one dimension below 40. Explain why the average is misleading and design a better system.", requiredElements: ["average critique", "outlier analysis", "improved system", "gate mechanism"], evaluationCriteria: ["Explains how averaging hides failures", "Quantifies the outlier problem", "Proposes gated system", "New system catches the 15% failures"] },
    ],
    challenge: {
      id: "w11-t02-ch", type: "evaluation_design",
      scenario: "Design a complete scoring system for an AI-powered customer service quality assurance tool. The system evaluates AI-generated customer responses across: accuracy, empathy, resolution effectiveness, compliance, and response time.\n\nThe scoring must be fair, transparent, and actionable for the customer service team.",
      constraints: ["Must use gated scoring (minimum thresholds per dimension)", "Must handle different conversation types (complaint, inquiry, escalation) with different weights", "Must include trend tracking over time", "Must produce actionable improvement recommendations per agent", "Must include calibration mechanism"],
      requiredSections: ["Dimension definitions", "Per-conversation-type weighting", "Gate thresholds", "Aggregation method", "Trend tracking design", "Improvement recommendation engine", "Calibration protocol"],
    },
    rubric: [
      { id: "w11-t02-r1", dimension: "System design", description: "Gated, weighted, multi-dimensional scoring", weight: 0.3 },
      { id: "w11-t02-r2", dimension: "Context sensitivity", description: "Different weights per conversation type", weight: 0.25 },
      { id: "w11-t02-r3", dimension: "Actionability", description: "Scores produce improvement recommendations", weight: 0.25 },
      { id: "w11-t02-r4", dimension: "Sustainability", description: "Includes calibration and trend tracking", weight: 0.2 },
    ],
    reviewSummary: "Scoring systems: binary, ordinal, continuous, weighted composite, penalty-based. Always use gates (minimum per dimension). Never rely on averages alone — they hide critical failures.",
    artifactType: "evaluation_harness", passThreshold: 80, xpValue: 175,
  },
  {
    id: "w11-t03-reliability-loops",
    weekNumber: 11, phase: 2, domain: "Evaluation & Reliability",
    title: "Reliability Loops",
    lesson: [
      { type: "text", content: "A reliability loop is a continuous process: deploy → monitor → detect issues → diagnose → fix → test → redeploy. Without this loop, AI systems degrade silently.\n\nLoop components:\n1. Monitoring: Track quality metrics in real-time\n2. Alerting: Trigger when metrics cross thresholds\n3. Diagnosis: Identify root cause of degradation\n4. Fix: Apply targeted prompt/system changes\n5. Verification: Confirm fix works without regression\n6. Deployment: Push fix through staged rollout" },
      { type: "text", content: "Why AI systems degrade:\n- Input distribution shifts (users change behavior)\n- Model updates (provider changes model weights)\n- Context drift (world changes, prompts don't)\n- Evaluation drift (standards shift without recalibration)\n- Compound errors (small issues accumulate)" },
    ],
    examples: [
      { title: "Reliability Loop", input: "Monday: Quality dashboard shows accuracy dropped from 92% to 87% over 2 weeks\nTuesday: Alert triggered. Root cause analysis: new product category not in training examples\nWednesday: Fix: Updated prompt to include new category definition\nThursday: Tested fix against regression suite (all pass) + 20 new-category tests (18/20 pass)\nFriday: Canary deploy to 10% traffic → monitor\nNext Monday: Full deploy after 72h clean canary", output: "Complete loop from detection to verified fix in one week.", explanation: "Each step has a clear action and verification. No step is skipped." },
    ],
    drills: [
      { id: "w11-t03-d1", type: "build", prompt: "Design a reliability monitoring dashboard for an AI chatbot. Define: which metrics to track, sampling rate, alert thresholds, escalation path, and expected response time for each alert severity level.", requiredElements: ["metrics list", "sampling rates", "alert thresholds", "escalation path", "response time SLAs"], evaluationCriteria: ["Metrics are meaningful", "Sampling is sufficient", "Thresholds are practical", "Escalation is clear", "Response times are realistic"] },
      { id: "w11-t03-d2", type: "design", prompt: "Design a degradation detection system that can distinguish between: (A) random noise, (B) gradual drift, (C) sudden breakage, and (D) periodic patterns. For each type, define detection method and appropriate response.", requiredElements: ["4 degradation types", "detection method per type", "response per type", "false alarm handling"], evaluationCriteria: ["Types clearly distinguished", "Detection methods are appropriate", "Responses match severity", "False alarms minimized"] },
    ],
    challenge: {
      id: "w11-t03-ch", type: "evaluation_design",
      scenario: "Design a complete reliability loop for an AI-powered fraud detection system processing 1M+ transactions daily. The system must maintain >99% accuracy while minimizing false positives. Degradation could cost millions in either direction (missed fraud or blocked legitimate transactions).",
      constraints: ["Must monitor in real-time with sub-minute detection", "Must distinguish between model drift and distribution shift", "Must have automated and human-in-the-loop components", "Must include staged rollback capability", "Must track both false positive and false negative rates separately", "Must include a post-incident review process"],
      requiredSections: ["Real-time monitoring design", "Alert classification system", "Root cause diagnosis protocol", "Fix and verification process", "Staged deployment protocol", "Post-incident review template"],
    },
    rubric: [
      { id: "w11-t03-r1", dimension: "Monitoring completeness", description: "All critical metrics tracked in real-time", weight: 0.25 },
      { id: "w11-t03-r2", dimension: "Detection speed", description: "Issues detected within defined SLA", weight: 0.25 },
      { id: "w11-t03-r3", dimension: "Response design", description: "Clear fix→verify→deploy process", weight: 0.25 },
      { id: "w11-t03-r4", dimension: "Learning loop", description: "Post-incident review improves future detection", weight: 0.25 },
    ],
    reviewSummary: "Reliability loop: deploy → monitor → detect → diagnose → fix → test → redeploy. AI systems degrade from input shifts, model updates, context drift, and compound errors. Monitor continuously, not once.",
    artifactType: "evaluation_harness", passThreshold: 80, xpValue: 175,
  },
];
