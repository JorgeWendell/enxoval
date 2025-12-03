"use server";

import { eq, and, or, ilike, sql } from "drizzle-orm";

import { db } from "@/db/index";
import { linenTypesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getLinenTypes = actionClient
  .schema(require("./schema").getLinenTypesSchema)
  .action(async ({ parsedInput }) => {
    const conditions = [];

    if (parsedInput?.category) {
      conditions.push(eq(linenTypesTable.category, parsedInput.category));
    }

    if (parsedInput?.search) {
      conditions.push(
        or(
          ilike(linenTypesTable.name, `%${parsedInput.search}%`),
          ilike(linenTypesTable.description || sql`''`, `%${parsedInput.search}%`)
        )!
      );
    }

    const linenTypes = await db
      .select()
      .from(linenTypesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(linenTypesTable.name);

    return { data: linenTypes };
  });

