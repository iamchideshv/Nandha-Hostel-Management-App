'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Complaint, Outpass, User, FeeStatus, Message, LostFound } from '@/lib/types';
import { AlertCircle, FileText, CheckCircle, XCircle, Clock, IndianRupee, Info, Utensils, Upload, Check, Send, Menu, LogOut, Home, Search, Eye, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import QRCode from 'react-qr-code';
import { AboutModal } from '@/components/about-modal';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'mess' | 'complaints' | 'outpass' | 'fees' | 'messages' | 'lost-found'>('complaints');
    const [messSubTab, setMessSubTab] = useState<'menu' | 'timings' | 'vending'>('menu');
    const [messHostelType, setMessHostelType] = useState<'boys' | 'girls'>('boys');

    // Data
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [outpasses, setOutpasses] = useState<Outpass[]>([]);
    const [fees, setFees] = useState<FeeStatus[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [lostItems, setLostItems] = useState<LostFound[]>([]);
    const [loading, setLoading] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    // Filter for complaints
    // Filter for complaints
    const [filter, setFilter] = useState<'all' | 'food' | 'misc'>('all');

    // Fee Update State
    const [selectedFee, setSelectedFee] = useState<FeeStatus | null>(null);
    const [feeForm, setFeeForm] = useState({ status: 'paid', amountDue: '', fineAmount: '', fineReason: '', dueDate: '' });
    const [showAbout, setShowAbout] = useState(false);
    const [selectedLostItem, setSelectedLostItem] = useState<LostFound | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showFoundModal, setShowFoundModal] = useState(false);
    const [foundMessage, setFoundMessage] = useState('Come and collect it on office room');
    const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
    const [submittingStatusId, setSubmittingStatusId] = useState<string | null>(null);
    const [imageIndices, setImageIndices] = useState<Record<string, number>>({}); // Track active image per item

    // Mess Menu State
    const [messMenu, setMessMenu] = useState({
        breakfast: Array(7).fill('Idli, Vada, Sambar'),
        lunch: Array(7).fill('Rice, Dal, Curd'),
        snacks: Array(7).fill('Tea, Biscuits'),
        dinner: Array(7).fill('Chapati, Veg Curry')
    });
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];
    const [messTimings, setMessTimings] = useState({
        breakfast: '7:30 AM - 9:00 AM',
        lunch: '12:30 PM - 2:00 PM',
        snacks: '4:30 PM - 5:30 PM',
        dinner: '7:30 PM - 9:00 PM'
    });

    // Vending Machine Status State
    const [vendingStatus, setVendingStatus] = useState('refilled');
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [menuUploadSuccess, setMenuUploadSuccess] = useState(false);
    const [timingsUploadSuccess, setTimingsUploadSuccess] = useState(false);

    // Messages State

    const hostelsList = [
        'NRI-1', 'NRI-2', 'NRI-3', 'NRI-4',
        'AKSHAYA-1', 'AKSHAYA-2', 'AKSHAYA-3', 'AKSHAYA-4'
    ];


    const handleMenuChange = (meal: string, dayIndex: number, value: string) => {
        setMessMenu(prev => ({
            ...prev,
            [meal]: prev[meal as keyof typeof prev].map((item: string, i: number) => i === dayIndex ? value : item)
        }));
    };


    const uploadMenu = async () => {
        try {
            const res = await fetch('/api/mess-menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...messMenu, type: messHostelType })
            });

            if (res.ok) {
                toast.success('Mess menu uploaded successfully!');
                setMenuUploadSuccess(true);
                setTimeout(() => setMenuUploadSuccess(false), 3000);
            } else {
                toast.error('Failed to upload menu');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error uploading menu');
        }
    };

    const uploadVendingStatus = async () => {
        try {
            const res = await fetch('/api/vending-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: vendingStatus })
            });

            if (res.ok) {
                toast.success('Vending status updated successfully!');
                setUploadSuccess(true);
                // Hide success message after 3 seconds
                setTimeout(() => setUploadSuccess(false), 3000);
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error updating status');
        }
    };



    const fetchData = async () => {
        setLoading(true);
        try {
            const hostelQuery = user?.hostelName ? `?hostelName=${user.hostelName}` : '';
            const [compRes, outRes, feeRes, messRes, timingsRes, lostRes, msgRes] = await Promise.all([
                fetch(`/api/complaints${hostelQuery}`, { cache: 'no-store' }),
                fetch(`/api/outpass${hostelQuery}`, { cache: 'no-store' }),
                fetch(`/api/fees${hostelQuery.replace('?', '?type=all&') || '?type=all'}`, { cache: 'no-store' }),
                fetch(`/api/mess-menu?type=${messHostelType}`, { cache: 'no-store' }),
                fetch(`/api/mess-timings?type=${messHostelType}`, { cache: 'no-store' }),
                fetch(`/api/lost-found${hostelQuery}`, { cache: 'no-store' }),
                fetch(`/api/messages${hostelQuery}`, { cache: 'no-store' })
            ]);
            const cData = await compRes.json();
            const oData = await outRes.json();
            const fData = await feeRes.json();
            const mData = await messRes.json();
            const tData = await timingsRes.json();
            const lData = await lostRes.json();
            const msgData = await msgRes.json();

            setComplaints(cData.complaints || cData);
            setOutpasses(oData);
            setFees(fData);
            if (mData && !mData.error) setMessMenu(mData);
            if (tData && !tData.error) setMessTimings(tData);
            setLostItems(lData);
            setMessages(msgData);
        } catch (e) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const uploadTimings = async () => {
        try {
            const res = await fetch(`/api/mess-timings?type=${messHostelType}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messTimings)
            });
            if (res.ok) {
                toast.success('Mess timings updated successfully!');
                setTimingsUploadSuccess(true);
                setTimeout(() => setTimingsUploadSuccess(false), 3000);
            } else {
                toast.error('Failed to update timings');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error updating timings');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'mess' && messSubTab === 'menu') {
            fetchData();
        }
    }, [messHostelType]);

    const updateComplaintStatus = async (id: string, status: 'in-progress' | 'resolved') => {
        try {
            const res = await fetch('/api/complaints', {
                method: 'PATCH',
                body: JSON.stringify({ id, status }),
            });
            if (res.ok) {
                toast.success(`Complaint marked as ${status}`);
                fetchData();
            }
        } catch (e) {
            toast.error('Failed to update status');
        }
    };

    const updateOutpassStatus = async (id: string, status: 'approved' | 'rejected' | 'expired') => {
        try {
            const res = await fetch('/api/outpass', {
                method: 'PATCH',
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                toast.success(`Outpass ${status}`);
                fetchData();
            }
        } catch (e) {
            toast.error('Failed to update outpass');
        }
    };

    const handleClearOutpassHistory = async () => {
        if (!confirm('Are you sure you want to clear ALL outpass history for this hostel? This action cannot be undone.')) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/outpass?hostelName=${user?.hostelName}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Hostel Outpass History Cleared');
                fetchData();
            }
        } catch (e) { toast.error('Clear Failed'); }
        setLoading(false);
    };

    const handleLostFoundStatusUpdate = async (id: string, status: 'found' | 'not-found' | 'returned', message?: string) => {
        setSubmittingStatusId(id);
        try {
            const res = await fetch('/api/lost-found', {
                method: 'PATCH',
                body: JSON.stringify({ id, status, adminMessage: message })
            });
            if (res.ok) {
                toast.success(`Item marked as ${status.replace('-', ' ')}`);
                setShowFoundModal(false);
                setUpdatingItemId(null);
                fetchData();
            } else {
                const error = await res.json();
                toast.error(error.error || 'Update Failed');
            }
        } catch (e) {
            toast.error('Update Failed');
        } finally {
            setSubmittingStatusId(null);
        }
    };

    const handleUpdateFee = async () => {
        if (!selectedFee) return;
        try {
            const res = await fetch('/api/fees', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'update',
                    ...selectedFee,
                    status: feeForm.status,
                    amountDue: feeForm.amountDue,
                    fineAmount: feeForm.fineAmount,
                    fineReason: feeForm.fineReason,
                    dueDate: feeForm.dueDate
                })
            });
            if (res.ok) {
                toast.success('Fee Status Updated');
                setSelectedFee(null);
                fetchData();
            }
        } catch (e) { toast.error('Update Failed'); }
    };

    const [newMessage, setNewMessage] = useState('');
    const [messageType, setMessageType] = useState<'info' | 'urgent' | 'Mess' | 'important'>('info');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleClearInbox = async () => {
        if (!confirm('Are you sure you want to clear all student messages? This action cannot be undone.')) return;
        try {
            const res = await fetch('/api/messages?role=student', { method: 'DELETE' });
            if (res.ok) {
                setMessages(prev => prev.filter(m => m.senderRole !== 'student'));
                toast.success('Inbox Cleared');
            } else {
                toast.error('Failed to clear inbox');
            }
        } catch (e) { toast.error('Error clearing inbox'); }
    };

    const handleDeleteHistory = async () => {
        if (!confirm('Are you sure you want to delete all sent messages? This action cannot be undone.')) return;
        try {
            const res = await fetch('/api/messages?role=admin', { method: 'DELETE' });
            if (res.ok) {
                setMessages(prev => prev.filter(m => m.senderRole !== 'admin'));
                toast.success('History Deleted');
            } else {
                toast.error('Failed to delete history');
            }
        } catch (e) { toast.error('Error deleting history'); }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            const tempId = Date.now().toString();
            const messageData: any = {
                id: tempId,
                message: newMessage,
                type: messageType,
                senderId: user?.id || 'admin',
                senderName: user?.name || 'Admin',
                senderRole: 'admin',
                targetHostels: user?.hostelName ? [user.hostelName] : [],
                timestamp: new Date().toISOString()
            };

            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });

            if (res.ok) {
                toast.success('Message Broadcasted');
                setNewMessage('');
                // Optimistic update
                setMessages(prev => [messageData, ...prev]);

                // Show submitted state
                setIsSubmitted(true);
                setTimeout(() => setIsSubmitted(false), 3000);
            } else {
                toast.error('Failed to send message');
            }
        } catch (e) { toast.error('Error sending message'); }
    };


    const filteredComplaints = filter === 'all' ? complaints : complaints.filter(c => c.type === filter);

    return (
        <>
            {/* Mobile Navigation Overlay */}
            {isMobileNavOpen && (
                <div className="fixed inset-0 z-50 md:hidden" onClick={() => setIsMobileNavOpen(false)}>
                    <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-black shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b dark:border-slate-800">
                            <h2 className="font-semibold text-lg">Navigation</h2>
                        </div>
                        <nav className="p-4 space-y-2">
                            <button onClick={() => { setActiveTab('complaints'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'complaints' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <AlertCircle className="w-5 h-5" />
                                <span>Complaints</span>
                            </button>
                            <button onClick={() => { setActiveTab('outpass'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'outpass' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <FileText className="w-5 h-5" />
                                <span>Outpass</span>
                            </button>
                            <button onClick={() => { setActiveTab('fees'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'fees' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <IndianRupee className="w-5 h-5" />
                                <span>Fees</span>
                            </button>
                            <button onClick={() => { setActiveTab('mess'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'mess' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <Utensils className="w-5 h-5" />
                                <span>Mess</span>
                            </button>
                            <button onClick={() => { setActiveTab('messages'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'messages' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <Send className="w-5 h-5" />
                                <span>Messages</span>
                            </button>
                            <button onClick={() => { setActiveTab('lost-found'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'lost-found' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <Search className="w-5 h-5" />
                                <span>Lost & Found</span>
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

            <div className="space-y-6 max-w-6xl mx-auto">
                <header className="mb-6 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMobileNavOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                Admin Dashboard
                                {user?.hostelName && (
                                    <span className="ml-3 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full align-middle">
                                        {user.hostelName}
                                    </span>
                                )}
                            </h1>
                            <p className="text-slate-500">Manage hostel operations</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowAbout(true)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                        <Info className="w-4 h-4 mr-2" />
                        About App
                    </Button>
                </header>

                {/* Tabs */}
                <div className="flex space-x-2 border-b border-slate-200 pb-4 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('complaints')}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'complaints' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Complaints Registered
                    </button>
                    <button
                        onClick={() => setActiveTab('outpass')}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'outpass' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Outpass Verification
                    </button>
                    <button
                        onClick={() => setActiveTab('fees')}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'fees' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <IndianRupee className="w-4 h-4 mr-2" />
                        Fee Pending
                    </button>
                    <button
                        onClick={() => setActiveTab('mess')}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'mess' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <Utensils className="w-4 h-4 mr-2" />
                        Mess Details
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'messages' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Messages
                    </button>
                    <button
                        onClick={() => setActiveTab('lost-found')}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'lost-found' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Lost & Found
                    </button>
                </div>

                {/* {loading && <p className="text-center py-10 text-slate-500">Loading dashboard data...</p>} */}

                {activeTab === 'complaints' && (
                    <div className="space-y-4">
                        <div className="flex justify-end space-x-2">
                            <select
                                className="border rounded-md px-3 py-1 text-sm bg-white dark:bg-black text-slate-900 dark:text-white border-slate-200 dark:border-slate-800"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                            >
                                <option value="all">All Types</option>
                                <option value="food">Food</option>
                                <option value="misc">Miscellaneous</option>
                            </select>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                    if (confirm('Are you sure you want to clear all complaints history for your hostel? This cannot be undone.')) {
                                        await fetch(`/api/complaints?hostelName=${user?.hostelName || ''}`, { method: 'DELETE' });
                                        toast.success('Complaints history cleared');
                                        fetchData();
                                    }
                                }}
                            >
                                Clear History
                            </Button>
                        </div>
                        <div className="grid gap-4">
                            {filteredComplaints.length === 0 ? <p className="text-center text-slate-500">No complaints found.</p> :
                                filteredComplaints.map(c => (
                                    <Card key={c.id}>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg">{c.title}</CardTitle>
                                                    <div className="flex space-x-2 mt-1">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${c.type === 'food' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}>{c.type}</span>
                                                        <CardDescription>{new Date(c.createdAt).toLocaleDateString()} • {c.studentName} ({c.studentId})</CardDescription>
                                                    </div>
                                                </div>
                                                <div className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${c.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : c.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                                    {c.status}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">{c.description}</p>
                                            {c.status !== 'resolved' && (
                                                <div className="flex space-x-2">
                                                    {c.status === 'pending' && <Button size="sm" variant="outline" onClick={() => updateComplaintStatus(c.id, 'in-progress')}>Mark In Progress</Button>}
                                                    <Button size="sm" onClick={() => updateComplaintStatus(c.id, 'resolved')}>Mark Resolved</Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            }
                        </div>
                    </div>
                )}

                {activeTab === 'outpass' && (
                    <div className="grid gap-4">
                        <div className="flex justify-end mb-2 space-x-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleClearOutpassHistory}
                                disabled={loading}
                            >
                                Clear History
                            </Button>
                            <Button
                                onClick={() => {
                                    const GIRLS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1fZpDraz__Bb--8rX5NktVQSJ6Y9fLiDoZ27YhHr1vr0/edit?usp=sharing';
                                    const BOYS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1AkuIj3I7BXB7k7gdp01aVjSET1M___j2cKesFo-7am4/edit?usp=sharing';

                                    const normalizedHostel = user?.hostelName?.toLowerCase().replace(/\s+/g, '') || '';
                                    const isGirlsHostel = normalizedHostel.includes('akshaya');

                                    window.open(isGirlsHostel ? GIRLS_SHEET_URL : BOYS_SHEET_URL, '_blank');
                                }}
                                variant="outline"
                                className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100"
                            >
                                <FileText className="w-4 h-4 mr-2" /> View Report
                            </Button>
                        </div>
                        {outpasses.length === 0 ? <p className="text-center text-slate-500">No outpass requests found.</p> :
                            outpasses.map(o => (
                                <Card key={o.id} className={o.status === 'pending' ? 'border-l-4 border-l-yellow-400' : ''}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle>{o.studentName}</CardTitle>
                                                <CardDescription>
                                                    {o.collegeName} • {o.yearAndDept} • Room {o.roomNumber}
                                                </CardDescription>
                                            </div>
                                            <div className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${o.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                o.status === 'exited' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                    o.status === 'entered' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                        o.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                            o.status === 'expired' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                }`}>
                                                {o.status}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Reason</p>
                                                <p className="font-medium dark:text-slate-100">{o.reason}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Duration</p>
                                                <p className="font-medium dark:text-slate-100">{o.fromDate} to {o.toDate}</p>
                                            </div>
                                        </div>

                                        {(o.status === 'approved' || o.status === 'exited' || o.status === 'entered') && (
                                            <div className="mt-4 flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded border dark:border-slate-700">
                                                <QRCode
                                                    value={JSON.stringify({
                                                        id: o.id,
                                                        student: o.studentName,
                                                        collegeName: o.collegeName,
                                                        hostelName: o.hostelName,
                                                        roomNumber: o.roomNumber,
                                                        reason: o.reason,
                                                        valid: `${o.fromDate} to ${o.toDate}`,
                                                        status: 'APPROVED'
                                                    })}
                                                    size={128}
                                                />
                                                <p className="text-xs text-slate-400 mt-2 font-mono">{o.id.slice(0, 8)}...</p>

                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="mt-4 w-full bg-red-50 hover:bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:border-red-900/50"
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to manually expire this outpass QR?')) {
                                                            updateOutpassStatus(o.id, 'expired');
                                                        }
                                                    }}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Expire QR Code
                                                </Button>
                                            </div>
                                        )}

                                        {o.status === 'pending' && (
                                            <div className="flex space-x-3">
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateOutpassStatus(o.id, 'approved')}>
                                                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => updateOutpassStatus(o.id, 'rejected')}>
                                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        }
                    </div>
                )}

                {activeTab === 'fees' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                    if (confirm('Are you sure you want to clear all pending fee requests for your hostel? This cannot be undone.')) {
                                        await fetch(`/api/fees?hostelName=${user?.hostelName || ''}`, { method: 'DELETE' });
                                        toast.success('Fee requests cleared');
                                        fetchData();
                                    }
                                }}
                            >
                                Clear History
                            </Button>
                        </div>
                        <div className="grid gap-4">
                            {fees.length === 0 ? <p className="text-center text-slate-500">No fee requests found.</p> :
                                fees.map(f => (
                                    <Card key={f.studentId}>
                                        <CardContent className="flex justify-between items-center p-6">
                                            <div>
                                                <h3 className="font-bold text-lg">{f.studentName}</h3>
                                                <p className="text-sm text-slate-500">Student ID: {f.studentId}</p>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold
                                                    ${f.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                            f.status === 'unpaid' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                                        {f.status === 'pending_request' ? 'Request In Review' : f.status}
                                                    </span>
                                                    <span className="text-xs text-slate-400">Last: {new Date(f.lastUpdated).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <Button onClick={() => {
                                                setSelectedFee(f);
                                                setFeeForm({
                                                    status: f.status === 'pending_request' ? 'paid' : f.status as any,
                                                    amountDue: f.amountDue?.toString() || '',
                                                    fineAmount: f.fineAmount?.toString() || '',
                                                    fineReason: f.fineReason || '',
                                                    dueDate: f.dueDate || ''
                                                });
                                            }}>
                                                Update Status
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
                            }
                        </div>
                    </div>
                )}



                {
                    activeTab === 'messages' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Messages</CardTitle>
                                <CardDescription>View messages from students and send broadcasts.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Send Message */}
                                    <div className="space-y-4 border-b pb-6">
                                        <h3 className="text-lg font-medium">Broadcast Message</h3>
                                        <div className="flex gap-2">
                                            <select
                                                className="flex h-10 rounded-md border border-slate-300 bg-white dark:bg-black dark:border-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={messageType}
                                                onChange={(e) => setMessageType(e.target.value as any)}
                                            >
                                                <option value="info">Info</option>
                                                <option value="urgent">Urgent</option>
                                                <option value="Mess">Mess</option>
                                                <option value="important">Important</option>
                                            </select>
                                            <Input
                                                placeholder="Type your message here..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                            />
                                            <Button onClick={handleSendMessage} disabled={isSubmitted}>
                                                <Send className="w-4 h-4 mr-2" />
                                                {isSubmitted ? 'Submitted' : 'Send'}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Message List */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-medium">Inbox</h3>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => {
                                                    fetchData();
                                                    toast.info('Inbox Refreshed');
                                                }}>
                                                    <Clock className="w-3 h-3 mr-1" /> Refresh
                                                </Button>
                                                {messages.filter(m => m.senderRole === 'student').length > 0 && (
                                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleClearInbox}>
                                                        <XCircle className="w-3 h-3 mr-1" /> Clear Inbox
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        {messages.filter(m => m.senderRole === 'student').length === 0 ? (
                                            <div className="text-center py-10 text-slate-500 bg-slate-50 dark:bg-black/50 rounded-lg">
                                                No messages from students
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {messages.filter(m => m.senderRole === 'student').map((msg) => (
                                                    <div key={msg.id} className="p-4 rounded-lg bg-white border shadow-sm dark:bg-black dark:border-slate-800">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                                    {msg.senderName}
                                                                    <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                                        {msg.hostelName}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-slate-500">
                                                                    {new Date(msg.timestamp).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-700 dark:text-slate-300">{msg.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Sent History */}
                                    <div className="space-y-4 border-t pt-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-medium">Sent History</h3>
                                            {messages.filter(m => m.senderRole === 'admin').length > 0 && (
                                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleDeleteHistory}>
                                                    <XCircle className="w-3 h-3 mr-1" /> Delete History
                                                </Button>
                                            )}
                                        </div>
                                        {messages.filter(m => m.senderRole === 'admin').length === 0 ? (
                                            <div className="text-center py-4 text-slate-500 text-sm">
                                                No messages sent yet
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {messages.filter(m => m.senderRole === 'admin').map((msg) => (
                                                    <div key={msg.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-800">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                                To: {msg.targetHostels && msg.targetHostels.length > 0 ? msg.targetHostels.join(', ') : 'All Students'}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400">
                                                                {new Date(msg.timestamp).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-700 dark:text-slate-300">{msg.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                }

                {
                    activeTab === 'mess' && (
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
                                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${messHostelType === 'boys' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            Boys Hostel Menu
                                        </button>
                                        <button
                                            onClick={() => setMessHostelType('girls')}
                                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${messHostelType === 'girls' ? 'bg-pink-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            Girls Hostel Menu
                                        </button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {messSubTab === 'menu' ? (
                                    <div className="space-y-4">
                                        <div className="overflow-x-auto border rounded-xl shadow-sm bg-white dark:bg-black">
                                            <table className="w-full text-xs sm:text-sm text-left border-collapse">
                                                <thead className="text-[10px] sm:text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/50 border-b">
                                                    <tr>
                                                        <th className="px-3 py-2 font-bold bg-slate-100 dark:bg-slate-800 whitespace-nowrap sticky left-0 z-20 border-r text-slate-700 dark:text-slate-100">Day / Meal</th>
                                                        {meals.map(meal => (
                                                            <th key={meal} className="px-3 py-2 font-bold min-w-[120px] border-r last:border-0 text-slate-700 dark:text-slate-100 capitalize">{meal}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {days.map((day, dayIndex) => (
                                                        <tr key={day} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                            <td className="px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border-r dark:border-slate-700 whitespace-nowrap sticky left-0 z-10 text-slate-900 dark:text-slate-100">
                                                                {day}
                                                            </td>
                                                            {meals.map((meal) => (
                                                                <td key={`${day}-${meal}`} className="px-2 py-2 border-r last:border-0">
                                                                    <Input
                                                                        value={messMenu[meal as keyof typeof messMenu][dayIndex]}
                                                                        onChange={(e) => handleMenuChange(meal, dayIndex, e.target.value)}
                                                                        className="h-8 text-xs bg-transparent border-transparent hover:border-slate-200 focus:bg-white dark:focus:bg-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-green-500 transition-all px-2"
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button onClick={uploadMenu} className={`${menuUploadSuccess ? 'bg-green-700' : 'bg-green-600'} hover:bg-green-700`}>
                                                {menuUploadSuccess ? (
                                                    <>
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Updated
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Upload Schedule
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ) : messSubTab === 'timings' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg">
                                                <h4 className="font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center"><Clock className="h-4 w-4 mr-2" /> Breakfast</h4>
                                                <Input
                                                    value={messTimings.breakfast}
                                                    onChange={(e) => setMessTimings({ ...messTimings, breakfast: e.target.value })}
                                                    className="text-lg font-bold text-slate-900 dark:text-white border-transparent hover:border-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:ring-1 focus:ring-green-500 transition-all"
                                                />
                                            </div>
                                            <div className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg">
                                                <h4 className="font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center"><Clock className="h-4 w-4 mr-2" /> Lunch</h4>
                                                <Input
                                                    value={messTimings.lunch}
                                                    onChange={(e) => setMessTimings({ ...messTimings, lunch: e.target.value })}
                                                    className="text-lg font-bold text-slate-900 dark:text-white border-transparent hover:border-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:ring-1 focus:ring-green-500 transition-all"
                                                />
                                            </div>
                                            <div className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg">
                                                <h4 className="font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center"><Clock className="h-4 w-4 mr-2" /> Snacks</h4>
                                                <Input
                                                    value={messTimings.snacks}
                                                    onChange={(e) => setMessTimings({ ...messTimings, snacks: e.target.value })}
                                                    className="text-lg font-bold text-slate-900 dark:text-white border-transparent hover:border-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:ring-1 focus:ring-green-500 transition-all"
                                                />
                                            </div>
                                            <div className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg">
                                                <h4 className="font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center"><Clock className="h-4 w-4 mr-2" /> Dinner</h4>
                                                <Input
                                                    value={messTimings.dinner}
                                                    onChange={(e) => setMessTimings({ ...messTimings, dinner: e.target.value })}
                                                    className="text-lg font-bold text-slate-900 dark:text-white border-transparent hover:border-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:ring-1 focus:ring-green-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button onClick={uploadTimings} className={`${timingsUploadSuccess ? 'bg-green-700' : 'bg-green-600'} hover:bg-green-700`}>
                                                {timingsUploadSuccess ? (
                                                    <>
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Updated
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Upload Timings
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ) : messSubTab === 'vending' ? (
                                    <div className="space-y-4">
                                        <div className="p-6 bg-white rounded-lg border">
                                            <h4 className="font-bold text-slate-900 text-lg mb-4">Update Vending Machine Status</h4>
                                            <div className="space-y-3">
                                                <label className="flex items-center p-3 border dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                                    <input
                                                        type="radio"
                                                        name="vendingStatus"
                                                        value="refilled"
                                                        checked={vendingStatus === 'refilled'}
                                                        onChange={(e) => setVendingStatus(e.target.value)}
                                                        className="w-4 h-4 text-green-600"
                                                    />
                                                    <span className="ml-3 flex-1">
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100">Refilled</span>
                                                        <span className="block text-sm text-slate-500 dark:text-slate-400">All vending machines are fully stocked</span>
                                                    </span>
                                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">OPERATIONAL</span>
                                                </label>
                                                <label className="flex items-center p-3 border dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                                    <input
                                                        type="radio"
                                                        name="vendingStatus"
                                                        value="not-filled"
                                                        checked={vendingStatus === 'not-filled'}
                                                        onChange={(e) => setVendingStatus(e.target.value)}
                                                        className="w-4 h-4 text-yellow-600"
                                                    />
                                                    <span className="ml-3 flex-1">
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100">Not Filled</span>
                                                        <span className="block text-sm text-slate-500 dark:text-slate-400">Stock is running low, needs refilling soon</span>
                                                    </span>
                                                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 text-xs font-bold rounded-full">LOW STOCK</span>
                                                </label>
                                                <label className="flex items-center p-3 border dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                                    <input
                                                        type="radio"
                                                        name="vendingStatus"
                                                        value="empty"
                                                        checked={vendingStatus === 'empty'}
                                                        onChange={(e) => setVendingStatus(e.target.value)}
                                                        className="w-4 h-4 text-red-600"
                                                    />
                                                    <span className="ml-3 flex-1">
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100">Empty</span>
                                                        <span className="block text-sm text-slate-500 dark:text-slate-400">Vending machines are out of stock</span>
                                                    </span>
                                                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold rounded-full">OUT OF STOCK</span>
                                                </label>
                                                <label className="flex items-center p-3 border dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                                    <input
                                                        type="radio"
                                                        name="vendingStatus"
                                                        value="server-error"
                                                        checked={vendingStatus === 'server-error'}
                                                        onChange={(e) => setVendingStatus(e.target.value)}
                                                        className="w-4 h-4 text-gray-600"
                                                    />
                                                    <span className="ml-3 flex-1">
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100">Server Error</span>
                                                        <span className="block text-sm text-slate-500 dark:text-slate-400">Vending machines are experiencing technical issues</span>
                                                    </span>
                                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-full">ERROR</span>
                                                </label>
                                            </div>
                                            <div className="flex justify-end mt-6">
                                                <Button
                                                    onClick={uploadVendingStatus}
                                                    className={`${uploadSuccess ? 'bg-green-700' : 'bg-green-600'} hover:bg-green-700`}
                                                >
                                                    {uploadSuccess ? (
                                                        <>
                                                            <Check className="w-4 h-4 mr-2" />
                                                            Updated
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-4 h-4 mr-2" />
                                                            Upload Status
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    )}

                {activeTab === 'lost-found' && (
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Lost & Found Reports</CardTitle>
                                    <CardDescription>All items reported within the hostels</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={async () => {
                                        if (confirm('Clear all lost & found history?')) {
                                            try {
                                                await fetch('/api/lost-found', { method: 'DELETE' });
                                                toast.success('History Cleared');
                                                fetchData();
                                            } catch (e) { toast.error('Failed to clear'); }
                                        }
                                    }}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Clear History
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {lostItems.length === 0 ? (
                                    <div className="col-span-full py-12 text-center text-slate-500">
                                        No items reported yet.
                                    </div>
                                ) : (
                                    lostItems.map((item) => (
                                        <div key={item.id} className="group relative border rounded-xl overflow-hidden bg-white dark:bg-black shadow-sm hover:shadow-md transition-all">
                                            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 group/image">
                                                {/* Image Display */}
                                                <div
                                                    className="w-full h-full cursor-pointer"
                                                    onClick={() => setSelectedImage((item.images && item.images.length > 0) ? item.images[imageIndices[item.id] || 0] : item.image || '')}
                                                >
                                                    <img
                                                        src={(item.images && item.images.length > 0) ? item.images[imageIndices[item.id] || 0] : item.image}
                                                        alt={item.productName}
                                                        className="w-full h-full object-cover transition-transform group-hover/image:scale-105"
                                                    />
                                                </div>

                                                {/* Image Counter Badge */}
                                                {item.images && item.images.length > 1 && (
                                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full flex items-center font-bold z-10 backdrop-blur-sm pointer-events-none">
                                                        {(imageIndices[item.id] || 0) + 1} / {item.images.length}
                                                    </div>
                                                )}

                                                {/* Navigation Buttons */}
                                                {item.images && item.images.length > 1 && (
                                                    <>
                                                        {/* Next Button (> Right Center) */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                const currentIndex = imageIndices[item.id] || 0;
                                                                const nextIndex = (currentIndex + 1) % item.images!.length;
                                                                setImageIndices(prev => ({ ...prev, [item.id]: nextIndex }));
                                                            }}
                                                            className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-1.5 rounded-full shadow-lg opacity-0 group-hover/image:opacity-100 transition-all transform hover:scale-110 z-20"
                                                        >
                                                            <ChevronRight className="w-5 h-5" />
                                                        </button>

                                                        {/* Prev Button (< Left Center - Optional but good UX) */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                const currentIndex = imageIndices[item.id] || 0;
                                                                const prevIndex = (currentIndex - 1 + item.images!.length) % item.images!.length;
                                                                setImageIndices(prev => ({ ...prev, [item.id]: prevIndex }));
                                                            }}
                                                            className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-1.5 rounded-full shadow-lg opacity-0 group-hover/image:opacity-100 transition-all transform hover:scale-110 z-20"
                                                        >
                                                            <ChevronLeft className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.productName}</h3>
                                                        <p className="text-[10px] text-slate-500 font-medium">{item.hostelName} • RM {item.roomNumber} • {item.studentName}</p>
                                                    </div>
                                                    <BadgeCheck className={`w-4 h-4 ${item.status === 'returned' ? 'text-green-500' : 'text-amber-500'}`} />
                                                </div>
                                                <div className="space-y-1 mb-4">
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                                        <span className="font-semibold">Clue:</span> {item.identification}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">
                                                        <Clock className="w-3 h-3 inline mr-1" /> {item.timeAndDate}
                                                    </p>
                                                </div>
                                                {(item.status === 'found' || item.status === 'not-found') ? (
                                                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-white/10 dark:bg-black/10 backdrop-blur-[0.5px]">
                                                        <div className={`border-[6px] border-double px-8 py-2 transform -rotate-12 -translate-y-8 rounded-xl font-black text-3xl uppercase tracking-widest opacity-90 shadow-sm ${item.status === 'found' ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}`}>
                                                            {item.status === 'found' ? 'FOUNDED' : 'UNFOUNDED'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs h-8 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100"
                                                            onClick={() => setSelectedLostItem(item)}
                                                        >
                                                            <Eye className="w-3 h-3 mr-1" /> View
                                                        </Button>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex-1 text-[10px] sm:text-xs h-8 border-green-200 text-green-700 hover:bg-green-50"
                                                                onClick={() => {
                                                                    setUpdatingItemId(item.id);
                                                                    setShowFoundModal(true);
                                                                }}
                                                                disabled={submittingStatusId === item.id}
                                                            >
                                                                {submittingStatusId === item.id ? '...' : 'Found'}
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex-1 text-[10px] sm:text-xs h-8 border-red-200 text-red-700 hover:bg-red-50"
                                                                onClick={() => handleLostFoundStatusUpdate(item.id, 'not-found', 'Contact Respective Warden')}
                                                                disabled={submittingStatusId === item.id}
                                                            >
                                                                {submittingStatusId === item.id ? '...' : 'Not Found'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}


                {/* Fee Update Modal */}
                {
                    selectedFee && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4">
                                <h3 className="text-lg font-bold">Update Fees: {selectedFee.studentName}</h3>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-slate-900">Status</label>
                                        <select
                                            className="w-full border rounded p-2 text-slate-900 dark:text-white bg-white dark:bg-black border-slate-200 dark:border-slate-700"
                                            value={feeForm.status}
                                            onChange={e => setFeeForm({ ...feeForm, status: e.target.value })}
                                        >
                                            <option value="paid">PAID</option>
                                            <option value="unpaid">UNPAID</option>
                                        </select>
                                    </div>

                                    {feeForm.status === 'unpaid' && (
                                        <>
                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-slate-600">Total Fee:</span>
                                                    <span className="font-bold text-slate-900">₹75,000</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Paid Amount (Calculated):</span>
                                                    <span className="font-bold text-green-700">
                                                        ₹{(75000 - (Number(feeForm.amountDue) || 0)).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-slate-900">Remaining Amount (₹)</label>
                                                <Input
                                                    type="number"
                                                    className="text-slate-900"
                                                    value={feeForm.amountDue}
                                                    onChange={e => setFeeForm({ ...feeForm, amountDue: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-slate-900">Fine Amount (if any)</label>
                                                    <Input
                                                        type="number"
                                                        placeholder="Amount"
                                                        className="text-slate-900"
                                                        value={feeForm.fineAmount}
                                                        onChange={e => setFeeForm({ ...feeForm, fineAmount: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-900">Reason for Fine</label>
                                                    <Input
                                                        placeholder="e.g. Late Fee"
                                                        className="text-slate-900"
                                                        value={feeForm.fineReason}
                                                        onChange={e => setFeeForm({ ...feeForm, fineReason: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-900">Due Date</label>
                                                <Input
                                                    type="date"
                                                    className="text-slate-900"
                                                    value={feeForm.dueDate}
                                                    onChange={e => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setSelectedFee(null)}>Cancel</Button>
                                    <Button onClick={handleUpdateFee}>Save Update</Button>
                                </div>
                            </div>
                        </div>
                    )
                }

                <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />

                {/* Found Message Modal */}
                {showFoundModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-sm">
                            <CardHeader>
                                <CardTitle>Mark as Found</CardTitle>
                                <CardDescription>Enter a message for the student to collect the item.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Collection Message</label>
                                    <textarea
                                        className="w-full min-h-[100px] p-3 text-sm rounded-lg border bg-white dark:bg-black focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g., Come and collect it on office room"
                                        value={foundMessage}
                                        onChange={(e) => setFoundMessage(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => setShowFoundModal(false)}>Cancel</Button>
                                    <Button className="flex-1" onClick={() => updatingItemId && handleLostFoundStatusUpdate(updatingItemId, 'found', foundMessage)}>Confirm</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Lost Found Detail Modal */}
                {selectedLostItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedLostItem(null)}>
                        <Card className="w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{selectedLostItem.productName}</CardTitle>
                                        <CardDescription>Reported by {selectedLostItem.studentName} ({selectedLostItem.hostelName} • RM {selectedLostItem.roomNumber})</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedLostItem(null)}>
                                        <XCircle className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {((selectedLostItem.images && selectedLostItem.images.length > 0) || selectedLostItem.image) && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {(selectedLostItem.images && selectedLostItem.images.length > 0) ? (
                                            selectedLostItem.images.map((img, idx) => (
                                                <div key={idx} className="aspect-video w-full rounded-lg border overflow-hidden bg-slate-50 cursor-pointer" onClick={() => setSelectedImage(img)}>
                                                    <img src={img} alt={`${selectedLostItem.productName} ${idx + 1}`} className="w-full h-full object-contain" />
                                                </div>
                                            ))
                                        ) : (
                                            selectedLostItem.image && (
                                                <div className="col-span-2 aspect-video w-full rounded-lg border overflow-hidden bg-slate-50 cursor-pointer" onClick={() => selectedLostItem.image && setSelectedImage(selectedLostItem.image)}>
                                                    <img src={selectedLostItem.image} alt={selectedLostItem.productName} className="w-full h-full object-contain" />
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="col-span-2">
                                        <p className="text-slate-500 text-[10px] uppercase font-bold">Identification Clue</p>
                                        <p className="font-medium p-2 bg-slate-50 dark:bg-slate-800 rounded mt-1">{selectedLostItem.identification}</p>
                                    </div>
                                    {selectedLostItem.adminMessage && (
                                        <div className="col-span-2">
                                            <p className="text-blue-500 text-[10px] uppercase font-bold">Admin Message</p>
                                            <p className="font-medium p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded mt-1 border border-blue-100 dark:border-blue-800">{selectedLostItem.adminMessage}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-slate-500 text-[10px] uppercase font-bold">Location/When</p>
                                        <p className="font-medium">{selectedLostItem.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-[10px] uppercase font-bold">Time & Date</p>
                                        <p className="font-medium">{selectedLostItem.timeAndDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-[10px] uppercase font-bold">Status</p>
                                        <p className="font-medium capitalize">{selectedLostItem.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-[10px] uppercase font-bold">Student ID</p>
                                        <p className="font-medium">{selectedLostItem.studentId}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Image Lightbox */}
                {selectedImage && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4" onClick={() => setSelectedImage(null)}>
                        <img src={selectedImage} alt="Full size" className="max-w-full max-h-full object-contain shadow-2xl" />
                        <button className="absolute top-6 right-6 text-white hover:scale-110 transition-transform" onClick={() => setSelectedImage(null)}>
                            <XCircle className="w-10 h-10 shadow-lg" />
                        </button>
                    </div>
                )}
            </div >
        </>);
}
