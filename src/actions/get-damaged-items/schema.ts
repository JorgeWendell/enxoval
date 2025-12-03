import z from "zod";

export const getDamagedItemsSchema = z.object({
  search: z.string().optional(),
  linenTypeId: z.string().optional(),
});

