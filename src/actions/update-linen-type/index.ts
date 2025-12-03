"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { linenTypesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const updateLinenType = actionClient
  .schema(require("./schema").updateLinenTypeSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...updateData } = parsedInput;

    const existingType = await db
      .select()
      .from(linenTypesTable)
      .where(eq(linenTypesTable.id, id))
      .limit(1);

    if (existingType.length === 0) {
      return { error: "Tipo de enxoval não encontrado" };
    }

    const updatedType = await db
      .update(linenTypesTable)
      .set({
        ...updateData,
        imageUrl: updateData.imageUrl === "" ? null : updateData.imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(linenTypesTable.id, id))
      .returning();

    return { data: updatedType[0] };
  });

