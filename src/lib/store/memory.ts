import type { SessionStore } from './types'

interface Entry {
  value: string
  expiresAt: number | null
}

export class MemorySessionStore implements SessionStore {
  private store = new Map<string, Entry>()
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor() {
    console.log('[HyperPermsEditor] Using in-memory session store — sessions will not persist across restarts')
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000)
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    })
  }

  async del(key: string): Promise<void> {
    this.store.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    const value = await this.get(key)
    return value !== null
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const entry = this.store.get(key)
    if (entry) {
      entry.expiresAt = Date.now() + ttlSeconds * 1000
    }
  }

  async incr(key: string): Promise<number> {
    const entry = this.store.get(key)
    if (!entry || (entry.expiresAt !== null && Date.now() > entry.expiresAt)) {
      this.store.set(key, { value: '1', expiresAt: entry?.expiresAt ?? null })
      return 1
    }
    const newVal = (parseInt(entry.value, 10) || 0) + 1
    entry.value = String(newVal)
    return newVal
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (entry.expiresAt !== null && now > entry.expiresAt) {
        this.store.delete(key)
      }
    }
  }
}
