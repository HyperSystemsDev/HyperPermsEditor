'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { GitBranch, List, Plus } from 'lucide-react'
import type { Group, ServerInfo } from '@/lib/types'
import { GroupList } from './GroupList'
import { GroupCard } from './GroupCard'
import { AddGroupModal } from './AddGroupModal'
import { InheritanceGraph } from './InheritanceGraph'
import { EmptyState } from './EmptyState'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'

interface GroupPanelProps {
  groups: Group[]
  onUpdate: (groups: Group[]) => void
  serverInfo?: ServerInfo
}

export function GroupPanel({ groups, onUpdate, serverInfo }: GroupPanelProps) {
  const t = useTranslations('editor.groups')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list')

  const selected = groups.find((g) => g.name === selectedGroup)

  function handleAddGroup(group: Group) {
    onUpdate([...groups, group])
    setSelectedGroup(group.name)
    setShowAddModal(false)
  }

  function handleUpdateGroup(updated: Group) {
    onUpdate(groups.map((g) => (g.name === updated.name ? updated : g)))
  }

  function handleDeleteGroup(name: string) {
    // Remove from other groups' parents
    const updatedGroups = groups
      .filter((g) => g.name !== name)
      .map((g) => ({
        ...g,
        parents: g.parents.filter((p) => p !== name),
      }))
    onUpdate(updatedGroups)
    setSelectedGroup(null)
  }

  // Graph view - full width display
  if (viewMode === 'graph') {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-hp-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-hp-text">{t('title')}</h2>
            <Tabs
              value={viewMode}
              onChange={(v) => setViewMode(v as 'list' | 'graph')}
              options={[
                { value: 'list', label: t('list'), icon: <List className="w-4 h-4" /> },
                { value: 'graph', label: t('graph'), icon: <GitBranch className="w-4 h-4" /> },
              ]}
            />
          </div>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            {t('addGroup')}
          </Button>
        </div>

        {/* Graph View - Full Width */}
        <div className="flex-1 relative overflow-hidden">
          {groups.length === 0 ? (
            <EmptyState
              type="groups"
              onAction={() => setShowAddModal(true)}
            />
          ) : (
            <InheritanceGraph
              groups={groups}
              selectedGroup={selectedGroup}
              onSelect={setSelectedGroup}
            />
          )}
        </div>

        {/* Selected group card overlay */}
        {selected && (
          <div className="absolute top-16 right-4 w-96 max-h-[calc(100%-5rem)] overflow-auto bg-hp-surface border border-hp-border rounded-lg shadow-xl">
            <div className="p-4 border-b border-hp-border flex items-center justify-between sticky top-0 bg-hp-surface">
              <h3 className="font-medium text-hp-text">{selected.displayName || selected.name}</h3>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-hp-text-muted hover:text-hp-text"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <GroupCard
                group={selected}
                allGroups={groups}
                onUpdate={handleUpdateGroup}
                onDelete={() => handleDeleteGroup(selected.name)}
                serverInfo={serverInfo}
              />
            </div>
          </div>
        )}

        {showAddModal && (
          <AddGroupModal
            existingGroups={groups}
            onAdd={handleAddGroup}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    )
  }

  // List view - sidebar + main content
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-72 border-r border-hp-border flex flex-col">
        <div className="p-4 border-b border-hp-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-hp-text">{t('title')}</h2>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              {t('add')}
            </Button>
          </div>

          <Tabs
            value={viewMode}
            onChange={(v) => setViewMode(v as 'list' | 'graph')}
            options={[
              { value: 'list', label: t('list'), icon: <List className="w-4 h-4" /> },
              { value: 'graph', label: t('graph'), icon: <GitBranch className="w-4 h-4" /> },
            ]}
          />
        </div>

        <div className="flex-1 overflow-auto p-2">
          <GroupList
            groups={groups}
            selectedGroup={selectedGroup}
            onSelect={setSelectedGroup}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {selected ? (
          <GroupCard
            group={selected}
            allGroups={groups}
            onUpdate={handleUpdateGroup}
            onDelete={() => handleDeleteGroup(selected.name)}
            serverInfo={serverInfo}
          />
        ) : groups.length === 0 ? (
          <EmptyState
            type="groups"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-hp-text-muted">
            <GitBranch className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">{t('selectGroupToEdit')}</p>
            <p className="text-sm mt-2">{t('switchToGraphView')}</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddGroupModal
          existingGroups={groups}
          onAdd={handleAddGroup}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
