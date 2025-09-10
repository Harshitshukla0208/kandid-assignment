import { NextResponse } from 'next/server';
import { db, campaigns, leads } from '@/lib/db';
import { auth } from '@/lib/auth';
import { eq, count, sql } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get campaign stats
        const campaignStats = await db
            .select({
                totalCampaigns: count(),
                activeCampaigns: sql<number>`COUNT(CASE WHEN ${campaigns.status} = 'active' THEN 1 END)`,
                pausedCampaigns: sql<number>`COUNT(CASE WHEN ${campaigns.status} = 'paused' THEN 1 END)`,
                draftCampaigns: sql<number>`COUNT(CASE WHEN ${campaigns.status} = 'draft' THEN 1 END)`,
            })
            .from(campaigns)
            .where(eq(campaigns.userId, session.user.id));

        // Get lead stats
        const leadStats = await db
            .select({
                totalLeads: count(),
                pendingLeads: sql<number>`COUNT(CASE WHEN ${leads.status} = 'pending' THEN 1 END)`,
                contactedLeads: sql<number>`COUNT(CASE WHEN ${leads.status} = 'contacted' THEN 1 END)`,
                respondedLeads: sql<number>`COUNT(CASE WHEN ${leads.status} = 'responded' THEN 1 END)`,
                convertedLeads: sql<number>`COUNT(CASE WHEN ${leads.status} = 'converted' THEN 1 END)`,
                doNotContactLeads: sql<number>`COUNT(CASE WHEN ${leads.status} = 'do_not_contact' THEN 1 END)`,
            })
            .from(leads)
            .where(eq(leads.userId, session.user.id));

        const responseRate = leadStats[0].totalLeads > 0
            ? Math.round((leadStats[0].respondedLeads / leadStats[0].totalLeads) * 100)
            : 0;

        const conversionRate = leadStats[0].totalLeads > 0
            ? Math.round((leadStats[0].convertedLeads / leadStats[0].totalLeads) * 100)
            : 0;

        return NextResponse.json({
            campaigns: campaignStats[0],
            leads: leadStats[0],
            metrics: {
                responseRate,
                conversionRate,
                messagesSent: leadStats[0].contactedLeads + leadStats[0].respondedLeads,
            },
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
