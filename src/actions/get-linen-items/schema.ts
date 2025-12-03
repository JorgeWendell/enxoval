import z from "zod";

export const getLinenItemsSchema = z.object({
  linenTypeId: z.string().optional(),
  roomId: z.string().optional(),
  status: z
    .enum(["limpo", "sujo", "em_lavagem", "danificado", "estoque", "descartado"])
    .optional(),
  search: z.string().optional(),
});

