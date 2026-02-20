import { NextRequest, NextResponse } from 'next/server'
import { getSessionStore } from '@/lib/store'
import { toBackendGroup, toBackendUser } from '@/lib/transformers'
import type { Session, ChangeSummary } from '@/lib/types'
import { calculateDiff, generateSummary, countChangesFromDiff } from '@/lib/diff'

type RouteContext = {
  params: Promise<{ id: string }>
}

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
    const changes = calculateDiff(session.original, session.current)
    const summary = generateSummary(changes)

    if (format === 'backend') {
      const backendChanges = {
        ...changes,
        groupsToCreate: changes.groupsToCreate.map(toBackendGroup),
        groupsToUpdate: changes.groupsToUpdate.map(toBackendGroup),
        usersToUpdate: changes.usersToUpdate.map(toBackendUser),
      }

      return NextResponse.json({
        changes: backendChanges,
        summary,
        changeCount: countChangesFromDiff(changes),
      })
    }

    const response: ChangeSummary = {
      changes,
      summary,
      changeCount: countChangesFromDiff(changes),
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Failed to calculate changes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
