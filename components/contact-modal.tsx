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
                    className="fixed inset-0 z-[99999] flex items-start justify-center pt-8 md:pt-16 pb-8 px-4 bg-black/80 backdrop-blur-md overflow-y-auto"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col my-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header Image Section */}
                        <div className="relative h-48 md:h-64 overflow-hidden group">
                            <img
                                src="/future_of_work_concept_illustration.jpg"
                                alt="Support Header"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

                            <div className="absolute bottom-6 left-8">
                                <h2 className="text-3xl md:text-5xl font-black text-white font-cinzel tracking-tight drop-shadow-lg">TECHNICAL SUPPORT</h2>
                                <p className="text-blue-400 text-sm font-bold uppercase tracking-[0.3em] mt-2 drop-shadow-md">Professional Solutions 24/7</p>
                            </div>

                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full text-white transition-all hover:rotate-90 shadow-lg border border-white/20"
                                aria-label="Close modal"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row bg-white dark:bg-slate-900 min-h-0">
                            {/* Left Column: Contact Details */}
                            <div className="md:w-5/12 p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 space-y-8 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/40">
                                        <img src="/logo-main.png" alt="Logo" className="h-7 w-7 object-contain brightness-0 invert" />
                                    </div>
                                    <span className="font-black text-2xl text-slate-900 dark:text-white font-cinzel tracking-tighter">NEI SMART</span>
                                </div>

                                <div className="space-y-7">
                                    {[
                                        { icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', title: 'Connect Now', text: '+91 99448 47680' },
                                        { icon: Mail, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', title: 'Support Email', text: 'neismarthostel@gmail.com' },
                                        { icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10', title: 'Visit Office', text: 'Vaikkaalmedu, Perundurai Main Road, Erode - 638052' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-4 transition-transform hover:translate-x-1">
                                            <div className={`p-3.5 ${item.bg} rounded-2xl shadow-sm border border-transparent dark:border-white/5`}>
                                                <item.icon className={`h-5 w-5 ${item.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.title}</p>
                                                <p className="text-[14px] font-bold text-slate-800 dark:text-slate-200 leading-snug">{item.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 ml-1">Follow Us</p>
                                    <div className="flex gap-4">
                                        {[
                                            { icon: Instagram, color: 'hover:text-pink-500', link: 'https://instagram.com' },
                                            { icon: Youtube, color: 'hover:text-red-500', link: 'https://youtube.com' },
                                            { icon: Linkedin, color: 'hover:text-blue-500', link: 'https://linkedin.com' }
                                        ].map((social, i) => (
                                            <motion.a
                                                key={i}
                                                whileHover={{ y: -5, scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                href={social.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors text-slate-400 ${social.color}`}
                                            >
                                                <social.icon className="h-5 w-5" />
                                            </motion.a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Contact Form */}
                            <div className="md:w-7/12 p-8 md:p-12 flex flex-col gap-8 bg-white dark:bg-slate-900">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                        Drop a Request <Send className="h-5 w-5 text-blue-500" />
                                    </h3>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Our support engineers will prioritize your query.</p>
                                </div>

                                <form onSubmit={handleSendEmail} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Your ID/Email</label>
                                            <input
                                                type="text"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Roll Number or Email"
                                                className="w-full h-14 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Issue Subject</label>
                                            <input
                                                type="text"
                                                required
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                placeholder="e.g., Login Issue"
                                                className="w-full h-14 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Elaborate Details</label>
                                        <textarea
                                            required
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Tell us more about the problem..."
                                            rows={5}
                                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none resize-none"
                                        />
                                    </div>

                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 transition-all text-lg"
                                    >
                                        <Mail className="h-5 w-5" />
                                        <span>Initiate Support</span>
                                        <ExternalLink className="h-4 w-4 opacity-50" />
                                    </motion.button>
                                </form>

                                <div className="flex items-center justify-center gap-3 pt-2">
                                    <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800" />
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">NEI DEVOPS CORE</p>
                                    <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
