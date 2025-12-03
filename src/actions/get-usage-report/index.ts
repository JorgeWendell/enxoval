"use server";

import { eq, sql, and } from "drizzle-orm";

import { db } from "@/db/index";
import {
  roomsTable,
  linenItemsTable,
  linenTypesTable,
  linenMovementsTable,
  laundryTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getUsageReport = actionClient
  .schema(require("./schema").getUsageReportSchema)
  .action(async ({ parsedInput }) => {
    const conditions = [];

    if (parsedInput?.roomId) {
      conditions.push(eq(linenItemsTable.roomId, parsedInput.roomId));
    }

    if (parsedInput?.linenTypeId) {
      conditions.push(eq(linenItemsTable.linenTypeId, parsedInput.linenTypeId));
    }

    const itemsInRooms = await db
      .select({
        roomId: roomsTable.id,
        roomNumber: roomsTable.number,
        totalItems: sql<number>`count(${linenItemsTable.id}) filter (where ${linenItemsTable.status} = 'limpo')`,
      })
      .from(roomsTable)
      .leftJoin(linenItemsTable, eq(roomsTable.id, linenItemsTable.roomId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(roomsTable.id, roomsTable.number)
      .orderBy(roomsTable.number);

    const [washCycleStats] = await db
      .select({
        avgCollectionToWash: sql<number>`
          avg(extract(epoch from (${laundryTable.washedAt} - ${laundryTable.collectedAt})) / 3600)
        `,
        avgWashToDelivery: sql<number>`
          avg(extract(epoch from (${laundryTable.deliveredAt} - ${laundryTable.washedAt})) / 3600)
        `,
        avgTotalCycle: sql<number>`
          avg(extract(epoch from (${laundryTable.deliveredAt} - ${laundryTable.collectedAt})) / 3600)
        `,
        totalCycles: sql<number>`count(*) filter (where ${laundryTable.deliveredAt} is not null)`,
      })
      .from(laundryTable)
      .where(
        and(
          eq(laundryTable.status, "entregue"),
          sql`${laundryTable.deliveredAt} is not null`
        )!
      );

    const movementsByType = await db
      .select({
        movementType: linenMovementsTable.movementType,
        count: sql<number>`count(*)`,
      })
      .from(linenMovementsTable)
      .groupBy(linenMovementsTable.movementType);

    return {
      data: {
        itemsInRooms,
        washCycleStats: washCycleStats || {
          avgCollectionToWash: 0,
          avgWashToDelivery: 0,
          avgTotalCycle: 0,
          totalCycles: 0,
        },
        movementsByType,
      },
    };
  });

