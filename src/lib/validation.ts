import { z } from 'zod'

// Permission node schema (backend format)
export const backendNodeSchema = z.object({
  node: z.string().min(1),
  value: z.boolean(),
  expiry: z.number().nullable().optional(),
  contexts: z.record(z.string(), z.string()).optional(),
})

// Group schema (backend format)
export const backendGroupSchema = z.object({
  name: z.string().min(1).regex(/^[a-z0-9_-]+$/, 'Group name must be lowercase alphanumeric with dashes/underscores'),
  displayName: z.string().optional(),
  weight: z.number().int(),
  prefix: z.string().nullable().optional(),
  suffix: z.string().nullable().optional(),
  prefixPriority: z.number().int().optional(),
  suffixPriority: z.number().int().optional(),
  permissions: z.array(backendNodeSchema),
  parents: z.array(z.string()),
})

// User schema (backend format)
export const backendUserSchema = z.object({
  uuid: z.string().uuid(),
  username: z.string().nullable().optional(),
  primaryGroup: z.string().min(1),
  groups: z.array(z.string()),
  permissions: z.array(backendNodeSchema),
  customPrefix: z.string().nullable().optional(),
  customSuffix: z.string().nullable().optional(),
})

// Track schema
export const trackSchema = z.object({
  name: z.string().min(1).regex(/^[a-z0-9_-]+$/),
  groups: z.array(z.string()),
})

// Server info schema
export const serverInfoSchema = z.object({
  serverName: z.string().optional(),
  pluginVersion: z.string().optional(),
  storageType: z.string().optional(),
  contextCalculators: z.array(z.string()).optional(),
  playerCount: z.number().int().nonnegative().optional(),
  installedPlugins: z.array(z.object({
    name: z.string(),
    version: z.string(),
    permissions: z.array(z.object({
      node: z.string(),
      description: z.string(),
      default: z.enum(['op', 'true', 'false']),
      children: z.array(z.string()).optional(),
    })),
  })).optional(),
})

// Backend metadata schema (alternative to serverInfo)
export const backendMetadataSchema = z.object({
  serverName: z.string().optional(),
  pluginVersion: z.string().optional(),
  playerCount: z.number().int().nonnegative().optional(),
})

// Backend plugin permission schema
export const backendPluginPermissionSchema = z.object({
  node: z.string(),
  description: z.string(),
  defaultValue: z.string().optional(),
  default: z.string().optional(),
  children: z.array(z.string()).optional(),
})

// Backend installed plugin schema
export const backendInstalledPluginSchema = z.object({
  pluginName: z.string().optional(),
  name: z.string().optional(),
  version: z.string(),
  permissions: z.array(backendPluginPermissionSchema),
})

// Session create request schema
export const sessionCreateSchema = z.object({
  groups: z.array(backendGroupSchema).min(1, 'At least one group is required'),
  users: z.array(backendUserSchema).optional().default([]),
  tracks: z.array(trackSchema).optional().default([]),
  serverInfo: serverInfoSchema.optional(),
  // Backend sends these separately from serverInfo
  metadata: backendMetadataSchema.optional(),
  installedPlugins: z.array(backendInstalledPluginSchema).optional(),
})

// Frontend permission node schema
export const nodeSchema = z.object({
  permission: z.string().min(1),
  value: z.boolean(),
  expiry: z.number().nullable().optional(),
  contexts: z.record(z.string(), z.string()).optional(),
})

// Frontend group schema
export const groupSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().optional(),
  weight: z.number().int(),
  prefix: z.string().nullable().optional(),
  suffix: z.string().nullable().optional(),
  prefixPriority: z.number().int().optional(),
  suffixPriority: z.number().int().optional(),
  permissions: z.array(nodeSchema),
  parents: z.array(z.string()),
})

// Frontend user schema
export const userSchema = z.object({
  uuid: z.string().uuid(),
  username: z.string().nullable().optional(),
  primaryGroup: z.string().min(1),
  groups: z.array(z.string()),
  permissions: z.array(nodeSchema),
  customPrefix: z.string().nullable().optional(),
  customSuffix: z.string().nullable().optional(),
})

// Permission data schema (frontend format)
export const permissionDataSchema = z.object({
  groups: z.array(groupSchema),
  users: z.array(userSchema),
  tracks: z.array(trackSchema),
})

// Session update request schema
export const sessionUpdateSchema = z.object({
  current: permissionDataSchema,
})

// Export types
export type SessionCreateInput = z.infer<typeof sessionCreateSchema>
export type SessionUpdateInput = z.infer<typeof sessionUpdateSchema>
