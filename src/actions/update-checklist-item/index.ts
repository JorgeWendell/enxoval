"use server";

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { db } from "@/db/index";
import {
  cleaningChecklistItemsTable,
  roomCleaningChecklistsTable,
  linenItemsTable,
  linenMovementsTable,
  laundryTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const updateChecklistItem = actionClient
  .schema(require("./schema").updateChecklistItemSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Não autorizado" };
    }

    const checklistItem = await db
      .select()
      .from(cleaningChecklistItemsTable)
      .where(eq(cleaningChecklistItemsTable.id, parsedInput.itemId))
      .limit(1);

    if (checklistItem.length === 0) {
      return { error: "Item do checklist não encontrado" };
    }

    const item = checklistItem[0];

    const checklist = await db
      .select()
      .from(roomCleaningChecklistsTable)
      .where(eq(roomCleaningChecklistsTable.id, item.checklistId))
      .limit(1);

    if (checklist.length === 0) {
      return { error: "Checklist não encontrado" };
    }

    await db.transaction(async (tx) => {
      if (parsedInput.status === "substituido" && parsedInput.replacementItemId) {
        if (item.linenItemId) {
          await tx
            .update(linenItemsTable)
            .set({
              status: "danificado",
              roomId: null,
              updatedAt: new Date(),
            })
            .where(eq(linenItemsTable.id, item.linenItemId));

          await tx.insert(linenMovementsTable).values({
            id: randomUUID(),
            linenItemId: item.linenItemId,
            fromRoomId: checklist[0].roomId,
            toRoomId: null,
            movementType: "descarte",
            userId: session.user.id,
            notes: "Item danificado durante limpeza",
          });
        }

        await tx
          .update(linenItemsTable)
          .set({
            roomId: checklist[0].roomId,
            status: "limpo",
            updatedAt: new Date(),
          })
          .where(eq(linenItemsTable.id, parsedInput.replacementItemId));

        await tx.insert(linenMovementsTable).values({
          id: randomUUID(),
          linenItemId: parsedInput.replacementItemId,
          fromRoomId: null,
          toRoomId: checklist[0].roomId,
          movementType: "entrada",
          userId: session.user.id,
          notes: "Substituição durante limpeza",
        });
      } else if (parsedInput.status === "ausente" && item.linenItemId) {
        await tx
          .update(linenItemsTable)
          .set({
            roomId: null,
            status: "sujo",
            updatedAt: new Date(),
          })
          .where(eq(linenItemsTable.id, item.linenItemId));
      } else if (parsedInput.status === "danificado" && item.linenItemId) {
        await tx
          .update(linenItemsTable)
          .set({
            status: "danificado",
            updatedAt: new Date(),
          })
          .where(eq(linenItemsTable.id, item.linenItemId));
      } else if (parsedInput.status === "sujo" && item.linenItemId) {
        await tx
          .update(linenItemsTable)
          .set({
            status: "em_lavagem",
            roomId: null,
            updatedAt: new Date(),
          })
          .where(eq(linenItemsTable.id, item.linenItemId));

        const { laundryTable } = require("@/db/schema");
        await tx.insert(laundryTable).values({
          id: randomUUID(),
          linenItemId: item.linenItemId,
          status: "coletado",
          collectedBy: session.user.id,
          notes: parsedInput.conditionNotes || "Item marcado como sujo durante limpeza",
        });

        await tx.insert(linenMovementsTable).values({
          id: randomUUID(),
          linenItemId: item.linenItemId,
          fromRoomId: checklist[0].roomId,
          toRoomId: null,
          movementType: "lavagem",
          userId: session.user.id,
          notes: parsedInput.conditionNotes || "Item marcado como sujo durante limpeza",
        });
      }

      await tx
        .update(cleaningChecklistItemsTable)
        .set({
          status: parsedInput.status,
          conditionNotes: parsedInput.conditionNotes || null,
          replacementItemId: parsedInput.replacementItemId || null,
          linenItemId:
            parsedInput.status === "substituido" && parsedInput.replacementItemId
              ? parsedInput.replacementItemId
              : item.linenItemId,
          updatedAt: new Date(),
        })
        .where(eq(cleaningChecklistItemsTable.id, parsedInput.itemId));
    });

    return { success: true };
  });

