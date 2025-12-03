"use server";

import { eq, inArray, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { db } from "@/db/index";
import { laundryTable, linenItemsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const registerWash = actionClient
  .schema(require("./schema").registerWashSchema)
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
          eq(laundryTable.status, "coletado")
        )
      );

    if (laundryItems.length === 0) {
      return { error: "Nenhum item coletado encontrado" };
    }

    await db.transaction(async (tx) => {
      for (const laundry of laundryItems) {
        await tx
          .update(laundryTable)
          .set({
            status: "lavado",
            washedAt: new Date(),
            washedBy: session.user.id,
            notes: parsedInput.notes || laundry.notes,
            updatedAt: new Date(),
          })
          .where(eq(laundryTable.id, laundry.id));

        await tx
          .update(linenItemsTable)
          .set({
            status: "limpo",
            lastWashDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(linenItemsTable.id, laundry.linenItemId));
      }
    });

    return { success: true, washed: laundryItems.length };
  });

