/**
 * Permission Registry
 * Comprehensive database of permission definitions for HyperPerms
 */

export interface PermissionDefinition {
  node: string
  description: string
  category: string
  default: 'op' | 'true' | 'false'
  children?: string[]
  deprecated?: boolean
  since?: string
}

export interface PermissionCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

// Permission Categories
export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'hyperperms',
    name: 'HyperPerms',
    description: 'HyperPerms plugin administration',
    icon: 'Shield',
    color: '#6366f1',
  },
  {
    id: 'hytale-commands',
    name: 'Hytale Commands',
    description: 'Built-in Hytale server commands',
    icon: 'Terminal',
    color: '#8b5cf6',
  },
  {
    id: 'building',
    name: 'Building',
    description: 'Block placement and destruction',
    icon: 'Hammer',
    color: '#f59e0b',
  },
  {
    id: 'chat',
    name: 'Chat',
    description: 'Chat and messaging features',
    icon: 'MessageSquare',
    color: '#22c55e',
  },
  {
    id: 'moderation',
    name: 'Moderation',
    description: 'Server moderation tools',
    icon: 'Gavel',
    color: '#ef4444',
  },
  {
    id: 'teleport',
    name: 'Teleportation',
    description: 'Player teleportation features',
    icon: 'Navigation',
    color: '#06b6d4',
  },
  {
    id: 'world',
    name: 'World',
    description: 'World access and manipulation',
    icon: 'Globe',
    color: '#ec4899',
  },
  // Note: Economy category removed - economy permissions are dynamically discovered
  // from installed plugins and will appear under their plugin name (e.g., "EconomySystem")
  // HyperFactions and HyperHomes permissions are provided dynamically
  // by the server via installedPlugins — no static definitions needed
  {
    id: 'other',
    name: 'Other',
    description: 'Miscellaneous permissions',
    icon: 'MoreHorizontal',
    color: '#64748b',
  },
]

