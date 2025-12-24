'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Key, RefreshCw, Trash2, UserCog, Loader2, Search, MoreVertical } from 'lucide-react';

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

    useEffect(() => {
        fetchRequests();
        fetchUsers();
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
                fetchRequests(); // Refresh the list
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
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">DevOps Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Manage password reset requests</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Password Reset Requests</CardTitle>
                            <CardDescription>Review and process user password reset requests</CardDescription>
                        </div>
                        <Button onClick={fetchRequests} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-slate-500">Loading...</div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No pending password reset requests
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b">
                                    <tr className="text-left">
                                        <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">User ID</th>
                                        <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Name</th>
                                        <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Email</th>
                                        <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Request Date</th>
                                        <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((req) => (
                                        <tr key={req.id} className="border-b last:border-0">
                                            <td className="py-3 font-medium text-slate-900 dark:text-white">{req.userId}</td>
                                            <td className="py-3 text-slate-600 dark:text-slate-400">{req.userName}</td>
                                            <td className="py-3 text-slate-600 dark:text-slate-400">{req.userEmail || 'N/A'}</td>
                                            <td className="py-3 text-slate-600 dark:text-slate-400">
                                                {new Date(req.requestDate).toLocaleString()}
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setSelectedRequest(req)}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <Key className="w-4 h-4 mr-1" />
                                                        Reset Password
                                                    </Button>

                                                    <div className="relative">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="p-1 h-8 w-8"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuId(openMenuId === req.id ? null : req.id);
                                                            }}
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>

                                                        {openMenuId === req.id && (
                                                            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-800 border rounded-md shadow-lg z-50 overflow-hidden">
                                                                <button
                                                                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                                                    disabled={deletingRequestId === req.id}
                                                                    onClick={() => handleDeleteRequest(req.id)}
                                                                >
                                                                    {deletingRequestId === req.id ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="w-3 h-3" />
                                                                    )}
                                                                    Delete Request
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
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
                <CardHeader className="bg-red-50/50">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-red-900">All User Logins (Master Access)</CardTitle>
                            <CardDescription className="text-red-700">View all registered users and their plain-text passwords</CardDescription>
                        </div>
                        <Button onClick={fetchUsers} variant="outline" size="sm" className="border-red-200 hover:bg-red-100 text-red-700">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh User List
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        <div className="w-full md:w-48">
                            <select
                                className="w-full h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                <option value="student">Students</option>
                                <option value="admin">Admins</option>
                                <option value="send-off">Send-off</option>
                                <option value="authority">Authority</option>
                                <option value="devops">DevOps</option>
                            </select>
                        </div>
                        <div className="w-full md:w-48">
                            <select
                                className="w-full h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
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
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No users found in the database
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b">
                                    <tr className="text-left">
                                        <th className="pb-3 font-semibold text-slate-700">Login ID / Username</th>
                                        <th className="pb-3 font-semibold text-slate-700">Full Name</th>
                                        <th className="pb-3 font-semibold text-slate-700">Role</th>
                                        <th className="pb-3 font-semibold text-slate-700">Hostel</th>
                                        <th className="pb-3 font-semibold text-slate-700 font-mono text-red-600">Password</th>
                                        <th className="pb-3 font-semibold text-slate-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="py-3 font-medium text-slate-900">{u.id}</td>
                                            <td className="py-3 text-slate-600">{u.name}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    u.role === 'devops' ? 'bg-red-100 text-red-700' :
                                                        u.role === 'authority' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-3 text-slate-600">{u.hostelName || 'N/A'}</td>
                                            <td className="py-3">
                                                <code className="px-2 py-1 bg-yellow-100 text-red-700 rounded font-bold border border-yellow-200">
                                                    {u.password || 'SECRET'}
                                                </code>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedUser(u);
                                                            setEditData({
                                                                id: u.id,
                                                                name: u.name,
                                                                password: u.password || '',
                                                                role: u.role
                                                            });
                                                        }}
                                                        className="hover:text-blue-600 hover:border-blue-600"
                                                    >
                                                        <UserCog className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={deletingId === u.id}
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="hover:text-red-600 hover:border-red-600"
                                                    >
                                                        {deletingId === u.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
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

            {/* Edit User Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md shadow-2xl">
                        <CardHeader>
                            <CardTitle>Edit User: {selectedUser.name}</CardTitle>
                            <CardDescription>Update Login ID, Full Name, or Password</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="editId">Login ID / Username</Label>
                                <Input
                                    id="editId"
                                    value={editData.id}
                                    onChange={(e) => setEditData({ ...editData, id: e.target.value })}
                                    placeholder="Enter new login ID"
                                />
                                <p className="text-[10px] text-amber-600 font-medium">Warning: Changing this will change their login username.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editName">Full Name</Label>
                                <Input
                                    id="editName"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editPassword">Password</Label>
                                <Input
                                    id="editPassword"
                                    value={editData.password}
                                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editRole">User Role</Label>
                                <select
                                    id="editRole"
                                    className="w-full h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
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
                            <Button
                                variant="outline"
                                onClick={() => setSelectedUser(null)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdateUser}
                                disabled={resetting}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                                {resetting ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Password Reset Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md shadow-2xl">
                        <CardHeader>
                            <CardTitle>Reset Password</CardTitle>
                            <CardDescription>
                                Setting new password for <strong>{selectedRequest.userName}</strong> ({selectedRequest.userId})
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Enter new password (min 6 characters)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <div className="flex gap-2 p-6 pt-0">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectedRequest(null);
                                    setNewPassword('');
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleResetPassword}
                                disabled={resetting}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                {resetting ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
