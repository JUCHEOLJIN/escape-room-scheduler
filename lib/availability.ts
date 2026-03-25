import { getDb } from "./db";

export type AvailabilityStore = Record<string, string[]>; // userName → dateKeys[]

export async function getAllAvailability(): Promise<AvailabilityStore> {
  const db = await getDb();
  const result = await db.execute("SELECT user_name, dates FROM availability");
  const store: AvailabilityStore = {};
  for (const row of result.rows) {
    const userName = row.user_name as string;
    const dates = JSON.parse(row.dates as string) as string[];
    store[userName] = dates;
  }
  return store;
}

export async function setUserAvailability(
  userName: string,
  dates: string[]
): Promise<void> {
  const db = await getDb();
  if (dates.length === 0) {
    await db.execute({
      sql: "DELETE FROM availability WHERE user_name = ?",
      args: [userName],
    });
  } else {
    await db.execute({
      sql: "INSERT OR REPLACE INTO availability (user_name, dates) VALUES (?, ?)",
      args: [userName, JSON.stringify(dates)],
    });
  }
}
