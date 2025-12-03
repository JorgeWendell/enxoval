"use server";

import { eq, and, or, ilike, sql } from "drizzle-orm";

import { db } from "@/db/index";
import { roomsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getRooms = actionClient
  .schema(require("./schema").getRoomsSchema)
  .action(async ({ parsedInput }) => {
    const conditions = [];

    if (parsedInput?.status) {
      conditions.push(eq(roomsTable.status, parsedInput.status));
    }

    if (parsedInput?.floor !== undefined) {
      conditions.push(eq(roomsTable.floor, parsedInput.floor));
    }

    if (parsedInput?.type) {
      conditions.push(eq(roomsTable.type, parsedInput.type));
    }

    if (parsedInput?.search) {
      conditions.push(
        or(
          ilike(roomsTable.number, `%${parsedInput.search}%`),
          ilike(roomsTable.description || sql`''`, `%${parsedInput.search}%`)
        )!
      );
    }

    const rooms = await db
      .select()
      .from(roomsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(roomsTable.number);

    return { data: rooms };
  });

