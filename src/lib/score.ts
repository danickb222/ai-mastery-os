import { SKILL_DOMAINS, type SkillDomain, type AppState } from "./types";
import { curriculum } from "@/data/curriculum";

export function computeSkillBars(state: AppState): Record<SkillDomain, number> {
  const scores: Record<SkillDomain, number> = {} as Record<SkillDomain, number>;
  const counts: Record<SkillDomain, number> = {} as Record<SkillDomain, number>;

  for (const d of SKILL_DOMAINS) {
    scores[d] = 0;
    counts[d] = 0;
  }

  // Factor in completed sessions
  for (const [, session] of Object.entries(state.sessionsByDate)) {
    const week = curriculum.find((w) => w.id === session.weekId);
    if (!week) continue;
    const completionFactor =
      (session.completedLearn ? 0.33 : 0) +
      (session.completedPractice ? 0.34 : 0) +
      (session.completedReflect ? 0.33 : 0);
    for (const [domain, weight] of Object.entries(week.skills)) {
      const d = domain as SkillDomain;
      scores[d] += completionFactor * (weight as number);
      counts[d] += 1;
    }
  }

  // Factor in quiz attempts
  for (const attempt of state.quizAttempts) {
    const week = curriculum.find((w) => w.id === attempt.weekId);
    if (!week) continue;
    const quizFactor = attempt.total > 0 ? attempt.score / attempt.total : 0;
    for (const [domain, weight] of Object.entries(week.skills)) {
      const d = domain as SkillDomain;
      scores[d] += quizFactor * (weight as number);
      counts[d] += 1;
    }
  }

  // Normalize to 0-100
  const result: Record<SkillDomain, number> = {} as Record<SkillDomain, number>;
  for (const d of SKILL_DOMAINS) {
    if (counts[d] === 0) {
      result[d] = 0;
    } else {
      result[d] = Math.min(100, Math.round((scores[d] / counts[d]) * 100));
    }
  }
  return result;
}

export function weekCompletionPercent(state: AppState, weekId: number): number {
  let completed = 0;
  let total = 0;
  for (const [, session] of Object.entries(state.sessionsByDate)) {
    if (session.weekId !== weekId) continue;
    total += 3;
    if (session.completedLearn) completed++;
    if (session.completedPractice) completed++;
    if (session.completedReflect) completed++;
  }
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}
