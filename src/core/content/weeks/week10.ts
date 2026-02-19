import type { Topic } from "../../types/topic";

export const week10: Topic[] = [
  {
    id: "w10-t01-output-comparison",
    weekNumber: 10, phase: 2, domain: "Evaluation & Reliability",
    title: "Output Comparison Methods",
    lesson: [
      { type: "text", content: "Comparing two AI outputs requires a structured framework. 'Which is better?' is not evaluation — it's a preference.\n\nComparison methods:\n1. Side-by-side rubric scoring: Score both outputs on the same rubric\n2. Pairwise preference: For each dimension, which output is better?\n3. Blind comparison: Remove labels, evaluate without knowing source\n4. Delta analysis: What specific improvements does B have over A?" },
      { type: "text", content: "Comparison must answer:\n- Which output is better overall? (aggregate)\n- On which dimensions is A better? B better? (disaggregate)\n- Is the difference meaningful or within noise? (significance)\n- What specific changes would make the worse one better? (actionable)" },
    ],
    examples: [
      { title: "Delta Analysis", input: "Output A: 'Revenue grew.'\nOutput B: 'Revenue grew 23% YoY to $4.2M in Q3.'\n\nDelta:\n- Specificity: B adds exact percentage, amount, and timeframe\n- Verifiability: B is checkable, A is not\n- Actionability: B enables decisions, A does not\n- Conciseness: A is shorter but less useful", output: "Delta analysis shows exactly what B does better and why.", explanation: "Instead of 'B is better,' you get 'B is better because it adds 3 specific properties.'" },
    ],
    drills: [
      { id: "w10-t01-d1", type: "compare", prompt: "Compare these two AI-generated email responses to a customer complaint using a 4-dimension rubric (empathy, accuracy, actionability, professionalism). Score each 1-5 per dimension, identify the winner per dimension, and explain what the loser should change.\n\nResponse A: 'Sorry about that! We'll look into it and get back to you soon.'\nResponse B: 'I apologize for the billing error on your March invoice. I've initiated a refund of $47.50 which will appear in 3-5 business days. Reference: #RF-2847.'", requiredElements: ["4-dimension scoring", "per-dimension winner", "improvement suggestions", "overall verdict"], evaluationCriteria: ["Both scored on all dimensions", "Winners identified with reasoning", "Suggestions are actionable", "Overall verdict justified"] },
      { id: "w10-t01-d2", type: "build", prompt: "Design a blind comparison protocol for evaluating two versions of a summarization prompt. 10 evaluators will each see 20 summary pairs (from prompt A and prompt B) without knowing which is which. Design the protocol, scoring method, and statistical significance test.", requiredElements: ["blind protocol", "scoring method", "sample size reasoning", "significance test"], evaluationCriteria: ["True blinding maintained", "Scoring is structured", "Sample size is justified", "Significance test is appropriate"] },
    ],
    challenge: {
      id: "w10-t01-ch", type: "evaluation_design",
      scenario: "Design a comprehensive comparison framework for evaluating 3 competing AI prompt designs for a legal document review system. Each prompt is being considered for production deployment. Your framework must produce a clear, defensible recommendation.",
      constraints: ["Must compare all 3 prompts, not just pairs", "Must use at least 3 comparison methods", "Must include blind evaluation component", "Must define statistical significance criteria", "Must produce actionable improvement recommendations for each prompt"],
      requiredSections: ["Comparison methodology", "Rubric for evaluation", "Blind evaluation protocol", "Statistical analysis plan", "Per-prompt improvement recommendations", "Final recommendation with confidence"],
    },
    rubric: [
      { id: "w10-t01-r1", dimension: "Methodology rigor", description: "Multiple comparison methods properly applied", weight: 0.3 },
      { id: "w10-t01-r2", dimension: "Objectivity", description: "Blind evaluation prevents bias", weight: 0.25 },
      { id: "w10-t01-r3", dimension: "Statistical reasoning", description: "Significance criteria prevent noise-based decisions", weight: 0.25 },
      { id: "w10-t01-r4", dimension: "Actionability", description: "Recommendations are specific and implementable", weight: 0.2 },
    ],
    reviewSummary: "Compare outputs with structure: side-by-side rubric, pairwise preference, blind comparison, delta analysis. Always disaggregate. Check if differences are significant or just noise.",
    artifactType: "evaluation_harness", passThreshold: 80, xpValue: 150,
  },
  {
    id: "w10-t02-ab-evaluation",
    weekNumber: 10, phase: 2, domain: "Evaluation & Reliability",
    title: "A/B Prompt Evaluation",
    lesson: [
      { type: "text", content: "A/B testing for prompts means running two versions on the same inputs and measuring which performs better. Unlike web A/B tests, prompt A/B tests must handle non-determinism and multi-dimensional quality.\n\nA/B testing protocol:\n1. Define the hypothesis: 'Prompt B will improve accuracy by 5%+'\n2. Select test inputs: Representative sample of production data\n3. Run both prompts on identical inputs\n4. Score outputs using the same rubric\n5. Analyze: Is the difference real or noise?" },
      { type: "text", content: "Critical mistakes:\n- Testing on too few inputs (need 50+ for significance)\n- Testing only happy paths (include edge cases)\n- Measuring only one dimension (accuracy up but safety down)\n- Running tests at different times (model behavior can vary)\n- Ignoring cost and latency differences" },
    ],
    examples: [
      { title: "A/B Test Design", input: "Hypothesis: Adding structured CoT to our classification prompt improves accuracy.\nTest set: 100 pre-labeled inputs (70 normal, 20 edge, 10 adversarial)\nMetrics: accuracy, consistency (same input 3 times), latency, cost\nSignificance: >5% improvement on accuracy, no regression on others\nDuration: Run all 100 inputs through both prompts within same hour", output: "Clear hypothesis, stratified test set, multiple metrics, significance threshold.", explanation: "The test would catch both improvements and regressions across multiple dimensions." },
    ],
    drills: [
      { id: "w10-t02-d1", type: "design", prompt: "Design an A/B test for two versions of a product recommendation prompt. Version A uses simple matching. Version B uses preference reasoning. Define: hypothesis, test set composition, metrics, significance thresholds, and duration.", requiredElements: ["hypothesis", "stratified test set", "multiple metrics", "significance thresholds", "timeline"], evaluationCriteria: ["Clear hypothesis", "Test set is representative", "Multiple quality dimensions measured", "Thresholds are reasonable", "Timeline is practical"] },
      { id: "w10-t02-d2", type: "analyze", prompt: "An A/B test shows Prompt B has 3% better accuracy than Prompt A, but the test used only 15 inputs. The team wants to deploy Prompt B. Explain why this is premature and design a proper test.", requiredElements: ["sample size critique", "statistical reasoning", "proper test design", "decision framework"], evaluationCriteria: ["Explains insufficiency of 15 inputs", "Calculates or estimates needed sample size", "Designs proper test", "Defines go/no-go criteria"] },
    ],
    challenge: {
      id: "w10-t02-ch", type: "evaluation_design",
      scenario: "Design a complete A/B testing framework for a company that deploys 5 prompt-based AI features. The framework must be reusable, support multi-dimensional evaluation, and produce defensible deployment decisions.\n\nFeatures: email classifier, chatbot, summarizer, data extractor, content moderator.",
      constraints: ["Framework must work for any prompt-based feature", "Must include test set design guidelines", "Must define per-feature metrics and thresholds", "Must handle multi-metric tradeoffs", "Must include a deployment decision tree"],
      requiredSections: ["Reusable A/B framework", "Test set design guidelines", "Per-feature metric definitions", "Tradeoff resolution rules", "Deployment decision tree", "Rollback criteria"],
    },
    rubric: [
      { id: "w10-t02-r1", dimension: "Framework design", description: "Reusable across different feature types", weight: 0.25 },
      { id: "w10-t02-r2", dimension: "Statistical rigor", description: "Sample sizes and significance properly defined", weight: 0.25 },
      { id: "w10-t02-r3", dimension: "Multi-metric handling", description: "Tradeoffs between dimensions addressed", weight: 0.25 },
      { id: "w10-t02-r4", dimension: "Decision clarity", description: "Clear go/no-go criteria", weight: 0.25 },
    ],
    reviewSummary: "A/B test prompts with: clear hypothesis, stratified test set (50+ inputs), multiple metrics, significance thresholds, and cost/latency tracking. Never deploy based on small samples or single metrics.",
    artifactType: "evaluation_harness", passThreshold: 80, xpValue: 150,
  },
  {
    id: "w10-t03-tradeoff-reasoning",
    weekNumber: 10, phase: 2, domain: "Evaluation & Reliability",
    title: "Tradeoff Reasoning",
    lesson: [
      { type: "text", content: "Every AI system involves tradeoffs. Improving one dimension usually degrades another. Good operators don't chase perfection — they make explicit, informed tradeoff decisions.\n\nCommon tradeoffs:\n- Accuracy vs Speed (more tokens = better but slower)\n- Safety vs Helpfulness (more guardrails = safer but less useful)\n- Precision vs Recall (stricter matching = fewer false positives, more misses)\n- Cost vs Quality (better model = higher cost)\n- Consistency vs Flexibility (more constraints = more consistent, less adaptable)" },
      { type: "text", content: "Tradeoff analysis framework:\n1. Identify the tradeoff pair\n2. Define what you gain and lose at each extreme\n3. Find the operating point (where should you be?)\n4. Define monitoring metrics for each side\n5. Set trigger points for rebalancing" },
    ],
    examples: [
      { title: "Tradeoff Analysis", input: "Tradeoff: Strictness of content moderation\nStrict extreme: Blocks 99% of harmful content, but also blocks 30% of legitimate content (false positive hell)\nLenient extreme: Allows 95% of legitimate content, but misses 40% of harmful content\nOperating point: Block 95% harmful, accept 10% false positive rate\nMonitor: False positive rate and harmful-content-leaked rate\nRebalance trigger: If false positives exceed 15% or leakage exceeds 10%", output: "Both extremes defined, operating point chosen, monitoring in place.", explanation: "The operating point is a deliberate choice, not an accident. Monitoring ensures you notice drift." },
    ],
    drills: [
      { id: "w10-t03-d1", type: "analyze", prompt: "Analyze the accuracy vs cost tradeoff for three approaches to document summarization:\nA: Single GPT-4 call ($0.03/summary, 92% quality)\nB: Three GPT-3.5 calls with voting ($0.006/summary, 88% quality)\nC: GPT-4 with self-verification ($0.06/summary, 96% quality)\n\nDefine the right choice for: a startup processing 100 docs/day, an enterprise processing 100K docs/day, and a medical system processing 1K critical docs/day.", requiredElements: ["cost analysis per scenario", "quality analysis per scenario", "recommendation per scenario", "justification"], evaluationCriteria: ["Cost math is correct", "Quality differences meaningful", "Recommendations differ appropriately", "Justifications consider context"] },
      { id: "w10-t03-d2", type: "design", prompt: "Design a tradeoff dashboard for monitoring an AI chatbot's safety vs helpfulness balance. Define the metrics for each side, the acceptable ranges, and the alert conditions.", requiredElements: ["safety metrics", "helpfulness metrics", "acceptable ranges", "alert conditions", "rebalancing triggers"], evaluationCriteria: ["Both sides measured", "Ranges are practical", "Alerts are actionable", "Rebalancing process defined"] },
    ],
    challenge: {
      id: "w10-t03-ch", type: "evaluation_design",
      scenario: "You're designing an AI-powered hiring assistant. Analyze all major tradeoffs and define the operating point for each. The system must be: accurate, fair, fast, cost-effective, and legally compliant.\n\nThese objectives cannot all be maximized simultaneously.",
      constraints: ["Must identify at least 5 tradeoff pairs", "Must define operating point for each with justification", "Must consider legal and ethical implications", "Must include monitoring plan for each tradeoff", "Must define when to rebalance each tradeoff"],
      requiredSections: ["Tradeoff pair identification", "Operating point analysis", "Legal/ethical considerations", "Monitoring metrics", "Rebalancing triggers and protocols"],
    },
    rubric: [
      { id: "w10-t03-r1", dimension: "Tradeoff identification", description: "5+ genuine tradeoff pairs found", weight: 0.25 },
      { id: "w10-t03-r2", dimension: "Operating point reasoning", description: "Each point justified with context", weight: 0.25 },
      { id: "w10-t03-r3", dimension: "Ethics/legal awareness", description: "Fairness and compliance addressed", weight: 0.25 },
      { id: "w10-t03-r4", dimension: "Monitoring design", description: "Each tradeoff has metrics and triggers", weight: 0.25 },
    ],
    reviewSummary: "Every system has tradeoffs. Identify pairs, define extremes, choose operating points deliberately, monitor both sides, set rebalancing triggers. Never chase one dimension blindly.",
    artifactType: "evaluation_harness", passThreshold: 80, xpValue: 150,
  },
];
