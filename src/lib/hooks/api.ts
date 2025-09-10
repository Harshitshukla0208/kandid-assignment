import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Lead, Campaign, LeadInteraction } from '@/lib/db/schema';

// --- Static demo data (frontend-only hardcoded) ---
const STATIC_CAMPAIGNS: (Campaign & {
  actualTotalLeads?: number;
  respondedLeads?: number;
  convertedLeads?: number;
  contactedLeads?: number;
})[] = [
  {
    id: 'c1-1111-1111-1111-111111111111',
    name: 'Product Launch Outreach',
    status: 'active',
    userId: 'u-demo-user-id',
    totalLeads: 3,
    successfulLeads: 1,
    responseRate: '33.00' as unknown as any,
    createdAt: new Date() as unknown as any,
    updatedAt: new Date() as unknown as any,
    actualTotalLeads: 3,
    respondedLeads: 1,
    convertedLeads: 1,
    contactedLeads: 1,
  },
  {
    id: 'c2-2222-2222-2222-222222222222',
    name: 'Webinar Signups',
    status: 'paused',
    userId: 'u-demo-user-id',
    totalLeads: 3,
    successfulLeads: 0,
    responseRate: '0.00' as unknown as any,
    createdAt: new Date() as unknown as any,
    updatedAt: new Date() as unknown as any,
    actualTotalLeads: 0,
    respondedLeads: 0,
    convertedLeads: 0,
    contactedLeads: 0,
  },
  {
    id: 'c3-3333-3333-3333-333333333333',
    name: 'Beta Waitlist',
    status: 'draft',
    userId: 'u-demo-user-id',
    totalLeads: 0,
    successfulLeads: 0,
    responseRate: '0.00' as unknown as any,
    createdAt: new Date() as unknown as any,
    updatedAt: new Date() as unknown as any,
    actualTotalLeads: 0,
    respondedLeads: 0,
    convertedLeads: 0,
    contactedLeads: 0,
  },
];

const STATIC_LEADS: (Lead & { campaignName?: string; interactions?: LeadInteraction[] })[] = [
  {
    id: 'l1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    firstName: 'Alice',
    lastName: 'Nguyen',
    email: 'alice.nguyen@example.com',
    company: 'Acme Co.',
    jobTitle: 'Engineering Manager',
    description: 'Interested in product launch details.',
    status: 'responded',
    campaignId: 'c1-1111-1111-1111-111111111111',
    userId: 'u-demo-user-id',
    lastContactedAt: new Date() as unknown as any,
    createdAt: new Date() as unknown as any,
    updatedAt: new Date() as unknown as any,
    campaignName: 'Product Launch Outreach',
    interactions: [],
  },
  {
    id: 'l2-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    firstName: 'Brian',
    lastName: 'Lee',
    email: 'brian.lee@example.com',
    company: 'Globex',
    jobTitle: 'Founder',
    description: 'Asked about pricing tiers.',
    status: 'contacted',
    campaignId: 'c1-1111-1111-1111-111111111111',
    userId: 'u-demo-user-id',
    lastContactedAt: new Date() as unknown as any,
    createdAt: new Date() as unknown as any,
    updatedAt: new Date() as unknown as any,
    campaignName: 'Product Launch Outreach',
    interactions: [],
  },
  {
    id: 'l3-cccc-cccc-cccc-cccccccccccc',
    firstName: 'Chloe',
    lastName: 'Ramos',
    email: 'chloe.ramos@example.com',
    company: 'Initech',
    jobTitle: 'Product Designer',
    description: 'Interested in beta access.',
    status: 'pending',
    campaignId: 'c3-3333-3333-3333-333333333333',
    userId: 'u-demo-user-id',
    lastContactedAt: null as unknown as any,
    createdAt: new Date() as unknown as any,
    updatedAt: new Date() as unknown as any,
    campaignName: 'Beta Waitlist',
    interactions: [],
  },
];

