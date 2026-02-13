'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Shield, Lock, Eye, Cloud, Bell } from 'lucide-react';

export default function PrivacyPolicy() {
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
                        <Shield className="w-8 h-8" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-cinzel">Privacy Policy</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium italic">Last updated: February 13, 2026</p>
                </header>

                <main className="space-y-12 pb-20">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <Eye className="w-6 h-6 text-blue-600" />
                            Introduction
                        </h2>
                        <p className="leading-relaxed">
                            At NEI Smart Hostel, part of the Nandha Educational Institutions ecosystem, we are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our digital management platform.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <Lock className="w-6 h-6 text-blue-600" />
                            Information We Collect
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="font-black mb-2 uppercase text-xs tracking-widest text-blue-600">Student Profile</h3>
                                <p className="text-sm">Name, Department, Room Number, Email, and Phone Number provided during registration or profile updates.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="font-black mb-2 uppercase text-xs tracking-widest text-blue-600">Operational Data</h3>
                                <p className="text-sm">Outpass requests, Leave history, Sick registers, and Complaints reported through the system.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <Cloud className="w-6 h-6 text-blue-600" />
                            Storage & Security
                        </h2>
                        <p className="leading-relaxed">
                            All data is stored securely using <strong>Google Firebase/Firestore</strong> services. We implement industrial-standard security protocols to ensure that your records are tamper-proof and accessible only to authorized personnel (Wardens and Administrators).
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <Bell className="w-6 h-6 text-blue-600" />
                            Push Notifications
                        </h2>
                        <p className="leading-relaxed">
                            We use <strong>Firebase Cloud Messaging (FCM)</strong> to send real-time alerts regarding outpass status, fee updates, and institutional broadcasts. You can manage notification permissions directly through your device settings.
                        </p>
                    </section>

                    <section className="p-8 rounded-3xl bg-blue-600 text-white space-y-4 shadow-xl shadow-blue-500/20">
                        <h2 className="text-2xl font-black font-cinzel">Compliance</h2>
                        <p className="font-medium opacity-90 leading-relaxed">
                            This platform is designed specifically for NEI internal management. Data is not shared with third-party marketing entities. It remains within the institution's digital infrastructure for administrative purposes only.
                        </p>
                    </section>
                </main>
            </div>
        </div>
    );
}
