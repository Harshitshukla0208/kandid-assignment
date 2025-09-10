'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Search, ChevronRight, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

const getPageTitle = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    const page = segments[segments.length - 1];

    switch (page) {
        case 'dashboard':
            return 'Dashboard';
        case 'leads':
            return 'Leads';
        case 'campaigns':
            return 'Campaigns';
        case 'messages':
            return 'Messages';
        case 'linkedin-accounts':
            return 'LinkedIn Accounts';
        case 'settings':
            return 'Settings';
        default:
            return 'Dashboard';
    }
};

const getBreadcrumbs = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const href = '/' + segments.slice(0, i + 1).join('/');

        let name = segment;
        if (segment === 'dashboard') name = 'Dashboard';
        else if (segment === 'leads') name = 'Leads';
        else if (segment === 'campaigns') name = 'Campaigns';
        else if (segment === 'messages') name = 'Messages';
        else if (segment === 'linkedin-accounts') name = 'LinkedIn Accounts';
        else if (segment === 'settings') name = 'Settings';

        breadcrumbs.push({ name, href });
    }

    return breadcrumbs;
};

export function Header() {
    const pathname = usePathname();
    const pageTitle = getPageTitle(pathname);
    const breadcrumbs = getBreadcrumbs(pathname);
    const [isMobile, setIsMobile] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 sm:py-4"
        >
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    {/* Mobile: Just show page title */}
                    {isMobile ? (
                        <div className="ml-12"> {/* Space for mobile menu button */}
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{pageTitle}</h1>
                        </div>
                    ) : (
                        <>
                            {/* Desktop: Show breadcrumbs and title */}
                            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                                {breadcrumbs.map((item, index) => (
                                    <div key={item.href} className="flex items-center">
                                        {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
                                        <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                                            {item.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{pageTitle}</h1>
                        </>
                    )}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                    {/* Mobile Search Toggle */}
                    {isMobile ? (
                        <>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setShowSearch(!showSearch)}
                                className="sm:hidden"
                            >
                                <Search className="w-4 h-4" />
                            </Button>
                            
                            {/* Mobile Search Input */}
                            {showSearch && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute top-16 left-4 right-4 bg-white border rounded-lg shadow-lg p-3 z-30 sm:hidden"
                                >
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            placeholder="Search..."
                                            className="pl-10 w-full"
                                            autoFocus
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </>
                    ) : (
                        /* Desktop Search */
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search..."
                                className="pl-10 w-48 md:w-64"
                            />
                        </div>
                    )}

                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 text-xs p-0 flex items-center justify-center"
                        >
                            3
                        </Badge>
                    </Button>
                </div>
            </div>

            {/* Mobile Search Overlay */}
            {showSearch && isMobile && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 sm:hidden"
                    onClick={() => setShowSearch(false)}
                />
            )}
        </motion.header>
    );
}