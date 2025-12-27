'use client';

import { useEffect, useState } from 'react';
import { X, RefreshCw, Smartphone } from 'lucide-react';

const APP_VERSION = '1.1.0'; // Increment this when you make changes
const STORAGE_KEY = 'nei-hostel-app-version';

export default function AppUpdateNotification() {
    const [isOpen, setIsOpen] = useState(false);
    const [platform, setPlatform] = useState<'android' | 'ios' | 'unknown'>('unknown');

    useEffect(() => {
        // Detect if running as PWA
        const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://');

        if (!isPWA) return;

        // Detect platform
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('android')) {
            setPlatform('android');
        } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
            setPlatform('ios');
        }

        // Check stored version
        const storedVersion = localStorage.getItem(STORAGE_KEY);

        if (storedVersion !== APP_VERSION) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, APP_VERSION);
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <RefreshCw size={24} />
                            </div>
                            <h2 className="text-xl font-bold">App Name Updated!</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-white/80 hover:text-white transition-colors"
                            aria-label="Close notification"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <p className="text-white/90 text-sm">
                        We've renamed our app to <strong>"NEI Smart Hostel"</strong>
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Smartphone size={18} />
                            Update your home screen icon:
                        </h3>
                    </div>

                    {platform === 'android' && (
                        <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-4">
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-semibold text-xs">1</span>
                                <span>Long-press the app icon on your home screen</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-semibold text-xs">2</span>
                                <span>Tap <strong>"Remove"</strong> or drag to <strong>"Uninstall"</strong></span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-semibold text-xs">3</span>
                                <span>Open Chrome and visit this website again</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-semibold text-xs">4</span>
                                <span>Tap <strong>"Install"</strong> when prompted, or use menu → <strong>"Install app"</strong></span>
                            </li>
                        </ol>
                    )}

                    {platform === 'ios' && (
                        <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-4">
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-semibold text-xs">1</span>
                                <span>Long-press the app icon on your home screen</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-semibold text-xs">2</span>
                                <span>Tap <strong>"Remove App"</strong> → <strong>"Delete"</strong></span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-semibold text-xs">3</span>
                                <span>Open Safari and visit this website again</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-semibold text-xs">4</span>
                                <span>Tap the <strong>Share button</strong> → <strong>"Add to Home Screen"</strong></span>
                            </li>
                        </ol>
                    )}

                    {platform === 'unknown' && (
                        <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-4">
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-semibold text-xs">1</span>
                                <span>Remove the current app from your home screen</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-semibold text-xs">2</span>
                                <span>Reinstall it from your browser</span>
                            </li>
                        </ol>
                    )}

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                            💡 <strong>Note:</strong> This is a one-time process. Your data and settings will remain intact after reinstalling.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0">
                    <button
                        onClick={handleClose}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
                    >
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
}
