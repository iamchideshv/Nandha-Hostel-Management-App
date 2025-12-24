
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-xl max-w-sm w-full space-y-4 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="text-center space-y-2">
                    <div className="flex justify-center mx-auto mb-2">
                        <img src="/logo-main.png" alt="Logo" className="h-16 w-16 object-contain rounded-full shadow-sm" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">About This App</h3>
                    <p className="text-sm text-slate-500">Hostel Management System</p>
                </div>
                <div className="text-sm text-slate-600 space-y-2 text-center">
                    <p>Version 1.0.0</p>
                    <p className="font-semibold text-slate-900">Developer: CHIDESH V</p>
                    <p className="text-xs text-slate-500">732224AI014 • DEPT. AI & DS</p>
                    <p className="font-medium text-slate-800 mt-2">FOR NANDHA ENGINEERING COLLEGE</p>
                    <p className="text-xs text-slate-400 mt-4">© 2024 All Rights Reserved</p>
                </div>
                <div className="space-y-3 pt-2">
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl transition-all active:scale-95"
                        onClick={onClose}
                    >
                        Close
                    </Button>

                    <a
                        className="uiverse-fancy-button"
                        href="mailto:chideshv@gmail.com?subject=Hostel%20App%20Feedback"
                    >
                        <span className="top-key"></span>
                        <span className="text">Give Feedback</span>
                        <span className="bottom-key-1"></span>
                        <span className="bottom-key-2"></span>
                    </a>
                </div>
            </div>
        </div>
    );
}
