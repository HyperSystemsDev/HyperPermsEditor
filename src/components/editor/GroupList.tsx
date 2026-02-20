'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Users, Scale, Shield, GitBranch, SortAsc, Hash } from 'lucide-react'
import type { Group } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ColorPreview } from './ColorPreview'
import { SearchInput } from '@/components/ui/SearchInput'

type SortOption = 'weight' | 'name' | 'permissions'

// Get gradient color from purple (low weight) to gold (high weight)
function getWeightGradientColor(weight: number, maxWeight: number): string {
  const ratio = Math.min(weight / maxWeight, 1)
  // Purple (270) to Gold (45)
  const hue = 270 - (ratio * 225)
  const saturation = 60 + (ratio * 20) // More saturated at higher weights
  const lightness = 55 + (ratio * 10) // Brighter at higher weights
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

interface GroupListProps {
  groups: Group[]
  selectedGroup: string | null
  onSelect: (name: string) => void
}

export function GroupList({ groups, selectedGroup, onSelect }: GroupListProps) {
  const t = useTranslations('editor.groups')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('weight')

  const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'weight', label: t('weight'), icon: <Scale className="w-3 h-3" /> },
    { value: 'name', label: t('name'), icon: <SortAsc className="w-3 h-3" /> },
    { value: 'permissions', label: t('perms'), icon: <Hash className="w-3 h-3" /> },
  ]

  // Filter groups by search query
  const filteredGroups = groups.filter((g) => {
    const query = searchQuery.toLowerCase()
    return (
      g.name.toLowerCase().includes(query) ||
      (g.displayName?.toLowerCase().includes(query)) ||
      (g.prefix && g.prefix.toLowerCase().includes(query))
    )
  })

  // Sort groups based on selected option
  const sortedGroups = useMemo(() => {
    const sorted = [...filteredGroups]
    switch (sortBy) {
      case 'weight':
        return sorted.sort((a, b) => b.weight - a.weight)
      case 'name':
        return sorted.sort((a, b) =>
          (a.displayName || a.name).localeCompare(b.displayName || b.name)
        )
      case 'permissions':
        return sorted.sort((a, b) => b.permissions.length - a.permissions.length)
      default:
        return sorted
    }
  }, [filteredGroups, sortBy])

  // Calculate max weight for color gradient
  const maxWeight = Math.max(...groups.map(g => g.weight), 100)

  if (groups.length === 0) {
    return (
      <div className="text-center py-8 text-hp-text-muted">
        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>{t('noGroupsYet')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t('filterGroups')}
      />

      {/* Sort Options */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-hp-text-muted">{t('sort')}</span>
        <div className="flex gap-1">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors',
                sortBy === option.value
                  ? 'bg-hp-primary/20 text-hp-primary'
                  : 'text-hp-text-muted hover:text-hp-text hover:bg-hp-surface-2'
              )}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-xs text-hp-text-muted">
          {t('ofGroups', { filtered: filteredGroups.length, total: groups.length })}
        </p>
      )}

      {/* Group List */}
      <div className="space-y-1">
        {sortedGroups.length === 0 ? (
          <p className="text-sm text-hp-text-muted text-center py-4">
            {t('noGroupsMatchSearch')}
          </p>
        ) : (
          sortedGroups.map((group) => (
            <button
              key={group.name}
              onClick={() => onSelect(group.name)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all',
                'border-l-4',
                selectedGroup === group.name
                  ? 'bg-hp-primary/20 text-hp-text border-l-hp-primary'
                  : 'hover:bg-hp-surface-2 text-hp-text-muted hover:text-hp-text'
              )}
              style={{
                borderLeftColor: selectedGroup === group.name
                  ? undefined
                  : getWeightGradientColor(group.weight, maxWeight)
              }}
            >
              <div className="flex-1 min-w-0">
                {/* Name with prefix */}
                <div className="flex items-center gap-2">
                  {group.prefix && (
                    <ColorPreview text={group.prefix} className="text-sm" />
                  )}
                  <span className="font-medium text-sm truncate">
                    {group.displayName || group.name}
                  </span>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-3 mt-0.5 text-xs text-hp-text-muted">
                  <span className="flex items-center gap-1">
                    <Scale className="w-3 h-3" />
                    {group.weight}
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {group.permissions.length}
                  </span>
                  {group.parents.length > 0 && (
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      {group.parents.length}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
