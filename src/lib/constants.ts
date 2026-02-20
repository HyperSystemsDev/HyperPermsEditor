// Session constants
export const SESSION_TTL_SECONDS = parseInt(process.env.SESSION_TTL || '86400', 10)
export const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000

// API endpoints
export const API_BASE = '/api'
export const API_SESSION = `${API_BASE}/session`

// Default values
export const DEFAULT_GROUP: {
  weight: number
  prefix: null
  suffix: null
  prefixPriority: number
  suffixPriority: number
  permissions: []
  parents: []
} = {
  weight: 0,
  prefix: null,
  suffix: null,
  prefixPriority: 0,
  suffixPriority: 0,
  permissions: [],
  parents: [],
}

export const DEFAULT_USER: {
  primaryGroup: string
  groups: []
  permissions: []
  customPrefix: null
  customSuffix: null
} = {
  primaryGroup: 'default',
  groups: [],
  permissions: [],
  customPrefix: null,
  customSuffix: null,
}

// Common permission suggestions for autocomplete
export const COMMON_PERMISSIONS = [
  'hyperperms.admin',
  'hyperperms.user',
  'hyperperms.group',
  'hyperperms.track',
  'hyperperms.editor',
  'build.place',
  'build.break',
  'build.*',
  'chat.color',
  'chat.format',
  'chat.bypass.cooldown',
  'teleport.spawn',
  'teleport.home',
  'teleport.player',
  'teleport.*',
  'world.enter.*',
  'world.exit.*',
  'command.fly',
  'command.gamemode',
  'command.teleport',
  'mod.kick',
  'mod.ban',
  'mod.mute',
  'mod.*',
] as const

// Color palette for groups (for visual differentiation)
export const GROUP_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#84cc16', // Lime
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
] as const
