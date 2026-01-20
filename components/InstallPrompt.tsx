'use client';

import { useEffect, useState } from 'react';
import { Download, X, Share, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect if the app is already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        if (isStandalone) {
            console.log('App is in standalone mode, hiding prompt');
            return;
        }

        // Check dismissal from localStorage
        const dismissalTime = localStorage.getItem('pwa-prompt-dismissed');
        if (dismissalTime) {
            const lastDismissed = parseInt(dismissalTime, 10);
            const now = Date.now();
            // Show again after 1 year if dismissed
            if (now - lastDismissed < 365 * 24 * 60 * 60 * 1000) {
                return;
            }
        }

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        if (ios) {
            // Instant appearance for iOS
            setIsVisible(true);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Instant appearance
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        window.addEventListener('appinstalled', () => {
            console.log('App was successfully installed');
            setIsVisible(false);
            setDeferredPrompt(null);
            localStorage.removeItem('pwa-prompt-dismissed');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsVisible(false);
            localStorage.removeItem('pwa-prompt-dismissed');
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        // Store dismissal time to avoid showing it immediately again
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full flex justify-center py-8 px-4"
                >
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-white/10 overflow-hidden group">
                        {/* Background Accent */}
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Zap className="h-16 w-16 text-blue-600" />
                        </div>

                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-white/5 overflow-hidden p-1.5">
                                        <img src="/logo-main.png" alt="App Icon" className="h-full w-full object-contain" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                            NEI Smart Hostel
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                OFFICIAL PWA V2.0
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {isIOS
                                    ? "Install our app for a faster and smoother experience."
                                    : "Get the best experience with our lightning-fast mobile application."}
                            </p>

                            <div className="flex flex-col gap-2">
                                {isIOS ? (
                                    <div className="bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl p-4 border border-blue-100/50 dark:border-blue-500/10">
                                        <p className="text-[11px] font-bold text-blue-600 dark:text-blue-300 flex items-center flex-wrap gap-2 leading-tight">
                                            Tap <Share className="h-4 w-4 text-blue-500" /> then <span className="underline">"Add to Home Screen"</span> to install.
                                        </p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleInstallClick}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-black py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>INSTALL OFFICIAL APP</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleDismiss}
                                    className="w-full py-3 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    Not Now, Maybe Later
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

