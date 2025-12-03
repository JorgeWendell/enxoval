import z from "zod";

export const getStockReportSchema = z.object({
  category: z.enum(["cama", "banho", "mesa", "decoracao", "outros"]).optional(),
});

