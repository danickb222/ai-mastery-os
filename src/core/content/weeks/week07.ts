import type { Topic } from "../../types/topic";

export const week07: Topic[] = [
  {
    id: "w07-t01-designing-rubrics",
    weekNumber: 7, phase: 2, domain: "Evaluation & Reliability",
    title: "Designing Evaluation Rubrics",
    lesson: [
      { type: "text", content: "A rubric is a scoring framework that defines what 'good' looks like across multiple dimensions. Without rubrics, evaluation is subjective and inconsistent.\n\nRubric components:\n1. Dimensions: What aspects to evaluate (accuracy, completeness, format)\n2. Levels: What each score means (1=poor, 3=adequate, 5=excellent)\n3. Descriptions: Concrete criteria per level per dimension\n4. Weights: Relative importance of each dimension" },
      { type: "callout", content: "A rubric is only useful if two independent evaluators would give the same score. If your descriptions are vague, your rubric is broken." },
    ],
    examples: [
      { title: "Concrete Rubric", input: "Dimension: Accuracy\n5: All facts verifiable, no hallucination, sources cited\n3: Mostly accurate, 1-2 minor errors, no sources\n1: Multiple factual errors or unsupported claims\n\nDimension: Completeness\n5: All required sections present with sufficient depth\n3: Most sections present, some thin\n1: Missing required sections", output: "Each level has observable, measurable criteria.", explanation: "Anyone reading these descriptions would score the same output the same way. That's the test of a good rubric." },
    ],
    drills: [
      { id: "w07-t01-d1", type: "build", prompt: "Design a 4-dimension rubric for evaluating AI-generated customer emails. Dimensions: tone, accuracy, actionability, professionalism. Each dimension needs 3 levels (1/3/5) with concrete descriptions.", requiredElements: ["4 dimensions", "3 levels each", "concrete descriptions", "no vague language"], evaluationCriteria: ["All 4 dimensions defined", "Each has 3 measurable levels", "Descriptions are specific", "Two evaluators would agree"] },
      { id: "w07-t01-d2", type: "evaluate", prompt: "Critique this rubric:\nDimension: Quality — 5: Very good, 3: Okay, 1: Bad\nDimension: Usefulness — 5: Very useful, 3: Somewhat useful, 1: Not useful\n\nWhat's wrong? Redesign both dimensions with proper criteria.", requiredElements: ["identifies vagueness", "identifies subjectivity", "redesigned dimensions", "measurable criteria"], evaluationCriteria: ["Spots that levels are undefined", "Spots circular definitions", "Provides specific redesign", "New criteria are measurable"] },
    ],
    challenge: {
      id: "w07-t01-ch", type: "evaluation_design",
      scenario: "Design a complete evaluation rubric for an AI system that generates technical documentation. The rubric must be usable by both human reviewers and automated evaluation prompts.\n\nThe documentation covers: API endpoints, code examples, error handling, and best practices.",
      constraints: ["At least 5 dimensions", "Each dimension has 4 levels (1-4)", "Descriptions must be specific enough for automated evaluation", "Include weighting with justification", "Must handle documentation of varying complexity"],
      requiredSections: ["Dimensions with weights", "Per-level descriptions (all dimensions × all levels)", "Inter-rater reliability design", "Automation guidelines", "Edge case handling"],
    },
    rubric: [
      { id: "w07-t01-r1", dimension: "Rubric depth", description: "5+ dimensions with 4 levels each fully described", weight: 0.3 },
      { id: "w07-t01-r2", dimension: "Measurability", description: "Every criterion is observable and measurable", weight: 0.3 },
      { id: "w07-t01-r3", dimension: "Consistency", description: "Two evaluators would agree using this rubric", weight: 0.2 },
      { id: "w07-t01-r4", dimension: "Automation readiness", description: "Criteria can be checked programmatically", weight: 0.2 },
    ],
    reviewSummary: "Rubrics define dimensions, levels, descriptions, and weights. The test: two independent evaluators give the same score. Vague descriptions = broken rubric.",
    artifactType: "evaluation_harness", passThreshold: 80, xpValue: 125,
  },
  {
    id: "w07-t02-defining-good-output",
    weekNumber: 7, phase: 2, domain: "Evaluation & Reliability",
    title: "Defining 'Good' Output",
    lesson: [
      { type: "text", content: "Before you can evaluate, you must define what 'good' means for your specific use case. 'Good' is not universal — it depends on:\n\n1. Who consumes the output (human reader vs code parser)\n2. What decisions it informs (casual browsing vs medical diagnosis)\n3. What failures cost (minor annoyance vs legal liability)\n4. What resources are available (one model call vs multi-step pipeline)" },
      { type: "text", content: "Definition framework:\n1. Must-have properties: Output is useless without these\n2. Should-have properties: Output is better with these\n3. Must-not-have properties: Output is harmful with these\n4. Acceptable tradeoffs: What you'll sacrifice for what" },
    ],
    examples: [
      { title: "Good Output Definition", input: "For a product recommendation system:\nMust-have: Relevant to user history, available in stock, within price range\nShould-have: Diverse categories, personalized explanation, confidence score\nMust-not-have: Out-of-stock items, competitor products, inappropriate content\nTradeoffs: Prefer relevance over diversity. Prefer availability over perfect match.", output: "Four-layer definition with explicit tradeoffs.", explanation: "Now anyone can evaluate a recommendation: check must-haves, score should-haves, verify no must-not-haves, confirm tradeoff alignment." },
    ],
    drills: [
      { id: "w07-t02-d1", type: "build", prompt: "Define 'good output' for an AI-powered meeting notes generator using the must-have / should-have / must-not-have / tradeoffs framework. Consider: accuracy, completeness, format, attribution, and confidentiality.", requiredElements: ["must-have list", "should-have list", "must-not-have list", "explicit tradeoffs"], evaluationCriteria: ["Each category has 3+ items", "Items are specific", "Tradeoffs are realistic", "Covers all stated concerns"] },
      { id: "w07-t02-d2", type: "compare", prompt: "Define 'good output' for the SAME task (email response generation) in two different contexts: (A) internal team communication, (B) customer-facing support. Show how the definition changes and why.", requiredElements: ["context A definition", "context B definition", "differences highlighted", "reasoning for differences"], evaluationCriteria: ["Both definitions complete", "Meaningful differences identified", "Reasoning is sound", "Shows context-dependent quality"] },
    ],
    challenge: {
      id: "w07-t02-ch", type: "evaluation_design",
      scenario: "Define 'good output' for an AI system that generates investment research summaries for three different audiences: retail investors, financial advisors, and compliance officers. Each audience has different needs, risk tolerances, and regulatory requirements.",
      constraints: ["Separate definition for each audience", "Must-have / should-have / must-not-have / tradeoffs per audience", "Compliance-specific requirements for compliance audience", "Identify where audience definitions conflict", "Propose resolution for conflicts"],
      requiredSections: ["Retail investor definition", "Financial advisor definition", "Compliance officer definition", "Conflict identification", "Resolution framework"],
    },
    rubric: [
      { id: "w07-t02-r1", dimension: "Audience awareness", description: "Definitions genuinely differ by audience", weight: 0.3 },
      { id: "w07-t02-r2", dimension: "Completeness", description: "All four categories per audience", weight: 0.25 },
      { id: "w07-t02-r3", dimension: "Conflict identification", description: "Real conflicts found and articulated", weight: 0.25 },
      { id: "w07-t02-r4", dimension: "Resolution quality", description: "Practical conflict resolution proposed", weight: 0.2 },
    ],
    reviewSummary: "Define 'good' with four layers: must-have, should-have, must-not-have, and tradeoffs. Quality is context-dependent — always define for your specific audience and use case.",
    artifactType: "evaluation_harness", passThreshold: 80, xpValue: 125,
  },
  {
    id: "w07-t03-calibration",
    weekNumber: 7, phase: 2, domain: "Evaluation & Reliability",
    title: "Calibration Thinking",
    lesson: [
      { type: "text", content: "Calibration means your evaluation scores are consistent, comparable, and meaningful. A score of 80 should mean the same thing whether it's the first evaluation or the hundredth.\n\nCalibration problems:\n1. Drift: Standards shift over time (scores get easier or harder)\n2. Anchor bias: First evaluation sets the bar for all others\n3. Context contamination: Judging output B based on output A\n4. Scale compression: Everything clusters around 70-80" },
      { type: "text", content: "Calibration techniques:\n1. Reference examples: Anchor each score level with a concrete example\n2. Blind evaluation: Score without seeing previous scores\n3. Periodic recalibration: Re-score old examples with current rubric\n4. Multi-evaluator agreement: Check that multiple evaluators converge" },
    ],
    examples: [
      { title: "Reference Anchors", input: "Score 90: [paste a real example that deserves 90]\nScore 70: [paste a real example that deserves 70]\nScore 50: [paste a real example that deserves 50]\nScore 30: [paste a real example that deserves 30]\n\nWhen scoring, compare against these anchors.", output: "Four concrete reference points prevent scale drift and compression.", explanation: "Without anchors, evaluators invent their own scale. With anchors, everyone calibrates to the same standard." },
    ],
    drills: [
      { id: "w07-t03-d1", type: "build", prompt: "Create a calibration system for evaluating AI-generated code reviews. Define 4 reference anchors (scores 90, 70, 50, 30) with concrete examples of code review output at each level. Explain what distinguishes each level.", requiredElements: ["4 anchor examples", "concrete output at each level", "distinguishing factors", "clear boundaries"], evaluationCriteria: ["Anchors are realistic", "Clear quality differences between levels", "Boundaries are unambiguous", "Would prevent score drift"] },
      { id: "w07-t03-d2", type: "analyze", prompt: "A team evaluating AI summaries notices: all scores cluster between 65-80, newer summaries score higher than older ones of equal quality, and two evaluators disagree by 20+ points on the same output. Diagnose each problem and propose fixes.", requiredElements: ["scale compression diagnosis", "drift diagnosis", "evaluator disagreement diagnosis", "specific fixes"], evaluationCriteria: ["Correctly identifies compression", "Identifies temporal drift", "Identifies calibration gap", "Fixes are practical"] },
    ],
    challenge: {
      id: "w07-t03-ch", type: "evaluation_design",
      scenario: "Design a complete calibration system for a team of 5 people who evaluate AI-generated marketing copy. The system must ensure consistency across evaluators, prevent drift over time, and produce scores that are comparable across months of evaluations.",
      constraints: ["Must include reference anchors for each rubric dimension", "Must include calibration sessions protocol", "Must include inter-rater reliability measurement", "Must include drift detection mechanism", "Must handle evaluator disagreement resolution"],
      requiredSections: ["Reference anchor library", "Calibration session design", "Inter-rater reliability metric", "Drift detection protocol", "Disagreement resolution process"],
    },
    rubric: [
      { id: "w07-t03-r1", dimension: "Anchor quality", description: "Reference examples clearly differentiate score levels", weight: 0.25 },
      { id: "w07-t03-r2", dimension: "Process design", description: "Calibration sessions are practical and sufficient", weight: 0.25 },
      { id: "w07-t03-r3", dimension: "Measurement", description: "Reliability and drift metrics are defined", weight: 0.25 },
      { id: "w07-t03-r4", dimension: "Disagreement handling", description: "Clear resolution process", weight: 0.25 },
    ],
    reviewSummary: "Calibration ensures consistent, comparable scores. Use reference anchors, blind evaluation, periodic recalibration, and multi-evaluator agreement checks. Watch for drift, anchor bias, and scale compression.",
    artifactType: "evaluation_harness", passThreshold: 80, xpValue: 125,
  },
];
