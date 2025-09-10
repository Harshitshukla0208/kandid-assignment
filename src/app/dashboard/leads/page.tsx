'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInfiniteLeads } from '@/lib/hooks/api';
import { useUIStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { LeadDetailSheet } from '@/components/leads/lead-details-sheet';
import {
    Search,
    Filter,
    User,
    Mail,
    Building,
    Clock,
    CheckCircle,
    AlertCircle,
    Ban
} from 'lucide-react';
import { Lead } from '@/lib/db/schema';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCreateLead } from '@/lib/hooks/api';
import { useCampaigns } from '@/lib/hooks/api';
import { useToast } from '@/lib/hooks/toast';

const statusColors = {
    pending: 'bg-orange-100 text-orange-800',
    contacted: 'bg-blue-100 text-blue-800',
    responded: 'bg-green-100 text-green-800',
    converted: 'bg-purple-100 text-purple-800',
    do_not_contact: 'bg-red-100 text-red-800',
};

const statusIcons = {
    pending: Clock,
    contacted: Mail,
    responded: CheckCircle,
    converted: CheckCircle,
    do_not_contact: Ban,
};

type LeadCardProps = { lead: Lead & { campaignName?: string } };

function LeadCard({ lead }: LeadCardProps) {
    const { openLeadSheet } = useUIStore();
    const StatusIcon = statusIcons[lead.status as keyof typeof statusIcons];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openLeadSheet(lead)}
            >
                <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                                {lead.firstName[0]}{lead.lastName[0]}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {lead.firstName} {lead.lastName}
                                </h3>
                                <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {lead.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2" />
                                    <span className="truncate">{lead.email}</span>
                                </div>

                                {lead.company && (
                                    <div className="flex items-center">
                                        <Building className="w-4 h-4 mr-2" />
                                        <span className="truncate">{lead.company}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Campaign: {lead.campaignName}</span>
                                    {lead.lastContactedAt && (
                                        <span className="text-gray-500">
                                            Last contact: {new Date(lead.lastContactedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function LeadSkeleton() {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function LeadsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const {
        leadSearchQuery,
        leadsFilter,
        setLeadSearchQuery,
        setLeadsFilter
    } = useUIStore();

    // Update local state when store changes
    useEffect(() => {
        setSearchQuery(leadSearchQuery);
        setStatusFilter(leadsFilter);
    }, [leadSearchQuery, leadsFilter]);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteLeads(searchQuery, statusFilter);

    const leads = data?.pages?.flatMap(page => page.leads) ?? [];

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setLeadSearchQuery(value);
    };

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        setLeadsFilter(value);
    };

    const [addOpen, setAddOpen] = useState(false);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        campaignId: '',
        notes: '',
    });
    const [formError, setFormError] = useState<string | null>(null);
    const { mutateAsync: createLead, isPending: isCreating } = useCreateLead();
    const { data: campaignsData } = useCampaigns('', 'all');
    const toast = useToast();

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCampaignChange = (value: string) => {
        setForm({ ...form, campaignId: value });
    };

    const handleAddLead = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!form.firstName || !form.lastName || !form.email || !form.campaignId) {
            setFormError('Please fill all required fields.');
            return;
        }
        // No dummy campaign check needed, allow any text
        try {
            await createLead({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                company: form.company,
                campaignId: form.campaignId,
                description: form.notes,
            });
            setAddOpen(false);
            setForm({ firstName: '', lastName: '', email: '', phone: '', company: '', campaignId: '', notes: '' });
            toast({ title: 'Lead added', description: 'The lead was added successfully.', status: 'success' });
        } catch (err: any) {
            setFormError(err.message || 'Failed to add lead.');
            toast({ title: 'Error', description: err.message || 'Failed to add lead.', status: 'error' });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">All Leads</h2>
                    <p className="text-gray-600">Manage and track your leads across all campaigns</p>
                </div>


                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search leads..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 w-64"
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={handleFilterChange}>
                        <SelectTrigger className="w-40">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="responded">Responded</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="do_not_contact">Do Not Contact</SelectItem>
                        </SelectContent>
                    </Select>
                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default" onClick={() => setAddOpen(true)}>
                                + Add Lead
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Lead</DialogTitle>
                            </DialogHeader>
                            <form className="space-y-4" onSubmit={handleAddLead}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName">First Name *</Label>
                                        <Input id="firstName" name="firstName" value={form.firstName} onChange={handleFormChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName">Last Name *</Label>
                                        <Input id="lastName" name="lastName" value={form.lastName} onChange={handleFormChange} required />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} required />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" name="phone" value={form.phone} onChange={handleFormChange} />
                                </div>
                                <div>
                                    <Label htmlFor="company">Company</Label>
                                    <Input id="company" name="company" value={form.company} onChange={handleFormChange} />
                                </div>
                                <div>
                                    <Label htmlFor="campaignId">Campaign *</Label>
                                    {(!campaignsData || campaignsData.length === 0) ? (
                                        <>
                                            <Select value={form.campaignId} onValueChange={handleCampaignChange} disabled>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="No campaigns available" />
                                                </SelectTrigger>
                                            </Select>
                                            <p className="text-xs text-gray-500 mt-1">Create a campaign first to add leads.</p>
                                        </>
                                    ) : (
                                        <Select value={form.campaignId} onValueChange={handleCampaignChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select campaign" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {campaignsData.map((c: any) => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <textarea id="notes" name="notes" className="w-full border rounded-md p-2" value={form.notes} onChange={handleFormChange} rows={3} />
                                </div>
                                {formError && <div className="text-red-500 text-sm">{formError}</div>}
                                <DialogFooter>
                                    <Button type="submit" disabled={isCreating || !campaignsData || campaignsData.length === 0}>
                                        {isCreating ? 'Adding...' : 'Add Lead'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{leads.length}</div>
                        <div className="text-sm text-gray-600">Total Leads</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                            {leads.filter(l => l.status === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-600">Pending</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                            {leads.filter(l => l.status === 'contacted').length}
                        </div>
                        <div className="text-sm text-gray-600">Contacted</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                            {leads.filter(l => l.status === 'converted').length}
                        </div>
                        <div className="text-sm text-gray-600">Converted</div>
                    </CardContent>
                </Card>
            </div>

            {/* Leads Grid */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="grid gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <LeadSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load leads</h3>
                            <p className="text-gray-600">There was an error loading your leads. Please try again.</p>
                        </CardContent>
                    </Card>
                ) : leads.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
                            <p className="text-gray-600">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'No leads match your current search or filter criteria.'
                                    : 'You don\'t have any leads yet. Start a campaign to generate leads.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-4">
                            {leads.map((lead) => (
                                <LeadCard key={lead.id} lead={lead as LeadCardProps['lead']} />
                            ))}
                        </div>

                        {/* Load More */}
                        {hasNextPage && (
                            <div className="text-center pt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="w-full sm:w-auto"
                                >
                                    {isFetchingNextPage ? 'Loading more...' : 'Load More Leads'}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Lead Detail Sheet */}
            <LeadDetailSheet />
        </div>
    );
}
