import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Lead, Campaign, LeadInteraction } from '@/lib/db/schema';

// API functions
const api = {
    // Leads
    getLeads: async (page = 0, search = '', filter = 'all'): Promise<{ leads: Lead[]; hasMore: boolean }> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '20',
            search,
            filter,
        });
        const res = await fetch(`/api/leads?${params}`);
        if (!res.ok) throw new Error('Failed to fetch leads');
        return res.json();
    },

    getLead: async (id: string): Promise<Lead & { interactions: LeadInteraction[] }> => {
        const res = await fetch(`/api/leads/${id}`);
        if (!res.ok) throw new Error('Failed to fetch lead');
        return res.json();
    },

    updateLeadStatus: async ({ id, status }: { id: string; status: Lead['status'] }): Promise<Lead> => {
        const res = await fetch(`/api/leads/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Failed to update lead status');
        return res.json();
    },

    // Campaigns
    getCampaigns: async (search = '', filter = 'all'): Promise<Campaign[]> => {
        const params = new URLSearchParams({ search, filter });
        const res = await fetch(`/api/campaigns?${params}`);
        if (!res.ok) throw new Error('Failed to fetch campaigns');
        return res.json();
    },

    getCampaign: async (id: string): Promise<Campaign & { leads: Lead[] }> => {
        const res = await fetch(`/api/campaigns/${id}`);
        if (!res.ok) throw new Error('Failed to fetch campaign');
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
