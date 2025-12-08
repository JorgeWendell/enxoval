"use server";

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { linenItemsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const createLinenItem = actionClient
  .schema(require("./schema").createLinenItemSchema)
  .action(async ({ parsedInput }) => {
    const newItem = await db
      .insert(linenItemsTable)
      .values({
        id: randomUUID(),
        linenTypeId: parsedInput.linenTypeId,
        roomId: parsedInput.roomId || null,
        description: parsedInput.description || null,
        purchaseDate: parsedInput.purchaseDate || null,
        cnpjFornecedor: parsedInput.cnpjFornecedor || null,
        nfe: parsedInput.nfe || null,
        status: parsedInput.roomId ? "limpo" : "estoque",
        condition: "excelente",
      })
      .returning();

    return { data: newItem[0] };
  });
