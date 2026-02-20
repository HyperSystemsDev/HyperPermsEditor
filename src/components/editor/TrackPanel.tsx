'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { TrendingUp, Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import type { Track, Group } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import { EmptyState } from './EmptyState'

interface TrackPanelProps {
  tracks: Track[]
  groups: Group[]
  onUpdate: (tracks: Track[]) => void
}

export function TrackPanel({ tracks, groups, onUpdate }: TrackPanelProps) {
  const t = useTranslations('editor.tracks')
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const selected = tracks.find((t) => t.name === selectedTrack)

  function handleAddTrack(track: Track) {
    onUpdate([...tracks, track])
    setSelectedTrack(track.name)
    setShowAddModal(false)
  }

  function handleUpdateTrack(updated: Track) {
    onUpdate(tracks.map((t) => (t.name === updated.name ? updated : t)))
  }

  function handleDeleteTrack(name: string) {
    onUpdate(tracks.filter((t) => t.name !== name))
    setSelectedTrack(null)
  }

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
        </div>

        <div className="flex-1 overflow-auto p-2">
          {tracks.length === 0 ? (
            <div className="text-center py-8 text-hp-text-muted">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t('noTracksYet')}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {tracks.map((track) => (
                <button
                  key={track.name}
                  onClick={() => setSelectedTrack(track.name)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                    selectedTrack === track.name
                      ? 'bg-hp-primary/20 text-hp-text'
                      : 'hover:bg-hp-surface-2 text-hp-text-muted hover:text-hp-text'
                  )}
                >
                  <TrendingUp className="w-5 h-5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{track.name}</p>
                    <p className="text-xs text-hp-text-muted">
                      {t('groupsCount', { count: track.groups.length })}
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
          <TrackEditor
            track={selected}
            groups={groups}
            onUpdate={handleUpdateTrack}
            onDelete={() => handleDeleteTrack(selected.name)}
          />
        ) : tracks.length === 0 ? (
          <EmptyState
            type="tracks"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-hp-text-muted">
            <TrendingUp className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">{t('selectTrackToEdit')}</p>
            <p className="text-sm mt-2">{t('tracksDefinePromotionPaths')}</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddTrackModal
          existingTracks={tracks}
          onAdd={handleAddTrack}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}

interface TrackEditorProps {
  track: Track
  groups: Group[]
  onUpdate: (track: Track) => void
  onDelete: () => void
}

function TrackEditor({ track, groups, onUpdate, onDelete }: TrackEditorProps) {
  const t = useTranslations('editor.tracks')
  const availableGroups = groups.filter((g) => !track.groups.includes(g.name))

  function handleAddGroup(groupName: string) {
    if (groupName && !track.groups.includes(groupName)) {
      onUpdate({ ...track, groups: [...track.groups, groupName] })
    }
  }

  function handleRemoveGroup(groupName: string) {
    onUpdate({ ...track, groups: track.groups.filter((g) => g !== groupName) })
  }

  function handleMoveGroup(index: number, direction: 'up' | 'down') {
    const newGroups = [...track.groups]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newGroups.length) return

    ;[newGroups[index], newGroups[targetIndex]] = [newGroups[targetIndex], newGroups[index]]
    onUpdate({ ...track, groups: newGroups })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-hp-text">{track.name}</h2>
          <p className="text-hp-text-muted">{t('promotionTrack', { count: track.groups.length })}</p>
        </div>
        <Button variant="danger" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <Card title={t('trackGroups')} description={t('trackGroupsDescription')}>
        {track.groups.length === 0 ? (
          <p className="text-hp-text-muted text-center py-4">{t('noGroupsInTrack')}</p>
        ) : (
          <div className="space-y-2">
            {[...track.groups].reverse().map((groupName, revIndex) => {
              const index = track.groups.length - 1 - revIndex
              const group = groups.find((g) => g.name === groupName)

              return (
                <div
                  key={groupName}
                  className="flex items-center gap-3 px-4 py-3 bg-hp-surface-2 rounded-lg"
                >
                  <GripVertical className="w-4 h-4 text-hp-text-muted" />
                  <div className="flex-1">
                    <p className="font-medium text-hp-text">
                      {group?.displayName || groupName}
                    </p>
                    <p className="text-xs text-hp-text-muted">
                      {t('position', { position: index + 1, total: track.groups.length })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveGroup(index, 'up')}
                      disabled={index === track.groups.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveGroup(index, 'down')}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveGroup(groupName)}
                      className="h-8 w-8 p-0 text-hp-text-muted hover:text-hp-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {availableGroups.length > 0 && (
          <div className="mt-4">
            <Select
              placeholder={t('addGroupToTrack')}
              options={availableGroups.map((g) => ({
                value: g.name,
                label: g.displayName || g.name,
              }))}
              onChange={handleAddGroup}
            />
          </div>
        )}
      </Card>
    </div>
  )
}

interface AddTrackModalProps {
  existingTracks: Track[]
  onAdd: (track: Track) => void
  onClose: () => void
}

function AddTrackModal({ existingTracks, onAdd, onClose }: AddTrackModalProps) {
  const t = useTranslations('editor.tracks')
  const tCommon = useTranslations('buttons')

  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmedName = name.trim().toLowerCase()

    if (!trimmedName) {
      setError(t('trackNameCannotBeEmpty'))
      return
    }

    if (!/^[a-z0-9_-]+$/.test(trimmedName)) {
      setError(t('trackNameInvalidChars'))
      return
    }

    if (existingTracks.some((t) => t.name.toLowerCase() === trimmedName)) {
      setError(t('trackAlreadyExists'))
      return
    }

    onAdd({ name: trimmedName, groups: [] })
  }

  return (
    <Modal isOpen onClose={onClose} title={t('createNewTrack')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('trackName')}
          placeholder={t('trackNamePlaceholder')}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          error={error}
          hint={t('trackNameHint')}
          autoFocus
        />

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {tCommon('cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {t('createTrack')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
