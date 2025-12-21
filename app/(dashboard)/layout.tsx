'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, UserCircle, Home } from 'lucide-react';
import { UpdateChecker } from '@/components/update-checker';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showHomeConfirm, setShowHomeConfirm] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center p-4 text-slate-500">Loading...</div>;
    }

    if (!user) return null;

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
            {/* Mobile Topbar */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                    <img src="/logo.jpg" alt="Logo" className="h-8 w-8 object-contain rounded" />
                    <h1 className="font-bold text-lg text-blue-900 dark:text-blue-400">Hostel App</h1>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Sidebar / Mobile Menu */}
            <aside className={`
        fixed inset-0 z-20 bg-white dark:bg-slate-900 md:bg-white md:dark:bg-slate-900 border-r dark:border-slate-800 md:static md:w-64 md:border-r 
        flex-col transition-all transform md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center md:block">
                    <div className="flex items-center space-x-2">
                        <img src="/logo.jpg" alt="Logo" className="h-10 w-10 object-contain rounded-md" />
                        <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                        X
                    </Button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {user.role === 'student' && (
                        <>
                            <Link href="/student" className="flex items-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300" onClick={() => setIsMobileMenuOpen(false)}>
                                Dashboard
                            </Link>
                            {/* Add more links if needed */}
                        </>
                    )}
                    {user.role === 'admin' && (
                        <>
                            <Link href="/admin" className="flex items-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300" onClick={() => setIsMobileMenuOpen(false)}>
                                Dashboard
                            </Link>
                        </>
                    )}
                    {user.role === 'authority' && (
                        <>
                            <Link href="/authority" className="flex items-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300" onClick={() => setIsMobileMenuOpen(false)}>
                                Approvals
                            </Link>
                        </>
                    )}
                    {user.role === 'devops' && (
                        <>
                            <Link href="/devops" className="flex items-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300" onClick={() => setIsMobileMenuOpen(false)}>
                                Password Reset Requests
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b dark:border-slate-800">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Theme</span>
                        <ThemeToggle />
                    </div>
                    <Button variant="outline" className="w-full justify-start text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950" onClick={() => setShowHomeConfirm(true)}>
                        <Home className="mr-2 h-4 w-4" />
                        Go to Home
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {children}
            </main>

            {/* Go to Home Confirmation Modal */}
            {showHomeConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowHomeConfirm(false)}>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl max-w-sm w-full space-y-4 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-center">Like to signout?</h3>
                        <div className="flex gap-3">
                            <Button className="flex-1" variant="outline" onClick={() => setShowHomeConfirm(false)}>Cancel</Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" onClick={handleLogout}>Yes</Button>
                        </div>
                    </div>
                </div>
            )}
            <UpdateChecker />
        </div>
    );
}
