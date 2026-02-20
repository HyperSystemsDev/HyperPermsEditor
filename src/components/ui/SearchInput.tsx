'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, ...props }, ref) => {
    return (
      <div className={cn('relative', className)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hp-text-muted" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full h-10 pl-10 pr-10 rounded-lg bg-hp-surface border border-hp-border',
            'text-hp-text placeholder:text-hp-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-hp-primary focus:border-transparent'
          )}
          {...props}
        />
        {value && (
          <button
            onClick={() => {
              onChange('')
              onClear?.()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-hp-text-muted hover:text-hp-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'

export { SearchInput }
