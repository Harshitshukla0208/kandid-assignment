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
        const res = await fetch(`/api/lead/${id}`);
        if (!res.ok) throw new Error('Failed to fetch lead');
        return res.json();
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
