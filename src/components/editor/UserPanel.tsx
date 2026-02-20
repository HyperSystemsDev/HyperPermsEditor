'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { User, Plus } from 'lucide-react'
import type { User as UserType, Group, Node, ContextSet, ServerInfo } from '@/lib/types'
import { getPermissionString } from '@/lib/utils'
import { SearchInput } from '@/components/ui/SearchInput'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { PermissionList } from './PermissionList'
import { AddPermissionModal } from './AddPermissionModal'
import { ColorPreview } from './ColorPreview'

interface UserPanelProps {
  users: UserType[]
  groups: Group[]
  onUpdate: (users: UserType[]) => void
  serverInfo?: ServerInfo
}

export function UserPanel({ users, groups, onUpdate, serverInfo }: UserPanelProps) {
  const t = useTranslations('editor.users')
  const tCommon = useTranslations('buttons')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showAddPerm, setShowAddPerm] = useState(false)

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.uuid.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const rawSelected = users.find((u) => u.uuid === selectedUser)
  const selected = rawSelected ? {
    ...rawSelected,
    groups: rawSelected.groups || [],
    permissions: rawSelected.permissions || [],
  } : null

  function handleUpdateUser(updated: UserType) {
    onUpdate(users.map((u) => (u.uuid === updated.uuid ? updated : u)))
  }

  function handleAddPermission(
    permission: string,
    value: boolean,
    contexts?: ContextSet,
    expiry?: number | null
  ) {
    if (!selected) return
    const newNode: Node = {
      permission,
      value,
      expiry: expiry ?? null,
      contexts: contexts || undefined,
    }
    handleUpdateUser({
      ...selected,
      permissions: [...selected.permissions, newNode],
    })
  }

  function handleAddMultiplePermissions(
    permissions: Array<{
      permission: string
      value: boolean
      contexts?: ContextSet
      expiry?: number | null
    }>
  ) {
    if (!selected) return
    const newNodes: Node[] = permissions.map((p) => ({
      permission: p.permission,
      value: p.value,
      expiry: p.expiry ?? null,
      contexts: p.contexts || undefined,
    }))
    handleUpdateUser({
      ...selected,
      permissions: [...selected.permissions, ...newNodes],
    })
  }

  function handleRemovePermission(permission: string) {
    if (!selected) return
    handleUpdateUser({
      ...selected,
      permissions: selected.permissions.filter((p) => getPermissionString(p) !== permission),
    })
  }

  function handleTogglePermission(permission: string) {
    if (!selected) return
    handleUpdateUser({
      ...selected,
      permissions: selected.permissions.map((p) =>
        getPermissionString(p) === permission ? { ...p, value: !p.value } : p
      ),
    })
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-72 border-r border-hp-border flex flex-col">
        <div className="p-4 border-b border-hp-border">
          <h2 className="text-lg font-semibold text-hp-text mb-4">{t('title')}</h2>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('searchByNameOrUuid')}
          />
        </div>

        <div className="flex-1 overflow-auto p-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-hp-text-muted">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{searchQuery ? t('noUsersFound') : t('noUsersWithCustomData')}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.uuid}
                  onClick={() => setSelectedUser(user.uuid)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    selectedUser === user.uuid
                      ? 'bg-hp-primary/20 text-hp-text'
                      : 'hover:bg-hp-surface-2 text-hp-text-muted hover:text-hp-text'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-hp-surface-2 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {user.username || t('unknown')}
                    </p>
                    <p className="text-xs text-hp-text-muted truncate">
                      {user.uuid}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {selected ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-hp-text">
                  {selected.username || t('unknownUser')}
                </h2>
                <p className="text-hp-text-muted font-mono text-sm">
                  {selected.uuid}
                </p>
              </div>
            </div>

            {/* Primary Group */}
            <Card title={t('primaryGroup')}>
              <Select
                value={selected.primaryGroup}
                onChange={(value) =>
                  handleUpdateUser({ ...selected, primaryGroup: value })
                }
                options={groups.map((g) => ({
                  value: g.name,
                  label: g.displayName || g.name,
                }))}
              />
            </Card>

            {/* Groups */}
            <Card title={t('userGroups')}>
              <div className="flex flex-wrap gap-2 mb-4">
                {selected.groups.map((groupName) => (
                  <Badge
                    key={groupName}
                    onRemove={() =>
                      handleUpdateUser({
                        ...selected,
                        groups: selected.groups.filter((g) => g !== groupName),
                      })
                    }
                  >
                    {groupName}
                  </Badge>
                ))}
                {selected.groups.length === 0 && (
                  <span className="text-hp-text-muted italic">{t('noAdditionalGroups')}</span>
                )}
              </div>
              <Select
                value=""
                placeholder={t('addToGroup')}
                options={groups
                  .filter((g) => !selected.groups.includes(g.name))
                  .map((g) => ({
                    value: g.name,
                    label: g.displayName || g.name,
                  }))}
                onChange={(value) => {
                  if (value && !selected.groups.includes(value)) {
                    // Find the new group and current primary group to compare weights
                    const newGroup = groups.find((g) => g.name === value)
                    const currentPrimaryGroup = groups.find((g) => g.name === selected.primaryGroup)

                    // Update primary group if new group has higher weight
                    const shouldUpdatePrimary = newGroup && currentPrimaryGroup &&
                      newGroup.weight > currentPrimaryGroup.weight

                    handleUpdateUser({
                      ...selected,
                      groups: [...selected.groups, value],
                      ...(shouldUpdatePrimary && { primaryGroup: value }),
                    })
                  }
                }}
              />
            </Card>

            {/* Custom Prefix/Suffix */}
            <Card title={t('customChatDisplay')}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label={t('customPrefix')}
                    value={selected.customPrefix || ''}
                    onChange={(e) =>
                      handleUpdateUser({
                        ...selected,
                        customPrefix: e.target.value || null,
                      })
                    }
                    placeholder={t('overrideGroupPrefix')}
                  />
                  {selected.customPrefix && (
                    <div className="mt-2 p-2 bg-hp-bg rounded">
                      <ColorPreview text={selected.customPrefix + 'Name'} />
                    </div>
                  )}
                </div>
                <div>
                  <Input
                    label={t('customSuffix')}
                    value={selected.customSuffix || ''}
                    onChange={(e) =>
                      handleUpdateUser({
                        ...selected,
                        customSuffix: e.target.value || null,
                      })
                    }
                    placeholder={t('overrideGroupSuffix')}
                  />
                  {selected.customSuffix && (
                    <div className="mt-2 p-2 bg-hp-bg rounded">
                      <ColorPreview text={'Name' + selected.customSuffix} />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Permissions */}
            <Card
              title={t('userPermissions')}
              action={
                <Button size="sm" onClick={() => setShowAddPerm(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  {tCommon('add')}
                </Button>
              }
            >
              <PermissionList
                permissions={selected.permissions}
                onToggle={handleTogglePermission}
                onRemove={handleRemovePermission}
              />
            </Card>

            {showAddPerm && (
              <AddPermissionModal
                existingPermissions={selected.permissions.map((p) => getPermissionString(p))}
                onAdd={handleAddPermission}
                onAddMultiple={handleAddMultiplePermissions}
                onClose={() => setShowAddPerm(false)}
                serverInfo={serverInfo}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-hp-text-muted">
            <User className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">{t('selectUserToEdit')}</p>
            <p className="text-sm mt-2">{t('usersAppearHere')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
