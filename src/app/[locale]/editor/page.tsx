'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Terminal, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function EditorPage() {
  const [sessionCode, setSessionCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = sessionCode.trim()

    if (!code) {
      setError('Please enter a session code')
      return
    }

    setError('')
    router.push(`/editor/${code}`)
  }

  return (
    <div className="min-h-screen bg-hp-bg flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-hp-primary/20 mb-4">
              <Shield className="w-8 h-8 text-hp-primary" />
            </div>
            <h1 className="text-3xl font-bold text-hp-text mb-2">Web Editor</h1>
            <p className="text-hp-text-muted">
              Enter your session code to access the permission editor
            </p>
          </div>

          <div className="bg-hp-surface border border-hp-border rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="sessionCode" className="block text-sm font-medium text-hp-text mb-2">
                  Session Code
                </label>
                <input
                  id="sessionCode"
                  type="text"
                  value={sessionCode}
                  onChange={(e) => {
                    setSessionCode(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter your session code..."
                  className="w-full px-4 py-3 bg-hp-bg border border-hp-border rounded-lg text-hp-text placeholder-hp-text-muted focus:outline-none focus:ring-2 focus:ring-hp-primary focus:border-transparent font-mono"
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-hp-error">{error}</p>
                )}
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Open Editor
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-hp-border">
              <h3 className="text-sm font-medium text-hp-text mb-3">How to get a session code:</h3>
              <div className="flex items-start gap-3 p-3 bg-hp-bg rounded-lg">
                <Terminal className="w-5 h-5 text-hp-text-muted flex-shrink-0 mt-0.5" />
                <div>
                  <code className="text-hp-accent text-sm">/hp editor</code>
                  <p className="text-hp-text-muted text-sm mt-1">
                    Run this command in-game or from your server console to generate a new session.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-hp-text-muted text-sm mt-6">
            Sessions expire after 24 hours for security.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
