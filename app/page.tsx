'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContactModal } from '@/components/contact-modal';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowRight, Building, ShieldCheck, User, Users } from 'lucide-react';

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      <header className="p-4 md:p-6 flex justify-between items-center max-w-7xl mx-auto w-full gap-2">
        <div className="flex items-center space-x-2 min-w-0 flex-shrink">
          <img src="/logo-main.png" alt="Logo" className="h-8 w-8 md:h-10 md:w-10 object-contain rounded-md flex-shrink-0" />
          <span className="font-bold text-sm md:text-xl text-slate-900 dark:text-white truncate">NEI Smart Hostel</span>
        </div>
        <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="dark:text-slate-300 dark:hover:text-white text-xs md:text-sm px-2 md:px-4">Login</Button>
          </Link>
          <Link href="/login?mode=register">
            <Button size="sm" className="text-xs md:text-sm px-2 md:px-4">Get Started <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" /></Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto space-y-8">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-300 font-zenitha flex flex-col items-center px-4 overflow-hidden">
          <span className="block font-bold">Nandha Educational Institute</span>
          <span className="text-blue-600 dark:text-blue-400 mt-1 text-lg sm:text-xl md:text-2xl">Smart Hostel</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl transition-colors duration-300">
          A unified portal for students, admins, and wardens to manage mess, complaints, fees, and outpasses seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/login">
            <button className="uiverse-login-button w-full sm:w-auto">
              Student/Admin/Send-Off Login
            </button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 w-full text-left">
          <div className="bg-white dark:bg-black p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-2 border-slate-300 dark:border-slate-700 transform transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_50px_rgb(0,0,0,0.2)] dark:hover:shadow-[0_20px_50px_rgb(0,0,0,0.6)] hover:bg-slate-50 dark:hover:bg-black group">
            <div className="h-12 w-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 transition-colors">
              <User className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Student Portal</h3>
            <p className="text-slate-600 dark:text-slate-400 underline-offset-4">Check mess menu, apply for outpass, and register complaints in seconds.</p>
          </div>
          <div className="bg-white dark:bg-black p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-2 border-slate-300 dark:border-slate-700 transform transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_50px_rgb(0,0,0,0.2)] dark:hover:shadow-[0_20px_50px_rgb(0,0,0,0.6)] hover:bg-slate-50 dark:hover:bg-black group">
            <div className="h-12 w-12 bg-green-500/10 dark:bg-green-500/20 rounded-xl flex items-center justify-center mb-4 text-green-600 dark:text-green-400 transition-colors">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Admin Dashboard</h3>
            <p className="text-slate-600 dark:text-slate-400">Track and resolve complaints efficiently. Keep the hostel running smooth.</p>
          </div>
          <div className="bg-white dark:bg-black p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-2 border-slate-300 dark:border-slate-700 transform transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_50px_rgb(0,0,0,0.2)] dark:hover:shadow-[0_20px_50px_rgb(0,0,0,0.6)] hover:bg-slate-50 dark:hover:bg-black group">
            <div className="h-12 w-12 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400 transition-colors">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Secure & Digital</h3>
            <p className="text-slate-600 dark:text-slate-400">Role-based access ensure data privacy and secure digital approvals.</p>
          </div>
        </div>

        <div className="flex justify-center mt-12 pb-8">
          <button className="uiverse-contact-button" onClick={() => setIsContactOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24">
              <path d="m18 0 8 12 10-8-4 20H4L0 4l10 8 8-12z"></path>
            </svg>
            Contact Admin
          </button>
        </div>

        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      </main>

      <footer className="p-6 text-center text-slate-400 text-sm">
        © 2024 NEI Smart Hostel. All rights reserved.
      </footer>
    </div>
  );
}
