import type { Topic } from "../../types/topic";

export const week08: Topic[] = [
  {
    id: "w08-t01-test-case-creation",
    weekNumber: 8, phase: 2, domain: "Evaluation & Reliability",
    title: "Test Case Creation",
    lesson: [
      { type: "text", content: "Test cases for AI systems are structured input-output pairs that verify behavior. Unlike code tests, AI test cases must handle non-determinism — the same input may produce slightly different outputs.\n\nTest case anatomy:\n1. Input: Exact text/data provided\n2. Expected output shape: Structure, not exact text\n3. Property assertions: Specific checks that must pass\n4. Tolerance: Acceptable variation range" },
      { type: "callout", content: "Don't test for exact output (brittle). Test for properties: Does it contain X? Is field Y a valid number? Is the format correct? Does it NOT contain Z?" },
    ],
    examples: [
      { title: "Property-Based Test", input: "Input: 'The quarterly revenue was $4.2M, up 15% YoY.'\nAssertions:\n- Output contains 'revenue' field with numeric value\n- Revenue value is between 1000000 and 10000000\n- Output contains 'growth' field\n- Growth is a percentage string\n- Output is valid JSON", output: "Tests properties, not exact text. Handles non-determinism.", explanation: "This test passes regardless of formatting variation. It only fails if the model genuinely gets the extraction wrong." },
    ],
    drills: [
      { id: "w08-t01-d1", type: "build", prompt: "Write 8 property-based test cases for a prompt that classifies customer complaints into categories and extracts key entities. Cover: happy path, empty input, multi-category, non-English, very long text, injection attempt, ambiguous complaint, profanity.", requiredElements: ["8 test cases", "property assertions per case", "tolerance definitions", "covers all scenarios"], evaluationCriteria: ["8 distinct tests", "Each has property assertions", "Non-determinism handled", "All scenarios covered"] },
      { id: "w08-t01-d2", type: "design", prompt: "Design a test case generation framework that can automatically produce test cases for any classification prompt. The framework should take: category list, input format, and output schema, then generate a standard test suite.", requiredElements: ["framework structure", "auto-generation logic", "standard categories", "customization points"], evaluationCriteria: ["Framework is generalizable", "Generates standard test types", "Handles any classification task", "Customization is clear"] },
    ],
    challenge: {
      id: "w08-t01-ch", type: "evaluation_design",
      scenario: "Design a comprehensive test suite (12+ tests) for an AI-powered resume parser that extracts: name, contact info, work experience, education, skills, and certifications. The parser must handle resumes in various formats and languages.",
      constraints: ["12+ test cases with full specification", "Cover all 5 test categories (happy, edge, boundary, adversarial, regression)", "Property-based assertions only (no exact text matching)", "Include format variation tests (PDF text, LinkedIn export, creative resumes)", "Include adversarial tests (fake experience, injection in resume)"],
      requiredSections: ["Test case catalog", "Property assertion library", "Format variation tests", "Adversarial tests", "Coverage analysis"],
    },
    rubric: [
      { id: "w08-t01-r1", dimension: "Coverage", description: "All test categories with sufficient count", weight: 0.3 },
      { id: "w08-t01-r2", dimension: "Assertion quality", description: "Property-based, not exact-match", weight: 0.25 },
      { id: "w08-t01-r3", dimension: "Realistic inputs", description: "Test inputs reflect real resume formats", weight: 0.25 },
      { id: "w08-t01-r4", dimension: "Adversarial depth", description: "Adversarial tests are genuinely challenging", weight: 0.2 },
    ],
    reviewSummary: "Test AI output properties, not exact text. Anatomy: input, expected shape, property assertions, tolerance. Handle non-determinism by checking structure and constraints, not literal content.",
    artifactType: "evaluation_harness", passThreshold: 80, xpValue: 125,
  },
  {
    id: "w08-t02-regression-mindset",
    weekNumber: 8, phase: 2, domain: "Evaluation & Reliability",
    title: "Regression Mindset",
    lesson: [
      { type: "text", content: "A regression is when a change that fixes one problem breaks something that previously worked. In prompt engineering, this happens constantly — you fix edge case A and accidentally break happy path B.\n\nRegression prevention:\n1. Maintain a test suite that runs after every prompt change\n2. Never delete a test — only add new ones\n3. Track which change broke which test\n4. Always test the happy path after fixing edge cases" },
      { type: "text", content: "Regression testing workflow:\n1. Run full test suite → capture baseline\n2. Make one prompt change\n3. Run full test suite → compare to baseline\n4. If any test regressed → fix or revert\n5. If all pass → commit the change" },
    ],
    examples: [
      { title: "Regression Example", input: "Change: Added 'always respond in formal English' to fix casual tone issue.\nRegression: Non-English input handling broke — model now refuses to process French input.\nFix: Changed to 'always respond in formal tone' (removed language constraint).", output: "One word caused a regression in a different feature.", explanation: "Without regression testing, this bug would reach production. The fix was a one-word change." },
    ],
    drills: [
      { id: "w08-t02-d1", type: "analyze", prompt: "A prompt was changed to fix JSON formatting. Before the change, it handled multi-language input correctly. After the change, non-English input returns empty JSON. The change was adding: 'Extract English text only and format as JSON.'\n\nDiagnose the regression, explain the mechanism, and propose a fix that addresses both issues.", requiredElements: ["regression diagnosis", "mechanism explanation", "fix for both issues", "regression test proposal"], evaluationCriteria: ["Identifies the conflation of language and format", "Explains why the fix broke language handling", "Proposes a fix for both", "Suggests regression test"] },
      { id: "w08-t02-d2", type: "build", prompt: "Design a regression test suite for a prompt that classifies and routes customer emails. The suite must have a baseline of 10 tests. Show how you would use this suite to safely make 3 incremental improvements to the prompt.", requiredElements: ["10 baseline tests", "3 incremental changes", "per-change regression check", "rollback criteria"], evaluationCriteria: ["Baseline is comprehensive", "Each change is incremental", "Regression checks are shown", "Rollback criteria defined"] },
    ],
    challenge: {
      id: "w08-t02-ch", type: "evaluation_design",
      scenario: "Design a complete regression testing system for an AI content moderation prompt that has been through 8 versions. Each version fixed specific issues but may have introduced regressions.\n\nVersion history:\nv1: Basic classifier\nv2: Added sarcasm detection\nv3: Fixed false positives on news articles\nv4: Added multi-language support\nv5: Fixed injection vulnerability\nv6: Added context-aware moderation\nv7: Fixed over-flagging of medical content\nv8: Added severity scoring",
      constraints: ["Must have regression tests for each version's fix", "Must identify potential regression chains (v5 fix might break v4)", "Must include a test execution protocol", "Must define regression severity levels", "Must include a rollback decision framework"],
      requiredSections: ["Per-version regression tests", "Cross-version dependency analysis", "Test execution protocol", "Severity classification", "Rollback decision framework"],
    },
    rubric: [
      { id: "w08-t02-r1", dimension: "Version coverage", description: "Each version's fix has regression tests", weight: 0.3 },
      { id: "w08-t02-r2", dimension: "Dependency analysis", description: "Cross-version regression risks identified", weight: 0.25 },
      { id: "w08-t02-r3", dimension: "Process design", description: "Execution protocol is practical", weight: 0.25 },
      { id: "w08-t02-r4", dimension: "Decision framework", description: "Rollback criteria are clear and actionable", weight: 0.2 },
    ],
    reviewSummary: "Every prompt change can cause regressions. Maintain a test suite, run it after every change, never delete tests. Workflow: baseline → change one thing → compare → fix or revert.",
    artifactType: "evaluation_harness", passThreshold: 80, xpValue: 125,
  },
  {
    id: "w08-t03-versioning-prompts",
    weekNumber: 8, phase: 2, domain: "Evaluation & Reliability",
    title: "Prompt Versioning",
    lesson: [
      { type: "text", content: "Prompt versioning is treating prompts like code: every change is tracked, labeled, and reversible. Without versioning, you can't answer: 'What changed? When? Why? Can we go back?'\n\nVersioning essentials:\n1. Version numbers (semantic: major.minor.patch)\n2. Change log per version\n3. Test results per version\n4. Rollback capability\n5. A/B comparison between versions" },
      { type: "text", content: "Version naming convention:\n- Major (2.0.0): Fundamental behavior change\n- Minor (1.1.0): New capability or significant improvement\n- Patch (1.0.1): Bug fix that doesn't change behavior for passing tests\n\nEvery version in production must have: the prompt text, test results, approval, and deployment date." },
    ],
    examples: [
      { title: "Version Log", input: "v1.0.0 — Initial classifier (baseline: 85% accuracy)\nv1.0.1 — Fixed JSON wrapping bug (baseline: 85%, no regression)\nv1.1.0 — Added sarcasm handling (+3% accuracy, no regression)\nv2.0.0 — Redesigned for multi-language (baseline reset: 82%, new test suite)", output: "Clear lineage of changes with test results at each point.", explanation: "You can trace any behavior back to a specific version and understand why it changed." },
    ],
    drills: [
      { id: "w08-t03-d1", type: "build", prompt: "Create a version log template for managing prompts in production. Include: version number, date, author, change description, test results summary, approval status, rollback notes. Then fill in 4 sample entries.", requiredElements: ["template with all fields", "4 sample entries", "semantic versioning", "test results included"], evaluationCriteria: ["Template is complete", "Entries use semantic versioning", "Test results at each version", "Rollback info included"] },
      { id: "w08-t03-d2", type: "design", prompt: "Design a prompt management system for a team of 3 engineers working on 5 different prompts. How do you prevent conflicts? How do you ensure only tested prompts reach production? How do you handle emergency rollbacks?", requiredElements: ["conflict prevention", "deployment gates", "rollback process", "team workflow"], evaluationCriteria: ["Conflicts addressed", "Test-gated deployment", "Fast rollback path", "Workflow is practical"] },
    ],
    challenge: {
      id: "w08-t03-ch", type: "evaluation_design",
      scenario: "Design a complete prompt versioning and deployment system for a company running 10 AI prompts in production serving 100K+ users daily. Cover: version control, testing gates, staged rollout, monitoring, and emergency rollback.",
      constraints: ["Must support multiple environments (dev, staging, prod)", "Must have automated test gates", "Must support canary deployments (gradual rollout)", "Must have emergency rollback under 5 minutes", "Must track performance metrics per version"],
      requiredSections: ["Version control design", "Environment strategy", "Testing gates", "Canary deployment protocol", "Emergency rollback procedure", "Performance tracking"],
    },
    rubric: [
      { id: "w08-t03-r1", dimension: "System design", description: "Complete version control lifecycle", weight: 0.25 },
      { id: "w08-t03-r2", dimension: "Safety gates", description: "Automated testing before deployment", weight: 0.25 },
      { id: "w08-t03-r3", dimension: "Rollback speed", description: "Emergency rollback is fast and reliable", weight: 0.25 },
      { id: "w08-t03-r4", dimension: "Monitoring", description: "Performance tracked per version", weight: 0.25 },
    ],
    reviewSummary: "Version prompts like code: semantic versioning, change logs, test results per version, rollback capability. Every production prompt needs version lineage.",
    artifactType: "evaluation_harness", passThreshold: 80, xpValue: 125,
  },
];
