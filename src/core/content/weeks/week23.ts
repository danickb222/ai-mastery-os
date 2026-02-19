import type { Topic } from "../../types/topic";

export const week23: Topic[] = [
  {
    id: "w23-t01-roi-modeling",
    weekNumber: 23, phase: 4, domain: "Operator Strategy",
    title: "ROI Modeling for AI Automation",
    lesson: [
      { type: "text", content: "ROI (Return on Investment) answers: 'Is this AI system worth building?' Without ROI analysis, you're guessing.\n\nROI formula: ROI = (Value Created - Total Cost) / Total Cost × 100%\n\nValue created:\n1. Time saved: Hours/week × hourly cost × 52 weeks\n2. Error reduction: Error rate reduction × cost per error × volume\n3. Throughput increase: Additional capacity × revenue per unit\n4. Quality improvement: Customer satisfaction increase → retention → revenue\n\nTotal cost:\n1. Build cost: Engineering time × loaded salary\n2. Run cost: API calls + infrastructure + monitoring\n3. Maintain cost: Ongoing engineering time for improvements\n4. Risk cost: Expected cost of failures × probability" },
    ],
    examples: [
      { title: "ROI Calculation", input: "AI system: Automated support ticket classification\n\nValue:\n- Saves 2 FTEs of manual classification (2 × $60K = $120K/year)\n- 40% faster routing → 15% customer satisfaction increase → est. $50K retention\n- Total value: $170K/year\n\nCost:\n- Build: 3 months × 1 engineer × $150K/year = $37.5K\n- Run: $500/month API + $200/month infra = $8.4K/year\n- Maintain: 10 hours/month × $75/hour = $9K/year\n- Risk: 5% chance of $20K compliance issue = $1K\n- Total year 1: $55.9K, Year 2+: $18.4K/year\n\nROI Year 1: ($170K - $55.9K) / $55.9K = 204%\nPayback period: 4 months", output: "Clear value and cost breakdown with specific numbers.", explanation: "Every number is traceable. A stakeholder can challenge any assumption and you can adjust." },
    ],
    drills: [
      { id: "w23-t01-d1", type: "build", prompt: "Build an ROI model for an AI-powered document summarization system for a consulting firm. The firm has 50 consultants who each spend 5 hours/week reading and summarizing reports. Loaded cost: $100/hour. Include build, run, and maintain costs.", requiredElements: ["value calculation", "build cost", "run cost", "maintain cost", "ROI and payback"], evaluationCriteria: ["Math is correct", "All cost categories included", "Assumptions are stated", "ROI is calculated correctly"] },
      { id: "w23-t01-d2", type: "analyze", prompt: "A team presents this ROI: 'Our AI chatbot will save $2M/year by replacing 20 customer service agents.' Critique this analysis. What's missing? What assumptions need validation? What risks are unaccounted for?", requiredElements: ["assumption critique", "missing cost categories", "risk identification", "revised analysis framework"], evaluationCriteria: ["Identifies oversimplified value claim", "Finds missing costs", "Identifies transition risks", "Proposes realistic framework"] },
    ],
    challenge: {
      id: "w23-t01-ch", type: "strategy_design",
      scenario: "Build a complete ROI model for an AI-powered claims processing system for a mid-size insurance company. Current state: 40 claims processors handle 2000 claims/week manually. Average processing time: 45 minutes/claim. Error rate: 8%. Cost per error: $2000 average.\n\nThe AI system would automate classification, data extraction, and preliminary assessment, with human review for complex cases.",
      constraints: ["Must model 3 scenarios: conservative, moderate, optimistic", "Must include all cost categories (build, run, maintain, risk, transition)", "Must account for transition period (not instant full automation)", "Must include sensitivity analysis (what if accuracy is 10% lower?)", "Must project 3-year TCO vs value", "Must include non-financial benefits (employee satisfaction, speed)"],
      requiredSections: ["Current state cost analysis", "AI system value model (3 scenarios)", "Complete cost model", "Transition plan and timeline", "3-year projection", "Sensitivity analysis", "Non-financial benefits"],
    },
    rubric: [
      { id: "w23-t01-r1", dimension: "Value modeling", description: "Multiple value streams quantified realistically", weight: 0.25 },
      { id: "w23-t01-r2", dimension: "Cost completeness", description: "All cost categories with realistic estimates", weight: 0.25 },
      { id: "w23-t01-r3", dimension: "Scenario analysis", description: "3 scenarios with sensitivity analysis", weight: 0.25 },
      { id: "w23-t01-r4", dimension: "Presentation quality", description: "Stakeholder-ready with traceable assumptions", weight: 0.25 },
    ],
    reviewSummary: "ROI = (Value - Cost) / Cost. Value: time saved, error reduction, throughput, quality. Cost: build, run, maintain, risk. Always model 3 scenarios. Include sensitivity analysis. Every number must be traceable.",
    artifactType: "strategy_brief", passThreshold: 80, xpValue: 250,
  },
  {
    id: "w23-t02-business-case",
    weekNumber: 23, phase: 4, domain: "Operator Strategy",
    title: "Writing AI Business Cases",
    lesson: [
      { type: "text", content: "A business case is the complete argument for building an AI system. It combines: problem definition, proposed solution, ROI, risk assessment, and implementation plan into a single decision document.\n\nBusiness case structure:\n1. Executive summary (1 paragraph)\n2. Problem statement (what hurts, how much, why now)\n3. Proposed solution (what, how, why this approach)\n4. ROI analysis (value, cost, payback)\n5. Risk assessment (what could go wrong, mitigations)\n6. Implementation plan (phases, timeline, resources)\n7. Success metrics (how we'll know it worked)\n8. Decision request (what you need from stakeholders)" },
    ],
    examples: [
      { title: "Executive Summary", input: "Our support team spends 40% of time on ticket classification — a task AI can handle with 90%+ accuracy. Automating classification would save $120K/year in labor, reduce response time by 35%, and improve customer satisfaction. Build cost: $38K. Monthly run cost: $700. Payback: 4 months. Risk: Accuracy may be lower for complex tickets — mitigated by human fallback. Request: Approve $38K initial investment and 1 engineer for 3 months.", output: "Problem, solution, ROI, risk, and ask — in one paragraph.", explanation: "An executive can make a decision from this paragraph alone. The rest of the document supports it." },
    ],
    drills: [
      { id: "w23-t02-d1", type: "build", prompt: "Write a complete business case for an AI-powered invoice processing system. The company processes 5000 invoices/month manually, each taking 15 minutes. Use the 8-section structure.", requiredElements: ["8 sections", "specific numbers", "risk assessment", "implementation plan", "decision request"], evaluationCriteria: ["All sections present", "Numbers are grounded", "Risks are realistic", "Plan is actionable", "Ask is specific"] },
      { id: "w23-t02-d2", type: "evaluate", prompt: "Critique this business case: 'We should use AI because our competitors are using it. It will make everything better and faster. We need $500K and 6 months.'\n\nIdentify every problem and outline what a proper business case would include.", requiredElements: ["problem identification", "missing elements", "proper outline", "stakeholder perspective"], evaluationCriteria: ["Identifies vague value proposition", "Identifies missing ROI", "Identifies missing risk assessment", "Provides concrete improvement"] },
    ],
    challenge: {
      id: "w23-t02-ch", type: "strategy_design",
      scenario: "Write a complete business case for implementing AI across the customer journey of a B2B SaaS company. The AI initiatives include: lead scoring, onboarding assistance, support automation, churn prediction, and upsell recommendation.\n\nThe business case must convince a skeptical CFO to approve a $400K annual budget.",
      constraints: ["Must follow the 8-section structure", "Must prioritize initiatives by ROI", "Must include a phased approach (not all at once)", "Must address the CFO's likely concerns (cost, risk, proof)", "Must include quick wins that demonstrate value early", "Must define measurable success criteria for each initiative"],
      requiredSections: ["Executive summary", "Problem statement with data", "Solution design (5 initiatives prioritized)", "Combined ROI analysis", "Risk assessment with mitigations", "Phased implementation plan", "Success metrics per initiative", "Budget request with justification"],
    },
    rubric: [
      { id: "w23-t02-r1", dimension: "Persuasiveness", description: "CFO would be convinced by this case", weight: 0.25 },
      { id: "w23-t02-r2", dimension: "Financial rigor", description: "ROI is detailed, traceable, and realistic", weight: 0.25 },
      { id: "w23-t02-r3", dimension: "Risk honesty", description: "Risks acknowledged with practical mitigations", weight: 0.25 },
      { id: "w23-t02-r4", dimension: "Implementation realism", description: "Phased plan is achievable with stated resources", weight: 0.25 },
    ],
    reviewSummary: "Business case: executive summary, problem, solution, ROI, risks, plan, metrics, ask. Executive summary must stand alone. Every number traceable. Honest about risks. Specific ask.",
    artifactType: "strategy_brief", passThreshold: 80, xpValue: 250,
  },
  {
    id: "w23-t03-measuring-success",
    weekNumber: 23, phase: 4, domain: "Operator Strategy",
    title: "Measuring AI Success",
    lesson: [
      { type: "text", content: "How do you know your AI system is successful? Not by gut feeling — by pre-defined metrics measured consistently.\n\nSuccess metric categories:\n1. Technical: Accuracy, latency, uptime, error rate\n2. Business: Revenue impact, cost reduction, time saved, throughput\n3. User: Satisfaction, adoption rate, task completion, support tickets\n4. Operational: Maintenance burden, incident frequency, drift rate\n\nRule: Define success metrics BEFORE building. If you can't define success, you can't achieve it." },
      { type: "text", content: "Metric design principles:\n- Measurable: Can you actually collect this data?\n- Attributable: Can you prove the AI caused the change?\n- Timely: Can you measure it soon enough to course-correct?\n- Actionable: If the metric changes, do you know what to do?\n- Baseline: Do you have a pre-AI baseline to compare against?" },
    ],
    examples: [
      { title: "Success Metrics Framework", input: "AI Feature: Automated email classification\n\nTechnical: Classification accuracy >90% (baseline: manual 95%)\nBusiness: Reduce classification time from 3 min to 0.5 sec per email\nUser: Support team satisfaction score >4/5 with AI tool\nOperational: <2 incidents/month, <5% prompt version regression rate\n\nMeasurement: Weekly automated reports, monthly human audit of 100 samples\nBaseline: 2 weeks of manual classification data before launch", output: "Four metric categories with specific targets and measurement plan.", explanation: "Each metric is measurable, has a target, and has a baseline. You'll know if the system succeeds or fails." },
    ],
    drills: [
      { id: "w23-t03-d1", type: "build", prompt: "Design a success metrics framework for an AI-powered content recommendation system. Define at least 3 metrics per category (technical, business, user, operational). Include: measurement method, target, baseline, and review frequency.", requiredElements: ["4 categories", "3+ metrics each", "measurement methods", "targets and baselines"], evaluationCriteria: ["All categories covered", "Metrics are measurable", "Targets are realistic", "Baselines defined"] },
      { id: "w23-t03-d2", type: "analyze", prompt: "A team reports their AI system is 'successful' based on: 95% accuracy on test data. No other metrics. Explain why this is insufficient and design a complete success measurement framework.", requiredElements: ["critique of single metric", "missing dimensions", "complete framework", "measurement plan"], evaluationCriteria: ["Identifies test vs production gap", "Identifies missing business metrics", "Framework covers all 4 categories", "Plan is implementable"] },
    ],
    challenge: {
      id: "w23-t03-ch", type: "strategy_design",
      scenario: "Design the complete success measurement framework for an AI transformation program at a 500-person company. The program includes 4 AI initiatives launched over 12 months. You must prove to the board that the $600K investment is delivering value.",
      constraints: ["Must define metrics for each of 4 initiatives", "Must include leading indicators (predict success early) and lagging indicators (confirm success)", "Must include a dashboard design for board reporting", "Must define 30/60/90-day checkpoints", "Must include a 'kill criteria' for each initiative (when to stop)", "Must account for metric gaming (people optimizing for metrics instead of value)"],
      requiredSections: ["Per-initiative metric sets", "Leading vs lagging indicators", "Board dashboard design", "Checkpoint milestones", "Kill criteria", "Anti-gaming measures"],
    },
    rubric: [
      { id: "w23-t03-r1", dimension: "Metric quality", description: "Measurable, attributable, timely, actionable", weight: 0.25 },
      { id: "w23-t03-r2", dimension: "Indicator design", description: "Leading and lagging indicators balanced", weight: 0.25 },
      { id: "w23-t03-r3", dimension: "Reporting clarity", description: "Board can understand success at a glance", weight: 0.25 },
      { id: "w23-t03-r4", dimension: "Integrity", description: "Kill criteria and anti-gaming measures", weight: 0.25 },
    ],
    reviewSummary: "Define success metrics BEFORE building. Four categories: technical, business, user, operational. Each metric: measurable, attributable, timely, actionable, baselined. Include kill criteria.",
    artifactType: "strategy_brief", passThreshold: 80, xpValue: 250,
  },
];
