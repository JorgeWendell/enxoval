import z from "zod";

export const getRoomsSchema = z.object({
  status: z.enum(["disponivel", "ocupado", "limpeza", "manutencao", "reservado"]).optional(),
  floor: z.number().optional(),
  type: z.enum(["single", "double", "triple", "suite", "master"]).optional(),
  search: z.string().optional(),
});

