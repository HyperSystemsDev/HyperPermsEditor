'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Tabs, TabPanel } from '@/components/ui/Tabs'
import { Select } from '@/components/ui/Select'
import {
  PERMISSION_REGISTRY,
  PERMISSION_CATEGORIES,
  searchPermissions,
  getSuggestions,
  getPermissionsByCategory,
  type PermissionDefinition,
  type PermissionCategory,
} from '@/lib/permissionRegistry'
import { isValidPermission } from '@/lib/permissions'
import { cn } from '@/lib/utils'
import type { ContextSet, ServerInfo } from '@/lib/types'
import {
  Search,
  FolderOpen,
  Clock,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Calendar,
  Globe,
  Gamepad2,
  Settings2,
  Loader2,
} from 'lucide-react'

// Storage key for recent permissions
const RECENT_PERMISSIONS_KEY = 'hp-recent-permissions'
const MAX_RECENT = 20

interface AddPermissionModalProps {
  existingPermissions: string[]
  onAdd: (
    permission: string,
    value: boolean,
    contexts?: ContextSet,
    expiry?: number | null
  ) => void
  onAddMultiple?: (
    permissions: Array<{
      permission: string
      value: boolean
      contexts?: ContextSet
      expiry?: number | null
    }>
  ) => void
  onClose: () => void
  serverInfo?: ServerInfo
}

interface SelectedPermission {
  node: string
  value: boolean
  definition?: PermissionDefinition
}

// Get recent permissions from localStorage
function getRecentPermissions(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_PERMISSIONS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save a permission to recent list
function saveToRecent(permission: string) {
  if (typeof window === 'undefined') return
  try {
    const recent = getRecentPermissions()
    const filtered = recent.filter((p) => p !== permission)
    const updated = [permission, ...filtered].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_PERMISSIONS_KEY, JSON.stringify(updated))
  } catch {
    // Ignore storage errors
  }
}

// Get merged permissions from static registry + installed plugins
function getMergedPermissions(serverInfo: ServerInfo | undefined): {
  permissions: PermissionDefinition[]
  installedNodes: Set<string>
  pluginCategories: PermissionCategory[]
} {
  const staticPerms = [...PERMISSION_REGISTRY]
  const installedNodes = new Set<string>()
  const pluginCategories: PermissionCategory[] = []
  const pluginCategoryIds = new Set<string>()

  if (serverInfo?.installedPlugins) {
    for (const plugin of serverInfo.installedPlugins) {
      // Create a category ID for this plugin (lowercase, no spaces)
      const categoryId = `plugin-${plugin.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`

      // Only add category if plugin has permissions and we haven't added it yet
      if (plugin.permissions.length > 0 && !pluginCategoryIds.has(categoryId)) {
        pluginCategoryIds.add(categoryId)
        pluginCategories.push({
          id: categoryId,
          name: plugin.name,
          description: `Permissions from ${plugin.name} plugin`,
          icon: 'Package',
          color: '#10b981', // Green for discovered plugins
        })
      }

      for (const perm of plugin.permissions) {
        installedNodes.add(perm.node)
        // Check if exists in static registry
        const existing = staticPerms.find((p) => p.node === perm.node)
        if (!existing) {
          // Add permission from installed plugin with plugin-specific category
          staticPerms.push({
            node: perm.node,
            description: perm.description,
            category: categoryId,
            default: perm.default,
            children: perm.children,
          })
        }
      }
    }
  }

  return { permissions: staticPerms, installedNodes, pluginCategories }
}

