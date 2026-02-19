import type {
  Topic,
  Drill,
  Challenge,
  RubricCriterion,
  EvaluationResult,
} from "../types/topic";

// --- Drill Evaluation ---

export function evaluateDrill(
  drill: Drill,
  response: string
): { score: number; feedback: string } {
  if (!response.trim()) {
    return { score: 0, feedback: "No response provided." };
  }

  const lower = response.toLowerCase();
  let matchedElements = 0;
  const missingElements: string[] = [];

  for (const el of drill.requiredElements) {
    const keywords = el.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const matched = keywords.some((kw) => lower.includes(kw));
    if (matched) {
      matchedElements++;
    } else {
      missingElements.push(el);
    }
  }

  let criteriaScore = 0;
  const missedCriteria: string[] = [];

  for (const criterion of drill.evaluationCriteria) {
    const keywords = criterion.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const matched = keywords.filter((kw) => lower.includes(kw)).length;
    if (matched >= Math.max(1, Math.floor(keywords.length * 0.3))) {
      criteriaScore++;
    } else {
      missedCriteria.push(criterion);
    }
  }

  const elementRatio =
    drill.requiredElements.length > 0
      ? matchedElements / drill.requiredElements.length
      : 1;
  const criteriaRatio =
    drill.evaluationCriteria.length > 0
      ? criteriaScore / drill.evaluationCriteria.length
      : 1;

  // Length quality bonus: meaningful responses score higher
  const lengthBonus = Math.min(0.1, response.length / 5000);

  const rawScore = elementRatio * 0.5 + criteriaRatio * 0.4 + lengthBonus;
  const score = Math.min(100, Math.round(rawScore * 100));

  const feedbackParts: string[] = [];
  if (missingElements.length > 0) {
    feedbackParts.push(
      `Missing required elements: ${missingElements.join("; ")}`
    );
  }
  if (missedCriteria.length > 0) {
    feedbackParts.push(
      `Unmet criteria: ${missedCriteria.join("; ")}`
    );
  }
  if (feedbackParts.length === 0) {
    feedbackParts.push("Strong response covering all required elements and criteria.");
  }

  return { score, feedback: feedbackParts.join("\n") };
}

// --- Challenge (Certification) Evaluation ---

