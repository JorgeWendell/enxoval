import z from "zod";

export const addChecklistItemSchema = z.object({
  checklistId: z.string().min(1),
  linenTypeId: z.string().min(1),
  linenItemId: z.string().min(1),
});

