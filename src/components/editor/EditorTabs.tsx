'use client'

import { useTranslations } from 'next-intl'
import { Users, UsersRound, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type EditorTab = 'groups' | 'users' | 'tracks'

interface EditorTabsProps {
  activeTab: EditorTab
  onChange: (tab: EditorTab) => void
  counts: {
    groups: number
    users: number
    tracks: number
  }
}

export function EditorTabs({ activeTab, onChange, counts }: EditorTabsProps) {
  const t = useTranslations('editor.tabs')

  const tabs = [
    { id: 'groups' as const, label: t('groups'), icon: UsersRound },
    { id: 'users' as const, label: t('users'), icon: Users },
    { id: 'tracks' as const, label: t('tracks'), icon: TrendingUp },
  ]

  return (
    <nav className="flex border-b border-hp-border bg-hp-surface">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const count = counts[tab.id]
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative',
              isActive
                ? 'text-hp-primary'
                : 'text-hp-text-muted hover:text-hp-text'
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
            <span
              className={cn(
                'ml-1 px-1.5 py-0.5 rounded text-xs',
                isActive ? 'bg-hp-primary/20' : 'bg-hp-surface-2'
              )}
            >
              {count}
            </span>

            {/* Active indicator */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-hp-primary" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
