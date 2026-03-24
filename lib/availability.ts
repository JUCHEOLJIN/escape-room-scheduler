// Availability store abstraction
// Uses Upstash Redis in production, in-memory fallback for local dev

export type AvailabilityStore = Record<string, string[]>; // userName → dateKeys[]

// In-memory fallback — persists across Next.js hot reloads in dev
const g = globalThis as typeof globalThis & { __avStore?: AvailabilityStore };
if (!g.__avStore) g.__avStore = {};

function useRedis() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function getRedis() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

export async function getAllAvailability(): Promise<AvailabilityStore> {
  if (useRedis()) {
    const redis = await getRedis();
    const data = await redis.get<AvailabilityStore>("availability");
    return data ?? {};
  }
  return { ...g.__avStore! };
}

export async function setUserAvailability(
  userName: string,
  dates: string[]
): Promise<void> {
  if (useRedis()) {
    const redis = await getRedis();
    const current = await getAllAvailability();
    if (dates.length === 0) {
      delete current[userName];
    } else {
      current[userName] = dates;
    }
    await redis.set("availability", current);
  } else {
    if (dates.length === 0) {
      delete g.__avStore![userName];
    } else {
      g.__avStore![userName] = dates;
    }
  }
}
