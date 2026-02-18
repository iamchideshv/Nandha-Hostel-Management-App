'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Complaint, Outpass, User, FeeStatus, Message, LostFound } from '@/lib/types';
import { AlertCircle, FileText, CheckCircle, XCircle, Clock, IndianRupee, Info, Utensils, Upload, Check, Send, Menu, LogOut, Home, Search, Eye, BadgeCheck, ChevronLeft, ChevronRight, Users, MoreVertical, UserCircle, Mail, Phone, MapPin, User as UserIcon, ClipboardList, Footprints, Thermometer, MessageSquare, RefreshCw, Trash2, RotateCw, ExternalLink } from 'lucide-react';
import QRCode from 'react-qr-code';
import { AboutModal } from '@/components/about-modal';
import { formatDate, formatTime } from '@/lib/formatters';
import { useNotifications } from '@/hooks/use-notifications';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyStateAnimation from '@/components/EmptyStateAnimation';
import travelerAnimation from '@/Traveler.json';
import moneyAnimation from '@/money.json';
import notFoundAnimation from '@/Not Found.json';
import { Haptics } from '@/lib/haptics';
import { ConfirmationModal } from '@/components/ConfirmationModal';



const COLLEGES = [
    { id: 'NEC', name: 'Nandha Engineering College', color: 'blue', icon: '🎓' },
    { id: 'NPC', name: 'Nandha Polytechnic College', color: 'orange', icon: '⚙️' },
    { id: 'NCT', name: 'Nandha College of Technology', color: 'green', icon: '💻' },
    { id: 'BAMS', name: 'Nandha Ayurveda College', color: 'emerald', icon: '🌿' },
    { id: 'NMC', name: 'Nandha Medical College', color: 'red', icon: '🏥' },
    { id: 'NDC', name: 'Nandha Dental College', color: 'purple', icon: '🦷' },
    { id: 'NCP', name: 'Nandha College of Pharmacy', color: 'pink', icon: '💊' },
    { id: 'NASC', name: 'Nandha Arts & Science College', color: 'sky', icon: '🎨' },
    { id: 'NCPT', name: 'Nandha College of Physiotherapy', color: 'cyan', icon: '🏃' },
    { id: 'NCN', name: 'Nandha College of Nursing', color: 'rose', icon: '👩‍⚕️' },
    { id: 'NCAHS', name: 'Nandha College of Allied Health Sciences', color: 'teal', icon: '🧪' },
    { id: 'NNYMC', name: 'Nandha Naturopathy and Yoga Medical College', color: 'lime', icon: '🧘' }
];

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    useNotifications();
    const [activeTab, setActiveTabState] = useState<'mess' | 'outpass' | 'fees' | 'messages' | 'lost-found' | 'student-details' | 'register' | null>(null);

    const setActiveTab = (tab: 'mess' | 'outpass' | 'fees' | 'messages' | 'lost-found' | 'student-details' | 'register' | null) => {
        if (tab) {
            window.history.pushState({ tab }, '', `#${tab}`);
            setActiveTabState(tab);
            // Fetch data for the specific tab being opened
            fetchData(tab);
        } else {
            setActiveTabState(null);
            // If there's a hash, we might want to clear it without a full reload or history push if possible, 
            // but the popstate listener usually handles this if the user uses the browser back button.
            if (window.location.hash) {
                // Instead of history.back(), which can leave the page, let's just clear the hash
                window.history.pushState(null, '', window.location.pathname);
            }
        }
    };

    // Sync state with history
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            // If we go back to a state with no hash or no tab data, close the tab
            if (!event.state?.tab) {
                setActiveTabState(null);
            } else {
                setActiveTabState(event.state.tab);
            }
        };

        // Handle initial load with hash
        const hash = window.location.hash.slice(1) as any;
        if (hash && ['mess', 'outpass', 'fees', 'messages', 'lost-found', 'student-details', 'register'].includes(hash)) {
            setActiveTabState(hash);
        }

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);
    const [messSubTab, setMessSubTab] = useState<'menu' | 'timings' | 'vending'>('menu');
    const [messHostelType, setMessHostelType] = useState<'boys' | 'girls'>('boys');
    const [registerSubTab, setRegisterSubTab] = useState<'main' | 'leave' | 'outing' | 'sick' | 'complaints'>('main');
    const [leaveCollegeFilter, setLeaveCollegeFilter] = useState<string | null>(null);
    const [outingCollegeFilter, setOutingCollegeFilter] = useState<string | null>(null);
    const [sickCollegeFilter, setSickCollegeFilter] = useState<string | null>(null);
    const [complaintCollegeFilter, setComplaintCollegeFilter] = useState<string | null>(null);

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Reset selection when changing tabs
    useEffect(() => {
        setSelectedIds(new Set());
        setIsSelectionMode(false);
    }, [registerSubTab, activeTab]);

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
        if (newSelected.size > 0) setIsSelectionMode(true);
        else setIsSelectionMode(false);
    };

    const handleSelectAll = (ids: string[]) => {
        if (selectedIds.size === ids.length) {
            setSelectedIds(new Set());
            setIsSelectionMode(false);
        } else {
            setSelectedIds(new Set(ids));
            setIsSelectionMode(true);
        }
    };

    const handleDeleteSelected = async () => {
        if (!confirm(`Delete ${selectedIds.size} items?`)) return;
        setLoading(true);
        try {
            const idsList = Array.from(selectedIds).join(',');
            const res = await fetch(`/api/outpass?ids=${idsList}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Deleted successfully');
                setSelectedIds(new Set());
                setIsSelectionMode(false);
                fetchData();
            } else {
                toast.error('Failed to delete');
            }
        } catch (e) { toast.error('Error deleting'); }
        setLoading(false);
    };


    // Data
    const [users, setUsers] = useState<User[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [outpasses, setOutpasses] = useState<Outpass[]>([]);
    const [fees, setFees] = useState<FeeStatus[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [lostItems, setLostItems] = useState<LostFound[]>([]);
    const [sickRegisters, setSickRegisters] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        variant: 'success' | 'destructive';
        onConfirm: () => Promise<void>;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        variant: 'success',
        onConfirm: async () => { }
    });

    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [viewingStudent, setViewingStudent] = useState<User | null>(null);

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

    // Private Message State
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [studentSearch, setStudentSearch] = useState('');

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

    const NotificationBadge = ({ count }: { count: number }) => {
        if (count <= 0) return null;
        return (
            <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white shadow-md animate-in zoom-in duration-300">
                {count > 9 ? '9+' : count}
            </div>
        );
    };

    const [lastViewed, setLastViewed] = useState<{ [key: string]: number }>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('admin_lastViewed');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    return {};
                }
            }
        }
        return {};
    });

    useEffect(() => {
        if (activeTab) {
            setLastViewed(prev => {
                const now = Date.now();
                const updated = { ...prev, [activeTab]: now };
                if (activeTab === 'register' && registerSubTab) {
                    updated[`register_${registerSubTab}`] = now;
                }

                // Save to localStorage immediately
                localStorage.setItem('admin_lastViewed', JSON.stringify(updated));
                return updated;
            });
        }
    }, [activeTab, registerSubTab]);

    const isNew = (timestamp: string | undefined, tab: string) => {
        if (!timestamp) return true;
        const time = new Date(timestamp).getTime();
        return time > (lastViewed[tab] || 0);
    };

    const pendingCounts = {
        outpass: outpasses.filter(o => o.status === 'pending' && isNew(o.createdAt, 'outpass')).length,
        fees: fees.filter(f => f.status === 'pending_request' && isNew(f.lastUpdated, 'fees')).length,
        messages: messages.filter(m => m.senderRole === 'student' && isNew(m.timestamp, 'messages')).length,
        lostFound: lostItems.filter(i => i.status === 'pending' && isNew(i.createdAt, 'lost-found')).length,
        register: (complaints.filter(c => c.status === 'pending' && isNew(c.createdAt, 'register_complaints')).length +
            sickRegisters.filter(s => s.status === 'pending' && isNew(s.createdAt, 'register_sick')).length +
            outpasses.filter(o => o.status === 'pending' && (o.type === 'leave' || o.type === 'outing') && isNew(o.createdAt, o.type === 'leave' ? 'register_leave' : 'register_outing')).length),
        leave: outpasses.filter(o => o.status === 'pending' && o.type === 'leave' && isNew(o.createdAt, 'register_leave')).length,
        outing: outpasses.filter(o => o.status === 'pending' && o.type === 'outing' && isNew(o.createdAt, 'register_outing')).length,
        sick: sickRegisters.filter(s => s.status === 'pending' && isNew(s.createdAt, 'register_sick')).length,
        complaints: complaints.filter(c => c.status === 'pending' && isNew(c.createdAt, 'register_complaints')).length
    };

    const getCollegePendingCount = (collegeId: string, type: 'leave' | 'outing' | 'sick' | 'complaints') => {
        const college = COLLEGES.find(c => c.id === collegeId);
        if (!college) return 0;

        switch (type) {
            case 'leave':
                return outpasses.filter(o =>
                    o.status === 'pending' &&
                    o.type === 'leave' &&
                    (o.collegeName === college.id || o.collegeName === college.name)
                ).length;
            case 'outing':
                return outpasses.filter(o =>
                    o.status === 'pending' &&
                    o.type === 'outing' &&
                    (o.collegeName === college.id || o.collegeName === college.name)
                ).length;
            case 'sick':
                return sickRegisters.filter(s =>
                    s.status === 'pending' &&
                    (s.collegeName === college.id || s.collegeName === college.name)
                ).length;
            case 'complaints':
                return complaints.filter(c =>
                    c.status === 'pending' &&
                    (c.collegeName === college.id || c.collegeName === college.name)
                ).length;
            default:
                return 0;
        }
    };

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

    const handlePushToSheet = async (outpass: Outpass) => {
        try {
            const res = await fetch('/api/push-register-record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outpass, adminName: user?.name || 'Admin' })
            });

            if (res.ok) {
                toast.success('Record pushed to Google Sheet successfully');
                fetchData();
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || 'Failed to push record');
            }
        } catch (error) {
            toast.error('Error pushing record');
        }
    };

    const handlePushComplaintToSheet = async (complaint: Complaint) => {
        try {
            const res = await fetch('/api/complaints/push-to-sheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ complaint, adminName: user?.name || 'Admin' })
            });

            if (res.ok) {
                toast.success('Complaint pushed to Google Sheet successfully');
                fetchData();
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || 'Failed to push complaint');
            }
        } catch (error) {
            toast.error('Error pushing complaint');
        }
    };

    const fetchData = async (tab?: string) => {
        setLoading(true);
        try {
            const hostelQuery = user?.hostelName ? `?hostelName=${user.hostelName}` : '';

            const fetchSafe = async (url: string) => {
                try {
                    const res = await fetch(url, { cache: 'no-store' });
                    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                    return await res.json();
                } catch (err) {
                    console.error(`Fetch error for ${url}:`, err);
                    return null;
                }
            };

            // Define which APIs to call based on the tab
            const needsComplaints = !tab || tab === 'register';
            const needsOutpass = !tab || tab === 'outpass' || tab === 'register';
            const needsFees = !tab || tab === 'fees';
            const needsMess = !tab || tab === 'mess';
            const needsLostFound = !tab || tab === 'lost-found';
            const needsMessages = !tab || tab === 'messages';
            const needsUsers = !tab || tab === 'student-details';
            const needsSick = !tab || tab === 'register';

            const promises = [];

            promises.push(needsComplaints ? fetchSafe(`/api/complaints${hostelQuery}`) : Promise.resolve(null));
            promises.push(needsOutpass ? fetchSafe(`/api/outpass${hostelQuery}`) : Promise.resolve(null));
            promises.push(needsFees ? fetchSafe(`/api/fees${hostelQuery.replace('?', '?type=all&') || '?type=all'}`) : Promise.resolve(null));

            if (needsMess) {
                promises.push(fetchSafe(`/api/mess-menu?type=${messHostelType}`));
                promises.push(fetchSafe(`/api/mess-timings?type=${messHostelType}`));
            } else {
                promises.push(Promise.resolve(null));
                promises.push(Promise.resolve(null));
            }

            promises.push(needsLostFound ? fetchSafe(`/api/lost-found${hostelQuery}`) : Promise.resolve(null));
            promises.push(needsMessages ? fetchSafe(`/api/messages${hostelQuery}`) : Promise.resolve(null));
            promises.push(needsUsers ? fetchSafe(`/api/users`) : Promise.resolve(null));
            promises.push(needsSick ? fetchSafe(`/api/sick-register${hostelQuery}`) : Promise.resolve(null));

            const results = await Promise.all(promises);

            if (needsComplaints && results[0]) setComplaints(results[0].complaints || results[0]);
            if (needsOutpass && results[1]) setOutpasses(results[1]);
            if (needsFees && results[2]) setFees(results[2]);
            if (needsMess) {
                if (results[3] && !results[3].error) setMessMenu(results[3]);
                if (results[4] && !results[4].error) setMessTimings(results[4]);
            }
            if (needsLostFound && results[5]) setLostItems(results[5]);
            if (needsMessages && results[6]) setMessages(results[6]);
            if (needsUsers && results[7]) setUsers(results[7]);
            if (needsSick && results[8]) setSickRegisters(results[8]);

            if (tab) toast.success(`${tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')} data refreshed`);
        } catch (e) {
            toast.error('Failed to load dashboard data');
            console.error('Critical Fetch error:', e);
        } finally {
            setLoading(false);
        }
    };

    const getStudentAvatar = (studentId: string) => {
        const student = users.find(u => u.id === studentId);
        if (student?.profileImage) {
            return (
                <img
                    src={student.profileImage}
                    alt={student.name}
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover shrink-0"
                />
            );
        }
        return (
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <UserIcon className="w-6 h-6" />
            </div>
        );
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

        // Close dropdown when clicking outside
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
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
            await fetch(`/api/outpass?hostelName=${user?.hostelName}&type=outpass`, { method: 'DELETE' });
            toast.success('Hostel Outpass History Cleared');
            fetchData();
        } catch (e) { toast.error('Clear Failed'); }
        setLoading(false);
    };

    const handleClearHistory = async (type: string, collegeName?: string) => {
        if (!confirm(`Are you sure you want to clear ${type} history for ${collegeName || 'all colleges'}? This action cannot be undone.`)) return;
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (user?.hostelName) queryParams.set('hostelName', user.hostelName);
            if (type) queryParams.set('type', type);
            if (collegeName) queryParams.set('collegeName', collegeName);

            const res = await fetch(`/api/outpass?${queryParams.toString()}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success(`${type} History Cleared`);
                fetchData();
            } else {
                toast.error('Clear Failed');
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

    const handleSendPrivateMessage = async (studentId: string) => {
        if (!replyMessage.trim()) return;
        try {
            const messageData: any = {
                message: replyMessage,
                type: 'important',
                senderId: user?.id || 'admin',
                senderName: user?.name || 'Admin',
                senderRole: 'admin',
                targetStudentId: studentId,
                timestamp: new Date().toISOString()
            };

            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });

            if (res.ok) {
                toast.success('Private message sent');
                setReplyMessage('');
                setReplyingTo(null);
                fetchData(); // Refresh to show new message in list or just rely on manual refresh
            } else {
                toast.error('Failed to send message');
            }
        } catch (e) { toast.error('Error sending private message'); }
    };

    const handleMarkAsCared = async (id: string) => {
        try {
            const res = await fetch('/api/sick-register/care', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, adminName: user?.name || 'Admin' })
            });

            if (res.ok) {
                toast.success('Marked as cared');
                fetchData();
            } else {
                toast.error('Failed to mark as cared');
            }
        } catch (e) {
            toast.error('Error marking as cared');
        }
    };

    const handlePushSickRegisterToSheet = async (entry: any) => {
        try {
            const res = await fetch('/api/sick-register/push-to-sheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entry, adminName: user?.name || 'Admin' })
            });

            if (res.ok) {
                toast.success('Record pushed to Google Sheet successfully');
                fetchData();
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || 'Failed to push record');
            }
        } catch (error) {
            toast.error('Error pushing record');
        }
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

                            <button onClick={() => { setActiveTab('outpass'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 relative ${activeTab === 'outpass' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <FileText className="w-5 h-5" />
                                <span className="flex-1">Outpass</span>
                                <NotificationBadge count={pendingCounts.outpass} />
                            </button>
                            <button onClick={() => { setActiveTab('fees'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 relative ${activeTab === 'fees' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <IndianRupee className="w-5 h-5" />
                                <span className="flex-1">Fees</span>
                                <NotificationBadge count={pendingCounts.fees} />
                            </button>
                            <button onClick={() => { setActiveTab('mess'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'mess' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <Utensils className="w-5 h-5" />
                                <span>Mess</span>
                            </button>
                            <button onClick={() => { setActiveTab('messages'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 relative ${activeTab === 'messages' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <Send className="w-5 h-5" />
                                <span className="flex-1">Messages</span>
                                <NotificationBadge count={pendingCounts.messages} />
                            </button>
                            <button onClick={() => { setActiveTab('lost-found'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 relative ${activeTab === 'lost-found' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <Search className="w-5 h-5" />
                                <span className="flex-1">Lost & Found</span>
                                <NotificationBadge count={pendingCounts.lostFound} />
                            </button>
                            <button onClick={() => { setActiveTab('student-details'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'student-details' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <Users className="w-5 h-5" />
                                <span>Student Details</span>
                            </button>
                            <button onClick={() => { setActiveTab('register'); setRegisterSubTab('main'); setIsMobileNavOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 relative ${activeTab === 'register' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <ClipboardList className="w-5 h-5" />
                                <span className="flex-1">Register</span>
                                <NotificationBadge count={pendingCounts.register} />
                            </button>
                        </nav>
                        <div className="p-4 border-t dark:border-slate-800 space-y-2">
                            <button onClick={() => { if (confirm('Go home yes or no?')) window.location.href = '/'; setIsMobileNavOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950">
                                <Home className="w-5 h-5" />
                                <span>Go to Home</span>
                            </button>
                            <button onClick={() => { if (confirm('Sign out yes or no?')) { logout(); window.location.href = '/login'; } setIsMobileNavOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
                                <LogOut className="w-5 h-5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-6 flex justify-between items-start gpu-accelerated"
                    style={{ transform: "translateZ(0)" }}
                >
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMobileNavOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </Button>
                        <div className="flex-1 md:flex-none">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1 md:hidden">
                                <UserIcon className="w-4 h-4" />
                                <span className="text-sm font-black uppercase tracking-widest">{user?.name}</span>
                            </div>
                            <h1 className="text-xl md:text-4xl font-black text-slate-900 dark:text-white flex flex-col md:flex-row md:items-center gap-1 md:gap-4 font-cinzel tracking-tight">
                                <span>Admin Dashboard</span>
                                {user?.hostelName && (
                                    <span className="text-[10px] md:text-xs font-black bg-blue-600 text-white px-4 py-1.5 rounded-full w-fit uppercase tracking-widest shadow-lg shadow-blue-500/20">
                                        {user.hostelName}
                                    </span>
                                )}
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-[0.2em] mt-1 hidden md:block opacity-70">Strategic Oversight & Operations</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchData()}
                            disabled={loading}
                            className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                            title="Refresh All Data"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden md:inline ml-2">Refresh</span>
                        </Button>
                        <div className="hidden md:flex items-center gap-2 text-slate-500 dark:text-slate-400 mr-4">
                            <UserIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">{user?.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setShowAbout(true)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                            <Info className="w-4 h-4 mr-2" />
                            <span className="hidden md:inline">About App</span>
                            <span className="md:hidden">About</span>
                        </Button>
                    </div>
                </motion.div>

                {/* Tabs */}
                {!activeTab ? (
                    /* Dashboard Grid - Only visible when no active tab */
                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.05,
                                    delayChildren: 0.1
                                }
                            }
                        }}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6"
                    >
                        <motion.button
                            variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab('outpass')}
                            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:shadow-lg group relative"
                        >
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Outpass</span>
                            <NotificationBadge count={pendingCounts.outpass} />
                        </motion.button>
                        <motion.button
                            variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab('fees')}
                            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:shadow-lg group relative"
                        >
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-3 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                                <IndianRupee className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Fees</span>
                            <NotificationBadge count={pendingCounts.fees} />
                        </motion.button>
                        <motion.button
                            variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab('mess')}
                            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-400 hover:shadow-lg group relative"
                        >
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-full mb-3 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                                <Utensils className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Mess</span>
                        </motion.button>
                        <motion.button
                            variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab('messages')}
                            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-400 hover:shadow-lg group relative"
                        >
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full mb-3 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                                <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Messages</span>
                            <NotificationBadge count={pendingCounts.messages} />
                        </motion.button>
                        <motion.button
                            variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab('lost-found')}
                            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:shadow-lg group relative"
                        >
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full mb-3 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
                                <Search className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Lost & Found</span>
                            <NotificationBadge count={pendingCounts.lostFound} />
                        </motion.button>
                        <motion.button
                            variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab('student-details')}
                            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:shadow-lg group relative"
                        >
                            <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-full mb-3 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30 transition-colors">
                                <Users className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Students</span>
                        </motion.button>
                        <motion.button
                            variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setActiveTab('register'); setRegisterSubTab('main'); }}
                            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:shadow-lg group relative"
                        >
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-3 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                                <ClipboardList className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Register</span>
                            <NotificationBadge count={pendingCounts.register} />
                        </motion.button>
                    </motion.div>
                ) : (
                    /* Detail View - Only visible when a tab is active */
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveTab(null)}
                                className="pl-0 hover:bg-transparent hover:text-blue-600 text-slate-500"
                            >
                                <ChevronLeft className="w-5 h-5 mr-1" />
                                Back to Dashboard
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchData(activeTab || undefined)}
                                disabled={loading}
                                className="h-8 gap-2 border-slate-200 dark:border-slate-800"
                            >
                                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                Refresh {activeTab?.charAt(0).toUpperCase()}{activeTab?.slice(1)}
                            </Button>
                        </div>


                        {/* {loading && <p className="text-center py-10 text-slate-500">Loading dashboard data...</p>} */}



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
                                {outpasses.filter(o => !o.type || o.type === 'outpass').length === 0 ? (
                                    <EmptyStateAnimation
                                        animationData={travelerAnimation}
                                        text="No outpass requests found."
                                        subtext="When students request an outpass, they will appear here."
                                    />
                                ) :
                                    outpasses.filter(o => !o.type || o.type === 'outpass').map(o => (
                                        <Card key={o.id} className={o.status === 'pending' ? 'border-l-4 border-l-yellow-400' : ''}>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-start gap-3">
                                                        {getStudentAvatar(o.studentId)}
                                                        <div>
                                                            <CardTitle>{o.studentName}</CardTitle>
                                                            <CardDescription>
                                                                {o.collegeName} • {o.yearAndDept} • Room {o.roomNumber}
                                                            </CardDescription>
                                                        </div>
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
                                                        <p className="font-medium dark:text-slate-100">{formatDate(o.fromDate)} to {formatDate(o.toDate)}</p>
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
                                                                valid: `${formatDate(o.fromDate)} to ${formatDate(o.toDate)}`,
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
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => {
                                                            setConfirmModal({
                                                                isOpen: true,
                                                                title: 'Approve Outpass',
                                                                message: `Are you sure you want to approve the outpass for ${o.studentName}?`,
                                                                confirmText: 'Approve',
                                                                variant: 'success',
                                                                onConfirm: async () => {
                                                                    await updateOutpassStatus(o.id, 'approved');
                                                                }
                                                            });
                                                        }}>
                                                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => {
                                                            setConfirmModal({
                                                                isOpen: true,
                                                                title: 'Reject Outpass',
                                                                message: `Are you sure you want to reject the outpass for ${o.studentName}?`,
                                                                confirmText: 'Reject',
                                                                variant: 'destructive',
                                                                onConfirm: async () => {
                                                                    await updateOutpassStatus(o.id, 'rejected');
                                                                }
                                                            });
                                                        }}>
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
                                    {fees.length === 0 ? (
                                        <EmptyStateAnimation
                                            animationData={moneyAnimation}
                                            text="No fee requests found."
                                            subtext="Student fee status requests will appear here."
                                        />
                                    ) :
                                        fees.map(f => (
                                            <Card key={f.studentId}>
                                                <CardContent className="flex justify-between items-center p-6">
                                                    <div className="flex items-center gap-3">
                                                        {getStudentAvatar(f.studentId)}
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

                        {activeTab === 'student-details' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Student Details</CardTitle>
                                    <CardDescription>All registered students {user?.hostelName ? `in ${user.hostelName}` : ''}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                placeholder="Search student by name or ID..."
                                                value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="rounded-md border dark:border-slate-800">
                                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium text-sm text-slate-500 dark:text-slate-400">
                                            <div className="col-span-3">User ID</div>
                                            <div className="col-span-3">Name</div>
                                            <div className="col-span-6">Messages</div>
                                        </div>
                                        <div className="divide-y dark:divide-slate-800">
                                            {users
                                                .filter(u => u.role === 'student')
                                                .filter(u => !user?.hostelName || u.hostelName === user.hostelName)
                                                .filter(u =>
                                                    u.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                                    u.id.toLowerCase().includes(studentSearch.toLowerCase())
                                                )
                                                .length === 0 ? (
                                                <div className="p-4 text-center text-slate-500">
                                                    {studentSearch ? `No students matching "${studentSearch}"` : 'No students found'}
                                                </div>
                                            ) : (
                                                users
                                                    .filter(u => u.role === 'student')
                                                    .filter(u => !user?.hostelName || u.hostelName === user.hostelName)
                                                    .filter(u =>
                                                        u.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                                        u.id.toLowerCase().includes(studentSearch.toLowerCase())
                                                    )
                                                    .map(student => {
                                                        const studentMessages = messages
                                                            .filter(m => m.senderId === student.id || m.targetStudentId === student.id)
                                                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                                                        const latestMsg = studentMessages[0];

                                                        return (
                                                            <div key={student.id} className="p-4 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                                <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center mb-2">
                                                                    <div className="hidden md:block col-span-3 font-mono text-xs">{student.id}</div>
                                                                    <div className="w-full md:col-span-3 font-medium flex items-center gap-3 md:gap-2">
                                                                        {getStudentAvatar(student.id)}
                                                                        <div className="flex flex-col md:block">
                                                                            <span>{student.name}</span>
                                                                            <span className="md:hidden text-xs font-mono text-slate-500">{student.id}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-full md:col-span-6">
                                                                        <div className="flex justify-between items-start gap-2">
                                                                            <div className="flex-1 min-w-0">
                                                                                {latestMsg ? (
                                                                                    <p className="truncate text-slate-600 dark:text-slate-400">
                                                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mr-1 ${latestMsg.senderRole === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                                                                            {latestMsg.senderRole === 'admin' ? 'You' : 'Student'}
                                                                                        </span>
                                                                                        {latestMsg.message}
                                                                                    </p>
                                                                                ) : <span className="text-slate-400 italic">No history</span>}
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                                    onClick={() => {
                                                                                        if (replyingTo === student.id) {
                                                                                            setReplyingTo(null);
                                                                                        } else {
                                                                                            setReplyingTo(student.id);
                                                                                            setReplyMessage('');
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <Send className="w-3 h-3 mr-1" />
                                                                                    Send Private
                                                                                </Button>

                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-6 px-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setViewingStudent(student);
                                                                                    }}
                                                                                >
                                                                                    <UserCircle className="w-3 h-3 mr-1" />
                                                                                    See Profile
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {replyingTo === student.id && (
                                                                    <div className="mt-3 pl-0 md:pl-[50%] animate-in slide-in-from-top-2 duration-200">
                                                                        <div className="flex gap-2">
                                                                            <Input
                                                                                autoFocus
                                                                                placeholder={`Message to ${student.name}...`}
                                                                                value={replyMessage}
                                                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                                                className="h-9"
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                                        e.preventDefault();
                                                                                        handleSendPrivateMessage(student.id);
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <Button size="sm" onClick={() => handleSendPrivateMessage(student.id)}>Send</Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
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
                                                                    <div className="flex items-center gap-2">
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
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 ml-auto"
                                                                            onClick={() => {
                                                                                if (replyingTo === msg.senderId) {
                                                                                    setReplyingTo(null);
                                                                                } else {
                                                                                    setReplyingTo(msg.senderId);
                                                                                    setReplyMessage('');
                                                                                }
                                                                            }}
                                                                        >
                                                                            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                                                            Reply
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                {msg.replyToId && (
                                                                    <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-md border-l-4 border-blue-500 text-xs">
                                                                        <p className="font-bold text-blue-600 mb-1">REPLIED TO A MESSAGE</p>
                                                                        <p className="text-slate-500 italic">"{msg.replyToMessage}"</p>
                                                                    </div>
                                                                )}
                                                                <p className="text-slate-700 dark:text-slate-300">{msg.message}</p>

                                                                {replyingTo === msg.senderId && (
                                                                    <div className="mt-4 pt-4 border-t dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
                                                                        <div className="flex gap-2">
                                                                            <Input
                                                                                autoFocus
                                                                                placeholder={`Reply to ${msg.senderName}...`}
                                                                                value={replyMessage}
                                                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                                                className="h-10"
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                                        e.preventDefault();
                                                                                        handleSendPrivateMessage(msg.senderId);
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <Button onClick={() => handleSendPrivateMessage(msg.senderId)}>
                                                                                <Send className="w-4 h-4 mr-2" />
                                                                                Send
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Sent History */}
                                            <div className="space-y-4 border-t pt-6">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-lg font-medium">Sent History</h3>
                                                    {messages.filter(m => m.senderRole !== 'student').length > 0 && (
                                                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleDeleteHistory}>
                                                            <XCircle className="w-3 h-3 mr-1" /> Delete History
                                                        </Button>
                                                    )}
                                                </div>
                                                {messages.filter(m => m.senderRole !== 'student').length === 0 ? (
                                                    <div className="text-center py-4 text-slate-500 text-sm">
                                                        No messages sent yet
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {messages.filter(m => m.senderRole !== 'student').map((msg) => (
                                                            <div key={msg.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-800">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                                        To: {msg.targetStudentId ? `Private (ID: ${msg.targetStudentId})` : (msg.targetHostels && msg.targetHostels.length > 0 ? msg.targetHostels.join(', ') : 'All Students')}
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
                                            <div className="col-span-full py-8">
                                                <EmptyStateAnimation
                                                    animationData={notFoundAnimation}
                                                    text="No items reported yet."
                                                    subtext="Lost or found items reported by students will appear here."
                                                />
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
                                                            <div className="flex flex-col">
                                                                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.productName}</h3>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {getStudentAvatar(item.studentId)}
                                                                    <p className="text-[10px] text-slate-500 font-medium">{item.hostelName} • RM {item.roomNumber} • {item.studentName}</p>
                                                                </div>
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

                        {/* Image Lightbox */}
                        {
                            selectedImage && (
                                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4" onClick={() => setSelectedImage(null)}>
                                    <img src={selectedImage} alt="Full size" className="max-w-full max-h-full object-contain shadow-2xl" />
                                    <button className="absolute top-6 right-6 text-white hover:scale-110 transition-transform" onClick={() => setSelectedImage(null)}>
                                        <XCircle className="w-10 h-10 shadow-lg" />
                                    </button>
                                </div>
                            )
                        }


                        {/* Private Message Modal */}
                        {
                            replyingTo && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setReplyingTo(null)}>
                                    <Card className="w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle>Send Private Message</CardTitle>
                                                <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                                                    <XCircle className="w-5 h-5 text-slate-400" />
                                                </Button>
                                            </div>
                                            <CardDescription>To Student: {users.find(u => u.id === replyingTo)?.name || replyingTo}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Message</label>
                                                <textarea
                                                    className="w-full min-h-[120px] p-3 text-sm rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                    placeholder="Type your message here..."
                                                    value={replyMessage}
                                                    onChange={(e) => setReplyMessage(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <Button variant="outline" className="flex-1" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                                <Button
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                                    onClick={() => handleSendPrivateMessage(replyingTo)}
                                                >
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Send Message
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )
                        }
                        {/* Student Profile View Modal */}
                        {
                            viewingStudent && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto" onClick={() => setViewingStudent(null)}>
                                    <Card className="w-full max-w-lg shadow-2xl border-none animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                                        <CardHeader className="relative pb-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-4 top-4 rounded-full h-8 w-8 p-0"
                                                onClick={() => setViewingStudent(null)}
                                            >
                                                <XCircle className="w-5 h-5 text-slate-400" />
                                            </Button>
                                            <div className="flex flex-col items-center pt-4">
                                                <div className="relative group">
                                                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center">
                                                        {viewingStudent.profileImage ? (
                                                            <img
                                                                src={viewingStudent.profileImage}
                                                                alt={viewingStudent.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <UserIcon className="w-12 h-12 text-slate-300" />
                                                        )}
                                                    </div>
                                                </div>
                                                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{viewingStudent.name}</h2>
                                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full mt-2">
                                                    Student ID: {viewingStudent.id}
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-8 pb-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5 leading-none">
                                                        <Home className="w-3 h-3" /> Hostel Details
                                                    </p>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                        {viewingStudent.hostelName || 'Not Assigned'}
                                                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                        Room {viewingStudent.roomNumber || 'N/A'}
                                                    </p>
                                                </div>

                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5 leading-none">
                                                        <BadgeCheck className="w-3 h-3" /> Department
                                                    </p>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                                        {viewingStudent.department || 'Not Specified'}
                                                    </p>
                                                </div>

                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5 leading-none">
                                                        <Phone className="w-3 h-3" /> Contact Number
                                                    </p>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {viewingStudent.phoneNumber || 'No phone added'}
                                                    </p>
                                                </div>

                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5 leading-none">
                                                        <Mail className="w-3 h-3" /> Email Address
                                                    </p>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                                        {viewingStudent.email || 'No email added'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-8 pt-6 border-t dark:border-slate-800">
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-center"
                                                    onClick={() => setViewingStudent(null)}
                                                >
                                                    Close Profile
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )
                        }


                        {
                            activeTab === 'register' && (
                                <div className="space-y-6">
                                    {registerSubTab === 'main' && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="border bg-white dark:bg-slate-950 rounded-lg p-6 hover:shadow-lg transition-all border-l-4 border-l-orange-500">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                                        <LogOut className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="font-bold text-lg">Leave Register</h3>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                                    Manage student leave records
                                                </p>
                                                <div className="relative w-full">
                                                    <Button onClick={() => setRegisterSubTab('leave')} className="w-full bg-orange-600 hover:bg-orange-700">View Register</Button>
                                                    <NotificationBadge count={pendingCounts.leave} />
                                                </div>
                                            </div>

                                            <div className="border bg-white dark:bg-slate-950 rounded-lg p-6 hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                        <Footprints className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="font-bold text-lg">Outing Register</h3>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                                    Track daily outings
                                                </p>
                                                <div className="relative w-full">
                                                    <Button onClick={() => setRegisterSubTab('outing')} className="w-full bg-blue-600 hover:bg-blue-700">View Register</Button>
                                                    <NotificationBadge count={pendingCounts.outing} />
                                                </div>
                                            </div>

                                            <div className="border bg-white dark:bg-slate-950 rounded-lg p-6 hover:shadow-lg transition-all border-l-4 border-l-red-500">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                                        <Thermometer className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="font-bold text-lg">Sick Register</h3>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                                    Medical emergency logs
                                                </p>
                                                <div className="relative w-full">
                                                    <Button onClick={() => setRegisterSubTab('sick')} className="w-full bg-red-600 hover:bg-red-700">View Register</Button>
                                                    <NotificationBadge count={pendingCounts.sick} />
                                                </div>
                                            </div>

                                            <div className="border bg-white dark:bg-slate-950 rounded-lg p-6 hover:shadow-lg transition-all border-l-4 border-l-purple-500">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                                        <AlertCircle className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="font-bold text-lg">Complaint Register</h3>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                                    View and manage student complaints
                                                </p>
                                                <div className="relative w-full">
                                                    <Button onClick={() => setRegisterSubTab('complaints')} className="w-full bg-purple-600 hover:bg-purple-700">View Register</Button>
                                                    <NotificationBadge count={pendingCounts.complaints} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {registerSubTab !== 'main' && (
                                        <Card className="animate-in fade-in slide-in-from-right-4 duration-300 gpu-accelerated">
                                            <CardHeader className="flex flex-row items-center gap-4 border-b dark:border-slate-800 pb-4 mb-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (leaveCollegeFilter) setLeaveCollegeFilter(null);
                                                        else if (outingCollegeFilter) setOutingCollegeFilter(null);
                                                        else if (sickCollegeFilter) setSickCollegeFilter(null);
                                                        else if (complaintCollegeFilter) setComplaintCollegeFilter(null);
                                                        else setRegisterSubTab('main');
                                                    }}
                                                    className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full h-10 w-10 p-0 flex items-center justify-center"
                                                >
                                                    <ChevronLeft className="w-6 h-6" />
                                                </Button>
                                                <div>
                                                    <CardTitle className="capitalize text-2xl">{registerSubTab} Register</CardTitle>
                                                    <CardDescription>
                                                        {registerSubTab === 'leave' ? 'Consolidated view of student leave records' :
                                                            registerSubTab === 'outing' ? 'Real-time log of student exits and entries' :
                                                                registerSubTab === 'sick' ? 'Medical alerts and sick list' :
                                                                    'View and manage all student complaints'}
                                                    </CardDescription>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {registerSubTab === 'leave' && (
                                                    <div className="space-y-6">
                                                        {!leaveCollegeFilter ? (
                                                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 gpu-accelerated">
                                                                <div className="text-center space-y-2">
                                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Institution Support</h3>
                                                                    <p className="text-sm text-slate-500 dark:text-slate-400">Select a college to view consolidated leave records</p>
                                                                </div>
                                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                                    {COLLEGES.map((col) => (
                                                                        <button
                                                                            key={col.id}
                                                                            onClick={() => setLeaveCollegeFilter(col.id)}
                                                                            className={`group relative p-6 rounded-2xl border-2 transition-all hover:shadow-xl active:scale-95 flex flex-col items-center text-center gap-3
                                                                    ${col.color === 'blue' ? 'border-blue-100 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50' :
                                                                                    col.color === 'orange' ? 'border-orange-100 hover:border-orange-500 bg-orange-50/50 hover:bg-orange-50' :
                                                                                        col.color === 'green' ? 'border-green-100 hover:border-green-500 bg-green-50/50 hover:bg-green-50' :
                                                                                            col.color === 'emerald' ? 'border-emerald-100 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50' :
                                                                                                col.color === 'red' ? 'border-red-100 hover:border-red-500 bg-red-50/50 hover:bg-red-50' :
                                                                                                    col.color === 'pink' ? 'border-pink-100 hover:border-pink-500 bg-pink-50/50 hover:bg-pink-50' :
                                                                                                        col.color === 'sky' ? 'border-sky-100 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50' :
                                                                                                            col.color === 'cyan' ? 'border-cyan-100 hover:border-cyan-500 bg-cyan-50/50 hover:bg-cyan-50' :
                                                                                                                col.color === 'rose' ? 'border-rose-100 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-50' :
                                                                                                                    col.color === 'teal' ? 'border-teal-100 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50' :
                                                                                                                        col.color === 'lime' ? 'border-lime-100 hover:border-lime-500 bg-lime-50/50 hover:bg-lime-50' :
                                                                                                                            'border-purple-100 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50'}`}
                                                                        >
                                                                            <NotificationBadge count={getCollegePendingCount(col.id, 'leave')} />
                                                                            <div className={`text-4xl mb-1 group-hover:scale-110 transition-transform`}>{col.icon}</div>
                                                                            <div className="space-y-1">
                                                                                <span className={`text-lg font-black tracking-tighter
                                                                        ${col.color === 'blue' ? 'text-blue-700' :
                                                                                        col.color === 'orange' ? 'text-orange-700' :
                                                                                            col.color === 'green' ? 'text-green-700' :
                                                                                                col.color === 'emerald' ? 'text-emerald-700' :
                                                                                                    col.color === 'red' ? 'text-red-700' :
                                                                                                        col.color === 'pink' ? 'text-pink-700' :
                                                                                                            col.color === 'sky' ? 'text-sky-700' :
                                                                                                                col.color === 'cyan' ? 'text-cyan-700' :
                                                                                                                    col.color === 'rose' ? 'text-rose-700' :
                                                                                                                        col.color === 'teal' ? 'text-teal-700' :
                                                                                                                            col.color === 'lime' ? 'text-lime-700' :
                                                                                                                                'text-purple-700'}`}>{col.id}</span>
                                                                                <p className="text-[10px] leading-tight font-medium text-slate-500 dark:text-slate-400 line-clamp-1">{col.name}</p>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 gpu-accelerated">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shrink-0
                                                                ${leaveCollegeFilter === 'NEC' ? 'bg-blue-600' :
                                                                                leaveCollegeFilter === 'NPC' ? 'bg-orange-600' :
                                                                                    leaveCollegeFilter === 'NCT' ? 'bg-green-600' :
                                                                                        leaveCollegeFilter === 'BAMS' ? 'bg-emerald-600' :
                                                                                            leaveCollegeFilter === 'NMC' ? 'bg-red-600' :
                                                                                                leaveCollegeFilter === 'NCP' ? 'bg-pink-600' :
                                                                                                    leaveCollegeFilter === 'NASC' ? 'bg-sky-600' :
                                                                                                        leaveCollegeFilter === 'NCPT' ? 'bg-cyan-600' :
                                                                                                            leaveCollegeFilter === 'NCN' ? 'bg-rose-600' :
                                                                                                                leaveCollegeFilter === 'NCAHS' ? 'bg-teal-600' :
                                                                                                                    leaveCollegeFilter === 'NNYMC' ? 'bg-lime-600' :
                                                                                                                        'bg-purple-600'}`}>
                                                                            {leaveCollegeFilter}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Institution</p>
                                                                            <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                                                                {leaveCollegeFilter === 'NEC' ? 'Nandha Engineering College' :
                                                                                    leaveCollegeFilter === 'NPC' ? 'Nandha Polytechnic College' :
                                                                                        leaveCollegeFilter === 'NCT' ? 'Nandha College of Technology' :
                                                                                            leaveCollegeFilter === 'BAMS' ? 'Nandha Ayurveda College' :
                                                                                                leaveCollegeFilter === 'NMC' ? 'Nandha Medical College' :
                                                                                                    leaveCollegeFilter === 'NCP' ? 'Nandha College of Pharmacy' :
                                                                                                        leaveCollegeFilter === 'NASC' ? 'Nandha Arts & Science College' :
                                                                                                            leaveCollegeFilter === 'NCPT' ? 'Nandha College of Physiotherapy' :
                                                                                                                leaveCollegeFilter === 'NCN' ? 'Nandha College of Nursing' :
                                                                                                                    leaveCollegeFilter === 'NCAHS' ? 'Nandha College of Allied Health Sciences' :
                                                                                                                        leaveCollegeFilter === 'NNYMC' ? 'Nandha Naturopathy and Yoga Medical College' :
                                                                                                                            'Nandha Dental College'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-3">
                                                                        <div className="flex items-center gap-2 pr-2 border-r dark:border-slate-800">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0 rounded-full"
                                                                                onClick={() => {
                                                                                    toast.promise(fetchData(), {
                                                                                        loading: 'Refreshing...',
                                                                                        success: 'Refreshed',
                                                                                        error: 'Failed to refresh'
                                                                                    });
                                                                                }}
                                                                            >
                                                                                <RefreshCw className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            {selectedIds.size > 0 && (
                                                                                <Button
                                                                                    variant="destructive"
                                                                                    size="sm"
                                                                                    onClick={handleDeleteSelected}
                                                                                    className="animate-in fade-in zoom-in h-8"
                                                                                >
                                                                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                                                                    Delete ({selectedIds.size})
                                                                                </Button>
                                                                            )}
                                                                            {outpasses.filter(o => (o.type === 'leave' || o.reason.toLowerCase().includes('leave') || o.reason.toLowerCase().includes('vacation')) && (o.collegeName === leaveCollegeFilter || o.collegeName === COLLEGES.find(c => c.id === leaveCollegeFilter)?.name)).length > 0 && (
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-8 text-[10px] font-bold uppercase text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                                    onClick={() => handleClearHistory('leave', leaveCollegeFilter!)}
                                                                                >
                                                                                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                                                                    Clear History
                                                                                </Button>
                                                                            )}
                                                                            <Button
                                                                                onClick={() => {
                                                                                    const GIRLS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1ibukV7nGbO8B6WBxVVdOzB5Cv9bfqKQhRDDzPsWYUa0/edit?usp=sharing';
                                                                                    const BOYS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/14T2A_oGScAAbDR08P8GFjnFxZOZgisFebK3UproeaqE/edit?usp=sharing';

                                                                                    const normalizedHostel = user?.hostelName?.toLowerCase().replace(/\s+/g, '') || '';
                                                                                    const isGirlsHostel = normalizedHostel.includes('akshaya');

                                                                                    window.open(isGirlsHostel ? GIRLS_SHEET_URL : BOYS_SHEET_URL, '_blank');
                                                                                }}
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8 text-[10px] font-bold uppercase text-green-600 border-green-200 bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900"
                                                                            >
                                                                                <FileText className="w-3.5 h-3.5 mr-1.5" /> View Report
                                                                            </Button>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {outpasses.filter(o =>
                                                                    (o.type === 'leave' || o.reason.toLowerCase().includes('leave') || o.reason.toLowerCase().includes('vacation')) &&
                                                                    (o.collegeName === leaveCollegeFilter || o.collegeName === COLLEGES.find(c => c.id === leaveCollegeFilter)?.name) && !o.inTimeConfirmed
                                                                ).length === 0 ? (
                                                                    <div className="p-12 text-center text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed">
                                                                        No leave records found for {leaveCollegeFilter}.
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-3">
                                                                        {outpasses.filter(o =>
                                                                            (o.type === 'leave' || o.reason.toLowerCase().includes('leave') || o.reason.toLowerCase().includes('vacation')) &&
                                                                            (o.collegeName === leaveCollegeFilter || o.collegeName === COLLEGES.find(c => c.id === leaveCollegeFilter)?.name) && !o.inTimeConfirmed
                                                                        ).map(o => (
                                                                            <div
                                                                                key={o.id}
                                                                                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all
                                                                        ${selectedIds.has(o.id)
                                                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-500'
                                                                                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}`}
                                                                                onContextMenu={(e) => {
                                                                                    e.preventDefault();
                                                                                    toggleSelection(o.id);
                                                                                }}
                                                                                onClick={() => isSelectionMode && toggleSelection(o.id)}
                                                                            >
                                                                                <div className="flex items-center gap-4 flex-1">
                                                                                    {isSelectionMode && (
                                                                                        <div className="shrink-0">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={selectedIds.has(o.id)}
                                                                                                onChange={() => toggleSelection(o.id)}
                                                                                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 animate-in fade-in zoom-in duration-200"
                                                                                            />
                                                                                        </div>
                                                                                    )}
                                                                                    {getStudentAvatar(o.studentId)}
                                                                                    <div className="min-w-0">
                                                                                        <p className="font-bold text-slate-900 dark:text-white truncate">{o.studentName}</p>
                                                                                        <p className="text-xs text-slate-500 font-medium truncate">Reason: {o.reason}</p>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                                                                    <div className="flex items-center gap-2">
                                                                                        {!o.inTimeConfirmed ? (
                                                                                            <div className="flex gap-1.5">
                                                                                                <Button
                                                                                                    size="sm"
                                                                                                    variant="outline"
                                                                                                    className="h-8 w-8 p-0 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
                                                                                                    onClick={() => {
                                                                                                        setReplyingTo(o.studentId);
                                                                                                        setReplyMessage(`Hi ${o.studentName}, you haven't confirmed your return for the leave starting on ${formatDate(o.fromDate)}. Please update your in-time.`);
                                                                                                    }}
                                                                                                >
                                                                                                    <MessageSquare className="w-4 h-4" />
                                                                                                </Button>
                                                                                                {users.find(u => u.id === o.studentId)?.phoneNumber && (
                                                                                                    <a
                                                                                                        href={`tel:${users.find(u => u.id === o.studentId)?.phoneNumber}`}
                                                                                                        className="h-8 w-8 rounded-full border border-green-200 text-green-600 hover:bg-green-50 flex items-center justify-center transition-colors shadow-sm"
                                                                                                    >
                                                                                                        <Phone className="w-3.5 h-3.5" />
                                                                                                    </a>
                                                                                                )}
                                                                                            </div>
                                                                                        ) : (
                                                                                            !o.pushedToSheet ? (
                                                                                                <Button
                                                                                                    size="sm"
                                                                                                    variant="outline"
                                                                                                    className="text-[10px] h-7 px-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold uppercase transition-all shadow-sm"
                                                                                                    onClick={() => handlePushToSheet(o)}
                                                                                                >
                                                                                                    <Upload className="w-3 h-3 mr-1" />
                                                                                                    Push
                                                                                                </Button>
                                                                                            ) : (
                                                                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase shadow-sm whitespace-nowrap">
                                                                                                    <BadgeCheck className="w-3.5 h-3.5" />
                                                                                                    Pushed
                                                                                                </div>
                                                                                            )
                                                                                        )}
                                                                                    </div>

                                                                                    <div className="flex flex-col items-end shrink-0 min-w-[100px]">
                                                                                        <div className="text-right">
                                                                                            <div className="flex items-center justify-end gap-1.5">
                                                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">OUT</span>
                                                                                                <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                                                                                                    {formatDate(o.fromDate)}
                                                                                                </p>
                                                                                            </div>
                                                                                            <p className="text-[10px] font-medium text-slate-500 leading-none">
                                                                                                {o.outTime ? formatTime(o.outTime) : '-'}
                                                                                            </p>
                                                                                        </div>
                                                                                        {o.inTimeConfirmed && (
                                                                                            <div className="text-right mt-1 pt-1 border-t border-slate-100 dark:border-slate-800 w-full">
                                                                                                <div className="flex items-center justify-end gap-1.5">
                                                                                                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">IN</span>
                                                                                                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                                                                                                        {o.inDate ? formatDate(o.inDate) : formatDate(o.toDate)}
                                                                                                    </p>
                                                                                                </div>
                                                                                                <p className="text-[10px] font-medium text-emerald-600/70 leading-none">
                                                                                                    {formatTime(o.inTime)}
                                                                                                </p>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {registerSubTab === 'outing' && (
                                                    <div className="space-y-6">
                                                        {!outingCollegeFilter ? (
                                                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 gpu-accelerated">
                                                                <div className="text-center space-y-2">
                                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Outing Management</h3>
                                                                    <p className="text-sm text-slate-500 dark:text-slate-400">Select a college to view active outings</p>
                                                                </div>
                                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                                    {COLLEGES.map((col) => (
                                                                        <button
                                                                            key={col.id}
                                                                            onClick={() => setOutingCollegeFilter(col.id)}
                                                                            className={`group relative p-6 rounded-2xl border-2 transition-all hover:shadow-xl active:scale-95 flex flex-col items-center text-center gap-3
                                                                    ${col.color === 'blue' ? 'border-blue-100 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50' :
                                                                                    col.color === 'orange' ? 'border-orange-100 hover:border-orange-500 bg-orange-50/50 hover:bg-orange-50' :
                                                                                        col.color === 'green' ? 'border-green-100 hover:border-green-500 bg-green-50/50 hover:bg-green-50' :
                                                                                            col.color === 'emerald' ? 'border-emerald-100 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50' :
                                                                                                col.color === 'red' ? 'border-red-100 hover:border-red-500 bg-red-50/50 hover:bg-red-50' :
                                                                                                    col.color === 'pink' ? 'border-pink-100 hover:border-pink-500 bg-pink-50/50 hover:bg-pink-50' :
                                                                                                        col.color === 'sky' ? 'border-sky-100 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50' :
                                                                                                            col.color === 'cyan' ? 'border-cyan-100 hover:border-cyan-500 bg-cyan-50/50 hover:bg-cyan-50' :
                                                                                                                col.color === 'rose' ? 'border-rose-100 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-50' :
                                                                                                                    col.color === 'teal' ? 'border-teal-100 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50' :
                                                                                                                        col.color === 'lime' ? 'border-lime-100 hover:border-lime-500 bg-lime-50/50 hover:bg-lime-50' :
                                                                                                                            'border-purple-100 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50'}`}
                                                                        >
                                                                            <NotificationBadge count={getCollegePendingCount(col.id, 'outing')} />
                                                                            <div className={`text-4xl mb-1 group-hover:scale-110 transition-transform`}>{col.icon}</div>
                                                                            <div className="space-y-1">
                                                                                <span className={`text-lg font-black tracking-tighter
                                                                        ${col.color === 'blue' ? 'text-blue-700' :
                                                                                        col.color === 'orange' ? 'text-orange-700' :
                                                                                            col.color === 'green' ? 'text-green-700' :
                                                                                                col.color === 'emerald' ? 'text-emerald-700' :
                                                                                                    col.color === 'red' ? 'text-red-700' :
                                                                                                        col.color === 'pink' ? 'text-pink-700' :
                                                                                                            col.color === 'sky' ? 'text-sky-700' :
                                                                                                                col.color === 'cyan' ? 'text-cyan-700' :
                                                                                                                    col.color === 'rose' ? 'text-rose-700' :
                                                                                                                        col.color === 'teal' ? 'text-teal-700' :
                                                                                                                            col.color === 'lime' ? 'text-lime-700' :
                                                                                                                                'text-purple-700'}`}>{col.id}</span>
                                                                                <p className="text-[10px] leading-tight font-medium text-slate-500 dark:text-slate-400 line-clamp-1">{col.name}</p>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 gpu-accelerated">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shrink-0
                                                                ${outingCollegeFilter === 'NEC' ? 'bg-blue-600' :
                                                                                outingCollegeFilter === 'NPC' ? 'bg-orange-600' :
                                                                                    outingCollegeFilter === 'NCT' ? 'bg-green-600' :
                                                                                        outingCollegeFilter === 'BAMS' ? 'bg-emerald-600' :
                                                                                            outingCollegeFilter === 'NMC' ? 'bg-red-600' :
                                                                                                outingCollegeFilter === 'NCP' ? 'bg-pink-600' :
                                                                                                    outingCollegeFilter === 'NASC' ? 'bg-sky-600' :
                                                                                                        outingCollegeFilter === 'NCPT' ? 'bg-cyan-600' :
                                                                                                            outingCollegeFilter === 'NCN' ? 'bg-rose-600' :
                                                                                                                outingCollegeFilter === 'NCAHS' ? 'bg-teal-600' :
                                                                                                                    outingCollegeFilter === 'NNYMC' ? 'bg-lime-600' :
                                                                                                                        'bg-purple-600'}`}>
                                                                            {outingCollegeFilter}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Institution</p>
                                                                            <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                                                                {outingCollegeFilter === 'NEC' ? 'Nandha Engineering College' :
                                                                                    outingCollegeFilter === 'NPC' ? 'Nandha Polytechnic College' :
                                                                                        outingCollegeFilter === 'NCT' ? 'Nandha College of Technology' :
                                                                                            outingCollegeFilter === 'BAMS' ? 'Nandha Ayurveda College' :
                                                                                                outingCollegeFilter === 'NMC' ? 'Nandha Medical College' :
                                                                                                    outingCollegeFilter === 'NCP' ? 'Nandha College of Pharmacy' :
                                                                                                        outingCollegeFilter === 'NASC' ? 'Nandha Arts & Science College' :
                                                                                                            outingCollegeFilter === 'NCPT' ? 'Nandha College of Physiotherapy' :
                                                                                                                outingCollegeFilter === 'NCN' ? 'Nandha College of Nursing' :
                                                                                                                    outingCollegeFilter === 'NCAHS' ? 'Nandha College of Allied Health Sciences' :
                                                                                                                        outingCollegeFilter === 'NNYMC' ? 'Nandha Naturopathy and Yoga Medical College' :
                                                                                                                            'Nandha Dental College'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-3">
                                                                        <div className="flex items-center gap-2 pr-2 border-r dark:border-slate-800">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0 rounded-full"
                                                                                onClick={() => {
                                                                                    toast.promise(fetchData(), {
                                                                                        loading: 'Refreshing...',
                                                                                        success: 'Refreshed',
                                                                                        error: 'Failed to refresh'
                                                                                    });
                                                                                }}
                                                                            >
                                                                                <RefreshCw className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            {selectedIds.size > 0 && (
                                                                                <Button
                                                                                    variant="destructive"
                                                                                    size="sm"
                                                                                    onClick={handleDeleteSelected}
                                                                                    className="animate-in fade-in zoom-in h-8"
                                                                                >
                                                                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                                                                    Delete ({selectedIds.size})
                                                                                </Button>
                                                                            )}
                                                                            {outpasses.filter(o => (o.type === 'outing' || (!o.reason.toLowerCase().includes('leave') && !o.reason.toLowerCase().includes('vacation'))) && (o.collegeName === outingCollegeFilter || o.collegeName === COLLEGES.find(c => c.id === outingCollegeFilter)?.name)).length > 0 && (
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-8 text-[10px] font-bold uppercase text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                                    onClick={() => handleClearHistory('outing', outingCollegeFilter!)}
                                                                                >
                                                                                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                                                                    Clear History
                                                                                </Button>
                                                                            )}
                                                                            <Button
                                                                                onClick={() => {
                                                                                    const GIRLS_OUTING_SHEET_ID = '15VxATYHLpnJiJL9L8lmkmMLS2RUc4IXxodbOc7v_XIo';
                                                                                    const BOYS_OUTING_SHEET_ID = '1gZJ_MKdbDpHtJQhNSi2RL4AFtAlbLamxd8L_cnw2T1I';

                                                                                    const normalizedHostel = user?.hostelName?.toLowerCase().replace(/\s+/g, '') || '';
                                                                                    const isGirlsHostel = normalizedHostel.includes('akshaya');

                                                                                    const url = `https://docs.google.com/spreadsheets/d/${isGirlsHostel ? GIRLS_OUTING_SHEET_ID : BOYS_OUTING_SHEET_ID}/edit?usp=sharing`;

                                                                                    window.open(url, '_blank');
                                                                                }}
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8 text-[10px] font-bold uppercase text-green-600 border-green-200 bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900"
                                                                            >
                                                                                <FileText className="w-3.5 h-3.5 mr-1.5" /> View Report
                                                                            </Button>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex justify-between items-center px-2">
                                                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Outpasses - {outingCollegeFilter}</h4>
                                                                    <Button size="sm" variant="outline" onClick={() => setActiveTab('outpass')}>Manage All</Button>
                                                                </div>
                                                                {outpasses.filter(o => (o.status === 'exited' || o.type === 'outing') && (o.collegeName === outingCollegeFilter || o.collegeName === COLLEGES.find(c => c.id === outingCollegeFilter)?.name)).length === 0 ? (
                                                                    <div className="p-12 text-center text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed">
                                                                        No students from {outingCollegeFilter} currently outside.
                                                                    </div>
                                                                ) : (
                                                                    <div className="grid gap-3">
                                                                        {outpasses.filter(o => (o.status === 'exited' || o.type === 'outing') && (o.collegeName === outingCollegeFilter || o.collegeName === COLLEGES.find(c => c.id === outingCollegeFilter)?.name)).map((o) => (
                                                                            <div
                                                                                key={o.id}
                                                                                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all
                                                                        ${selectedIds.has(o.id)
                                                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-500'
                                                                                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}`}
                                                                                onContextMenu={(e) => {
                                                                                    e.preventDefault();
                                                                                    toggleSelection(o.id);
                                                                                }}
                                                                                onClick={() => isSelectionMode && toggleSelection(o.id)}
                                                                            >
                                                                                <div className="flex items-center gap-4 flex-1">
                                                                                    {isSelectionMode && (
                                                                                        <div className="shrink-0">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={selectedIds.has(o.id)}
                                                                                                onChange={() => toggleSelection(o.id)}
                                                                                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 animate-in fade-in zoom-in duration-200"
                                                                                            />
                                                                                        </div>
                                                                                    )}
                                                                                    {getStudentAvatar(o.studentId)}
                                                                                    <div className="min-w-0">
                                                                                        <p className="font-bold text-slate-900 dark:text-white truncate">{o.studentName}</p>
                                                                                        <p className="text-xs text-slate-500 font-medium truncate">Reason: {o.reason}</p>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                                                                    <div className="flex items-center gap-2">
                                                                                        {!o.inTimeConfirmed ? (
                                                                                            <div className="flex gap-1.5">
                                                                                                <Button
                                                                                                    size="sm"
                                                                                                    variant="outline"
                                                                                                    className="h-8 w-8 p-0 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
                                                                                                    onClick={() => {
                                                                                                        setReplyingTo(o.studentId);
                                                                                                        setReplyMessage(`Hi ${o.studentName}, you haven't confirmed your return for your outing today. Please update your in-time.`);
                                                                                                    }}
                                                                                                >
                                                                                                    <MessageSquare className="w-4 h-4" />
                                                                                                </Button>
                                                                                                {users.find(u => u.id === o.studentId)?.phoneNumber && (
                                                                                                    <a
                                                                                                        href={`tel:${users.find(u => u.id === o.studentId)?.phoneNumber}`}
                                                                                                        className="h-8 w-8 rounded-full border border-green-200 text-green-600 hover:bg-green-50 flex items-center justify-center transition-colors shadow-sm"
                                                                                                    >
                                                                                                        <Phone className="w-4 h-4" />
                                                                                                    </a>
                                                                                                )}
                                                                                            </div>
                                                                                        ) : (
                                                                                            !o.pushedToSheet ? (
                                                                                                <Button
                                                                                                    size="sm"
                                                                                                    variant="outline"
                                                                                                    className="text-[10px] h-7 px-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold uppercase transition-all shadow-sm"
                                                                                                    onClick={() => handlePushToSheet(o)}
                                                                                                >
                                                                                                    <Upload className="w-3 h-3 mr-1" />
                                                                                                    Push
                                                                                                </Button>
                                                                                            ) : (
                                                                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase shadow-sm whitespace-nowrap">
                                                                                                    <BadgeCheck className="w-3.5 h-3.5" />
                                                                                                    Pushed
                                                                                                </div>
                                                                                            )
                                                                                        )}
                                                                                    </div>

                                                                                    <div className="flex flex-col items-end shrink-0 min-w-[100px]">
                                                                                        <div className="text-right">
                                                                                            <p className={`text-[10px] font-black uppercase leading-none mb-1 ${o.inTimeConfirmed ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                                                                {o.inTimeConfirmed ? 'Returned' : 'Out Now'}
                                                                                            </p>
                                                                                            <div className="flex items-center justify-end gap-1 text-[10px] font-medium text-slate-500 leading-none">
                                                                                                <Clock className="w-3 h-3" />
                                                                                                <span>{o.outTime ? `${formatTime(o.outTime)} - ${o.inTimeConfirmed ? formatTime(o.inTime) : 'Pending'}` : `Due: ${o.toDate}`}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {registerSubTab === 'sick' && (
                                                    <div className="space-y-6">
                                                        {!sickCollegeFilter ? (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 gpu-accelerated">
                                                                <div className="text-center space-y-2">
                                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Medical Emergency Support</h3>
                                                                    <p className="text-sm text-slate-500 dark:text-slate-400">Select a college to view medical reports</p>
                                                                </div>
                                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                                    {COLLEGES.map((col) => (
                                                                        <button
                                                                            key={col.id}
                                                                            onClick={() => setSickCollegeFilter(col.id)}
                                                                            className={`group relative p-6 rounded-2xl border-2 transition-all hover:shadow-xl active:scale-95 flex flex-col items-center text-center gap-3
                                                                    ${col.color === 'blue' ? 'border-blue-100 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50' :
                                                                                    col.color === 'orange' ? 'border-orange-100 hover:border-orange-500 bg-orange-50/50 hover:bg-orange-50' :
                                                                                        col.color === 'green' ? 'border-green-100 hover:border-green-500 bg-green-50/50 hover:bg-green-50' :
                                                                                            col.color === 'emerald' ? 'border-emerald-100 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50' :
                                                                                                col.color === 'red' ? 'border-red-100 hover:border-red-500 bg-red-50/50 hover:bg-red-50' :
                                                                                                    col.color === 'pink' ? 'border-pink-100 hover:border-pink-500 bg-pink-50/50 hover:bg-pink-50' :
                                                                                                        col.color === 'sky' ? 'border-sky-100 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50' :
                                                                                                            col.color === 'cyan' ? 'border-cyan-100 hover:border-cyan-500 bg-cyan-50/50 hover:bg-cyan-50' :
                                                                                                                col.color === 'rose' ? 'border-rose-100 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-50' :
                                                                                                                    col.color === 'teal' ? 'border-teal-100 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50' :
                                                                                                                        col.color === 'lime' ? 'border-lime-100 hover:border-lime-500 bg-lime-50/50 hover:bg-lime-50' :
                                                                                                                            'border-purple-100 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50'}`}
                                                                        >
                                                                            <NotificationBadge count={getCollegePendingCount(col.id, 'sick')} />
                                                                            <div className={`text-4xl mb-1 group-hover:scale-110 transition-transform`}>{col.icon}</div>
                                                                            <div className="space-y-1">
                                                                                <span className={`text-lg font-black tracking-tighter
                                                                        ${col.color === 'blue' ? 'text-blue-700' :
                                                                                        col.color === 'orange' ? 'text-orange-700' :
                                                                                            col.color === 'green' ? 'text-green-700' :
                                                                                                col.color === 'emerald' ? 'text-emerald-700' :
                                                                                                    col.color === 'red' ? 'text-red-700' :
                                                                                                        col.color === 'pink' ? 'text-pink-700' :
                                                                                                            col.color === 'sky' ? 'text-sky-700' :
                                                                                                                col.color === 'cyan' ? 'text-cyan-700' :
                                                                                                                    col.color === 'rose' ? 'text-rose-700' :
                                                                                                                        col.color === 'teal' ? 'text-teal-700' :
                                                                                                                            col.color === 'lime' ? 'text-lime-700' :
                                                                                                                                'text-purple-700'}`}>{col.id}</span>
                                                                                <p className="text-[10px] leading-tight font-medium text-slate-500 dark:text-slate-400 line-clamp-1">{col.name}</p>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 gpu-accelerated">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shrink-0
                                                                        ${sickCollegeFilter === 'NEC' ? 'bg-blue-600' :
                                                                                sickCollegeFilter === 'NPC' ? 'bg-orange-600' :
                                                                                    sickCollegeFilter === 'NCT' ? 'bg-green-600' :
                                                                                        sickCollegeFilter === 'BAMS' ? 'bg-emerald-600' :
                                                                                            sickCollegeFilter === 'NMC' ? 'bg-red-600' :
                                                                                                sickCollegeFilter === 'NCP' ? 'bg-pink-600' :
                                                                                                    sickCollegeFilter === 'NASC' ? 'bg-sky-600' :
                                                                                                        sickCollegeFilter === 'NCPT' ? 'bg-cyan-600' :
                                                                                                            sickCollegeFilter === 'NCN' ? 'bg-rose-600' :
                                                                                                                sickCollegeFilter === 'NCAHS' ? 'bg-teal-600' :
                                                                                                                    sickCollegeFilter === 'NNYMC' ? 'bg-lime-600' :
                                                                                                                        'bg-purple-600'}`}>
                                                                            <Thermometer className="w-6 h-6" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Institution</p>
                                                                            <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                                                                {COLLEGES.find(c => c.id === sickCollegeFilter)?.name}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-3">
                                                                        <div className="flex items-center gap-2 pr-2 border-r dark:border-slate-800">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0 rounded-full"
                                                                                onClick={() => {
                                                                                    toast.promise(fetchData(), {
                                                                                        loading: 'Refreshing...',
                                                                                        success: 'Refreshed',
                                                                                        error: 'Failed to refresh'
                                                                                    });
                                                                                }}
                                                                            >
                                                                                <RefreshCw className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                        <Button
                                                                            onClick={() => {
                                                                                const GIRLS_SICK_SHEET = 'https://docs.google.com/spreadsheets/d/1LIVmp3dUkHUy-gMvuFatrRMgvPX4qBXj2EProRMGMZE/edit?usp=sharing';
                                                                                const BOYS_SICK_SHEET = 'https://docs.google.com/spreadsheets/d/1juK0cw8OIMyFECYwOexkvkCBdn1NBQTrY-4YDWgS-nk/edit?usp=sharing';

                                                                                const normalizedHostel = user?.hostelName?.toLowerCase().replace(/\s+/g, '') || '';
                                                                                const isGirlsHostel = normalizedHostel.includes('akshaya');

                                                                                window.open(isGirlsHostel ? GIRLS_SICK_SHEET : BOYS_SICK_SHEET, '_blank');
                                                                            }}
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-8 text-[10px] font-bold uppercase text-green-600 border-green-200 bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900"
                                                                        >
                                                                            <FileText className="w-3.5 h-3.5 mr-1.5" /> View Report
                                                                        </Button>

                                                                    </div>
                                                                </div>

                                                                {sickRegisters.filter(s => (s.collegeName === sickCollegeFilter || s.collegeName === COLLEGES.find(c => c.id === sickCollegeFilter)?.name)).length === 0 ? (
                                                                    <div className="p-12 text-center text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed">
                                                                        No medical emergency entries found for {sickCollegeFilter}.
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-3">
                                                                        {[...sickRegisters].filter(s => (s.collegeName === sickCollegeFilter || s.collegeName === COLLEGES.find(c => c.id === sickCollegeFilter)?.name)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(entry => (
                                                                            <div
                                                                                key={entry.id}
                                                                                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all
                                                                        ${entry.status === 'pending'
                                                                                        ? 'border-red-200 dark:border-red-900/30 bg-red-50/20 dark:bg-red-900/5 shadow-sm'
                                                                                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-200 shadow-sm'}`}
                                                                            >
                                                                                <div className="flex items-center gap-4 flex-1">
                                                                                    {getStudentAvatar(entry.studentId)}
                                                                                    <div className="min-w-0">
                                                                                        <div className="flex items-center gap-2 mb-1">
                                                                                            <p className="font-bold text-slate-900 dark:text-white truncate">{entry.studentName}</p>
                                                                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0
                                                                                    ${entry.status === 'pushed' ? 'bg-emerald-100 text-emerald-700' :
                                                                                                    entry.status === 'cared' ? 'bg-blue-100 text-blue-700' :
                                                                                                        'bg-red-100 text-red-700 animate-pulse'}`}>
                                                                                                {entry.status}
                                                                                            </span>
                                                                                        </div>
                                                                                        <p className="text-xs text-slate-500 font-medium truncate">
                                                                                            Room {entry.roomNumber}
                                                                                        </p>
                                                                                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 italic line-clamp-1">
                                                                                            "{entry.reason}"
                                                                                        </p>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                                                                                    <div className="flex flex-col items-start sm:items-end">
                                                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Reported At</p>
                                                                                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{formatDate(entry.date)}</p>
                                                                                    </div>

                                                                                    <div className="flex items-center gap-2">
                                                                                        {entry.status === 'pending' && (
                                                                                            <Button
                                                                                                size="sm"
                                                                                                className="bg-red-600 hover:bg-red-700 text-white h-8 text-[10px] font-bold uppercase"
                                                                                                onClick={() => handleMarkAsCared(entry.id)}
                                                                                            >
                                                                                                Mark Cared
                                                                                            </Button>
                                                                                        )}

                                                                                        {entry.status === 'cared' && (
                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="outline"
                                                                                                className="h-8 text-[10px] font-bold uppercase border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                                                                                onClick={() => handlePushSickRegisterToSheet(entry)}
                                                                                            >
                                                                                                <Upload className="w-3 h-3 mr-1.5" />
                                                                                                Push
                                                                                            </Button>
                                                                                        )}

                                                                                        {entry.status === 'pushed' && (
                                                                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase whitespace-nowrap">
                                                                                                <Check className="w-3.5 h-3.5" />
                                                                                                Synced
                                                                                            </div>
                                                                                        )}

                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="ghost"
                                                                                            className="h-8 w-8 p-0 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
                                                                                            onClick={() => {
                                                                                                setReplyingTo(entry.studentId);
                                                                                                setReplyMessage(`Hi ${entry.studentName}, regarding your medical emergency report: `);
                                                                                            }}
                                                                                        >
                                                                                            <MessageSquare className="w-4 h-4" />
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {registerSubTab === 'complaints' && (
                                                    <div className="space-y-6">
                                                        {!complaintCollegeFilter ? (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 gpu-accelerated">
                                                                <div className="text-center space-y-2">
                                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Institution Support (Complaints)</h3>
                                                                    <p className="text-sm text-slate-500 dark:text-slate-400">Select a college to view student complaints</p>
                                                                </div>
                                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                                    {COLLEGES.map((col) => (
                                                                        <button
                                                                            key={col.id}
                                                                            onClick={() => setComplaintCollegeFilter(col.id)}
                                                                            className={`group relative p-6 rounded-2xl border-2 transition-all hover:shadow-xl active:scale-95 flex flex-col items-center text-center gap-3
                                                                    ${col.color === 'blue' ? 'border-blue-100 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50' :
                                                                                    col.color === 'orange' ? 'border-orange-100 hover:border-orange-500 bg-orange-50/50 hover:bg-orange-50' :
                                                                                        col.color === 'green' ? 'border-green-100 hover:border-green-500 bg-green-50/50 hover:bg-green-50' :
                                                                                            col.color === 'emerald' ? 'border-emerald-100 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50' :
                                                                                                col.color === 'red' ? 'border-red-100 hover:border-red-500 bg-red-50/50 hover:bg-red-50' :
                                                                                                    col.color === 'pink' ? 'border-pink-100 hover:border-pink-500 bg-pink-50/50 hover:bg-pink-50' :
                                                                                                        col.color === 'sky' ? 'border-sky-100 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50' :
                                                                                                            col.color === 'cyan' ? 'border-cyan-100 hover:border-cyan-500 bg-cyan-50/50 hover:bg-cyan-50' :
                                                                                                                col.color === 'rose' ? 'border-rose-100 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-50' :
                                                                                                                    col.color === 'teal' ? 'border-teal-100 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50' :
                                                                                                                        col.color === 'lime' ? 'border-lime-100 hover:border-lime-500 bg-lime-50/50 hover:bg-lime-50' :
                                                                                                                            'border-purple-100 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50'}`}
                                                                        >
                                                                            <NotificationBadge count={getCollegePendingCount(col.id, 'complaints')} />
                                                                            <div className={`text-4xl mb-1 group-hover:scale-110 transition-transform`}>{col.icon}</div>
                                                                            <div className="space-y-1">
                                                                                <span className={`text-lg font-black tracking-tighter
                                                                        ${col.color === 'blue' ? 'text-blue-700' :
                                                                                        col.color === 'orange' ? 'text-orange-700' :
                                                                                            col.color === 'green' ? 'text-green-700' :
                                                                                                col.color === 'emerald' ? 'text-emerald-700' :
                                                                                                    col.color === 'red' ? 'text-red-700' :
                                                                                                        col.color === 'pink' ? 'text-pink-700' :
                                                                                                            col.color === 'sky' ? 'text-sky-700' :
                                                                                                                col.color === 'cyan' ? 'text-cyan-700' :
                                                                                                                    col.color === 'rose' ? 'text-rose-700' :
                                                                                                                        col.color === 'teal' ? 'text-teal-700' :
                                                                                                                            col.color === 'lime' ? 'text-lime-700' :
                                                                                                                                'text-purple-700'}`}>{col.id}</span>
                                                                                <p className="text-[10px] leading-tight font-medium text-slate-500 dark:text-slate-400 line-clamp-1">{col.name}</p>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 gpu-accelerated">
                                                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shrink-0
                                                                        ${complaintCollegeFilter === 'NEC' ? 'bg-blue-600' :
                                                                                complaintCollegeFilter === 'NPC' ? 'bg-orange-600' :
                                                                                    complaintCollegeFilter === 'NCT' ? 'bg-green-600' :
                                                                                        complaintCollegeFilter === 'BAMS' ? 'bg-emerald-600' :
                                                                                            complaintCollegeFilter === 'NMC' ? 'bg-red-600' :
                                                                                                complaintCollegeFilter === 'NCP' ? 'bg-pink-600' :
                                                                                                    complaintCollegeFilter === 'NASC' ? 'bg-sky-600' :
                                                                                                        complaintCollegeFilter === 'NCPT' ? 'bg-cyan-600' :
                                                                                                            complaintCollegeFilter === 'NCN' ? 'bg-rose-600' :
                                                                                                                complaintCollegeFilter === 'NCAHS' ? 'bg-teal-600' :
                                                                                                                    complaintCollegeFilter === 'NNYMC' ? 'bg-lime-600' :
                                                                                                                        'bg-purple-600'}`}>
                                                                            <ClipboardList className="w-6 h-6" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Institution</p>
                                                                            <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                                                                {COLLEGES.find(c => c.id === complaintCollegeFilter)?.name}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <div className="flex items-center gap-2 pr-2 border-r dark:border-slate-800">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => fetchData()}
                                                                                className="gap-2 h-8 text-[10px] font-bold uppercase"
                                                                            >
                                                                                <RotateCw className="w-3.5 h-3.5" />
                                                                                Refresh
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    const isBoys = user?.hostelName?.toLowerCase().includes('nri');
                                                                                    const url = isBoys
                                                                                        ? 'https://docs.google.com/spreadsheets/d/1jNomFfmrPaYkzNnTj59Jz3qNBuk7Jc3rewqStczE6js/edit'
                                                                                        : 'https://docs.google.com/spreadsheets/d/1EH3gEaA7R7Zhq7rWSS3l4ZfSDLzR27DPIEujDyPGuLk/edit';
                                                                                    window.open(url, '_blank');
                                                                                }}
                                                                                className="h-8 text-[10px] font-bold uppercase text-green-600 border-green-200 bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900"
                                                                            >
                                                                                <FileText className="w-3.5 h-3.5 mr-1.5" /> View Report
                                                                            </Button>
                                                                        </div>
                                                                        <select
                                                                            className="border rounded-md px-3 py-1 text-[10px] font-bold uppercase bg-white dark:bg-black text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 h-8"
                                                                            value={filter}
                                                                            onChange={(e) => setFilter(e.target.value as any)}
                                                                        >
                                                                            <option value="all">All Types</option>
                                                                            <option value="food">Food</option>
                                                                            <option value="misc">Misc</option>
                                                                        </select>
                                                                        <Button
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            className="h-8 text-[10px] font-bold uppercase"
                                                                            onClick={async () => {
                                                                                if (confirm('Are you sure you want to clear all complaints history for your hostel? This cannot be undone.')) {
                                                                                    await fetch(`/api/complaints?hostelName=${user?.hostelName || ''}`, { method: 'DELETE' });
                                                                                    toast.success('Complaints history cleared');
                                                                                    fetchData();
                                                                                }
                                                                            }}
                                                                        >
                                                                            Clear
                                                                        </Button>

                                                                    </div>
                                                                </div>
                                                                <div className="grid gap-4">
                                                                    {complaints.filter(c => (c.collegeName === complaintCollegeFilter || c.collegeName === COLLEGES.find(col => col.id === complaintCollegeFilter)?.name) && (filter === 'all' || c.type === filter)).length === 0 ? <p className="text-center text-slate-500 py-12 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed">No complaints found for {complaintCollegeFilter}.</p> :
                                                                        complaints.filter(c => (c.collegeName === complaintCollegeFilter || c.collegeName === COLLEGES.find(col => col.id === complaintCollegeFilter)?.name) && (filter === 'all' || c.type === filter)).map(c => (
                                                                            <Card key={c.id}>
                                                                                <CardHeader className="pb-2">
                                                                                    <div className="flex justify-between items-start">
                                                                                        <div>
                                                                                            <CardTitle className="text-lg">{c.title}</CardTitle>
                                                                                            <div className="flex items-start space-x-2 mt-1">
                                                                                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${c.type === 'food' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}>{c.type}</span>
                                                                                                <div className="flex flex-col gap-1">
                                                                                                    <CardDescription className="flex items-center gap-2 mt-1">
                                                                                                        {getStudentAvatar(c.studentId)}
                                                                                                        <span className="font-bold text-slate-900 dark:text-white">{c.studentName}</span>
                                                                                                    </CardDescription>
                                                                                                    <div className="text-[10px] text-slate-500 font-medium ml-8">
                                                                                                        Room {c.roomNumber} • {new Date(c.createdAt).toLocaleDateString()}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="flex flex-col items-end gap-2">
                                                                                            <div className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${c.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : c.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                                                                                {c.status}
                                                                                            </div>

                                                                                            {/* Button Logic based on pushedProgress */}
                                                                                            {!c.pushedProgress && c.status === 'in-progress' ? (
                                                                                                <Button
                                                                                                    size="default"
                                                                                                    className="h-9 px-4 text-xs font-bold uppercase bg-red-600 hover:bg-red-700 text-white shadow-md transition-all active:scale-95"
                                                                                                    onClick={() => handlePushComplaintToSheet(c)}
                                                                                                >
                                                                                                    PUSH IN-PROGRESS
                                                                                                </Button>
                                                                                            ) : c.pushedProgress === 'In-Process' && c.status !== 'resolved' ? (
                                                                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase shadow-sm">
                                                                                                    <BadgeCheck className="w-3.5 h-3.5" /> Pushed (In-Process)
                                                                                                </div>
                                                                                            ) : c.pushedProgress === 'In-Process' && c.status === 'resolved' ? (
                                                                                                <Button
                                                                                                    size="default"
                                                                                                    className="h-9 px-4 text-xs font-bold uppercase bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all active:scale-95"
                                                                                                    onClick={() => handlePushComplaintToSheet(c)}
                                                                                                >
                                                                                                    PUSH AS RESOLVED
                                                                                                </Button>
                                                                                            ) : c.pushedProgress === 'Resolved' ? (
                                                                                                <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase shadow-sm opacity-80">
                                                                                                    <BadgeCheck className="w-4 h-4" /> PUSHED AS RESOLVED
                                                                                                </div>
                                                                                            ) : (
                                                                                                c.status === 'resolved' && (
                                                                                                    <Button
                                                                                                        size="default"
                                                                                                        className="h-9 px-4 text-xs font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95"
                                                                                                        onClick={() => handlePushComplaintToSheet(c)}
                                                                                                    >
                                                                                                        PUSH AS RESOLVED
                                                                                                    </Button>
                                                                                                )
                                                                                            )}
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
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )
                        }
                        {/* End of Detail View Wrapper */}
                    </div >
                )}
            </div >
            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />

            {/* Found Message Modal */}
            {
                showFoundModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-slate-900 border dark:border-slate-800">
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
                )
            }

            {/* Lost Found Detail Modal */}
            {
                selectedLostItem && (
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
                                {(selectedLostItem.images && selectedLostItem.images.length > 0) || selectedLostItem.image ? (
                                    <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative group">
                                        <img
                                            src={(selectedLostItem.images && selectedLostItem.images.length > 0) ? selectedLostItem.images[imageIndices[selectedLostItem.id] || 0] : selectedLostItem.image}
                                            alt={selectedLostItem.productName}
                                            className="w-full h-full object-contain"
                                        />
                                        {selectedLostItem.images && selectedLostItem.images.length > 1 && (
                                            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 rounded-full bg-black/50 text-white pointer-events-auto"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const currentIndex = imageIndices[selectedLostItem.id] || 0;
                                                        const prevIndex = (currentIndex - 1 + selectedLostItem.images!.length) % selectedLostItem.images!.length;
                                                        setImageIndices(prev => ({ ...prev, [selectedLostItem.id]: prevIndex }));
                                                    }}
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 rounded-full bg-black/50 text-white pointer-events-auto"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const currentIndex = imageIndices[selectedLostItem.id] || 0;
                                                        const nextIndex = (currentIndex + 1) % selectedLostItem.images!.length;
                                                        setImageIndices(prev => ({ ...prev, [selectedLostItem.id]: nextIndex }));
                                                    }}
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                    <div className="space-y-1">
                                        <p className="text-slate-500">Contact</p>
                                        <p className="font-semibold">{selectedLostItem.studentPhone || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-slate-500">Found/Lost at</p>
                                        <p className="font-semibold">{selectedLostItem.timeAndDate}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500">Identification Marks / Additional Info</p>
                                    <p className="text-sm p-3 rounded-lg bg-slate-50 dark:bg-black border dark:border-slate-800">{selectedLostItem.identification}</p>
                                </div>
                                {selectedLostItem.status === 'returned' && (
                                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold">
                                        <BadgeCheck className="w-5 h-5" />
                                        Successfully Returned to Student
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )
            }
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                variant={confirmModal.variant}
            />
        </>
    );
}

