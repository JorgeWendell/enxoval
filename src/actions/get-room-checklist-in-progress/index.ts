"use server";

import { eq, and } from "drizzle-orm";

import { db } from "@/db/index";
import { roomCleaningChecklistsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getRoomChecklistInProgress = actionClient
  .schema(require("./schema").getRoomChecklistInProgressSchema)
  .action(async ({ parsedInput }) => {
    const checklist = await db
      .select()
      .from(roomCleaningChecklistsTable)
      .where(
        and(
          eq(roomCleaningChecklistsTable.roomId, parsedInput.roomId),
          eq(roomCleaningChecklistsTable.status, "em_andamento")
        )
      )
      .limit(1);

    if (checklist.length === 0) {
      return { data: null };
    }

    return { data: checklist[0] };
  });

