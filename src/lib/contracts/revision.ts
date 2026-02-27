import { z } from 'zod';

export const RevisionResultSchema = z.object({
  previousScore: z.number().int().min(0).max(100),
  newScore: z.number().int().min(0).max(100),
  deltaScore: z.number().int().min(-100).max(100),
  improvements: z.array(z.string().min(1)).min(0).max(10),
  remainingIssues: z.array(z.string().min(1)).min(0).max(10),
  nextFocus: z.array(z.string().min(1)).min(1).max(5),
  masteryDecision: z.enum(['not_yet', 'mastered']),
});

export type RevisionResult = z.infer<typeof RevisionResultSchema>;
