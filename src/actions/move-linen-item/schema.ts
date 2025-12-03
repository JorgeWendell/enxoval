import z from "zod";

export const moveLinenItemSchema = z.object({
  linenItemId: z.string().min(1),
  toRoomId: z.string().optional(),
  movementType: z.enum(["entrada", "saida", "lavagem", "descarte", "transferencia"]),
  notes: z.string().optional(),
});

