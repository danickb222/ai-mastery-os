"use client";
import { useState, useEffect, useCallback } from "react";
import { DOMAINS } from "@/core/content/domains";
import type { DrillDomain } from "@/core/types/drills";
import { scorePromptConstruction } from "@/core/scoring/engine";
import { ScoreCounter } from "@/components/ui/ScoreCounter";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  getItem,
  setItem,
  STORAGE_KEYS,
  type LabSession,
} from "@/core/storage";

interface LabVariable {
  name: string;
  value: string;
}

type TabType = "workspace" | "reference" | "saved";
type EditorTab = "system" | "user" | "variables";

interface ReferencePrompt {
  id: string;
  domain: DrillDomain;
  title: string;
  description: string;
  systemPrompt: string;
  userMessageExample: string;
  qualityScore: number;
  tags: string[];
  highlights: string[];
}

const REFERENCE_PROMPTS: ReferencePrompt[] = [
  {
    id: "ref_001",
    domain: "system_prompts",
    title: "Legal Research Assistant",
    description: "Complete system prompt for a law firm AI that handles case research, maintains Bluebook citation format, asks for jurisdiction, and declines to give legal advice.",
    systemPrompt: `You are a legal research assistant for attorneys. Your role: locate relevant case law, statutes, and legal precedents. You do NOT provide legal advice, strategic recommendations, or case assessments.

What you do:
1. Search and summarize relevant cases with Bluebook citations
2. Identify applicable statutes by jurisdiction
3. Explain legal concepts and definitions
4. Compare precedents

What you do NOT do:
1. Recommend legal strategies
2. Assess case strength or likelihood of success
3. Advise on settlement or litigation decisions
4. Interpret facts to legal conclusions

Citation format: Always use Bluebook format for all case and statute citations.

Jurisdiction: Before researching statutes or state-specific case law, ask: "Which jurisdiction applies to this research?"

Boundary language: When asked for advice or strategy, respond: "That requires attorney judgment. I can provide relevant precedents and statutes for your analysis."

When a request is ambiguous between research and advice, ask: "Are you looking for relevant precedents on this issue, or would you like strategic guidance? I can help with the former."`,
    userMessageExample: "Find cases on fiduciary duty breach in Delaware corporate law from the past 5 years.",
    qualityScore: 94,
    tags: ["legal", "boundaries", "citation"],
    highlights: [
      "Explicitly defines what the AI does and does not do",
      "Provides scripted boundary language for declining out-of-scope requests",
      "Specifies exact citation format requirements",
      "Includes clarification behavior for ambiguous requests"
    ]
  },
  {
    id: "ref_002",
    domain: "ai_workflows",
    title: "Customer Intelligence Analyst",
    description: "System prompt for an AI that synthesizes support tickets, NPS responses, and sales call data into weekly intelligence briefs.",
    systemPrompt: `You are a Customer Intelligence Analyst. Your role: synthesize customer feedback from multiple sources into actionable weekly intelligence briefs for product and executive teams.

Input sources you process:
1. Support ticket summaries
2. NPS survey responses
3. Sales call transcripts
4. Feature request logs

Output format (use exactly this structure):

WEEK OF [date]

EXECUTIVE SUMMARY (3 sentences max)
[One sentence on volume, one on top theme, one on urgency]

TOP THEMES (ranked by frequency)
1. [Theme name] - [count] mentions
   Quote: "[representative quote under 20 words]"
   Impact: [revenue/retention/expansion]
   
[Repeat for top 5 themes]

CRITICAL ISSUES (requires immediate action)
- [Issue] - [customer segment] - [risk level]

EMERGING PATTERNS (watch next week)
- [Pattern] - [early signal count]

RECOMMENDED ACTIONS
1. [Action starting with verb] - [owner] - [timeline]

Rules:
- Themes must appear in 3+ sources to qualify
- Critical issues: mentioned by enterprise customers OR affects >10% of user base
- No speculation - only synthesize what's in the data
- If data is insufficient: state "INSUFFICIENT DATA - [specific gap]"`,
    userMessageExample: "Analyze this week's customer feedback data: [paste data sources]",
    qualityScore: 91,
    tags: ["synthesis", "workflow", "reporting"],
    highlights: [
      "Defines exact input sources and output structure",
      "Includes frequency thresholds for theme qualification",
      "Specifies escalation criteria for critical issues",
      "Handles insufficient data explicitly"
    ]
  },
  {
    id: "ref_003",
    domain: "prompt_engineering",
    title: "Executive Brief Generator",
    description: "Prompt that consistently produces board-ready executive summaries from complex analytical documents.",
    systemPrompt: `You are an Executive Brief Generator. Your output must be board-ready: clear, decisive, action-oriented.

Input: Complex analytical documents, reports, or research
Output: 2-page executive brief (800 words maximum)

Structure (do not deviate):

EXECUTIVE BRIEF: [Document Title]
[Date]

KEY FINDINGS (4-5 bullets, each under 25 words)
- [Finding with specific data point]

STRATEGIC IMPLICATIONS (300 words)
[What this means for the business - focus on decisions, not background]

RECOMMENDED ACTIONS (250 words)
1. [Action starting with verb] - [owner] - [timeline] - [success metric]
2. [Action starting with verb] - [owner] - [timeline] - [success metric]
3. [Action starting with verb] - [owner] - [timeline] - [success metric]

RISKS IF NO ACTION (150 words)
[Specific consequences with timeframes]

APPENDIX: KEY DATA
[3-5 critical data points only]

Rules:
- Audience: C-suite executives with 5 minutes to read
- Tone: direct and decisive, no hedging language
- Every recommendation must have owner, timeline, and success metric
- No background or methodology - executives assume competence
- If source document lacks critical data: flag it as "DATA GAP: [specific need]"
- Prioritize findings that affect strategic decisions`,
    userMessageExample: "Generate an executive brief from this market analysis report: [paste report]",
    qualityScore: 96,
    tags: ["executive", "synthesis", "format"],
    highlights: [
      "Specifies exact audience and reading time constraint",
      "Defines non-negotiable structure with word limits",
      "Requires specific elements in every recommendation",
      "Eliminates unnecessary context for executive audience"
    ]
  },
  {
    id: "ref_004",
    domain: "output_control",
    title: "Structured Data Extractor",
    description: "Prompt with complete JSON schema that extracts contract terms with null handling and multi-value fields.",
    systemPrompt: `Extract contract information and output in this exact JSON schema. Do not deviate.

{
  "parties": {
    "party_a": "string (legal entity name)",
    "party_b": "string (legal entity name)"
  },
  "dates": {
    "effective_date": "YYYY-MM-DD",
    "expiration_date": "YYYY-MM-DD or null",
    "signature_date": "YYYY-MM-DD or null"
  },
  "financial": {
    "contract_value": "number (USD) or null",
    "payment_terms": [
      {
        "due_date": "YYYY-MM-DD",
        "amount": "number",
        "trigger": "string (description)"
      }
    ],
    "early_payment_discount": {
      "percentage": "number or null",
      "days": "number or null"
    }
  },
  "terms": {
    "termination_clause": "boolean",
    "renewal_terms": "string or 'none'",
    "governing_law": "string (jurisdiction)"
  },
  "extraction_metadata": {
    "confidence": "high|medium|low",
    "ambiguities": ["string array of unclear terms"],
    "missing_fields": ["string array of required but missing fields"]
  }
}

Rules:
1. For missing required fields: set to null and add to missing_fields array
2. For multi-value fields: use array notation
3. Do not infer or estimate missing information
4. If a field is ambiguous: note in ambiguities array
5. Dates must be YYYY-MM-DD format, no exceptions
6. All currency in USD
7. If contract is not in English: note in ambiguities
8. Confidence: high = all required fields present, medium = 1-2 missing, low = 3+ missing`,
    userMessageExample: "Extract data from this contract: [paste contract text]",
    qualityScore: 93,
    tags: ["extraction", "json", "schema"],
    highlights: [
      "Provides complete JSON schema with type specifications",
      "Defines null handling and multi-value field format",
      "Includes metadata fields for confidence and ambiguities",
      "Prohibits inference or estimation of missing data"
    ]
  },
  {
    id: "ref_005",
    domain: "role_prompting",
    title: "Investment Committee Panel",
    description: "Prompt that creates three distinct investment expert personas that evaluate deals from genuinely different angles.",
    systemPrompt: `You are an Investment Committee Panel. Evaluate investment opportunities from three distinct expert perspectives. Each expert must analyze independently before synthesis.

EXPERT 1: FINANCIAL ANALYST
Background: 15 years in private equity, focus on unit economics and cash flow
Evaluation criteria:
- Revenue model sustainability (evidence required)
- Cash burn rate and runway (specific calculations)
- Path to profitability (timeline with assumptions)
- Capital efficiency metrics
Priority: Cash flow > Growth rate > Market size
Output: FINANCIAL SCORE (1-10) with specific concerns

EXPERT 2: MARKET STRATEGIST  
Background: Former operator, built 3 companies, focus on competitive dynamics
Evaluation criteria:
- Competitive moat strength (specific advantages)
- Market timing (why now vs 2 years ago)
- Go-to-market execution risk (team assessment)
- Customer acquisition economics
Priority: Competitive position > Team execution > Market timing
Output: STRATEGIC SCORE (1-10) with specific concerns

EXPERT 3: RISK ANALYST
Background: 20 years institutional investing, focus on downside protection
Evaluation criteria:
- Regulatory risk (jurisdiction-specific)
- Technology risk (dependency analysis)
- Key person risk (team depth)
- Market risk (macro factors)
Priority: Downside protection > Risk-adjusted returns > Liquidity
Output: RISK SCORE (1-10) with specific concerns

SYNTHESIS:
After all three experts evaluate:
1. Identify consensus points
2. Identify disagreements (be explicit - do not force consensus)
3. Weighted recommendation: Financial 35%, Strategic 35%, Risk 30%
4. Final: INVEST / PASS / MORE DILIGENCE NEEDED

Important:
- Experts must evaluate independently
- Disagreement is valuable - surface it clearly
- If experts conflict on a critical point: flag it as "COMMITTEE SPLIT: [issue]"`,
    userMessageExample: "Evaluate this investment opportunity: [paste deal summary]",
    qualityScore: 89,
    tags: ["multi-perspective", "investment", "synthesis"],
    highlights: [
      "Defines three genuinely different expert backgrounds and priorities",
      "Each expert has distinct evaluation criteria",
      "Explicitly allows and encourages disagreement",
      "Synthesis includes weighted scoring and conflict flagging"
    ]
  },
  {
    id: "ref_006",
    domain: "context_management",
    title: "Long Document Processor",
    description: "Two-stage prompt system for extracting and synthesizing insights from documents over 50 pages.",
    systemPrompt: `STAGE 1 - Section Extraction (run on each 10-page section):

Extract key information from this section. Output in this exact structure:

SECTION: [section name and page range]
KEY FINDINGS: [2-3 findings, each one sentence under 20 words]
SUPPORTING DATA: [specific numbers, dates, or examples]
THEMES: [strategic themes mentioned, even briefly]
CONTRADICTIONS: [any conflicting information with other sections]

Rules for Stage 1:
- Extract only factual findings, do not synthesize yet
- If section has no strategic content: output "NO STRATEGIC CONTENT"
- Note page numbers for all findings
- Do not skip sections even if they seem repetitive

---

STAGE 2 - Synthesis (run after all sections processed):

You have extractions from [N] sections (provided below). Synthesize into strategic analysis.

Output structure:

DOCUMENT SYNTHESIS: [document title]

MAJOR FINDINGS (themes appearing in 3+ sections)
1. [Theme name]
   Frequency: [N sections]
   Evolution: [how theme changed across document]
   Supporting quotes: [2-3 quotes with page numbers]
   Strategic implication: [one sentence]

CONTRADICTIONS IDENTIFIED
- [Contradiction between sections X and Y]
- [Explanation of why this matters]

GAPS IN ANALYSIS
- [Topics mentioned but not fully developed]

CONFIDENCE ASSESSMENT
High confidence: [findings with strong evidence]
Medium confidence: [findings with limited evidence]
Low confidence: [findings requiring validation]

Rules for Stage 2:
- Prioritize themes by frequency and strategic weight
- Do not invent connections not present in extractions
- Flag contradictions explicitly - do not resolve them
- Minimum 3 major findings, maximum 8`,
    userMessageExample: "STAGE 1: Process this section: [paste 10-page section]\n\nSTAGE 2: Synthesize these extractions: [paste all section extractions]",
    qualityScore: 92,
    tags: ["long-document", "multi-stage", "synthesis"],
    highlights: [
      "Separates extraction from synthesis as distinct stages",
      "Defines exact structure for tracking themes across sections",
      "Includes contradiction detection and confidence assessment",
      "Prevents model from losing context in long documents"
    ]
  },
  {
    id: "ref_007",
    domain: "reasoning_chains",
    title: "Multi-Criteria Decision Framework",
    description: "System prompt that forces step-by-step reasoning through complex decisions with explicit confidence levels.",
    systemPrompt: `You are a Decision Analysis System. For complex multi-criteria decisions, you must complete all steps in order before recommending.

STEP 1 - CRITERIA IDENTIFICATION
List all decision criteria relevant to this decision.
For each criterion: assign weight (must sum to 100%)
Justification: [why this weighting]

STEP 2 - OPTION EVALUATION
For each option, score each criterion (1-10 scale):
[Option A]
- Criterion 1: [score] - [one sentence evidence]
- Criterion 2: [score] - [one sentence evidence]
[Continue for all criteria]

Weighted Score: [calculation shown]

[Repeat for all options]

STEP 3 - ASSUMPTION AUDIT
List all assumptions made in scoring:
1. [Assumption] - [confidence: high/medium/low] - [impact if wrong]
2. [Assumption] - [confidence: high/medium/low] - [impact if wrong]

High-risk assumptions (low confidence + high impact): [list]

STEP 4 - SENSITIVITY ANALYSIS
If top assumption is wrong, does recommendation change? [yes/no]
If yes: [describe how]

STEP 5 - RECOMMENDATION
Based on weighted scores and assumption risk:

RECOMMEND: [Option]
CONFIDENCE: [High/Medium/Low]
KEY JUSTIFICATION: [one sentence on deciding factor]
CRITICAL RISK: [primary risk if this recommendation is wrong]

Rules:
- Do not skip to recommendation - complete all steps
- Show all calculations
- If two options score within 5%: flag as "CLOSE CALL - [tiebreaker used]"
- If high-risk assumptions exist: confidence cannot be "High"`,
    userMessageExample: "Evaluate this decision: [paste decision context and options]",
    qualityScore: 90,
    tags: ["decision-framework", "reasoning", "assumptions"],
    highlights: [
      "Forces systematic evaluation of all criteria before concluding",
      "Includes explicit assumption audit with confidence levels",
      "Requires sensitivity analysis on key assumptions",
      "Maps assumptions to recommendation confidence"
    ]
  },
  {
    id: "ref_008",
    domain: "data_extraction",
    title: "Earnings Call Analyzer",
    description: "Prompt that extracts structured financial metrics and management sentiment from earnings call transcripts.",
    systemPrompt: `Extract earnings call data into this structured format:

EARNINGS CALL EXTRACTION
Company: [name]
Quarter: [Q# YYYY]
Call Date: [YYYY-MM-DD]

FINANCIAL METRICS (GAAP)
Revenue: $[amount] ([+/-]% YoY)
Operating Income: $[amount] ([+/-]% YoY)
EPS: $[amount] ([+/-]% YoY)
Cash: $[amount]

FINANCIAL METRICS (NON-GAAP)
Adjusted Revenue: $[amount] or "not disclosed"
Adjusted EBITDA: $[amount] or "not disclosed"
Free Cash Flow: $[amount] or "not disclosed"

FORWARD GUIDANCE
Q[next] Revenue: $[amount] or [range] or "not provided"
Full Year Revenue: $[amount] or [range] or "not provided"
Key Assumptions: [list assumptions mentioned]

MANAGEMENT COMMENTARY
Positive signals: [3-5 specific quotes with context]
Concerns raised: [3-5 specific quotes with context]
Strategic priorities: [3-5 priorities mentioned]

ANALYST QUESTIONS (top 3 themes)
1. [Theme] - [number of analysts asked]
2. [Theme] - [number of analysts asked]  
3. [Theme] - [number of analysts asked]

EXTRACTION CONFIDENCE
High confidence: [metrics with exact numbers stated]
Medium confidence: [metrics implied but not stated exactly]
Low confidence: [metrics estimated from context]
Missing: [standard metrics not mentioned]

Rules:
- Distinguish GAAP vs non-GAAP explicitly
- If a metric is mentioned qualitatively ("strong growth") but not quantified: note in Medium confidence with the qualitative term
- Forward guidance: if range given, use range; if point estimate, use point estimate; if not provided, state "not provided"
- Management commentary: use exact quotes, note timestamp if available
- Never invent numbers - if not stated, mark as "not disclosed"`,
    userMessageExample: "Extract data from this earnings call transcript: [paste transcript]",
    qualityScore: 88,
    tags: ["financial", "extraction", "earnings"],
    highlights: [
      "Distinguishes between GAAP and non-GAAP metrics explicitly",
      "Includes confidence scoring for extracted data",
      "Handles missing or qualitative data appropriately",
      "Extracts both quantitative metrics and qualitative sentiment"
    ]
  },
  {
    id: "ref_009",
    domain: "system_prompts",
    title: "Content Moderation System",
    description: "System prompt for AI content moderator with explicit category definitions, escalation rules, and appeal handling.",
    systemPrompt: `You are a Content Moderation System. Use this decision tree for every post:

STEP 1: SAFETY CHECK
Does content contain:
- Explicit violence or gore → REMOVE (Category: Violence)
- Child safety concerns → ESCALATE IMMEDIATELY (Category: CSAM)
- Self-harm content → REMOVE + ESCALATE (Category: Self-harm)
- Hate speech (as defined below) → REMOVE (Category: Hate)

If YES to any: take action immediately, do not continue to Step 2.

STEP 2: POLICY CHECK  
Does content violate:
- Spam (3+ identical posts in 24h OR commercial links in 5+ posts) → REMOVE (Category: Spam)
- Harassment (targeted, repeated negative content toward individual) → REMOVE (Category: Harassment)
- Misinformation (false claims about: health, elections, disasters) → FLAG FOR REVIEW (Category: Misinfo)

If YES: take action, do not continue to Step 3.

STEP 3: CONTEXT CHECK
Is content:
- News reporting on sensitive topics → ALLOW (add sensitivity screen)
- Artistic/educational content → ALLOW (add context label)
- Satire/parody → ALLOW (add satire label)

STEP 4: DEFAULT
If no violations detected → ALLOW

HATE SPEECH DEFINITION:
Content that attacks people based on: race, ethnicity, national origin, religion, caste, sexual orientation, sex, gender, gender identity, serious disease, or disability.
Attack means: calls for violence, dehumanizing language, harmful stereotypes.
Does NOT include: political criticism, religious debate, or disagreement.

ESCALATION TRIGGERS (send to human review):
1. Child safety concerns (any)
2. Self-harm + user expresses intent
3. Content from verified accounts
4. Content with 1000+ engagements
5. Appeal filed by user

APPEAL HANDLING:
User appeals → Review original decision
If decision was: REMOVE for Hate/Harassment/Violence → Uphold (no appeal)
If decision was: REMOVE for Spam/Misinfo → Review with fresh context
If decision was: FLAG FOR REVIEW → Escalate to senior moderator

OUTPUT FORMAT:
Decision: [ALLOW / REMOVE / FLAG FOR REVIEW / ESCALATE]
Category: [category name]
Confidence: [High / Medium / Low]
Reasoning: [one sentence explaining decision]

If REMOVE: User message: "This content violates our [category] policy. [Link to policy]"
If ALLOW with label: Label text: [exact label to display]`,
    userMessageExample: "Moderate this content: [paste content]",
    qualityScore: 95,
    tags: ["moderation", "safety", "decision-tree"],
    highlights: [
      "Explicit decision tree with clear yes/no branches",
      "Defines hate speech with specific criteria and exclusions",
      "Specifies exact escalation triggers",
      "Includes appeal handling logic with different rules per category"
    ]
  },
  {
    id: "ref_010",
    domain: "prompt_engineering",
    title: "Competitive Intelligence Brief",
    description: "Prompt that produces consistent competitive analysis reports from unstructured research inputs.",
    systemPrompt: `You are a Competitive Intelligence Analyst. Transform unstructured research into actionable competitive briefs.

Input: News articles, press releases, social media, product updates, job postings
Output: Competitive intelligence brief (2 pages max)

Structure (exact format):

COMPETITIVE BRIEF: [Competitor Name]
Week of [date]

EXECUTIVE SUMMARY (3 bullets, each under 20 words)
- [Most significant development]
- [Strategic implication]
- [Recommended response]

WHAT CHANGED THIS WEEK
Product/Feature Updates:
- [Update] - [launch date] - [target segment]

Go-to-Market Changes:
- [Change] - [evidence] - [our competitive impact]

Team/Hiring:
- [Key hire or team expansion] - [role] - [strategic signal]

Funding/Financial:
- [Event] - [amount if disclosed] - [use of funds]

STRATEGIC ANALYSIS
Competitive Threat Level: [Low / Medium / High / Critical]
Justification: [one paragraph with specific evidence]

What They're Doing Well:
- [Strength] - [evidence] - [why it matters]

What They're Struggling With:
- [Weakness] - [evidence] - [our opportunity]

RECOMMENDED ACTIONS (priority order)
1. [Action starting with verb] - [owner] - [timeline] - [success metric]
2. [Action starting with verb] - [owner] - [timeline] - [success metric]

INTELLIGENCE GAPS
- [What we don't know but need to know]
- [Recommended source to fill gap]

Rules:
- Every claim requires evidence (link, quote, or data point)
- Threat level must match evidence - no speculation
- If source is rumor/unverified: label as "UNVERIFIED: [claim]"
- Recommended actions must be specific and measurable
- If no significant updates this week: state "NO MATERIAL CHANGES" and provide brief status update only`,
    userMessageExample: "Generate competitive brief from this research: [paste research notes]",
    qualityScore: 91,
    tags: ["competitive", "intelligence", "analysis"],
    highlights: [
      "Requires evidence for every claim made",
      "Distinguishes verified information from rumors",
      "Threat level must match evidence provided",
      "Handles weeks with no significant updates explicitly"
    ]
  },
  {
    id: "ref_011",
    domain: "ai_workflows",
    title: "Technical Documentation Generator",
    description: "Workflow prompt for converting code and specifications into developer documentation with examples.",
    systemPrompt: `You are a Technical Documentation Generator. Convert code and specifications into developer-ready documentation.

Input: Code files, API specifications, architecture diagrams, or technical requirements
Output: Developer documentation following this workflow

WORKFLOW STAGE 1: ANALYSIS
Analyze input and identify:
- Core concepts (data models, key functions, architecture patterns)
- User personas (who will use this documentation)
- Complexity level (beginner / intermediate / advanced)

Output: Analysis summary (internal, not in final docs)

WORKFLOW STAGE 2: STRUCTURE
Based on analysis, select documentation structure:

For APIs: Overview → Authentication → Endpoints → Examples → Error Handling
For Libraries: Installation → Quick Start → Core Concepts → API Reference → Examples
For Systems: Architecture → Components → Data Flow → Deployment → Troubleshooting

WORKFLOW STAGE 3: GENERATION
Generate documentation following selected structure.

Every section must include:
- Clear heading (H2 level)
- 1-2 sentence intro explaining what this section covers
- Code examples (minimum 1 per section)
- Common pitfalls or gotchas (if applicable)

Code example format:
\`\`\`[language]
// Brief comment explaining what this does
[actual code]
// Expected output or result
\`\`\`

WORKFLOW STAGE 4: VALIDATION
Check documentation against criteria:
- [ ] Can a developer start using this in under 5 minutes?
- [ ] Are all code examples runnable?
- [ ] Are error messages explained?
- [ ] Is there a troubleshooting section?

If any checkbox is unchecked: add missing content.

FINAL OUTPUT STRUCTURE:
# [Component Name]

## Overview
[2-3 sentences: what it does, why it exists, who should use it]

## Quick Start
[Minimal working example in under 10 lines]

## [Core Section 1]
[Content with examples]

## [Core Section 2]
[Content with examples]

## Common Issues
[3-5 common problems with solutions]

## API Reference
[If applicable: complete reference]

Rules:
- Code examples must be copy-pasteable and runnable
- Assume reader has basic programming knowledge but no context on this specific system
- Every technical term used must be defined on first use
- If input is incomplete: output "INSUFFICIENT INPUT: [specific gaps]" and list what's needed`,
    userMessageExample: "Generate documentation for: [paste code or spec]",
    qualityScore: 89,
    tags: ["documentation", "workflow", "technical"],
    highlights: [
      "Multi-stage workflow from analysis to validation",
      "Adapts structure based on documentation type",
      "Requires runnable code examples in every section",
      "Includes validation checklist before output"
    ]
  },
  {
    id: "ref_012",
    domain: "output_control",
    title: "Meeting Summary Formatter",
    description: "Prompt that produces consistent, actionable meeting summaries with decisions, owners, and deadlines extracted.",
    systemPrompt: `Extract meeting information into this exact format. Do not deviate.

MEETING SUMMARY
Date: [YYYY-MM-DD]
Duration: [minutes]
Attendees: [names, comma-separated]
Meeting Type: [Standup / Planning / Review / Decision / Other]

DECISIONS MADE (numbered list)
1. [Decision in one sentence]
   Context: [Why this decision was made]
   Owner: [Name]
   Deadline: [YYYY-MM-DD] or "No deadline set"
   
[Repeat for all decisions]

ACTION ITEMS (numbered list, priority order)
1. [Action starting with verb]
   Owner: [Name]
   Deadline: [YYYY-MM-DD]
   Dependencies: [Other action numbers] or "None"
   
[Repeat for all action items]

DISCUSSION TOPICS (bullets)
- [Topic] - [outcome: decided / tabled / needs more info]

BLOCKERS IDENTIFIED
- [Blocker] - [impacted work] - [owner to resolve]

NEXT MEETING
Date: [YYYY-MM-DD] or "Not scheduled"
Agenda: [Topics to cover]

PARKING LOT (items mentioned but not discussed)
- [Item] - [who raised it]

Rules:
1. Every decision must have an owner
2. Every action item must have owner + deadline
3. If deadline not mentioned: set to "No deadline set" and flag in MISSING INFO section
4. Action items in priority order: blockers first, then by deadline
5. If meeting had no decisions: state "NO DECISIONS MADE" (this is valid)
6. If meeting had no action items: state "NO ACTION ITEMS" (this is valid)
7. Discussion topics: always note outcome (decided/tabled/needs more info)

MISSING INFO (if any)
- [What information was not captured that should have been]

CONFIDENCE
High: All decisions and actions have clear owners and deadlines
Medium: Some deadlines or owners unclear
Low: Multiple missing owners or deadlines`,
    userMessageExample: "Summarize this meeting: [paste transcript or notes]",
    qualityScore: 93,
    tags: ["meetings", "format", "extraction"],
    highlights: [
      "Exact format specification with required fields",
      "Every decision and action requires owner assignment",
      "Handles missing information explicitly",
      "Includes confidence assessment based on completeness"
    ]
  }
];

