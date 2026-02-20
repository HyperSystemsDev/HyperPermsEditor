import { useEffect, useCallback } from 'react'

type ShortcutHandler = () => void

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  handler: ShortcutHandler
  description?: string
}

/**
 * Hook for handling keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], enabled: boolean = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true
      const metaMatches = shortcut.meta ? event.metaKey : true
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey
      const altMatches = shortcut.alt ? event.altKey : !event.altKey

      // Check if we need ctrl/cmd and it's pressed
      const needsModifier = shortcut.ctrl || shortcut.meta
      const hasModifier = event.ctrlKey || event.metaKey

      if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
        // Only prevent default for modifier combinations
        if (needsModifier && hasModifier) {
          event.preventDefault()
          shortcut.handler()
          return
        }
        // For non-modifier shortcuts, still call handler
        if (!needsModifier) {
          shortcut.handler()
          return
        }
      }
    }
  }, [shortcuts, enabled])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Common keyboard shortcut definitions
 */
export const EDITOR_SHORTCUTS = {
  save: { key: 's', ctrl: true, description: 'Save changes' },
  undo: { key: 'z', ctrl: true, description: 'Undo' },
  redo: { key: 'z', ctrl: true, shift: true, description: 'Redo' },
  search: { key: 'f', ctrl: true, description: 'Search' },
  escape: { key: 'Escape', description: 'Cancel/Close' },
} as const
