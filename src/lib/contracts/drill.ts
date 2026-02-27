import { z } from 'zod';

export const RubricItemSchema = z.object({
  id: z.string().min(1, 'Rubric item id must be non-empty'),
  label: z.string().min(1, 'Rubric item label must be non-empty'),
  description: z.string().min(1, 'Rubric item description must be non-empty'),
  maxPoints: z.number().int().min(1).max(10),
  failureSignals: z.array(z.string().min(1)).min(1, 'At least one failure signal required'),
  scoringSignals: z.array(z.string().min(1)).min(1, 'At least one scoring signal required'),
});

export type RubricItem = z.infer<typeof RubricItemSchema>;

export const DrillSpecSchema = z.object({
  id: z.string().min(1, 'Drill id must be non-empty'),
  domainId: z.number().int().min(1).max(12),
  domainName: z.string().min(1, 'Domain name must be non-empty'),
  tierId: z.enum(['structured-operator', 'systems-builder', 'strategic-architect']),
  skillId: z.string().min(1, 'Skill id must be non-empty'),
  skillName: z.string().min(1, 'Skill name must be non-empty'),
  title: z.string().min(1, 'Title must be non-empty'),
  scenario: z.string().min(1, 'Scenario must be non-empty'),
  task: z.string().min(1, 'Task must be non-empty'),
  deliverableFormat: z.string().min(1, 'Deliverable format must be non-empty'),
  constraints: z.array(z.string().min(1)).min(1, 'At least one constraint required'),
  rubric: z.array(RubricItemSchema).min(3).max(8),
  timeEstimateMinutes: z.number().int().min(5).max(60),
  starterInput: z.string().optional(),
}).refine(
  (data) => {
    const ids = data.rubric.map((item) => item.id);
    const uniqueIds = new Set(ids);
    return ids.length === uniqueIds.size;
  },
  {
    message: 'Rubric item ids must be unique within the drill',
    path: ['rubric'],
  }
).refine(
  (data) => {
    const totalPoints = data.rubric.reduce((sum, item) => sum + item.maxPoints, 0);
    return totalPoints === 100;
  },
  {
    message: 'Total maxPoints across all rubric items must equal 100',
    path: ['rubric'],
  }
);

export type DrillSpec = z.infer<typeof DrillSpecSchema>;
