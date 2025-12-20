'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

interface OutpassData {
    id: string;
    studentName: string;
    studentId: string;
    reason: string;
    fromDate: string;
    toDate: string;
    status: string;
    createdAt: string;
}

export default function AuthorityDashboard() {
    const { user } = useAuth();
    const [outpasses, setOutpasses] = useState<OutpassData[]>([]);

    const fetchOutpasses = async () => {
        try {
            const res = await fetch('/api/outpass');
            const data = await res.json();
            setOutpasses(data);
        } catch {
            toast.error('Failed to fetch outpasses');
        }
    };

    useEffect(() => {
        fetchOutpasses();
    }, [user]);

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch('/api/outpass', {
                method: 'PATCH',
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                toast.success(`Outpass ${status}`);
                fetchOutpasses();
            }
        } catch {
            toast.error('Factory error');
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Outpass Requests</h1>
                    <p className="text-slate-500">Approve or reject student outpass applications</p>
                </div>
            </div>

            <div className="grid gap-4">
                {outpasses.length === 0 ? <p className="text-slate-500">No requests found.</p> :
                    outpasses.map(o => (
                        <Card key={o.id} className={o.status !== 'pending' ? 'opacity-70' : ''}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{o.studentName} <span className="text-sm font-normal text-slate-500">({o.studentId})</span></CardTitle>
                                        <CardDescription>Requested on {new Date(o.createdAt).toLocaleDateString()}</CardDescription>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${o.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        o.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {o.status}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-slate-50 p-4 rounded-lg mb-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Reason</p>
                                        <p className="font-medium">{o.reason}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Duration</p>
                                        <p className="font-medium">{o.fromDate} — {o.toDate}</p>
                                    </div>
                                </div>

                                {o.status === 'pending' && (
                                    <div className="flex gap-2 justify-end">
                                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => updateStatus(o.id, 'rejected')}>
                                            <X className="w-4 h-4 mr-2" /> Reject
                                        </Button>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(o.id, 'approved')}>
                                            <Check className="w-4 h-4 mr-2" /> Approve
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                }
            </div>
        </div>
    );
}
