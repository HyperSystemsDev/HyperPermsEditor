'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-hp-text mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 px-3 rounded-lg bg-hp-surface border border-hp-border',
            'text-hp-text placeholder:text-hp-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-hp-primary focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-hp-danger focus:ring-hp-danger',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-hp-danger">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-hp-text-muted">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
