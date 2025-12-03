import z from "zod";

export const completeCleaningChecklistSchema = z.object({
  checklistId: z.string().min(1),
  notes: z.string().optional(),
});

