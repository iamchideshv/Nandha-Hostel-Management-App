'use client';

import { Mail, Phone, Instagram, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={onClose}>
            <div className="relative animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 z-20 p-2 text-white/50 hover:text-white transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="uiverse-flip-card">
                    <div className="flip-card-inner">
                        {/* FRONT */}
                        <div className="flip-card-front">
                            <p className="heading_8264">HOSTEL ADMIN</p>
                            <svg className="logo_card" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 48 48">
                                <path fill="#ff9800" d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z"></path>
                                <path fill="#d50000" d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z"></path>
                                <path fill="#ff3d00" d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48 C20.376,15.05,18,19.245,18,24z"></path>
                            </svg>
                            <svg className="chip" xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 50 50">
                                <path fill="#C1A25C" d="M4 8h42v34H4z" />
                                <path fill="#937C44" d="M10 12h30v26H10z" />
                                <path fill="#E6D3A0" d="M12 14h26v22H12z" />
                                <path fill="#937C44" d="M24 14v22M12 21h26M12 28h26M12 35h26" />
                            </svg>
                            <svg className="contactless" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 50 50">
                                <path fill="none" stroke="white" strokeWidth="3" d="M10 15c5 0 10 5 10 10s-5 10-10 10M17 10c8 0 15 7 15 15s-7 15-15 15M24 5c11 0 20 9 20 20s-9 20-20 20" />
                            </svg>
                            <p className="number text-white font-mono tracking-widest">9944 8476 80</p>
                            <p className="valid_thru">VALID THRU</p>
                            <p className="date_8264">12/29</p>
                            <p className="name_on_card">CHIDESH V</p>
                        </div>

                        {/* BACK */}
                        <div className="flip-card-back">
                            <div className="strip"></div>
                            <div className="mstrip bg-white">
                                <p className="code_text text-black font-mono text-[10px] truncate px-2">chideshv@gmail.com</p>
                            </div>
                            <div className="sstrip flex items-center justify-center">
                                <p className="code_text text-black font-bold">144</p>
                            </div>

                            {/* SOCIAL BUTTONS ON BACK */}
                            <div className="absolute inset-x-0 bottom-4 flex justify-around px-8">
                                <a href="https://whatsapp.com/dl/" target="_blank" rel="noopener noreferrer" className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded-full transition-colors group">
                                    <MessageCircle className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform" />
                                </a>
                                <a href="https://www.instagram.com/iamchidesh/" target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-500/20 hover:bg-pink-500/40 rounded-full transition-colors group">
                                    <Instagram className="h-5 w-5 text-pink-400 group-hover:scale-110 transition-transform" />
                                </a>
                                <a href="mailto:chideshv@gmail.com" className="p-2 bg-blue-500/20 hover:bg-blue-500/40 rounded-full transition-colors group">
                                    <Mail className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                </a>
                                <a href="tel:9944847680" className="p-2 bg-yellow-500/20 hover:bg-yellow-500/40 rounded-full transition-colors group">
                                    <Phone className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-[10px] text-white/30 text-center mt-6 uppercase tracking-widest">Hover to see details</p>
            </div>
        </div>
    );
}
