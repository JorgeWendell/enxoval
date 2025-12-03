"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { roomLinenConfigTable, linenTypesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getRoomLinenConfig = actionClient
  .schema(require("./schema").getRoomLinenConfigSchema)
  .action(async ({ parsedInput }) => {
    const config = await db
      .select({
        id: roomLinenConfigTable.id,
        roomType: roomLinenConfigTable.roomType,
        linenTypeId: roomLinenConfigTable.linenTypeId,
        linenTypeName: linenTypesTable.name,
        quantity: roomLinenConfigTable.quantity,
      })
      .from(roomLinenConfigTable)
      .innerJoin(
        linenTypesTable,
        eq(roomLinenConfigTable.linenTypeId, linenTypesTable.id)
      )
      .where(eq(roomLinenConfigTable.roomType, parsedInput.roomType))
      .orderBy(linenTypesTable.name);

    return { data: config };
  });

