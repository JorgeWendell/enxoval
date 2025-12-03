import z from "zod";

export const discardItemSchema = z.object({
  itemId: z.string().min(1),
  notes: z.string().optional(),
});

