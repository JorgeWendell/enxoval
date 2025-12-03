"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { roomsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getRoomById = actionClient
  .schema(require("./schema").getRoomByIdSchema)
  .action(async ({ parsedInput }) => {
    const room = await db
      .select()
      .from(roomsTable)
      .where(eq(roomsTable.id, parsedInput.id))
      .limit(1);

    if (room.length === 0) {
      return { error: "Quarto não encontrado" };
    }

    return { data: room[0] };
  });

