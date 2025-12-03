"use server";

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { db } from "@/db/index";
import {
  linenItemsTable,
  linenMovementsTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const moveLinenItem = actionClient
  .schema(require("./schema").moveLinenItemSchema)
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
      .where(eq(linenItemsTable.id, parsedInput.linenItemId))
      .limit(1);

    if (item.length === 0) {
      return { error: "Item não encontrado" };
    }

    const fromRoomId = item[0].roomId;

    let newStatus = item[0].status;
    if (parsedInput.movementType === "entrada" && parsedInput.toRoomId) {
      newStatus = "limpo";
    } else if (parsedInput.movementType === "saida") {
      newStatus = "sujo";
    } else if (parsedInput.movementType === "lavagem") {
      newStatus = "em_lavagem";
    } else if (parsedInput.movementType === "descarte") {
      newStatus = "descartado";
    }

    await db.transaction(async (tx) => {
      await tx
        .update(linenItemsTable)
        .set({
          roomId: parsedInput.toRoomId || null,
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(linenItemsTable.id, parsedInput.linenItemId));

      await tx.insert(linenMovementsTable).values({
        id: randomUUID(),
        linenItemId: parsedInput.linenItemId,
        fromRoomId: fromRoomId || null,
        toRoomId: parsedInput.toRoomId || null,
        movementType: parsedInput.movementType,
        userId: session.user.id,
        notes: parsedInput.notes || null,
      });
    });

    return { success: true };
  });

