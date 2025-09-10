'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/stores';
import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Target,
    MessageSquare,
    Linkedin,
    Settings,
    Activity,
    UserCircle,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigationItems = [
    {
        title: 'Overview',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Leads', href: '/dashboard/leads', icon: Users },
            { name: 'Campaign', href: '/dashboard/campaigns', icon: Target },
            { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare, badge: '0+' },
        ],
    },
    {
        title: 'Settings',
        items: [
            { name: 'Setting & Billing', href: '/dashboard/settings', icon: Settings },
        ],
    },
];

export function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const { sidebarCollapsed, toggleSidebar, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Check if component is mounted (hydration fix)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle screen size detection
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        if (isMobile && mobileMenuOpen) {
            closeMobileMenu();
        }
    }, [pathname, isMobile]);

    // Close mobile menu when resizing to desktop
    useEffect(() => {
        if (!isMobile && mobileMenuOpen) {
            closeMobileMenu();
        }
    }, [isMobile, mobileMenuOpen, closeMobileMenu]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (!isMobile) return;
        const original = document.body.style.overflow;
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = original || '';
        }
        return () => {
            document.body.style.overflow = original || '';
        };
    }, [isMobile, mobileMenuOpen]);

    // Close on Escape when mobile menu is open
    useEffect(() => {
        if (!isMobile || !mobileMenuOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeMobileMenu();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isMobile, mobileMenuOpen, closeMobileMenu]);

    // Handle mobile menu backdrop click
    const handleBackdropClick = () => {
        if (isMobile && mobileMenuOpen) {
            toggleMobileMenu();
        }
    };

    const handleSignOut = async () => {
        await signOut();
    };

    // Don't render until mounted to prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    return (
        <>
            {/* Mobile Menu Button - Only visible on mobile */}
            {isMobile && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMobileMenu}
                    className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md"
                >
                    {mobileMenuOpen ? (
                        <X className="w-5 h-5" />
                    ) : (
                        <Menu className="w-5 h-5" />
                    )}
                </Button>
            )}

            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isMobile && mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={handleBackdropClick}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                className={`
                    fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm z-40
                    ${isMobile ? 'md:relative' : ''}
                `}
                animate={{
                    width: isMobile ? '280px' : (sidebarCollapsed ? '80px' : '280px'),
                    x: isMobile ? (mobileMenuOpen ? 0 : -280) : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <AnimatePresence mode="wait">
                        {(!sidebarCollapsed || isMobile) && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center"
                            >
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <div className="text-white font-bold text-lg">LinkBird</div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Desktop toggle button - Hidden on mobile */}
                    {!isMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="shrink-0"
                        >
                            {sidebarCollapsed ? (
                                <ChevronRight className="w-4 h-4" />
                            ) : (
                                <ChevronLeft className="w-4 h-4" />
                            )}
                        </Button>
                    )}

                    {/* Mobile close button */}
                    {isMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMobileMenu}
                            className="shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* User Profile */}
                <div className="p-4 border-b border-gray-200">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={`w-full ${(sidebarCollapsed && !isMobile) ? 'px-2' : 'justify-start px-3'} h-auto py-2`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <span className="text-blue-600 font-semibold text-sm">
                                                {(session?.user.name?.[0] || 'K')}
                                            </span>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>
                                    <AnimatePresence>
                                        {(!sidebarCollapsed || isMobile) && (
                                            <motion.div
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className="text-left overflow-hidden"
                                            >
                                                <div className="font-medium text-sm text-gray-900">
                                                    {session?.user.name || 'Kandid'}
                                                </div>
                                                <div className="text-xs text-gray-500">Personal</div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4">
                    {navigationItems.map((section) => (
                        <div key={section.title} className="mb-6">
                            <AnimatePresence>
                                {(!sidebarCollapsed || isMobile) && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="px-4 mb-2"
                                    >
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            {section.title}
                                        </h3>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <nav className="space-y-1 px-2">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;

                                    return (
                                        <Link key={item.name} href={item.href}>
                                            <motion.div
                                                whileHover={{ x: 2 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`
                                                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                                    ${isActive
                                                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                    }
                                                `}
                                            >
                                                <item.icon
                                                    className={`
                                                        w-5 h-5 shrink-0
                                                        ${isActive ? 'text-blue-700' : 'text-gray-500'}
                                                    `}
                                                />

                                                <AnimatePresence>
                                                    {(!sidebarCollapsed || isMobile) && (
                                                        <motion.span
                                                            initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                                                            animate={{ opacity: 1, width: 'auto', marginLeft: 12 }}
                                                            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                                                            className="truncate"
                                                        >
                                                            {item.name}
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>

                                                {item.badge && (!sidebarCollapsed || isMobile) && (
                                                    <motion.span
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full"
                                                    >
                                                        {item.badge}
                                                    </motion.span>
                                                )}
                                            </motion.div>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>
            </motion.div>
        </>
    );
}