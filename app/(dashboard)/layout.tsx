'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
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
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showHomeConfirm, setShowHomeConfirm] = useState(false);
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);


    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        const protectedRoutes = ['/student', '/admin', '/send-off'];
        const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));

        if (isProtectedRoute) {
            // Push state to prevent immediate back navigation
            window.history.pushState({ isDashboardRoot: true }, '', window.location.href);

            const handlePopState = (event: PopStateEvent) => {
                // If we are returning to the dashboard root (e.g., from a detail view like #mess), 
                // allow the navigation and don't show the confirmation.
                if (event.state?.isDashboardRoot) {
                    return;
                }

                // If undefined state or other state (trying to leave the dashboard context),
                // Prevent back navigation and show confirmation
                window.history.pushState({ isDashboardRoot: true }, '', window.location.href);
                setShowHomeConfirm(true);
            };

            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [pathname]);

    // if (isLoading) {
    //     return <div className="flex h-screen items-center justify-center p-4 text-slate-500">Loading...</div>;
    // }

    if (!user) return null;

    const handleSignOut = () => {
        logout();
        window.location.href = '/login';
    };

    const handleGoHome = () => {
        window.location.href = '/';
    };


    return (
        <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-300 font-montserrat relative overflow-hidden">
            <div className="dynamic-bg" />

            {/* Mobile Topbar */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white/50 dark:bg-black/50 backdrop-blur-md border-b dark:border-slate-800 sticky top-0 z-10 shrink-0">
                <div className="flex items-center space-x-2">
                    <img src="/logo-main.png" alt="Logo" className="h-8 w-8 object-contain rounded" />
                    <h1 className="font-bold text-lg text-blue-900 dark:text-blue-400">NEI Smart Hostel</h1>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {/* Hide hamburger for admin/student as they have page-specific navigation */}
                    {user.role !== 'admin' && user.role !== 'student' && (
                        <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Sidebar / Mobile Menu */}
            <aside className={`
        fixed inset-0 z-20 bg-white/80 dark:bg-black/80 md:bg-white/40 md:dark:bg-black/40 backdrop-blur-xl border-r dark:border-slate-800 md:static md:w-64 md:border-r 
        flex-col transition-all transform md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center md:block">
                    <div className="flex items-center space-x-2">
                        <img src="/logo-main.png" alt="Logo" className="h-10 w-10 object-contain rounded-md" />
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white font-cinzel tracking-tight">{user.name}</p>
                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{user.role}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                        X
                    </Button>
                </div>

                <nav className="flex-1 p-4 space-y-2 relative z-10">
                    {user.role === 'student' && (
                        <>
                            <Link href="/student" className="flex items-center p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                Dashboard
                            </Link>
                            {/* Add more links if needed */}
                        </>
                    )}
                    {user.role === 'admin' && (
                        <>
                            <Link href="/admin" className="flex items-center p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                Dashboard
                            </Link>
                        </>
                    )}
                    {user.role === 'authority' && (
                        <>
                            <Link href="/authority" className="flex items-center p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                Approvals
                            </Link>
                        </>
                    )}
                    {user.role === 'devops' && (
                        <>
                            <Link href="/devops" className="flex items-center p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                Password Reset Requests
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t dark:border-slate-800 space-y-2 relative z-10">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b dark:border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Theme</span>
                        <ThemeToggle />
                    </div>
                    <Button variant="outline" className="w-full justify-start text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-bold" onClick={() => setShowHomeConfirm(true)}>
                        <Home className="mr-2 h-4 w-4" />
                        Go to Home
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold" onClick={() => setShowSignOutConfirm(true)}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto relative z-10">
                <Suspense fallback={<div className="flex h-full items-center justify-center p-4 text-slate-500">Loading Dashboard...</div>}>
                    {children}
                </Suspense>
            </main>

            {/* Go to Home Confirmation Modal */}
            {showHomeConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowHomeConfirm(false)}>
                    <div className="bg-white dark:bg-black p-6 rounded-xl max-w-sm w-full space-y-4 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-center italic">Go home yes or no?</h3>
                        <div className="flex gap-3">
                            <Button className="flex-1" variant="outline" onClick={() => setShowHomeConfirm(false)}>No</Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-bold" onClick={handleGoHome}>Yes</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sign Out Confirmation Modal */}
            {showSignOutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowSignOutConfirm(false)}>
                    <div className="bg-white dark:bg-black p-6 rounded-xl max-w-sm w-full space-y-4 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-center italic">Sign out yes or no?</h3>
                        <div className="flex gap-3">
                            <Button className="flex-1" variant="outline" onClick={() => setShowSignOutConfirm(false)}>No</Button>
                            <Button className="flex-1 bg-red-600 hover:bg-red-700 font-bold" onClick={handleSignOut}>Yes</Button>
                        </div>
                    </div>
                </div>
            )}

            <UpdateChecker />
        </div>
    );
}
