import z from "zod";

export const getMovementsSchema = z.object({
  movementType: z
    .enum(["entrada", "saida", "lavagem", "descarte", "transferencia"])
    .optional(),
  roomId: z.string().optional(),
  limit: z.number().optional(),
});

