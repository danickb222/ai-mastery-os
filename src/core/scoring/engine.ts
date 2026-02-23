import type {
  PromptCriteria,
  FlawDescription,
  OutputFlaw,
  RubricItem,
} from '../types/drills';

export interface CriterionResult {
  criterionId: string;
  label: string;
  score: number;
  maxPoints: number;
  feedback: string;
}

export interface ScoringResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  criteriaResults: CriterionResult[];
  performanceLabel: string;
  feedbackSummary: string;
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

function detectPattern(text: string, pattern: RegExp): boolean {
  return pattern.test(text);
}

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.filter(p => p.test(text)).length;
}

export function scorePromptConstruction(
  userInput: string,
  criteria: PromptCriteria[]
): ScoringResult {
  const normalized = normalizeText(userInput);
  const criteriaResults: CriterionResult[] = [];
  
  for (const criterion of criteria) {
    let score = 0;
    let feedback = '';
    const maxPoints = criterion.maxPoints;
    
    const checks = {
      roleDefinition: /you are|act as|your role|as a|role:/i.test(userInput),
      audienceSpec: /audience|reader|for a|written for|targeting|intended for/i.test(userInput),
      outputFormat: /format|structure|output as|respond with|return|table|list|paragraph|json|template/i.test(userInput),
      lengthConstraint: /under|maximum|max|limit|words|sentences|characters|no more than|exactly \d+/i.test(userInput),
      taskVerb: /^(write|create|analyze|summarize|extract|generate|identify|evaluate|compare|draft|design|build)/i.test(userInput.trim()),
      examplesContext: /for example|such as|context:|background:|example:/i.test(userInput),
      explicitConstraints: /do not|never|avoid|must not|exclude|only|required|mandatory/i.test(userInput),
      structuredFormat: /\d+\.|•|-\s|\n\d+\./g.test(userInput),
      conflictingInstructions: /(brief|concise|short).*(thorough|comprehensive|detailed|complete)|(formal|professional).*(friendly|casual|approachable)/i.test(userInput),
    };
    
    const charCount = userInput.length;
    
    if (criterion.label.toLowerCase().includes('audience')) {
      if (checks.audienceSpec) score += maxPoints * 0.7;
      if (/\b(founder|operator|executive|manager|developer|user|customer|client)\b/i.test(userInput)) score += maxPoints * 0.3;
      feedback = score >= maxPoints * 0.7 ? 'Audience clearly specified.' : score >= maxPoints * 0.4 ? 'Audience mentioned but could be more specific.' : 'Audience definition missing or too vague.';
    }
    
    else if (criterion.label.toLowerCase().includes('structure')) {
      if (checks.outputFormat) score += maxPoints * 0.4;
      if (checks.structuredFormat) score += maxPoints * 0.3;
      if (/section|heading|paragraph|bullet|numbered/i.test(userInput)) score += maxPoints * 0.3;
      feedback = score >= maxPoints * 0.7 ? 'Structure clearly defined.' : score >= maxPoints * 0.4 ? 'Some structure specified but incomplete.' : 'Structure specification missing.';
    }
    
    else if (criterion.label.toLowerCase().includes('tone')) {
      if (/tone|voice|style|manner/i.test(userInput)) score += maxPoints * 0.5;
      if (/(professional|casual|formal|friendly|direct|expert|technical|conversational)/i.test(userInput)) score += maxPoints * 0.5;
      feedback = score >= maxPoints * 0.7 ? 'Tone explicitly defined.' : score >= maxPoints * 0.4 ? 'Tone mentioned but vague.' : 'Tone not specified.';
    }
    
    else if (criterion.label.toLowerCase().includes('length') || criterion.label.toLowerCase().includes('constraint')) {
      if (checks.lengthConstraint) score += maxPoints * 0.8;
      if (/\d+\s*(word|character|sentence|paragraph)/i.test(userInput)) score += maxPoints * 0.2;
      feedback = score >= maxPoints * 0.7 ? 'Length constraints specified.' : score >= maxPoints * 0.4 ? 'Some constraints mentioned.' : 'No length constraints defined.';
    }
    
    else if (criterion.label.toLowerCase().includes('format')) {
      if (checks.outputFormat) score += maxPoints * 0.5;
      if (/subject line|header|cta|call.to.action|hashtag|emoji/i.test(userInput)) score += maxPoints * 0.3;
      if (checks.structuredFormat) score += maxPoints * 0.2;
      feedback = score >= maxPoints * 0.7 ? 'Format elements specified.' : score >= maxPoints * 0.4 ? 'Some format elements present.' : 'Format elements missing.';
    }
    
    else {
      const generalScore = (
        (checks.roleDefinition ? 0.2 : 0) +
        (checks.outputFormat ? 0.2 : 0) +
        (checks.explicitConstraints ? 0.2 : 0) +
        (charCount > 100 ? 0.2 : charCount > 50 ? 0.1 : 0.05) +
        (checks.taskVerb ? 0.2 : 0)
      );
      score = maxPoints * generalScore;
      feedback = score >= maxPoints * 0.7 ? 'Criterion well addressed.' : score >= maxPoints * 0.4 ? 'Partially addressed.' : 'Needs improvement.';
    }
    
    if (checks.conflictingInstructions) {
      score *= 0.7;
      feedback += ' Warning: Contains conflicting instructions.';
    }
    
    score = Math.min(score, maxPoints);
    
    criteriaResults.push({
      criterionId: criterion.id,
      label: criterion.label,
      score: Math.round(score),
      maxPoints,
      feedback,
    });
  }
  
  const totalScore = criteriaResults.reduce((sum, r) => sum + r.score, 0);
  const maxScore = criteriaResults.reduce((sum, r) => sum + r.maxPoints, 0);
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  
  return {
    totalScore,
    maxScore,
    percentage,
    criteriaResults,
    performanceLabel: getPerformanceLabel(percentage),
    feedbackSummary: generateFeedbackSummary(criteriaResults, percentage),
  };
}

