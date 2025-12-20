'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BadgeCheck, Clock, Utensils, AlertCircle, FileText, Send, Loader2, Info, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Complaint, Outpass } from '@/lib/types';
import { AboutModal } from '@/components/about-modal';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

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
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'mess' | 'complaints' | 'outpass' | 'fees'>('mess');
    const [messSubTab, setMessSubTab] = useState<'menu' | 'timings' | 'vending' | 'messages'>('menu');

    // Data states
    const [complaints, setComplaints] = useState<ComplaintData[]>([]);
    const [outpasses, setOutpasses] = useState<OutpassData[]>([]);
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
    const [messages, setMessages] = useState<any[]>([]);

    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        if (!user) return;
        setLoadingData(true);

        const fetchAndSet = async (url: string, setter: (data: any) => void, errorMsg: string) => {
            try {
                const res = await fetch(url);
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
                fetchAndSet(`/api/mess-menu`, setUploadedMenu, 'Menu fetch error'),
                fetchAndSet(`/api/vending-status`, setVendingStatus, 'Vending fetch error'),
                fetchAndSet(`/api/messages`, setMessages, 'Messages fetch error')
            ]);
        } catch (e) {
            toast.error('Some data failed to load');
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleComplaintSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/complaints', {
                method: 'POST',
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
        <div className="space-y-6 max-w-5xl mx-auto">
            <header className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-black" style={{ color: 'black' }}>Welcome, {user?.name}</h1>
                    <p className="text-slate-500">Student Dashboard • {user?.hostelName} • Room {user?.roomNumber}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowAbout(true)} className="text-slate-500 hover:text-black">
                    <Info className="w-4 h-4 mr-2" />
                    About App
                </Button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => setActiveTab('mess')} className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'mess' ? 'ring-2 ring-blue-600 border-transparent bg-blue-50' : 'bg-white hover:bg-slate-50'}`}>
                    <Utensils className="h-6 w-6 text-blue-600 mb-2" />
                    <h3 className="font-semibold text-slate-800">Mess Details</h3>
                </button>
                <button onClick={() => setActiveTab('complaints')} className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'complaints' ? 'ring-2 ring-blue-600 border-transparent bg-blue-50' : 'bg-white hover:bg-slate-50'}`}>
                    <AlertCircle className="h-6 w-6 text-orange-600 mb-2" />
                    <h3 className="font-semibold text-slate-800">Complaints</h3>
                </button>
                <button onClick={() => setActiveTab('outpass')} className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'outpass' ? 'ring-2 ring-blue-600 border-transparent bg-blue-50' : 'bg-white hover:bg-slate-50'}`}>
                    <FileText className="h-6 w-6 text-green-600 mb-2" />
                    <h3 className="font-semibold text-slate-800">Outpass</h3>
                </button>
                <div
                    onClick={() => setActiveTab('fees')}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${activeTab === 'fees' ? 'ring-2 ring-blue-600 border-transparent bg-blue-50' : 'bg-white hover:bg-slate-50'}`}
                >
                    <BadgeCheck className={`h-6 w-6 mb-2 ${feeStatus?.status === 'paid' ? 'text-green-600' : feeStatus?.status === 'unpaid' ? 'text-red-600' : 'text-slate-400'}`} />
                    <h3 className="font-semibold text-slate-800">Fees Status</h3>
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
                                            messSubTab === 'timings' ? 'Dining hall opening hours' :
                                                messSubTab === 'vending' ? 'Vending machine availability' : 'Important announcements'}
                                    </CardDescription>
                                </div>
                                <div className="bg-slate-100 p-1 rounded-lg flex space-x-1 self-start md:self-auto">
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
                                    <button
                                        onClick={() => setMessSubTab('messages')}
                                        className={`px-4 py-1.5 text-sm rounded-md transition-all ${messSubTab === 'messages' ? 'bg-green-600 text-white shadow' : 'bg-white text-black hover:bg-slate-50'}`}
                                    >
                                        Messages
                                    </button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {messSubTab === 'menu' ? (
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 font-medium bg-slate-100 whitespace-nowrap sticky left-0 z-10">Day / Meal</th>
                                                <th className="px-4 py-3 font-medium min-w-[150px] capitalize">breakfast</th>
                                                <th className="px-4 py-3 font-medium min-w-[150px] capitalize">lunch</th>
                                                <th className="px-4 py-3 font-medium min-w-[150px] capitalize">snacks</th>
                                                <th className="px-4 py-3 font-medium min-w-[150px] capitalize">dinner</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, dayIndex) => (
                                                <tr key={day} className="border-b last:border-0 hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-bold bg-slate-50 border-r whitespace-nowrap sticky left-0 z-10 text-slate-900">
                                                        {day}
                                                    </td>
                                                    <td className="px-4 py-3 border-r text-slate-600">
                                                        {uploadedMenu?.breakfast?.[dayIndex] || 'Idli, Vada, Sambar'}
                                                    </td>
                                                    <td className="px-4 py-3 border-r text-slate-600">
                                                        {uploadedMenu?.lunch?.[dayIndex] || 'Rice, Dal, Curd'}
                                                    </td>
                                                    <td className="px-4 py-3 border-r text-slate-600">
                                                        {uploadedMenu?.snacks?.[dayIndex] || 'Tea, Biscuits'}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {uploadedMenu?.dinner?.[dayIndex] || 'Chapati, Veg Curry'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : messSubTab === 'timings' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white border rounded-lg">
                                        <h4 className="font-semibold text-slate-600 mb-1 flex items-center"><Clock className="h-4 w-4 mr-2" /> Breakfast</h4>
                                        <p className="text-xl font-bold text-slate-900">7:30 AM - 9:00 AM</p>
                                    </div>
                                    <div className="p-4 bg-white border rounded-lg">
                                        <h4 className="font-semibold text-slate-600 mb-1 flex items-center"><Clock className="h-4 w-4 mr-2" /> Lunch</h4>
                                        <p className="text-xl font-bold text-slate-900">12:30 PM - 2:00 PM</p>
                                    </div>
                                    <div className="p-4 bg-white border rounded-lg">
                                        <h4 className="font-semibold text-slate-600 mb-1 flex items-center"><Clock className="h-4 w-4 mr-2" /> Snacks</h4>
                                        <p className="text-xl font-bold text-slate-900">4:30 PM - 5:30 PM</p>
                                    </div>
                                    <div className="p-4 bg-white border rounded-lg">
                                        <h4 className="font-semibold text-slate-600 mb-1 flex items-center"><Clock className="h-4 w-4 mr-2" /> Dinner</h4>
                                        <p className="text-xl font-bold text-slate-900">7:30 PM - 9:00 PM</p>
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
                            ) : messSubTab === 'messages' ? (
                                <div className="space-y-3">
                                    {messages.length > 0 ? (
                                        messages.map((msg: any) => (
                                            <div key={msg.id} className={`p-4 border-l-4 rounded ${msg.type === 'urgent' ? 'bg-red-50 border-red-500' :
                                                msg.type === 'important' ? 'bg-yellow-50 border-yellow-500' :
                                                    'bg-blue-50 border-blue-500'
                                                }`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className={`font-bold mb-1 ${msg.type === 'urgent' ? 'text-red-900' :
                                                            msg.type === 'important' ? 'text-yellow-900' :
                                                                'text-blue-900'
                                                            }`}>
                                                            {msg.type === 'urgent' ? '🔴 Urgent Message' :
                                                                msg.type === 'important' ? '⚠️ Important Notice' :
                                                                    'ℹ️ Information'}
                                                        </h4>
                                                        <p className={`text-sm ${msg.type === 'urgent' ? 'text-red-700' :
                                                            msg.type === 'important' ? 'text-yellow-700' :
                                                                'text-blue-700'
                                                            }`}>{msg.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-500">
                                            <p>No messages at this time</p>
                                        </div>
                                    )}
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
                                            value={outpassForm.collegeName}
                                            onChange={(e) => setOutpassForm({ ...outpassForm, collegeName: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Hostel Name</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
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
                            <CardHeader>
                                <CardTitle>History</CardTitle>
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
    );
}
