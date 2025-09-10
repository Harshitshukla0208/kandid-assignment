import { type NextRequest, NextResponse } from "next/server"
import { db, campaigns, leads } from "@/lib/db"
import { auth } from "@/lib/auth"
import { eq, and, ilike, desc, count, sql } from "drizzle-orm"
import { headers } from "next/headers"

type CampaignStatus = "draft" | "active" | "paused" | "completed"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const filter = searchParams.get("filter") || "all"

    // Build query conditions
    const whereConditions = [eq(campaigns.userId, session.user.id)]

    if (search) {
      whereConditions.push(ilike(campaigns.name, `%${search}%`))
    }

    if (filter !== "all") {
      whereConditions.push(eq(campaigns.status, filter as CampaignStatus))
    }

    // Get campaigns with lead counts and stats
    const campaignsData = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        status: campaigns.status,
        totalLeads: campaigns.totalLeads,
        successfulLeads: campaigns.successfulLeads,
        responseRate: campaigns.responseRate,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
        // Calculate real-time stats
        actualTotalLeads: count(leads.id),
        pendingLeads: sql<number>`COUNT(CASE WHEN ${leads.status} = 'pending' THEN 1 END)`,
        contactedLeads: sql<number>`COUNT(CASE WHEN ${leads.status} = 'contacted' THEN 1 END)`,
        respondedLeads: sql<number>`COUNT(CASE WHEN ${leads.status} = 'responded' THEN 1 END)`,
        convertedLeads: sql<number>`COUNT(CASE WHEN ${leads.status} = 'converted' THEN 1 END)`,
      })
      .from(campaigns)
      .leftJoin(leads, eq(campaigns.id, leads.campaignId))
      .where(and(...whereConditions))
      .groupBy(campaigns.id)
      .orderBy(desc(campaigns.createdAt))

    return NextResponse.json(campaignsData)
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await request.json()
    const { name, status = "draft" } = body
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    const [campaign] = await db.insert(campaigns).values({
      name,
      status,
      userId: session.user.id,
      totalLeads: 0,
      successfulLeads: 0,
      responseRate: "0.00",
    }).returning()
    return NextResponse.json(campaign)
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await request.json()
    const { id, name, status } = body
    if (!id) {
      return NextResponse.json({ error: "Campaign id is required" }, { status: 400 })
    }
    const updateData: any = { updatedAt: new Date() }
    if (name) updateData.name = name
    if (status) updateData.status = status
    const [updated] = await db.update(campaigns)
      .set(updateData)
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, session.user.id)))
      .returning()
    if (!updated) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating campaign:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await request.json()
    const { id } = body
    if (!id) {
      return NextResponse.json({ error: "Campaign id is required" }, { status: 400 })
    }
    const [deleted] = await db.delete(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, session.user.id)))
      .returning()
    if (!deleted) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting campaign:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
