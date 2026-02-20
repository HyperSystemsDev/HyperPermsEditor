import type { CSSProperties } from 'react'

// Minecraft/Hytale color code mappings
export const LEGACY_COLORS: Record<string, string> = {
  '0': '#000000', // Black
  '1': '#0000AA', // Dark Blue
  '2': '#00AA00', // Dark Green
  '3': '#00AAAA', // Dark Aqua
  '4': '#AA0000', // Dark Red
  '5': '#AA00AA', // Dark Purple
  '6': '#FFAA00', // Gold
  '7': '#AAAAAA', // Gray
  '8': '#555555', // Dark Gray
  '9': '#5555FF', // Blue
  'a': '#55FF55', // Green
  'b': '#55FFFF', // Aqua
  'c': '#FF5555', // Red
  'd': '#FF55FF', // Light Purple
  'e': '#FFFF55', // Yellow
  'f': '#FFFFFF', // White
}

export const FORMAT_CODES: Record<string, string> = {
  'l': 'font-weight: bold',
  'o': 'font-style: italic',
  'n': 'text-decoration: underline',
  'm': 'text-decoration: line-through',
  'r': '', // Reset
}

export interface ColorSegment {
  text: string
  color: string
  styles: string[]
}

/**
 * Parse a string with color codes into segments for rendering
 */
export function parseColorCodes(input: string): ColorSegment[] {
  if (!input) return [{ text: '', color: '#FFFFFF', styles: [] }]

  const segments: ColorSegment[] = []
  let currentColor = '#FFFFFF'
  let currentStyles: string[] = []
  let currentText = ''

  let i = 0
  while (i < input.length) {
    // Check for color code
    if (input[i] === '&' && i + 1 < input.length) {
      const code = input[i + 1].toLowerCase()

      // Check for hex color &#RRGGBB or &#RGB
      if (code === '#' && i + 2 < input.length) {
        // Save current segment
        if (currentText) {
          segments.push({ text: currentText, color: currentColor, styles: [...currentStyles] })
          currentText = ''
        }

        // Parse hex
        const hexMatch = input.slice(i + 2).match(/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/)
        if (hexMatch) {
          let hex = hexMatch[1]
          if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
          }
          currentColor = `#${hex}`
          i += 2 + hexMatch[1].length
          continue
        }
      }

      // Check for legacy color
      if (LEGACY_COLORS[code]) {
        if (currentText) {
          segments.push({ text: currentText, color: currentColor, styles: [...currentStyles] })
          currentText = ''
        }
        currentColor = LEGACY_COLORS[code]
        i += 2
        continue
      }

      // Check for format code
      if (FORMAT_CODES[code] !== undefined) {
        if (currentText) {
          segments.push({ text: currentText, color: currentColor, styles: [...currentStyles] })
          currentText = ''
        }
        if (code === 'r') {
          currentColor = '#FFFFFF'
          currentStyles = []
        } else {
          currentStyles.push(FORMAT_CODES[code])
        }
        i += 2
        continue
      }
    }

    currentText += input[i]
    i++
  }

  // Add final segment
  if (currentText) {
    segments.push({ text: currentText, color: currentColor, styles: [...currentStyles] })
  }

  return segments.length > 0 ? segments : [{ text: '', color: '#FFFFFF', styles: [] }]
}

/**
 * Strip all color codes from text
 */
export function stripColors(input: string): string {
  if (!input) return ''
  return input
    .replace(/&[0-9a-fk-or]/gi, '')
    .replace(/&#[A-Fa-f0-9]{3,6}/g, '')
}

/**
 * Get preview-safe CSS for color segments
 */
export function segmentToStyle(segment: ColorSegment): CSSProperties {
  const decorations = segment.styles
    .filter(s => s.includes('text-decoration'))
    .map(s => s.split(': ')[1])

  return {
    color: segment.color,
    fontWeight: segment.styles.includes('font-weight: bold') ? 'bold' : undefined,
    fontStyle: segment.styles.includes('font-style: italic') ? 'italic' : undefined,
    textDecoration: decorations.length > 0 ? decorations.join(' ') : undefined,
  }
}

/**
 * Get a color for weight-based ordering (for visual display)
 */
export function getWeightColor(weight: number, maxWeight: number = 1000): string {
  const ratio = Math.min(weight / maxWeight, 1)
  // Gradient from blue (low) to purple (high)
  const hue = 240 - (ratio * 60) // 240 = blue, 180 = cyan
  return `hsl(${hue}, 70%, 60%)`
}
