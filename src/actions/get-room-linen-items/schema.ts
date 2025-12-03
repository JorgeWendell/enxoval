import z from "zod";

export const getRoomLinenItemsSchema = z.object({
  roomId: z.string().min(1),
});

