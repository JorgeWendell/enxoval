import z from "zod";

export const registerWashSchema = z.object({
  laundryIds: z.array(z.string().min(1)).min(1, {
    message: "Selecione pelo menos um item para registrar lavagem",
  }),
  notes: z.string().optional(),
});

