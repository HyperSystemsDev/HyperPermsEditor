'use client'

import { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Users, TrendingUp, Shield, Plus, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type EmptyStateType = 'groups' | 'tracks' | 'permissions' | 'inherited-permissions'

interface EmptyStateProps {
  type: EmptyStateType
  onAction?: () => void
  className?: string
  hasParents?: boolean
}

function getIcon(type: EmptyStateType): ReactNode {
  switch (type) {
    case 'groups':
      return <Users className="w-16 h-16" />
    case 'tracks':
      return <TrendingUp className="w-16 h-16" />
    case 'permissions':
      return <Shield className="w-12 h-12" />
    case 'inherited-permissions':
      return <GitBranch className="w-12 h-12" />
  }
}

function GroupsIllustration() {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      <div className="w-12 h-12 rounded-lg bg-hp-primary/10 border border-hp-primary/30 flex items-center justify-center">
        <span className="text-hp-primary text-xs font-bold">VIP</span>
      </div>
      <div className="w-6 h-0.5 bg-hp-border" />
      <div className="w-12 h-12 rounded-lg bg-hp-success/10 border border-hp-success/30 flex items-center justify-center">
        <span className="text-hp-success text-xs font-bold">MOD</span>
      </div>
      <div className="w-6 h-0.5 bg-hp-border" />
      <div className="w-12 h-12 rounded-lg bg-hp-warning/10 border border-hp-warning/30 flex items-center justify-center">
        <span className="text-hp-warning text-xs font-bold">ADMIN</span>
      </div>
    </div>
  )
}

function TracksIllustration({ exampleLabel }: { exampleLabel: string }) {
  return (
    <div className="flex flex-col items-center gap-2 mb-4">
      <div className="flex items-center gap-2">
        <div className="px-3 py-1.5 rounded bg-hp-surface-2 text-xs text-hp-text-muted">Helper</div>
        <span className="text-hp-primary">→</span>
        <div className="px-3 py-1.5 rounded bg-hp-surface-2 text-xs text-hp-text-muted">Mod</div>
        <span className="text-hp-primary">→</span>
        <div className="px-3 py-1.5 rounded bg-hp-primary/20 text-xs text-hp-primary font-medium">Admin</div>
      </div>
      <p className="text-xs text-hp-text-muted mt-1">{exampleLabel}</p>
    </div>
  )
}

export function EmptyState({ type, onAction, className, hasParents }: EmptyStateProps) {
  const t = useTranslations('editor.emptyState')

  // Determine the effective type for translations
  const effectiveType = type === 'permissions' && hasParents ? 'inheritedPermissions' : type

  // Get translated content
  const title = t(`${effectiveType}.title`)
  const description = t(`${effectiveType}.description`)
  const actionLabel = effectiveType !== 'inheritedPermissions' ? t(`${effectiveType}.action`) : null

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-6 text-center',
      className
    )}>
      {effectiveType === 'groups' && <GroupsIllustration />}
      {effectiveType === 'tracks' && <TracksIllustration exampleLabel={t('tracks.exampleLabel')} />}

      <div className="text-hp-text-muted opacity-50 mb-4">
        {getIcon(type === 'permissions' && hasParents ? 'inherited-permissions' : type)}
      </div>

      <h3 className="text-lg font-medium text-hp-text mb-2">
        {title}
      </h3>

      <p className="text-sm text-hp-text-muted max-w-md mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
