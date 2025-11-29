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
    "http://localhost:3000",
    "https://hotel.adelbr.tech",
    "http://hotel.adelbr.tech:3000",
    "http://192.168.15.53:3000",
  ],
  baseURL:
    process.env.NODE_ENV === "production" ? "http://hotel.adelbr.tech:3000" : "http://192.168.15.53:3000",
});
