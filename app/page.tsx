import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building, ShieldCheck, User, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <img src="/logo.jpg" alt="Logo" className="h-10 w-10 object-contain rounded-md" />
          <span className="font-bold text-xl text-slate-900">Nandha Institute Hostel Manager</span>
        </div>
        <div className="space-x-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
          Nandha Institute <span className="text-blue-600">Residence [V-17662244]</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl">
          A unified portal for students, admins, and wardens to manage mess, complaints, fees, and outpasses seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-lg">Student/Admin/Send-Off Login</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 w-full text-left">
          <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 transform transition-all duration-300 hover:scale-105 hover:bg-black">
            <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 text-blue-400">
              <User className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Student Portal</h3>
            <p className="text-slate-400">Check mess menu, apply for outpass, and register complaints in seconds.</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 transform transition-all duration-300 hover:scale-105 hover:bg-black">
            <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 text-green-400">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Admin Dashboard</h3>
            <p className="text-slate-400">Track and resolve complaints efficiently. Keep the hostel running smooth.</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 transform transition-all duration-300 hover:scale-105 hover:bg-black">
            <div className="h-12 w-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 text-purple-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Secure & Digital</h3>
            <p className="text-slate-400">Role-based access ensure data privacy and secure digital approvals.</p>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-slate-400 text-sm">
        © 2024 Nandha Institute Hostel Manager. All rights reserved.
      </footer>
    </div>
  );
}
