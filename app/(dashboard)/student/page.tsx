'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BadgeCheck, Clock, Utensils, AlertCircle, FileText, Send, Loader2, Info, Download, Search, XCircle, Menu, LogOut, Home } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Complaint, Outpass, Message } from '@/lib/types';
import { AboutModal } from '@/components/about-modal';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { Loader } from '@/components/loader';

interface ComplaintData {
    id: string;
    title: string;
    status: string;
    createdAt: string;
}

interface OutpassData {
    id: string;
    reason: string;
    status: string;
    fromDate: string;
    toDate: string;
    collegeName?: string;
    hostelName?: string;
    roomNumber?: string;
    yearAndDept?: string;
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'mess' | 'complaints' | 'outpass' | 'fees' | 'messages'>('mess');
    const [messSubTab, setMessSubTab] = useState<'menu' | 'timings' | 'vending'>('menu');
    const [messHostelType, setMessHostelType] = useState<'boys' | 'girls'>('boys');
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    // Data states
    const [complaints, setComplaints] = useState<ComplaintData[]>([]);
    const [outpasses, setOutpasses] = useState<OutpassData[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [feeStatus, setFeeStatus] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(false);

    // Forms
    const [complaintForm, setComplaintForm] = useState({ title: '', description: '', type: 'misc' });

    // New Outpass Form State
    const [outpassForm, setOutpassForm] = useState({
        reason: '',
        fromDate: '',
        toDate: '',
        hostelName: '',
        collegeName: '',
        yearAndDept: ''
    });



    // Zoom Modal State
    const [selectedQr, setSelectedQr] = useState<any>(null);
    const [showAbout, setShowAbout] = useState(false);
    const [uploadedMenu, setUploadedMenu] = useState<any>(null);

    const [vendingStatus, setVendingStatus] = useState<any>(null);
    const [messTimings, setMessTimings] = useState({
        breakfast: '7:30 AM - 9:00 AM',
        lunch: '12:30 PM - 2:00 PM',
        snacks: '4:30 PM - 5:30 PM',
        dinner: '7:30 PM - 9:00 PM'
    });

    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        if (!user) return;
        setLoadingData(true);

        const fetchAndSet = async (url: string, setter: (data: any) => void, errorMsg: string) => {
            try {
                const res = await fetch(url, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setter(data);
                }
            } catch (e) {
                console.error(errorMsg, e);
            }
        };

        try {
            await Promise.all([
                fetchAndSet(`/api/complaints?studentId=${user.id}`, setComplaints, 'Complaints fetch error'),
                fetchAndSet(`/api/outpass?studentId=${user.id}`, setOutpasses, 'Outpasses fetch error'),
                fetchAndSet(`/api/fees?studentId=${user.id}`, (d) => setFeeStatus(d.status === 'none' ? null : d), 'Fees fetch error'),
                fetchAndSet(`/api/mess-menu?type=${messHostelType}`, setUploadedMenu, 'Menu fetch error'),
                fetchAndSet(`/api/vending-status`, setVendingStatus, 'Vending fetch error'),
                fetchAndSet(`/api/mess-timings?type=${messHostelType}`, setMessTimings, 'Timings fetch error'),
                fetchAndSet(`/api/messages`, setMessages, 'Messages fetch error'),
            ]);
        } catch (e) {
            toast.error('Some data failed to load');
        } finally {
            setLoadingData(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader />
            </div>
        );
    }

    useEffect(() => {
        fetchData();
    }, [user, messHostelType]);

    const handleComplaintSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: user?.id,
                    studentName: user?.name,
                    hostelName: user?.hostelName,
                    ...complaintForm
                })
            });
            if (res.ok) {
                toast.success('Complaint Registered');
                setComplaintForm({ title: '', description: '', type: 'misc' });
                fetchData();
            } else {
                toast.error('Failed to submit');
            }
        } catch (e) {
            toast.error('Error submitting');
        } finally {
            setSubmitting(false);
        }
    };


    const handleOutpassSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/outpass', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: user?.id,
                    studentName: user?.name,
                    ...outpassForm,
                    hostelName: outpassForm.hostelName || user?.hostelName,
                    roomNumber: user?.roomNumber,
                })
            });
            if (res.ok) {
                toast.success('Outpass Application Sent');
                setOutpassForm({
                    reason: '',
                    fromDate: '',
                    toDate: '',
                    hostelName: user?.hostelName || '',
                    collegeName: '',
                    yearAndDept: ''
                });
                fetchData();
            } else {
                toast.error('Failed to apply');
            }
        } catch (e) {
            toast.error('Error applying');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClearOutpassHistory = async () => {
        if (!confirm('Are you sure you want to clear your outpass history? This action cannot be undone.')) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/outpass?studentId=${user?.id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('History Cleared');
                fetchData();
            }
        } catch (e) { toast.error('Clear Failed'); }
        setSubmitting(false);
    };

    const [messageForm, setMessageForm] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageForm,
                    type: 'info',
                    senderId: user?.id,
                    senderName: user?.name,
                    senderRole: 'student',
                    hostelName: user?.hostelName
                })
            });
            if (res.ok) {
                toast.success('Message Sent');
                setMessageForm('');
                fetchData();

                // Show submitted feedback
                setIsSubmitted(true);
                setTimeout(() => setIsSubmitted(false), 3000);
            } else {
                toast.error('Failed to send');
            }
        } catch (e) { toast.error('Error sending message'); }
        finally { setSubmitting(false); }
    };



    const handleDownloadPass = async () => {
        if (!selectedQr) return;

        const element = document.getElementById('outpass-to-download');
        if (!element) {
            toast.error('Could not find pass element');
            return;
        }

        const toastId = toast.loading('Generating PDF...');

        try {
            // Use a specific configuration to ensure full element capture
            const dataUrl = await toPng(element, {
                pixelRatio: 3,
                width: 400,
                height: 564,
                style: {
                    transform: 'none',
                    margin: '0',
                    left: '0',
                    top: '0'
                }
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [105, 148]
            });

            // Draw to the exact millimetre dimensions of A6
            pdf.addImage(dataUrl, 'PNG', 0, 0, 105, 148, undefined, 'FAST');
            pdf.save(`Outpass_${selectedQr.studentName.replace(/\s+/g, '_')}.pdf`);

            toast.success('Pass downloaded successfully', { id: toastId });
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate PDF', { id: toastId });
        }
    };

    return (
        <>
            {/* Mobile Navigation Overlay */}
            {isMobileNavOpen && (
                <div className="fixed inset-0 z-50 md:hidden" onClick={() => setIsMobileNavOpen(false)}>
                    <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b dark:border-slate-800">
                            <h2 className="font-semibold text-lg">Navigation</h2>
                        </div>
                        <nav className="p-4 space-y-2">
                            <button onClick={() => { setActiveTab('mess'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'mess' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <Utensils className="w-5 h-5" />
                                <span>Mess Details</span>
                            </button>
                            <button onClick={() => { setActiveTab('complaints'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'complaints' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <AlertCircle className="w-5 h-5" />
                                <span>Complaints</span>
                            </button>
                            <button onClick={() => { setActiveTab('outpass'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'outpass' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <FileText className="w-5 h-5" />
                                <span>Outpass</span>
                            </button>
                            <button onClick={() => { setActiveTab('fees'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'fees' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <BadgeCheck className="w-5 h-5" />
                                <span>Fees</span>
                            </button>
                            <button onClick={() => { setActiveTab('messages'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'messages' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <Send className="w-5 h-5" />
                                <span>Messages</span>
                            </button>
                        </nav>
                        <div className="p-4 border-t dark:border-slate-800 space-y-2">
                            <button onClick={() => { if (confirm('Go to home page?')) window.location.href = '/'; setIsMobileNavOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950">
                                <Home className="w-5 h-5" />
                                <span>Go to Home</span>
                            </button>
                            <button onClick={() => { if (confirm('Sign out?')) { window.location.href = '/'; } setIsMobileNavOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
                                <LogOut className="w-5 h-5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6 max-w-5xl mx-auto">
                <header className="mb-8 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMobileNavOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Welcome, {user?.name}</h1>
                            <p className="text-slate-500">Student Dashboard • {user?.hostelName} • Room {user?.roomNumber}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowAbout(true)} className="text-slate-500 hover:text-black">
                        <Info className="w-4 h-4 mr-2" />
                        About App
                    </Button>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <button onClick={() => setActiveTab('mess')} className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'mess' ? 'ring-2 ring-blue-600 border-transparent bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <Utensils className="h-6 w-6 text-blue-600 mb-2" />
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Mess Details</h3>
                    </button>
                    <button onClick={() => setActiveTab('complaints')} className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'complaints' ? 'ring-2 ring-blue-600 border-transparent bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <AlertCircle className="h-6 w-6 text-orange-600 mb-2" />
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Complaints</h3>
                    </button>
                    <button onClick={() => setActiveTab('outpass')} className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'outpass' ? 'ring-2 ring-blue-600 border-transparent bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <FileText className="h-6 w-6 text-green-600 mb-2" />
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Outpass</h3>
                    </button>
                    <button onClick={() => setActiveTab('messages')} className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'messages' ? 'ring-2 ring-blue-600 border-transparent bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <Send className="h-6 w-6 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Messages</h3>
                    </button>
                    <div
                        onClick={() => setActiveTab('fees')}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${activeTab === 'fees' ? 'ring-2 ring-blue-600 border-transparent bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                        <BadgeCheck className={`h-6 w-6 mb-2 ${feeStatus?.status === 'paid' ? 'text-green-600' : feeStatus?.status === 'unpaid' ? 'text-red-600' : 'text-slate-400'}`} />
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Fees Status</h3>
                        <p className={`text-xs font-bold mt-1 uppercase ${feeStatus?.status === 'paid' ? 'text-green-600' : feeStatus?.status === 'unpaid' ? 'text-red-600' : 'text-slate-500'}`}>
                            {feeStatus?.status === 'pending_request' ? 'Request Sent' : feeStatus?.status || 'Unknown'}
                        </p>
                    </div>
                </div>

                <div className="min-h-[400px]">
                    {activeTab === 'mess' && (
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div>
                                        <CardTitle>Mess Details</CardTitle>
                                        <CardDescription>
                                            {messSubTab === 'menu' ? 'Daily food menu' :
                                                messSubTab === 'timings' ? 'Dining hall opening hours' : 'Vending machine availability'}
                                        </CardDescription>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex space-x-1 self-start md:self-auto overflow-x-auto max-w-full">
                                        <button
                                            onClick={() => setMessSubTab('menu')}
                                            className={`px-4 py-1.5 text-sm rounded-md transition-all ${messSubTab === 'menu' ? 'bg-green-600 text-white shadow' : 'bg-white text-black hover:bg-slate-50'}`}
                                        >
                                            Mess Menu
                                        </button>
                                        <button
                                            onClick={() => setMessSubTab('timings')}
                                            className={`px-4 py-1.5 text-sm rounded-md transition-all ${messSubTab === 'timings' ? 'bg-green-600 text-white shadow' : 'bg-white text-black hover:bg-slate-50'}`}
                                        >
                                            Mess Timings
                                        </button>
                                        <button
                                            onClick={() => setMessSubTab('vending')}
                                            className={`px-4 py-1.5 text-sm rounded-md transition-all ${messSubTab === 'vending' ? 'bg-green-600 text-white shadow' : 'bg-white text-black hover:bg-slate-50'}`}
                                        >
                                            Vending Machine
                                        </button>
                                    </div>
                                </div>
                                {messSubTab === 'menu' && (
                                    <div className="flex space-x-2 mt-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
                                        <button
                                            onClick={() => setMessHostelType('boys')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${messHostelType === 'boys' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                        >
                                            Boys Hostel Menu
                                        </button>
                                        <button
                                            onClick={() => setMessHostelType('girls')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${messHostelType === 'girls' ? 'bg-pink-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                        >
                                            Girls Hostel Menu
                                        </button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {messSubTab === 'menu' ? (
                                    <div className="overflow-x-auto border rounded-xl shadow-sm bg-white dark:bg-slate-900">
                                        <table className="w-full text-xs sm:text-sm text-left border-collapse">
                                            <thead className="text-[10px] sm:text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/50 border-b">
                                                <tr>
                                                    <th className="px-3 py-2 font-bold bg-slate-100 dark:bg-slate-800 whitespace-nowrap sticky left-0 z-20 border-r text-slate-700 dark:text-slate-300">Day / Meal</th>
                                                    {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => (
                                                        <th key={meal} className="px-3 py-2 font-bold min-w-[120px] border-r last:border-0 text-slate-700 dark:text-slate-300">{meal}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, dayIndex) => (
                                                    <tr key={day} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-3 py-3 font-bold bg-slate-50 dark:bg-slate-800 border-r dark:border-slate-700 whitespace-nowrap sticky left-0 z-10 text-slate-900 dark:text-slate-100">
                                                            {day}
                                                        </td>
                                                        <td className="px-3 py-3 border-r text-slate-600 dark:text-slate-300 leading-snug">
                                                            {uploadedMenu?.breakfast?.[dayIndex] || 'Idli, Vada, Sambar'}
                                                        </td>
                                                        <td className="px-3 py-3 border-r text-slate-600 dark:text-slate-200 leading-snug">
                                                            {uploadedMenu?.lunch?.[dayIndex] || 'Rice, Dal, Curd'}
                                                        </td>
                                                        <td className="px-3 py-3 border-r text-slate-600 dark:text-slate-200 leading-snug">
                                                            {uploadedMenu?.snacks?.[dayIndex] || 'Tea, Biscuits'}
                                                        </td>
                                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-200 leading-snug">
                                                            {uploadedMenu?.dinner?.[dayIndex] || 'Chapati, Veg Curry'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : messSubTab === 'timings' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-sm">
                                            <h4 className="font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center"><Clock className="h-4 w-4 mr-2" /> Breakfast</h4>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{messTimings.breakfast}</p>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-sm">
                                            <h4 className="font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center"><Clock className="h-4 w-4 mr-2" /> Lunch</h4>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{messTimings.lunch}</p>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-sm">
                                            <h4 className="font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center"><Clock className="h-4 w-4 mr-2" /> Snacks</h4>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{messTimings.snacks}</p>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-sm">
                                            <h4 className="font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center"><Clock className="h-4 w-4 mr-2" /> Dinner</h4>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{messTimings.dinner}</p>
                                        </div>
                                    </div>
                                ) : messSubTab === 'vending' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className={`p-6 rounded-lg border ${vendingStatus?.status === 'refilled' ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' :
                                                vendingStatus?.status === 'not-filled' ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200' :
                                                    vendingStatus?.status === 'empty' ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' :
                                                        vendingStatus?.status === 'server-error' ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200' :
                                                            'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                                                }`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className={`font-bold text-lg ${vendingStatus?.status === 'refilled' ? 'text-green-900' :
                                                        vendingStatus?.status === 'not-filled' ? 'text-yellow-900' :
                                                            vendingStatus?.status === 'empty' ? 'text-red-900' :
                                                                vendingStatus?.status === 'server-error' ? 'text-gray-900' :
                                                                    'text-green-900'
                                                        }`}>Vending Machine Status</h4>
                                                    <span className={`px-3 py-1 text-white text-xs font-bold rounded-full ${vendingStatus?.status === 'refilled' ? 'bg-green-600' :
                                                        vendingStatus?.status === 'not-filled' ? 'bg-yellow-600' :
                                                            vendingStatus?.status === 'empty' ? 'bg-red-600' :
                                                                vendingStatus?.status === 'server-error' ? 'bg-gray-600' :
                                                                    'bg-green-600'
                                                        }`}>
                                                        {vendingStatus?.status === 'refilled' ? 'OPERATIONAL' :
                                                            vendingStatus?.status === 'not-filled' ? 'LOW STOCK' :
                                                                vendingStatus?.status === 'empty' ? 'OUT OF STOCK' :
                                                                    vendingStatus?.status === 'server-error' ? 'ERROR' :
                                                                        'OPERATIONAL'}
                                                    </span>
                                                </div>
                                                <p className={`text-sm mb-4 ${vendingStatus?.status === 'refilled' ? 'text-green-700' :
                                                    vendingStatus?.status === 'not-filled' ? 'text-yellow-700' :
                                                        vendingStatus?.status === 'empty' ? 'text-red-700' :
                                                            vendingStatus?.status === 'server-error' ? 'text-gray-700' :
                                                                'text-green-700'
                                                    }`}>
                                                    {vendingStatus?.status === 'refilled' ? 'All vending machines are fully functional and stocked.' :
                                                        vendingStatus?.status === 'not-filled' ? 'Stock is running low, vending machines need refilling soon.' :
                                                            vendingStatus?.status === 'empty' ? 'Vending machines are currently out of stock.' :
                                                                vendingStatus?.status === 'server-error' ? 'Vending machines are experiencing technical issues.' :
                                                                    'All vending machines are fully functional and stocked.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'complaints' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Register Complaint</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleComplaintSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Issue Type</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                                value={complaintForm.type}
                                                onChange={(e) => setComplaintForm({ ...complaintForm, type: e.target.value })}
                                            >
                                                <option value="misc">Miscellaneous (Room, Water, etc)</option>
                                                <option value="food">Food / Mess</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input
                                                placeholder="Tube light not working"
                                                value={complaintForm.title}
                                                onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <textarea
                                                className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm min-h-[100px]"
                                                placeholder="Details about the issue..."
                                                value={complaintForm.description}
                                                onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" disabled={submitting}> Register Complaint </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>My Complaints</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {!complaints.length ? <p className="text-sm text-slate-500">No active complaints.</p> :
                                            complaints.map((c) => (
                                                <div key={c.id} className="p-3 border rounded-lg flex justify-between items-center bg-white">
                                                    <div>
                                                        <p className="font-medium text-sm">{c.title}</p>
                                                        <p className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className={`text-xs px-2 py-1 rounded-full capitalize font-medium
                                            ${c.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                                        `}>
                                                        {c.status}
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Send Message</CardTitle>
                                    <CardDescription>Contact Admin</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSendMessage} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Message</Label>
                                            <textarea
                                                className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm min-h-[100px]"
                                                placeholder="Type your message..."
                                                value={messageForm}
                                                onChange={(e) => setMessageForm(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" disabled={submitting || isSubmitted}>
                                            {isSubmitted ? 'Submitted' : 'Send Message'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <div className="grid md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle>Inbox</CardTitle>
                                                <CardDescription>Messages from Admin</CardDescription>
                                            </div>
                                            {messages.filter(m => m.senderRole === 'admin' && (!m.targetHostels || m.targetHostels.length === 0 || (user?.hostelName && m.targetHostels.includes(user.hostelName)))).length > 0 && (
                                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={async () => {
                                                    if (!confirm('Are you sure you want to clear your inbox? This action cannot be undone.')) return;
                                                    setMessages(prev => prev.filter(m => !(m.senderRole === 'admin' && (!m.targetHostels || m.targetHostels.length === 0 || (user?.hostelName && m.targetHostels.includes(user.hostelName))))));
                                                    toast.success('Inbox Cleared');
                                                }}>
                                                    <XCircle className="w-3 h-3 mr-1" /> Clear
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                            {messages.filter(m => m.senderRole === 'admin' && (!m.targetHostels || m.targetHostels.length === 0 || (user?.hostelName && m.targetHostels.includes(user.hostelName)))).length === 0 ? (
                                                <p className="text-sm text-slate-500 text-center py-4">No messages from admin.</p>
                                            ) : (
                                                messages
                                                    .filter(m => m.senderRole === 'admin' && (!m.targetHostels || m.targetHostels.length === 0 || (user?.hostelName && m.targetHostels.includes(user.hostelName))))
                                                    .map((m) => (
                                                        <div key={m.id} className="p-3 rounded-lg border bg-blue-50 border-blue-100 dark:bg-blue-900/20">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <div className="flex gap-2 items-center flex-wrap">
                                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                                                        Admin Notice
                                                                    </span>
                                                                    {m.type && (
                                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${m.type === 'urgent' ? 'bg-red-100 text-red-700' :
                                                                            m.type === 'important' ? 'bg-orange-100 text-orange-700' :
                                                                                m.type === 'Mess' ? 'bg-green-100 text-green-700' :
                                                                                    'bg-slate-100 text-slate-700'
                                                                            }`}>
                                                                            {m.type}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] text-slate-400">
                                                                    {new Date(m.timestamp).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{m.message}</p>
                                                        </div>
                                                    ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle>Sent History</CardTitle>
                                                <CardDescription>Your sent messages</CardDescription>
                                            </div>
                                            {messages.filter(m => m.senderId === user?.id).length > 0 && (
                                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={async () => {
                                                    if (!confirm('Are you sure you want to clear your sent history? This action cannot be undone.')) return;
                                                    setMessages(prev => prev.filter(m => m.senderId !== user?.id));
                                                    toast.success('History Cleared');
                                                }}>
                                                    <XCircle className="w-3 h-3 mr-1" /> Clear
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                            {messages.filter(m => m.senderId === user?.id).length === 0 ? (
                                                <p className="text-sm text-slate-500 text-center py-4">No sent messages.</p>
                                            ) : (
                                                messages
                                                    .filter(m => m.senderId === user?.id)
                                                    .map((m) => (
                                                        <div key={m.id} className="p-3 rounded-lg border bg-white border-slate-200 dark:bg-slate-800">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                                                    You
                                                                </span>
                                                                <span className="text-[10px] text-slate-400">
                                                                    {new Date(m.timestamp).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{m.message}</p>
                                                        </div>
                                                    ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'outpass' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Apply for Outpass</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleOutpassSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>College Name</Label>
                                            <Input
                                                placeholder="College Name"
                                                className={`focus-visible:ring-2 transition-all ${(outpassForm.hostelName || user?.hostelName || '').includes('AKSHAYA') ? 'focus-visible:ring-pink-500' : 'focus-visible:ring-blue-600'}`}
                                                value={outpassForm.collegeName}
                                                onChange={(e) => setOutpassForm({ ...outpassForm, collegeName: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Hostel Name</Label>
                                            <select
                                                className={`flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 transition-all ${(outpassForm.hostelName || user?.hostelName || '').includes('AKSHAYA') ? 'focus-visible:ring-pink-500' : 'focus-visible:ring-blue-600'}`}
                                                value={outpassForm.hostelName || user?.hostelName || ''}
                                                onChange={(e) => setOutpassForm({ ...outpassForm, hostelName: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Hostel</option>
                                                <option value="NRI-1">NRI-1</option>
                                                <option value="NRI-2">NRI-2</option>
                                                <option value="NRI-3">NRI-3</option>
                                                <option value="NRI-4">NRI-4</option>
                                                <option value="AKSHAYA-1">AKSHAYA-1</option>
                                                <option value="AKSHAYA-2">AKSHAYA-2</option>
                                                <option value="AKSHAYA-3">AKSHAYA-3</option>
                                                <option value="AKSHAYA-4">AKSHAYA-4</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Student Name</Label>
                                            <Input value={user?.name || ''} disabled className="bg-slate-100" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Room Number</Label>
                                            <Input value={user?.roomNumber || ''} disabled className="bg-slate-100" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Year & Department</Label>
                                            <Input
                                                placeholder="e.g. 3rd Year CSE"
                                                value={outpassForm.yearAndDept}
                                                onChange={(e) => setOutpassForm({ ...outpassForm, yearAndDept: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Reason</Label>
                                            <Input
                                                placeholder="Going home for weekend"
                                                value={outpassForm.reason}
                                                onChange={(e) => setOutpassForm({ ...outpassForm, reason: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>From</Label>
                                                <Input
                                                    type="date"
                                                    value={outpassForm.fromDate}
                                                    onChange={(e) => setOutpassForm({ ...outpassForm, fromDate: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>To</Label>
                                                <Input
                                                    type="date"
                                                    value={outpassForm.toDate}
                                                    onChange={(e) => setOutpassForm({ ...outpassForm, toDate: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" disabled={submitting}> <Send className="w-4 h-4 mr-2" /> Submit to Admin </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle>History</CardTitle>
                                    {outpasses.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50 uppercase font-bold tracking-wider"
                                            onClick={handleClearOutpassHistory}
                                            disabled={submitting}
                                        >
                                            Clear History
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {!outpasses.length ? <p className="text-sm text-slate-500">No outpass history.</p> :
                                            outpasses.map((o) => (
                                                <div key={o.id} className="p-3 border rounded-lg flex flex-col bg-white">
                                                    <div className="flex justify-between items-center w-full">
                                                        <div>
                                                            <p className="font-medium text-sm">{o.reason}</p>
                                                            <p className="text-xs text-slate-500">{o.fromDate} to {o.toDate}</p>
                                                        </div>
                                                        <div className={`text-xs px-2 py-1 rounded-full capitalize font-medium
                                                ${o.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                o.status === 'expired' ? 'bg-slate-100 text-slate-600' :
                                                                    o.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}
                                            `}>
                                                            {o.status}
                                                        </div>
                                                    </div>
                                                    {(o.status === 'approved' || o.status === 'exited' || o.status === 'entered') && (
                                                        <div className="mt-4 self-center p-4 bg-white rounded border cursor-pointer hover:bg-slate-50 transition-colors"
                                                            onClick={() => setSelectedQr({
                                                                ...o,
                                                                studentName: user?.name || '',
                                                                hostelName: o.hostelName || user?.hostelName || '',
                                                                roomNumber: user?.roomNumber || '',
                                                                collegeName: o.collegeName || 'NANDHA INSTITUTE'
                                                            })}
                                                        >
                                                            <QRCode
                                                                value={JSON.stringify({
                                                                    id: o.id,
                                                                    student: user?.name,
                                                                    collegeName: o.collegeName || 'NANDHA INSTITUTE',
                                                                    hostelName: o.hostelName || user?.hostelName,
                                                                    roomNumber: user?.roomNumber,
                                                                    yearAndDept: o.yearAndDept,
                                                                    reason: o.reason,
                                                                    valid: `${o.fromDate} to ${o.toDate}`,
                                                                    status: 'APPROVED'
                                                                })}
                                                                size={100}
                                                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                            />
                                                            <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">Click to Enlarge</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'fees' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Hostel Fees</CardTitle>
                                <CardDescription>Track your hostel fee payments</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {!feeStatus ? (
                                    <div className="text-center py-8 space-y-4">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                            <BadgeCheck className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-medium">Status Unknown</h3>
                                        <p className="text-slate-500 max-w-sm mx-auto">You haven't requested your fee status yet. Click below to notify the admin.</p>
                                        <Button
                                            onClick={async () => {
                                                setSubmitting(true);
                                                try {
                                                    await fetch('/api/fees', {
                                                        method: 'POST',
                                                        body: JSON.stringify({ action: 'request', studentId: user?.id, studentName: user?.name, hostelName: user?.hostelName })
                                                    });
                                                    toast.success('Request Sent to Admin');
                                                    fetchData();
                                                } catch (e) { toast.error('Request Failed'); }
                                                setSubmitting(false);
                                            }}
                                            disabled={submitting}
                                        >
                                            Ask about my fees
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className={`p-6 rounded-xl border flex flex-col items-center justify-center text-center space-y-2
                                    ${feeStatus.status === 'paid' ? 'bg-green-50 border-green-200' :
                                                feeStatus.status === 'unpaid' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>

                                            <h2 className="text-2xl font-bold uppercase tracking-wide mb-4">
                                                {feeStatus.status === 'pending_request' ? 'Pending Admin Review' : feeStatus.status}
                                            </h2>

                                            {feeStatus.status === 'paid' && <BadgeCheck className="w-12 h-12 text-green-600" />}
                                            {feeStatus.status === 'unpaid' && <AlertCircle className="w-12 h-12 text-red-600" />}
                                            {feeStatus.status === 'pending_request' && <Clock className="w-12 h-12 text-yellow-600" />}

                                            <p className="text-sm opacity-80 mt-2">Last Updated: {new Date(feeStatus.lastUpdated).toLocaleDateString()}</p>
                                        </div>

                                        {feeStatus.status === 'unpaid' && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-slate-50 rounded-lg border text-sm space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Total Course Fee</span>
                                                        <span className="font-medium">₹75,000</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Amount Paid</span>
                                                        <span className="font-medium text-green-600">₹{(75000 - (feeStatus.amountDue || 0)).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between pt-2 border-t">
                                                        <span className="text-slate-900 font-medium">Balance / Remaining</span>
                                                        <span className="font-bold text-red-600">₹{feeStatus.amountDue}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <Button
                                            variant="outline"
                                            className="w-full mt-4"
                                            onClick={async () => {
                                                setSubmitting(true);
                                                try {
                                                    await fetch('/api/fees', {
                                                        method: 'POST',
                                                        body: JSON.stringify({ action: 'request', studentId: user?.id, studentName: user?.name, hostelName: user?.hostelName })
                                                    });
                                                    toast.success('Request Sent to Admin');
                                                    fetchData();
                                                } catch (e) { toast.error('Request Failed'); }
                                                setSubmitting(false);
                                            }}
                                            disabled={submitting}
                                        >
                                            Check Again Request
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {selectedQr && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedQr(null)}>
                        <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                            {/* The Printable A6 Area */}
                            <div className="overflow-auto max-h-[80vh]">
                                <div id="outpass-to-download" className="bg-white p-6 flex flex-col items-center w-[400px] h-[564px] mx-auto shadow-sm">
                                    {/* Header - More Compact */}
                                    <div className="w-full text-center border-b-2 border-indigo-600 pb-2 mb-4">
                                        <h2 className="text-lg font-bold text-indigo-950 tracking-tight uppercase">NANDHA INSTITUTE</h2>
                                        <p className="text-[9px] text-indigo-600 font-bold tracking-widest uppercase">Authorized Digital Outpass</p>
                                    </div>

                                    {/* QR Code Container - Slightly smaller to save space */}
                                    <div className="bg-slate-50 p-3 border border-slate-200 rounded-2xl mb-4 shadow-sm">
                                        <QRCode
                                            value={JSON.stringify({
                                                id: selectedQr.id,
                                                student: selectedQr.studentName,
                                                collegeName: selectedQr.collegeName,
                                                hostelName: selectedQr.hostelName,
                                                roomNumber: selectedQr.roomNumber,
                                                yearAndDept: selectedQr.yearAndDept,
                                                reason: selectedQr.reason,
                                                valid: `${selectedQr.fromDate} to ${selectedQr.toDate}`,
                                                status: 'APPROVED'
                                            })}
                                            size={150}
                                            style={{ height: "auto", maxWidth: "100%", width: "150px" }}
                                        />
                                    </div>

                                    {/* Status Badge - Smaller margin */}
                                    <div className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-4 border border-emerald-200">
                                        <BadgeCheck className="w-3.5 h-3.5" />
                                        Approved
                                    </div>

                                    {/* Details List - More compact gaps */}
                                    <div className="w-full flex flex-col gap-y-3 text-left px-8">
                                        <div className="border-l-2 border-indigo-100 pl-3">
                                            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Student Name</p>
                                            <p className="text-sm font-bold text-indigo-950 uppercase leading-tight">{selectedQr.studentName}</p>
                                        </div>
                                        <div className="border-l-2 border-indigo-100 pl-3">
                                            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Pass ID & Room</p>
                                            <p className="text-sm font-bold text-indigo-950">#{selectedQr.id.slice(-6).toUpperCase()} • RM {selectedQr.roomNumber}</p>
                                        </div>
                                        <div className="border-l-2 border-indigo-100 pl-3">
                                            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Pass Reason</p>
                                            <p className="text-[11px] font-semibold text-slate-600 uppercase leading-snug">{selectedQr.reason}</p>
                                        </div>
                                        {selectedQr.approvedAt && (
                                            <div className="border-l-2 border-indigo-100 pl-3">
                                                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Approved At</p>
                                                <p className="text-[11px] font-bold text-indigo-950 uppercase">
                                                    {new Date(selectedQr.approvedAt).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Validity Footer - Centered and Smaller Width */}
                                    <div className="mt-auto w-3/4 bg-indigo-900 py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-between">
                                        <p className="text-[8px] uppercase font-bold text-indigo-300 tracking-widest">VALID TILL</p>
                                        <p className="text-sm font-black text-white tracking-wide">
                                            {selectedQr.toDate}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Action Footer */}
                            <div className="p-6 bg-slate-50 border-t flex flex-col gap-3">
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-base font-bold transition-all active:scale-95"
                                    onClick={handleDownloadPass}
                                >
                                    <Download className="w-5 h-5" />
                                    Download PDF Pass
                                </Button>
                                <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-700" onClick={() => setSelectedQr(null)}>
                                    Close Window
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
            </div>
        </>
    );
}
