import z from "zod";

export const getRoomLinenConfigSchema = z.object({
  roomType: z.enum(["single", "double", "triple", "suite", "master"]),
});

