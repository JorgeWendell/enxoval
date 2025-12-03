"use server";

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { db } from "@/db/index";
import { linenItemsTable, linenMovementsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const repairItem = actionClient
  .schema(require("./schema").repairItemSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Não autorizado" };
    }

    const item = await db
      .select()
      .from(linenItemsTable)
      .where(eq(linenItemsTable.id, parsedInput.itemId))
      .limit(1);

    if (item.length === 0) {
      return { error: "Item não encontrado" };
    }

    if (item[0].status !== "danificado") {
      return { error: "Item não está danificado" };
    }

    await db.transaction(async (tx) => {
      await tx
        .update(linenItemsTable)
        .set({
          status: "estoque",
          condition: "bom",
          notes: parsedInput.notes || null,
          updatedAt: new Date(),
        })
        .where(eq(linenItemsTable.id, parsedInput.itemId));

      await tx.insert(linenMovementsTable).values({
        id: randomUUID(),
        linenItemId: parsedInput.itemId,
        fromRoomId: null,
        toRoomId: null,
        movementType: "entrada",
        userId: session.user.id,
        notes: parsedInput.notes || "Item reparado e retornado ao estoque",
      });
    });

    return { success: true };
  });

