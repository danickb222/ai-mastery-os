import type { Topic } from "../../types/topic";

export const week14: Topic[] = [
  {
    id: "w14-t01-rag-fundamentals",
    weekNumber: 14, phase: 3, domain: "AI System Design",
    title: "RAG Fundamentals",
    lesson: [
      { type: "text", content: "Retrieval-Augmented Generation (RAG) means: instead of relying on the model's training data, you retrieve relevant documents and include them in the prompt. The model generates answers grounded in your data.\n\nWhen to use RAG:\n- Your data changes frequently (news, inventory, policies)\n- You need verifiable answers with sources\n- The model's training data doesn't cover your domain\n- You need to reduce hallucination on factual questions" },
      { type: "text", content: "RAG pipeline:\n1. User asks a question\n2. System converts question to search query\n3. System retrieves relevant document chunks\n4. System includes chunks in the prompt as context\n5. Model generates answer using ONLY the provided context\n6. System returns answer with source citations" },
    ],
    examples: [
      { title: "RAG vs Direct Prompting", input: "Direct: 'What is our refund policy?' → Model guesses/hallucinates\nRAG: Retrieve refund policy doc → Include in prompt → 'Based on the provided policy document, refunds are available within 30 days of purchase for unused items...'", output: "RAG grounds the answer in actual company data.", explanation: "Direct prompting relies on training data (may be wrong or outdated). RAG uses your actual documents." },
    ],
    drills: [
      { id: "w14-t01-d1", type: "design", prompt: "Design a RAG system for a company's internal knowledge base (HR policies, IT procedures, benefits info). Define: how documents are chunked, how retrieval works, how context is injected into the prompt, and how the model is instructed to use only provided context.", requiredElements: ["chunking strategy", "retrieval mechanism", "context injection", "grounding instructions"], evaluationCriteria: ["Chunking preserves meaning", "Retrieval is relevant", "Context fits in prompt", "Model restricted to provided docs"] },
      { id: "w14-t01-d2", type: "analyze", prompt: "A RAG system retrieves the wrong documents 20% of the time, causing the model to give irrelevant answers. Diagnose likely causes (at least 4) and propose fixes for each.", requiredElements: ["4+ causes", "fix per cause", "retrieval quality metrics"], evaluationCriteria: ["Identifies query-doc mismatch", "Identifies chunking problems", "Identifies embedding issues", "Proposes practical fixes"] },
    ],
    challenge: {
      id: "w14-t01-ch", type: "system_design",
      scenario: "Design a complete RAG system for a legal firm's case research tool. Lawyers ask questions and the system searches through thousands of case documents, regulations, and internal memos to provide sourced answers.\n\nAccuracy is critical — wrong legal information could lead to malpractice.",
      constraints: ["Must define document preprocessing and chunking", "Must include relevance scoring for retrieved chunks", "Must include citation mechanism for every claim", "Must handle conflicting information from different sources", "Must include confidence scoring", "Must have human verification workflow for low-confidence answers"],
      requiredSections: ["Document preprocessing pipeline", "Chunking strategy with rationale", "Retrieval and ranking design", "Prompt design with grounding", "Citation mechanism", "Conflict resolution", "Confidence and verification"],
    },
    rubric: [
      { id: "w14-t01-r1", dimension: "Pipeline completeness", description: "End-to-end RAG pipeline fully designed", weight: 0.25 },
      { id: "w14-t01-r2", dimension: "Grounding strength", description: "Model restricted to provided context effectively", weight: 0.25 },
      { id: "w14-t01-r3", dimension: "Citation design", description: "Every claim traceable to source", weight: 0.25 },
      { id: "w14-t01-r4", dimension: "Safety", description: "Low confidence triggers human review", weight: 0.25 },
    ],
    reviewSummary: "RAG = retrieve relevant docs → include in prompt → generate grounded answer. Use when data changes, accuracy matters, or training data is insufficient. Always ground and cite.",
    artifactType: "system_design", passThreshold: 80, xpValue: 200,
  },
  {
    id: "w14-t02-chunking-logic",
    weekNumber: 14, phase: 3, domain: "AI System Design",
    title: "Chunking & Retrieval Design",
    lesson: [
      { type: "text", content: "Chunking is how you split documents into pieces for retrieval. Bad chunking = bad retrieval = bad answers. It's the most underestimated part of RAG.\n\nChunking strategies:\n1. Fixed size: Split every N tokens (simple but dumb — breaks mid-sentence)\n2. Semantic: Split at paragraph/section boundaries (preserves meaning)\n3. Sliding window: Overlapping chunks (catches cross-boundary info)\n4. Hierarchical: Section → subsection → paragraph (preserves structure)\n5. Contextual: Include section headers and metadata with each chunk" },
      { type: "text", content: "Chunk size tradeoffs:\n- Too small: Loses context, retrieves fragments\n- Too large: Includes irrelevant info, wastes context window\n- Sweet spot: 200-500 tokens for most use cases\n\nAlways include metadata: source document, section header, page number, date." },
    ],
    examples: [
      { title: "Contextual Chunking", input: "Document: Employee Handbook\nSection: 3.2 Remote Work Policy\n\nChunk: [Source: Employee Handbook | Section: 3.2 Remote Work Policy | Updated: 2024-01]\n'Employees may work remotely up to 3 days per week with manager approval. Remote work requests must be submitted via the HR portal at least 48 hours in advance...'", output: "Chunk includes metadata for context and citation.", explanation: "When this chunk is retrieved, the model knows exactly where it came from and can cite it properly." },
    ],
    drills: [
      { id: "w14-t02-d1", type: "design", prompt: "Design a chunking strategy for a product documentation site with: API reference (structured), tutorials (narrative), FAQs (Q&A pairs), and changelogs (chronological). Each content type needs a different chunking approach. Justify each choice.", requiredElements: ["per-type strategy", "justification", "metadata schema", "overlap handling"], evaluationCriteria: ["Different strategy per type", "Justifications are logical", "Metadata is useful", "Overlap prevents info loss"] },
      { id: "w14-t02-d2", type: "evaluate", prompt: "Evaluate this chunking approach: 'Split all documents at 500 characters regardless of content type.' Identify at least 5 problems and propose a better approach.", requiredElements: ["5+ problems", "specific examples", "improved approach"], evaluationCriteria: ["Identifies mid-sentence breaks", "Identifies context loss", "Identifies metadata absence", "Proposes content-aware alternative"] },
    ],
    challenge: {
      id: "w14-t02-ch", type: "system_design",
      scenario: "Design the chunking and retrieval system for a medical knowledge base containing: clinical guidelines (structured), research papers (long-form), drug interactions (tabular), and patient education materials (simple). The system serves doctors who need precise, sourced answers.",
      constraints: ["Different chunking strategy per content type", "Must preserve table structures", "Must handle cross-references between documents", "Must include relevance scoring with confidence", "Must handle queries that span multiple documents", "Must prioritize recent over outdated information"],
      requiredSections: ["Per-type chunking design", "Table handling strategy", "Cross-reference mechanism", "Relevance scoring", "Multi-document synthesis", "Recency weighting"],
    },
    rubric: [
      { id: "w14-t02-r1", dimension: "Strategy diversity", description: "Different approaches for different content types", weight: 0.25 },
      { id: "w14-t02-r2", dimension: "Structure preservation", description: "Tables, lists, and hierarchies maintained", weight: 0.25 },
      { id: "w14-t02-r3", dimension: "Retrieval quality", description: "Scoring and ranking are well-designed", weight: 0.25 },
      { id: "w14-t02-r4", dimension: "Recency handling", description: "Newer information prioritized appropriately", weight: 0.25 },
    ],
    reviewSummary: "Chunking determines RAG quality. Strategies: fixed, semantic, sliding window, hierarchical, contextual. Always include metadata. Size sweet spot: 200-500 tokens. Different content types need different strategies.",
    artifactType: "system_design", passThreshold: 80, xpValue: 200,
  },
  {
    id: "w14-t03-grounding-outputs",
    weekNumber: 14, phase: 3, domain: "AI System Design",
    title: "Grounding AI Outputs",
    lesson: [
      { type: "text", content: "Grounding means ensuring the model's output is based on provided evidence, not its training data or imagination. Ungrounded AI is just a confident guesser.\n\nGrounding techniques:\n1. Context-only instruction: 'Answer ONLY using the provided documents'\n2. Quote enforcement: 'Include direct quotes from sources for each claim'\n3. Citation tagging: 'Tag each fact with [Source: doc_name, page]'\n4. Confidence per claim: 'Rate confidence 0-1 for each statement'\n5. Negative grounding: 'If the answer is not in the provided context, say so'" },
    ],
    examples: [
      { title: "Grounded Prompt", input: "System: You are a research assistant. Answer questions using ONLY the provided context documents.\n\nRules:\n- Every factual claim must include a citation [Doc:X, Section:Y]\n- If the context doesn't contain the answer, respond: 'Not found in provided documents.'\n- Do not use your training knowledge\n- If the context is ambiguous, state both interpretations with citations\n- Rate overall confidence: high (>3 supporting passages), medium (1-2), low (0, inferred)", output: "Five grounding rules that prevent hallucination.", explanation: "The model can only state what's in the documents. Anything else triggers a 'not found' response." },
    ],
    drills: [
      { id: "w14-t03-d1", type: "build", prompt: "Design a grounding system for a financial research assistant that answers questions about company earnings reports. Must cite page numbers, handle conflicting data across quarters, and flag when historical data may be outdated.", requiredElements: ["citation format", "conflict handling", "staleness detection", "confidence scoring"], evaluationCriteria: ["Citations are precise", "Conflicts noted not hidden", "Staleness flagged", "Confidence is meaningful"] },
      { id: "w14-t03-d2", type: "harden", prompt: "This RAG prompt leaks training knowledge:\n'Based on the provided documents, tell me about the company's financials. Also share any relevant industry trends you know about.'\nFix it to be strictly grounded.", requiredElements: ["remove training knowledge leakage", "strict grounding clause", "not-found behavior", "citation requirement"], evaluationCriteria: ["Removes 'you know about'", "Adds strict grounding", "Defines not-found response", "Requires citations"] },
    ],
    challenge: {
      id: "w14-t03-ch", type: "system_design",
      scenario: "Design a complete grounding framework for an AI-powered compliance checking system. The system must answer compliance questions based EXCLUSIVELY on the company's policy documents, regulatory filings, and audit reports. A single ungrounded answer could trigger regulatory violations.",
      constraints: ["Zero tolerance for ungrounded claims", "Every statement must cite specific document, section, and paragraph", "Must handle questions where policies conflict with regulations", "Must handle questions where no relevant document exists", "Must include verification step that checks citations are real", "Must flag answers with confidence below threshold for human review"],
      requiredSections: ["Grounding instruction set", "Citation format and enforcement", "Conflict resolution between sources", "No-answer protocol", "Citation verification mechanism", "Human review triggers"],
    },
    rubric: [
      { id: "w14-t03-r1", dimension: "Grounding strictness", description: "Zero ungrounded claims possible", weight: 0.3 },
      { id: "w14-t03-r2", dimension: "Citation quality", description: "Precise, verifiable citations", weight: 0.25 },
      { id: "w14-t03-r3", dimension: "Conflict handling", description: "Contradictions surfaced not hidden", weight: 0.25 },
      { id: "w14-t03-r4", dimension: "Verification", description: "Citations checked for accuracy", weight: 0.2 },
    ],
    reviewSummary: "Grounding = model outputs based only on provided evidence. Techniques: context-only instruction, quote enforcement, citation tagging, confidence scoring, negative grounding (say 'not found').",
    artifactType: "system_design", passThreshold: 80, xpValue: 200,
  },
];
