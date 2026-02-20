import { NextResponse } from 'next/server'
import { getSessionStore } from '@/lib/store'

export async function GET() {
  try {
    const store = getSessionStore()
    // Test connectivity with a simple set/get
    await store.set('health:check', 'ok', 10)
    const result = await store.get('health:check')

    if (result !== 'ok') {
      return NextResponse.json(
        { status: 'degraded', store: 'read-back mismatch' },
        { status: 503 }
      )
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { status: 'error', message: 'Store connectivity failed' },
      { status: 503 }
    )
  }
}
