import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db/index"; // your drizzle instance
import * as schema from "@/db/schema"; // your drizzle schema

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    modelName: "usersTable",
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  trustedOrigins: [
    "http://localhost:5100",
    "https://enxoval.adelbr.tech",
    "http://enxoval.adelbr.tech:5100",
    "http://192.168.15.59:5100",
  ],
  baseURL:
    process.env.NODE_ENV === "production"
      ? "http://enxoval.adelbr.tech:5100"
      : "http://192.168.15.59:5100",
});
