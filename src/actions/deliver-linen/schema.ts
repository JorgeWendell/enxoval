import z from "zod";

export const deliverLinenSchema = z.object({
  roomId: z.string().min(1),
  laundryIds: z.array(z.string().min(1)).min(1, {
    message: "Selecione pelo menos um item para entregar",
  }),
  notes: z.string().optional(),
});

