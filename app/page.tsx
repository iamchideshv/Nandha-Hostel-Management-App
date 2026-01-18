'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { ContactModal } from '@/components/contact-modal';
import { ThemeToggle } from '@/components/theme-toggle';
import { Building, ShieldCheck, User, Users, ArrowRight, Star, CheckCircle2, Globe, Sparkles, LayoutDashboard, Clock } from 'lucide-react';
import { InstallPrompt } from '@/components/InstallPrompt';
import { ImageGallery } from '@/components/ImageGallery';
import { InstitutionGrid } from '@/components/InstitutionGrid';
import { motion } from 'framer-motion';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'authority') router.push('/authority');
      else if (user.role === 'send-off') router.push('/send-off');
      else if (user.role === 'devops') router.push('/devops');
      else router.push('/student');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500 bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center space-x-3 min-w-0 flex-shrink">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="p-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg"
            >
              <img src="/logo-main.png" alt="Logo" className="h-8 w-8 md:h-9 md:w-9 object-contain brightness-0 invert" />
            </motion.div>
            <span className="font-black text-lg md:text-2xl text-slate-900 dark:text-white tracking-tighter uppercase leading-none">NEI <span className="text-blue-600">SMART</span> HOSTEL</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">SignIn</Button>
            </Link>
            <Link href="/login?mode=register">
              <button className="relative inline-flex h-10 overflow-hidden rounded-full p-[2px] focus:outline-none group">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#3B82F6_50%,#E2E8F0_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#1E293B_0%,#3B82F6_50%,#1E293B_100%)] shadow-xl" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-50 dark:bg-slate-950 px-4 py-1 text-sm font-bold text-slate-900 dark:text-white backdrop-blur-3xl group-hover:bg-transparent group-hover:text-white dark:group-hover:text-white transition-all">
                  Get Started
                </span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 pt-32">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center px-6 text-center max-w-6xl mx-auto space-y-10 mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-800 mb-4 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">Next-Gen Hostel Operations</span>
          </motion.div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tight flex flex-col items-center leading-[0.9] px-4">
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Nandha Educational
            </motion.span>
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 pb-2"
            >
              Institution Portals
            </motion.span>
          </h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl font-medium leading-relaxed"
          >
            A high-performance digital ecosystem bridging students, administrators, and wardens for seamless mess tracking, digital outpasses, and institutional governance.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 w-full justify-center items-center"
          >
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xl shadow-2xl shadow-blue-500/20 w-full transition-all hover:scale-105 active:scale-95 group">
                Enter Dashboard
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <InstallPrompt />
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 pt-10"
          >
            <div className="flex items-center gap-2 grayscale brightness-200 dark:brightness-50 hover:grayscale-0 hover:brightness-100 transition-all cursor-default group">
              <ShieldCheck className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-400 tracking-tighter uppercase group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Secure Auth</span>
            </div>
            <div className="flex items-center gap-2 grayscale brightness-200 dark:brightness-50 hover:grayscale-0 hover:brightness-100 transition-all cursor-default group">
              <Clock className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-400 tracking-tighter uppercase group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Real-Time Sync</span>
            </div>
            <div className="flex items-center gap-2 grayscale brightness-200 dark:brightness-50 hover:grayscale-0 hover:brightness-100 transition-all cursor-default group">
              <LayoutDashboard className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-400 tracking-tighter uppercase group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Smart Analytics</span>
            </div>
          </motion.div>
        </section>

        {/* Gallery Section */}
        <section className="bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800">
          <ImageGallery />
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 py-32 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">The <span className="text-blue-600">Smart</span> Edge</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Digitizing every touch-point of the hostel experience with precision and security.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 w-full text-left">
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 group"
            >
              <div className="h-16 w-16 bg-blue-500/10 rounded-[1.5rem] flex items-center justify-center mb-6 text-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6">
                <User className="h-8 w-8" />
              </div>
              <h3 className="font-black text-2xl mb-3 text-slate-900 dark:text-white">Unified Portal</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">A single secure credential for students to access mess menus, apply for leave, track bills, and report concerns instantly.</p>
              <div className="mt-8 flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest">
                Explore More <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 group"
            >
              <div className="h-16 w-16 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center mb-6 text-emerald-600 transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:-rotate-6">
                <LayoutDashboard className="h-8 w-8" />
              </div>
              <h3 className="font-black text-2xl mb-3 text-slate-900 dark:text-white">Admin Hub</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Empowering wardens and authorities with automated approval workflows, institutional filtering, and live register analytics.</p>
              <div className="mt-8 flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-widest">
                Data Driven <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 group"
            >
              <div className="h-16 w-16 bg-indigo-500/10 rounded-[1.5rem] flex items-center justify-center mb-6 text-indigo-600 transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="font-black text-2xl mb-3 text-slate-900 dark:text-white">Security First</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">End-to-end encrypted profiles, automated push notifications, and tamper-proof digital records ensuring 100% data integrity.</p>
              <div className="mt-8 flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest">
                Enterprise Grade <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Institutions Section */}
        <InstitutionGrid />

        {/* Contact CTA */}
        <section className="px-6 py-20 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-800 dark:from-blue-600 dark:to-indigo-700 p-12 md:p-20 text-center space-y-8 relative shadow-3xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter leading-tight">Need assistance with your portal setup?</h2>
            <p className="text-slate-300 dark:text-blue-100/80 text-lg md:text-xl max-w-2xl mx-auto font-medium">Our technical support team is available 24/7 to help students and faculty with authentication and accessibility.</p>
            <div className="pt-6">
              <button
                onClick={() => setIsContactOpen(true)}
                className="inline-flex h-16 items-center justify-center rounded-2xl bg-white px-10 text-lg font-black text-slate-900 shadow-xl transition-all hover:scale-105 active:scale-95 group"
              >
                Connect with Support
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </section>

        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-10 mt-20 relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center space-x-2">
              <img src="/logo-main.png" alt="Logo" className="h-6 w-6 object-contain" />
              <span className="font-bold text-slate-900 dark:text-white">NEI Smart Hostel</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">The official digital portal of Nandha Educational Institutions.</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex gap-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Support</span>
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Terms</span>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">
              © 2024 NANDHA EDUCATIONAL INSTITUTIONS. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
