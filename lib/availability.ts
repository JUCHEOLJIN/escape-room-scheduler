// Availability store abstraction
// Uses Vercel KV in production, in-memory fallback for local dev

export type AvailabilityStore = Record<string, string[]>; // userName → dateKeys[]

// In-memory fallback persisted across Next.js hot reloads in dev
const g = globalThis as typeof globalThis & { __avStore?: AvailabilityStore };
if (!g.__avStore) g.__avStore = {};

function useKV() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function getAllAvailability(): Promise<AvailabilityStore> {
  if (useKV()) {
    const { kv } = await import("@vercel/kv");
    const data = await kv.get<AvailabilityStore>("availability");
    return data ?? {};
  }
  return { ...g.__avStore! };
}

export async function setUserAvailability(
  userName: string,
  dates: string[]
): Promise<void> {
  if (useKV()) {
    const { kv } = await import("@vercel/kv");
    const current = await getAllAvailability();
    if (dates.length === 0) {
      delete current[userName];
    } else {
      current[userName] = dates;
    }
    await kv.set("availability", current);
  } else {
    if (dates.length === 0) {
      delete g.__avStore![userName];
    } else {
      g.__avStore![userName] = dates;
    }
  }
}
