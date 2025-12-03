"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import {
  roomCleaningChecklistsTable,
  cleaningChecklistItemsTable,
  linenItemsTable,
  linenTypesTable,
  roomsTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getCleaningChecklist = actionClient
  .schema(require("./schema").getCleaningChecklistSchema)
  .action(async ({ parsedInput }) => {
    const checklist = await db
      .select({
        id: roomCleaningChecklistsTable.id,
        roomId: roomCleaningChecklistsTable.roomId,
        userId: roomCleaningChecklistsTable.userId,
        status: roomCleaningChecklistsTable.status,
        startedAt: roomCleaningChecklistsTable.startedAt,
        completedAt: roomCleaningChecklistsTable.completedAt,
        notes: roomCleaningChecklistsTable.notes,
        roomNumber: roomsTable.number,
      })
      .from(roomCleaningChecklistsTable)
      .innerJoin(roomsTable, eq(roomCleaningChecklistsTable.roomId, roomsTable.id))
      .where(eq(roomCleaningChecklistsTable.id, parsedInput.checklistId))
      .limit(1);

    if (checklist.length === 0) {
      return { error: "Checklist não encontrado" };
    }

    const items = await db
      .select({
        id: cleaningChecklistItemsTable.id,
        linenItemId: cleaningChecklistItemsTable.linenItemId,
        linenTypeId: cleaningChecklistItemsTable.linenTypeId,
        linenTypeName: linenTypesTable.name,
        status: cleaningChecklistItemsTable.status,
        conditionNotes: cleaningChecklistItemsTable.conditionNotes,
        replacementItemId: cleaningChecklistItemsTable.replacementItemId,
        currentItemDescription: linenItemsTable.description,
      })
      .from(cleaningChecklistItemsTable)
      .innerJoin(
        linenTypesTable,
        eq(cleaningChecklistItemsTable.linenTypeId, linenTypesTable.id)
      )
      .leftJoin(
        linenItemsTable,
        eq(cleaningChecklistItemsTable.linenItemId, linenItemsTable.id)
      )
      .where(
        eq(cleaningChecklistItemsTable.checklistId, parsedInput.checklistId)
      );

    const currentRoomItems = await db
      .select()
      .from(linenItemsTable)
      .where(eq(linenItemsTable.roomId, checklist[0].roomId));

    return {
      data: {
        checklist: checklist[0],
        items,
        currentRoomItems,
      },
    };
  });

