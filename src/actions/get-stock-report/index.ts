"use server";

import { eq, sql, and } from "drizzle-orm";

import { db } from "@/db/index";
import {
  linenTypesTable,
  linenItemsTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getStockReport = actionClient
  .schema(require("./schema").getStockReportSchema)
  .action(async ({ parsedInput }) => {
    const conditions = [];

    if (parsedInput?.category) {
      conditions.push(eq(linenTypesTable.category, parsedInput.category));
    }

    const report = await db
      .select({
        linenTypeId: linenTypesTable.id,
        linenTypeName: linenTypesTable.name,
        category: linenTypesTable.category,
        unit: linenTypesTable.unit,
        minStock: linenTypesTable.minStock,
        total: sql<number>`count(${linenItemsTable.id})`,
        limpos: sql<number>`count(*) filter (where ${linenItemsTable.status} = 'limpo')`,
        sujos: sql<number>`count(*) filter (where ${linenItemsTable.status} = 'sujo')`,
        emLavagem: sql<number>`count(*) filter (where ${linenItemsTable.status} = 'em_lavagem')`,
        estoque: sql<number>`count(*) filter (where ${linenItemsTable.status} = 'estoque')`,
        danificados: sql<number>`count(*) filter (where ${linenItemsTable.status} = 'danificado')`,
        descartados: sql<number>`count(*) filter (where ${linenItemsTable.status} = 'descartado')`,
      })
      .from(linenTypesTable)
      .leftJoin(
        linenItemsTable,
        eq(linenTypesTable.id, linenItemsTable.linenTypeId)
      )
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(
        linenTypesTable.id,
        linenTypesTable.name,
        linenTypesTable.category,
        linenTypesTable.unit,
        linenTypesTable.minStock
      )
      .orderBy(linenTypesTable.name);

    return { data: report };
  });

