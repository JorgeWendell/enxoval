import z from "zod";

export const updateChecklistItemSchema = z.object({
  itemId: z.string().min(1),
  status: z.enum(["presente", "ausente", "danificado", "substituido", "sujo"]),
  conditionNotes: z.string().optional(),
  replacementItemId: z.string().optional(),
});

