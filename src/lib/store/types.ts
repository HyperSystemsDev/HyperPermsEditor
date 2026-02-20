export interface SessionStore {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttlSeconds?: number): Promise<void>
  del(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  expire(key: string, ttlSeconds: number): Promise<void>
  incr(key: string): Promise<number>
}
