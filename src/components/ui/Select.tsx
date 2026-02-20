'use client'

import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  onChange?: (value: string) => void
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, onChange, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-hp-text mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-10 px-3 pr-10 rounded-lg bg-hp-surface border border-hp-border',
              'text-hp-text appearance-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-hp-primary focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-hp-danger focus:ring-hp-danger',
              className
            )}
            onChange={(e) => onChange?.(e.target.value)}
            {...props}
          >
            {placeholder && (
              <option value="">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hp-text-muted pointer-events-none" />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-hp-danger">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
