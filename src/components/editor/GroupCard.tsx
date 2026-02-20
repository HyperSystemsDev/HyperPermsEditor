'use client'
import { useState, useEffect } from 'react'
import { Trash2, Plus, Save, Copy, MoreHorizontal } from 'lucide-react'
import type { Group, Node, ContextSet, ServerInfo } from '@/lib/types'
import { getPermissionString } from '@/lib/utils'
import { PermissionList } from './PermissionList'
import { AddPermissionModal } from './AddPermissionModal'
import { ChatPreview } from './ChatPreview'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Dropdown } from '@/components/ui/Dropdown'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { wouldCreateCircularDependency, getInheritedPermissions } from '@/lib/permissions'
import type { PermissionData } from '@/lib/types'

interface GroupCardProps {
  group: Group
  allGroups: Group[]
  onUpdate: (group: Group) => void
  onDelete: () => void
  serverInfo?: ServerInfo
}

export function GroupCard({ group, allGroups, onUpdate, onDelete, serverInfo }: GroupCardProps) {
  const [showAddPerm, setShowAddPerm] = useState(false)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [editedGroup, setEditedGroup] = useState(group)
  const [hasChanges, setHasChanges] = useState(false)

  // Reset when group changes
  useEffect(() => {
    setEditedGroup(group)
    setHasChanges(false)
  }, [group])

  // Track changes
  useEffect(() => {
    setHasChanges(JSON.stringify(editedGroup) !== JSON.stringify(group))
  }, [editedGroup, group])

  const data: PermissionData = { groups: allGroups, users: [], tracks: [] }
  const availableParents = allGroups
    .filter((g) => g.name !== group.name)
    .filter((g) => !wouldCreateCircularDependency(group.name, g.name, data))

  // Get inherited permissions from parent groups
  const inheritedPermissions = getInheritedPermissions(editedGroup.name, {
    groups: allGroups.map(g => g.name === editedGroup.name ? editedGroup : g),
    users: [],
    tracks: []
  })

  function handleSave() {
    onUpdate(editedGroup)
    setHasChanges(false)
  }

  function handleAddPermission(
    permission: string,
    value: boolean,
    contexts?: ContextSet,
    expiry?: number | null
  ) {
    const newNode: Node = {
      permission,
      value,
      expiry: expiry ?? null,
      contexts: contexts || undefined,
    }
    setEditedGroup({
      ...editedGroup,
      permissions: [...editedGroup.permissions, newNode],
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
    const newNodes: Node[] = permissions.map((p) => ({
      permission: p.permission,
      value: p.value,
      expiry: p.expiry ?? null,
      contexts: p.contexts || undefined,
    }))
    setEditedGroup({
      ...editedGroup,
      permissions: [...editedGroup.permissions, ...newNodes],
    })
  }

  function handleRemovePermission(permission: string) {
    setEditedGroup({
      ...editedGroup,
      permissions: editedGroup.permissions.filter((p) => getPermissionString(p) !== permission),
    })
  }

  function handleTogglePermission(permission: string) {
    setEditedGroup({
      ...editedGroup,
      permissions: editedGroup.permissions.map((p) =>
        getPermissionString(p) === permission ? { ...p, value: !p.value } : p
      ),
    })
  }

  function handleAddParent(parentName: string) {
    if (parentName && !editedGroup.parents.includes(parentName)) {
      setEditedGroup({
        ...editedGroup,
        parents: [...editedGroup.parents, parentName],
      })
    }
  }

  function handleRemoveParent(parentName: string) {
    setEditedGroup({
      ...editedGroup,
      parents: editedGroup.parents.filter((p) => p !== parentName),
    })
  }

  function handleCopyFromGroup(sourceGroupName: string) {
    const sourceGroup = allGroups.find((g) => g.name === sourceGroupName)
    if (!sourceGroup) return

    // Get existing permission names to avoid duplicates
    const existingPerms = new Set(editedGroup.permissions.map((p) => getPermissionString(p)))
    
    // Copy permissions that don't already exist
    const newPerms = sourceGroup.permissions.filter(
      (p) => !existingPerms.has(getPermissionString(p))
    )

    if (newPerms.length > 0) {
      setEditedGroup({
        ...editedGroup,
        permissions: [...editedGroup.permissions, ...newPerms.map(p => ({ ...p }))],
      })
    }
    setShowCopyModal(false)
  }

  function handleClearAllPermissions() {
    if (editedGroup.permissions.length === 0) return
    setEditedGroup({
      ...editedGroup,
      permissions: [],
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-hp-text">{group.name}</h2>
          <p className="text-hp-text-muted">Weight: {group.weight}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="danger" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Basic Settings */}
      <Card title="Settings">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Display Name"
            value={editedGroup.displayName || ''}
            onChange={(e) =>
              setEditedGroup({ ...editedGroup, displayName: e.target.value || undefined })
            }
            placeholder={group.name}
          />
          <Input
            label="Weight"
            type="number"
            value={editedGroup.weight}
            onChange={(e) =>
              setEditedGroup({ ...editedGroup, weight: parseInt(e.target.value) || 0 })
            }
          />
        </div>
      </Card>

      {/* Prefix & Suffix */}
      <Card title="Chat Display">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prefix"
            value={editedGroup.prefix || ''}
            onChange={(e) =>
              setEditedGroup({ ...editedGroup, prefix: e.target.value || null })
            }
            placeholder="&a[VIP] "
          />
          <Input
            label="Suffix"
            value={editedGroup.suffix || ''}
            onChange={(e) =>
              setEditedGroup({ ...editedGroup, suffix: e.target.value || null })
            }
            placeholder=" &7[Member]"
          />
        </div>

        {/* Chat Preview */}
        <div className="mt-4">
          <ChatPreview
            prefix={editedGroup.prefix}
            suffix={editedGroup.suffix}
            playerName="Player"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input
            label="Prefix Priority"
            type="number"
            value={editedGroup.prefixPriority}
            onChange={(e) =>
              setEditedGroup({
                ...editedGroup,
                prefixPriority: parseInt(e.target.value) || 0,
              })
            }
            hint="Higher = takes priority over other groups"
          />
          <Input
            label="Suffix Priority"
            type="number"
            value={editedGroup.suffixPriority}
            onChange={(e) =>
              setEditedGroup({
                ...editedGroup,
                suffixPriority: parseInt(e.target.value) || 0,
              })
            }
            hint="Higher = takes priority over other groups"
          />
        </div>
      </Card>

      {/* Inheritance */}
      <Card title="Inheritance">
        <p className="text-hp-text-muted text-sm mb-4">
          This group inherits permissions from parent groups.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {editedGroup.parents.map((parent) => (
            <Badge key={parent} onRemove={() => handleRemoveParent(parent)}>
              {parent}
            </Badge>
          ))}
          {editedGroup.parents.length === 0 && (
            <span className="text-hp-text-muted italic">No parents</span>
          )}
        </div>
        <Select
          placeholder="Add parent group..."
          options={availableParents.map((g) => ({
            value: g.name,
            label: g.displayName || g.name,
          }))}
          onChange={handleAddParent}
        />
      </Card>

      {/* Permissions */}
      <Card
        title="Permissions"
        action={
          <div className="flex items-center gap-2">
            <Dropdown
              trigger={
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              }
              items={[
                {
                  label: 'Copy from group...',
                  value: 'copy',
                  icon: <Copy className="w-4 h-4" />,
                  disabled: allGroups.filter((g) => g.name !== group.name && g.permissions.length > 0).length === 0,
                },
                {
                  label: 'Clear all',
                  value: 'clear',
                  icon: <Trash2 className="w-4 h-4" />,
                  danger: true,
                  disabled: editedGroup.permissions.length === 0,
                },
              ]}
              onSelect={(value) => {
                if (value === 'copy') setShowCopyModal(true)
                if (value === 'clear') handleClearAllPermissions()
              }}
              align="right"
            />
            <Button size="sm" onClick={() => setShowAddPerm(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        }
      >
        <PermissionList
          permissions={editedGroup.permissions}
          inheritedPermissions={inheritedPermissions}
          onToggle={handleTogglePermission}
          onRemove={handleRemovePermission}
        />
      </Card>

      {showAddPerm && (
        <AddPermissionModal
          existingPermissions={editedGroup.permissions.map((p) => getPermissionString(p))}
          onAdd={handleAddPermission}
          onAddMultiple={handleAddMultiplePermissions}
          onClose={() => setShowAddPerm(false)}
          serverInfo={serverInfo}
        />
      )}

      {showCopyModal && (
        <CopyPermissionsModal
          sourceGroups={allGroups.filter((g) => g.name !== group.name && g.permissions.length > 0)}
          onCopy={handleCopyFromGroup}
          onClose={() => setShowCopyModal(false)}
        />
      )}
    </div>
  )
}

// Modal for copying permissions from another group
interface CopyPermissionsModalProps {
  sourceGroups: Group[]
  onCopy: (groupName: string) => void
  onClose: () => void
}

function CopyPermissionsModal({ sourceGroups, onCopy, onClose }: CopyPermissionsModalProps) {
  const [selectedGroup, setSelectedGroup] = useState('')

  return (
    <Modal isOpen onClose={onClose} title="Copy Permissions">
      <div className="space-y-4">
        <p className="text-sm text-hp-text-muted">
          Select a group to copy permissions from. Duplicate permissions will be skipped.
        </p>
        <Select
          placeholder="Select a group..."
          options={sourceGroups.map((g) => ({
            value: g.name,
            label: `${g.displayName || g.name} (${g.permissions.length} permissions)`,
          }))}
          onChange={setSelectedGroup}
          value={selectedGroup}
        />
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => selectedGroup && onCopy(selectedGroup)}
            disabled={!selectedGroup}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Permissions
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  )
}
