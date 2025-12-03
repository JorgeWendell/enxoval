import z from "zod";

export const getLinenTypesSchema = z.object({
  category: z.enum(["cama", "banho", "mesa", "decoracao", "outros"]).optional(),
  search: z.string().optional(),
});

