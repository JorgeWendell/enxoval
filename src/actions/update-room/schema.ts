import z from "zod";

export const updateRoomSchema = z.object({
  id: z.string().min(1),
  number: z.string().min(1).optional(),
  floor: z.number().int().positive().optional(),
  type: z.enum(["single", "double", "triple", "suite", "master"]).optional(),
  capacity: z.number().int().positive().optional(),
  description: z.string().optional(),
  status: z
    .enum(["disponivel", "ocupado", "limpeza", "manutencao", "reservado"])
    .optional(),
});

