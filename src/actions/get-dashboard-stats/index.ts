"use server";

import { eq, count, sql } from "drizzle-orm";

import { db } from "@/db/index";
import {
  roomsTable,
  linenItemsTable,
  linenTypesTable,
  laundryTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getDashboardStats = actionClient
  .schema(require("./schema").getDashboardStatsSchema)
  .action(async () => {
    const [roomsStats] = await db
      .select({
        total: count(),
        ocupados: sql<number>`count(*) filter (where ${roomsTable.status} = 'ocupado')`,
        limpeza: sql<number>`count(*) filter (where ${roomsTable.status} = 'limpeza')`,
        disponiveis: sql<number>`count(*) filter (where ${roomsTable.status} = 'disponivel')`,
      })
      .from(roomsTable);

    const [linenStats] = await db
      .select({
        total: count(),
        emLavagem: sql<number>`count(*) filter (where ${linenItemsTable.status} = 'em_lavagem')`,
        sujos: sql<number>`count(*) filter (where ${linenItemsTable.status} = 'sujo')`,
        limpos: sql<number>`count(*) filter (where ${linenItemsTable.status} = 'limpo')`,
        danificados: sql<number>`count(*) filter (where ${linenItemsTable.status} = 'danificado')`,
      })
      .from(linenItemsTable);

    const [laundryStats] = await db
      .select({
        coletados: sql<number>`count(*) filter (where ${laundryTable.status} = 'coletado')`,
        emLavagem: sql<number>`count(*) filter (where ${laundryTable.status} = 'em_lavagem')`,
        lavados: sql<number>`count(*) filter (where ${laundryTable.status} = 'lavado')`,
      })
      .from(laundryTable);

    const lowStockTypes = await db
      .select({
        id: linenTypesTable.id,
        name: linenTypesTable.name,
        minStock: linenTypesTable.minStock,
        currentStock: sql<number>`count(${linenItemsTable.id}) filter (where ${linenItemsTable.status} = 'estoque' or ${linenItemsTable.status} = 'limpo')`,
      })
      .from(linenTypesTable)
      .leftJoin(
        linenItemsTable,
        eq(linenTypesTable.id, linenItemsTable.linenTypeId)
      )
      .groupBy(linenTypesTable.id, linenTypesTable.name, linenTypesTable.minStock)
      .having(
        sql`count(${linenItemsTable.id}) filter (where ${linenItemsTable.status} = 'estoque' or ${linenItemsTable.status} = 'limpo') < ${linenTypesTable.minStock}`
      );

    return {
      data: {
        rooms: roomsStats,
        linen: linenStats,
        laundry: laundryStats,
        lowStock: lowStockTypes,
      },
    };
  });

