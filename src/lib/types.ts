// ==================== Permission Models ====================

export interface Node {
  permission: string
  value: boolean
  expiry: number | null  // Unix timestamp, null = permanent
  contexts?: ContextSet
}

export interface ContextSet {
  world?: string
  gamemode?: string
  [key: string]: string | undefined
}

export interface Group {
  name: string
  displayName?: string
  weight: number
  prefix: string | null
  suffix: string | null
  prefixPriority: number
  suffixPriority: number
  permissions: Node[]
  parents: string[]
}

export interface User {
  uuid: string
  username: string | null
  primaryGroup: string
  groups: string[]
  permissions: Node[]
  customPrefix: string | null
  customSuffix: string | null
}

export interface Track {
  name: string
  groups: string[]  // Ordered from lowest to highest
}

// ==================== Session Models ====================

export interface PermissionData {
  groups: Group[]
  users: User[]
  tracks: Track[]
}

// ==================== Plugin Permission Models ====================

export interface PluginPermission {
  node: string
  description: string
  default: 'op' | 'true' | 'false'
  children?: string[]
}

export interface InstalledPlugin {
  name: string
  version: string
  permissions: PluginPermission[]
}

// ==================== Server Info ====================

export interface ServerInfo {
  serverName: string
  pluginVersion: string
  storageType: 'json' | 'sqlite'
  contextCalculators: string[]
  playerCount: number
  installedPlugins?: InstalledPlugin[]
}

export interface Session {
  id: string
  created: number
  lastModified: number
  expiresAt: number
  original: PermissionData
  current: PermissionData
  serverInfo: ServerInfo
}

export interface SessionCreateResponse {
  sessionId: string
  expiresAt: number
  url: string
}

// ==================== Editor State ====================

export interface EditorState {
  session: Session | null
  loading: boolean
  error: string | null
  hasUnsavedChanges: boolean
  selectedGroup: string | null
  selectedUser: string | null
  selectedTrack: string | null
  activeTab: 'groups' | 'users' | 'tracks'
  searchQuery: string
}

export interface EditorChanges {
  groupsToCreate: Group[]
  groupsToUpdate: Group[]
  groupsToDelete: string[]
  usersToUpdate: User[]
  usersToDelete: string[]
  tracksToCreate: Track[]
  tracksToUpdate: Track[]
  tracksToDelete: string[]
}

export interface ChangeSummary {
  changes: EditorChanges
  summary: string
  changeCount: number
}

// ==================== UI Types ====================

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}
