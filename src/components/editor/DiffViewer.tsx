'use client'

import { useTranslations } from 'next-intl'
import { X, Plus, Minus, Edit2 } from 'lucide-react'
import type { PermissionData } from '@/lib/types'
import { calculateDiff, generateSummary } from '@/lib/diff'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface DiffViewerProps {
  original: PermissionData
  current: PermissionData
  onClose: () => void
}

export function DiffViewer({ original, current, onClose }: DiffViewerProps) {
  const t = useTranslations('editor.diff')

  const changes = calculateDiff(original, current)
  const summary = generateSummary(changes)

  const hasChanges =
    changes.groupsToCreate.length > 0 ||
    changes.groupsToUpdate.length > 0 ||
    changes.groupsToDelete.length > 0 ||
    changes.usersToUpdate.length > 0 ||
    changes.usersToDelete.length > 0 ||
    changes.tracksToCreate.length > 0 ||
    changes.tracksToUpdate.length > 0 ||
    changes.tracksToDelete.length > 0

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-hp-border">
        <h3 className="font-semibold text-hp-text">{t('title')}</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {!hasChanges ? (
          <p className="text-hp-text-muted text-center py-8">{t('noChanges')}</p>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-3 rounded-lg bg-hp-surface-2 text-sm text-hp-text-muted">
              {summary}
            </div>

            {/* Groups Created */}
            {changes.groupsToCreate.length > 0 && (
              <DiffSection
                title={t('groupsCreated')}
                icon={<Plus className="w-4 h-4 text-hp-success" />}
                items={changes.groupsToCreate.map((g) => ({
                  label: g.name,
                  type: 'added' as const,
                }))}
              />
            )}

            {/* Groups Updated */}
            {changes.groupsToUpdate.length > 0 && (
              <DiffSection
                title={t('groupsModified')}
                icon={<Edit2 className="w-4 h-4 text-hp-warning" />}
                items={changes.groupsToUpdate.map((g) => ({
                  label: g.name,
                  type: 'modified' as const,
                }))}
              />
            )}

            {/* Groups Deleted */}
            {changes.groupsToDelete.length > 0 && (
              <DiffSection
                title={t('groupsDeleted')}
                icon={<Minus className="w-4 h-4 text-hp-danger" />}
                items={changes.groupsToDelete.map((name) => ({
                  label: name,
                  type: 'removed' as const,
                }))}
              />
            )}

            {/* Users Updated */}
            {changes.usersToUpdate.length > 0 && (
              <DiffSection
                title={t('usersModified')}
                icon={<Edit2 className="w-4 h-4 text-hp-warning" />}
                items={changes.usersToUpdate.map((u) => ({
                  label: u.username || u.uuid,
                  type: 'modified' as const,
                }))}
              />
            )}

            {/* Tracks Created */}
            {changes.tracksToCreate.length > 0 && (
              <DiffSection
                title={t('tracksCreated')}
                icon={<Plus className="w-4 h-4 text-hp-success" />}
                items={changes.tracksToCreate.map((t) => ({
                  label: t.name,
                  type: 'added' as const,
                }))}
              />
            )}

            {/* Tracks Updated */}
            {changes.tracksToUpdate.length > 0 && (
              <DiffSection
                title={t('tracksModified')}
                icon={<Edit2 className="w-4 h-4 text-hp-warning" />}
                items={changes.tracksToUpdate.map((t) => ({
                  label: t.name,
                  type: 'modified' as const,
                }))}
              />
            )}

            {/* Tracks Deleted */}
            {changes.tracksToDelete.length > 0 && (
              <DiffSection
                title={t('tracksDeleted')}
                icon={<Minus className="w-4 h-4 text-hp-danger" />}
                items={changes.tracksToDelete.map((name) => ({
                  label: name,
                  type: 'removed' as const,
                }))}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface DiffSectionProps {
  title: string
  icon: React.ReactNode
  items: Array<{ label: string; type: 'added' | 'removed' | 'modified' }>
}

function DiffSection({ title, icon, items }: DiffSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium text-hp-text">{title}</span>
        <span className="text-xs text-hp-text-muted">({items.length})</span>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              'px-3 py-2 rounded text-sm font-mono',
              item.type === 'added' && 'bg-hp-success/10 text-hp-success',
              item.type === 'removed' && 'bg-hp-danger/10 text-hp-danger',
              item.type === 'modified' && 'bg-hp-warning/10 text-hp-warning'
            )}
          >
            {item.type === 'added' && '+ '}
            {item.type === 'removed' && '- '}
            {item.type === 'modified' && '~ '}
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}
