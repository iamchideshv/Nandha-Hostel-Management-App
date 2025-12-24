'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Shield, KeyRound } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [role, setRole] = useState<'student' | 'admin' | 'send-off'>('student');

    const [formData, setFormData] = useState({
        id: '',
        password: '',
        name: '',
        hostelName: 'NRI-1',
        roomNumber: '',
        secretCode: ''
    });
    const [hostelType, setHostelType] = useState<'boys' | 'girls'>('boys');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            login(data);
            if (data.role === 'admin') router.push('/admin');
            else if (data.role === 'send-off') router.push('/send-off');
            else router.push('/student');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-6">
                        <img src="/logo-main.png" alt="Logo" className="h-20 w-20 object-contain rounded-xl shadow-md border-2 border-white" />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                        <button
                            onClick={() => { setRole('student'); setFormData({ ...formData, secretCode: '' }) }}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition-colors ${role === 'student' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <User className="h-3 w-3" /> <span>Student</span>
                        </button>
                        <button
                            onClick={() => setRole('admin')}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition-colors ${role === 'admin' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <Shield className="h-3 w-3" /> <span>Admin</span>
                        </button>
                        <button
                            onClick={() => setRole('send-off')}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition-colors ${role === 'send-off' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <KeyRound className="h-3 w-3" /> <span>Send-off</span>
                        </button>
                    </div>
                    <CardTitle className="text-2xl text-center text-blue-900">
                        {role === 'student' ? 'Student Registration' : role === 'admin' ? 'Admin Registration' : 'Send-Off / Security'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {role === 'student' ? 'Create your hostel account' : 'Register with your unique code'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="id">{role === 'student' ? 'Student ID' : role === 'send-off' ? 'PWS ID' : 'Warden Code (ID)'}</Label>
                            <Input
                                id="id"
                                placeholder={role === 'student' ? "Ex: 21CSE001" : role === 'send-off' ? "Enter PWS ID" : "Ex: WARDEN_01"}
                                value={formData.id}
                                className={`focus-visible:ring-2 ${hostelType === 'boys' ? 'focus-visible:ring-blue-600' : 'focus-visible:ring-pink-500'}`}
                                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">{role === 'student' ? 'Full Name' : 'Name '}</Label>
                            <Input
                                id="name"
                                placeholder={role === 'student' ? "John Doe" : role === 'send-off' ? "Security Name" : "Warden name"}
                                value={formData.name}
                                className={`focus-visible:ring-2 ${hostelType === 'boys' ? 'focus-visible:ring-blue-600' : 'focus-visible:ring-pink-500'}`}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        {role === 'student' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hostelName">Hostel</Label>
                                    <select
                                        className={`flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 transition-all ${hostelType === 'boys' ? 'focus-visible:ring-blue-600' : 'focus-visible:ring-pink-500'}`}
                                        value={formData.hostelName}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const isGirls = val.includes('AKSHAYA');
                                            setHostelType(isGirls ? 'girls' : 'boys');
                                            setFormData({ ...formData, hostelName: val });
                                            toast(isGirls ? "Hey Girls🦋" : "Hey Man🔥", { duration: 5000 });
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
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="roomNumber">Room No</Label>
                                    <Input
                                        id="roomNumber"
                                        placeholder="101"
                                        className={`focus-visible:ring-2 ${hostelType === 'boys' ? 'focus-visible:ring-blue-600' : 'focus-visible:ring-pink-500'}`}
                                        value={formData.roomNumber}
                                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        {role === 'admin' && (
                            <div className="space-y-2">
                                <Label htmlFor="hostelName">Admin Of Hostel</Label>
                                <select
                                    className={`flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 transition-all ${hostelType === 'boys' ? 'focus-visible:ring-blue-600' : 'focus-visible:ring-pink-500'}`}
                                    value={formData.hostelName}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const isGirls = val.includes('AKSHAYA');
                                        setHostelType(isGirls ? 'girls' : 'boys');
                                        setFormData({ ...formData, hostelName: val });
                                        toast(isGirls ? "Hey Girls🦋" : "Hey Man🔥", { duration: 5000 });
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
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                className={`focus-visible:ring-2 ${hostelType === 'boys' ? 'focus-visible:ring-blue-600' : 'focus-visible:ring-pink-500'}`}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        {(role === 'admin' || role === 'send-off') && (
                            <div className="space-y-2">
                                <Label htmlFor="secretCode" className="text-red-600">
                                    {role === 'admin' ? 'Admin Secret Code' : 'Send-Off Secret Code'}
                                </Label>
                                <Input
                                    id="secretCode"
                                    type="password"
                                    placeholder="Enter Secret Code"
                                    value={formData.secretCode}
                                    onChange={(e) => setFormData({ ...formData, secretCode: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Register
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline font-medium">
                            Sign In
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
