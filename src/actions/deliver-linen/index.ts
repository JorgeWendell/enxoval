"use server";

import { randomUUID } from "crypto";
import { eq, inArray, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { db } from "@/db/index";
import {
  linenItemsTable,
  linenMovementsTable,
  laundryTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const deliverLinen = actionClient
  .schema(require("./schema").deliverLinenSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Não autorizado" };
    }

    const laundryItems = await db
      .select()
      .from(laundryTable)
      .where(
        and(
          inArray(laundryTable.id, parsedInput.laundryIds),
          eq(laundryTable.status, "lavado")
        )
      );

    if (laundryItems.length === 0) {
      return { error: "Nenhum item lavado encontrado" };
    }

    await db.transaction(async (tx) => {
      for (const laundry of laundryItems) {
        const isToStock = parsedInput.roomId === "estoque";
        const targetRoomId = isToStock ? null : parsedInput.roomId;

        await tx
          .update(laundryTable)
          .set({
            status: "entregue",
            deliveredAt: new Date(),
            deliveredBy: session.user.id,
            notes: parsedInput.notes || laundry.notes,
            updatedAt: new Date(),
          })
          .where(eq(laundryTable.id, laundry.id));

        await tx
          .update(linenItemsTable)
          .set({
            status: isToStock ? "estoque" : "limpo",
            roomId: targetRoomId,
            updatedAt: new Date(),
          })
          .where(eq(linenItemsTable.id, laundry.linenItemId));

        await tx.insert(linenMovementsTable).values({
          id: randomUUID(),
          linenItemId: laundry.linenItemId,
          fromRoomId: null,
          toRoomId: targetRoomId,
          movementType: "entrada",
          userId: session.user.id,
          notes: parsedInput.notes || null,
        });
      }
    });

    return { success: true, delivered: laundryItems.length };
  });

