'use client';

import { useState } from 'react';
import { Mail, Phone, Instagram, Youtube, Linkedin, MapPin, X, Send, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');

    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        const mailtoLink = `mailto:neismarthostel@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${email}\n\n${description}`)}`;
        window.location.href = mailtoLink;
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-20 p-2.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 backdrop-blur-xl rounded-full text-slate-500 dark:text-white transition-all hover:rotate-90 border border-transparent dark:border-white/10"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex flex-col items-center">
                            {/* Circular Image Section */}
                            <div className="pt-10 pb-6 flex flex-col items-center space-y-4">
                                <div className="relative h-28 w-28 md:h-36 md:w-36 rounded-full overflow-hidden border-4 border-blue-500/20 shadow-2xl">
                                    <img
                                        src="/future_of_work_concept_illustration.jpg"
                                        alt="Support"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-cinzel leading-none">TECHNICAL SUPPORT</h2>
                                    <p className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Professional Solutions 24/7</p>
                                </div>
                            </div>

                            <div className="w-full flex flex-col md:flex-row bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                                {/* Left: Contact Info */}
                                <div className="md:w-5/12 p-8 space-y-6 md:border-r border-slate-100 dark:border-slate-800">
                                    {[
                                        { icon: Phone, color: 'text-blue-600', text: '+91 99448 47680' },
                                        { icon: Mail, color: 'text-emerald-600', text: 'neismarthostel@gmail.com' },
                                        { icon: MapPin, color: 'text-purple-600', text: 'Erode, Tamil Nadu' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                                <item.icon className={`h-4 w-4 ${item.color}`} />
                                            </div>
                                            <p className="text-[12px] font-bold text-slate-700 dark:text-slate-300 truncate">{item.text}</p>
                                        </div>
                                    ))}

                                    <div className="pt-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Follow Us</p>
                                        <div className="flex gap-3">
                                            {[Instagram, Youtube, Linkedin].map((Icon, i) => (
                                                <a key={i} href="#" className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-blue-500 hover:scale-110 transition-all shadow-sm">
                                                    <Icon className="h-4 w-4" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Form */}
                                <div className="md:w-7/12 p-8">
                                    <form onSubmit={handleSendEmail} className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <input
                                                type="text"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Roll Number / Email"
                                                className="w-full h-11 bg-white dark:bg-slate-800 border-none rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-blue-500 shadow-sm outline-none"
                                            />
                                            <input
                                                type="text"
                                                required
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                placeholder="Subject"
                                                className="w-full h-11 bg-white dark:bg-slate-800 border-none rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-blue-500 shadow-sm outline-none"
                                            />
                                            <textarea
                                                required
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="How can we help?"
                                                rows={3}
                                                className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-4 text-xs font-bold focus:ring-2 focus:ring-blue-500 shadow-sm outline-none resize-none"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                                        >
                                            <Send className="h-4 w-4" />
                                            <span className="text-xs">Send Message</span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 py-3 text-center">
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.5em]">NEI DEVOPS CORE TEAM</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