// Comprehensive Permission Definitions
export const PERMISSION_REGISTRY: PermissionDefinition[] = [
  // ==================== HyperPerms ====================
  {
    node: 'hyperperms.*',
    description: 'Full access to all HyperPerms commands and features',
    category: 'hyperperms',
    default: 'op',
    children: [
      'hyperperms.admin',
      'hyperperms.user.*',
      'hyperperms.group.*',
      'hyperperms.track.*',
      'hyperperms.editor',
    ],
  },
  {
    node: 'hyperperms.admin',
    description: 'Access to admin commands (/hp reload, /hp export, etc.)',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.user.*',
    description: 'All user management permissions',
    category: 'hyperperms',
    default: 'op',
    children: [
      'hyperperms.user.info',
      'hyperperms.user.permission.set',
      'hyperperms.user.permission.unset',
      'hyperperms.user.group.add',
      'hyperperms.user.group.remove',
      'hyperperms.user.promote',
      'hyperperms.user.demote',
    ],
  },
  {
    node: 'hyperperms.user.info',
    description: 'View information about users',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.user.permission.set',
    description: 'Set permissions for users',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.user.permission.unset',
    description: 'Remove permissions from users',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.user.group.add',
    description: 'Add users to groups',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.user.group.remove',
    description: 'Remove users from groups',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.user.promote',
    description: 'Promote users on tracks',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.user.demote',
    description: 'Demote users on tracks',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.group.*',
    description: 'All group management permissions',
    category: 'hyperperms',
    default: 'op',
    children: [
      'hyperperms.group.info',
      'hyperperms.group.create',
      'hyperperms.group.delete',
      'hyperperms.group.permission.set',
      'hyperperms.group.permission.unset',
      'hyperperms.group.parent.add',
      'hyperperms.group.parent.remove',
      'hyperperms.group.setweight',
      'hyperperms.group.setprefix',
      'hyperperms.group.setsuffix',
    ],
  },
  {
    node: 'hyperperms.group.info',
    description: 'View information about groups',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.group.create',
    description: 'Create new groups',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.group.delete',
    description: 'Delete existing groups',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.group.permission.set',
    description: 'Set permissions for groups',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.group.permission.unset',
    description: 'Remove permissions from groups',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.group.parent.add',
    description: 'Add parent groups',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.group.parent.remove',
    description: 'Remove parent groups',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.group.setweight',
    description: 'Set group weight/priority',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.group.setprefix',
    description: 'Set group chat prefix',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.group.setsuffix',
    description: 'Set group chat suffix',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.track.*',
    description: 'All track management permissions',
    category: 'hyperperms',
    default: 'op',
    children: [
      'hyperperms.track.info',
      'hyperperms.track.create',
      'hyperperms.track.delete',
      'hyperperms.track.append',
      'hyperperms.track.insert',
      'hyperperms.track.remove',
    ],
  },
  {
    node: 'hyperperms.track.info',
    description: 'View information about tracks',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.track.create',
    description: 'Create new tracks',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.track.delete',
    description: 'Delete existing tracks',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.track.append',
    description: 'Add groups to tracks',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.track.insert',
    description: 'Insert groups into tracks at specific positions',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.track.remove',
    description: 'Remove groups from tracks',
    category: 'hyperperms',
    default: 'op',
  },
  {
    node: 'hyperperms.editor',
    description: 'Create web editor sessions with /hp editor',
    category: 'hyperperms',
    default: 'op',
  },

  // ==================== Hytale Commands ====================
  {
    node: 'hytale.command.*',
    description: 'Access to all Hytale commands',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.gamemode',
    description: 'Change game mode (/gamemode)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.gamemode.self',
    description: 'Change own game mode',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.gamemode.others',
    description: 'Change other players game mode',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.teleport',
    description: 'Teleport players (/tp)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.teleport.self',
    description: 'Teleport yourself',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.teleport.others',
    description: 'Teleport other players',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.give',
    description: 'Give items to players (/give)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.time',
    description: 'Change world time (/time)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.weather',
    description: 'Change world weather (/weather)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.spawn',
    description: 'Spawn entities (/spawn)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.kick',
    description: 'Kick players (/kick)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.ban',
    description: 'Ban players (/ban)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.unban',
    description: 'Unban players (/unban)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.op',
    description: 'Give operator status (/op)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.deop',
    description: 'Remove operator status (/deop)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.say',
    description: 'Broadcast messages (/say)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.stop',
    description: 'Stop the server (/stop)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.whitelist',
    description: 'Manage server whitelist (/whitelist)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.fly',
    description: 'Toggle flight mode (/fly)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.heal',
    description: 'Heal players (/heal)',
    category: 'hytale-commands',
    default: 'op',
  },
  {
    node: 'hytale.command.feed',
    description: 'Feed players (/feed)',
    category: 'hytale-commands',
    default: 'op',
  },

  // ==================== Building ====================
  {
    node: 'build.*',
    description: 'All building permissions',
    category: 'building',
    default: 'true',
    children: ['build.place', 'build.break', 'build.interact'],
  },
  {
    node: 'build.place',
    description: 'Place blocks in the world',
    category: 'building',
    default: 'true',
  },
  {
    node: 'build.break',
    description: 'Break/destroy blocks in the world',
    category: 'building',
    default: 'true',
  },
  {
    node: 'build.interact',
    description: 'Interact with blocks (doors, buttons, etc.)',
    category: 'building',
    default: 'true',
  },
  {
    node: 'hytale.editor.*',
    description: 'Access to Hytale model editor tools',
    category: 'building',
    default: 'op',
  },
  {
    node: 'hytale.editor.use',
    description: 'Use the model editor',
    category: 'building',
    default: 'op',
  },
  {
    node: 'hytale.editor.save',
    description: 'Save editor creations',
    category: 'building',
    default: 'op',
  },
  {
    node: 'hytale.editor.load',
    description: 'Load editor creations',
    category: 'building',
    default: 'op',
  },

  // ==================== Chat ====================
  {
    node: 'chat.*',
    description: 'All chat permissions',
    category: 'chat',
    default: 'true',
  },
  {
    node: 'chat.speak',
    description: 'Send messages in chat',
    category: 'chat',
    default: 'true',
  },
  {
    node: 'chat.color',
    description: 'Use color codes in chat',
    category: 'chat',
    default: 'false',
  },
  {
    node: 'chat.format',
    description: 'Use formatting codes (bold, italic, etc.) in chat',
    category: 'chat',
    default: 'false',
  },
  {
    node: 'chat.bypass.cooldown',
    description: 'Bypass chat cooldown/rate limit',
    category: 'chat',
    default: 'op',
  },
  {
    node: 'chat.bypass.filter',
    description: 'Bypass chat filter',
    category: 'chat',
    default: 'op',
  },
  {
    node: 'chat.mention.everyone',
    description: 'Use @everyone mentions in chat',
    category: 'chat',
    default: 'op',
  },
  {
    node: 'chat.private',
    description: 'Send private messages (/msg, /tell)',
    category: 'chat',
    default: 'true',
  },
  {
    node: 'chat.broadcast',
    description: 'Broadcast server-wide messages',
    category: 'chat',
    default: 'op',
  },

  // ==================== Moderation ====================
  {
    node: 'mod.*',
    description: 'All moderation permissions',
    category: 'moderation',
    default: 'op',
    children: [
      'mod.kick',
      'mod.ban',
      'mod.tempban',
      'mod.unban',
      'mod.mute',
      'mod.unmute',
      'mod.warn',
      'mod.vanish',
      'mod.freeze',
    ],
  },
  {
    node: 'mod.kick',
    description: 'Kick players from the server',
    category: 'moderation',
    default: 'op',
  },
  {
    node: 'mod.ban',
    description: 'Permanently ban players',
    category: 'moderation',
    default: 'op',
  },
  {
    node: 'mod.tempban',
    description: 'Temporarily ban players',
    category: 'moderation',
    default: 'op',
  },
  {
    node: 'mod.unban',
    description: 'Unban players',
    category: 'moderation',
    default: 'op',
  },
  {
    node: 'mod.mute',
    description: 'Mute players in chat',
    category: 'moderation',
    default: 'op',
  },
  {
    node: 'mod.unmute',
    description: 'Unmute players',
    category: 'moderation',
    default: 'op',
  },
  {
    node: 'mod.warn',
    description: 'Issue warnings to players',
    category: 'moderation',
    default: 'op',
  },
  {
    node: 'mod.vanish',
    description: 'Become invisible to other players',
    category: 'moderation',
    default: 'op',
  },
  {
    node: 'mod.freeze',
    description: 'Freeze players in place',
    category: 'moderation',
    default: 'op',
  },
  {
    node: 'mod.bypass.kick',
    description: 'Cannot be kicked',
    category: 'moderation',
    default: 'op',
  },
  {
    node: 'mod.bypass.ban',
    description: 'Cannot be banned',
    category: 'moderation',
    default: 'op',
  },

  // ==================== Teleportation ====================
  {
    node: 'teleport.*',
    description: 'All teleportation permissions',
    category: 'teleport',
    default: 'op',
    children: [
      'teleport.spawn',
      'teleport.home',
      'teleport.player',
      'teleport.warp',
      'teleport.back',
      'teleport.random',
    ],
  },
  {
    node: 'teleport.spawn',
    description: 'Teleport to spawn point',
    category: 'teleport',
    default: 'true',
  },
  {
    node: 'teleport.home',
    description: 'Teleport to home location',
    category: 'teleport',
    default: 'true',
  },
  {
    node: 'teleport.home.set',
    description: 'Set home location',
    category: 'teleport',
    default: 'true',
  },
  {
    node: 'teleport.home.multiple',
    description: 'Set multiple home locations',
    category: 'teleport',
    default: 'false',
  },
  {
    node: 'teleport.player',
    description: 'Teleport to other players',
    category: 'teleport',
    default: 'false',
  },
  {
    node: 'teleport.warp',
    description: 'Teleport to warp points',
    category: 'teleport',
    default: 'true',
  },
  {
    node: 'teleport.warp.set',
    description: 'Create warp points',
    category: 'teleport',
    default: 'op',
  },
  {
    node: 'teleport.back',
    description: 'Return to previous location',
    category: 'teleport',
    default: 'false',
  },
  {
    node: 'teleport.random',
    description: 'Random teleportation',
    category: 'teleport',
    default: 'false',
  },
  {
    node: 'teleport.bypass.cooldown',
    description: 'Bypass teleport cooldown',
    category: 'teleport',
    default: 'op',
  },
  {
    node: 'teleport.bypass.cost',
    description: 'Bypass teleport cost',
    category: 'teleport',
    default: 'op',
  },

  // ==================== World ====================
  {
    node: 'world.*',
    description: 'All world access permissions',
    category: 'world',
    default: 'op',
  },
  {
    node: 'world.enter.*',
    description: 'Enter any world',
    category: 'world',
    default: 'true',
  },
  {
    node: 'world.enter.hub',
    description: 'Enter the hub world',
    category: 'world',
    default: 'true',
  },
  {
    node: 'world.enter.survival',
    description: 'Enter the survival world',
    category: 'world',
    default: 'true',
  },
  {
    node: 'world.enter.creative',
    description: 'Enter the creative world',
    category: 'world',
    default: 'false',
  },
  {
    node: 'world.enter.adventure',
    description: 'Enter the adventure world',
    category: 'world',
    default: 'true',
  },
  {
    node: 'world.exit.*',
    description: 'Exit any world',
    category: 'world',
    default: 'true',
  },
  {
    node: 'world.create',
    description: 'Create new worlds',
    category: 'world',
    default: 'op',
  },
  {
    node: 'world.delete',
    description: 'Delete worlds',
    category: 'world',
    default: 'op',
  },
  {
    node: 'world.manage',
    description: 'Manage world settings',
    category: 'world',
    default: 'op',
  },

  // ==================== Economy ====================
  // Economy permissions are dynamically discovered from installed plugins
  // They will appear in the "Other" category when detected at runtime

  // HyperFactions and HyperHomes permissions are provided dynamically
  // by the server via installedPlugins — no static definitions needed

  // ==================== Other ====================
  {
    node: 'command.help',
    description: 'Access help command',
    category: 'other',
    default: 'true',
  },
  {
    node: 'command.list',
    description: 'View online player list',
    category: 'other',
    default: 'true',
  },
  {
    node: 'command.plugins',
    description: 'View installed plugins',
    category: 'other',
    default: 'op',
  },
  {
    node: 'player.damage.bypass',
    description: 'Bypass damage (god mode)',
    category: 'other',
    default: 'op',
  },
  {
    node: 'player.hunger.bypass',
    description: 'Never get hungry',
    category: 'other',
    default: 'op',
  },
]