export function evaluateChallenge(
  challenge: Challenge,
  rubric: RubricCriterion[],
  response: string,
  passThreshold: number
): EvaluationResult {
  if (!response.trim()) {
    return {
      score: 0,
      passed: false,
      breakdown: rubric.map((c) => ({
        criterionId: c.id,
        score: 0,
        feedback: "No response provided.",
      })),
      confidence: "high",
      weaknesses: rubric.map((c) => c.dimension),
      suggestedImprovements: ["Provide a substantive response addressing the scenario."],
    };
  }

  const lower = response.toLowerCase();

  // 1. Check required sections
  let sectionsFound = 0;
  const missingSections: string[] = [];
  for (const section of challenge.requiredSections) {
    const sectionKeywords = section.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const found = sectionKeywords.some((kw) => lower.includes(kw));
    if (found) {
      sectionsFound++;
    } else {
      missingSections.push(section);
    }
  }
  const sectionRatio =
    challenge.requiredSections.length > 0
      ? sectionsFound / challenge.requiredSections.length
      : 1;

  // 2. Check constraints
  let constraintsMet = 0;
  for (const constraint of challenge.constraints) {
    const keywords = constraint.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const matched = keywords.filter((kw) => lower.includes(kw)).length;
    if (matched >= Math.max(1, Math.floor(keywords.length * 0.3))) {
      constraintsMet++;
    }
  }
  const constraintRatio =
    challenge.constraints.length > 0
      ? constraintsMet / challenge.constraints.length
      : 1;

  // 3. Validate JSON if test cases expect JSON
  let jsonValid = true;
  if (challenge.testCases && challenge.testCases.length > 0) {
    // Check if response contains JSON blocks
    const jsonBlocks = response.match(/```json\s*([\s\S]*?)```/g) ||
      response.match(/\{[\s\S]*\}/g);
    if (jsonBlocks) {
      for (const block of jsonBlocks) {
        const cleaned = block.replace(/```json\s*/, "").replace(/```/, "").trim();
        try {
          JSON.parse(cleaned);
        } catch {
          jsonValid = false;
        }
      }
    }
  }

  // 4. Score each rubric criterion
  const breakdown: EvaluationResult["breakdown"] = [];
  const weaknesses: string[] = [];
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const criterion of rubric) {
    const dimKeywords = criterion.description
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);

    let matchCount = 0;
    for (const kw of dimKeywords) {
      if (lower.includes(kw)) matchCount++;
    }
    const kwRatio = dimKeywords.length > 0 ? matchCount / dimKeywords.length : 0;

    // Composite score for this criterion
    const sectionInfluence = sectionRatio * 0.3;
    const constraintInfluence = constraintRatio * 0.3;
    const keywordInfluence = kwRatio * 0.3;
    const lengthInfluence = Math.min(0.1, response.length / 10000);

    let criterionScore = Math.min(
      100,
      Math.round(
        (sectionInfluence + constraintInfluence + keywordInfluence + lengthInfluence) * 100
      )
    );

    // JSON penalty
    if (!jsonValid) {
      criterionScore = Math.max(0, criterionScore - 10);
    }

    const feedback = generateCriterionFeedback(
      criterion,
      criterionScore,
      missingSections,
      kwRatio
    );

    if (criterionScore < 60) {
      weaknesses.push(criterion.dimension);
    }

    breakdown.push({
      criterionId: criterion.id,
      score: criterionScore,
      feedback,
    });

    totalWeightedScore += criterionScore * criterion.weight;
    totalWeight += criterion.weight;
  }

  const finalScore =
    totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  const passed = finalScore >= passThreshold;

  // Determine confidence
  let confidence: EvaluationResult["confidence"] = "high";
  if (sectionRatio < 0.5 || constraintRatio < 0.5) {
    confidence = "low";
  } else if (sectionRatio < 0.8 || constraintRatio < 0.8) {
    confidence = "medium";
  }

  const suggestedImprovements: string[] = [];
  if (missingSections.length > 0) {
    suggestedImprovements.push(`Address missing sections: ${missingSections.join(", ")}`);
  }
  for (const w of weaknesses) {
    suggestedImprovements.push(`Strengthen your coverage of: ${w}`);
  }
  if (!jsonValid) {
    suggestedImprovements.push("Ensure any JSON in your response is valid and parseable.");
  }
  if (response.length < 200) {
    suggestedImprovements.push("Provide a more detailed response with specific examples.");
  }

  return {
    score: finalScore,
    passed,
    breakdown,
    confidence,
    weaknesses,
    suggestedImprovements,
  };
}

function generateCriterionFeedback(
  criterion: RubricCriterion,
  score: number,
  missingSections: string[],
  keywordCoverage: number
): string {
  const parts: string[] = [];

  if (score >= 80) {
    parts.push(`Strong performance on ${criterion.dimension}.`);
  } else if (score >= 60) {
    parts.push(`Adequate coverage of ${criterion.dimension}, but could be more thorough.`);
  } else if (score >= 40) {
    parts.push(`Weak coverage of ${criterion.dimension}. Needs significant improvement.`);
  } else {
    parts.push(`Insufficient demonstration of ${criterion.dimension}.`);
  }

  if (keywordCoverage < 0.3) {
    parts.push(
      `Your response does not adequately address: "${criterion.description}".`
    );
  }

  if (missingSections.length > 0 && score < 70) {
    parts.push(
      `Consider addressing these missing sections: ${missingSections.slice(0, 2).join(", ")}.`
    );
  }

  return parts.join(" ");
}

// --- Full Topic Evaluation (convenience) ---

export function evaluateTopicChallenge(
  topic: Topic,
  response: string
): EvaluationResult {
  return evaluateChallenge(
    topic.challenge,
    topic.rubric,
    response,
    topic.passThreshold
  );
}
