import type { PermissionData, Group, User, Track, EditorChanges } from './types'
import { deepEqual, getPermissionString } from './utils'

export function calculateDiff(original: PermissionData, current: PermissionData): EditorChanges {
  return {
    groupsToCreate: findCreatedGroups(original.groups, current.groups),
    groupsToUpdate: findUpdatedGroups(original.groups, current.groups),
    groupsToDelete: findDeletedGroups(original.groups, current.groups),
    usersToUpdate: findUpdatedUsers(original.users, current.users),
    usersToDelete: findDeletedUsers(original.users, current.users),
    tracksToCreate: findCreatedTracks(original.tracks, current.tracks),
    tracksToUpdate: findUpdatedTracks(original.tracks, current.tracks),
    tracksToDelete: findDeletedTracks(original.tracks, current.tracks),
  }
}

function findCreatedGroups(original: Group[], current: Group[]): Group[] {
  const originalNames = new Set(original.map(g => g.name?.toLowerCase() ?? ''))
  return current.filter(g => g.name && !originalNames.has(g.name.toLowerCase()))
}

function findDeletedGroups(original: Group[], current: Group[]): string[] {
  const currentNames = new Set(current.map(g => g.name?.toLowerCase() ?? ''))
  return original.filter(g => g.name && !currentNames.has(g.name.toLowerCase())).map(g => g.name)
}

function findUpdatedGroups(original: Group[], current: Group[]): Group[] {
  const originalMap = new Map(original.map(g => [g.name?.toLowerCase() ?? '', g]))

  return current.filter(currentGroup => {
    if (!currentGroup.name) return false
    const originalGroup = originalMap.get(currentGroup.name.toLowerCase())
    if (!originalGroup) return false
    return !deepEqual(originalGroup, currentGroup)
  })
}

function findUpdatedUsers(original: User[], current: User[]): User[] {
  const originalMap = new Map(original.map(u => [u.uuid, u]))

  return current.filter(currentUser => {
    const originalUser = originalMap.get(currentUser.uuid)
    if (!originalUser) return true
    return !deepEqual(originalUser, currentUser)
  })
}

function findDeletedUsers(original: User[], current: User[]): string[] {
  const currentUuids = new Set(current.map(u => u.uuid))
  return original.filter(u => !currentUuids.has(u.uuid)).map(u => u.uuid)
}

function findCreatedTracks(original: Track[], current: Track[]): Track[] {
  const originalNames = new Set(original.map(t => t.name?.toLowerCase() ?? ''))
  return current.filter(t => t.name && !originalNames.has(t.name.toLowerCase()))
}

function findUpdatedTracks(original: Track[], current: Track[]): Track[] {
  const originalMap = new Map(original.map(t => [t.name?.toLowerCase() ?? '', t]))

  return current.filter(currentTrack => {
    if (!currentTrack.name) return false
    const originalTrack = originalMap.get(currentTrack.name.toLowerCase())
    if (!originalTrack) return false
    return !deepEqual(originalTrack, currentTrack)
  })
}

function findDeletedTracks(original: Track[], current: Track[]): string[] {
  const currentNames = new Set(current.map(t => t.name?.toLowerCase() ?? ''))
  return original.filter(t => t.name && !currentNames.has(t.name.toLowerCase())).map(t => t.name)
}

export function generateSummary(changes: EditorChanges): string {
  const parts: string[] = []

  if (changes.groupsToCreate.length > 0) {
    parts.push(`${changes.groupsToCreate.length} group(s) created`)
  }
  if (changes.groupsToUpdate.length > 0) {
    parts.push(`${changes.groupsToUpdate.length} group(s) modified`)
  }
  if (changes.groupsToDelete.length > 0) {
    parts.push(`${changes.groupsToDelete.length} group(s) deleted`)
  }
  if (changes.usersToUpdate.length > 0) {
    parts.push(`${changes.usersToUpdate.length} user(s) modified`)
  }
  if (changes.usersToDelete.length > 0) {
    parts.push(`${changes.usersToDelete.length} user(s) deleted`)
  }
  if (changes.tracksToCreate.length > 0) {
    parts.push(`${changes.tracksToCreate.length} track(s) created`)
  }
  if (changes.tracksToUpdate.length > 0) {
    parts.push(`${changes.tracksToUpdate.length} track(s) modified`)
  }
  if (changes.tracksToDelete.length > 0) {
    parts.push(`${changes.tracksToDelete.length} track(s) deleted`)
  }

  return parts.length > 0 ? parts.join(', ') : 'No changes'
}

export function countChanges(original: PermissionData, current: PermissionData): {
  total: number
  groups: number
  users: number
  tracks: number
} {
  const diff = calculateDiff(original, current)
  const groups = diff.groupsToCreate.length + diff.groupsToUpdate.length + diff.groupsToDelete.length
  const users = diff.usersToUpdate.length + diff.usersToDelete.length
  const tracks = diff.tracksToCreate.length + diff.tracksToUpdate.length + diff.tracksToDelete.length
  return {
    total: groups + users + tracks,
    groups,
    users,
    tracks,
  }
}

export function countChangesFromDiff(changes: EditorChanges): number {
  return (
    changes.groupsToCreate.length +
    changes.groupsToUpdate.length +
    changes.groupsToDelete.length +
    changes.usersToUpdate.length +
    changes.usersToDelete.length +
    changes.tracksToCreate.length +
    changes.tracksToUpdate.length +
    changes.tracksToDelete.length
  )
}

export function getGroupDiff(original: Group | undefined, current: Group): {
  added: string[]
  removed: string[]
  changed: Array<{ field: string; from: unknown; to: unknown }>
} {
  const added: string[] = []
  const removed: string[] = []
  const changed: Array<{ field: string; from: unknown; to: unknown }> = []

  if (!original) {
    return { added: ['New group'], removed: [], changed: [] }
  }

  const origPerms = new Set(original.permissions.map(p => getPermissionString(p)).filter(Boolean))
  const currPerms = new Set(current.permissions.map(p => getPermissionString(p)).filter(Boolean))

  current.permissions.forEach(p => {
    const perm = getPermissionString(p)
    if (perm && !origPerms.has(perm)) {
      added.push(`Permission: ${perm}`)
    }
  })

  original.permissions.forEach(p => {
    const perm = getPermissionString(p)
    if (perm && !currPerms.has(perm)) {
      removed.push(`Permission: ${perm}`)
    }
  })

  const origParents = new Set(original.parents)
  const currParents = new Set(current.parents)

  current.parents.forEach(p => {
    if (!origParents.has(p)) {
      added.push(`Parent: ${p}`)
    }
  })

  original.parents.forEach(p => {
    if (!currParents.has(p)) {
      removed.push(`Parent: ${p}`)
    }
  })

  if (original.weight !== current.weight) {
    changed.push({ field: 'weight', from: original.weight, to: current.weight })
  }
  if (original.prefix !== current.prefix) {
    changed.push({ field: 'prefix', from: original.prefix, to: current.prefix })
  }
  if (original.suffix !== current.suffix) {
    changed.push({ field: 'suffix', from: original.suffix, to: current.suffix })
  }
  if (original.displayName !== current.displayName) {
    changed.push({ field: 'displayName', from: original.displayName, to: current.displayName })
  }

  return { added, removed, changed }
}
