'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Users,
    Target,
    TrendingUp,
    Mail,
    CheckCircle,
    Clock,
    MoreHorizontal,
    Eye,
    MessageSquare,
    UserCheck
} from 'lucide-react';
import { useDashboardStats } from '@/lib/hooks/api';

const statCards = [
    {
        title: 'Total Campaigns',
        value: '6',
        icon: Target,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
    },
    {
        title: 'Total Leads',
        value: '120',
        icon: Users,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
    },
    {
        title: 'Response Rate',
        value: '24%',
        icon: TrendingUp,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
    },
    {
        title: 'Messages Sent',
        value: '1,240',
        icon: Mail,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
    },
];

const campaigns = [
    { name: 'Just Herbs', status: 'Active', leads: 20, progress: 65 },
    { name: 'Juicy chemistry', status: 'Active', leads: 11, progress: 45 },
    { name: 'Hyugalife 2', status: 'Active', leads: 19, progress: 80 },
    { name: 'Honeyveda', status: 'Active', leads: 3, progress: 25 },
    { name: 'HempStreet', status: 'Active', leads: 7, progress: 55 },
    { name: 'HealthyHey 2', status: 'Active', leads: 5, progress: 35 },
];

const recentActivity = [
    {
        name: 'Om Satyarthy',
        title: 'Regional Head',
        campaign: 'Gynoveda',
        status: 'Pending Approval',
        avatar: 'OS'
    },
    {
        name: 'Dr. Bhuvaneshwari',
        title: 'Fertility & Women\'s Health',
        campaign: 'Gynoveda',
        status: 'Sent 7 mins ago',
        avatar: 'DB'
    },
    {
        name: 'Surdeep Singh',
        title: 'Building Product-led SEO Growth',
        campaign: 'Gynoveda',
        status: 'Sent 7 mins ago',
        avatar: 'SS'
    },
    {
        name: 'Dilbag Singh',
        title: 'Manager Marketing & Communication',
        campaign: 'Gynoveda',
        status: 'Sent 7 mins ago',
        avatar: 'DS'
    },
    {
        name: 'Vanshy Jain',
        title: 'Ayurveda|primary infertility',
        campaign: 'Gynoveda',
        status: 'Sent 7 mins ago',
        avatar: 'VJ'
    },
    {
        name: 'Sunil Pal',
        title: 'Helping Fashion & Lifestyle Brands',
        campaign: 'Digi Sidekick',
        status: 'Pending Approval',
        avatar: 'SP'
    },
    {
        name: 'Utkarsh K.',
        title: 'Airbnb Host | Ex-The Skin Story',
        campaign: 'The skin story',
        status: 'Do Not Contact',
        avatar: 'UK'
    },
    {
        name: 'Shreya Ramakrishna',
        title: 'Deputy Manager - Founder\'s Office',
        campaign: 'Pokonut',
        status: 'Followup 10 mins ago',
        avatar: 'SR'
    },
];

const linkedInAccounts = [
    { name: 'Pulkit Garg', email: '1@gpulkitgarg@gmail.com', requests: '17/30', connected: true, progress: 57 },
    { name: 'Jivesh Lakhani', email: 'jivesh@gmail.com', requests: '19/30', connected: true, progress: 63 },
    { name: 'Indrajit Sahani', email: 'indrajit38mg@gmail.com', requests: '18/30', connected: true, progress: 60 },
    { name: 'Bhavya Arora', email: 'bhavyaaron199.ba@gmail.com', requests: '18/100', connected: true, progress: 18 },
];

export default function DashboardPage() {
    const { data: stats, isLoading } = useDashboardStats();

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Campaigns */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Campaigns</CardTitle>
                                <CardDescription>Manage your campaigns and track their performance.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                All Campaigns
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {campaigns.map((campaign) => (
                                    <div key={campaign.name} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">{campaign.name}</span>
                                                <Badge variant="secondary" className="text-green-700 bg-green-100">
                                                    {campaign.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <span>{campaign.leads} leads</span>
                                                <span>{campaign.progress}%</span>
                                            </div>
                                            <Progress value={campaign.progress} className="mt-2 h-2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Latest lead interactions and updates.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                Most Recent
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                                {activity.avatar}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                {activity.name}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {activity.title}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-600">{activity.campaign}</div>
                                            <Badge
                                                variant={activity.status.includes('Pending') ? 'secondary' :
                                                    activity.status.includes('Do Not') ? 'destructive' : 'default'}
                                                className="text-xs mt-1"
                                            >
                                                {activity.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* LinkedIn Accounts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>LinkedIn Accounts</CardTitle>
                        <CardDescription>Manage your connected LinkedIn accounts and their performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {linkedInAccounts.map((account) => (
                                <div key={account.name} className="border rounded-lg p-4">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <Avatar>
                                            <AvatarFallback className="bg-blue-100 text-blue-700">
                                                {account.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-medium">{account.name}</div>
                                            <div className="text-sm text-gray-600">{account.email}</div>
                                        </div>
                                        <Badge variant="secondary" className="text-green-700 bg-green-100">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Connected
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                        <span>Requests: {account.requests}</span>
                                        <span>{account.progress}%</span>
                                    </div>
                                    <Progress value={account.progress} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
