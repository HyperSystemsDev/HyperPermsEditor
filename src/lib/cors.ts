import { NextRequest } from 'next/server'

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return ip
}

function extractHost(url: string): string | null {
  try {
    const parsed = new URL(url)
    return parsed.host
  } catch {
    return null
  }
}

export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Same-origin check: compare Origin/Referer host against the request's Host header
  const requestHost = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const sourceHost = extractHost(origin || referer || '')
  if (requestHost && sourceHost && requestHost === sourceHost) {
    return true
  }

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean) as string[]

  // Add custom origins from env
  const extraOrigins = process.env.ALLOWED_ORIGINS
  if (extraOrigins) {
    allowedOrigins.push(...extraOrigins.split(',').map(o => o.trim()).filter(Boolean))
  }

  if (origin && allowedOrigins.some(o => origin.startsWith(o))) {
    return true
  }

  if (referer && allowedOrigins.some(o => referer.startsWith(o))) {
    return true
  }

  // Allow requests without origin/referer (same-origin requests from browser)
  if (!origin && !referer) {
    return true
  }

  console.warn('CSRF validation failed:', { origin, referer, allowedOrigins })
  return false
}
