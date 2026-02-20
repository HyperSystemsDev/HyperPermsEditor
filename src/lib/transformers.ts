import type { Node, Group, User, PermissionData } from '@/lib/types'
import { getPermissionString, formatPermissionForBackend, parseNegatedPermission } from '@/lib/utils'

/**
 * Backend format types - used for communication with the HyperPerms plugin
 */
export interface BackendNode {
  node: string
  value: boolean
  expiry?: number | null
  contexts?: Record<string, string>
}

export interface BackendGroup {
  name: string
  displayName?: string
  weight: number
  prefix?: string | null
  suffix?: string | null
  prefixPriority?: number
  suffixPriority?: number
  permissions: BackendNode[]
  parents: string[]
}

export interface BackendUser {
  uuid: string
  username?: string | null
  primaryGroup: string
  groups: string[]
  permissions: BackendNode[]
  customPrefix?: string | null
  customSuffix?: string | null
}

export interface BackendPermissionData {
  groups: BackendGroup[]
  users: BackendUser[]
  tracks: PermissionData['tracks']
}

/**
 * Transform frontend permission node to backend format
 * Uses getPermissionString to handle both old configs (with 'node' field)
 * and new configs (with 'permission' field)
 * Formats permission with '-' prefix when value is false (denied)
 */
export function toBackendNode(frontendNode: Node & { node?: string }): BackendNode {
  // Filter out undefined values from contexts
  const contexts: Record<string, string> = {}
  if (frontendNode.contexts) {
    for (const [key, value] of Object.entries(frontendNode.contexts)) {
      if (value !== undefined) {
        contexts[key] = value
      }
    }
  }

  const permissionString = getPermissionString(frontendNode)
  const nodeString = formatPermissionForBackend(permissionString, frontendNode.value)

  // When the node has a - prefix, value must be true to avoid double negation
  // on the backend (PermissionResolver strips - and flips value)
  const backendValue = nodeString.startsWith('-') ? true : frontendNode.value

  return {
    node: nodeString,
    value: backendValue,
    expiry: frontendNode.expiry,
    contexts,
  }
}

/**
 * Transform frontend group to backend format
 */
export function toBackendGroup(frontendGroup: Group): BackendGroup {
  return {
    name: frontendGroup.name,
    displayName: frontendGroup.displayName || '',
    weight: frontendGroup.weight,
    prefix: frontendGroup.prefix || '',
    suffix: frontendGroup.suffix || '',
    prefixPriority: frontendGroup.prefixPriority,
    suffixPriority: frontendGroup.suffixPriority,
    permissions: frontendGroup.permissions.map(toBackendNode),
    parents: frontendGroup.parents,
  }
}

/**
 * Transform frontend user to backend format
 */
export function toBackendUser(frontendUser: User): BackendUser {
  return {
    uuid: frontendUser.uuid,
    username: frontendUser.username,
    primaryGroup: frontendUser.primaryGroup,
    groups: frontendUser.groups,
    permissions: frontendUser.permissions.map(toBackendNode),
    customPrefix: frontendUser.customPrefix,
    customSuffix: frontendUser.customSuffix,
  }
}

/**
 * Transform entire PermissionData to backend format
 */
export function toBackendFormat(data: PermissionData): BackendPermissionData {
  return {
    groups: data.groups.map(toBackendGroup),
    users: data.users.map(toBackendUser),
    tracks: data.tracks,
  }
}

/**
 * Transform backend permission node to frontend format
 * Parses '-' prefix from backend to set value to false (denied)
 */
export function toFrontendNode(backendNode: BackendNode): Node {
  const { permission, isNegated } = parseNegatedPermission(backendNode.node)

  return {
    permission,
    // If the node has a '-' prefix, it's denied (value = false)
    // Otherwise, use the explicit value from backend
    value: isNegated ? false : backendNode.value,
    expiry: backendNode.expiry ?? null,
    contexts: backendNode.contexts,
  }
}

/**
 * Transform backend group to frontend format
 */
export function toFrontendGroup(backendGroup: BackendGroup): Group {
  return {
    name: backendGroup.name,
    displayName: backendGroup.displayName,
    weight: backendGroup.weight,
    prefix: backendGroup.prefix ?? null,
    suffix: backendGroup.suffix ?? null,
    prefixPriority: backendGroup.prefixPriority ?? 0,
    suffixPriority: backendGroup.suffixPriority ?? 0,
    permissions: backendGroup.permissions.map(toFrontendNode),
    parents: backendGroup.parents,
  }
}

/**
 * Transform backend user to frontend format
 */
export function toFrontendUser(backendUser: BackendUser): User {
  return {
    uuid: backendUser.uuid,
    username: backendUser.username ?? null,
    primaryGroup: backendUser.primaryGroup,
    groups: backendUser.groups,
    permissions: backendUser.permissions.map(toFrontendNode),
    customPrefix: backendUser.customPrefix ?? null,
    customSuffix: backendUser.customSuffix ?? null,
  }
}
