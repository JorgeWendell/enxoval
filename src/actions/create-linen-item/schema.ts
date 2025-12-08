import z from "zod";

export const createLinenItemSchema = z.object({
  linenTypeId: z.string().min(1),
  roomId: z.string().optional(),
  description: z.string().optional(),
  purchaseDate: z.date().optional(),
  cnpjFornecedor: z.string().optional(),
  nfe: z.string().optional(),
});
