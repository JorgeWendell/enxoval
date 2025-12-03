"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { roomsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const updateRoomStatus = actionClient
  .schema(require("./schema").updateRoomStatusSchema)
  .action(async ({ parsedInput }) => {
    const updatedRoom = await db
      .update(roomsTable)
      .set({
        status: parsedInput.status,
        updatedAt: new Date(),
      })
      .where(eq(roomsTable.id, parsedInput.roomId))
      .returning();

    if (updatedRoom.length === 0) {
      return { error: "Quarto não encontrado" };
    }

    return { data: updatedRoom[0] };
  });

