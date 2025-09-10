import { db, campaigns, leads } from './index';

export async function seedDatabase(userId: string) {
  const now = new Date();

  // Insert three sample campaigns for the user
  const insertedCampaigns = await db
    .insert(campaigns)
    .values([
      {
        name: 'Welcome Campaign',
        status: 'active',
        userId,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Product Launch',
        status: 'draft',
        userId,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Re-engagement',
        status: 'paused',
        userId,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .returning();

  // Create three sample leads (one per campaign)
  const [c1, c2, c3] = insertedCampaigns;

  await db.insert(leads).values([
    {
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex.johnson@example.com',
      company: 'Acme Inc',
      jobTitle: 'Operations Manager',
      description: 'Interested in streamlining workflows.',
      status: 'pending',
      campaignId: c1.id,
      userId,
      createdAt: now,
      updatedAt: now,
    },
    {
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@example.com',
      company: 'Globex',
      jobTitle: 'Product Lead',
      description: 'Looking for product analytics tooling.',
      status: 'contacted',
      campaignId: c2.id,
      userId,
      createdAt: now,
      updatedAt: now,
    },
    {
      firstName: 'Diego',
      lastName: 'Martinez',
      email: 'diego.martinez@example.com',
      company: 'Initech',
      jobTitle: 'Sales Director',
      description: 'Requested pricing details.',
      status: 'responded',
      campaignId: c3.id,
      userId,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  return { campaigns: insertedCampaigns };
}
