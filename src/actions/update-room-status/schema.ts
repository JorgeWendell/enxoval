import z from "zod";

export const updateRoomStatusSchema = z.object({
  roomId: z.string().min(1),
  status: z.enum(["disponivel", "ocupado", "limpeza", "manutencao", "reservado"]),
});

