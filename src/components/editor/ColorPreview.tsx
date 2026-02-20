'use client'

import { parseColorCodes, segmentToStyle } from '@/lib/colors'

interface ColorPreviewProps {
  text: string
  className?: string
}

export function ColorPreview({ text, className = '' }: ColorPreviewProps) {
  const segments = parseColorCodes(text)

  return (
    <span className={`font-mono ${className}`}>
      {segments.map((segment, index) => (
        <span key={index} style={segmentToStyle(segment)}>
          {segment.text}
        </span>
      ))}
    </span>
  )
}
