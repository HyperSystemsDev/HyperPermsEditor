import { getSessionStore } from '@/lib/store'

export const RATE_LIMITS = {
  SESSION_CREATE: { limit: 100, windowSeconds: 3600 },
  SESSION_MODIFY: { limit: 300, windowSeconds: 3600 },
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const store = getSessionStore()
  const count = await store.incr(key)

  if (count === 1) {
    await store.expire(key, windowSeconds)
  }

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
  }
}
