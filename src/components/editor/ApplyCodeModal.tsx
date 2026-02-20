'use client'

import { useState } from 'react'
import { Copy, Check, Terminal } from 'lucide-react'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface ApplyCodeModalProps {
  sessionId: string
  onClose: () => void
}

export function ApplyCodeModal({ sessionId, onClose }: ApplyCodeModalProps) {
  const [copied, setCopied] = useState(false)

  const command = `/hp apply ${sessionId}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Apply Changes to Server" size="lg">
      <div className="space-y-4">
        <p className="text-hp-text-muted">
          To apply your changes to the server, run the following command in-game or from the server console:
        </p>

        <div className="relative">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-hp-bg border border-hp-border font-mono text-sm">
            <Terminal className="w-5 h-5 text-hp-text-muted flex-shrink-0" />
            <code className="text-hp-accent flex-1 break-all">{command}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-hp-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-hp-warning/10 border border-hp-warning/30">
          <h4 className="font-medium text-hp-warning mb-2">Important Notes</h4>
          <ul className="text-sm text-hp-text-muted space-y-1">
            <li>• You must have the <code className="text-hp-accent">hyperperms.editor</code> permission</li>
            <li>• Changes will be applied immediately after running the command</li>
            <li>• A backup will be created automatically before applying</li>
            <li>• This session expires in 24 hours</li>
          </ul>
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Command
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
