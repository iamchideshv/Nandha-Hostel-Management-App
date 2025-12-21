'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordId, setForgotPasswordId] = useState('');
    const [submittingReset, setSubmittingReset] = useState(false);
    const [showDevOpsLogin, setShowDevOpsLogin] = useState(false);
    const [devOpsData, setDevOpsData] = useState({ email: '', password: '' });
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        id: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            login(data);

            // Redirect based on role
            if (data.role === 'admin') router.push('/admin');
            else if (data.role === 'authority') router.push('/authority');
            else if (data.role === 'send-off') router.push('/send-off');
            else if (data.role === 'devops') router.push('/devops');
            else router.push('/student');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!forgotPasswordId.trim()) {
            setError('Please enter your ID');
            return;
        }

        setSubmittingReset(true);
        setError('');

        try {
            // Fetch user details first
            const userRes = await fetch(`/api/users?id=${forgotPasswordId}`);
            const userData = await userRes.json();

            if (!userData || !userData.name) {
                setError('User not found');
                setSubmittingReset(false);
                return;
            }

            const res = await fetch('/api/password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: forgotPasswordId,
                    userName: userData.name,
                    userEmail: userData.email || ''
                })
            });

            if (res.ok) {
                alert('Password reset request submitted successfully! DevOps will process your request.');
                setShowForgotPassword(false);
                setForgotPasswordId('');
            } else {
                setError('Failed to submit password reset request');
            }
        } catch (err: any) {
            setError('Error submitting request');
        } finally {
            setSubmittingReset(false);
        }
    };

    const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

    const handleLogoPressStart = () => {
        const timer = setTimeout(() => {
            setShowDevOpsLogin(true);
        }, 2000); // 2 second hold
        setLongPressTimer(timer);
    };

    const handleLogoPressEnd = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
            {/* Back to Home Button */}
            <Link href="/" className="absolute top-4 left-4 md:top-6 md:left-6">
                <Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back to Home</span>
                </Button>
            </Link>

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <img
                            src="/logo.jpg"
                            alt="Logo"
                            className="h-16 w-16 object-contain rounded-lg shadow-sm cursor-pointer select-none transition-transform active:scale-95"
                            onMouseDown={handleLogoPressStart}
                            onMouseUp={handleLogoPressEnd}
                            onMouseLeave={handleLogoPressEnd}
                            onTouchStart={handleLogoPressStart}
                            onTouchEnd={handleLogoPressEnd}
                        />
                    </div>
                    <div className="flex items-center justify-center text-center">
                        <CardTitle className="text-2xl text-blue-900">Nandha Residencial Login</CardTitle>
                    </div>
                    <CardDescription className="text-center">
                        Enter your ID and password to access your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="id">Student/Admin/Send-offs ID</Label>
                            <Input
                                id="id"
                                placeholder="Ex: 21CSE001 or admin"
                                value={formData.id}
                                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-xs text-blue-600 hover:underline text-right"
                            >
                                Forgot Password?
                            </button>
                        </div>
                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sign In
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-blue-600 hover:underline font-medium">
                            Create New
                        </Link>
                    </p>
                </CardFooter>
            </Card>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Forgot Password</CardTitle>
                            <CardDescription>Enter your ID to request a password reset</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="forgotId">Your ID</Label>
                                <Input
                                    id="forgotId"
                                    placeholder="Enter your student/admin ID"
                                    value={forgotPasswordId}
                                    onChange={(e) => setForgotPasswordId(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setForgotPasswordId('');
                                    setError('');
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleForgotPassword}
                                disabled={submittingReset}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                {submittingReset ? 'Submitting...' : 'Raise Request'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* DevOps Login Modal */}
            {showDevOpsLogin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>DevOps Access</CardTitle>
                            <CardDescription>Enter DevOps ID to access password reset management</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="devopsEmail">DevOps Email</Label>
                                <Input
                                    id="devopsEmail"
                                    type="email"
                                    placeholder="Enter DevOps Email"
                                    value={devOpsData.email}
                                    onChange={(e) => setDevOpsData({ ...devOpsData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="devopsPassword">Password</Label>
                                <Input
                                    id="devopsPassword"
                                    type="password"
                                    placeholder="Enter Password"
                                    value={devOpsData.password}
                                    onChange={(e) => setDevOpsData({ ...devOpsData, password: e.target.value })}
                                />
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDevOpsLogin(false);
                                    setDevOpsData({ email: '', password: '' });
                                    setError('');
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={async () => {
                                    setIsLoading(true);
                                    setError('');
                                    try {
                                        const res = await fetch('/api/auth/login', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                id: devOpsData.email,
                                                password: devOpsData.password,
                                                isDevOps: true
                                            })
                                        });

                                        const data = await res.json();

                                        if (!res.ok) {
                                            throw new Error(data.error || 'Login failed');
                                        }

                                        login(data);
                                        router.push('/devops');
                                    } catch (err: any) {
                                        setError(err.message);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Access
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
