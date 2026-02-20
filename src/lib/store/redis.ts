import Redis from 'ioredis'
import type { SessionStore } from './types'

export class RedisSessionStore implements SessionStore {
  private client: Redis

  constructor(url: string) {
    this.client = new Redis(url)
    console.log('[HyperPermsEditor] Using Redis session store')
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds)
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
