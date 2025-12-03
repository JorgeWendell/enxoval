import z from "zod";

export const startCleaningChecklistSchema = z.object({
  roomId: z.string().min(1),
});

