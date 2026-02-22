'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import type { Session, PermissionData } from '@/lib/types'
import { EditorHeader, EditorTabs, GroupPanel, UserPanel, TrackPanel, DiffViewer, ApplyCodeModal, SessionExpired } from '@/components/editor'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/lib/hooks'
import { countChanges } from '@/lib/diff'

type EditorTab = 'groups' | 'users' | 'tracks'

export default function EditorPage() {
  const params = useParams()
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<EditorTab>('groups')
  const [showDiff, setShowDiff] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const { toasts, dismissToast, success, error: showError } = useToast()

  // Fetch session on mount
  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch(`/api/session/${sessionId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Session not found or expired')
          } else {
            setError('Failed to load session')
          }
          return
        }
        const data: Session = await response.json()
        setSession(data)
      } catch {
        setError('Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  // Track unsaved changes
  useEffect(() => {
    if (session) {
      const hasChanges = JSON.stringify(session.original) !== JSON.stringify(session.current)
      setHasUnsavedChanges(hasChanges)
    }
  }, [session])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleSave = useCallback(async () => {
    if (!session || !hasUnsavedChanges || saving) return

    setSaving(true)
    try {
      const response = await fetch(`/api/session/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: session.current }),
      })

      if (!response.ok) {
        switch (response.status) {
          case 403:
            showError('Save blocked', 'The request was rejected by the server')
            return
          case 404:
            showError('Session expired', 'This editing session is no longer available')
            return
          case 429:
            showError('Too many requests', 'Please wait a moment before trying again')
            return
          default:
            showError('Failed to save', 'An unexpected error occurred. Please try again')
            return
        }
      }

      const changes = countChanges(session.original, session.current)

      // Update original to match current (since we saved)
      setSession({
        ...session,
        original: JSON.parse(JSON.stringify(session.current)),
        lastModified: Date.now(),
      })

      success('Changes saved', `${changes.total} change${changes.total !== 1 ? 's' : ''} saved successfully`)
    } catch {
      showError('Connection error', 'Could not reach the server. Check your network connection')
    } finally {
      setSaving(false)
    }
  }, [session, sessionId, hasUnsavedChanges, saving, success, showError])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        setShowDiff((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  const handleTabChange = useCallback((tab: EditorTab) => {
    setActiveTab(tab)
  }, [])

  const updateCurrent = useCallback((updater: (current: PermissionData) => PermissionData) => {
    if (!session) return
    setSession({
      ...session,
      current: updater(session.current),
    })
  }, [session])

  if (loading) {
    return <EditorLoading />
  }

  if (error || !session) {
    return <SessionExpired />
  }

  return (
    <div className="flex flex-col h-screen bg-hp-bg">
      <EditorHeader
        session={session}
        hasChanges={hasUnsavedChanges}
        saving={saving}
        onSave={handleSave}
        onShowDiff={() => setShowDiff(true)}
        onApply={() => setShowApplyModal(true)}
      />

      <EditorTabs
        activeTab={activeTab}
        onChange={handleTabChange}
        counts={{
          groups: session.current.groups.length,
          users: session.current.users.length,
          tracks: session.current.tracks.length,
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {activeTab === 'groups' && (
            <GroupPanel
              groups={session.current.groups}
              onUpdate={(groups) => updateCurrent((c) => ({ ...c, groups }))}
              serverInfo={session.serverInfo}
            />
          )}
          {activeTab === 'users' && (
            <UserPanel
              users={session.current.users}
              groups={session.current.groups}
              onUpdate={(users) => updateCurrent((c) => ({ ...c, users }))}
              serverInfo={session.serverInfo}
            />
          )}
          {activeTab === 'tracks' && (
            <TrackPanel
              tracks={session.current.tracks}
              groups={session.current.groups}
              onUpdate={(tracks) => updateCurrent((c) => ({ ...c, tracks }))}
            />
          )}
        </main>

        {showDiff && (
          <aside className="w-96 border-l border-hp-border overflow-auto bg-hp-surface">
            <DiffViewer
              original={session.original}
              current={session.current}
              onClose={() => setShowDiff(false)}
            />
          </aside>
        )}
      </div>

      {showApplyModal && (
        <ApplyCodeModal
          sessionId={session.id}
          onClose={() => setShowApplyModal(false)}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

function EditorLoading() {
  return (
    <div className="flex flex-col h-screen bg-hp-bg">
      <div className="h-14 border-b border-hp-border bg-hp-surface animate-pulse" />
      <div className="h-12 border-b border-hp-border bg-hp-surface animate-pulse" />
      <div className="flex-1 flex">
        <div className="w-72 border-r border-hp-border p-4">
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
        <div className="flex-1 p-6">
          <SkeletonCard className="h-full" />
        </div>
      </div>
    </div>
  )
}
