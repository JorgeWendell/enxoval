"use server";

import { eq, sql, or } from "drizzle-orm";

import { db } from "@/db/index";
import {
  linenItemsTable,
  linenTypesTable,
  roomsTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getMaintenanceReport = actionClient
  .schema(require("./schema").getMaintenanceReportSchema)
  .action(async () => {
    const damagedItems = await db
      .select({
        id: linenItemsTable.id,
        linenTypeName: linenTypesTable.name,
        condition: linenItemsTable.condition,
        status: linenItemsTable.status,
        roomNumber: roomsTable.number,
        lastWashDate: linenItemsTable.lastWashDate,
        notes: linenItemsTable.notes,
      })
      .from(linenItemsTable)
      .innerJoin(
        linenTypesTable,
        eq(linenItemsTable.linenTypeId, linenTypesTable.id)
      )
      .leftJoin(roomsTable, eq(linenItemsTable.roomId, roomsTable.id))
      .where(
        or(
          eq(linenItemsTable.status, "danificado"),
          eq(linenItemsTable.condition, "ruim")
        )!
      )
      .orderBy(linenItemsTable.updatedAt);

    const itemsToDiscard = await db
      .select({
        id: linenItemsTable.id,
        linenTypeName: linenTypesTable.name,
        condition: linenItemsTable.condition,
        status: linenItemsTable.status,
        roomNumber: roomsTable.number,
        lastWashDate: linenItemsTable.lastWashDate,
        notes: linenItemsTable.notes,
      })
      .from(linenItemsTable)
      .innerJoin(
        linenTypesTable,
        eq(linenItemsTable.linenTypeId, linenTypesTable.id)
      )
      .leftJoin(roomsTable, eq(linenItemsTable.roomId, roomsTable.id))
      .where(eq(linenItemsTable.status, "descartado"))
      .orderBy(linenItemsTable.updatedAt);

    const [stats] = await db
      .select({
        totalDamaged: sql<number>`count(*) filter (where ${linenItemsTable.status} = 'danificado' or ${linenItemsTable.condition} = 'ruim')`,
        totalDiscarded: sql<number>`count(*) filter (where ${linenItemsTable.status} = 'descartado')`,
        totalItems: sql<number>`count(*)`,
      })
      .from(linenItemsTable);

    return {
      data: {
        damagedItems,
        itemsToDiscard,
        stats: stats || {
          totalDamaged: 0,
          totalDiscarded: 0,
          totalItems: 0,
        },
      },
    };
  });