export function scorePromptDebug(
  flawsInput: string,
  fixInput: string,
  actualFlaws: FlawDescription[]
): ScoringResult {
  const normalizedFlaws = normalizeText(flawsInput);
  const criteriaResults: CriterionResult[] = [];
  
  let flawsIdentified = 0;
  for (const flaw of actualFlaws) {
    const keyTerms = normalizeText(flaw.description).split(' ').filter(w => w.length > 4);
    const matchCount = keyTerms.filter(term => normalizedFlaws.includes(term)).length;
    if (matchCount >= 2) flawsIdentified++;
  }
  
  const flawScore = actualFlaws.length > 0 ? (flawsIdentified / actualFlaws.length) * 40 : 0;
  criteriaResults.push({
    criterionId: 'flaws',
    label: 'Flaws Identified',
    score: Math.round(flawScore),
    maxPoints: 40,
    feedback: flawsIdentified >= actualFlaws.length ? 'All flaws identified.' : flawsIdentified >= actualFlaws.length * 0.5 ? 'Most flaws identified.' : 'Many flaws missed.',
  });
  
  const fixChecks = {
    priorityOrder: /priority|order|hierarchy|first|second|precedence/i.test(fixInput),
    explicitRules: /rule|must|required|always|never|do not/i.test(fixInput),
    noConflicts: !/(brief|concise).*(thorough|comprehensive)|(formal).*(casual)/i.test(fixInput),
  };
  
  const fixScore = (
    (fixChecks.priorityOrder ? 12 : 0) +
    (fixChecks.explicitRules ? 13 : 0) +
    (fixChecks.noConflicts ? 10 : 0) +
    (fixInput.length > 100 ? 5 : 0)
  );
  
  criteriaResults.push({
    criterionId: 'priority',
    label: 'Priority Ordering',
    score: Math.round(fixScore * 0.625),
    maxPoints: 25,
    feedback: fixChecks.priorityOrder ? 'Priority ordering established.' : 'Priority ordering missing.',
  });
  
  criteriaResults.push({
    criterionId: 'conflicts',
    label: 'No Contradictions',
    score: Math.round(fixChecks.noConflicts ? 35 : 10),
    maxPoints: 35,
    feedback: fixChecks.noConflicts ? 'No contradictions detected.' : 'Still contains conflicting instructions.',
  });
  
  const totalScore = criteriaResults.reduce((sum, r) => sum + r.score, 0);
  const maxScore = 100;
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  return {
    totalScore,
    maxScore,
    percentage,
    criteriaResults,
    performanceLabel: getPerformanceLabel(percentage),
    feedbackSummary: generateFeedbackSummary(criteriaResults, percentage),
  };
}

