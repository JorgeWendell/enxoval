import z from "zod";

export const collectLinenSchema = z.object({
  roomId: z.string().min(1),
  linenItemIds: z.array(z.string().min(1)).min(1, {
    message: "Selecione pelo menos um item para coletar",
  }),
  notes: z.string().optional(),
});

