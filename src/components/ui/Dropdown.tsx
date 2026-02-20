'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface DropdownItem {
  label: string
  value: string
  icon?: ReactNode
  disabled?: boolean
  danger?: boolean
}

interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  onSelect: (value: string) => void
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({
  trigger,
  items,
  onSelect,
  align = 'left',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[180px] rounded-lg bg-hp-surface border border-hp-border shadow-xl',
            'animate-in fade-in-0 zoom-in-95',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="py-1">
            {items.map((item) => (
              <button
                key={item.value}
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    onSelect(item.value)
                    setIsOpen(false)
                  }
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors',
                  item.danger
                    ? 'text-hp-danger hover:bg-hp-danger/10'
                    : 'text-hp-text hover:bg-hp-surface-2',
                  item.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface DropdownButtonProps {
  label: string
  items: DropdownItem[]
  onSelect: (value: string) => void
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
}

export function DropdownButton({
  label,
  items,
  onSelect,
  variant = 'secondary',
  className,
}: DropdownButtonProps) {
  return (
    <Dropdown
      trigger={
        <Button variant={variant} className={className}>
          {label}
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      }
      items={items}
      onSelect={onSelect}
    />
  )
}
