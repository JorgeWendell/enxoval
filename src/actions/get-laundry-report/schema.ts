import z from "zod";

export const getLaundryReportSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

