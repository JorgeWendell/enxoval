import z from "zod";

export const getLaundryItemsSchema = z.object({
  status: z.enum(["coletado", "em_lavagem", "lavado", "entregue"]).optional(),
});

