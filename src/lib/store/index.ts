import type { SessionStore } from './types'
import { MemorySessionStore } from './memory'

let store: SessionStore | null = null

export function getSessionStore(): SessionStore {
  if (store) return store

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN
  const redisUrl = process.env.REDIS_URL

  if (upstashUrl && upstashToken) {
    // Dynamic import not needed at module level - lazy init via singleton
    const { UpstashSessionStore } = require('./upstash') as typeof import('./upstash')
    store = new UpstashSessionStore(upstashUrl, upstashToken)
  } else if (redisUrl) {
    const { RedisSessionStore } = require('./redis') as typeof import('./redis')
    store = new RedisSessionStore(redisUrl)
  } else {
    store = new MemorySessionStore()
  }

  return store
}

export type { SessionStore } from './types'
