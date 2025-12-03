"use server";

import { randomUUID } from "crypto";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { db } from "@/db/index";
import {
  linenItemsTable,
  linenMovementsTable,
  laundryTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const collectLinen = actionClient
  .schema(require("./schema").collectLinenSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Não autorizado" };
    }

    const items = await db
      .select()
      .from(linenItemsTable)
      .where(
        inArray(linenItemsTable.id, parsedInput.linenItemIds)
      );

    if (items.length === 0) {
      return { error: "Nenhum item encontrado" };
    }

    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(linenItemsTable)
          .set({
            status: "em_lavagem",
            roomId: null,
            updatedAt: new Date(),
          })
          .where(eq(linenItemsTable.id, item.id));

        await tx.insert(laundryTable).values({
          id: randomUUID(),
          linenItemId: item.id,
          status: "coletado",
          collectedBy: session.user.id,
          notes: parsedInput.notes || null,
        });

        await tx.insert(linenMovementsTable).values({
          id: randomUUID(),
          linenItemId: item.id,
          fromRoomId: parsedInput.roomId,
          toRoomId: null,
          movementType: "lavagem",
          userId: session.user.id,
          notes: parsedInput.notes || null,
        });
      }
    });

    return { success: true, collected: items.length };
  });

