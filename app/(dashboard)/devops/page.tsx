'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Key, RefreshCw, Trash2, UserCog, Loader2, Search, MoreVertical, MessageSquare, Star, User } from 'lucide-react';

export default function DevOpsDashboard() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [newPassword, setNewPassword] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editData, setEditData] = useState({ id: '', name: '', password: '', role: '' });
    const [resetting, setResetting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [roleFilter, setRoleFilter] = useState('all');
    const [hostelFilter, setHostelFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'accounts' | 'feedback' | 'profile-mods'>('accounts');
    const [feedback, setFeedback] = useState<any[]>([]);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [profileRequests, setProfileRequests] = useState<any[]>([]);
    const [selectedProfileRequest, setSelectedProfileRequest] = useState<any>(null);
    const [isManualProfileEdit, setIsManualProfileEdit] = useState(false);
    const [profileEditForm, setProfileEditForm] = useState({
        id: '',
        name: '',
        department: '',
        roomNumber: '',
        phoneNumber: '',
        email: '',
        profileImage: ''
    });
    const [mounted, setMounted] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/password-reset');
            const data = await res.json();
            setRequests(data);
        } catch (error) {
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchFeedback = async () => {
        setFeedbackLoading(true);
        try {
            const res = await fetch('/api/feedback');
            const data = await res.json();
            setFeedback(data);
        } catch (error) {
            toast.error('Failed to load feedback');
        } finally {
            setFeedbackLoading(false);
        }
    };

    const fetchProfileRequests = async () => {
        setProfileLoading(true);
        try {
            const res = await fetch('/api/profile-update-request');
            const data = await res.json();
            setProfileRequests(data);
        } catch (error) {
            toast.error('Failed to load profile requests');
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchRequests();
        fetchUsers();
        fetchFeedback();
        fetchProfileRequests();
    }, []);

    const handleResetPassword = async () => {
        if (!newPassword.trim()) {
            toast.error('Please enter a new password');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setResetting(true);
        try {
            const res = await fetch('/api/password-reset', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedRequest.userId,
                    newPassword: newPassword,
                    requestId: selectedRequest.id
                })
            });

            if (res.ok) {
                toast.success('Password reset successfully!');
                setSelectedRequest(null);
                setNewPassword('');
                fetchRequests();
            } else {
                toast.error('Failed to reset password');
            }
        } catch (error) {
            toast.error('Error resetting password');
        } finally {
            setResetting(false);
        }
    };

    const handleDeleteRequest = async (requestId: string) => {
        if (!confirm('Are you sure you want to delete this reset request?')) return;

        setDeletingRequestId(requestId);
        try {
            const res = await fetch(`/api/password-reset?id=${requestId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('Request deleted');
                fetchRequests();
            } else {
                toast.error('Failed to delete request');
            }
        } catch (error) {
            toast.error('Error deleting request');
        } finally {
            setDeletingRequestId(null);
            setOpenMenuId(null);
        }
    };

    const handleUpdateUser = async () => {
        if (!editData.id || !editData.name || !editData.password) {
            toast.error('All fields are required');
            return;
        }

        setResetting(true);
        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedUser.id,
                    updates: editData
                })
            });

            if (res.ok) {
                toast.success('User updated successfully!');
                setSelectedUser(null);
                fetchUsers();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to update user');
            }
        } catch (error) {
            toast.error('Error updating user');
        } finally {
            setResetting(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/users?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('Account deleted successfully');
                fetchUsers();
            } else {
                toast.error('Failed to delete account');
            }
        } catch (error) {
            toast.error('Error deleting account');
        } finally {
            setDeletingId(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUserIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedUserIds.size} selected accounts? This action cannot be undone.`)) return;

        setUsersLoading(true);
        try {
            const idsToDelete = Array.from(selectedUserIds);
            const res = await fetch('/api/users/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: idsToDelete })
            });

            if (res.ok) {
                toast.success(`${selectedUserIds.size} accounts deleted successfully`);
                setSelectedUserIds(new Set());
                setIsSelectionMode(false);
                fetchUsers();
            } else {
                toast.error('Failed to delete some accounts');
            }
        } catch (error) {
            toast.error('Error in bulk deletion');
        } finally {
            setUsersLoading(false);
        }
    };

    const toggleUserSelection = (id: string) => {
        const newSelection = new Set(selectedUserIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedUserIds(newSelection);
    };

    const toggleSelectAll = () => {
        if (selectedUserIds.size === filteredUsers.length) {
            setSelectedUserIds(new Set());
        } else {
            setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const handleDeleteProfileRequest = async (id: string) => {
        if (!confirm('Are you sure you want to delete this modification request?')) return;
        try {
            const res = await fetch(`/api/profile-update-request?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success('Request deleted');
                fetchProfileRequests();
            } else {
                toast.error('Failed to delete request');
            }
        } catch (error) {
            toast.error('Error deleting request');
        }
    };

    const handleUpdateProfileFromRequest = async () => {
        if (!profileEditForm.id) return;
        setResetting(true);
        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: profileEditForm.id,
                    updates: profileEditForm
                })
            });

            if (res.ok) {
                toast.success('Profile updated successfully!');
                if (selectedProfileRequest) {
                    await fetch(`/api/profile-update-request?id=${selectedProfileRequest.id}`, {
                        method: 'DELETE'
                    });
                }
                setSelectedProfileRequest(null);
                setIsManualProfileEdit(false);
                fetchProfileRequests();
                fetchUsers();
            } else {
                toast.error('Failed to update profile');
            }
        } catch (error) {
            toast.error('Error updating profile');
        } finally {
            setResetting(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.role.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        const matchesHostel = hostelFilter === 'all' || u.hostelName === hostelFilter;

        return matchesSearch && matchesRole && matchesHostel;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white font-cinzel tracking-tight">DevOps Dashboard</h1>
                    <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-[0.2em] mt-2 opacity-70">System Architecture & Database Master</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('accounts')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'accounts'
                            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        Account Management
                    </button>
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'feedback'
                            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        Feedback Submitted
                    </button>
                    <button
                        onClick={() => setActiveTab('profile-mods')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'profile-mods'
                            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        Profile Mod Requests
                    </button>
                </div>
            </div>

            {activeTab === 'accounts' ? (
                <>
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Password Reset Requests</CardTitle>
                                    <CardDescription>Review and process user password reset requests</CardDescription>
                                </div>
                                <Button onClick={fetchRequests} variant="outline" size="sm" disabled={loading}>
                                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8 text-slate-500">Loading requests...</div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No pending password reset requests</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="border-b">
                                            <tr className="text-left">
                                                <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">User ID</th>
                                                <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Name</th>
                                                <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Email</th>
                                                <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Request Date</th>
                                                <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requests.map((req) => (
                                                <tr key={req.id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <td className="py-3 font-medium text-slate-900 dark:text-white">{req.userId}</td>
                                                    <td className="py-3 text-slate-600 dark:text-slate-400">{req.userName}</td>
                                                    <td className="py-3 text-slate-600 dark:text-slate-400">{req.userEmail || 'N/A'}</td>
                                                    <td className="py-3 text-slate-600 dark:text-slate-400">
                                                        {mounted ? new Date(req.requestDate).toLocaleString() : ''}
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => setSelectedRequest(req)}
                                                                className="bg-blue-600 hover:bg-blue-700"
                                                            >
                                                                <Key className="w-4 h-4 mr-1" />
                                                                Reset
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDeleteRequest(req.id)}
                                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="mt-8 border-red-200">
                        <CardHeader className="bg-red-50/50 dark:bg-red-950/10">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-red-900 dark:text-red-400">All User Logins (Master Access)</CardTitle>
                                    <CardDescription className="text-red-700 dark:text-red-500">View all registered users and their plain-text passwords</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => {
                                            setIsSelectionMode(!isSelectionMode);
                                            setSelectedUserIds(new Set());
                                        }}
                                        variant={isSelectionMode ? "default" : "outline"}
                                        size="sm"
                                        className={isSelectionMode ? "bg-slate-700 hover:bg-slate-800" : "border-red-200 text-red-700"}
                                    >
                                        {isSelectionMode ? 'Cancel Selection' : 'Select Users'}
                                    </Button>
                                    {isSelectionMode && selectedUserIds.size > 0 && (
                                        <Button
                                            onClick={handleBulkDelete}
                                            variant="destructive"
                                            size="sm"
                                            className="bg-red-600 hover:bg-red-700 animate-in fade-in zoom-in duration-200"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Selected ({selectedUserIds.size})
                                        </Button>
                                    )}
                                    <Button onClick={fetchUsers} variant="outline" size="sm" className="border-red-200 hover:bg-red-100 text-red-700" disabled={usersLoading}>
                                        <RefreshCw className={`w-4 h-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
                                        Refresh Users
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by ID, Name, or Role..."
                                        className="pl-10 h-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        className="h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="student">Student</option>
                                        <option value="admin">Admin</option>
                                        <option value="send-off">Send-off</option>
                                        <option value="authority">Authority</option>
                                        <option value="devops">DevOps</option>
                                    </select>
                                    <select
                                        className="h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={hostelFilter}
                                        onChange={(e) => setHostelFilter(e.target.value)}
                                    >
                                        <option value="all">All Hostels</option>
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
                            </div>

                            {usersLoading ? (
                                <div className="text-center py-8 text-slate-500">Loading master user list...</div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No users found</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="border-b">
                                            <tr className="text-left">
                                                {isSelectionMode && (
                                                    <th className="pb-3 w-10">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                            checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                                                            onChange={toggleSelectAll}
                                                        />
                                                    </th>
                                                )}
                                                <th className="pb-3 font-semibold">Login ID</th>
                                                <th className="pb-3 font-semibold">Name</th>
                                                <th className="pb-3 font-semibold">Role</th>
                                                <th className="pb-3 font-semibold">Hostel</th>
                                                <th className="pb-3 font-semibold text-red-600">Password</th>
                                                <th className="pb-3 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((u) => (
                                                <tr
                                                    key={u.id}
                                                    onClick={() => isSelectionMode && toggleUserSelection(u.id)}
                                                    className={`border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isSelectionMode ? 'cursor-pointer' : ''} ${selectedUserIds.has(u.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                                >
                                                    {isSelectionMode && (
                                                        <td className="py-3">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                                checked={selectedUserIds.has(u.id)}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleUserSelection(u.id);
                                                                }}
                                                            />
                                                        </td>
                                                    )}
                                                    <td className="py-3 font-medium">{u.id}</td>
                                                    <td className="py-3">{u.name}</td>
                                                    <td className="py-3">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                            u.role === 'devops' ? 'bg-red-100 text-red-700' :
                                                                u.role === 'authority' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">{u.hostelName || 'N/A'}</td>
                                                    <td className="py-3">
                                                        <code className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-red-600 dark:text-red-400 rounded border border-amber-100 dark:border-amber-900/50 font-bold">
                                                            {u.password || '******'}
                                                        </code>
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        {!isSelectionMode && (
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedUser(u);
                                                                        setEditData({ id: u.id, name: u.name, password: u.password || '', role: u.role });
                                                                    }}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <UserCog className="w-4 h-4" />
                                                                </Button>
                                                                {u.role === 'student' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setIsManualProfileEdit(true);
                                                                            setProfileEditForm({
                                                                                id: u.id,
                                                                                name: u.name,
                                                                                department: u.department || '',
                                                                                roomNumber: u.roomNumber || '',
                                                                                phoneNumber: u.phoneNumber || '',
                                                                                email: u.email || '',
                                                                                profileImage: u.profileImage || ''
                                                                            });
                                                                        }}
                                                                        className="h-8 w-8 p-0 text-blue-500"
                                                                        title="Update Profile"
                                                                    >
                                                                        <User className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    disabled={deletingId === u.id}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteUser(u.id);
                                                                    }}
                                                                    className="h-8 w-8 p-0 text-red-500"
                                                                >
                                                                    {deletingId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            ) : activeTab === 'feedback' ? (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>User Feedback & Suggestions</CardTitle>
                                <CardDescription>Ratings and queries submitted by users</CardDescription>
                            </div>
                            <Button onClick={fetchFeedback} variant="outline" size="sm" disabled={feedbackLoading}>
                                <RefreshCw className={`w-4 h-4 mr-2 ${feedbackLoading ? 'animate-spin' : ''}`} />
                                Refresh Feedback
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {feedbackLoading ? (
                            <div className="text-center py-12 text-slate-500">Loading feedback...</div>
                        ) : feedback.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold">No Feedback Yet</h3>
                                <p className="text-slate-500">Feedback submitted by students will appear here.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b">
                                        <tr className="text-left">
                                            <th className="pb-3 font-semibold">User</th>
                                            <th className="pb-3 font-semibold">Rating</th>
                                            <th className="pb-3 font-semibold">Message</th>
                                            <th className="pb-3 font-semibold text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-slate-600 dark:text-slate-300">
                                        {feedback.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="py-4">
                                                    <div>
                                                        <p className="font-semibold text-slate-900 dark:text-white">{item.studentName}</p>
                                                        <p className="text-[10px] uppercase tracking-wider text-slate-500">{item.studentId}</p>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/50 w-fit">
                                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                        <span className="font-bold text-amber-700 dark:text-amber-400">{item.rating}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <p className="max-w-md italic">"{item.message || 'No comments'}"</p>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <p className="text-xs">{mounted ? new Date(item.createdAt).toLocaleDateString() : ''}</p>
                                                    <p className="text-[10px] text-slate-400">{mounted ? new Date(item.createdAt).toLocaleTimeString() : ''}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Profile Modification Requests</CardTitle>
                                <CardDescription>Students requesting to change their profile details</CardDescription>
                            </div>
                            <Button onClick={fetchProfileRequests} variant="outline" size="sm" disabled={profileLoading}>
                                <RefreshCw className={`w-4 h-4 mr-2 ${profileLoading ? 'animate-spin' : ''}`} />
                                Refresh Requests
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {profileLoading ? (
                            <div className="text-center py-12 text-slate-500">Loading requests...</div>
                        ) : profileRequests.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                <UserCog className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold">No Requests</h3>
                                <p className="text-slate-500">Modification requests will appear here.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b">
                                        <tr className="text-left">
                                            <th className="pb-3 font-semibold">Student</th>
                                            <th className="pb-3 font-semibold">Field to Modify</th>
                                            <th className="pb-3 font-semibold">Requested At</th>
                                            <th className="pb-3 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-slate-600 dark:text-slate-300">
                                        {profileRequests.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="py-4">
                                                    <div>
                                                        <p className="font-semibold text-slate-900 dark:text-white">{item.studentName}</p>
                                                        <p className="text-[10px] uppercase text-slate-500">{item.studentId}</p>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs font-bold">
                                                        {item.fieldName}
                                                    </span>
                                                </td>
                                                <td className="py-4 font-mono text-xs">
                                                    {mounted ? new Date(item.requestDate).toLocaleString() : ''}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                const student = users.find(u => u.id === item.studentId);
                                                                if (student) {
                                                                    setSelectedProfileRequest(item);
                                                                    setProfileEditForm({
                                                                        id: student.id,
                                                                        name: student.name,
                                                                        department: student.department || '',
                                                                        roomNumber: student.roomNumber || '',
                                                                        phoneNumber: student.phoneNumber || '',
                                                                        email: student.email || '',
                                                                        profileImage: student.profileImage || ''
                                                                    });
                                                                } else {
                                                                    toast.error('Student data not found');
                                                                }
                                                            }}
                                                            className="bg-blue-600 hover:bg-blue-700 h-8"
                                                        >
                                                            Update
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProfileRequest(item.id)} className="text-red-500 hover:text-red-600 h-8">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Modals */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md shadow-2xl">
                        <CardHeader>
                            <CardTitle>Edit User: {selectedUser.name}</CardTitle>
                            <CardDescription>Update Login ID, Name, or Password</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="editId">Login ID</Label>
                                <Input id="editId" value={editData.id} onChange={(e) => setEditData({ ...editData, id: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editName">Full Name</Label>
                                <Input id="editName" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editPassword">Password</Label>
                                <Input id="editPassword" value={editData.password} onChange={(e) => setEditData({ ...editData, password: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editRole">Role</Label>
                                <select
                                    className="w-full h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm"
                                    value={editData.role}
                                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                >
                                    <option value="student">Student</option>
                                    <option value="admin">Admin</option>
                                    <option value="send-off">Send-off</option>
                                    <option value="authority">Authority</option>
                                    <option value="devops">DevOps</option>
                                </select>
                            </div>
                        </CardContent>
                        <div className="flex gap-2 p-6 pt-0">
                            <Button variant="outline" onClick={() => setSelectedUser(null)} className="flex-1">Cancel</Button>
                            <Button onClick={handleUpdateUser} disabled={resetting} className="flex-1 bg-blue-600 hover:bg-blue-700">{resetting ? 'Updating...' : 'Save Changes'}</Button>
                        </div>
                    </Card>
                </div>
            )}

            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md shadow-2xl">
                        <CardHeader>
                            <CardTitle>Reset Password</CardTitle>
                            <CardDescription>Resetting for {selectedRequest.userName}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter at least 6 characters"
                                />
                            </div>
                        </CardContent>
                        <div className="flex gap-2 p-6 pt-0">
                            <Button variant="outline" onClick={() => setSelectedRequest(null)} className="flex-1">Cancel</Button>
                            <Button onClick={handleResetPassword} disabled={resetting} className="flex-1 bg-blue-600 hover:bg-blue-700">{resetting ? 'Resetting...' : 'Reset Password'}</Button>
                        </div>
                    </Card>
                </div>
            )}
            {(selectedProfileRequest || isManualProfileEdit) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => { setSelectedProfileRequest(null); setIsManualProfileEdit(false); }}>
                    <Card className="w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <CardHeader className="bg-slate-50 dark:bg-slate-950">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Update Profile: {profileEditForm.name}</CardTitle>
                                    <CardDescription>
                                        {selectedProfileRequest ? (
                                            <>Requested Modify: <span className="text-blue-600 font-bold">{selectedProfileRequest.fieldName}</span></>
                                        ) : (
                                            "Manual Profile Update"
                                        )}
                                    </CardDescription>
                                </div>
                                <button onClick={() => { setSelectedProfileRequest(null); setIsManualProfileEdit(false); }} className="text-slate-500 hover:text-red-500">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6 max-h-[70vh] overflow-y-auto">
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 bg-slate-100">
                                    {profileEditForm.profileImage ? (
                                        <img src={profileEditForm.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-full h-full p-4 text-slate-300" />
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={profileEditForm.name} onChange={e => setProfileEditForm({ ...profileEditForm, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Year & Department</Label>
                                    <Input value={profileEditForm.department} onChange={e => setProfileEditForm({ ...profileEditForm, department: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Room Number</Label>
                                    <Input value={profileEditForm.roomNumber} onChange={e => setProfileEditForm({ ...profileEditForm, roomNumber: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input value={profileEditForm.phoneNumber} onChange={e => setProfileEditForm({ ...profileEditForm, phoneNumber: e.target.value })} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Email Address</Label>
                                    <Input value={profileEditForm.email} onChange={e => setProfileEditForm({ ...profileEditForm, email: e.target.value })} />
                                </div>
                            </div>
                        </CardContent>
                        <div className="flex gap-2 p-6 bg-slate-50 dark:bg-slate-950 border-t items-center shrink-0">
                            <Button variant="outline" onClick={() => { setSelectedProfileRequest(null); setIsManualProfileEdit(false); }} className="flex-1">Cancel</Button>
                            <Button onClick={handleUpdateProfileFromRequest} disabled={resetting} className="flex-1 bg-blue-600 hover:bg-blue-700">
                                {resetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {selectedProfileRequest ? 'Update & Clear Request' : 'Save Changes'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
