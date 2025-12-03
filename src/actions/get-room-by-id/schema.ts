import z from "zod";

export const getRoomByIdSchema = z.object({
  id: z.string().min(1),
});

