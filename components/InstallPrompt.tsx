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
            // Show again after 3 days if dismissed
            if (now - lastDismissed < 3 * 24 * 60 * 60 * 1000) {
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
                    initial={{ y: -50, scale: 0.9, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: -50, scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="fixed top-[10%] left-0 right-0 z-[99999] flex justify-center px-4"
                >
                    <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-white/10 overflow-hidden group">
                        {/* Background Accent */}
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Zap className="h-24 w-24 text-blue-600" />
                        </div>

                        <div className="p-5 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform transition-transform group-hover:scale-110">
                                        <img src="/logo-main.png" alt="App Icon" className="h-7 w-7 object-contain brightness-0 invert" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                                            NEI Smart Hostel
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Official PWA v2.0
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                                    aria-label="Dismiss"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                                {isIOS
                                    ? "Experience the future of hostel management on your device."
                                    : "Get the best experience with our lightning-fast mobile application."}
                            </p>

                            {isIOS ? (
                                <div className="bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl p-4 border border-blue-100/50 dark:border-blue-500/10">
                                    <p className="text-[11px] font-bold text-blue-600 dark:text-blue-300 flex items-center flex-wrap gap-2 leading-tight">
                                        Tap <Share className="h-4 w-4 text-blue-500" /> then <span className="underline decoration-blue-500/30">"Add to Home Screen"</span> to install.
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleInstallClick}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-black py-4 rounded-2xl shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>INSTALL OFFICIAL APP</span>
                                </button>
                            )}
                        </div>

                        <div className="h-1 w-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "0%" }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-blue-600"
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
