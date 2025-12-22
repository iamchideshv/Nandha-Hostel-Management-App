'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Complaint, Outpass, User, FeeStatus } from '@/lib/types';
import { AlertCircle, FileText, CheckCircle, XCircle, Clock, IndianRupee, Info, Utensils, Upload, Check } from 'lucide-react';
import QRCode from 'react-qr-code';
import { AboutModal } from '@/components/about-modal';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'mess' | 'complaints' | 'outpass' | 'fees'>('complaints');
    const [messSubTab, setMessSubTab] = useState<'menu' | 'timings' | 'vending' | 'messages'>('menu');

    // Data
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [outpasses, setOutpasses] = useState<Outpass[]>([]);
    const [fees, setFees] = useState<FeeStatus[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter for complaints
    // Filter for complaints
    const [filter, setFilter] = useState<'all' | 'food' | 'misc'>('all');

    // Fee Update State
    const [selectedFee, setSelectedFee] = useState<FeeStatus | null>(null);
    const [feeForm, setFeeForm] = useState({ status: 'paid', amountDue: '', fineAmount: '', fineReason: '', dueDate: '' });
    const [showAbout, setShowAbout] = useState(false);

    // Mess Menu State
    const [messMenu, setMessMenu] = useState({
        breakfast: Array(7).fill('Idli, Vada, Sambar'),
        lunch: Array(7).fill('Rice, Dal, Curd'),
        snacks: Array(7).fill('Tea, Biscuits'),
        dinner: Array(7).fill('Chapati, Veg Curry')
    });
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];

    // Vending Machine Status State
    const [vendingStatus, setVendingStatus] = useState('refilled');
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [menuUploadSuccess, setMenuUploadSuccess] = useState(false);

    // Messages State
    const [newMessage, setNewMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [sendingMessage, setSendingMessage] = useState(false);

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
                body: JSON.stringify(messMenu)
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

    const sendMessage = async () => {
        if (!newMessage.trim()) {
            toast.error('Please enter a message');
            return;
        }

        setSendingMessage(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: newMessage,
                    type: messageType
                })
            });

            if (res.ok) {
                toast.success('Message sent successfully!');
                setNewMessage('');
            } else {
                toast.error('Failed to send message');
            }
        } catch (error) {
            console.error('Send error:', error);
            toast.error('Error sending message');
        } finally {
            setSendingMessage(false);
        }
    };


    const fetchData = async () => {
        setLoading(true);
        try {
            const hostelQuery = user?.hostelName ? `?hostelName=${user.hostelName}` : '';
            const [compRes, outRes, feeRes] = await Promise.all([
                fetch(`/api/complaints${hostelQuery}`),
                fetch(`/api/outpass${hostelQuery}`),
                fetch(`/api/fees${hostelQuery.replace('?', '?type=all&') || '?type=all'}`) // Fee API handles params slightly differently
            ]);
            const cData = await compRes.json();
            const oData = await outRes.json();
            const fData = await feeRes.json();

            setComplaints(cData);
            setOutpasses(oData);
            setFees(fData);
        } catch (e) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    const filteredComplaints = filter === 'all' ? complaints : complaints.filter(c => c.type === filter);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <header className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Admin Dashboard
                        {user?.hostelName && (
                            <span className="ml-3 text-lg font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full align-middle">
                                {user.hostelName}
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500">Manage hostel operations</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowAbout(true)} className="text-slate-500 hover:text-black">
                    <Info className="w-4 h-4 mr-2" />
                    About App
                </Button>
            </header>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-slate-200 pb-4 mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('complaints')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'complaints' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Complaints Registered
                </button>
                <button
                    onClick={() => setActiveTab('outpass')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'outpass' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <FileText className="w-4 h-4 mr-2" />
                    Outpass Verification
                </button>
                <button
                    onClick={() => setActiveTab('fees')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'fees' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <IndianRupee className="w-4 h-4 mr-2" />
                    Fee Pending
                </button>
                <button
                    onClick={() => setActiveTab('mess')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'mess' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Utensils className="w-4 h-4 mr-2" />
                    Mess Details
                </button>
            </div>

            {loading && <p className="text-center py-10 text-slate-500">Loading dashboard data...</p>}

            {!loading && activeTab === 'complaints' && (
                <div className="space-y-4">
                    <div className="flex justify-end space-x-2">
                        <select
                            className="border rounded-md px-3 py-1 text-sm bg-white text-slate-900"
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
                                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${c.type === 'food' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-800'}`}>{c.type}</span>
                                                    <CardDescription>{new Date(c.createdAt).toLocaleDateString()} • {c.studentName} ({c.studentId})</CardDescription>
                                                </div>
                                            </div>
                                            <div className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${c.status === 'resolved' ? 'bg-green-100 text-green-700' : c.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {c.status}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-700 mb-4">{c.description}</p>
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

            {!loading && activeTab === 'outpass' && (
                <div className="grid gap-4">
                    <div className="flex justify-end mb-2">
                        <Button onClick={() => window.open('https://docs.google.com/spreadsheets/d/1AkuIj3I7BXB7k7gdp01aVjSET1M___j2cKesFo-7am4/edit?usp=sharing', '_blank')} variant="outline" className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100">
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
                                        <div className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${o.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            o.status === 'exited' ? 'bg-orange-100 text-orange-700' :
                                                o.status === 'entered' ? 'bg-blue-100 text-blue-700' :
                                                    o.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        o.status === 'expired' ? 'bg-slate-100 text-slate-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {o.status}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                        <div>
                                            <p className="text-slate-500">Reason</p>
                                            <p className="font-medium">{o.reason}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Duration</p>
                                            <p className="font-medium">{o.fromDate} to {o.toDate}</p>
                                        </div>
                                    </div>

                                    {(o.status === 'approved' || o.status === 'exited' || o.status === 'entered') && (
                                        <div className="mt-4 flex flex-col items-center p-4 bg-white rounded border">
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
                                                className="mt-4 w-full bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
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

            {!loading && activeTab === 'fees' && (
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
                                <Card key={f.studentId} className="bg-white">
                                    <CardContent className="flex justify-between items-center p-6">
                                        <div>
                                            <h3 className="font-bold text-lg">{f.studentName}</h3>
                                            <p className="text-sm text-slate-500">Student ID: {f.studentId}</p>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold
                                                    ${f.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                        f.status === 'unpaid' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
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

            {!loading && activeTab === 'mess' && (
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
                            <div className="space-y-4">
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 font-medium bg-slate-100 whitespace-nowrap sticky left-0 z-10">Day / Meal</th>
                                                {meals.map(meal => (
                                                    <th key={meal} className="px-4 py-3 font-medium min-w-[150px] capitalize">{meal}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {days.map((day, dayIndex) => (
                                                <tr key={day} className="border-b last:border-0 hover:bg-slate-50">
                                                    <td className="px-4 py-2 font-bold bg-slate-50 border-r whitespace-nowrap sticky left-0 z-10 text-slate-900">
                                                        {day}
                                                    </td>
                                                    {meals.map((meal) => (
                                                        <td key={`${day}-${meal}`} className="px-2 py-2 border-r last:border-0">
                                                            <Input
                                                                value={messMenu[meal as keyof typeof messMenu][dayIndex]}
                                                                onChange={(e) => handleMenuChange(meal, dayIndex, e.target.value)}
                                                                className="h-8 text-xs bg-transparent border-transparent hover:border-slate-200 focus:bg-white"
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
                                <div className="p-6 bg-white rounded-lg border">
                                    <h4 className="font-bold text-slate-900 text-lg mb-4">Update Vending Machine Status</h4>
                                    <div className="space-y-3">
                                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition">
                                            <input
                                                type="radio"
                                                name="vendingStatus"
                                                value="refilled"
                                                checked={vendingStatus === 'refilled'}
                                                onChange={(e) => setVendingStatus(e.target.value)}
                                                className="w-4 h-4 text-green-600"
                                            />
                                            <span className="ml-3 flex-1">
                                                <span className="font-semibold text-slate-900">Refilled</span>
                                                <span className="block text-sm text-slate-500">All vending machines are fully stocked</span>
                                            </span>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">OPERATIONAL</span>
                                        </label>
                                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition">
                                            <input
                                                type="radio"
                                                name="vendingStatus"
                                                value="not-filled"
                                                checked={vendingStatus === 'not-filled'}
                                                onChange={(e) => setVendingStatus(e.target.value)}
                                                className="w-4 h-4 text-yellow-600"
                                            />
                                            <span className="ml-3 flex-1">
                                                <span className="font-semibold text-slate-900">Not Filled</span>
                                                <span className="block text-sm text-slate-500">Stock is running low, needs refilling soon</span>
                                            </span>
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">LOW STOCK</span>
                                        </label>
                                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition">
                                            <input
                                                type="radio"
                                                name="vendingStatus"
                                                value="empty"
                                                checked={vendingStatus === 'empty'}
                                                onChange={(e) => setVendingStatus(e.target.value)}
                                                className="w-4 h-4 text-red-600"
                                            />
                                            <span className="ml-3 flex-1">
                                                <span className="font-semibold text-slate-900">Empty</span>
                                                <span className="block text-sm text-slate-500">Vending machines are out of stock</span>
                                            </span>
                                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">OUT OF STOCK</span>
                                        </label>
                                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition">
                                            <input
                                                type="radio"
                                                name="vendingStatus"
                                                value="server-error"
                                                checked={vendingStatus === 'server-error'}
                                                onChange={(e) => setVendingStatus(e.target.value)}
                                                className="w-4 h-4 text-gray-600"
                                            />
                                            <span className="ml-3 flex-1">
                                                <span className="font-semibold text-slate-900">Server Error</span>
                                                <span className="block text-sm text-slate-500">Vending machines are experiencing technical issues</span>
                                            </span>
                                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">ERROR</span>
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
                        ) : messSubTab === 'messages' ? (
                            <div className="space-y-4">
                                <div className="p-6 bg-white rounded-lg border">
                                    <h4 className="font-bold text-slate-900 text-lg mb-4">Send Message to Students</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Message Type</label>
                                            <div className="flex gap-3">
                                                <label className="flex items-center px-4 py-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                                                    <input
                                                        type="radio"
                                                        name="messageType"
                                                        value="info"
                                                        checked={messageType === 'info'}
                                                        onChange={(e) => setMessageType(e.target.value)}
                                                        className="w-4 h-4 text-blue-600"
                                                    />
                                                    <span className="ml-2 text-sm">Info</span>
                                                </label>
                                                <label className="flex items-center px-4 py-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                                                    <input
                                                        type="radio"
                                                        name="messageType"
                                                        value="important"
                                                        checked={messageType === 'important'}
                                                        onChange={(e) => setMessageType(e.target.value)}
                                                        className="w-4 h-4 text-yellow-600"
                                                    />
                                                    <span className="ml-2 text-sm">Important</span>
                                                </label>
                                                <label className="flex items-center px-4 py-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                                                    <input
                                                        type="radio"
                                                        name="messageType"
                                                        value="urgent"
                                                        checked={messageType === 'urgent'}
                                                        onChange={(e) => setMessageType(e.target.value)}
                                                        className="w-4 h-4 text-red-600"
                                                    />
                                                    <span className="ml-2 text-sm">Urgent</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                                            <textarea
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your message to students here..."
                                                className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                                                rows={4}
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <Button
                                                onClick={sendMessage}
                                                disabled={sendingMessage}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                {sendingMessage ? 'Sending...' : 'Send Message'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            )}

            {/* Fee Update Modal */}
            {selectedFee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4">
                        <h3 className="text-lg font-bold">Update Fees: {selectedFee.studentName}</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-slate-900">Status</label>
                                <select
                                    className="w-full border rounded p-2 text-slate-900 bg-white"
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
            )}

            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
        </div>
    );
}