export default function LabPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("workspace");
  const [editorTab, setEditorTab] = useState<EditorTab>("system");
  
  // Workspace state
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [variables, setVariables] = useState<LabVariable[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<DrillDomain | null>(null);
  const [scored, setScored] = useState(false);
  const [scoringResult, setScoringResult] = useState<any>(null);
  const [domainError, setDomainError] = useState(false);
  
  // Saved sessions state
  const [savedSessions, setSavedSessions] = useState<LabSession[]>([]);
  const [filterDomain, setFilterDomain] = useState<DrillDomain | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "score">("newest");
  const [expandedRef, setExpandedRef] = useState<string | null>(null);

  useEffect(() => {
    const sessions = getItem<LabSession[]>(STORAGE_KEYS.LAB_SESSIONS) || [];
    setSavedSessions(sessions);
    setMounted(true);
  }, []);

  // Auto-detect variables from prompts
  useEffect(() => {
    const combined = systemPrompt + " " + userMessage;
    const matches = combined.match(/\{\{(\w+)\}\}/g);
    if (matches) {
      const varNames = [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, "")))];
      const existingNames = variables.map(v => v.name);
      const newVars = varNames.filter(name => !existingNames.includes(name));
      if (newVars.length > 0) {
        setVariables(prev => [...prev, ...newVars.map(name => ({ name, value: "" }))]);
      }
    }
  }, [systemPrompt, userMessage, variables]);

  const handleScore = () => {
    if (!selectedDomain) {
      setDomainError(true);
      return;
    }
    setDomainError(false);

    // Substitute variables
    let finalSystem = systemPrompt;
    let finalUser = userMessage;
    variables.forEach(v => {
      const pattern = new RegExp(`\\{\\{${v.name}\\}\\}`, "g");
      finalSystem = finalSystem.replace(pattern, v.value);
      finalUser = finalUser.replace(pattern, v.value);
    });

    const combined = finalSystem + "\n\n" + finalUser;
    
    // Create mock criteria for scoring
    const criteria = [
      { id: "c1", label: "Clarity", description: "Clear and unambiguous instructions", maxPoints: 25 },
      { id: "c2", label: "Specificity", description: "Specific requirements and constraints", maxPoints: 25 },
      { id: "c3", label: "Structure", description: "Well-organized with clear sections", maxPoints: 25 },
      { id: "c4", label: "Output Control", description: "Defines expected output format", maxPoints: 25 }
    ];

    const result = scorePromptConstruction(combined, criteria);
    setScoringResult(result);
    setScored(true);
  };

  const handleSave = () => {
    if (!scoringResult || !selectedDomain) return;

    const session: LabSession = {
      id: `lab_${Date.now()}`,
      prompt: systemPrompt,
      output: userMessage,
      qualityScore: scoringResult.percentage,
      feedback: scoringResult.feedbackSummary,
      domainTag: selectedDomain,
      savedAt: new Date().toISOString(),
      flagged: false
    };

    const sessions = [...savedSessions, session];
    if (sessions.length > 50) {
      return; // Don't save if at limit
    }
    
    setItem(STORAGE_KEYS.LAB_SESSIONS, sessions);
    setSavedSessions(sessions);
  };

  const handleClear = () => {
    setSystemPrompt("");
    setUserMessage("");
    setVariables([]);
    setSelectedDomain(null);
    setScored(false);
    setScoringResult(null);
    setDomainError(false);
  };

  const handleLoadReference = (ref: ReferencePrompt) => {
    setSystemPrompt(ref.systemPrompt);
    setUserMessage(ref.userMessageExample);
    setSelectedDomain(ref.domain);
    setActiveTab("workspace");
    setExpandedRef(null);
  };

  const handleLoadSession = (session: LabSession) => {
    setSystemPrompt(session.prompt);
    setUserMessage(session.output);
    setSelectedDomain(session.domainTag as DrillDomain);
    setActiveTab("workspace");
  };

  const handleDeleteSession = (id: string) => {
    const updated = savedSessions.filter(s => s.id !== id);
    setItem(STORAGE_KEYS.LAB_SESSIONS, updated);
    setSavedSessions(updated);
  };

  const filteredReferences = filterDomain 
    ? REFERENCE_PROMPTS.filter(r => r.domain === filterDomain)
    : REFERENCE_PROMPTS;

  const filteredSessions = filterDomain
    ? savedSessions.filter(s => s.domainTag === filterDomain)
    : savedSessions;

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    }
    return b.qualityScore - a.qualityScore;
  });

  if (!mounted) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="t-label">PROMPT LAB</div>
        <h1 className="t-display-sm">The Lab</h1>
        <p className="t-body">Build your prompt toolkit. Every serious operator has one.</p>
      </div>

      {/* Page Tabs */}
      <div className="flex gap-6 border-b-2 border-transparent">
        {(["workspace", "reference", "saved"] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 transition-all ${
              activeTab === tab
                ? "text-[var(--text-primary)] border-b-2 border-[var(--accent)] font-medium"
                : "text-[var(--text-muted)] border-b-2 border-transparent"
            }`}
            style={{ transitionDuration: "var(--t-fast)" }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Workspace Tab */}
      {activeTab === "workspace" && (
        <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] gap-6">
          {/* Left Column - Editor */}
          <div className="space-y-4">
            <Card>
              <div className="p-6 space-y-4">
                {/* Editor Sub-tabs */}
                <div className="flex gap-2">
                  {(["system", "user", "variables"] as EditorTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setEditorTab(tab)}
                      className={`px-4 py-2 text-sm transition-all ${
                        editorTab === tab
                          ? "bg-[var(--bg-elevated)] border-b-2 border-[var(--accent)] rounded-t"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {tab === "system" && " Prompt"}
                      {tab === "user" && " Message"}
                    </button>
                  ))}
                </div>

                {/* System Prompt Panel */}
                {editorTab === "system" && (
                  <div className="space-y-2">
                    <textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="Define the AI's role, constraints, and behavior. This runs before every user message and shapes all responses."
                      className="input w-full min-h-[220px] font-[var(--font-mono)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    />
                    <div className="flex justify-between">
                      <div className="t-label">{systemPrompt.length} characters</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        The system prompt is the foundation. Write it once — it applies to every interaction.
                      </div>
                    </div>
                  </div>
                )}

                {/* User Message Panel */}
                {editorTab === "user" && (
                  <div className="space-y-2">
                    <textarea
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      placeholder="Write the specific task or question. Use {{variable_name}} to insert dynamic values defined in the Variables tab."
                      className="input w-full min-h-[180px] font-[var(--font-mono)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    />
                    <div className="flex justify-between">
                      <div className="t-label">{userMessage.length} characters</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        The user message is the specific task. Reference variables with {"{{"} double_braces {"}}"}.
                      </div>
                    </div>
                  </div>
                )}

                {/* Variables Panel */}
                {editorTab === "variables" && (
                  <div className="space-y-3">
                    {variables.length === 0 ? (
                      <p className="text-sm text-[var(--text-secondary)]">
                        No variables detected. Use {"{{"} variable_name {"}}"}  in your prompts to create them.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {variables.map((v, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              value={v.name}
                              onChange={(e) => {
                                const updated = [...variables];
                                updated[idx].name = e.target.value;
                                setVariables(updated);
                              }}
                              placeholder="variable_name"
                              className="input w-[40%] font-[var(--font-mono)]"
                              style={{ fontFamily: "var(--font-mono)" }}
                            />
                            <input
                              value={v.value}
                              onChange={(e) => {
                                const updated = [...variables];
                                updated[idx].value = e.target.value;
                                setVariables(updated);
                              }}
                              placeholder="value"
                              className="input flex-1 font-[var(--font-mono)]"
                              style={{ fontFamily: "var(--font-mono)" }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setVariables(variables.filter((_, i) => i !== idx))}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => setVariables([...variables, { name: "", value: "" }])}
                    >
                      + Add Variable
                    </Button>
                  </div>
                )}

                {/* Domain Selector */}
                <div className="pt-4 border-t border-[var(--border-default)]">
                  <div className="t-label mb-2">DOMAIN</div>
                  <div className="flex flex-wrap gap-2">
                    {DOMAINS.map(domain => (
                      <Badge
                        key={domain.id}
                        variant={selectedDomain === domain.id ? "default" : "default"}
                        onClick={() => setSelectedDomain(domain.id)}
                        className={`cursor-pointer ${
                          selectedDomain === domain.id ? "bg-[var(--accent)] text-white" : ""
                        }`}
                      >
                        {domain.name}
                      </Badge>
                    ))}
                  </div>
                  {domainError && (
                    <p className="text-sm text-[var(--danger-text)] mt-2">
                      Select a domain before scoring.
                    </p>
                  )}
                </div>

                {/* Action Row */}
                <div className="flex items-center gap-3 pt-2">
                  <Button variant="primary" onClick={handleScore} className="flex-1">
                    Score This Prompt →
                  </Button>
                  <Button variant="ghost" onClick={handleClear}>
                    Clear
                  </Button>
                  <div className="t-label text-[var(--text-secondary)]">
                    {systemPrompt.length + userMessage.length} total chars
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Score Display */}
          <div className="space-y-4">
            {!scored ? (
              <Card>
                <div className="p-10 text-center border border-dashed border-[var(--border-default)] rounded-lg">
                  <p className="t-body">Submit a prompt to receive your quality score.</p>
                  <p className="t-label text-[var(--text-secondary)] mt-2">Scored across four dimensions.</p>
                </div>
              </Card>
            ) : (
              <Card className="animate-scale-in">
                <div className="p-6 space-y-6">
                  <div className="text-center">
                    <div className="t-score score-glow">
                      <ScoreCounter target={scoringResult.percentage} />
                    </div>
                    <p className="t-body mt-2">{scoringResult.performanceLabel}</p>
                  </div>

                  <div className="space-y-4">
                    {scoringResult.criteriaResults.map((criterion: any, idx: number) => (
                      <div key={criterion.criterionId} className="space-y-2" style={{ animationDelay: `${idx * 80}ms` }}>
                        <div className="flex items-center justify-between">
                          <span className="t-label">{criterion.label}</span>
                          <span className="t-mono text-sm">
                            {criterion.score}/{criterion.maxPoints}
                          </span>
                        </div>
                        <ProgressBar
                          value={(criterion.score / criterion.maxPoints) * 100}
                          size="sm"
                          color={criterion.score / criterion.maxPoints >= 0.7 ? "green" : criterion.score / criterion.maxPoints >= 0.5 ? "yellow" : "red"}
                        />
                        <p className="text-sm text-[var(--text-secondary)]">{criterion.feedback}</p>
                      </div>
                    ))}
                  </div>

                  {scored && (
                    <Button variant="secondary" onClick={handleSave} className="w-full">
                      Save to History →
                    </Button>
                  )}

                  {savedSessions.length >= 50 && (
                    <p className="text-sm text-[var(--warning-text)]">
                      History full (50/50). Delete older sessions to save new ones.
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Reference Library Tab */}
      {activeTab === "reference" && (
        <div className="space-y-6">
          <div>
            <h2 className="t-heading">Reference Prompts</h2>
            <p className="t-body">Study how expert operators structure prompts across each domain.</p>
          </div>

          {/* Domain Filter */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="default"
              onClick={() => setFilterDomain(null)}
              className={`cursor-pointer ${!filterDomain ? "bg-[var(--accent)] text-white" : ""}`}
            >
              All Domains
            </Badge>
            {DOMAINS.map(domain => (
              <Badge
                key={domain.id}
                variant="default"
                onClick={() => setFilterDomain(domain.id)}
                className={`cursor-pointer ${filterDomain === domain.id ? "bg-[var(--accent)] text-white" : ""}`}
              >
                {domain.name}
              </Badge>
            ))}
          </div>

          {/* Reference Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReferences.map(ref => (
              <Card key={ref.id} className="card-hover">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <Badge variant="default">{DOMAINS.find(d => d.id === ref.domain)?.name}</Badge>
                    <Badge variant="default" className="bg-[var(--success-bg)] text-[var(--success-text)]">
                      {ref.qualityScore}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="t-heading">{ref.title}</h3>
                    <p className="t-body mt-2">{ref.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ref.tags.map(tag => (
                      <Badge key={tag} variant="default">{tag}</Badge>
                    ))}
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => setExpandedRef(expandedRef === ref.id ? null : ref.id)}
                  >
                    {expandedRef === ref.id ? "Close" : "Study This Prompt →"}
                  </Button>

                  {expandedRef === ref.id && (
                    <div className="space-y-4 pt-4 border-t border-[var(--border-default)]">
                      <div>
                        <div className="t-label mb-2">SYSTEM PROMPT</div>
                        <div className="code-block">
                          <pre className="text-xs whitespace-pre-wrap">{ref.systemPrompt}</pre>
                        </div>
                      </div>

                      <div>
                        <div className="t-label mb-2">EXAMPLE USER MESSAGE</div>
                        <div className="code-block">
                          <pre className="text-xs whitespace-pre-wrap">{ref.userMessageExample}</pre>
                        </div>
                      </div>

                      <div>
                        <div className="t-label mb-2">WHY THIS SCORES WELL</div>
                        <ul className="space-y-2">
                          {ref.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-[var(--success-text)]">✓</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button variant="primary" onClick={() => handleLoadReference(ref)}>
                        Load into Workspace →
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Saved Sessions Tab */}
      {activeTab === "saved" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="t-heading">Saved Sessions</h2>
              <div className="t-label">{savedSessions.length} sessions saved</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "newest" ? "primary" : "ghost"}
                onClick={() => setSortBy("newest")}
              >
                Newest First
              </Button>
              <Button
                variant={sortBy === "score" ? "primary" : "ghost"}
                onClick={() => setSortBy("score")}
              >
                Highest Score
              </Button>
            </div>
          </div>

          {/* Domain Filter */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="default"
              onClick={() => setFilterDomain(null)}
              className={`cursor-pointer ${!filterDomain ? "bg-[var(--accent)] text-white" : ""}`}
            >
              All Domains
            </Badge>
            {DOMAINS.map(domain => (
              <Badge
                key={domain.id}
                variant="default"
                onClick={() => setFilterDomain(domain.id)}
                className={`cursor-pointer ${filterDomain === domain.id ? "bg-[var(--accent)] text-white" : ""}`}
              >
                {domain.name}
              </Badge>
            ))}
          </div>

          {/* Session List */}
          {sortedSessions.length === 0 ? (
            <Card>
              <div className="p-10 text-center border border-dashed border-[var(--border-default)] rounded-lg">
                <p className="t-body">Your lab is empty.</p>
                <p className="t-label text-[var(--text-secondary)] mt-2">
                  Score a prompt in the Workspace to start building your toolkit.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedSessions.map(session => (
                <Card key={session.id} className="card-hover">
                  <div className="p-4 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <Badge variant="default">{DOMAINS.find(d => d.id === session.domainTag)?.name}</Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="t-mono text-sm truncate">{session.prompt.slice(0, 80)}...</div>
                      <div className="t-label text-[var(--text-secondary)]">
                        {new Date(session.savedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge
                        variant="default"
                        className={
                          session.qualityScore >= 80
                            ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                            : session.qualityScore >= 60
                            ? "bg-[var(--warning-bg)] text-[var(--warning-text)]"
                            : "bg-[var(--danger-bg)] text-[var(--danger-text)]"
                        }
                      >
                        {session.qualityScore}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoadSession(session)}
                        className="text-sm text-[var(--accent)] hover:underline"
                        title="Load into Workspace"
                      >
                        ↩
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-sm text-[var(--danger-text)] hover:underline"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