export function scoreOutputAnalysis(
  flawsInput: string,
  correctionInput: string,
  actualFlaws: OutputFlaw[]
): ScoringResult {
  const normalizedFlaws = normalizeText(flawsInput);
  const criteriaResults: CriterionResult[] = [];
  
  let flawsIdentified = 0;
  for (const flaw of actualFlaws) {
    const evidenceTerms = normalizeText(flaw.evidence).split(' ').filter(w => w.length > 4);
    const matchCount = evidenceTerms.filter(term => normalizedFlaws.includes(term)).length;
    if (matchCount >= 2) flawsIdentified++;
  }
  
  const flawScore = actualFlaws.length > 0 ? (flawsIdentified / actualFlaws.length) * 40 : 0;
  criteriaResults.push({
    criterionId: 'flaws',
    label: 'Errors Identified',
    score: Math.round(flawScore),
    maxPoints: 40,
    feedback: flawsIdentified >= actualFlaws.length ? 'All errors found.' : flawsIdentified >= actualFlaws.length * 0.5 ? 'Most errors found.' : 'Many errors missed.',
  });
  
  const correctionChecks = {
    uncertaintyDisclosure: /acknowledge|uncertain|cannot verify|unsure|unclear|confidence/i.test(correctionInput),
    sourceRequirement: /source|cite|reference|attribution|evidence|verify/i.test(correctionInput),
    separateFactFromEstimate: /separate|distinguish|clarify|confirmed|estimated/i.test(correctionInput),
  };
  
  criteriaResults.push({
    criterionId: 'uncertainty',
    label: 'Uncertainty Disclosure',
    score: Math.round(correctionChecks.uncertaintyDisclosure ? 35 : 10),
    maxPoints: 35,
    feedback: correctionChecks.uncertaintyDisclosure ? 'Forces uncertainty disclosure.' : 'Does not address uncertainty.',
  });
  
  criteriaResults.push({
    criterionId: 'sources',
    label: 'Source Requirement',
    score: Math.round(correctionChecks.sourceRequirement ? 25 : 5),
    maxPoints: 25,
    feedback: correctionChecks.sourceRequirement ? 'Requires sources.' : 'No source requirement.',
  });
  
  const totalScore = criteriaResults.reduce((sum, r) => sum + r.score, 0);
  const maxScore = 100;
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  return {
    totalScore,
    maxScore,
    percentage,
    criteriaResults,
    performanceLabel: getPerformanceLabel(percentage),
    feedbackSummary: generateFeedbackSummary(criteriaResults, percentage),
  };
}

export function scoreLiveChallenge(
  userInput: string,
  criteria: PromptCriteria[]
): ScoringResult {
  return scorePromptConstruction(userInput, criteria);
}

