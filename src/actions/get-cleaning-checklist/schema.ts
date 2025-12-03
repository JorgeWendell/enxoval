import z from "zod";

export const getCleaningChecklistSchema = z.object({
  checklistId: z.string().min(1),
});

