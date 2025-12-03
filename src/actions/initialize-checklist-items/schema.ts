import z from "zod";

export const initializeChecklistItemsSchema = z.object({
  checklistId: z.string().min(1),
  roomId: z.string().min(1),
});

