"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { roomsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const updateRoom = actionClient
  .schema(require("./schema").updateRoomSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...updateData } = parsedInput;

    const existingRoom = await db
      .select()
      .from(roomsTable)
      .where(eq(roomsTable.id, id))
      .limit(1);

    if (existingRoom.length === 0) {
      return { error: "Quarto não encontrado" };
    }

    if (updateData.number && updateData.number !== existingRoom[0].number) {
      const roomWithNumber = await db
        .select()
        .from(roomsTable)
        .where(eq(roomsTable.number, updateData.number))
        .limit(1);

      if (roomWithNumber.length > 0) {
        return { error: "Já existe um quarto com este número" };
      }
    }

    const updatedRoom = await db
      .update(roomsTable)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(roomsTable.id, id))
      .returning();

    return { data: updatedRoom[0] };
  });

