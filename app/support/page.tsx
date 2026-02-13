'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ContactModal } from '@/components/contact-modal';
import { ChevronLeft, HelpCircle, MessageCircle, PhoneCall, Mail, LifeBuoy } from 'lucide-react';

export default function SupportPage() {
    const [isContactOpen, setIsContactOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 font-montserrat p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <Link href="/">
                    <Button variant="ghost" className="gap-2 -ml-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Home
                    </Button>
                </Link>

                <header className="space-y-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto"
                    >
                        <LifeBuoy className="w-8 h-8" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-cinzel uppercase">Technical Support</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
                        Need help with your account, outpass requests, or institutional messages? Our team is here to assist you.
                    </p>
                </header>

                <main className="space-y-8 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-blue-500/5 space-y-4 text-center"
                        >
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center mx-auto text-blue-600">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black">Report an Issue</h2>
                            <p className="text-sm text-slate-500 italic leading-relaxed">Experience a bug or authentication error?</p>
                            <Button
                                onClick={() => setIsContactOpen(true)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl"
                            >
                                Connect Now
                            </Button>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-emerald-500/5 space-y-4 text-center"
                        >
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 rounded-xl flex items-center justify-center mx-auto text-emerald-600">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black">Live Assistance</h2>
                            <p className="text-sm text-slate-500 italic leading-relaxed">Available for urgent technical concerns.</p>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                                    <PhoneCall className="w-4 h-4" />
                                    +91 97864 12513
                                </div>
                                <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                                    <Mail className="w-4 h-4" />
                                    support.devops@nandha.com
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <section className="p-10 rounded-[2.5rem] bg-slate-900 text-white space-y-6 shadow-2xl">
                        <h2 className="text-2xl font-black font-cinzel uppercase text-center">Institutional Support</h2>
                        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                            <p>
                                <strong>Hostel Wardens:</strong> For outpass approvals or physical room concerns, please contact your respective hostel warden directly via the internal messaging system.
                            </p>
                            <p>
                                <strong>Fee Verification:</strong> Payment discrepancies should be reported through the "Fee Verify" request button in your dashboard for admin review.
                            </p>
                            <p>
                                <strong>Emergency:</strong> In case of medical emergencies, use the "Siren" button in the Sick Register section to alert the administration immediately.
                            </p>
                        </div>
                    </section>
                </main>

                <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
            </div>
        </div>
    );
}
