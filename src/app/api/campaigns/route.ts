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
