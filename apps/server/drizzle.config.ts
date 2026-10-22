import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  driver: "d1-http",
  out: "drizzle",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
    databaseId: process.env.DATABASE_ID || "",
    token: process.env.CLOUDFLARE_API_TOKEN || "",
  },
});
