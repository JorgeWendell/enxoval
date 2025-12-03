"use server";

import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { db } from "@/db/index";
import {
  cleaningChecklistItemsTable,
  roomCleaningChecklistsTable,
  linenItemsTable,
  linenMovementsTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const addChecklistItem = actionClient
  .schema(require("./schema").addChecklistItemSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Não autorizado" };
    }

    if (!parsedInput.linenItemId) {
      return { error: "Item não especificado" };
    }

    const checklist = await db
      .select()
      .from(roomCleaningChecklistsTable)
      .where(eq(roomCleaningChecklistsTable.id, parsedInput.checklistId))
      .limit(1);

    if (checklist.length === 0) {
      return { error: "Checklist não encontrado" };
    }

    const checklistItem = await db
      .select()
      .from(cleaningChecklistItemsTable)
      .where(
        and(
          eq(cleaningChecklistItemsTable.checklistId, parsedInput.checklistId),
          eq(cleaningChecklistItemsTable.linenTypeId, parsedInput.linenTypeId),
          eq(cleaningChecklistItemsTable.status, "ausente")
        )
      )
      .limit(1);

    if (checklistItem.length === 0) {
      return { error: "Item do checklist não encontrado" };
    }

    await db.transaction(async (tx) => {
      await tx
        .update(cleaningChecklistItemsTable)
        .set({
          linenItemId: parsedInput.linenItemId,
          status: "presente",
          updatedAt: new Date(),
        })
        .where(eq(cleaningChecklistItemsTable.id, checklistItem[0].id));

      await tx
        .update(linenItemsTable)
        .set({
          roomId: checklist[0].roomId,
          status: "limpo",
          updatedAt: new Date(),
        })
        .where(eq(linenItemsTable.id, parsedInput.linenItemId));

      await tx.insert(linenMovementsTable).values({
        id: randomUUID(),
        linenItemId: parsedInput.linenItemId,
        fromRoomId: null,
        toRoomId: checklist[0].roomId,
        movementType: "entrada",
        userId: session.user.id,
        notes: "Adicionado durante limpeza",
      });
    });

    return { success: true };
  });

