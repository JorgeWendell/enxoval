import z from "zod";

export const createLinenTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(["cama", "banho", "mesa", "decoracao", "outros"]),
  unit: z.string().default("unidade"),
  minStock: z.number().int().min(0).default(0),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

