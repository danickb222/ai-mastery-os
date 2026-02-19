import type { Topic } from "../../types/topic";

export const week21: Topic[] = [
  {
    id: "w21-t01-security-threat-modeling",
    weekNumber: 21, phase: 4, domain: "Operator Strategy",
    title: "Security Threat Modeling for AI",
    lesson: [
      { type: "text", content: "AI systems have unique attack surfaces that traditional security doesn't cover. Threat modeling for AI means: identifying what can go wrong, who might cause it, and how to prevent it.\n\nAI-specific threats:\n1. Prompt injection: User input overrides system instructions\n2. Data exfiltration: Model leaks training data or system prompts\n3. Model manipulation: Adversarial inputs cause wrong outputs\n4. Privacy violation: Model reveals PII from context\n5. Denial of service: Expensive inputs drain resources\n6. Supply chain: Compromised model weights or embeddings" },
      { type: "text", content: "Threat modeling framework (STRIDE adapted for AI):\n- Spoofing: Can someone impersonate a trusted input source?\n- Tampering: Can someone modify prompts, context, or outputs in transit?\n- Repudiation: Can actions be traced and audited?\n- Information disclosure: Can the model leak sensitive data?\n- Denial of service: Can someone exhaust model resources?\n- Elevation of privilege: Can user input gain system-level access?" },
    ],
    examples: [
      { title: "Threat Model", input: "System: AI customer service chatbot\n\nThreat 1: Prompt injection via customer message\nLikelihood: High | Impact: Medium | Mitigation: Input sanitization + output validation\n\nThreat 2: PII leakage from conversation history\nLikelihood: Medium | Impact: High | Mitigation: PII scrubbing before model call\n\nThreat 3: Cost attack via extremely long messages\nLikelihood: Low | Impact: Medium | Mitigation: Input length limits + rate limiting", output: "Three threats with likelihood, impact, and specific mitigations.", explanation: "Each threat is assessed and mitigated independently. No single defense covers everything." },
    ],
    drills: [
      { id: "w21-t01-d1", type: "analyze", prompt: "Perform a threat analysis for an AI-powered document search system used by a law firm. Identify at least 6 threats across the STRIDE categories. Rate each by likelihood and impact. Propose mitigations.", requiredElements: ["6+ threats", "STRIDE mapping", "likelihood/impact ratings", "mitigations"], evaluationCriteria: ["Threats are AI-specific", "STRIDE coverage", "Ratings are realistic", "Mitigations are practical"] },
      { id: "w21-t01-d2", type: "design", prompt: "Design an attack tree for a RAG system. Starting from the root goal 'extract confidential data from the knowledge base,' identify at least 4 attack paths with specific techniques at each step.", requiredElements: ["attack tree structure", "4+ paths", "specific techniques", "defense per path"], evaluationCriteria: ["Tree is well-structured", "Paths are realistic", "Techniques are specific", "Defenses address each path"] },
    ],
    challenge: {
      id: "w21-t01-ch", type: "strategy_design",
      scenario: "Perform a complete security threat model for an AI-powered healthcare patient portal. The system: answers patient questions using their medical records, schedules appointments, processes prescription refills, and provides general health education.\n\nThis system handles the most sensitive data possible (medical records + PII).",
      constraints: ["Must cover all 6 STRIDE categories", "Must identify at least 10 unique threats", "Must rate each threat by likelihood, impact, and detectability", "Must propose mitigations for each threat", "Must prioritize by risk score (likelihood × impact)", "Must include a residual risk assessment (what remains after mitigations)"],
      requiredSections: ["System description and trust boundaries", "Threat catalog (10+)", "STRIDE mapping", "Risk scoring matrix", "Mitigation plan per threat", "Residual risk assessment"],
    },
    rubric: [
      { id: "w21-t01-r1", dimension: "Threat breadth", description: "10+ threats across all STRIDE categories", weight: 0.25 },
      { id: "w21-t01-r2", dimension: "AI-specific awareness", description: "Threats are unique to AI systems", weight: 0.25 },
      { id: "w21-t01-r3", dimension: "Mitigation quality", description: "Practical, implementable defenses", weight: 0.25 },
      { id: "w21-t01-r4", dimension: "Risk prioritization", description: "Clear priority based on risk scoring", weight: 0.25 },
    ],
    reviewSummary: "AI has unique attack surfaces: injection, exfiltration, manipulation, privacy violation, DoS, supply chain. Use STRIDE adapted for AI. Rate threats by likelihood × impact. Mitigate independently.",
    artifactType: "security_framework", passThreshold: 80, xpValue: 250,
  },
  {
    id: "w21-t02-data-privacy",
    weekNumber: 21, phase: 4, domain: "Operator Strategy",
    title: "Data Privacy in AI Systems",
    lesson: [
      { type: "text", content: "AI systems process, store, and sometimes memorize data. Privacy risks are everywhere:\n\n1. Input privacy: User data sent to model providers\n2. Context privacy: Sensitive data included in prompts\n3. Output privacy: Model generates content containing PII\n4. Training privacy: Model memorizes training data\n5. Log privacy: Conversation logs stored insecurely\n6. Embedding privacy: Vector embeddings can be reverse-engineered" },
      { type: "text", content: "Privacy protection layers:\n1. Minimize: Don't send data you don't need to the model\n2. Anonymize: Replace PII with placeholders before model call\n3. Encrypt: Encrypt data at rest and in transit\n4. Audit: Log what data was sent where and when\n5. Retain: Define how long data is kept and deletion policy\n6. Consent: Ensure users know their data is processed by AI" },
    ],
    examples: [
      { title: "PII Scrubbing Pipeline", input: "Before model call:\n1. Detect PII with regex + NER model\n2. Replace: 'John Smith' → '[PERSON_1]', 'john@acme.com' → '[EMAIL_1]'\n3. Store mapping: {PERSON_1: 'John Smith', EMAIL_1: 'john@acme.com'}\n4. Send scrubbed text to model\n5. Re-insert PII into response using stored mapping\n6. Delete mapping after request completes", output: "Model never sees real PII. Response has correct names.", explanation: "The model processes '[PERSON_1] requested a refund' and responds about [PERSON_1]. The system re-inserts the real name." },
    ],
    drills: [
      { id: "w21-t02-d1", type: "design", prompt: "Design a PII protection system for an AI email assistant. The system reads emails and drafts responses. Define: what PII to detect, how to scrub, how to restore, and what to do if PII leaks into model output unexpectedly.", requiredElements: ["PII categories", "scrubbing mechanism", "restoration process", "leak detection"], evaluationCriteria: ["Comprehensive PII categories", "Scrubbing preserves meaning", "Restoration is accurate", "Leaks are caught"] },
      { id: "w21-t02-d2", type: "evaluate", prompt: "Evaluate this privacy approach: 'We use OpenAI's API and trust their privacy policy. We don't do anything special with user data.' Identify all risks and propose improvements.", requiredElements: ["risk identification", "third-party dependency risks", "proposed improvements", "compliance concerns"], evaluationCriteria: ["Identifies vendor trust risk", "Identifies data residency issues", "Proposes defense-in-depth", "Addresses compliance"] },
    ],
    challenge: {
      id: "w21-t02-ch", type: "strategy_design",
      scenario: "Design the complete data privacy architecture for an AI-powered HR system that handles: employee performance reviews, compensation data, personal health information, and disciplinary records. The system uses an external LLM provider.",
      constraints: ["Must handle 4 data sensitivity levels", "Must include PII scrubbing for external model calls", "Must define data retention and deletion policies", "Must address cross-border data transfer concerns", "Must include audit trail for all data access", "Must define breach response protocol"],
      requiredSections: ["Data classification scheme", "PII handling pipeline", "Retention and deletion policies", "Cross-border considerations", "Audit trail design", "Breach response protocol"],
    },
    rubric: [
      { id: "w21-t02-r1", dimension: "Classification", description: "Data sensitivity levels well-defined", weight: 0.25 },
      { id: "w21-t02-r2", dimension: "Protection depth", description: "Multi-layer PII protection", weight: 0.25 },
      { id: "w21-t02-r3", dimension: "Compliance", description: "Retention, deletion, cross-border addressed", weight: 0.25 },
      { id: "w21-t02-r4", dimension: "Incident readiness", description: "Breach response is actionable", weight: 0.25 },
    ],
    reviewSummary: "Privacy risks: input, context, output, training, log, embedding. Protect with: minimize, anonymize, encrypt, audit, retain policies, consent. PII scrubbing before model calls is essential.",
    artifactType: "security_framework", passThreshold: 80, xpValue: 250,
  },
  {
    id: "w21-t03-attack-surface",
    weekNumber: 21, phase: 4, domain: "Operator Strategy",
    title: "Mapping AI Attack Surfaces",
    lesson: [
      { type: "text", content: "An attack surface is every point where an adversary can interact with your system. AI systems have larger attack surfaces than traditional software because every input to the model is a potential attack vector.\n\nAI attack surface map:\n1. User input → prompt injection, data poisoning\n2. Context/RAG documents → indirect injection, poisoned documents\n3. Model API → API key theft, rate limit abuse\n4. Output → manipulated responses, data leakage\n5. Embeddings → adversarial embeddings, similarity manipulation\n6. Fine-tuning data → backdoor attacks, bias injection\n7. Monitoring/logs → sensitive data in logs, log tampering" },
    ],
    examples: [
      { title: "Attack Surface Diagram", input: "User → [Input validation] → [PII scrubbing] → [Prompt construction] → [Model API] → [Output validation] → [PII restoration] → User\n\nAttack points:\n① User input: injection\n② PII scrubbing: bypass if incomplete\n③ Prompt: context manipulation\n④ Model API: key exposure\n⑤ Output: hallucination, data leak\n⑥ PII restoration: mapping theft\n⑦ Logs: sensitive data exposure", output: "7 attack points identified in a simple pipeline.", explanation: "Even a straightforward AI pipeline has 7+ points where security can fail. Each needs specific defense." },
    ],
    drills: [
      { id: "w21-t03-d1", type: "build", prompt: "Map the complete attack surface of a RAG-based Q&A system. The system: accepts user questions, retrieves from a document store, generates answers, and cites sources. Identify every attack point and the specific attack type for each.", requiredElements: ["complete surface map", "attack type per point", "severity per point", "defense per point"], evaluationCriteria: ["All pipeline stages covered", "Attack types are specific", "Severities are realistic", "Defenses are practical"] },
      { id: "w21-t03-d2", type: "analyze", prompt: "A company's AI chatbot was compromised: the attacker uploaded a PDF to the knowledge base containing hidden injection instructions. When the RAG system retrieved this document, the chatbot started leaking customer data. Analyze the attack chain, identify where each defense failed, and propose fixes.", requiredElements: ["attack chain analysis", "defense failure points", "proposed fixes", "prevention design"], evaluationCriteria: ["Attack chain accurately described", "Defense failures identified", "Fixes address root causes", "Prevention is systematic"] },
    ],
    challenge: {
      id: "w21-t03-ch", type: "strategy_design",
      scenario: "Map the complete attack surface of an AI-powered financial trading assistant. The system: receives market queries, accesses real-time market data, retrieves from research documents, generates analysis, and can execute trades (with human approval). A successful attack could cause significant financial loss.",
      constraints: ["Must identify every component in the pipeline", "Must map at least 12 attack points", "Must classify attacks by: likelihood, impact, and detectability", "Must propose defense-in-depth for top 5 threats", "Must include insider threat considerations", "Must include monitoring for attack detection"],
      requiredSections: ["System component diagram", "Attack surface catalog (12+)", "Risk classification matrix", "Top 5 defense-in-depth designs", "Insider threat analysis", "Attack detection monitoring"],
    },
    rubric: [
      { id: "w21-t03-r1", dimension: "Surface completeness", description: "All components and attack points identified", weight: 0.25 },
      { id: "w21-t03-r2", dimension: "Attack specificity", description: "Attacks are specific to AI, not generic", weight: 0.25 },
      { id: "w21-t03-r3", dimension: "Defense depth", description: "Multiple independent defense layers", weight: 0.25 },
      { id: "w21-t03-r4", dimension: "Detection capability", description: "Monitoring can detect attacks in progress", weight: 0.25 },
    ],
    reviewSummary: "AI attack surfaces include: user input, context docs, model API, output, embeddings, fine-tuning data, and logs. Each needs specific defenses. Indirect injection through documents is the most underestimated threat.",
    artifactType: "security_framework", passThreshold: 80, xpValue: 250,
  },
];
