'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  onRemove?: () => void
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  onRemove,
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-hp-surface-2 text-hp-text border-hp-border',
    primary: 'bg-hp-primary/20 text-hp-primary border-hp-primary/30',
    success: 'bg-hp-success/20 text-hp-success border-hp-success/30',
    warning: 'bg-hp-warning/20 text-hp-warning border-hp-warning/30',
    danger: 'bg-hp-danger/20 text-hp-danger border-hp-danger/30',
  }

  const sizes = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="hover:bg-white/10 rounded p-0.5 -mr-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}
