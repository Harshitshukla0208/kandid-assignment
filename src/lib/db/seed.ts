import { db, campaigns, leads, leadInteractions } from './index';

const seedCampaigns = [
    { name: 'Just Herbs', status: 'active' as const },
    { name: 'Juicy chemistry', status: 'active' as const },
    { name: 'Hyugalife 2', status: 'active' as const },
    { name: 'Honeyveda', status: 'active' as const },
    { name: 'HempStreet', status: 'active' as const },
    { name: 'HealthyHey 2', status: 'active' as const },
    { name: 'Herbal Chakra', status: 'active' as const },
    { name: 'Healöfy', status: 'active' as const },
    { name: 'HealthSense', status: 'active' as const },
    { name: 'Gynoveda', status: 'active' as const },
    { name: 'Digi Sidekick', status: 'active' as const },
    { name: 'The skin story', status: 'active' as const },
    { name: 'Pokonut', status: 'active' as const },
    { name: 'Re\'equil', status: 'active' as const },
];

const seedLeads = [
    { firstName: 'Om', lastName: 'Satyarthy', email: 'om@gynoveda.com', company: 'Gynoveda', jobTitle: 'Regional Head', status: 'pending' as const },
    { firstName: 'Dr.', lastName: 'Bhuvaneshwari', email: 'dr.bhuvana@gynoveda.com', company: 'Gynoveda', jobTitle: 'Fertility & Women\'s Health Specialist', status: 'contacted' as const },
    { firstName: 'Surdeep', lastName: 'Singh', email: 'surdeep@gynoveda.com', company: 'Gynoveda', jobTitle: 'Building Product-led SEO Growth', status: 'contacted' as const },
    { firstName: 'Dilbag', lastName: 'Singh', email: 'dilbag@gynoveda.com', company: 'Gynoveda', jobTitle: 'Manager Marketing & Communication', status: 'contacted' as const },
    { firstName: 'Vanshy', lastName: 'Jain', email: 'vanshy@gynoveda.com', company: 'Gynoveda', jobTitle: 'Ayurveda|primary infertility', status: 'contacted' as const },
    { firstName: 'Sunil', lastName: 'Pal', email: 'sunil@digisidekick.com', company: 'Digi Sidekick', jobTitle: 'Helping Fashion & Lifestyle Brands to Skyrocket their Revenues', status: 'pending' as const },
    { firstName: 'Utkarsh', lastName: 'K.', email: 'utkarsh@theskinstory.com', company: 'The Skin Story', jobTitle: 'Airbnb Host | Ex-The Skin Story', status: 'do_not_contact' as const },
    { firstName: 'Shreya', lastName: 'Ramakrishna', email: 'shreya@pokonut.com', company: 'Pokonut', jobTitle: 'Deputy Manager - Founder\'s Office', status: 'responded' as const },
    { firstName: 'Deepak', lastName: 'Kumar', email: 'deepak@requil.com', company: 'Re\'equil', jobTitle: 'Deputy manager Advertising and Marketing', status: 'responded' as const },
    { firstName: 'Sumeet', lastName: 'Malhotra', email: 'sumeet@justherbs.com', company: 'Just Herbs', jobTitle: 'Marketing Director', status: 'pending' as const },
    { firstName: 'Megha', lastName: 'Sabhlok', email: 'megha@justherbs.com', company: 'Just Herbs', jobTitle: 'Co-founder, Just Herbs', status: 'pending' as const },
    { firstName: 'Archee', lastName: 'P.', email: 'archee@justherbs.com', company: 'Just Herbs', jobTitle: 'Content and Marketing Specialist', status: 'pending' as const },
    { firstName: 'Hindustan', lastName: 'Herbs', email: 'contact@hindustanherbs.com', company: 'Hindustan Herbs', jobTitle: 'Co-Founder', status: 'pending' as const },
    { firstName: 'Ritika', lastName: 'Ohri', email: 'ritika@justherbs.com', company: 'Just Herbs', jobTitle: 'Brand Manager: Marketing, Talent and Innovation', status: 'pending' as const },
    { firstName: 'Praveen Kumar', lastName: 'Gautam', email: 'praveen@justherbs.com', company: 'Just Herbs', jobTitle: 'Vice President - Offline Sales', status: 'pending' as const },
    { firstName: 'Shubham', lastName: 'Saboo', email: 'shubham@justherbs.com', company: 'Just Herbs', jobTitle: 'Associated as C&F Agent & Superstockiest', status: 'pending' as const },
];