export function scoreScenarioSimulation(
  userInput: string,
  rubric: RubricItem[]
): ScoringResult {
  const normalized = normalizeText(userInput);
  const criteriaResults: CriterionResult[] = [];
  
  for (const item of rubric) {
    let score = 0;
    let feedback = '';
    const maxPoints = item.maxPoints;
    
    const checks = {
      stageDefinitions: /stage|step|phase|workflow|pipeline/i.test(userInput),
      inputOutput: /input|output|takes|produces|generates|receives/i.test(userInput),
      qualityMentions: /quality|qa|validation|check|verify|review/i.test(userInput),
      errorHandling: /error|failure|fail|fallback|retry|exception/i.test(userInput),
      humanReview: /human|manual|review|approval|checkpoint/i.test(userInput),
    };
    
    if (item.label.toLowerCase().includes('stage') || item.label.toLowerCase().includes('workflow')) {
      const stageCount = (userInput.match(/stage \d+|step \d+|phase \d+/gi) || []).length;
      score = Math.min((stageCount / 4) * maxPoints, maxPoints);
      feedback = stageCount >= 4 ? 'Sufficient stages defined.' : 'More stages needed.';
    }
    
    else if (item.label.toLowerCase().includes('input') || item.label.toLowerCase().includes('output')) {
      if (checks.inputOutput) score += maxPoints * 0.7;
      if (/input:.*output:/i.test(userInput) || /takes.*produces/i.test(userInput)) score += maxPoints * 0.3;
      feedback = score >= maxPoints * 0.7 ? 'Input/output clearly defined.' : 'Input/output needs clarification.';
    }
    
    else if (item.label.toLowerCase().includes('quality') || item.label.toLowerCase().includes('qa')) {
      if (checks.qualityMentions) score += maxPoints * 0.6;
      if (/criteria|threshold|metric|measure/i.test(userInput)) score += maxPoints * 0.4;
      feedback = score >= maxPoints * 0.7 ? 'Quality mechanisms specified.' : 'Quality mechanisms weak.';
    }
    
    else if (item.label.toLowerCase().includes('error') || item.label.toLowerCase().includes('failure')) {
      if (checks.errorHandling) score += maxPoints * 0.7;
      if (/what happens|if.*fails|when.*error/i.test(userInput)) score += maxPoints * 0.3;
      feedback = score >= maxPoints * 0.7 ? 'Error handling defined.' : 'Error handling missing.';
    }
    
    else if (item.label.toLowerCase().includes('human')) {
      if (checks.humanReview) score += maxPoints * 0.7;
      if (/exactly|specifically|what humans|which.*human/i.test(userInput)) score += maxPoints * 0.3;
      feedback = score >= maxPoints * 0.7 ? 'Human role clearly defined.' : 'Human role unclear.';
    }
    
    else {
      score = maxPoints * 0.5;
      feedback = 'Partially addressed.';
    }
    
    score = Math.min(score, maxPoints);
    
    criteriaResults.push({
      criterionId: item.id,
      label: item.label,
      score: Math.round(score),
      maxPoints,
      feedback,
    });
  }
  
  const totalScore = criteriaResults.reduce((sum, r) => sum + r.score, 0);
  const maxScore = criteriaResults.reduce((sum, r) => sum + r.maxPoints, 0);
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  
  return {
    totalScore,
    maxScore,
    percentage,
    criteriaResults,
    performanceLabel: getPerformanceLabel(percentage),
    feedbackSummary: generateFeedbackSummary(criteriaResults, percentage),
  };
}

export function getPerformanceLabel(percentage: number): string {
  if (percentage >= 90) return 'Outstanding performance.';
  if (percentage >= 80) return 'Strong session.';
  if (percentage >= 65) return 'Acceptable. Address the gaps below.';
  if (percentage >= 50) return 'Below standard. Study the reference carefully.';
  return 'Significant gaps. Retry this drill before advancing.';
}

function generateFeedbackSummary(results: CriterionResult[], percentage: number): string {
  const weak = results.filter(r => (r.score / r.maxPoints) < 0.6);
  if (weak.length === 0) return 'All criteria met at a high level.';
  if (weak.length === 1) return `Focus on improving: ${weak[0].label}.`;
  return `Key areas for improvement: ${weak.map(r => r.label).join(', ')}.`;
}
