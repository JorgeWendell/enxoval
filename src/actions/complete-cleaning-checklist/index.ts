"use server";

import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { db } from "@/db/index";
import {
  roomCleaningChecklistsTable,
  cleaningChecklistItemsTable,
  roomsTable,
  linenItemsTable,
  linenMovementsTable,
  laundryTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { randomUUID } from "crypto";

export const completeCleaningChecklist = actionClient
  .schema(require("./schema").completeCleaningChecklistSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Não autorizado" };
    }

    const checklist = await db
      .select()
      .from(roomCleaningChecklistsTable)
      .where(eq(roomCleaningChecklistsTable.id, parsedInput.checklistId))
      .limit(1);

    if (checklist.length === 0) {
      return { error: "Checklist não encontrado" };
    }

    const items = await db
      .select()
      .from(cleaningChecklistItemsTable)
      .where(
        eq(cleaningChecklistItemsTable.checklistId, parsedInput.checklistId)
      );

    const missingItems = items.filter((item) => item.status === "ausente");
    const damagedItems = items.filter((item) => item.status === "danificado");
    const dirtyItems = items.filter((item) => item.status === "sujo");

    await db.transaction(async (tx) => {
      for (const dirtyItem of dirtyItems) {
        if (dirtyItem.linenItemId) {
          const existingItem = await tx
            .select()
            .from(linenItemsTable)
            .where(eq(linenItemsTable.id, dirtyItem.linenItemId))
            .limit(1);

          if (existingItem.length > 0 && existingItem[0].roomId) {
            await tx
              .update(linenItemsTable)
              .set({
                status: "em_lavagem",
                roomId: null,
                updatedAt: new Date(),
              })
              .where(eq(linenItemsTable.id, dirtyItem.linenItemId));

            const existingLaundry = await tx
              .select()
              .from(laundryTable)
              .where(eq(laundryTable.linenItemId, dirtyItem.linenItemId))
              .limit(1);

            if (existingLaundry.length === 0) {
              await tx.insert(laundryTable).values({
                id: randomUUID(),
                linenItemId: dirtyItem.linenItemId,
                status: "coletado",
                collectedBy: session.user.id,
                notes: dirtyItem.conditionNotes || "Item coletado durante finalização da limpeza",
              });
            }

            await tx.insert(linenMovementsTable).values({
              id: randomUUID(),
              linenItemId: dirtyItem.linenItemId,
              fromRoomId: checklist[0].roomId,
              toRoomId: null,
              movementType: "lavagem",
              userId: session.user.id,
              notes: dirtyItem.conditionNotes || "Item coletado durante finalização da limpeza",
            });
          }
        }
      }

      for (const damagedItem of damagedItems) {
        if (damagedItem.linenItemId) {
          await tx
            .update(linenItemsTable)
            .set({
              roomId: null,
              status: "danificado",
              updatedAt: new Date(),
            })
            .where(eq(linenItemsTable.id, damagedItem.linenItemId));

          await tx.insert(linenMovementsTable).values({
            id: randomUUID(),
            linenItemId: damagedItem.linenItemId,
            fromRoomId: checklist[0].roomId,
            toRoomId: null,
            movementType: "descarte",
            userId: session.user.id,
            notes: damagedItem.conditionNotes || "Item danificado durante limpeza",
          });
        }
      }

      await tx
        .update(roomCleaningChecklistsTable)
        .set({
          status: "concluida",
          completedAt: new Date(),
          notes: parsedInput.notes || null,
          updatedAt: new Date(),
        })
        .where(eq(roomCleaningChecklistsTable.id, parsedInput.checklistId));

      if (missingItems.length === 0 && damagedItems.length === 0 && dirtyItems.length === 0) {
        await tx
          .update(roomsTable)
          .set({
            status: "disponivel",
            updatedAt: new Date(),
          })
          .where(eq(roomsTable.id, checklist[0].roomId));
      }
    });

    return {
      success: true,
      warnings: {
        missingItems: missingItems.length,
        damagedItems: damagedItems.length,
      },
    };
  });