export async function seedDatabase(userId: string) {
    try {
        console.log('Starting database seeding...');

        // Insert campaigns
        const insertedCampaigns = await db.insert(campaigns).values(
            seedCampaigns.map(campaign => ({
                ...campaign,
                userId,
                totalLeads: 0,
                successfulLeads: 0,
                responseRate: '0.00',
            }))
        ).returning();

        console.log(`Inserted ${insertedCampaigns.length} campaigns`);

        // Map campaign names to IDs for leads
        const campaignMap = insertedCampaigns.reduce((acc, campaign) => {
            acc[campaign.name] = campaign.id;
            return acc;
        }, {} as Record<string, string>);

        // Insert leads with proper campaign associations
        const leadsWithCampaigns = seedLeads.map(lead => {
            let campaignId: string;

            // Map leads to appropriate campaigns
            if (lead.company === 'Gynoveda') campaignId = campaignMap['Gynoveda'] || insertedCampaigns[0].id;
            else if (lead.company === 'Digi Sidekick') campaignId = campaignMap['Digi Sidekick'] || insertedCampaigns[1].id;
            else if (lead.company === 'The Skin Story') campaignId = campaignMap['The skin story'] || insertedCampaigns[2].id;
            else if (lead.company === 'Pokonut') campaignId = campaignMap['Pokonut'] || insertedCampaigns[3].id;
            else if (lead.company === 'Re\'equil') campaignId = campaignMap['Re\'equil'] || insertedCampaigns[4].id;
            else if (lead.company === 'Just Herbs') campaignId = campaignMap['Just Herbs'] || insertedCampaigns[5].id;
            else if (lead.company === 'Hindustan Herbs') campaignId = campaignMap['Herbal Chakra'] || insertedCampaigns[6].id;
            else campaignId = insertedCampaigns[0].id; // Default fallback

            return {
                ...lead,
                userId,
                campaignId,
                lastContactedAt: lead.status === 'contacted' || lead.status === 'responded' ? new Date() : null,
            };
        });

        const insertedLeads = await db.insert(leads).values(leadsWithCampaigns).returning();
        console.log(`Inserted ${insertedLeads.length} leads`);

        // Update campaign lead counts
        for (const campaign of insertedCampaigns) {
            const campaignLeads = insertedLeads.filter(lead => lead.campaignId === campaign.id);
            const successfulLeads = campaignLeads.filter(lead =>
                lead.status === 'responded' || lead.status === 'converted'
            ).length;

            const responseRate = campaignLeads.length > 0
                ? ((successfulLeads / campaignLeads.length) * 100).toFixed(2)
                : '0.00';

            await db.update(campaigns)
                .set({
                    totalLeads: campaignLeads.length,
                    successfulLeads,
                    responseRate,
                })
                .where(eq(campaigns.id, campaign.id));
        }

        // Add some sample interactions
        const sampleInteractions = [
            {
                leadId: insertedLeads.find(l => l.firstName === 'Sunil')?.id || insertedLeads[0].id,
                type: 'invitation_request' as const,
                message: 'Hi Sunil, I\'m building consultative AI salespersons for personal care brands with the guarantee to boost your D2C revenue by min of 2%. Would love to connect if you\'re open to exploring this for Just Herbs!',
                status: 'pending' as const,
            },
            {
                leadId: insertedLeads.find(l => l.firstName === 'Shreya')?.id || insertedLeads[1].id,
                type: 'connection_acceptance' as const,
                message: 'Awesome to connect, Sunil! Allow me to explain Kandid a bit: So these are consultative salespersons that engage with visitors like an offline store salesperson does.',
                status: 'sent' as const,
            },
        ];

        await db.insert(leadInteractions).values(sampleInteractions);
        console.log('Added sample interactions');

        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

// Export individual arrays for flexibility
export { seedCampaigns, seedLeads };
