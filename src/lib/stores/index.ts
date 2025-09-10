import { create } from 'zustand';
import { Lead, Campaign } from '@/lib/db/schema';

// UI State Store
interface UIState {
    sidebarCollapsed: boolean;
    selectedLead: Lead | null;
    selectedCampaign: Campaign | null;
    leadsFilter: string;
    campaignsFilter: string;
    leadSearchQuery: string;
    campaignSearchQuery: string;
    isLeadSheetOpen: boolean;

    // Actions
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setSelectedLead: (lead: Lead | null) => void;
    setSelectedCampaign: (campaign: Campaign | null) => void;
    setLeadsFilter: (filter: string) => void;
    setCampaignsFilter: (filter: string) => void;
    setLeadSearchQuery: (query: string) => void;
    setCampaignSearchQuery: (query: string) => void;
    setLeadSheetOpen: (open: boolean) => void;
    openLeadSheet: (lead: Lead) => void;
    closeLeadSheet: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarCollapsed: false,
    selectedLead: null,
    selectedCampaign: null,
    leadsFilter: 'all',
    campaignsFilter: 'all',
    leadSearchQuery: '',
    campaignSearchQuery: '',
    isLeadSheetOpen: false,

    toggleSidebar: () => set((state) => ({
        sidebarCollapsed: !state.sidebarCollapsed
    })),

    setSidebarCollapsed: (collapsed) => set({
        sidebarCollapsed: collapsed
    }),

    setSelectedLead: (lead) => set({
        selectedLead: lead
    }),

    setSelectedCampaign: (campaign) => set({
        selectedCampaign: campaign
    }),

    setLeadsFilter: (filter) => set({
        leadsFilter: filter
    }),

    setCampaignsFilter: (filter) => set({
        campaignsFilter: filter
    }),

    setLeadSearchQuery: (query) => set({
        leadSearchQuery: query
    }),

    setCampaignSearchQuery: (query) => set({
        campaignSearchQuery: query
    }),

    setLeadSheetOpen: (open) => set({
        isLeadSheetOpen: open
    }),

    openLeadSheet: (lead) => set({
        selectedLead: lead,
        isLeadSheetOpen: true
    }),

    closeLeadSheet: () => set({
        selectedLead: null,
        isLeadSheetOpen: false
    }),
}));
