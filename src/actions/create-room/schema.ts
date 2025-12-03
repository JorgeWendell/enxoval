import z from "zod";

export const createRoomSchema = z.object({
  number: z.string().min(1),
  floor: z.number().int().positive(),
  block: z.string().min(1),
  type: z.enum(["single", "double", "triple", "suite", "master"]),
  capacity: z.number().int().positive(),
  description: z.string().optional(),
});

