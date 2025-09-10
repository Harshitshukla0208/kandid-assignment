'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/stores';
import { useLead, useUpdateLeadStatus, useUpdateLead, useDeleteLead, useCampaigns } from '@/lib/hooks/api';
import { useToast } from '@/lib/hooks/toast';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    X,
    Mail,
    Building,
    Calendar,
    MessageSquare,
    ExternalLink,
    CheckCircle,
    Clock,
    Ban,
    Trash2,
    UserCheck,
    Send,
    MessageCircle
} from 'lucide-react';
import { Lead } from '@/lib/db/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Define proper types
interface Interaction {
    id: string;
    type: 'invitation_request' | 'connection_status' | 'connection_acceptance' | 'followup';
    message?: string;
    status: string;
    createdAt: string;
}

interface Campaign {
    id: string;
    name: string;
}

interface LeadData extends Lead {
    interactions?: Interaction[];
}

interface EditForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    campaignId: string;
    notes: string;
}

const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-orange-100 text-orange-800' },
    { value: 'contacted', label: 'Contacted', icon: Mail, color: 'bg-blue-100 text-blue-800' },
    { value: 'responded', label: 'Responded', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'converted', label: 'Converted', icon: CheckCircle, color: 'bg-purple-100 text-purple-800' },
    { value: 'do_not_contact', label: 'Do Not Contact', icon: Ban, color: 'bg-red-100 text-red-800' },
] as const;

const interactionTypes = {
    invitation_request: { label: 'Invitation Request', icon: UserCheck, color: 'bg-blue-100' },
    connection_status: { label: 'Connection Status', icon: MessageCircle, color: 'bg-gray-100' },
    connection_acceptance: { label: 'Connection Acceptance Message', icon: CheckCircle, color: 'bg-green-100' },
    followup: { label: 'Follow-up', icon: Send, color: 'bg-purple-100' },
} as const;

