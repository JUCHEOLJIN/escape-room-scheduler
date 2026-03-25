import { createClient } from "@libsql/client";

const client = createClient(
  process.env.TURSO_DATABASE_URL
    ? {
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }
    : { url: "file:local.db" }
);

export async function getDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS availability (
      user_name TEXT PRIMARY KEY,
      dates TEXT NOT NULL DEFAULT '[]'
    )
  `);
  return client;
}
