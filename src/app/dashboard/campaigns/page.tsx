'use client';

import { useState } from 'react';
import { useCampaigns, useUpdateCampaignStatus } from '@/lib/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Search,
    Plus,
    MoreHorizontal,
    Play,
    Pause,
    Edit,
    Trash2,
    Users,
    Target,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    Clock
} from 'lucide-react';
import { Campaign } from '@/lib/db/schema';

const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
};

const statusIcons = {
    draft: Clock,
    active: CheckCircle,
    paused: Pause,
    completed: CheckCircle,
};

// Update the type for campaigns fetched from the API
// Add a type for the API response

type CampaignWithStats = Campaign & {
    actualTotalLeads?: number;
    respondedLeads?: number;
    convertedLeads?: number;
    contactedLeads?: number;
};

type CampaignRowProps = { campaign: CampaignWithStats };

function CampaignRow({ campaign }: CampaignRowProps) {
    const updateStatusMutation = useUpdateCampaignStatus();
    const StatusIcon = statusIcons[campaign.status as keyof typeof statusIcons];

    const actualTotalLeads = campaign.actualTotalLeads ?? 0;
    const respondedLeads = campaign.respondedLeads ?? 0;
    const convertedLeads = campaign.convertedLeads ?? 0;
    const contactedLeads = campaign.contactedLeads ?? 0;

    const responseRate = actualTotalLeads > 0
        ? Math.round((respondedLeads / actualTotalLeads) * 100)
        : 0;

    const handleStatusChange = async (newStatus: Campaign['status']) => {
        try {
            await updateStatusMutation.mutateAsync({
                id: campaign.id,
                status: newStatus,
            });
        } catch (error) {
            console.error('Failed to update campaign status:', error);
        }
    };

    return (
        <TableRow className="hover:bg-gray-50">
            <TableCell className="font-medium">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">
                            Created {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </TableCell>

            <TableCell>
                <Badge className={statusColors[campaign.status as keyof typeof statusColors]}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {campaign.status}
                </Badge>
            </TableCell>

            <TableCell>
                <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{actualTotalLeads}</span>
                </div>
            </TableCell>

            <TableCell>
                <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-green-700">{convertedLeads}</span>
                </div>
            </TableCell>

            <TableCell>
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                        <span>{responseRate}%</span>
                        <span className="text-gray-500">
                            {respondedLeads}/{actualTotalLeads}
                        </span>
                    </div>
                    <Progress value={responseRate} className="h-2" />
                </div>
            </TableCell>

            <TableCell>
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                        <span>{actualTotalLeads > 0 ? Math.round((contactedLeads / actualTotalLeads) * 100) : 0}%</span>
                        <span className="text-gray-500">
                            {contactedLeads}/{actualTotalLeads}
                        </span>
                    </div>
                    <Progress
                        value={actualTotalLeads > 0 ? (contactedLeads / actualTotalLeads) * 100 : 0}
                        className="h-2"
                    />
                </div>
            </TableCell>

            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Campaign
                        </DropdownMenuItem>
                        {campaign.status === 'active' ? (
                            <DropdownMenuItem onClick={() => handleStatusChange('paused')}>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause Campaign
                            </DropdownMenuItem>
                        ) : campaign.status === 'paused' ? (
                            <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                                <Play className="w-4 h-4 mr-2" />
                                Resume Campaign
                            </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Campaign
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

function TableSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center space-x-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
            </TableCell>
            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
    );
}

export default function CampaignsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const { data: campaigns, isLoading, error } = useCampaigns(searchQuery, statusFilter);

    // Type assertion for campaigns as CampaignWithStats[]
    const campaignList = (campaigns ?? []) as CampaignWithStats[];

    const stats = campaignList.reduce(
        (acc, campaign) => ({
            total: acc.total + 1,
            active: acc.active + (campaign.status === 'active' ? 1 : 0),
            totalLeads: acc.totalLeads + (campaign.actualTotalLeads ?? 0),
            totalConverted: acc.totalConverted + (campaign.convertedLeads ?? 0),
        }),
        { total: 0, active: 0, totalLeads: 0, totalConverted: 0 }
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
                    <p className="text-gray-600">Manage your campaigns and track their performance.</p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search campaigns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64"
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Campaigns</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Campaign
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            <div>
                                <div className="text-2xl font-bold">{stats.total}</div>
                                <div className="text-sm text-gray-600">Total Campaigns</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                                <div className="text-2xl font-bold">{stats.active}</div>
                                <div className="text-sm text-gray-600">Active</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            <div>
                                <div className="text-2xl font-bold">{stats.totalLeads}</div>
                                <div className="text-sm text-gray-600">Total Leads</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-orange-600" />
                            <div>
                                <div className="text-2xl font-bold">{stats.totalConverted}</div>
                                <div className="text-sm text-gray-600">Converted</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Campaigns Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Campaigns</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Campaign Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total Leads</TableHead>
                                <TableHead>Successful Leads</TableHead>
                                <TableHead>Response Rate</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead className="w-[50px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableSkeleton key={i} />
                                ))
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                        <p className="text-gray-600">Failed to load campaigns</p>
                                    </TableCell>
                                </TableRow>
                            ) : campaignList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-600">No campaigns found</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                campaignList.map((campaign) => (
                                    <CampaignRow key={campaign.id} campaign={campaign} />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