// API functions
const api = {
    // Leads
    getLeads: async (page = 0, search = '', filter = 'all'): Promise<{ leads: Lead[]; hasMore: boolean }> => {
        // Frontend hardcoded data: basic search/filter on the client
        const normalizedSearch = search.trim().toLowerCase();
        const filtered = STATIC_LEADS.filter((lead) => {
            const matchesSearch = !normalizedSearch
                || lead.firstName.toLowerCase().includes(normalizedSearch)
                || lead.lastName.toLowerCase().includes(normalizedSearch)
                || lead.email.toLowerCase().includes(normalizedSearch)
                || (lead.company ? lead.company.toLowerCase().includes(normalizedSearch) : false);
            const matchesFilter = filter === 'all' || lead.status === (filter as Lead['status']);
            return matchesSearch && matchesFilter;
        });
        // Simulate pagination (20 per page)
        const start = page * 20;
        const pageLeads = filtered.slice(start, start + 20);
        const hasMore = start + 20 < filtered.length;
        return Promise.resolve({ leads: pageLeads as unknown as Lead[], hasMore });
    },

    getLead: async (id: string): Promise<Lead & { interactions: LeadInteraction[] }> => {
        const found = STATIC_LEADS.find(l => l.id === id);
        if (!found) throw new Error('Lead not found');
        const interactions: LeadInteraction[] = (found.interactions || []) as unknown as LeadInteraction[];
        return Promise.resolve({ ...(found as unknown as Lead), interactions });
    },

    createLead: async (lead: Partial<Lead>): Promise<Lead> => {
        const res = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead),
        });
        if (!res.ok) throw new Error('Failed to create lead');
        return res.json();
    },
    updateLead: async (lead: Partial<Lead> & { id: string }): Promise<Lead> => {
        const res = await fetch('/api/leads', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead),
        });
        if (!res.ok) throw new Error('Failed to update lead');
        return res.json();
    },
    deleteLead: async (id: string): Promise<{ success: boolean }> => {
        const res = await fetch('/api/leads', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error('Failed to delete lead');
        return res.json();
    },

    updateLeadStatus: async ({ id, status }: { id: string; status: Lead['status'] }): Promise<Lead> => {
        const res = await fetch(`/api/lead/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Failed to update lead status');
        return res.json();
    },

    // Campaigns
    getCampaigns: async (search = '', filter = 'all'): Promise<Campaign[]> => {
        const normalizedSearch = search.trim().toLowerCase();
        const filtered = STATIC_CAMPAIGNS.filter((c) => {
            const matchesSearch = !normalizedSearch || c.name.toLowerCase().includes(normalizedSearch);
            const matchesFilter = filter === 'all' || c.status === (filter as Campaign['status']);
            return matchesSearch && matchesFilter;
        });
        return Promise.resolve(filtered as unknown as Campaign[]);
    },

    getCampaign: async (id: string): Promise<Campaign & { leads: Lead[] }> => {
        const campaign = STATIC_CAMPAIGNS.find(c => c.id === id);
        if (!campaign) throw new Error('Campaign not found');
        const leads = STATIC_LEADS.filter(l => l.campaignId === id) as unknown as Lead[];
        return Promise.resolve({ ...(campaign as unknown as Campaign), leads });
    },

    createCampaign: async (campaign: Partial<Campaign>): Promise<Campaign> => {
        const res = await fetch('/api/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(campaign),
        });
        if (!res.ok) throw new Error('Failed to create campaign');
        return res.json();
    },
    updateCampaign: async (campaign: Partial<Campaign> & { id: string }): Promise<Campaign> => {
        const res = await fetch('/api/campaigns', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(campaign),
        });
        if (!res.ok) throw new Error('Failed to update campaign');
        return res.json();
    },
    deleteCampaign: async (id: string): Promise<{ success: boolean }> => {
        const res = await fetch('/api/campaigns', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error('Failed to delete campaign');
        return res.json();
    },

    updateCampaignStatus: async ({ id, status }: { id: string; status: Campaign['status'] }): Promise<Campaign> => {
        const res = await fetch(`/api/campaigns/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Failed to update campaign status');
        return res.json();
    },

    // Dashboard stats
    getDashboardStats: async () => {
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        return res.json();
    },
};

// Leads hooks
export const useInfiniteLeads = (search: string, filter: string) => {
    return useInfiniteQuery({
        queryKey: ['leads', 'infinite', search, filter],
        queryFn: ({ pageParam = 0 }) => api.getLeads(pageParam, search, filter),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.hasMore ? allPages.length : undefined;
        },
        initialPageParam: 0,
    });
};

export const useLead = (id: string) => {
    return useQuery({
        queryKey: ['lead', id],
        queryFn: () => api.getLead(id),
        enabled: !!id,
    });
};

export const useCreateLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};
export const useUpdateLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.updateLead,
        onSuccess: (updatedLead) => {
            queryClient.setQueryData(['lead', updatedLead.id], updatedLead);
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};
export const useDeleteLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.deleteLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useUpdateLeadStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.updateLeadStatus,
        onSuccess: (updatedLead) => {
            // Update lead cache
            queryClient.setQueryData(['lead', updatedLead.id], updatedLead);

            // Invalidate leads list to refresh
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

// Campaigns hooks
export const useCampaigns = (search: string, filter: string) => {
    return useQuery({
        queryKey: ['campaigns', search, filter],
        queryFn: () => api.getCampaigns(search, filter),
    });
};

export const useCampaign = (id: string) => {
    return useQuery({
        queryKey: ['campaign', id],
        queryFn: () => api.getCampaign(id),
        enabled: !!id,
    });
};

export const useCreateCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createCampaign,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};
export const useUpdateCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.updateCampaign,
        onSuccess: (updatedCampaign) => {
            queryClient.setQueryData(['campaign', updatedCampaign.id], updatedCampaign);
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};
export const useDeleteCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.deleteCampaign,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useUpdateCampaignStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.updateCampaignStatus,
        onSuccess: (updatedCampaign) => {
            // Update campaign cache
            queryClient.setQueryData(['campaign', updatedCampaign.id], updatedCampaign);

            // Invalidate campaigns list to refresh
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

// Dashboard hooks
export const useDashboardStats = () => {
    return useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: api.getDashboardStats,
    });
};
