'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-hp-surface-2 rounded-md border border-hp-border shadow-lg whitespace-nowrap',
            'animate-in fade-in-0 zoom-in-95',
            positions[side]
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
