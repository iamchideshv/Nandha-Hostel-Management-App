'use client';

import { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';
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

        if (isStandalone) return;

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
            // Show iOS prompt after a short delay
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        window.addEventListener('appinstalled', () => {
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
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[380px] z-[9999]"
                >
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-blue-500/20 dark:border-blue-400/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-4 flex flex-col gap-3 transition-colors duration-300">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                                    <img src="/logo-main.png" alt="App Icon" className="h-6 w-6 object-contain brightness-0 invert" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                        NEI Smart Hostel
                                    </h3>
                                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">
                                        Install Official App
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 rounded-lg"
                                aria-label="Dismiss"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {isIOS ? (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200/50 dark:border-slate-700/50">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center flex-wrap gap-1 leading-relaxed">
                                    Tap <Share className="h-3 w-3 inline mx-0.5 text-blue-500" /> then <span className="font-bold text-slate-900 dark:text-white">"Add to Home Screen"</span> to install on your iPhone.
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                                    Get the best experience with our lightning-fast mobile app.
                                </p>
                                <button
                                    onClick={handleInstallClick}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Install Now</span>
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
