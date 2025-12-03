"use server";

import { eq, and } from "drizzle-orm";

import { db } from "@/db/index";
import { linenItemsTable, linenTypesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getRoomLinenItems = actionClient
  .schema(require("./schema").getRoomLinenItemsSchema)
  .action(async ({ parsedInput }) => {
    const items = await db
      .select({
        id: linenItemsTable.id,
        linenTypeId: linenItemsTable.linenTypeId,
        status: linenItemsTable.status,
        condition: linenItemsTable.condition,
        description: linenItemsTable.description,
        linenTypeName: linenTypesTable.name,
      })
      .from(linenItemsTable)
      .innerJoin(
        linenTypesTable,
        eq(linenItemsTable.linenTypeId, linenTypesTable.id)
      )
      .where(
        and(
          eq(linenItemsTable.roomId, parsedInput.roomId),
          eq(linenItemsTable.status, "sujo")
        )
      );

    return { data: items };
  });

