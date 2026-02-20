import { NextRequest, NextResponse } from 'next/server'
import { getSessionStore } from '@/lib/store'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit'
import { getClientIp, validateOrigin } from '@/lib/cors'
import { toBackendFormat } from '@/lib/transformers'
import type { Session, PermissionData } from '@/lib/types'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET - Fetch session
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format')

    const store = getSessionStore()
    const data = await store.get(`session:${id}`)

    if (!data) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      )
    }

    const session: Session = JSON.parse(data)

    if (format === 'backend') {
      return NextResponse.json({
        ...session,
        original: toBackendFormat(session.original),
        current: toBackendFormat(session.current),
      })
    }

    return NextResponse.json(session)

  } catch (error) {
    console.error('Failed to fetch session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update session
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403 }
      )
    }

    const ip = getClientIp(request)
    const { allowed, remaining } = await checkRateLimit(
      `rate:session:modify:${ip}`,
      RATE_LIMITS.SESSION_MODIFY.limit,
      RATE_LIMITS.SESSION_MODIFY.windowSeconds
    )

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'X-RateLimit-Remaining': remaining.toString() }
        }
      )
    }

    const { id } = await context.params
    const body = await request.json()

    const store = getSessionStore()
    const data = await store.get(`session:${id}`)

    if (!data) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      )
    }

    const session: Session = JSON.parse(data)

    if (body.current) {
      session.current = body.current as PermissionData
    }
    session.lastModified = Date.now()

    const now = Date.now()
    const remainingMs = session.expiresAt - now
    const remainingSeconds = Math.max(1, Math.floor(remainingMs / 1000))

    await store.set(`session:${id}`, JSON.stringify(session), remainingSeconds)

    return NextResponse.json({ success: true, lastModified: session.lastModified })

  } catch (error) {
    console.error('Failed to update session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete session
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403 }
      )
    }

    const ip = getClientIp(request)
    const { allowed, remaining } = await checkRateLimit(
      `rate:session:modify:${ip}`,
      RATE_LIMITS.SESSION_MODIFY.limit,
      RATE_LIMITS.SESSION_MODIFY.windowSeconds
    )

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'X-RateLimit-Remaining': remaining.toString() }
        }
      )
    }

    const { id } = await context.params
    const store = getSessionStore()

    await store.del(`session:${id}`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Failed to delete session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
