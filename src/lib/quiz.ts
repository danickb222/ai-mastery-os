import type { QuizQuestion, SkillDomain, Week } from "./types";

const mcTemplates = [
  (obj: string) => ({
    question: `Which of the following best describes: "${obj}"?`,
    options: [
      `A systematic approach to ${obj.toLowerCase()}`,
      `An unrelated concept to this week's material`,
      `A deprecated methodology no longer in use`,
      `Only applicable in enterprise settings`,
    ],
    correctAnswer: `A systematic approach to ${obj.toLowerCase()}`,
  }),
  (obj: string) => ({
    question: `What is the primary goal of: "${obj}"?`,
    options: [
      `To build practical competency in this area`,
      `To memorize theoretical frameworks only`,
      `To replace human judgment entirely`,
      `To avoid using AI tools altogether`,
    ],
    correctAnswer: `To build practical competency in this area`,
  }),
  (obj: string) => ({
    question: `When applying "${obj.toLowerCase()}", what should you prioritize?`,
    options: [
      `Hands-on practice with real examples`,
      `Reading documentation without testing`,
      `Copying solutions without understanding`,
      `Skipping evaluation of results`,
    ],
    correctAnswer: `Hands-on practice with real examples`,
  }),
  (obj: string) => ({
    question: `Which approach is most effective for: "${obj}"?`,
    options: [
      `Iterative experimentation and evaluation`,
      `A single attempt without revision`,
      `Avoiding any structured methodology`,
      `Relying solely on default settings`,
    ],
    correctAnswer: `Iterative experimentation and evaluation`,
  }),
  (obj: string) => ({
    question: `A key indicator of mastering "${obj.toLowerCase()}" is:`,
    options: [
      `Being able to apply it independently to novel problems`,
      `Memorizing every detail from the documentation`,
      `Never making mistakes during practice`,
      `Only understanding the theoretical basis`,
    ],
    correctAnswer: `Being able to apply it independently to novel problems`,
  }),
];

const shortTemplates = [
  (obj: string) => ({
    question: `Explain in your own words how you would approach: "${obj}"`,
    keywords: obj.toLowerCase().split(" ").filter((w) => w.length > 3),
  }),
  (obj: string) => ({
    question: `Describe a practical use case for: "${obj}"`,
    keywords: [...obj.toLowerCase().split(" ").filter((w) => w.length > 3), "use", "case", "practical"],
  }),
  (obj: string) => ({
    question: `What are the key steps involved in: "${obj}"?`,
    keywords: ["step", "process", ...obj.toLowerCase().split(" ").filter((w) => w.length > 3)],
  }),
  (obj: string) => ({
    question: `What potential challenges might arise when: "${obj.toLowerCase()}"?`,
    keywords: ["challenge", "issue", "problem", ...obj.toLowerCase().split(" ").filter((w) => w.length > 3)],
  }),
  (obj: string) => ({
    question: `How does "${obj.toLowerCase()}" connect to building production AI systems?`,
    keywords: ["production", "system", "build", ...obj.toLowerCase().split(" ").filter((w) => w.length > 3)],
  }),
];

export function generateQuiz(week: Week): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const domains = Object.keys(week.skills) as SkillDomain[];
  const primaryDomain = domains[0] || "Prompting";

  // Generate 5 MC questions
  for (let i = 0; i < 5; i++) {
    const objIdx = i % week.objectives.length;
    const template = mcTemplates[i % mcTemplates.length];
    const generated = template(week.objectives[objIdx]);
    questions.push({
      id: i + 1,
      type: "mc",
      question: generated.question,
      options: generated.options,
      correctAnswer: generated.correctAnswer,
      domain: domains[i % domains.length] || primaryDomain,
    });
  }

  // Generate 5 short answer questions
  for (let i = 0; i < 5; i++) {
    const objIdx = i % week.objectives.length;
    const template = shortTemplates[i % shortTemplates.length];
    const generated = template(week.objectives[objIdx]);
    questions.push({
      id: i + 6,
      type: "short",
      question: generated.question,
      keywords: generated.keywords,
      correctAnswer: generated.keywords.join(", "),
      domain: domains[i % domains.length] || primaryDomain,
    });
  }

  return questions;
}

export function gradeQuiz(
  questions: QuizQuestion[],
  answers: Record<number, string>
): { score: number; total: number; results: { questionId: number; correct: boolean }[]; feedback: string[]; weakestDomains: SkillDomain[] } {
  const results: { questionId: number; correct: boolean }[] = [];
  const feedback: string[] = [];
  const domainScores: Record<string, { correct: number; total: number }> = {};

  for (const q of questions) {
    const answer = answers[q.id] || "";
    let correct = false;

    if (!domainScores[q.domain]) {
      domainScores[q.domain] = { correct: 0, total: 0 };
    }
    domainScores[q.domain].total++;

    if (q.type === "mc") {
      correct = answer.trim() === q.correctAnswer.trim();
      if (!correct) {
        feedback.push(`Q${q.id}: Review the concept — the correct answer was "${q.correctAnswer}"`);
      }
    } else {
      // Short answer: keyword matching
      const lowerAnswer = answer.toLowerCase();
      const matchedKeywords = (q.keywords || []).filter((k) => lowerAnswer.includes(k));
      correct = matchedKeywords.length >= Math.max(1, Math.floor((q.keywords || []).length * 0.3));
      if (!correct) {
        feedback.push(`Q${q.id}: Your answer could be strengthened by addressing: ${(q.keywords || []).slice(0, 3).join(", ")}`);
      }
    }

    if (correct) {
      domainScores[q.domain].correct++;
    }
    results.push({ questionId: q.id, correct });
  }

  const score = results.filter((r) => r.correct).length;
  const total = questions.length;

  // Find weakest domains
  const domainRatios = Object.entries(domainScores).map(([domain, { correct: c, total: t }]) => ({
    domain: domain as SkillDomain,
    ratio: t > 0 ? c / t : 0,
  }));
  domainRatios.sort((a, b) => a.ratio - b.ratio);
  const weakestDomains = domainRatios.slice(0, 2).map((d) => d.domain);

  return { score, total, results, feedback, weakestDomains };
}
