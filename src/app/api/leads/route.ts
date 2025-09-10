import { type NextRequest, NextResponse } from "next/server"
import { db, leads, campaigns } from "@/lib/db"
import { auth } from "@/lib/auth"
import { eq, and, ilike, desc, or } from "drizzle-orm"
import { headers } from "next/headers"

type LeadStatus = "pending" | "contacted" | "responded" | "converted" | "do_not_contact"

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "0")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const filter = searchParams.get("filter") || "all"

    // Build query conditions
    const whereConditions = [eq(leads.userId, session.user.id)]

    if (search) {
      whereConditions.push(
        or(
          ilike(leads.firstName, `%${search}%`),
          ilike(leads.lastName, `%${search}%`),
          ilike(leads.email, `%${search}%`),
          ilike(leads.company, `%${search}%`),
        )!,
      )
    }

    if (filter !== "all") {
      whereConditions.push(eq(leads.status, filter as LeadStatus))
    }

    // Get leads with campaign info
    const leadsData = await db
      .select({
        id: leads.id,
        firstName: leads.firstName,
        lastName: leads.lastName,
        email: leads.email,
        company: leads.company,
        jobTitle: leads.jobTitle,
        status: leads.status,
        lastContactedAt: leads.lastContactedAt,
        createdAt: leads.createdAt,
        campaignName: campaigns.name,
      })
      .from(leads)
      .leftJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(and(...whereConditions))
      .orderBy(desc(leads.createdAt))
      .limit(limit + 1) // Get one extra to check if there's more
      .offset(page * limit)

    const hasMore = leadsData.length > limit
    const finalLeads = hasMore ? leadsData.slice(0, -1) : leadsData

    return NextResponse.json({
      leads: finalLeads,
      hasMore,
    })
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
