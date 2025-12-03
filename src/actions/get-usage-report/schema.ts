import z from "zod";

export const getUsageReportSchema = z.object({
  roomId: z.string().optional(),
  linenTypeId: z.string().optional(),
});

