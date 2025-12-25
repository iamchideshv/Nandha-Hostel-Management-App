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
import { User as UserIcon, Shield, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import confetti from 'canvas-confetti';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordId, setForgotPasswordId] = useState('');
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [submittingReset, setSubmittingReset] = useState(false);
    const [showDevOpsLogin, setShowDevOpsLogin] = useState(false);
    const [signingInWithGoogle, setSigningInWithGoogle] = useState(false);
    const [isRegisterPage, setIsRegisterPage] = useState(false);

    // Login Form State
    const [loginData, setLoginData] = useState({
        id: '',
        password: ''
    });

    // Register Form State
    const [registerRole, setRegisterRole] = useState<'student' | 'admin' | 'send-off'>('student');
    const [registerData, setRegisterData] = useState({
        id: '',
        password: '',
        name: '',
        hostelName: 'NRI-1',
        roomNumber: '',
        secretCode: ''
    });
    const [hostelType, setHostelType] = useState<'boys' | 'girls'>('boys');

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
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
            const msg = "Invalid Credential 😒";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRegisterLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...registerData, role: registerRole }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Celebration!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2563eb', '#3b82f6', '#1e40af', '#60a5fa']
            });

            login(data);
            if (data.role === 'admin') router.push('/admin');
            else if (data.role === 'send-off') router.push('/send-off');
            else router.push('/student');

        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsRegisterLoading(false);
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
            <Link href="/" className="absolute top-4 left-4 md:top-6 md:left-6 z-50">
                <Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back to Home</span>
                </Button>
            </Link>

            <div className="auth-wrapper pt-12 md:pt-0">
                <input
                    id="auth-toggle"
                    type="checkbox"
                    className="auth-toggle"
                    checked={isRegisterPage}
                    onChange={(e) => setIsRegisterPage(e.target.checked)}
                />
                <div className="auth-switch-container flex items-center justify-center gap-8 mb-4">
                    <span className={`text-sm font-black uppercase tracking-wider transition-all ${!isRegisterPage ? 'text-blue-600 underline decoration-2 underline-offset-4' : 'text-slate-400 opacity-60'}`}>
                        Log in
                    </span>
                    <label htmlFor="auth-toggle" className="auth-switch">
                        <span className="auth-slider"></span>
                    </label>
                    <span className={`text-sm font-black uppercase tracking-wider transition-all ${isRegisterPage ? 'text-blue-600 underline decoration-2 underline-offset-4' : 'text-slate-400 opacity-60'}`}>
                        Sign up
                    </span>
                </div>

                <div className="flip-card__inner">
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={isRegisterPage}
                        readOnly
                    />
                    {/* Front Side: Login */}
                    <div className="flip-card__front">
                        <div className="flex justify-center mb-2">
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
                        <div className="flip-card__title">Log in</div>
                        <form className="flip-card__form" onSubmit={handleLoginSubmit}>
                            <input
                                className="flip-card__input"
                                placeholder="Student/Admin ID"
                                type="text"
                                value={loginData.id}
                                onChange={(e) => setLoginData({ ...loginData, id: e.target.value })}
                                required
                            />
                            <input
                                className="flip-card__input"
                                placeholder="Password"
                                type="password"
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                required
                            />
                            <div className="w-full text-right">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-[10px] text-blue-600 hover:underline font-bold"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <button className="flip-card__btn" disabled={isLoading}>
                                {isLoading ? 'Wait...' : "Let's go!"}
                            </button>
                        </form>
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setIsRegisterPage(true)}
                                className="text-[10px] text-slate-500 font-bold hover:text-blue-600 transition-colors"
                            >
                                Don't Have An Account? <span className="text-blue-600 underline">create new</span>
                            </button>
                        </div>
                    </div>

                    {/* Back Side: Sign up */}
                    <div className="flip-card__back">
                        <div className="flip-card__title">Sign up</div>

                        <div className="flex flex-wrap justify-center gap-2 mb-2">
                            <button
                                type="button"
                                onClick={() => { setRegisterRole('student'); setRegisterData({ ...registerData, secretCode: '' }) }}
                                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold border-2 border-black transition-all active:translate-y-1 ${registerRole === 'student' ? 'bg-blue-600 text-white translate-y-1' : 'bg-white text-black translate-y-0'}`}
                            >
                                <UserIcon className="h-3 w-3" /> <span>Student</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRegisterRole('admin')}
                                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold border-2 border-black transition-all active:translate-y-1 ${registerRole === 'admin' ? 'bg-blue-600 text-white translate-y-1' : 'bg-white text-black translate-y-0'}`}
                            >
                                <Shield className="h-3 w-3" /> <span>Admin</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRegisterRole('send-off')}
                                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold border-2 border-black transition-all active:translate-y-1 ${registerRole === 'send-off' ? 'bg-blue-600 text-white translate-y-1' : 'bg-white text-black translate-y-0'}`}
                            >
                                <KeyRound className="h-3 w-3" /> <span>PWS</span>
                            </button>
                        </div>

                        <form className="flip-card__form" onSubmit={handleRegisterSubmit}>
                            <input
                                className="flip-card__input"
                                placeholder={registerRole === 'student' ? "Full Name" : "Name"}
                                type="text"
                                value={registerData.name}
                                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                required
                            />
                            <input
                                className="flip-card__input"
                                placeholder={registerRole === 'student' ? "Ex: 21CSE001" : "Login ID"}
                                type="text"
                                value={registerData.id}
                                onChange={(e) => setRegisterData({ ...registerData, id: e.target.value })}
                                required
                            />

                            {(registerRole === 'student' || registerRole === 'admin') && (
                                <select
                                    className="flip-card__input"
                                    value={registerData.hostelName}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const isGirls = val.includes('AKSHAYA');
                                        setHostelType(isGirls ? 'girls' : 'boys');
                                        setRegisterData({ ...registerData, hostelName: val });
                                        toast(isGirls ? "Hey Girls🦋" : "Hey Man🔥", { duration: 2000 });
                                    }}
                                >
                                    <option value="NRI-1">NRI-1</option>
                                    <option value="NRI-2">NRI-2</option>
                                    <option value="NRI-3">NRI-3</option>
                                    <option value="NRI-4">NRI-4</option>
                                    <option value="AKSHAYA-1">AKSHAYA-1</option>
                                    <option value="AKSHAYA-2">AKSHAYA-2</option>
                                    <option value="AKSHAYA-3">AKSHAYA-3</option>
                                    <option value="AKSHAYA-4">AKSHAYA-4</option>
                                </select>
                            )}

                            {registerRole === 'student' && (
                                <input
                                    className="flip-card__input"
                                    placeholder="Room Number"
                                    type="text"
                                    value={registerData.roomNumber}
                                    onChange={(e) => setRegisterData({ ...registerData, roomNumber: e.target.value })}
                                    required
                                />
                            )}

                            <input
                                className="flip-card__input"
                                placeholder="Set Password"
                                type="password"
                                value={registerData.password}
                                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                required
                            />

                            {(registerRole === 'admin' || registerRole === 'send-off') && (
                                <input
                                    className="flip-card__input border-red-500"
                                    placeholder="Secret Code"
                                    type="password"
                                    value={registerData.secretCode}
                                    onChange={(e) => setRegisterData({ ...registerData, secretCode: e.target.value })}
                                    required
                                />
                            )}

                            <button className="flip-card__btn" disabled={isRegisterLoading}>
                                {isRegisterLoading ? 'Registering...' : 'Confirm!'}
                            </button>
                        </form>
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setIsRegisterPage(false)}
                                className="text-[10px] text-slate-500 font-bold hover:text-blue-600 transition-colors"
                            >
                                Already Have An Account? <span className="text-blue-600 underline">login</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {
                showForgotPassword && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <CardHeader>
                                <CardTitle className="text-xl font-black">Forgot Password</CardTitle>
                                <CardDescription className="font-bold">Enter your ID to request a password reset</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="forgotId" className="font-bold">Your ID / Username</Label>
                                    <Input
                                        id="forgotId"
                                        className="border-2 border-black"
                                        placeholder="Enter your student/admin ID"
                                        value={forgotPasswordId}
                                        onChange={(e) => setForgotPasswordId(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="forgotEmail" className="font-bold">Your Email</Label>
                                    <Input
                                        id="forgotEmail"
                                        className="border-2 border-black"
                                        type="email"
                                        placeholder="Enter your registered email"
                                        value={forgotPasswordEmail}
                                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                    />
                                    <p className="text-[10px] text-slate-500 font-bold italic">After moderation, password will be sent to your email.</p>
                                </div>
                                {error && <p className="text-sm text-red-500 font-black">{error}</p>}
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
                                    className="flex-1 border-2 border-black font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleForgotPassword}
                                    disabled={submittingReset}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
                                >
                                    {submittingReset ? 'Wait...' : 'Request'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )
            }

            {/* DevOps Login Modal */}
            {
                showDevOpsLogin && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-md dark:bg-slate-900 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <CardHeader>
                                <CardTitle className="dark:text-white font-black">DevOps Access</CardTitle>
                                <CardDescription className="dark:text-slate-400 font-bold">
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
                                    <p className="text-sm text-slate-600 dark:text-slate-400 text-center font-bold">
                                        Only authorized DevOps accounts
                                    </p>
                                </div>
                                {error && <p className="text-sm text-red-500 font-black text-center">{error}</p>}
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowDevOpsLogin(false);
                                        setError('');
                                    }}
                                    className="flex-1 border-2 border-black font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDevOpsGoogleSignIn}
                                    disabled={signingInWithGoogle}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
                                >
                                    {signingInWithGoogle ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Wait...
                                        </>
                                    ) : (
                                        <>
                                            Sign in with Google
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )
            }
        </div >
    );
}
