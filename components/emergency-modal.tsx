'use client';

import { Button } from '@/components/ui/button';
import { Phone, AlertTriangle, Siren, Car, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface EmergencyModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export function EmergencyModal({ isOpen, onClose, user }: EmergencyModalProps) {
    const [alerting, setAlerting] = useState(false);

    if (!isOpen) return null;

    const handleAlertWarden = async () => {
        setAlerting(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `EMERGENCY ALERT: Student ${user?.name} (Room ${user?.roomNumber}) from ${user?.hostelName} is reporting a medical emergency!`,
                    type: 'urgent',
                    senderId: user?.id,
                    senderName: user?.name,
                    senderRole: 'student',
                    hostelName: user?.hostelName,
                    targetHostels: [user?.hostelName] // Target their own hostel warden
                })
            });

            if (res.ok) {
                toast.success('Warden alerted successfully!');
                onClose();
            } else {
                toast.error('Failed to alert warden');
            }
        } catch (error) {
            toast.error('Error sending alert');
        } finally {
            setAlerting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-slate-950 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-red-500/20 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-red-600 p-4 text-white text-center flex items-center justify-center gap-2">
                    <Siren className="w-6 h-6 animate-pulse" />
                    <h2 className="text-xl font-black uppercase tracking-wider italic">Emergency Help</h2>
                </div>

                <div className="p-6 space-y-6">
                    {/* Warden Contacts */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold border-b pb-1">
                            <ShieldAlert className="w-5 h-5" />
                            <span>Call Warden Immediately</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                    FOR BOYS HOSTEL
                                </h4>
                                <div className="space-y-2">
                                    {['8015316807', '8715432961'].map((num, i) => (
                                        <div key={num} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 pl-3 rounded-lg shadow-sm border border-blue-50 dark:border-slate-800">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Warden {i + 1} - {num}</span>
                                            <a href={`tel:${num}`} className="bg-blue-600 text-white p-2 rounded-full hover:scale-110 transition-transform shadow-md shadow-blue-200 dark:shadow-none">
                                                <Phone className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/50">
                                <h4 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                                    FOR GIRLS HOSTEL
                                </h4>
                                <div className="space-y-2">
                                    {['7654891023', '8596453211'].map((num, i) => (
                                        <div key={num} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 pl-3 rounded-lg shadow-sm border border-rose-50 dark:border-slate-800">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Warden {i + 1} - {num}</span>
                                            <a href={`tel:${num}`} className="bg-rose-600 text-white p-2 rounded-full hover:scale-110 transition-transform shadow-md shadow-rose-200 dark:shadow-none">
                                                <Phone className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nandha Emergency Vehicle */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-600">
                                <Car className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Emergency Vehicle</h4>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Nandha - 9967549076</p>
                            </div>
                        </div>
                        <a href="tel:9967549076" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2.5 rounded-full hover:scale-110 transition-transform shadow-lg">
                            <Phone className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Serious Case */}
                    <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-sm border border-amber-100 dark:border-slate-800 text-amber-600">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">Government Help</span>
                                <span className="text-sm font-black text-amber-900 dark:text-amber-100">Call 108 Immediately</span>
                            </div>
                        </div>
                        <a href="tel:108" className="bg-amber-600 text-white p-2.5 rounded-full hover:scale-110 transition-transform shadow-lg shadow-amber-200 dark:shadow-none">
                            <Phone className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Alert Warden Button */}
                    <div className="pt-2">
                        <Button
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-8 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-red-500/30 transition-all active:scale-95 border-b-4 border-red-800"
                            onClick={handleAlertWarden}
                            disabled={alerting}
                        >
                            {alerting ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <span className="text-xl">ALERT WARDEN</span>
                                    <span className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Immediate Notification</span>
                                </>
                            )}
                        </Button>
                    </div>

                    <Button variant="ghost" className="w-full text-slate-400 hover:text-slate-600 text-xs" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
