"use server";

import { eq, and, or, desc } from "drizzle-orm";

import { db } from "@/db/index";
import { linenMovementsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getMovements = actionClient
  .schema(require("./schema").getMovementsSchema)
  .action(async ({ parsedInput }) => {
    const conditions = [];

    if (parsedInput?.movementType) {
      conditions.push(
        eq(linenMovementsTable.movementType, parsedInput.movementType)
      );
    }

    if (parsedInput?.roomId) {
      conditions.push(
        or(
          eq(linenMovementsTable.fromRoomId, parsedInput.roomId),
          eq(linenMovementsTable.toRoomId, parsedInput.roomId)
        )!
      );
    }

    const limit = parsedInput?.limit || 50;

    const movements = await db
      .select()
      .from(linenMovementsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(linenMovementsTable.createdAt))
      .limit(limit);

    return { data: movements };
  });