// Helper functions

/**
 * Get all permissions in a specific category
 */
export function getPermissionsByCategory(categoryId: string): PermissionDefinition[] {
  return PERMISSION_REGISTRY.filter((p) => p.category === categoryId)
}

/**
 * Get a category by ID
 */
export function getCategoryById(categoryId: string): PermissionCategory | undefined {
  return PERMISSION_CATEGORIES.find((c) => c.id === categoryId)
}

/**
 * Search permissions with fuzzy matching
 */
export function searchPermissions(
  query: string,
  options?: {
    maxResults?: number
    includeDeprecated?: boolean
    categoryFilter?: string
  }
): PermissionDefinition[] {
  const { maxResults = 20, includeDeprecated = false, categoryFilter } = options || {}
  const queryLower = query.toLowerCase().trim()

  if (!queryLower) {
    return []
  }

  let results = PERMISSION_REGISTRY.filter((p) => {
    if (!includeDeprecated && p.deprecated) return false
    if (categoryFilter && p.category !== categoryFilter) return false
    return true
  })

  // Score each permission based on match quality
  const scored = results.map((p) => {
    let score = 0
    const nodeLower = p.node.toLowerCase()
    const descLower = p.description.toLowerCase()

    // Exact match gets highest score
    if (nodeLower === queryLower) {
      score = 100
    }
    // Starts with query
    else if (nodeLower.startsWith(queryLower)) {
      score = 80
    }
    // Contains query as a segment (between dots)
    else if (nodeLower.includes(`.${queryLower}.`) || nodeLower.includes(`.${queryLower}`)) {
      score = 60
    }
    // Contains query anywhere in node
    else if (nodeLower.includes(queryLower)) {
      score = 40
    }
    // Description contains query
    else if (descLower.includes(queryLower)) {
      score = 20
    }
    // Fuzzy match on node
    else if (fuzzyMatch(queryLower, nodeLower)) {
      score = 10
    }

    return { permission: p, score }
  })

  // Sort by score descending, then by node name
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.permission.node.localeCompare(b.permission.node)
  })

  // Filter out zero scores and limit results
  return scored.filter((s) => s.score > 0).slice(0, maxResults).map((s) => s.permission)
}

