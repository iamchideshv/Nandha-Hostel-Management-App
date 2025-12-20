'use client';

import { useEffect, useState } from 'react';
import { BUILD_ID } from '@/lib/build-id';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function UpdateChecker() {
    const [showUpdate, setShowUpdate] = useState(false);

    useEffect(() => {
        const checkVersion = async () => {
            try {
                const res = await fetch('/api/version');
                const data = await res.json();
                if (data.buildId && data.buildId !== BUILD_ID) {
                    setShowUpdate(true);
                }
            } catch (error) {
                console.error('Failed to check version:', error);
            }
        };

        // Check immediately on mount, unlikely to be different unless cached heavily
        // Then poll every 5 minutes (300000ms)
        const interval = setInterval(checkVersion, 300000); // 5 minutes

        // Also check when window gains focus
        window.addEventListener('focus', checkVersion);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', checkVersion);
        };
    }, []);

    const handleReload = () => {
        window.location.reload();
    };

    if (!showUpdate) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-slate-900 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4 max-w-sm">
                <div className="flex-1">
                    <p className="font-semibold text-sm">Update Available</p>
                    <p className="text-xs text-slate-300">A new version of the app is available.</p>
                </div>
                <Button size="sm" onClick={handleReload} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Update
                </Button>
            </div>
        </div>
    );
}
