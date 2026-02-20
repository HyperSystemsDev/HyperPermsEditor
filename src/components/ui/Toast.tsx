'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Toast as ToastType } from '@/lib/types'

interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success: 'border-hp-success/50 bg-hp-success/10',
  error: 'border-hp-danger/50 bg-hp-danger/10',
  warning: 'border-hp-warning/50 bg-hp-warning/10',
  info: 'border-hp-primary/50 bg-hp-primary/10',
}

const iconStyles = {
  success: 'text-hp-success',
  error: 'text-hp-danger',
  warning: 'text-hp-warning',
  info: 'text-hp-primary',
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const Icon = icons[toast.type]

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id)
      }, toast.duration || 5000)

      return () => clearTimeout(timer)
    }
  }, [toast, onDismiss])

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        'animate-in slide-in-from-right-full',
        styles[toast.type]
      )}
    >
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconStyles[toast.type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-hp-text">{toast.title}</p>
        {toast.message && (
          <p className="mt-1 text-sm text-hp-text-muted">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-hp-text-muted hover:text-hp-text transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastType[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-96">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
