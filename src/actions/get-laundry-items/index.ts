"use server";

import { eq, and } from "drizzle-orm";

import { db } from "@/db/index";
import {
  laundryTable,
  linenItemsTable,
  linenTypesTable,
  roomsTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getLaundryItems = actionClient
  .schema(require("./schema").getLaundryItemsSchema)
  .action(async ({ parsedInput }) => {
    const conditions = [];

    if (parsedInput?.status) {
      conditions.push(eq(laundryTable.status, parsedInput.status));
    }

    const items = await db
      .select({
        id: laundryTable.id,
        linenItemId: laundryTable.linenItemId,
        status: laundryTable.status,
        collectedAt: laundryTable.collectedAt,
        washedAt: laundryTable.washedAt,
        deliveredAt: laundryTable.deliveredAt,
        notes: laundryTable.notes,
        linenItemStatus: linenItemsTable.status,
        linenItemCondition: linenItemsTable.condition,
        linenItemDescription: linenItemsTable.description,
        linenTypeName: linenTypesTable.name,
        fromRoomNumber: roomsTable.number,
      })
      .from(laundryTable)
      .innerJoin(
        linenItemsTable,
        eq(laundryTable.linenItemId, linenItemsTable.id)
      )
      .innerJoin(
        linenTypesTable,
        eq(linenItemsTable.linenTypeId, linenTypesTable.id)
      )
      .leftJoin(roomsTable, eq(linenItemsTable.roomId, roomsTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(laundryTable.collectedAt);

    return { data: items };
  });

