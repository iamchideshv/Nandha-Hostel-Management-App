'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileText, Scale, UserCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function TermsConditions() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 font-montserrat p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <Link href="/">
                    <Button variant="ghost" className="gap-2 -ml-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Home
                    </Button>
                </Link>

                <header className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400"
                    >
                        <FileText className="w-8 h-8" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-cinzel">Terms of Service</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium italic">Last updated: February 13, 2026</p>
                </header>

                <main className="space-y-12 pb-20">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <Scale className="w-6 h-6 text-blue-600" />
                            Agreement to Terms
                        </h2>
                        <p className="leading-relaxed">
                            By accessing the NEI Smart Hostel application, you agree to be bound by these Terms of Service. This application is an official management tool for Nandha Educational Institutions.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <UserCheck className="w-6 h-6 text-blue-600" />
                            User Conduct
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 ml-4 leading-relaxed">
                            <li>Students must use their actual identity and institutional credentials.</li>
                            <li>Requests (Outpass, Sick, Complaints) must be genuine and accurate.</li>
                            <li>Misuse of the emergency alert system will lead to disciplinary action.</li>
                            <li>Unauthorized access to administrative functions is strictly prohibited.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <ShieldAlert className="w-6 h-6 text-blue-600" />
                            Administrative Authority
                        </h2>
                        <p className="leading-relaxed">
                            The Institution reserves the right to approve, reject, or revoke any request submitted through this portal. The digital records generated here serve as official institutional data for attendance and safety monitoring.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-blue-600" />
                            Limitation of Liability
                        </h2>
                        <p className="leading-relaxed">
                            While we strive for 100% uptime and data accuracy, the institution is not liable for system delays caused by network issues or maintenance periods. In case of technical failure, students are advised to report to the warden's office manually.
                        </p>
                    </section>

                    <footer className="p-8 border-t border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            Failure to comply with these terms may result in suspension of hostel privileges. <br />
                            © 2026 NANDHA EDUCATIONAL INSTITUTIONS
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
}
