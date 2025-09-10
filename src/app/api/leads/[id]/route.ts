import { NextRequest, NextResponse } from 'next/server'
import { db, leads, leadInteractions } from '@/lib/db'
import { auth } from '@/lib/auth'
import { eq, and, desc } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const leadData = await db
      .select()
      .from(leads)
      .where(and(eq(leads.id, id), eq(leads.userId, session.user.id)))
      .limit(1)

    if (leadData.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const interactions = await db
      .select()
      .from(leadInteractions)
      .where(eq(leadInteractions.leadId, id))
      .orderBy(desc(leadInteractions.createdAt))

    return NextResponse.json({
      ...leadData[0],
      interactions,
    })
  } catch (error) {
    console.error('Error fetching lead:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body
    const { id } = await context.params

    const updatedLead = await db
      .update(leads)
      .set({
        status,
        updatedAt: new Date(),
        ...(status === 'contacted' ? { lastContactedAt: new Date() } : {}),
      })
      .where(and(eq(leads.id, id), eq(leads.userId, session.user.id)))
      .returning()

    if (updatedLead.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json(updatedLead[0])
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
