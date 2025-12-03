import z from "zod";

export const updateLinenTypeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.enum(["cama", "banho", "mesa", "decoracao", "outros"]).optional(),
  unit: z.string().optional(),
  minStock: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