// Search merged permissions with scoring
function searchMergedPermissions(
  permissions: PermissionDefinition[],
  query: string,
  installedNodes: Set<string>,
  maxResults = 10
): PermissionDefinition[] {
  const queryLower = query.toLowerCase().trim()
  if (!queryLower) return []

  // Score each permission based on match quality
  const scored = permissions
    .filter((p) => !p.deprecated)
    .map((p) => {
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
      // Contains query
      else if (nodeLower.includes(queryLower)) {
        score = 60
      }
      // Description contains query
      else if (descLower.includes(queryLower)) {
        score = 40
      }
      // Fuzzy match on node parts
      else {
        const parts = nodeLower.split('.')
        for (const part of parts) {
          if (part.startsWith(queryLower)) {
            score = Math.max(score, 50)
          } else if (part.includes(queryLower)) {
            score = Math.max(score, 30)
          }
        }
      }

      // Boost installed permissions
      if (installedNodes.has(p.node)) {
        score += 10
      }

      return { permission: p, score }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => s.permission)

  return scored
}

export function AddPermissionModal({
  existingPermissions,
  onAdd,
  onAddMultiple,
  onClose,
  serverInfo,
}: AddPermissionModalProps) {
  const t = useTranslations('editor.permissions')
  const tContexts = useTranslations('editor.contexts')
  const tDurations = useTranslations('editor.durations')
  const tCommon = useTranslations('buttons')

  // Duration presets in milliseconds
  const DURATION_PRESETS = [
    { label: '1h', value: 60 * 60 * 1000, display: tDurations('1h') },
    { label: '6h', value: 6 * 60 * 60 * 1000, display: tDurations('6h') },
    { label: '24h', value: 24 * 60 * 60 * 1000, display: tDurations('24h') },
    { label: '7d', value: 7 * 24 * 60 * 60 * 1000, display: tDurations('7d') },
    { label: '30d', value: 30 * 24 * 60 * 60 * 1000, display: tDurations('30d') },
  ]

  // Gamemode options
  const GAMEMODES = [
    { value: 'survival', label: tContexts('gamemodes.survival') },
    { value: 'creative', label: tContexts('gamemodes.creative') },
    { value: 'adventure', label: tContexts('gamemodes.adventure') },
    { value: 'spectator', label: tContexts('gamemodes.spectator') },
  ]

  // Tab state
  const [activeTab, setActiveTab] = useState<'search' | 'browse' | 'recent'>('search')

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [suggestions, setSuggestions] = useState<PermissionDefinition[]>([])
  const [didYouMean, setDidYouMean] = useState<string[]>([])

  // Permission state
  const [permission, setPermission] = useState('')
  const [value, setValue] = useState(true)
  const [error, setError] = useState('')

  // Batch mode state
  const [batchMode, setBatchMode] = useState(false)
  const [batchText, setBatchText] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<SelectedPermission[]>([])

  // Context state
  const [showContexts, setShowContexts] = useState(false)
  const [worldContext, setWorldContext] = useState('')
  const [gamemodeContext, setGamemodeContext] = useState('')
  const [customContexts, setCustomContexts] = useState<Array<{ key: string; value: string }>>([])

  // Temporary permission state
  const [isTemporary, setIsTemporary] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [customExpiry, setCustomExpiry] = useState('')

  // Browse state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Loading state
  const [isAdding, setIsAdding] = useState(false)

  // Recent permissions
  const [recentPermissions, setRecentPermissions] = useState<string[]>([])

  // Get merged permissions from static registry + installed plugins
  const { permissions: mergedPermissions, installedNodes, pluginCategories } = useMemo(
    () => getMergedPermissions(serverInfo),
    [serverInfo]
  )

  // Combine static categories with dynamic plugin categories
  const allCategories = useMemo(() => {
    // Filter out the "economy" category if it has no permissions (since economy is dynamically discovered)
    const staticWithoutEmpty = PERMISSION_CATEGORIES.filter((cat) => {
      if (cat.id === 'economy') {
        // Only include economy if there are static economy permissions
        return getPermissionsByCategory('economy').length > 0
      }
      return true
    })
    return [...staticWithoutEmpty, ...pluginCategories]
  }, [pluginCategories])

  // Get permissions for a category (works with both static and dynamic plugin categories)
  const getPermissionsForCategory = useCallback(
    (categoryId: string): PermissionDefinition[] => {
      if (categoryId.startsWith('plugin-')) {
        // Dynamic plugin category - filter from merged permissions
        return mergedPermissions.filter((p) => p.category === categoryId)
      }
      // Static category
      return getPermissionsByCategory(categoryId)
    },
    [mergedPermissions]
  )

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Load recent permissions on mount
  useEffect(() => {
    setRecentPermissions(getRecentPermissions())
  }, [])

  // Search permissions when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      setDidYouMean([])
      return
    }

    // Use merged permissions for search (includes installed plugins)
    const results = searchMergedPermissions(
      mergedPermissions,
      searchQuery,
      installedNodes,
      10
    )

    // Filter out already existing permissions
    const filtered = results.filter((p) => !existingPermissions.includes(p.node))
    setSuggestions(filtered)

    // If no results, try to get "did you mean" suggestions
    if (filtered.length === 0 && searchQuery.length >= 3) {
      const typoSuggestions = getSuggestions(searchQuery).filter(
        (s) => !existingPermissions.includes(s)
      )
      setDidYouMean(typoSuggestions)
    } else {
      setDidYouMean([])
    }

    setSelectedIndex(0)
  }, [searchQuery, existingPermissions, mergedPermissions, installedNodes])

  // Reset selected index when suggestions change
  useEffect(() => {
    if (selectedIndex >= suggestions.length) {
      setSelectedIndex(Math.max(0, suggestions.length - 1))
    }
  }, [suggestions.length, selectedIndex])

  // Focus search input on tab change
  useEffect(() => {
    if (activeTab === 'search' && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [activeTab])

  // Build contexts object
  const buildContexts = useCallback((): ContextSet | undefined => {
    if (!showContexts) return undefined

    const contexts: ContextSet = {}
    if (worldContext.trim()) contexts.world = worldContext.trim()
    if (gamemodeContext) contexts.gamemode = gamemodeContext
    customContexts.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) {
        contexts[key.trim()] = value.trim()
      }
    })

    return Object.keys(contexts).length > 0 ? contexts : undefined
  }, [showContexts, worldContext, gamemodeContext, customContexts])

  // Calculate expiry timestamp
  const getExpiry = useCallback((): number | null => {
    if (!isTemporary) return null

    if (selectedDuration) {
      return Date.now() + selectedDuration
    }

    if (customExpiry) {
      const date = new Date(customExpiry)
      if (!isNaN(date.getTime())) {
        return date.getTime()
      }
    }

    return null
  }, [isTemporary, selectedDuration, customExpiry])

  // Format expiry for display
  const expiryDisplay = useMemo(() => {
    const expiry = getExpiry()
    if (!expiry) return null

    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(expiry))
  }, [getExpiry])

  // Handle keyboard navigation in suggestions
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (suggestions.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (suggestions[selectedIndex]) {
            selectPermission(suggestions[selectedIndex])
          }
          break
        case 'Tab':
          if (suggestions[selectedIndex]) {
            e.preventDefault()
            selectPermission(suggestions[selectedIndex])
          }
          break
      }
    },
    [suggestions, selectedIndex]
  )

  // Select a permission from suggestions
  const selectPermission = useCallback(
    (perm: PermissionDefinition) => {
      if (batchMode) {
        // Add to selected list
        if (!selectedPermissions.find((p) => p.node === perm.node)) {
          setSelectedPermissions((prev) => [
            ...prev,
            { node: perm.node, value: true, definition: perm },
          ])
        }
        setSearchQuery('')
      } else {
        setPermission(perm.node)
        setSearchQuery('')
        setError('')
      }
    },
    [batchMode, selectedPermissions]
  )

  // Toggle category expansion
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }, [])

  // Toggle permission in batch mode
  const toggleBatchPermission = useCallback((perm: PermissionDefinition) => {
    setSelectedPermissions((prev) => {
      const existing = prev.find((p) => p.node === perm.node)
      if (existing) {
        return prev.filter((p) => p.node !== perm.node)
      }
      return [...prev, { node: perm.node, value: true, definition: perm }]
    })
  }, [])

  // Toggle permission value in batch
  const toggleBatchValue = useCallback((node: string) => {
    setSelectedPermissions((prev) =>
      prev.map((p) => (p.node === node ? { ...p, value: !p.value } : p))
    )
  }, [])

  // Remove permission from batch
  const removeBatchPermission = useCallback((node: string) => {
    setSelectedPermissions((prev) => prev.filter((p) => p.node !== node))
  }, [])

  // Parse batch text input
  const parseBatchText = useCallback((text: string): string[] => {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && isValidPermission(line))
  }, [])

  // Validate single permission
  const validatePermission = useCallback(
    (perm: string): string | null => {
      if (!perm.trim()) return t('permissionCannotBeEmpty')
      if (!isValidPermission(perm)) return t('invalidPermissionFormat')
      if (existingPermissions.includes(perm)) return t('permissionAlreadyExists')
      return null
    },
    [existingPermissions, t]
  )

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const contexts = buildContexts()
      const expiry = getExpiry()

      if (batchMode) {
        // Batch mode submission
        const permissionsToAdd: Array<{
          permission: string
          value: boolean
          contexts?: ContextSet
          expiry?: number | null
        }> = []

        // Add from selected list
        selectedPermissions.forEach((p) => {
          if (!existingPermissions.includes(p.node)) {
            permissionsToAdd.push({
              permission: p.node,
              value: p.value,
              contexts,
              expiry,
            })
          }
        })

        // Add from batch text
        const textPermissions = parseBatchText(batchText)
        textPermissions.forEach((perm) => {
          if (
            !existingPermissions.includes(perm) &&
            !permissionsToAdd.find((p) => p.permission === perm)
          ) {
            permissionsToAdd.push({
              permission: perm,
              value: value,
              contexts,
              expiry,
            })
          }
        })

        if (permissionsToAdd.length === 0) {
          setError(t('noValidPermissionsToAdd'))
          return
        }

        setIsAdding(true)

        // Add permissions
        if (onAddMultiple) {
          onAddMultiple(permissionsToAdd)
        } else {
          // Fallback to adding one at a time
          permissionsToAdd.forEach((p) => {
            onAdd(p.permission, p.value, p.contexts, p.expiry)
          })
        }

        // Save to recent
        permissionsToAdd.forEach((p) => saveToRecent(p.permission))

        setTimeout(() => {
          setIsAdding(false)
          onClose()
        }, 300)
      } else {
        // Single permission mode
        const validationError = validatePermission(permission)
        if (validationError) {
          setError(validationError)
          return
        }

        setIsAdding(true)
        onAdd(permission, value, contexts, expiry)
        saveToRecent(permission)

        setTimeout(() => {
          setIsAdding(false)
          onClose()
        }, 300)
      }
    },
    [
      batchMode,
      selectedPermissions,
      batchText,
      permission,
      value,
      existingPermissions,
      buildContexts,
      getExpiry,
      onAdd,
      onAddMultiple,
      onClose,
      parseBatchText,
      validatePermission,
      t,
    ]
  )

  // Add a custom context field
  const addCustomContext = useCallback(() => {
    setCustomContexts((prev) => [...prev, { key: '', value: '' }])
  }, [])

  // Update custom context
  const updateCustomContext = useCallback(
    (index: number, field: 'key' | 'value', newValue: string) => {
      setCustomContexts((prev) =>
        prev.map((ctx, i) => (i === index ? { ...ctx, [field]: newValue } : ctx))
      )
    },
    []
  )

  // Remove custom context
  const removeCustomContext = useCallback((index: number) => {
    setCustomContexts((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // Build preview string
  const previewString = useMemo(() => {
    const perm = batchMode
      ? selectedPermissions.length > 0
        ? selectedPermissions[0].node
        : 'permission.node'
      : permission || 'permission.node'

    // Determine the effective value for the preview
    const effectiveValue = batchMode
      ? selectedPermissions.length > 0
        ? selectedPermissions[0].value
        : true
      : value

    // Add '-' prefix for denied permissions
    let preview = effectiveValue ? perm : `-${perm}`
    const contexts = buildContexts()
    if (contexts) {
      Object.entries(contexts).forEach(([k, v]) => {
        preview += ` ${k}=${v}`
      })
    }
    return preview
  }, [batchMode, selectedPermissions, permission, value, buildContexts])

  // Count permissions to add
  const permissionCount = useMemo(() => {
    if (batchMode) {
      const textCount = parseBatchText(batchText).filter(
        (p) => !existingPermissions.includes(p)
      ).length
      const selectedCount = selectedPermissions.filter(
        (p) => !existingPermissions.includes(p.node)
      ).length
      return textCount + selectedCount
    }
    return permission && !existingPermissions.includes(permission) ? 1 : 0
  }, [batchMode, batchText, selectedPermissions, permission, existingPermissions, parseBatchText])

  return (
    <Modal isOpen onClose={onClose} title={t('title')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(v) => setActiveTab(v as 'search' | 'browse' | 'recent')}
          options={[
            { value: 'search', label: t('search'), icon: <Search className="w-3.5 h-3.5" /> },
            { value: 'browse', label: t('browse'), icon: <FolderOpen className="w-3.5 h-3.5" /> },
            { value: 'recent', label: t('recent'), icon: <Clock className="w-3.5 h-3.5" /> },
          ]}
          className="w-full"
        />

        {/* Batch mode toggle */}
        <div className="flex items-center justify-between">
          <Toggle
            checked={batchMode}
            onChange={setBatchMode}
            label={t('addMultiple')}
            description={batchMode ? t('selectMultiplePermissions') : undefined}
          />
          {batchMode && permissionCount > 0 && (
            <span className="text-sm text-hp-primary font-medium">
              {permissionCount === 1
                ? t('addingCount', { count: permissionCount })
                : t('addingCountPlural', { count: permissionCount })}
            </span>
          )}
        </div>

        {/* Search Tab */}
        <TabPanel value="search" activeValue={activeTab}>
          <div className="space-y-3">
            {/* Search input */}
            <div className="relative">
              <Input
                ref={searchInputRef}
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-10"
                autoFocus
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hp-text-muted" />
            </div>

            {/* Suggestions dropdown */}
            {searchQuery && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="max-h-64 overflow-y-auto rounded-lg border border-hp-border bg-hp-surface-2"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.node}
                    type="button"
                    onClick={() => selectPermission(suggestion)}
                    className={cn(
                      'w-full px-3 py-2 text-left transition-colors',
                      'flex items-start gap-3',
                      index === selectedIndex
                        ? 'bg-hp-primary/10 text-hp-text'
                        : 'text-hp-text-muted hover:bg-hp-surface hover:text-hp-text'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm truncate flex items-center gap-2">
                        {suggestion.node}
                        {installedNodes.has(suggestion.node) && (
                          <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                            Installed
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-hp-text-muted truncate">
                        {suggestion.description}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-xs px-1.5 py-0.5 rounded shrink-0',
                        suggestion.default === 'op'
                          ? 'bg-hp-danger/20 text-hp-danger'
                          : suggestion.default === 'true'
                            ? 'bg-hp-success/20 text-hp-success'
                            : 'bg-hp-surface text-hp-text-muted'
                      )}
                    >
                      {suggestion.default}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Did you mean suggestions */}
            {didYouMean.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-hp-warning" />
                <span className="text-hp-text-muted">{t('didYouMean')}</span>
                {didYouMean.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setSearchQuery(suggestion)}
                    className="font-mono text-hp-primary hover:underline"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}


            {/* Selected permissions list (batch mode) */}
            {batchMode && selectedPermissions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-hp-text-muted font-medium">
                  {t('selectedPermissions')}
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedPermissions.map((perm) => (
                    <div
                      key={perm.node}
                      className="flex items-center gap-2 p-2 rounded-lg bg-hp-surface-2"
                    >
                      <button
                        type="button"
                        onClick={() => toggleBatchValue(perm.node)}
                        className={cn(
                          'w-5 h-5 rounded flex items-center justify-center text-xs font-bold',
                          perm.value
                            ? 'bg-hp-success/20 text-hp-success'
                            : 'bg-hp-danger/20 text-hp-danger'
                        )}
                      >
                        {perm.value ? 'T' : 'F'}
                      </button>
                      <span className="flex-1 font-mono text-xs text-hp-text truncate">
                        {perm.node}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBatchPermission(perm.node)}
                        className="p-1 rounded hover:bg-hp-surface text-hp-text-muted hover:text-hp-danger"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Batch text input */}
            {batchMode && (
              <div>
                <label className="block text-sm font-medium text-hp-text mb-1.5">
                  {t('orPastePermissions')}
                </label>
                <textarea
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  placeholder="permission.node.one&#10;permission.node.two&#10;permission.node.three"
                  className={cn(
                    'w-full h-24 px-3 py-2 rounded-lg bg-hp-surface border border-hp-border',
                    'text-hp-text placeholder:text-hp-text-muted font-mono text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-hp-primary focus:border-transparent',
                    'resize-none'
                  )}
                />
              </div>
            )}

            {/* Manual input for single mode */}
            {!batchMode && !searchQuery && (
              <Input
                label={t('orEnterManually')}
                placeholder="example.permission.node"
                value={permission}
                onChange={(e) => {
                  setPermission(e.target.value)
                  setError('')
                }}
                error={error}
                className="font-mono"
              />
            )}
          </div>
        </TabPanel>

        {/* Browse Tab */}
        <TabPanel value="browse" activeValue={activeTab}>
          <div className="max-h-80 overflow-y-auto space-y-1 rounded-lg border border-hp-border">
            {allCategories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                permissions={getPermissionsForCategory(category.id)}
                expanded={expandedCategories.has(category.id)}
                onToggle={() => toggleCategory(category.id)}
                existingPermissions={existingPermissions}
                selectedPermissions={selectedPermissions}
                batchMode={batchMode}
                installedNodes={installedNodes}
                onSelectPermission={(perm) => {
                  if (batchMode) {
                    toggleBatchPermission(perm)
                  } else {
                    setPermission(perm.node)
                    setActiveTab('search')
                  }
                }}
              />
            ))}
          </div>
        </TabPanel>

        {/* Recent Tab */}
        <TabPanel value="recent" activeValue={activeTab}>
          {recentPermissions.length === 0 ? (
            <div className="text-center py-8 text-hp-text-muted">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>{t('noRecentPermissions')}</p>
              <p className="text-sm">{t('permissionsYouAddWillAppearHere')}</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {recentPermissions
                .filter((p) => !existingPermissions.includes(p))
                .map((perm) => {
                  const definition = PERMISSION_REGISTRY.find((d) => d.node === perm)
                  const isSelected = selectedPermissions.some((sp) => sp.node === perm)
                  return (
                    <button
                      key={perm}
                      type="button"
                      onClick={() => {
                        if (batchMode) {
                          if (isSelected) {
                            removeBatchPermission(perm)
                          } else {
                            setSelectedPermissions((prev) => [
                              ...prev,
                              { node: perm, value: true, definition },
                            ])
                          }
                        } else {
                          setPermission(perm)
                          setActiveTab('search')
                        }
                      }}
                      className={cn(
                        'w-full px-3 py-2 text-left rounded-lg transition-colors',
                        'flex items-center gap-3',
                        isSelected
                          ? 'bg-hp-primary/10 text-hp-text'
                          : 'hover:bg-hp-surface-2 text-hp-text-muted hover:text-hp-text'
                      )}
                    >
                      {batchMode && (
                        <div
                          className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center',
                            isSelected
                              ? 'bg-hp-primary border-hp-primary'
                              : 'border-hp-border'
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm truncate flex items-center gap-2">
                          {perm}
                          {installedNodes.has(perm) && (
                            <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                              Installed
                            </span>
                          )}
                        </div>
                        {definition && (
                          <div className="text-xs text-hp-text-muted truncate">
                            {definition.description}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
            </div>
          )}
        </TabPanel>

        {/* Permission Value Toggle (single mode only) */}
        {!batchMode && (
          <Toggle
            checked={value}
            onChange={setValue}
            label={t('permissionValue')}
            description={value ? t('allow') : t('deny')}
          />
        )}

        {/* Context Section */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowContexts(!showContexts)}
            className="flex items-center gap-2 text-sm text-hp-text-muted hover:text-hp-text transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            <span>{t('addContext')}</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform',
                showContexts && 'rotate-180'
              )}
            />
          </button>

          {showContexts && (
            <div className="space-y-3 p-3 rounded-lg bg-hp-surface-2 border border-hp-border">
              {/* World context */}
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-hp-text-muted shrink-0" />
                <Input
                  placeholder={t('worldName')}
                  value={worldContext}
                  onChange={(e) => setWorldContext(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* Gamemode context */}
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-4 h-4 text-hp-text-muted shrink-0" />
                <Select
                  options={GAMEMODES}
                  value={gamemodeContext}
                  onChange={setGamemodeContext}
                  placeholder={t('selectGamemode')}
                  className="flex-1"
                />
              </div>

              {/* Custom contexts */}
              {customContexts.map((ctx, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={t('key')}
                    value={ctx.key}
                    onChange={(e) => updateCustomContext(index, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-hp-text-muted">=</span>
                  <Input
                    placeholder={t('value')}
                    value={ctx.value}
                    onChange={(e) => updateCustomContext(index, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomContext(index)}
                    className="p-2 rounded hover:bg-hp-surface text-hp-text-muted hover:text-hp-danger"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addCustomContext}
                className="flex items-center gap-2 text-sm text-hp-primary hover:text-hp-primary/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('addCustomContext')}
              </button>

              {/* Context preview */}
              {(worldContext || gamemodeContext || customContexts.some((c) => c.key && c.value)) && (
                <div className="pt-2 border-t border-hp-border">
                  <p className="text-xs text-hp-text-muted mb-1">{t('preview')}</p>
                  <code className="text-xs font-mono text-hp-text bg-hp-surface px-2 py-1 rounded block">
                    {previewString}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Temporary Permission Section */}
        <div className="space-y-3">
          <Toggle
            checked={isTemporary}
            onChange={(checked) => {
              setIsTemporary(checked)
              if (!checked) {
                setSelectedDuration(null)
                setCustomExpiry('')
              }
            }}
            label={t('temporaryPermission')}
            description={isTemporary ? t('setExpiryTime') : undefined}
          />

          {isTemporary && (
            <div className="space-y-3 p-3 rounded-lg bg-hp-surface-2 border border-hp-border">
              {/* Duration presets */}
              <div className="flex flex-wrap gap-2">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setSelectedDuration(preset.value)
                      setCustomExpiry('')
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      selectedDuration === preset.value
                        ? 'bg-hp-primary text-white'
                        : 'bg-hp-surface text-hp-text-muted hover:text-hp-text'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom date/time */}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-hp-text-muted shrink-0" />
                <input
                  type="datetime-local"
                  value={customExpiry}
                  onChange={(e) => {
                    setCustomExpiry(e.target.value)
                    setSelectedDuration(null)
                  }}
                  min={new Date().toISOString().slice(0, 16)}
                  className={cn(
                    'flex-1 h-10 px-3 rounded-lg bg-hp-surface border border-hp-border',
                    'text-hp-text focus:outline-none focus:ring-2 focus:ring-hp-primary focus:border-transparent',
                    '[color-scheme:dark]'
                  )}
                />
              </div>

              {/* Expiry preview */}
              {expiryDisplay && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-hp-warning" />
                  <span className="text-hp-text-muted">{t('expires')}</span>
                  <span className="text-hp-text font-medium">{expiryDisplay}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-hp-danger">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Footer */}
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {tCommon('cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              isAdding ||
              (batchMode
                ? permissionCount === 0
                : !permission || !!validatePermission(permission))
            }
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('adding')}
              </>
            ) : batchMode && permissionCount > 1 ? (
              t('addPermissions', { count: permissionCount })
            ) : (
              t('addPermission')
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

// Category Section Component
interface CategorySectionProps {
  category: PermissionCategory
  permissions: PermissionDefinition[]
  expanded: boolean
  onToggle: () => void
  existingPermissions: string[]
  selectedPermissions: SelectedPermission[]
  batchMode: boolean
  installedNodes: Set<string>
  onSelectPermission: (perm: PermissionDefinition) => void
}

function CategorySection({
  category,
  permissions,
  expanded,
  onToggle,
  existingPermissions,
  selectedPermissions,
  batchMode,
  installedNodes,
  onSelectPermission,
}: CategorySectionProps) {
  const availableCount = permissions.filter((p) => !existingPermissions.includes(p.node)).length

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full px-3 py-2 flex items-center gap-3 transition-colors',
          'hover:bg-hp-surface-2',
          expanded && 'bg-hp-surface-2'
        )}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-hp-text-muted" />
        ) : (
          <ChevronRight className="w-4 h-4 text-hp-text-muted" />
        )}
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <span className="flex-1 text-left text-sm font-medium text-hp-text">
          {category.name}
        </span>
        <span className="text-xs text-hp-text-muted">{availableCount}</span>
      </button>

      {expanded && (
        <div className="pl-9 pr-3 pb-2 space-y-1">
          {permissions.map((perm) => {
            const isExisting = existingPermissions.includes(perm.node)
            const isSelected = selectedPermissions.some((sp) => sp.node === perm.node)

            return (
              <button
                key={perm.node}
                type="button"
                disabled={isExisting}
                onClick={() => onSelectPermission(perm)}
                className={cn(
                  'w-full px-2 py-1.5 text-left rounded transition-colors',
                  'flex items-center gap-2',
                  isExisting
                    ? 'opacity-50 cursor-not-allowed'
                    : isSelected
                      ? 'bg-hp-primary/10 text-hp-text'
                      : 'hover:bg-hp-surface text-hp-text-muted hover:text-hp-text'
                )}
              >
                {batchMode && (
                  <div
                    className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                      isSelected
                        ? 'bg-hp-primary border-hp-primary'
                        : 'border-hp-border'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs truncate flex items-center gap-1.5">
                    {perm.node}
                    {installedNodes.has(perm.node) && (
                      <span className="px-1 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded">
                        Installed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-hp-text-muted truncate">{perm.description}</div>
                </div>
                <span
                  className={cn(
                    'text-xs px-1 py-0.5 rounded shrink-0',
                    perm.default === 'op'
                      ? 'bg-hp-danger/20 text-hp-danger'
                      : perm.default === 'true'
                        ? 'bg-hp-success/20 text-hp-success'
                        : 'bg-hp-surface text-hp-text-muted'
                  )}
                >
                  {perm.default}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
