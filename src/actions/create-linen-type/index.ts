"use server";

import { randomUUID } from "crypto";

import { db } from "@/db/index";
import { linenTypesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const createLinenType = actionClient
  .schema(require("./schema").createLinenTypeSchema)
  .action(async ({ parsedInput }) => {
    const newLinenType = await db
      .insert(linenTypesTable)
      .values({
        id: randomUUID(),
        name: parsedInput.name,
        description: parsedInput.description,
        category: parsedInput.category,
        unit: parsedInput.unit || "unidade",
        minStock: parsedInput.minStock || 0,
        imageUrl: parsedInput.imageUrl || null,
      })
      .returning();

    return { data: newLinenType[0] };
  });

