import z from "zod";

export const getRoomChecklistInProgressSchema = z.object({
  roomId: z.string().min(1),
});

