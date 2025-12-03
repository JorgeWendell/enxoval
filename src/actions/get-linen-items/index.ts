"use server";

import { eq, and, or, ilike, sql } from "drizzle-orm";

import { db } from "@/db/index";
import { linenItemsTable, linenTypesTable, roomsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getLinenItems = actionClient
  .schema(require("./schema").getLinenItemsSchema)
  .action(async ({ parsedInput }) => {
    const conditions = [];

    if (parsedInput?.linenTypeId) {
      conditions.push(eq(linenItemsTable.linenTypeId, parsedInput.linenTypeId));
    }

    if (parsedInput?.roomId) {
      conditions.push(eq(linenItemsTable.roomId, parsedInput.roomId));
    }

    if (parsedInput?.status) {
      conditions.push(eq(linenItemsTable.status, parsedInput.status));
    }

    if (parsedInput?.search) {
      conditions.push(
        or(
          ilike(linenItemsTable.description || sql`''`, `%${parsedInput.search}%`),
          ilike(linenItemsTable.id, `%${parsedInput.search}%`)
        )!
      );
    }

    const linenItems = await db
      .select({
        id: linenItemsTable.id,
        linenTypeId: linenItemsTable.linenTypeId,
        linenTypeName: linenTypesTable.name,
        roomId: linenItemsTable.roomId,
        roomNumber: roomsTable.number,
        description: linenItemsTable.description,
        status: linenItemsTable.status,
        condition: linenItemsTable.condition,
        purchaseDate: linenItemsTable.purchaseDate,
        lastWashDate: linenItemsTable.lastWashDate,
        createdAt: linenItemsTable.createdAt,
        updatedAt: linenItemsTable.updatedAt,
      })
      .from(linenItemsTable)
      .innerJoin(
        linenTypesTable,
        eq(linenItemsTable.linenTypeId, linenTypesTable.id)
      )
      .leftJoin(roomsTable, eq(linenItemsTable.roomId, roomsTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(linenItemsTable.createdAt);

    return { data: linenItems };
  });

