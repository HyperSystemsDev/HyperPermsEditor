'use client'

import { useState } from 'react'
import { MessageSquare, LogIn, Award, Volume2 } from 'lucide-react'
import { ColorPreview } from './ColorPreview'
import { cn } from '@/lib/utils'

type PreviewMode = 'chat' | 'join' | 'rank' | 'action'

interface ChatPreviewProps {
  prefix: string | null
  suffix: string | null
  playerName?: string
  className?: string
}

const PREVIEW_MODES: { value: PreviewMode; label: string; icon: React.ReactNode }[] = [
  { value: 'chat', label: 'Chat', icon: <MessageSquare className="w-3 h-3" /> },
  { value: 'join', label: 'Join', icon: <LogIn className="w-3 h-3" /> },
  { value: 'rank', label: 'Rank', icon: <Award className="w-3 h-3" /> },
  { value: 'action', label: 'Action', icon: <Volume2 className="w-3 h-3" /> },
]

export function ChatPreview({ prefix, suffix, playerName = 'Player', className }: ChatPreviewProps) {
  const [mode, setMode] = useState<PreviewMode>('chat')

  const hasAnyStyling = prefix || suffix

  if (!hasAnyStyling) {
    return (
      <div className={cn('p-4 bg-hp-bg rounded-lg', className)}>
        <p className="text-hp-text-muted text-sm text-center">
          Add a prefix or suffix to see the preview
        </p>
      </div>
    )
  }

  // Build the preview text based on mode
  const getPreviewContent = () => {
    const fullPrefix = prefix || ''
    const fullSuffix = suffix || ''
    const nameWithAffixes = `${fullPrefix}${playerName}${fullSuffix}`

    switch (mode) {
      case 'chat':
        return (
          <div className="flex items-start gap-1">
            <ColorPreview text={nameWithAffixes} />
            <span className="text-white">:</span>
            <span className="text-white ml-1">Hello everyone!</span>
          </div>
        )
      case 'join':
        return (
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">[+]</span>
            <ColorPreview text={nameWithAffixes} />
            <span className="text-yellow-400">joined the game</span>
          </div>
        )
      case 'rank':
        return (
          <div className="flex items-center gap-1">
            <span className="text-gray-400">&gt;</span>
            <ColorPreview text={nameWithAffixes} />
          </div>
        )
      case 'action':
        return (
          <div className="flex items-center gap-1">
            <span className="text-gray-400">*</span>
            <ColorPreview text={nameWithAffixes} />
            <span className="text-gray-300 italic">waves at everyone</span>
          </div>
        )
      default:
        return <ColorPreview text={nameWithAffixes} />
    }
  }

  return (
    <div className={cn('rounded-lg overflow-hidden', className)}>
      {/* Mode selector */}
      <div className="flex items-center gap-1 bg-hp-surface p-2 border-b border-hp-border">
        <span className="text-xs text-hp-text-muted mr-2">Preview:</span>
        {PREVIEW_MODES.map((previewMode) => (
          <button
            key={previewMode.value}
            onClick={() => setMode(previewMode.value)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors',
              mode === previewMode.value
                ? 'bg-hp-primary/20 text-hp-primary'
                : 'text-hp-text-muted hover:text-hp-text hover:bg-hp-surface-2'
            )}
          >
            {previewMode.icon}
            {previewMode.label}
          </button>
        ))}
      </div>

      {/* Preview area - Minecraft-style dark background */}
      <div className="bg-[#1a1a1a] p-4 font-mono text-sm">
        {getPreviewContent()}
      </div>
    </div>
  )
}
