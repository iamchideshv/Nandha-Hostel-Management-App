'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { ContactModal } from '@/components/contact-modal';
import { ThemeToggle } from '@/components/theme-toggle';
import { Building, ShieldCheck, User, Users, ArrowRight, Star, CheckCircle2, Globe, Sparkles, LayoutDashboard, Clock, GraduationCap } from 'lucide-react';
import { InstallPrompt } from '@/components/InstallPrompt';
import { ImageGallery } from '@/components/ImageGallery';
import { InstitutionGrid } from '@/components/InstitutionGrid';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showInstitutions, setShowInstitutions] = useState(false);

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
    <div className="min-h-screen flex flex-col transition-colors duration-500 bg-[#f8fafc] dark:bg-slate-950 overflow-x-hidden font-montserrat">
      {/* Soft Institutional Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.05),transparent)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 p-3 md:p-5 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-shrink">
            <motion.img
              whileHover={{ scale: 1.1 }}
              src="/logo-main.png"
              alt="Logo"
              className="h-8 w-8 md:h-11 md:w-11 object-contain flex-shrink-0"
            />
            <span className="font-black text-sm md:text-2xl text-slate-900 dark:text-white tracking-tight leading-none font-cinzel whitespace-nowrap">
              NEI <span className="text-blue-600">SMART</span> HOSTEL
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="font-bold text-slate-700 dark:text-slate-200">SignIn</Button>
            </Link>
            <Link href="/login?mode=register">
              <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black px-4 md:px-8 text-xs md:text-sm shadow-lg shadow-blue-500/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 pt-24 md:pt-36">
        {/* Centered Hero Section */}
        <section className="flex flex-col items-center justify-center px-4 md:px-6 text-center max-w-5xl mx-auto space-y-6 md:space-y-10 mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white/50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800 shadow-sm"
          >
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
            <span className="text-[10px] md:text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-[0.2em]">Next-Gen Operations</span>
          </motion.div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] md:leading-[1] font-cinzel">
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="block"
            >
              Nandha Educational
            </motion.span>
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-blue-600 dark:text-blue-400"
            >
              Institution Portals
            </motion.span>
          </h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl font-medium leading-relaxed px-2"
          >
            A high-performance digital ecosystem bridging students, administrators, and wardens for seamless institutional governance.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center px-4"
          >
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="h-14 md:h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg md:text-xl shadow-xl shadow-blue-500/30 w-full transition-all hover:scale-105 active:scale-95 group">
                Enter Dashboard
                <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowInstitutions(!showInstitutions)}
              className="h-14 md:h-16 px-8 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 w-full sm:w-auto hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-5 h-5" />
              College Official
            </Button>
          </motion.div>
        </section>

        {/* Dynamic Institution Grid Display */}
        <AnimatePresence>
          {showInstitutions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/20"
            >
              <InstitutionGrid />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery Section */}
        <section className="bg-white/50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800 py-10">
          <div className="text-center mb-6 px-4">
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-cinzel">Campus Excellence</h2>
          </div>
          <ImageGallery />
        </section>

        {/* Balanced Features Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-20 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center"
            >
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <User className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">Student Portal</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Simplified access to mess menus, leave requests, and digital records.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center"
            >
              <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">Admin Hub</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Automated approval workflows and institutional data analytics.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center"
            >
              <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">Security First</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">End-to-end encryption and tamper-proof digital records.</p>
            </motion.div>
          </div>
        </section>

        {/* Refined Contact Section */}
        <section className="px-4 md:px-6 py-10 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto rounded-[2rem] bg-slate-900 dark:bg-blue-600 p-8 md:p-12 text-center space-y-6 relative overflow-hidden"
          >
            <h2 className="text-2xl md:text-4xl font-black text-white font-cinzel">Technical Support</h2>
            <p className="text-slate-300 dark:text-blue-50 text-sm md:text-base max-w-lg mx-auto">Available 24/7 for authentication and accessibility assistance.</p>
            <button
              onClick={() => setIsContactOpen(true)}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-black text-slate-900 hover:scale-105 transition-all"
            >
              Connect Now
            </button>
          </motion.div>
        </section>

        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
        <InstallPrompt />
      </main>

      <footer className="bg-white dark:bg-slate-950 p-6 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center space-x-2">
            <img src="/logo-main.png" alt="Logo" className="h-5 w-5 object-contain" />
            <span className="font-bold text-slate-900 dark:text-white text-sm">NEI Smart Hostel</span>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-loose">
            © 2024 NANDHA EDUCATIONAL INSTITUTIONS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
