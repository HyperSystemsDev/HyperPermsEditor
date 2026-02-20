import type { Group, Node, PermissionData } from './types'

/**
 * Check if a group has a permission (including inherited)
 */
export function hasPermission(
  groupName: string,
  permission: string,
  data: PermissionData,
  visited: Set<string> = new Set()
): boolean | null {
  if (!groupName) return null

  // Prevent circular inheritance
  if (visited.has(groupName.toLowerCase())) {
    return null
  }
  visited.add(groupName.toLowerCase())

  const group = data.groups.find(g => g.name?.toLowerCase() === groupName.toLowerCase())
  if (!group) return null

  // Check direct permission
  const directPerm = group.permissions.find(p =>
    p.permission && matchesPermission(p.permission, permission)
  )
  if (directPerm) return directPerm.value

  // Check wildcards
  const wildcardPerm = group.permissions.find(p =>
    p.permission?.endsWith('.*') &&
    matchesWildcard(p.permission, permission)
  )
  if (wildcardPerm) return wildcardPerm.value

  // Check parent groups
  for (const parentName of group.parents) {
    const parentResult = hasPermission(parentName, permission, data, visited)
    if (parentResult !== null) return parentResult
  }

  return null
}

/**
 * Check if a permission pattern matches a permission node
 */
export function matchesPermission(pattern: string, permission: string): boolean {
  if (!pattern || !permission) return false
  return pattern.toLowerCase() === permission.toLowerCase()
}

/**
 * Check if a wildcard pattern matches a permission
 */
export function matchesWildcard(pattern: string, permission: string): boolean {
  if (!pattern || !permission) return false
  if (!pattern.endsWith('.*')) return false

  const base = pattern.slice(0, -2).toLowerCase()
  const permLower = permission.toLowerCase()

  return permLower.startsWith(base + '.') || permLower === base
}

/**
 * Get all effective permissions for a group (including inherited)
 */
export function getEffectivePermissions(
  groupName: string,
  data: PermissionData,
  visited: Set<string> = new Set()
): Map<string, { value: boolean; source: string }> {
  const permissions = new Map<string, { value: boolean; source: string }>()

  if (!groupName) return permissions

  // Prevent circular inheritance
  if (visited.has(groupName.toLowerCase())) {
    return permissions
  }
  visited.add(groupName.toLowerCase())

  const group = data.groups.find(g => g.name?.toLowerCase() === groupName.toLowerCase())
  if (!group) return permissions

  // First, get parent permissions (lower priority)
  for (const parentName of group.parents) {
    const parentPerms = getEffectivePermissions(parentName, data, visited)
    for (const [perm, info] of parentPerms) {
      if (!permissions.has(perm)) {
        permissions.set(perm, info)
      }
    }
  }

  // Then, add direct permissions (higher priority)
  for (const node of group.permissions) {
    if (node.permission) {
      permissions.set(node.permission, { value: node.value, source: group.name })
    }
  }

  return permissions
}

/**
 * Get only inherited permissions for a group (from parents, not direct)
 * Returns an array of nodes with a source field indicating which group the permission came from
 */
export function getInheritedPermissions(
  groupName: string,
  data: PermissionData
): Array<Node & { source: string }> {
  const inherited: Array<Node & { source: string }> = []
  const seen = new Set<string>()

  const group = data.groups.find(g => g.name?.toLowerCase() === groupName.toLowerCase())
  if (!group) return inherited

  // Get direct permissions for exclusion
  const directPerms = new Set(group.permissions.map(p => p.permission?.toLowerCase()).filter(Boolean))

  // Recursively get permissions from parents
  function collectFromParents(parentNames: string[], visited: Set<string>) {
    for (const parentName of parentNames) {
      if (visited.has(parentName.toLowerCase())) continue
      visited.add(parentName.toLowerCase())

      const parentGroup = data.groups.find(g => g.name?.toLowerCase() === parentName.toLowerCase())
      if (!parentGroup) continue

      // Add permissions from this parent
      for (const node of parentGroup.permissions) {
        const permKey = node.permission?.toLowerCase()
        if (permKey && !seen.has(permKey) && !directPerms.has(permKey)) {
          seen.add(permKey)
          inherited.push({
            ...node,
            source: parentGroup.displayName || parentGroup.name
          })
        }
      }

      // Recursively collect from grandparents
      collectFromParents(parentGroup.parents, visited)
    }
  }

  collectFromParents(group.parents, new Set([groupName.toLowerCase()]))

  return inherited
}

/**
 * Sort groups by weight (highest first)
 */
export function sortGroupsByWeight(groups: Group[]): Group[] {
  return [...groups].sort((a, b) => b.weight - a.weight)
}

/**
 * Get inheritance chain for a group
 */
export function getInheritanceChain(
  groupName: string,
  data: PermissionData,
  visited: Set<string> = new Set()
): string[] {
  if (!groupName) return []

  if (visited.has(groupName.toLowerCase())) {
    return []
  }
  visited.add(groupName.toLowerCase())

  const group = data.groups.find(g => g.name?.toLowerCase() === groupName.toLowerCase())
  if (!group) return []

  const chain: string[] = [group.name]

  for (const parentName of group.parents) {
    const parentChain = getInheritanceChain(parentName, data, new Set(visited))
    chain.push(...parentChain)
  }

  return chain
}

/**
 * Check if adding a parent would create a circular dependency
 */
export function wouldCreateCircularDependency(
  groupName: string,
  potentialParent: string,
  data: PermissionData
): boolean {
  if (!groupName || !potentialParent) return false
  const parentChain = getInheritanceChain(potentialParent, data)
  return parentChain.some(g => g?.toLowerCase() === groupName.toLowerCase())
}

/**
 * Validate a permission node string
 */
export function isValidPermission(permission: string): boolean {
  if (!permission || permission.trim() === '') return false
  // Allow alphanumeric, dots, underscores, hyphens, and wildcards
  return /^[a-zA-Z0-9._\-*]+$/.test(permission)
}

/**
 * Parse a permission string that might include context
 * e.g., "fly.enable world=hub gamemode=creative"
 */
export function parsePermissionWithContext(input: string): {
  permission: string
  contexts: Record<string, string>
} {
  const parts = input.split(' ')
  const permission = parts[0]
  const contexts: Record<string, string> = {}

  for (let i = 1; i < parts.length; i++) {
    const [key, value] = parts[i].split('=')
    if (key && value) {
      contexts[key] = value
    }
  }

  return { permission, contexts }
}

/**
 * Format a permission node for display
 */
export function formatPermissionNode(node: Node): string {
  let result = node.permission || '(unknown)'
  if (node.contexts) {
    const contextStr = Object.entries(node.contexts)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${v}`)
      .join(' ')
    if (contextStr) {
      result += ` (${contextStr})`
    }
  }
  if (node.expiry) {
    const date = new Date(node.expiry)
    result += ` [expires: ${date.toLocaleDateString()}]`
  }
  return result
}
