'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface CopyButtonProps {
  text: string
  className?: string
  variant?: 'default' | 'ghost'
}

export function CopyButton({
  text,
  className,
  variant = 'ghost',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Button
      variant={variant === 'ghost' ? 'ghost' : 'secondary'}
      size="sm"
      onClick={handleCopy}
      className={cn('h-8 w-8 p-0', className)}
    >
      {copied ? (
        <Check className="w-4 h-4 text-hp-success" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </Button>
  )
}
