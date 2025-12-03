"use server";

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { roomsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const createRoom = actionClient
  .schema(require("./schema").createRoomSchema)
  .action(async ({ parsedInput }) => {
    const existingRoom = await db
      .select()
      .from(roomsTable)
      .where(eq(roomsTable.number, parsedInput.number))
      .limit(1);

    if (existingRoom.length > 0) {
      return { error: "Já existe um quarto com este número" };
    }

    const newRoom = await db
      .insert(roomsTable)
      .values({
        id: randomUUID(),
        number: parsedInput.number,
        floor: parsedInput.floor,
        block: parsedInput.block || null,
        type: parsedInput.type,
        capacity: parsedInput.capacity,
        description: parsedInput.description,
        status: "disponivel",
      })
      .returning();

    return { data: newRoom[0] };
  });

