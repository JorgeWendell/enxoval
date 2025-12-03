"use server";

import { eq, sql, and, gte, lte } from "drizzle-orm";

import { db } from "@/db/index";
import {
  laundryTable,
  linenItemsTable,
  linenTypesTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getLaundryReport = actionClient
  .schema(require("./schema").getLaundryReportSchema)
  .action(async ({ parsedInput }) => {
    const conditions = [];

    if (parsedInput?.startDate) {
      conditions.push(gte(laundryTable.collectedAt, parsedInput.startDate));
    }

    if (parsedInput?.endDate) {
      conditions.push(lte(laundryTable.collectedAt, parsedInput.endDate));
    }

    const [stats] = await db
      .select({
        totalCollected: sql<number>`count(*) filter (where ${laundryTable.status} = 'coletado')`,
        totalInWash: sql<number>`count(*) filter (where ${laundryTable.status} = 'em_lavagem')`,
        totalWashed: sql<number>`count(*) filter (where ${laundryTable.status} = 'lavado')`,
        totalDelivered: sql<number>`count(*) filter (where ${laundryTable.status} = 'entregue')`,
        avgCollectionToWash: sql<number>`
          avg(extract(epoch from (${laundryTable.washedAt} - ${laundryTable.collectedAt})) / 3600)
          filter (where ${laundryTable.washedAt} is not null)
        `,
        avgWashToDelivery: sql<number>`
          avg(extract(epoch from (${laundryTable.deliveredAt} - ${laundryTable.washedAt})) / 3600)
          filter (where ${laundryTable.deliveredAt} is not null and ${laundryTable.washedAt} is not null)
        `,
        avgTotalCycle: sql<number>`
          avg(extract(epoch from (${laundryTable.deliveredAt} - ${laundryTable.collectedAt})) / 3600)
          filter (where ${laundryTable.deliveredAt} is not null)
        `,
      })
      .from(laundryTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const itemsByType = await db
      .select({
        linenTypeName: linenTypesTable.name,
        collected: sql<number>`count(*) filter (where ${laundryTable.status} = 'coletado')`,
        inWash: sql<number>`count(*) filter (where ${laundryTable.status} = 'em_lavagem')`,
        washed: sql<number>`count(*) filter (where ${laundryTable.status} = 'lavado')`,
        delivered: sql<number>`count(*) filter (where ${laundryTable.status} = 'entregue')`,
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
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(linenTypesTable.name)
      .orderBy(linenTypesTable.name);

    return {
      data: {
        stats: stats || {
          totalCollected: 0,
          totalInWash: 0,
          totalWashed: 0,
          totalDelivered: 0,
          avgCollectionToWash: 0,
          avgWashToDelivery: 0,
          avgTotalCycle: 0,
        },
        itemsByType,
      },
    };
  });

