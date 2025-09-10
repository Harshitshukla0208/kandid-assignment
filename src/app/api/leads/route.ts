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

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await request.json()
    const { firstName, lastName, email, company, jobTitle, status = "pending", campaignId } = body
    if (!firstName || !lastName || !email || !campaignId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const [lead] = await db.insert(leads).values({
      firstName,
      lastName,
      email,
      company,
      jobTitle,
      status,
      campaignId,
      userId: session.user.id,
      lastContactedAt: status === "contacted" ? new Date() : null,
    }).returning()
    return NextResponse.json(lead)
  } catch (error) {
    console.error("Error creating lead:", error)
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
    const { id, ...updateData } = body
    if (!id) {
      return NextResponse.json({ error: "Lead id is required" }, { status: 400 })
    }
    updateData.updatedAt = new Date()
    if (updateData.status === "contacted") {
      updateData.lastContactedAt = new Date()
    }
    const [updated] = await db.update(leads)
      .set(updateData)
      .where(and(eq(leads.id, id), eq(leads.userId, session.user.id)))
      .returning()
    if (!updated) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating lead:", error)
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
      return NextResponse.json({ error: "Lead id is required" }, { status: 400 })
    }
    const [deleted] = await db.delete(leads)
      .where(and(eq(leads.id, id), eq(leads.userId, session.user.id)))
      .returning()
    if (!deleted) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
