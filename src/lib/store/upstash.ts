import { Redis } from '@upstash/redis'
import type { SessionStore } from './types'

export class UpstashSessionStore implements SessionStore {
  private client: Redis

  constructor(url: string, token: string) {
    this.client = new Redis({ url, token })
    console.log('[HyperPermsEditor] Using Upstash Redis session store')
  }

  async get(key: string): Promise<string | null> {
    const result = await this.client.get<string>(key)
    return result ?? null
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, { ex: ttlSeconds })
    } else {
      await this.client.set(key, value)
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key)
    return result === 1
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds)
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key)
  }
}
