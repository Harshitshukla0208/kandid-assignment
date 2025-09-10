'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useUIStore } from '@/lib/stores';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const { sidebarCollapsed } = useUIStore();

    useEffect(() => {
        if (!isPending && !session) {
            router.push('/auth/login');
        }
    }, [session, isPending, router]);

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            {/* Main Content */}
            <motion.div
                className="flex-1 flex flex-col"
                animate={{
                    marginLeft: sidebarCollapsed ? '80px' : '280px',
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                <Header />

                <main className="flex-1 p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </motion.div>
        </div>
    );
}
