import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date timestamp to a human-readable string
 */
export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'just now'
}

/**
 * Format duration from milliseconds
 */
export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

/**
 * Generate a random ID for non-security purposes (e.g., React keys, UI IDs).
 *
 * WARNING: Uses Math.random() which is NOT cryptographically secure.
 * Do NOT use for tokens, session IDs, or any security-sensitive purposes.
 * For secure IDs, use nanoid or crypto.randomUUID() instead.
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Truncate text
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return regex.test(uuid)
}

/**
 * Sleep for a given duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if two objects are deeply equal
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Get permission string from a node, handling both frontend format (permission)
 * and backend format (node) for compatibility with existing sessions
 */
export function getPermissionString(node: { permission?: string; node?: string }): string {
  return node.permission ?? node.node ?? ''
}

/**
 * Parse a permission node that may have a negation prefix (-)
 * Returns the base permission and whether it's negated
 */
export function parseNegatedPermission(node: string): { permission: string; isNegated: boolean } {
  if (node.startsWith('-')) {
    return { permission: node.slice(1), isNegated: true }
  }
  return { permission: node, isNegated: false }
}

/**
 * Format a permission for backend transmission
 * Adds '-' prefix when value is false (denied)
 */
export function formatPermissionForBackend(permission: string, value: boolean): string {
  // Strip any existing negation prefix to normalize
  const basePermission = permission.startsWith('-') ? permission.slice(1) : permission
  return value ? basePermission : `-${basePermission}`
}
