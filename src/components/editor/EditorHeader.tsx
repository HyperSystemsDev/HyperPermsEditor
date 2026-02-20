'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { Save, Diff, Upload, Clock, Server } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Session } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'

interface EditorHeaderProps {
  session: Session
  hasChanges: boolean
  saving: boolean
  onSave: () => void
  onShowDiff: () => void
  onApply: () => void
}

export function EditorHeader({
  session,
  hasChanges,
  saving,
  onSave,
  onShowDiff,
  onApply,
}: EditorHeaderProps) {
  const t = useTranslations('editor.header')

  const [expiresInHours] = useState(() => {
    const expiresIn = session.expiresAt - Date.now()
    return Math.max(0, Math.floor(expiresIn / (1000 * 60 * 60)))
  })

  // Determine display values for server info
  const serverName = session.serverInfo.serverName && session.serverInfo.serverName !== 'Unknown'
    ? session.serverInfo.serverName
    : t('localSession')

  const pluginVersion = session.serverInfo.pluginVersion && session.serverInfo.pluginVersion !== 'Unknown'
    ? session.serverInfo.pluginVersion
    : null

  const isConnected = session.serverInfo.serverName && session.serverInfo.serverName !== 'Unknown'

  return (
    <header className="h-14 border-b border-hp-border bg-hp-surface flex items-center justify-between px-4">
      {/* Left side - Logo and session info */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.webp"
            alt="HyperPerms"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-lg font-bold text-hp-text">HyperPerms</span>
        </Link>

        <div className="h-6 w-px bg-hp-border" />

        <div className="flex items-center gap-3">
          {/* Connection status indicator */}
          <Tooltip content={isConnected ? t('connectedToServer') : t('localEditingSession')}>
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-hp-success animate-pulse' : 'bg-hp-text-muted'
              )} />
              <Badge variant="default">
                <Server className="w-3 h-3 mr-1" />
                {serverName}
              </Badge>
            </div>
          </Tooltip>

          {pluginVersion && (
            <Badge variant="default">
              v{pluginVersion}
            </Badge>
          )}

          <span className="text-xs text-hp-text-muted flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {expiresInHours > 0 ? t('expiresIn', { hours: expiresInHours }) : t('expiringSoon')}
          </span>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {hasChanges && (
          <span className="text-xs text-hp-warning mr-2 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-hp-warning" />
            {t('unsavedChanges')}
          </span>
        )}

        <Button variant="ghost" size="sm" onClick={onShowDiff}>
          <Diff className="w-4 h-4 mr-1" />
          {t('viewChanges')}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onSave}
          loading={saving}
          disabled={!hasChanges}
        >
          <Save className="w-4 h-4 mr-1" />
          {t('save')}
        </Button>

        <Button variant="primary" size="sm" onClick={onApply}>
          <Upload className="w-4 h-4 mr-1" />
          {t('applyToServer')}
        </Button>
      </div>
    </header>
  )
}
