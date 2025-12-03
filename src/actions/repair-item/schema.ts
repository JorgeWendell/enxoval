import z from "zod";

export const repairItemSchema = z.object({
  itemId: z.string().min(1),
  notes: z.string().optional(),
});