function InteractionTimeline({ interactions }: { interactions: Interaction[] }) {
    return (
        <div className="space-y-4">
            {interactions.map((interaction, index) => {
                const type = interactionTypes[interaction.type];
                const Icon = type?.icon || MessageSquare;

                return (
                    <motion.div
                        key={interaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex space-x-3"
                    >
                        <div className={`p-2 rounded-full ${type?.color || 'bg-gray-100'} shrink-0`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium text-gray-900">
                                    {type?.label || 'Activity'}
                                </h4>
                                <Badge
                                    variant={interaction.status === 'pending' ? 'secondary' : 'default'}
                                    className="text-xs"
                                >
                                    {interaction.status}
                                </Badge>
                            </div>
                            {interaction.message && (
                                <p className="text-sm text-gray-600 mb-2">
                                    {interaction.message.length > 150
                                        ? `${interaction.message.substring(0, 150)}...`
                                        : interaction.message
                                    }
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                                {new Date(interaction.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

export function LeadDetailSheet() {
    const {
        selectedLead,
        isLeadSheetOpen,
        closeLeadSheet,
        setSelectedLead
    } = useUIStore();

    const { data: leadData, isLoading } = useLead(selectedLead?.id || '');
    const updateStatusMutation = useUpdateLeadStatus();
    const { mutateAsync: updateLead, isPending: isUpdating } = useUpdateLead();
    const { mutateAsync: deleteLead, isPending: isDeleting } = useDeleteLead();
    const { data: campaignsData } = useCampaigns('', 'all');
    const toast = useToast();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editForm, setEditForm] = useState<EditForm | null>(null);
    const [editError, setEditError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isLeadSheetOpen) {
                closeLeadSheet();
            }
        };

        if (isLeadSheetOpen) {
            document.addEventListener('keydown', handleEsc);
            return () => document.removeEventListener('keydown', handleEsc);
        }
    }, [isLeadSheetOpen, closeLeadSheet]);

    const handleStatusUpdate = async (newStatus: Lead['status']) => {
        if (!selectedLead) return;

        try {
            await updateStatusMutation.mutateAsync({
                id: selectedLead.id,
                status: newStatus,
            });

            // Update the selected lead with new status
            setSelectedLead({ ...selectedLead, status: newStatus });
        } catch (error) {
            console.error('Failed to update lead status:', error);
        }
    };

    const currentStatus = statusOptions.find(s => s.value === selectedLead?.status);
    const StatusIcon = currentStatus?.icon || Clock;

    const openEdit = () => {
        if (!leadData) return;
        
        setEditForm({
            firstName: leadData.firstName,
            lastName: leadData.lastName,
            email: leadData.email,
            phone: '',
            company: leadData.company || '',
            campaignId: leadData.campaignId,
            notes: leadData.description || '',
        });
        setEditOpen(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editForm) return;
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditCampaignChange = (value: string) => {
        if (!editForm) return;
        setEditForm({ ...editForm, campaignId: value });
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditError(null);
        
        if (!editForm || !leadData) return;
        
        if (!editForm.firstName || !editForm.lastName || !editForm.email || !editForm.campaignId) {
            setEditError('Please fill all required fields.');
            return;
        }
        
        try {
            await updateLead({
                id: leadData.id,
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
                company: editForm.company,
                campaignId: editForm.campaignId,
                description: editForm.notes,
            });
            setEditOpen(false);
            toast({ title: 'Lead updated', description: 'The lead was updated successfully.', status: 'success' });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update lead.';
            setEditError(errorMessage);
            toast({ title: 'Error', description: errorMessage, status: 'error' });
        }
    };

    const handleDelete = async () => {
        if (!leadData) return;
        
        setDeleteError(null);
        try {
            await deleteLead(leadData.id);
            setDeleteOpen(false);
            closeLeadSheet();
            toast({ title: 'Lead deleted', description: 'The lead was deleted successfully.', status: 'success' });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete lead.';
            setDeleteError(errorMessage);
            toast({ title: 'Error', description: errorMessage, status: 'error' });
        }
    };

    // Early return if no data
    if (!leadData && !isLoading) {
        return null;
    }

    return (
        <Sheet open={isLeadSheetOpen} onOpenChange={closeLeadSheet}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center space-x-4">
                                <Skeleton className="w-16 h-16 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </motion.div>
                    ) : leadData ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Header */}
                            <SheetHeader>
                                <div className="flex items-center justify-between">
                                    <SheetTitle className="text-xl font-bold">Lead Profile</SheetTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={closeLeadSheet}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </SheetHeader>

                            {/* Lead Info */}
                            <div className="space-y-4">
                                <div className="flex items-start space-x-4">
                                    <Avatar className="w-16 h-16">
                                        <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                                            {leadData.firstName[0]}{leadData.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {leadData.firstName} {leadData.lastName}
                                            </h2>
                                            {leadData.jobTitle && (
                                                <p className="text-gray-600">{leadData.jobTitle}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <StatusIcon className="w-4 h-4" />
                                            <Badge className={currentStatus?.color}>
                                                {currentStatus?.label}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button variant="outline" size="sm" onClick={openEdit}>
                                            Edit
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-red-500 hover:text-red-700" 
                                            onClick={() => setDeleteOpen(true)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Contact Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-900">{leadData.email}</span>
                                            <Button variant="ghost" size="icon" className="w-8 h-8">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        {leadData.company && (
                                            <div className="flex items-center space-x-3">
                                                <Building className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-900">{leadData.company}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-3">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-600">
                                                Added {new Date(leadData.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Status Update */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Update Status</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Select
                                            value={leadData.status}
                                            onValueChange={handleStatusUpdate}
                                            disabled={updateStatusMutation.isPending}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((status) => {
                                                    const StatusOptionIcon = status.icon;
                                                    return (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            <div className="flex items-center space-x-2">
                                                                <StatusOptionIcon className="w-4 h-4" />
                                                                <span>{status.label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </CardContent>
                                </Card>

                                {/* Activity Timeline */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Activity Timeline</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {leadData.interactions && leadData.interactions.length > 0 ? (
                                            <InteractionTimeline interactions={leadData.interactions.map(interaction => ({
                                                ...interaction,
                                                message: interaction.message === null ? undefined : interaction.message,
                                                createdAt: typeof interaction.createdAt === 'string'
                                                    ? interaction.createdAt
                                                    : interaction.createdAt.toISOString()
                                            }))} />
                                        ) : (
                                            <div className="text-center py-6 text-gray-500">
                                                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                                <p>No activity yet</p>
                                                <p className="text-sm">Interactions will appear here</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                <div className="flex space-x-2 pt-4 border-t">
                                    <Button className="flex-1">
                                        <Send className="w-4 h-4 mr-2" />
                                        Send Message
                                    </Button>
                                    <Button variant="outline" className="flex-1">
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        Connect
                                    </Button>
                                </div>
                            </div>

                            {/* Edit Lead Dialog */}
                            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Lead</DialogTitle>
                                    </DialogHeader>
                                    <form className="space-y-4" onSubmit={handleEditSubmit}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="editFirstName">First Name *</Label>
                                                <Input 
                                                    id="editFirstName" 
                                                    name="firstName" 
                                                    value={editForm?.firstName || ''} 
                                                    onChange={handleEditChange} 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="editLastName">Last Name *</Label>
                                                <Input 
                                                    id="editLastName" 
                                                    name="lastName" 
                                                    value={editForm?.lastName || ''} 
                                                    onChange={handleEditChange} 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="editEmail">Email *</Label>
                                            <Input 
                                                id="editEmail" 
                                                name="email" 
                                                type="email" 
                                                value={editForm?.email || ''} 
                                                onChange={handleEditChange} 
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="editPhone">Phone</Label>
                                            <Input 
                                                id="editPhone" 
                                                name="phone" 
                                                value={editForm?.phone || ''} 
                                                onChange={handleEditChange} 
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="editCompany">Company</Label>
                                            <Input 
                                                id="editCompany" 
                                                name="company" 
                                                value={editForm?.company || ''} 
                                                onChange={handleEditChange} 
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="editCampaignId">Campaign *</Label>
                                            <Select 
                                                value={editForm?.campaignId || ''} 
                                                onValueChange={handleEditCampaignChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select campaign" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {campaignsData?.map((c: Campaign) => (
                                                        <SelectItem key={c.id} value={c.id}>
                                                            {c.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="editNotes">Notes</Label>
                                            <textarea 
                                                id="editNotes" 
                                                name="notes" 
                                                className="w-full border rounded-md p-2" 
                                                value={editForm?.notes || ''} 
                                                onChange={handleEditChange} 
                                                rows={3} 
                                            />
                                        </div>
                                        {editError && <div className="text-red-500 text-sm">{editError}</div>}
                                        <DialogFooter>
                                            <Button type="submit" disabled={isUpdating}>
                                                {isUpdating ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>

                            {/* Delete Lead Dialog */}
                            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Lead</DialogTitle>
                                    </DialogHeader>
                                    <div>Are you sure you want to delete this lead? This action cannot be undone.</div>
                                    {deleteError && <div className="text-red-500 text-sm">{deleteError}</div>}
                                    <DialogFooter>
                                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                        </Button>
                                        <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
                                            Cancel
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </SheetContent>
        </Sheet>
    );
}