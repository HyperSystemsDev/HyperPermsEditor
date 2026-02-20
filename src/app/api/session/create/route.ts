import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionStore } from '@/lib/store'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit'
import { getClientIp } from '@/lib/cors'
import { sessionCreateSchema } from '@/lib/validation'
import { SESSION_TTL_SECONDS } from '@/lib/constants'
import type { PermissionData, ServerInfo, Session, SessionCreateResponse, Node, Group, User, InstalledPlugin, PluginPermission } from '@/lib/types'

// Backend sends permissions with "node" field, frontend expects "permission"
interface BackendNode {
  node: string
  value: boolean
  expiry?: number | null
  contexts?: Record<string, string>
}

interface BackendGroup {
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

interface BackendUser {
  uuid: string
  username?: string | null
  primaryGroup: string
  groups: string[]
  permissions: BackendNode[]
  customPrefix?: string | null
  customSuffix?: string | null
}

interface BackendPluginPermission {
  node: string
  description: string
  defaultValue?: string
  default?: string
  children?: string[]
}

interface BackendInstalledPlugin {
  pluginName?: string
  name?: string
  version: string
  permissions: BackendPluginPermission[]
}

interface BackendMetadata {
  serverName: string
  pluginVersion: string
  playerCount: number
}

interface CreateSessionRequest {
  groups: BackendGroup[]
  users: BackendUser[]
  tracks: PermissionData['tracks']
  serverInfo?: ServerInfo
  metadata?: BackendMetadata
  installedPlugins?: BackendInstalledPlugin[]
}

function transformPluginPermission(backendPerm: BackendPluginPermission): PluginPermission {
  const defaultVal = backendPerm.defaultValue || backendPerm.default || 'op'
  return {
    node: backendPerm.node,
    description: backendPerm.description,
    default: defaultVal as 'op' | 'true' | 'false',
    children: backendPerm.children,
  }
}

function transformInstalledPlugin(backendPlugin: BackendInstalledPlugin): InstalledPlugin {
  return {
    name: backendPlugin.pluginName || backendPlugin.name || 'Unknown',
    version: backendPlugin.version,
    permissions: backendPlugin.permissions.map(transformPluginPermission),
  }
}

function buildServerInfo(body: CreateSessionRequest): ServerInfo {
  if (body.serverInfo) {
    if (!body.serverInfo.installedPlugins && body.installedPlugins) {
      return {
        ...body.serverInfo,
        installedPlugins: body.installedPlugins.map(transformInstalledPlugin),
      }
    }
    return body.serverInfo
  }

  return {
    serverName: body.metadata?.serverName || 'Unknown',
    pluginVersion: body.metadata?.pluginVersion || 'Unknown',
    storageType: 'json',
    contextCalculators: [],
    playerCount: body.metadata?.playerCount || 0,
    installedPlugins: body.installedPlugins?.map(transformInstalledPlugin),
  }
}

function parseNegatedPermission(node: string): { permission: string; isNegated: boolean } {
  if (node.startsWith('-')) {
    return { permission: node.slice(1), isNegated: true }
  }
  return { permission: node, isNegated: false }
}

function transformNode(backendNode: BackendNode): Node {
  const { permission, isNegated } = parseNegatedPermission(backendNode.node)

  return {
    permission,
    value: isNegated ? false : backendNode.value,
    expiry: backendNode.expiry ?? null,
    contexts: backendNode.contexts,
  }
}

function transformGroup(backendGroup: BackendGroup): Group {
  return {
    name: backendGroup.name,
    displayName: backendGroup.displayName,
    weight: backendGroup.weight,
    prefix: backendGroup.prefix ?? null,
    suffix: backendGroup.suffix ?? null,
    prefixPriority: backendGroup.prefixPriority ?? 0,
    suffixPriority: backendGroup.suffixPriority ?? 0,
    permissions: backendGroup.permissions.map(transformNode),
    parents: backendGroup.parents,
  }
}

function transformUser(backendUser: BackendUser): User {
  return {
    uuid: backendUser.uuid,
    username: backendUser.username ?? null,
    primaryGroup: backendUser.primaryGroup,
    groups: backendUser.groups,
    permissions: backendUser.permissions.map(transformNode),
    customPrefix: backendUser.customPrefix ?? null,
    customSuffix: backendUser.customSuffix ?? null,
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const { allowed, remaining } = await checkRateLimit(
      `rate:session:create:${ip}`,
      RATE_LIMITS.SESSION_CREATE.limit,
      RATE_LIMITS.SESSION_CREATE.windowSeconds
    )

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many session creation requests. Please try again later.' },
        {
          status: 429,
          headers: { 'X-RateLimit-Remaining': remaining.toString() }
        }
      )
    }

    const rawBody = await request.json()

    const parseResult = sessionCreateSchema.safeParse(rawBody)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const body = parseResult.data as CreateSessionRequest

    const store = getSessionStore()

    const sessionId = nanoid(16)
    const now = Date.now()

    const permissionData: PermissionData = {
      groups: (body.groups || []).map(transformGroup),
      users: (body.users || []).map(transformUser),
      tracks: body.tracks || [],
    }

    const session: Session = {
      id: sessionId,
      created: now,
      lastModified: now,
      expiresAt: now + (SESSION_TTL_SECONDS * 1000),
      original: JSON.parse(JSON.stringify(permissionData)),
      current: permissionData,
      serverInfo: buildServerInfo(body),
    }

    await store.set(`session:${sessionId}`, JSON.stringify(session), SESSION_TTL_SECONDS)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const response: SessionCreateResponse = {
      sessionId,
      expiresAt: session.expiresAt,
      url: `${appUrl}/editor/${sessionId}`,
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Failed to create session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
