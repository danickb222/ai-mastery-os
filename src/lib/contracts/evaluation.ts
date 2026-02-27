import { z } from 'zod';

export const RubricScoreSchema = z.object({
  rubricItemId: z.string().min(1, 'Rubric item id must be non-empty'),
  score: z.number().int().min(0),
  justification: z.string().min(40, 'Justification must be at least 40 characters'),
  evidenceQuotes: z.array(z.string().min(1)).min(1).max(3),
});

export type RubricScore = z.infer<typeof RubricScoreSchema>;

export const EvaluationResultSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  rubricScores: z.array(RubricScoreSchema).min(1),
  strengths: z.array(z.string().min(1)).min(1).max(6),
  weaknesses: z.array(z.string().min(1)).min(1).max(6),
  missedConstraints: z.array(z.string().min(1)).min(0).max(20),
  riskFlags: z.array(z.string().min(1)).min(0).max(10),
  revisionInstructions: z.array(z.string().min(1)).min(1).max(10),
  improvedVersionOutline: z.string().min(60, 'Improved version outline must be at least 60 characters'),
  masteryDecision: z.enum(['not_yet', 'mastered']),
});

export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;
