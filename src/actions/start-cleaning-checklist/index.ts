"use server";

import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { db } from "@/db/index";
import {
  roomCleaningChecklistsTable,
  roomsTable,
  roomLinenConfigTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const startCleaningChecklist = actionClient
  .schema(require("./schema").startCleaningChecklistSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Não autorizado" };
    }

    const room = await db
      .select()
      .from(roomsTable)
      .where(eq(roomsTable.id, parsedInput.roomId))
      .limit(1);

    if (room.length === 0) {
      return { error: "Quarto não encontrado" };
    }

    const existingChecklist = await db
      .select()
      .from(roomCleaningChecklistsTable)
      .where(
        and(
          eq(roomCleaningChecklistsTable.roomId, parsedInput.roomId),
          eq(roomCleaningChecklistsTable.status, "em_andamento")
        )
      )
      .limit(1);

    if (existingChecklist.length > 0) {
      const roomConfig = await db
        .select()
        .from(roomLinenConfigTable)
        .where(eq(roomLinenConfigTable.roomType, room[0].type));

      return {
        data: {
          checklist: existingChecklist[0],
          roomConfig,
        },
      };
    }

    const checklist = await db
      .insert(roomCleaningChecklistsTable)
      .values({
        id: randomUUID(),
        roomId: parsedInput.roomId,
        userId: session.user.id,
        status: "em_andamento",
      })
      .returning();

    const roomConfig = await db
      .select()
      .from(roomLinenConfigTable)
      .where(eq(roomLinenConfigTable.roomType, room[0].type));

    return {
      data: {
        checklist: checklist[0],
        roomConfig,
      },
    };
  });

