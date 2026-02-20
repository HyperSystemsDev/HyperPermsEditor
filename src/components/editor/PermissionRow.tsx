'use client'

import { useState } from 'react'
import { Check, X, Trash2, Clock } from 'lucide-react'
import { cn, getPermissionString } from '@/lib/utils'
import type { Node } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'

interface PermissionRowProps {
  node: Node
  onToggle: (permission: string) => void
  onRemove: (permission: string) => void
  inherited?: boolean
  source?: string
}

export function PermissionRow({
  node,
  onToggle,
  onRemove,
  inherited,
  source,
}: PermissionRowProps) {
  const hasContexts = node.contexts && Object.keys(node.contexts).length > 0
  const [isExpired] = useState(() => Boolean(node.expiry && node.expiry < Date.now()))
  const permissionString = getPermissionString(node)

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
        inherited ? 'bg-hp-surface/50' : 'bg-hp-surface-2 hover:bg-hp-surface'
      )}
    >
      {/* Value indicator */}
      <button
        onClick={() => !inherited && onToggle(permissionString)}
        disabled={inherited}
        className={cn(
          'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
          node.value
            ? 'bg-hp-success/20 text-hp-success'
            : 'bg-hp-danger/20 text-hp-danger',
          inherited && 'opacity-50 cursor-not-allowed'
        )}
      >
        {node.value ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      </button>

      {/* Permission name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-mono text-sm',
              node.value ? 'text-hp-text' : 'text-hp-danger line-through'
            )}
          >
            {node.value ? permissionString : `-${permissionString}`}
          </span>

          {inherited && source && (
            <span className="px-2 py-0.5 rounded text-xs bg-hp-surface text-hp-text-muted">
              from {source}
            </span>
          )}

          {node.expiry && (
            <Tooltip
              content={
                isExpired
                  ? 'Expired'
                  : `Expires: ${new Date(node.expiry).toLocaleString()}`
              }
            >
              <span
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded text-xs',
                  isExpired
                    ? 'bg-hp-danger/20 text-hp-danger'
                    : 'bg-hp-warning/20 text-hp-warning'
                )}
              >
                <Clock className="w-3 h-3" />
                {isExpired ? 'Expired' : 'Temporary'}
              </span>
            </Tooltip>
          )}
        </div>

        {hasContexts && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(node.contexts!).map(([key, value]) => (
              value && (
                <span
                  key={key}
                  className="px-1.5 py-0.5 rounded text-xs bg-hp-primary/20 text-hp-primary"
                >
                  {key}={value}
                </span>
              )
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {!inherited && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(permissionString)}
          className="h-8 w-8 p-0 text-hp-text-muted hover:text-hp-danger"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
