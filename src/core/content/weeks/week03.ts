import type { Topic } from "../../types/topic";

export const week03: Topic[] = [
  {
    id: "w03-t01-json-outputs",
    weekNumber: 3, phase: 1, domain: "Prompt Engineering",
    title: "Forcing JSON Output",
    lesson: [
      { type: "text", content: "When output feeds into code, JSON is standard. Models break JSON predictably: markdown wrappers, trailing commas, wrong types, extra commentary, inconsistent field names.\n\nReliable JSON requires: explicit schema, output boundary instructions, type specifications, and validation rules." },
      { type: "callout", content: "Always include: 'Respond with ONLY valid JSON. No text before or after. No code blocks.' This eliminates 50% of JSON failures." },
    ],
    examples: [
      { title: "JSON Enforcement", input: "System: Data extraction engine. Respond with ONLY valid JSON:\n{\"name\": string, \"email\": string|null, \"intent\": \"buy\"|\"support\"|\"other\", \"urgency\": 1-5}\nRules: null for missing fields. No invented data. No markdown wrapping.", output: "{\"name\":\"Sarah Chen\",\"email\":\"sarah@acme.com\",\"intent\":\"buy\",\"urgency\":3}", explanation: "Schema + types + null handling + anti-markdown = 95%+ valid JSON." },
    ],
    drills: [
      { id: "w03-t01-d1", type: "build", prompt: "Design a JSON-forcing prompt for event data extraction. Schema: event_name (string), date (ISO), location (string|null), attendee_count (number|null), category (enum of 5). Include all enforcement rules.", requiredElements: ["schema", "types", "null handling", "enum", "boundary rules"], evaluationCriteria: ["All fields typed", "Null handling defined", "Enum values listed", "Output boundary present", "Date format specified"] },
      { id: "w03-t01-d2", type: "debug", prompt: "This prompt produces broken JSON 30% of time. Failures: markdown wrapping, extra text after JSON, 'urgency' returns 'medium' instead of number. Fix all three:\n\"Extract data as JSON with fields: name, email, urgency level, summary.\"", requiredElements: ["markdown fix", "extra text fix", "type fix", "complete prompt"], evaluationCriteria: ["Anti-markdown instruction", "Anti-extra-text instruction", "Urgency typed as number", "Complete fixed prompt"] },
    ],
    challenge: {
      id: "w03-t01-ch", type: "prompt_engineering",
      scenario: "Design a JSON extraction prompt for a real estate listing parser. Raw listings → structured data. Fields: address, price (number), bedrooms (number), bathrooms (number), sqft (number|null), type ('sale'|'rent'), features (string[], max 5), summary (string, max 30 words).",
      constraints: ["Valid parseable JSON", "Numbers must be numbers not strings", "Null for missing, never invented", "Features 1-5 items", "Handles vague/incomplete listings"],
      requiredSections: ["Complete JSON schema", "Null vs default policy", "Type enforcement", "Output boundaries", "Incomplete input handling"],
    },
    rubric: [
      { id: "w03-t01-r1", dimension: "Schema completeness", description: "All fields with correct types", weight: 0.3 },
      { id: "w03-t01-r2", dimension: "JSON reliability", description: "All enforcement rules present", weight: 0.3 },
      { id: "w03-t01-r3", dimension: "Type safety", description: "Number/string/null/enum enforced", weight: 0.2 },
      { id: "w03-t01-r4", dimension: "Edge cases", description: "Handles bad/incomplete input", weight: 0.2 },
    ],
    reviewSummary: "Force JSON with explicit schema, type specs, null rules, anti-markdown instructions, output boundaries. Define enum values explicitly.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 100,
  },
  {
    id: "w03-t02-schema-enforcement",
    weekNumber: 3, phase: 1, domain: "Prompt Engineering",
    title: "Schema Enforcement & Validation",
    lesson: [
      { type: "text", content: "Schema enforcement means the model must produce output conforming to a strict contract — every field present, every type correct, every constraint met. Like an API contract: if output doesn't match schema, it's a bug.\n\nLayers: 1. Schema in prompt 2. Type annotations 3. Required vs optional 4. Validation rules (ranges, lengths, patterns)" },
    ],
    examples: [
      { title: "Schema with Validation", input: "Schema:\n{\"score\": int 0-100 required, \"grade\": \"A\"|\"B\"|\"C\"|\"D\"|\"F\" required, \"comments\": string 10-200 chars required, \"flagged\": boolean default false}", output: "{\"score\":72,\"grade\":\"C\",\"comments\":\"Meets basic requirements but lacks depth.\",\"flagged\":false}", explanation: "Every field has type, constraint, and required marker. No room for deviation." },
    ],
    drills: [
      { id: "w03-t02-d1", type: "build", prompt: "Design strict schema for search results API. Each result: title (max 100 chars), url (https), snippet (50-200 chars), relevance (float 0.0-1.0), category (enum). Response: {results: array max 10, total_count: number}.", requiredElements: ["nested schema", "field constraints", "array limits", "type enforcement"], evaluationCriteria: ["All fields typed and constrained", "Array has max length", "URL format rule", "Score has range"] },
      { id: "w03-t02-d2", type: "debug", prompt: "Tighten this loose schema for a task management API:\n{\"item\": any, \"status\": string, \"data\": object}\nSpecify concrete types.", requiredElements: ["typed item", "status enum", "data shape", "no any/object"], evaluationCriteria: ["Replaces any", "Status is enum", "Data has defined shape", "All concrete types"] },
    ],
    challenge: {
      id: "w03-t02-ch", type: "prompt_engineering",
      scenario: "Design a schema enforcement prompt for an invoice extraction system. Processes OCR text, outputs structured data for accounting. Must never contain invented data, handle OCR errors, pass strict validation.",
      constraints: ["10+ fields with full type definitions", "Nested objects (vendor, line items)", "Array with item schema", "Null behavior for every optional field", "Validation rules (dates, currency, positive numbers)", "OCR artifact handling"],
      requiredSections: ["Complete typed schema", "Required vs optional", "Validation per field", "OCR error strategy", "Null/default policy"],
    },
    rubric: [
      { id: "w03-t02-r1", dimension: "Schema depth", description: "10+ fields with nesting", weight: 0.3 },
      { id: "w03-t02-r2", dimension: "Type strictness", description: "No any/object types", weight: 0.25 },
      { id: "w03-t02-r3", dimension: "Validation", description: "Ranges, formats, patterns defined", weight: 0.25 },
      { id: "w03-t02-r4", dimension: "Error resilience", description: "Handles OCR noise and gaps", weight: 0.2 },
    ],
    reviewSummary: "Schema enforcement = strict API contract. Define every field's type, constraints, required status. No 'any' types. Include validation rules.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 100,
  },
  {
    id: "w03-t03-ambiguity-handling",
    weekNumber: 3, phase: 1, domain: "Prompt Engineering",
    title: "Handling Ambiguous & Unknown Input",
    lesson: [
      { type: "text", content: "Real-world input is messy — incomplete, contradictory, ambiguous. If your prompt doesn't handle these, the model halluceinates to fill gaps.\n\nFix: define explicit behavior for every failure mode. Tell the model what to do when it doesn't know, when input contradicts, when data is missing, when request is out of scope." },
      { type: "callout", content: "The most dangerous behavior is confident hallucination on ambiguous input. Your prompt must make 'I don't know' an acceptable output." },
    ],
    examples: [
      { title: "Ambiguity Clauses", input: "- If ambiguous: flag as 'ambiguous', provide best interpretation + alternative\n- If missing data: use null, never invent\n- If contradicts instructions: follow instructions, note conflict\n- If uncertain: confidence < 0.5, explain why", output: "Four clauses for four common failure modes.", explanation: "Each clause has specific behavior. Model can't silently hallucinate." },
    ],
    drills: [
      { id: "w03-t03-d1", type: "build", prompt: "Write ambiguity handling rules for a date extraction prompt. Handle: relative dates ('next Tuesday'), format ambiguity (03/04/2024), impossible dates (Feb 30), missing dates, date ranges.", requiredElements: ["relative dates", "format ambiguity", "impossible dates", "missing dates", "ranges"], evaluationCriteria: ["Relative date behavior", "Format resolution", "Impossible date handling", "Null for missing", "Range handling"] },
      { id: "w03-t03-d2", type: "harden", prompt: "Add ambiguity handling to:\n\"Classify text as positive, negative, or neutral.\"\nHandle: empty input, non-text (just numbers/URLs), mixed sentiment, sarcasm, extremely long input.", requiredElements: ["empty handling", "non-text", "mixed sentiment", "sarcasm", "long input"], evaluationCriteria: ["Empty input behavior", "Non-text handling", "Mixed sentiment resolution", "Sarcasm awareness", "Long input handling"] },
    ],
    challenge: {
      id: "w03-t03-ch", type: "prompt_engineering",
      scenario: "Design an ambiguity handling framework for a document classification system in a law firm. Documents vary in format, language, completeness. Classify into 8 categories and extract metadata. Must NEVER silently guess.",
      constraints: ["Multiple languages", "Partial/corrupted documents", "Multi-category documents", "Uncertainty quantification", "Escalation for low confidence", "No hallucinated metadata"],
      requiredSections: ["Multi-language handling", "Partial document handling", "Multi-category resolution", "Uncertainty quantification", "Escalation rules", "Anti-hallucination"],
    },
    rubric: [
      { id: "w03-t03-r1", dimension: "Failure coverage", description: "All edge cases handled explicitly", weight: 0.3 },
      { id: "w03-t03-r2", dimension: "Anti-hallucination", description: "Prevents confident wrong output", weight: 0.3 },
      { id: "w03-t03-r3", dimension: "Uncertainty design", description: "Quantifies and communicates uncertainty", weight: 0.2 },
      { id: "w03-t03-r4", dimension: "Escalation", description: "When and how to escalate to humans", weight: 0.2 },
    ],
    reviewSummary: "Always define behavior for ambiguity, missing data, contradictions, out-of-scope requests. Make 'I don't know' acceptable. Never let the model silently hallucinate.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 100,
  },
  {
    id: "w03-t04-unknown-values",
    weekNumber: 3, phase: 1, domain: "Prompt Engineering",
    title: "Unknown Value Handling & Null Design",
    lesson: [
      { type: "text", content: "When the model encounters data it can't extract or questions it can't answer, it must have explicit instructions. Without them, it will invent plausible-sounding answers.\n\nNull design patterns:\n1. Use null for genuinely absent data\n2. Use 'unknown' for data that exists but is unclear\n3. Use 'not_applicable' for fields that don't apply\n4. Never use empty string '' — it's ambiguous" },
      { type: "text", content: "Advanced patterns:\n- Confidence scoring per field: {\"value\": \"...\", \"confidence\": 0.8}\n- Source attribution: {\"value\": \"...\", \"source\": \"paragraph 3\"}\n- Fallback chains: Try extraction → try inference → null" },
    ],
    examples: [
      { title: "Null Design", input: "For each field, use exactly one of:\n- The extracted value (if clearly present)\n- null (if not mentioned in the source)\n- \"ambiguous\" (if mentioned but unclear)\n\nDo NOT guess. Do NOT infer from context. Only extract what is explicitly stated.", output: "{\"name\":\"Acme Corp\",\"revenue\":null,\"industry\":\"ambiguous\"}", explanation: "Three distinct states instead of one. Each tells the consuming code something different." },
    ],
    drills: [
      { id: "w03-t04-d1", type: "design", prompt: "Design a null handling strategy for a contact information extractor. Fields: name, email, phone, company, title, location. Define what null, unknown, and not_applicable mean for each field.", requiredElements: ["null definition per field", "unknown definition", "not_applicable usage", "no empty strings"], evaluationCriteria: ["Each field has null semantics", "Unknown vs null distinction clear", "N/A used appropriately", "Empty string explicitly banned"] },
      { id: "w03-t04-d2", type: "build", prompt: "Design a confidence-scored extraction system. For each extracted field, output {value, confidence, source}. Define confidence thresholds: high (0.8+), medium (0.5-0.8), low (<0.5). Define behavior for each threshold.", requiredElements: ["confidence schema", "threshold definitions", "per-threshold behavior", "source attribution"], evaluationCriteria: ["Schema includes all three fields", "Thresholds defined", "Behavior per threshold specified", "Source tracking included"] },
    ],
    challenge: {
      id: "w03-t04-ch", type: "prompt_engineering",
      scenario: "Design a comprehensive null handling and confidence system for a medical records extraction prompt. Fields include: patient name, DOB, diagnoses, medications, allergies, procedures, vitals. Each field has different criticality — some must never be guessed (medications), some can be inferred (age from DOB).",
      constraints: ["Different null semantics per criticality level", "Confidence scoring per field", "Source attribution for every extracted value", "Explicit ban on inference for high-criticality fields", "Fallback chain for each field type"],
      requiredSections: ["Field criticality classification", "Null semantics per level", "Confidence scoring system", "Source attribution rules", "Inference permissions/bans"],
    },
    rubric: [
      { id: "w03-t04-r1", dimension: "Null design", description: "Distinct semantics for null/unknown/N/A", weight: 0.25 },
      { id: "w03-t04-r2", dimension: "Criticality awareness", description: "Different rules for different field importance", weight: 0.25 },
      { id: "w03-t04-r3", dimension: "Confidence system", description: "Meaningful confidence scores with thresholds", weight: 0.25 },
      { id: "w03-t04-r4", dimension: "Safety", description: "High-criticality fields never guessed", weight: 0.25 },
    ],
    reviewSummary: "Use null for absent, 'unknown' for unclear, 'not_applicable' for irrelevant. Never use empty strings. Add confidence scoring for critical systems. Ban inference on high-criticality fields.",
    artifactType: "prompt_template", passThreshold: 80, xpValue: 100,
  },
];
