"use server";

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import {
  cleaningChecklistItemsTable,
  roomLinenConfigTable,
  roomsTable,
  linenItemsTable,
  linenTypesTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const initializeChecklistItems = actionClient
  .schema(require("./schema").initializeChecklistItemsSchema)
  .action(async ({ parsedInput }) => {
    const room = await db
      .select()
      .from(roomsTable)
      .where(eq(roomsTable.id, parsedInput.roomId))
      .limit(1);

    if (room.length === 0) {
      return { error: "Quarto não encontrado" };
    }

    const roomConfig = await db
      .select()
      .from(roomLinenConfigTable)
      .where(eq(roomLinenConfigTable.roomType, room[0].type));

    const currentItems = await db
      .select({
        id: linenItemsTable.id,
        linenTypeId: linenItemsTable.linenTypeId,
        status: linenItemsTable.status,
        roomId: linenItemsTable.roomId,
      })
      .from(linenItemsTable)
      .where(eq(linenItemsTable.roomId, parsedInput.roomId))
      .orderBy(linenItemsTable.createdAt);

    type ChecklistItemInsert = {
      id: string;
      checklistId: string;
      linenTypeId: string;
      linenItemId: string | null;
      status: "presente" | "ausente" | "danificado" | "substituido" | "sujo";
    };

    const itemsToCreate: ChecklistItemInsert[] = [];

    const existingChecklistItems = await db
      .select({
        linenItemId: cleaningChecklistItemsTable.linenItemId,
      })
      .from(cleaningChecklistItemsTable)
      .where(eq(cleaningChecklistItemsTable.checklistId, parsedInput.checklistId));

    const existingItemIds = new Set(
      existingChecklistItems
        .map((item) => item.linenItemId)
        .filter((id): id is string => id !== null)
    );

    const existingChecklistItemsByType = await db
      .select({
        linenTypeId: cleaningChecklistItemsTable.linenTypeId,
        linenItemId: cleaningChecklistItemsTable.linenItemId,
      })
      .from(cleaningChecklistItemsTable)
      .where(eq(cleaningChecklistItemsTable.checklistId, parsedInput.checklistId));

    const existingItemsByType = existingChecklistItemsByType.reduce(
      (acc, item) => {
        if (!acc[item.linenTypeId]) {
          acc[item.linenTypeId] = 0;
        }
        if (item.linenItemId) {
          acc[item.linenTypeId]++;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    for (const item of currentItems) {
      if (!existingItemIds.has(item.id)) {
        const itemStatus: "presente" | "danificado" = item.status === "danificado" ? "danificado" : "presente";
        itemsToCreate.push({
          id: randomUUID(),
          checklistId: parsedInput.checklistId,
          linenTypeId: item.linenTypeId,
          linenItemId: item.id,
          status: itemStatus,
        });
      }
    }

    if (roomConfig.length > 0) {
      const itemsByType = itemsToCreate.reduce(
        (acc, item) => {
          if (!acc[item.linenTypeId]) {
            acc[item.linenTypeId] = 0;
          }
          if (item.linenItemId) {
            acc[item.linenTypeId]++;
          }
          return acc;
        },
        {} as Record<string, number>
      );

      for (const config of roomConfig) {
        const itemsInChecklist = (existingItemsByType[config.linenTypeId] || 0) +
          (itemsByType[config.linenTypeId] || 0);
        
        const missingItems = Math.max(0, config.quantity - itemsInChecklist);

        for (let i = 0; i < missingItems; i++) {
          itemsToCreate.push({
            id: randomUUID(),
            checklistId: parsedInput.checklistId,
            linenTypeId: config.linenTypeId,
            linenItemId: null,
            status: "ausente",
          });
        }
      }
    }

    if (itemsToCreate.length > 0) {
      await db.insert(cleaningChecklistItemsTable).values(itemsToCreate);
    }

    return { 
      success: true, 
      itemsCreated: itemsToCreate.length,
      currentItemsCount: currentItems.length,
      existingItemsCount: existingItemIds.size,
    };
  });