/**
 * Simple fuzzy matching for typos
 */
function fuzzyMatch(query: string, target: string): boolean {
  // Check if all characters in query appear in target in order
  let queryIndex = 0
  for (let i = 0; i < target.length && queryIndex < query.length; i++) {
    if (target[i] === query[queryIndex]) {
      queryIndex++
    }
  }
  return queryIndex === query.length
}

/**
 * Get suggested "did you mean" alternatives for a typo
 */
export function getSuggestions(input: string): string[] {
  const inputLower = input.toLowerCase()
  const suggestions: { node: string; distance: number }[] = []

  for (const perm of PERMISSION_REGISTRY) {
    const distance = levenshteinDistance(inputLower, perm.node.toLowerCase())
    if (distance <= 3) {
      // Allow up to 3 character differences
      suggestions.push({ node: perm.node, distance })
    }
  }

  return suggestions
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map((s) => s.node)
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Check if a permission node is valid (exists in registry or matches a pattern)
 */
export function isKnownPermission(node: string): boolean {
  const nodeLower = node.toLowerCase()
  return PERMISSION_REGISTRY.some(
    (p) => p.node.toLowerCase() === nodeLower || matchesWildcard(p.node, node)
  )
}

/**
 * Check if a wildcard pattern matches a permission
 */
function matchesWildcard(pattern: string, permission: string): boolean {
  if (!pattern.includes('*')) return false

  const patternParts = pattern.split('.')
  const permParts = permission.split('.')

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i] === '*') {
      // Wildcard at end matches everything after
      if (i === patternParts.length - 1) return true
      continue
    }

    if (i >= permParts.length) return false
    if (patternParts[i].toLowerCase() !== permParts[i].toLowerCase()) return false
  }

  return patternParts.length === permParts.length
}

/**
 * Get all unique permission nodes (flattened)
 */
export function getAllPermissionNodes(): string[] {
  return PERMISSION_REGISTRY.map((p) => p.node)
}
