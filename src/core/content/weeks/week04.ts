import type { Topic } from "../../types/topic";

export const week04: Topic[] = [
  {
    id: "w04-t01-prompt-debugging",
    weekNumber: 4, phase: 1, domain: "Prompt Engineering",
    title: "Systematic Prompt Debugging",
    lesson: [
      { type: "text", content: "Prompt debugging follows code debugging discipline: reproduce → classify → isolate → fix minimal → verify.\n\nCommon root causes:\n- Format drift: missing output boundary\n- Hallucination: missing grounding clause\n- Inconsistency: contradicting constraints\n- Edge case failure: missing handler\n- Role confusion: vague role definition" },
      { type: "callout", content: "Never rewrite when a one-line fix suffices. Surgical fixes preserve what already works." },
    ],
    examples: [
      { title: "Surgical Fix", input: "Bug: JSON wrapped in markdown 40% of time.\nDiagnosis: No anti-markdown instruction.\nFix: Add 'Do not wrap in code blocks or markdown.'\nVerify: 5 inputs → all raw JSON.", output: "One line fix, not a rewrite.", explanation: "The fix targets the exact failure mode. Everything else stays the same." },
    ],
    drills: [
      { id: "w04-t01-d1", type: "debug", prompt: "This prompt returns 4 items when asked for 3, and adds explanatory text after:\n\"List the top 3 priorities. Be thorough.\"\nDiagnose root causes and provide minimal fixes.", requiredElements: ["count issue diagnosis", "extra text diagnosis", "'be thorough' conflict", "minimal fixes"], evaluationCriteria: ["Identifies count needs enforcement", "Identifies 'thorough' encourages extras", "Adds count enforcement", "Adds stop instruction"] },
      { id: "w04-t01-d2", type: "analyze", prompt: "Sentiment analysis returns 'positive' for negative reviews 10% of time. Prompt: \"Classify sentiment as positive, negative, or neutral.\"\nList 4+ root causes and how to systematically determine which is the actual cause.", requiredElements: ["4+ hypotheses", "diagnostic approach", "testing methodology"], evaluationCriteria: ["4+ plausible causes", "Each has verification method", "Systematic methodology proposed"] },
    ],
    challenge: {
      id: "w04-t01-ch", type: "prompt_engineering",
      scenario: "Bug report: Content moderation prompt incorrect 15% of time.\nFailure 1: Sarcasm marked 'safe'\nFailure 2: Foreign language marked 'unclassifiable' when offensive\nFailure 3: Long posts misclassified after truncation\nFailure 4: URLs trigger false spam flags\nFailure 5: Emoji-only posts get no classification\n\nDiagnose each, find root causes, produce fixed prompt addressing all 5.",
      constraints: ["Diagnose each individually", "Specific root cause per failure", "Minimal targeted fixes", "Verify fixes don't break existing behavior", "Final prompt handles all 5"],
      requiredSections: ["Per-failure diagnosis", "Root causes", "Targeted fixes", "Regression check plan", "Complete fixed prompt"],
    },
    rubric: [
      { id: "w04-t01-r1", dimension: "Diagnosis accuracy", description: "Correct root cause per failure", weight: 0.3 },
      { id: "w04-t01-r2", dimension: "Fix precision", description: "Minimal, not over-engineered", weight: 0.25 },
      { id: "w04-t01-r3", dimension: "Regression awareness", description: "Considers side effects of fixes", weight: 0.25 },
      { id: "w04-t01-r4", dimension: "Completeness", description: "All 5 failures addressed", weight: 0.2 },
    ],
    reviewSummary: "Debug prompts like code: reproduce, classify, isolate, fix minimally, verify. Never rewrite when a one-line fix works.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 125,
  },
  {
    id: "w04-t02-iteration-discipline",
    weekNumber: 4, phase: 1, domain: "Prompt Engineering",
    title: "Iteration Discipline",
    lesson: [
      { type: "text", content: "Good prompt engineering is iterative. Write v1, test, find failures, fix one thing, test again.\n\nIteration log: 1. Record each version 2. Record what changed and why 3. Record test inputs 4. Record improvements and regressions\n\nWithout this, you're guessing. With this, you're engineering." },
    ],
    examples: [
      { title: "Iteration Log", input: "v1: 'Summarize this article.' → Too long, no format\nv2: Added '3 bullets, max 100 words' → Better length, vague bullets\nv3: Added 'Each bullet starts with specific finding' → Good density\nv4: Added 'No introductory phrases' → Final", output: "4 iterations, one change each, tested against same 3 articles.", explanation: "Disciplined iteration beats creative rewriting." },
    ],
    drills: [
      { id: "w04-t02-d1", type: "build", prompt: "Start with: 'Analyze this company.' Improve through exactly 4 iterations. Document each: what changed, why, expected improvement. Final must be production-ready.", requiredElements: ["4 iterations", "one change per", "rationale each", "final prompt"], evaluationCriteria: ["Exactly 4 documented iterations", "Single-variable changes", "Logical rationale", "Final significantly better"] },
      { id: "w04-t02-d2", type: "analyze", prompt: "What went wrong in this history?\nv1: 'Extract names' → missed some\nv2: 'Extract all names and titles' → false positives\nv3: Complete rewrite → lost what v1 did well\nv4: Another rewrite → back to square one", requiredElements: ["rewrite mistake", "lost progress", "targeted fix recommendation", "testing discipline"], evaluationCriteria: ["Identifies rewrites discarded progress", "Recommends single-variable changes", "Suggests keeping log", "Better iteration path"] },
    ],
    challenge: {
      id: "w04-t02-ch", type: "prompt_engineering",
      scenario: "Broken product description generator. Problems: too long (200+ words vs 50 needed), inconsistent tone, missing features, sometimes includes competitor comparisons.\n\nStart: 'Write a product description. Make it compelling with all important details.'\n\nProduce a documented 5-iteration improvement that addresses all 4 issues.",
      constraints: ["Exactly 5 iterations", "Max 2 changes per iteration", "Document change/rationale/expected result each", "All 4 failures addressed", "Final is complete and self-contained"],
      requiredSections: ["Starting prompt analysis", "5 documented iterations", "Per-iteration test results", "Final production prompt", "Remaining risks"],
    },
    rubric: [
      { id: "w04-t02-r1", dimension: "Discipline", description: "Exactly 5 iterations with documented rationale", weight: 0.3 },
      { id: "w04-t02-r2", dimension: "Targeted changes", description: "Each iteration changes minimal amount", weight: 0.25 },
      { id: "w04-t02-r3", dimension: "Coverage", description: "All 4 original problems addressed", weight: 0.25 },
      { id: "w04-t02-r4", dimension: "Final quality", description: "Production-ready final prompt", weight: 0.2 },
    ],
    reviewSummary: "Iterate with discipline: one change per iteration, log everything, test consistently. Rewrites destroy progress. Single-variable changes are debuggable.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 125,
  },
  {
    id: "w04-t03-reducing-hallucinations",
    weekNumber: 4, phase: 1, domain: "Prompt Engineering",
    title: "Reducing Hallucinations",
    lesson: [
      { type: "text", content: "Hallucinations happen when the model generates plausible-sounding but factually incorrect content. You can't eliminate them, but you can dramatically reduce them.\n\nAnti-hallucination techniques:\n1. Ground the model: 'Only use information from the provided text'\n2. Ban invention: 'Do not infer, assume, or generate information not explicitly stated'\n3. Force sourcing: 'Quote the exact passage that supports each claim'\n4. Add uncertainty: 'If unsure, say \"insufficient data\" instead of guessing'\n5. Reduce scope: Narrower tasks hallucinate less than open-ended ones" },
    ],
    examples: [
      { title: "Grounding Clause", input: "Base your response ONLY on the provided document. If the document does not contain information needed to answer, respond: 'Not found in source document.' Do not use external knowledge. Do not infer.", output: "This clause eliminates most hallucination by removing the model's ability to improvise.", explanation: "Four specific rules: only source data, explicit not-found response, no external knowledge, no inference." },
    ],
    drills: [
      { id: "w04-t03-d1", type: "harden", prompt: "Add anti-hallucination measures to:\n\"Based on this research paper, summarize the key findings and their implications.\"\nThe current prompt lets the model mix paper content with its own knowledge.", requiredElements: ["grounding clause", "anti-invention rule", "source attribution", "uncertainty handling"], evaluationCriteria: ["Restricts to paper content only", "Bans external knowledge", "Requires source references", "Defines 'not found' behavior"] },
      { id: "w04-t03-d2", type: "design", prompt: "Design a fact-checking prompt that takes a claim and a source document, and determines if the claim is supported. Output must include: verdict (supported/unsupported/partially/insufficient_data), evidence quotes, and confidence.", requiredElements: ["verdict categories", "evidence quoting", "confidence score", "insufficient data handling"], evaluationCriteria: ["Clear verdict taxonomy", "Requires direct quotes", "Confidence is meaningful", "Handles missing evidence explicitly"] },
    ],
    challenge: {
      id: "w04-t03-ch", type: "prompt_engineering",
      scenario: "Design an anti-hallucination framework for a customer-facing Q&A system that answers questions using a company knowledge base. The system must NEVER state something not in the knowledge base, NEVER improvise answers, and ALWAYS indicate when it doesn't have information.",
      constraints: ["Every answer must cite a knowledge base article", "Must have a graceful 'I don't know' response", "Must handle partial matches", "Must not use external knowledge", "Must handle follow-up questions that go beyond KB scope"],
      requiredSections: ["Grounding rules", "Citation mechanism", "Unknown handling", "Partial match behavior", "Scope boundary enforcement"],
    },
    rubric: [
      { id: "w04-t03-r1", dimension: "Grounding strength", description: "Effectively prevents out-of-source content", weight: 0.3 },
      { id: "w04-t03-r2", dimension: "Citation design", description: "Meaningful source attribution", weight: 0.25 },
      { id: "w04-t03-r3", dimension: "Graceful degradation", description: "Good UX when answer isn't available", weight: 0.25 },
      { id: "w04-t03-r4", dimension: "Scope enforcement", description: "Stays within KB boundaries", weight: 0.2 },
    ],
    reviewSummary: "Reduce hallucinations with: grounding clauses, invention bans, source attribution, uncertainty handling, and scope reduction. Can't eliminate but can dramatically reduce.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 125,
  },
  {
    id: "w04-t04-edge-case-thinking",
    weekNumber: 4, phase: 1, domain: "Prompt Engineering",
    title: "Edge Case Thinking",
    lesson: [
      { type: "text", content: "Edge cases in prompting are inputs that your prompt wasn't designed for but will inevitably receive. If you don't plan for them, the model will handle them unpredictably.\n\nEdge case categories:\n1. Empty or trivial input\n2. Extremely long input\n3. Malformed input\n4. Contradictory input\n5. Out-of-domain input\n6. Adversarial input\n7. Multi-language input\n8. Input with special characters" },
    ],
    examples: [
      { title: "Edge Case Checklist", input: "For a text classifier, test:\n- Empty string → should return 'invalid_input'\n- Single word → should still classify\n- 50,000 word document → should handle or truncate\n- Mixed languages → should flag or handle\n- HTML/markdown in text → should strip or handle\n- Repeated text → should classify normally", output: "Systematic coverage of all edge case categories.", explanation: "Each edge case has a defined behavior. No surprises in production." },
    ],
    drills: [
      { id: "w04-t04-d1", type: "analyze", prompt: "List every edge case category for a prompt that extracts person names from text. For each: the edge case, what happens without handling, and what should happen.", requiredElements: ["6+ edge cases", "failure mode per case", "correct behavior per case"], evaluationCriteria: ["Comprehensive edge case list", "Accurate failure predictions", "Practical correct behaviors"] },
      { id: "w04-t04-d2", type: "harden", prompt: "This prompt works for normal input but fails on edge cases:\n\"Extract the company name and revenue from this article.\"\nAdd handling for: article mentions multiple companies, revenue in different currencies, no revenue mentioned, revenue is a range, article is not about a company.", requiredElements: ["multi-company", "currency handling", "missing revenue", "revenue range", "non-company article"], evaluationCriteria: ["Each edge case explicitly handled", "Behaviors are practical", "Original functionality preserved"] },
    ],
    challenge: {
      id: "w04-t04-ch", type: "prompt_engineering",
      scenario: "Design a complete edge case handling framework for an AI-powered form validator. The system checks user-submitted forms (name, email, phone, address, date of birth) and flags issues.\n\nYour framework must handle every realistic edge case across all fields.",
      constraints: ["Cover all 8 edge case categories from the lesson", "Define behavior for each field × each category", "Must not over-reject valid but unusual input", "Must not accept clearly invalid input", "Must handle international formats"],
      requiredSections: ["Edge case matrix (fields × categories)", "Per-case behavior definitions", "False positive prevention", "International format handling", "Graceful error messages"],
    },
    rubric: [
      { id: "w04-t04-r1", dimension: "Coverage", description: "All edge case categories addressed", weight: 0.3 },
      { id: "w04-t04-r2", dimension: "Behavior precision", description: "Clear behavior for each case", weight: 0.25 },
      { id: "w04-t04-r3", dimension: "Balance", description: "Neither too strict nor too lenient", weight: 0.25 },
      { id: "w04-t04-r4", dimension: "International", description: "Handles global formats correctly", weight: 0.2 },
    ],
    reviewSummary: "Plan for 8 edge case categories: empty, long, malformed, contradictory, out-of-domain, adversarial, multi-language, special characters. Define behavior for each. Test explicitly.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 125,
  },
];
