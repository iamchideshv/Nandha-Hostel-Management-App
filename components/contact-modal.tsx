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

    if (!isOpen) return null;

    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        const mailtoLink = `mailto:neismarthostel@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${email}\n\n${description}`)}`;
        window.location.href = mailtoLink;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-10 md:pt-20 px-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.95 }}
                        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col mb-10"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header Image */}
                        <div className="relative h-48 md:h-64 overflow-hidden group">
                            <img
                                src="/future_of_work_concept_illustration.jpg"
                                alt="Support Header"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                            <div className="absolute bottom-6 left-8">
                                <h2 className="text-3xl md:text-4xl font-black text-white font-cinzel tracking-tight">TECHNICAL SUPPORT</h2>
                                <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mt-1">Direct Help Channel</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:rotate-90"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row bg-white dark:bg-slate-900">
                            {/* Left Column: Contact Details */}
                            <div className="md:w-5/12 p-8 md:p-10 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                        <img src="/logo-main.png" alt="Logo" className="h-7 w-7 object-contain brightness-0 invert" />
                                    </div>
                                    <span className="font-black text-xl text-slate-900 dark:text-white font-cinzel tracking-tighter">NEI SMART HOSTEL</span>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                            <Phone className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Call Us</p>
                                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">+91 99448 47680</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                            <Mail className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Us</p>
                                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">neismarthostel@gmail.com</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                            <MapPin className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-relaxed max-w-xs">
                                                Erode - Perundurai Main Road, Vaikkaalmedu, Erode, Tamil Nadu 638052
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Connect Socially</p>
                                    <div className="flex gap-4">
                                        {[
                                            { icon: Instagram, color: 'text-pink-500', link: 'https://instagram.com' },
                                            { icon: Youtube, color: 'text-red-500', link: 'https://youtube.com' },
                                            { icon: Linkedin, color: 'text-blue-500', link: 'https://linkedin.com' }
                                        ].map((social, i) => (
                                            <motion.a
                                                key={i}
                                                whileHover={{ y: -5, scale: 1.1 }}
                                                href={social.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm ${social.color}`}
                                            >
                                                <social.icon className="h-5 w-5" />
                                            </motion.a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Contact Form */}
                            <div className="md:w-7/12 p-8 md:p-10 flex flex-col gap-6">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                    Send a Message <ExternalLink className="h-4 w-4 text-blue-500" />
                                </h3>

                                <form onSubmit={handleSendEmail} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Your Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="contact@example.com"
                                            className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subject</label>
                                        <input
                                            type="text"
                                            required
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="Query regarding hostel system"
                                            className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                                        <textarea
                                            required
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="How can we help you?"
                                            rows={4}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Send className="h-5 w-5" />
                                        <span>Send Support Mail</span>
                                    </button>
                                </form>
                                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">
                                    Powered by NEI DevOps Team
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
