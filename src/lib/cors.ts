import { NextRequest } from 'next/server'

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return ip
}

export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

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
