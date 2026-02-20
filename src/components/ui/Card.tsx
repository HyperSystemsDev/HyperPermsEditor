'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function Card({
  title,
  description,
  action,
  children,
  className,
  noPadding,
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-hp-surface border border-hp-border',
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-hp-border">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-hp-text">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-hp-text-muted mt-0.5">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={cn(!noPadding && 'p-6')}>{children}</div>
    </div>
  )
}

interface CardGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function CardGrid({ children, columns = 3, className }: CardGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-6', columnClasses[columns], className)}>
      {children}
    </div>
  )
}
