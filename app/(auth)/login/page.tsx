'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordId, setForgotPasswordId] = useState('');
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [submittingReset, setSubmittingReset] = useState(false);
    const [showDevOpsLogin, setShowDevOpsLogin] = useState(false);
    const [signingInWithGoogle, setSigningInWithGoogle] = useState(false);
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

        if (!forgotPasswordEmail.trim() || !forgotPasswordEmail.includes('@')) {
            setError('Please enter a valid email address');
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
                    userEmail: forgotPasswordEmail
                })
            });

            if (res.ok) {
                alert('After Updated the Password Will Be Mailed');
                setShowForgotPassword(false);
                setForgotPasswordId('');
                setForgotPasswordEmail('');
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

    // DevOps Google Sign-In handler
    const handleDevOpsGoogleSignIn = async () => {
        setSigningInWithGoogle(true);
        setError('');

        try {
            const provider = new GoogleAuthProvider();
            // Explicitly request email and profile scopes
            provider.addScope('https://www.googleapis.com/auth/userinfo.email');
            provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

            const result = await signInWithPopup(auth, provider);

            // Try to get email from multiple sources
            let email = result.user.email;
            if (!email && result.user.providerData.length > 0) {
                email = result.user.providerData[0].email;
            }

            console.log('Google Sign-In Result:', {
                email: email,
                userEmail: result.user.email,
                providerEmail: result.user.providerData[0]?.email,
                displayName: result.user.displayName,
                uid: result.user.uid,
                providerData: result.user.providerData
            });

            // Only allow chideshtanya11@gmail.com (case-insensitive)
            const allowedEmail = 'chideshtanya11@gmail.com';
            if (!email || email.toLowerCase() !== allowedEmail.toLowerCase()) {
                console.error('Access denied for email:', email);
                setError(`Access denied. Email received: ${email || 'none'}. Only ${allowedEmail} is authorized.`);
                await auth.signOut(); // Sign out unauthorized user
                return;
            }

            console.log('Access granted for DevOps');

            // Create DevOps user session
            const devopsUser: User = {
                id: 'devops',
                email: email || undefined,
                role: 'devops',
                name: result.user.displayName || 'DevOps Admin'
            };

            login(devopsUser);
            router.push('/devops');
        } catch (err: any) {
            console.error('Google sign-in error details:', {
                code: err.code,
                message: err.message,
                fullError: err
            });

            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in cancelled');
            } else if (err.code === 'auth/unauthorized-domain') {
                setError('Domain not authorized. Please contact DevOps to add this domain to Firebase.');
            } else if (err.code === 'auth/popup-blocked') {
                setError('Popup blocked by browser. Please allow popups for this site.');
            } else if (err.code === 'auth/cancelled-popup-request') {
                setError('Another popup is already open. Please close it and try again.');
            } else {
                // Show detailed error for debugging
                const errorMsg = err.message || 'Unknown error';
                setError(`Sign-in failed: ${err.code || 'unknown-error'}. ${errorMsg}`);
            }
        } finally {
            setSigningInWithGoogle(false);
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
                            src="/logo-main.png"
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
                        <CardTitle className="text-2xl text-blue-900 font-bold uppercase tracking-tight">NEI Smart Hostel Login</CardTitle>
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
                                className="focus-visible:ring-2 focus-visible:ring-blue-600"
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
                                className="focus-visible:ring-2 focus-visible:ring-blue-600"
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
                                <Label htmlFor="forgotId">Your ID / Username</Label>
                                <Input
                                    id="forgotId"
                                    placeholder="Enter your student/admin ID"
                                    value={forgotPasswordId}
                                    onChange={(e) => setForgotPasswordId(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="forgotEmail">Your Email</Label>
                                <Input
                                    id="forgotEmail"
                                    type="email"
                                    placeholder="Enter your registered email"
                                    value={forgotPasswordEmail}
                                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                />
                                <p className="text-[10px] text-slate-500">We'll use this to verify your identity and contact you.</p>
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setForgotPasswordId('');
                                    setForgotPasswordEmail('');
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
                    <Card className="w-full max-w-md dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle className="dark:text-white">DevOps Access</CardTitle>
                            <CardDescription className="dark:text-slate-400">
                                Sign in with your authorized Google account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col items-center gap-4 py-4">
                                <svg className="w-12 h-12" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                                    Only authorized DevOps accounts
                                </p>
                            </div>
                            {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDevOpsLogin(false);
                                    setError('');
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDevOpsGoogleSignIn}
                                disabled={signingInWithGoogle}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                {signingInWithGoogle ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Sign in with Google
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
