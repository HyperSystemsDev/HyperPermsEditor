'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface TabOption {
  value: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

interface TabsProps {
  value: string
  onChange: (value: string) => void
  options: TabOption[]
  className?: string
}

export function Tabs({ value, onChange, options, className }: TabsProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg bg-hp-surface-2 p-1',
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => !option.disabled && onChange(option.value)}
          disabled={option.disabled}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            value === option.value
              ? 'bg-hp-surface text-hp-text shadow-sm'
              : 'text-hp-text-muted hover:text-hp-text',
            option.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  )
}

interface TabPanelProps {
  value: string
  activeValue: string
  children: ReactNode
}

export function TabPanel({ value, activeValue, children }: TabPanelProps) {
  if (value !== activeValue) return null
  return <>{children}</>
}
