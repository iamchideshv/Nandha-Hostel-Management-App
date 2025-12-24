'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import { ScanLine, CheckCircle, XCircle, LogOut, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AboutModal } from '@/components/about-modal';

export default function SendOffDashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [scanResult, setScanResult] = useState<any>(null);
    const [scanning, setScanning] = useState(false);
    const [scanMode, setScanMode] = useState<'EXIT' | 'ENTRY'>('EXIT');
    const [showAbout, setShowAbout] = useState(false);
    const [isPushed, setIsPushed] = useState(false);
    const [isExpired, setIsExpired] = useState(false);

    // Scanner Ref
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'send-off') {
            // Optional: Redirect
        }

        return () => {
            if (scannerRef.current && scannerRef.current.getState() === 2) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current?.clear();
                }).catch(() => { /* silent catch */ });
            }
        };
    }, [user]);

    const startScanning = () => {
        setScanning(true);
        setScanResult(null);
        setIsPushed(false);
        setIsExpired(false);

        // Timeout to allow UI render of 'reader' div
        setTimeout(() => {
            try {
                // Always create a fresh instance because the 'reader' div is conditionally rendered
                // and might have been destroyed/recreated since last scan
                if (scannerRef.current) {
                    try { scannerRef.current.clear(); } catch (e) { }
                }

                scannerRef.current = new Html5Qrcode("reader");
                const html5QrCode = scannerRef.current;

                const qrboxSize = (width: number, height: number) => {
                    const minEdgeSize = Math.min(width, height);
                    const qrboxPercentage = 0.70; // 70%
                    const qrSize = Math.floor(minEdgeSize * qrboxPercentage);
                    return {
                        width: qrSize,
                        height: qrSize
                    };
                };

                html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 20, // Increased for smoother detection
                        qrbox: qrboxSize,
                        aspectRatio: 1.0
                    },
                    (decodedText, decodedResult) => {
                        onScanSuccess(decodedText, decodedResult);
                    },
                    (errorMessage) => {
                        // parse error, ignore
                    }
                ).catch(err => {
                    console.error("Error starting scanner", err);
                    setScanning(false);

                    // Specific error handling
                    if (err?.toString().includes("Camera streaming not supported") ||
                        err?.toString().includes("NotSupportedError") ||
                        (!window.isSecureContext && window.location.protocol !== 'file:')) {
                        toast.error("Camera Access Blocked", {
                            description: "Your browser requires HTTPS for camera. Please access via desktop browser or use 'chrome://flags/#unsafely-treat-insecure-origin-as-secure' on mobile Chrome.",
                            duration: 10000,
                        });
                    } else if (err?.name === "NotAllowedError" || err?.toString().includes("Permission denied")) {
                        toast.error("Camera Permission Denied", {
                            description: "Please allow camera access when prompted by your browser.",
                            duration: 5000
                        });
                    } else if (err?.toString().includes("NotFoundError") || err?.toString().includes("No camera")) {
                        toast.error("No Camera Found", {
                            description: "Your device doesn't have a compatible camera.",
                            duration: 5000
                        });
                    } else {
                        toast.error("Camera Error", {
                            description: `Could not start camera: ${err?.message || 'Unknown error'}. Try refreshing or use a desktop browser.`,
                            duration: 7000
                        });
                    }
                });
            } catch (initErr) {
                console.error("Scanner init error:", initErr);
                setScanning(false);
                toast.error("Scanner Initialization Failed");
            }
        }, 150);
    };

    const stopScanning = () => {
        setScanning(false);
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                if (state !== 1) { // Not IDLE
                    scannerRef.current.stop()
                        .then(() => {
                            try { scannerRef.current?.clear(); } catch (e) { }
                            scannerRef.current = null; // Reset ref
                        })
                        .catch(() => {
                            scannerRef.current = null;
                        });
                } else {
                    scannerRef.current = null;
                }
            } catch (err) {
                scannerRef.current = null;
            }
        }
    };

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        // Stop scanning immediately to prevent duplicate triggers while processing
        stopScanning();

        try {
            const data = JSON.parse(decodedText);

            // First, verify the outpass status from database
            const statusRes = await fetch(`/api/outpass?outpassId=${data.id}`);
            if (!statusRes.ok) {
                toast.error('Failed to verify outpass');
                setScanResult({ error: 'Verification Failed' });
                return;
            }


            const outpassFromDB = await statusRes.json();

            console.log('DB Status:', outpassFromDB.status, '| QR Status:', data.status);

            // Check if outpass is expired or not approved
            if (outpassFromDB.status === 'expired') {
                toast.error('Outpass Expired', {
                    description: 'This QR code has been expired and is no longer valid.',
                    duration: 5000
                });
                // Set scan result to show ACCESS DENIED
                setScanResult({ ...data, status: 'DENIED', error: 'EXPIRED' });
                return;
            }

            if (scanMode === 'EXIT' && (outpassFromDB.status === 'exited' || outpassFromDB.status === 'entered')) {
                toast.error('Already Exited', {
                    description: 'This student has already scanned out.',
                    duration: 5000
                });
                setScanResult({ ...data, status: 'DENIED', error: 'ALREADY EXITED' });
                return;
            }

            if (scanMode === 'ENTRY' && outpassFromDB.status === 'entered') {
                toast.error('Already Entered', {
                    description: 'This student has already scanned in.',
                    duration: 5000
                });
                setScanResult({ ...data, status: 'DENIED', error: 'ALREADY ENTERED' });
                return;
            }

            // Proceed with original validation
            setScanResult({ ...data, dbStatus: outpassFromDB.status });

            // Only show success message, don't log to Excel yet
            // Excel logging will happen when user clicks "Push to Sheets" button
            const statusLabel = outpassFromDB.status.toUpperCase();
            toast.success(`Access Granted (${statusLabel})`, {
                description: `Click "Push to Sheets" to record the ${scanMode} time.`
            });

        } catch (e) {
            toast.error('Invalid QR Code Format');
            setScanResult({ error: 'Invalid QR Code' });
        }
    };

    const onScanFailure = (error: any) => {
        // handle scan failure, usually better to ignore and keep scanning.
        // console.warn(`Code scan error = ${error}`);
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Send-Off Security</h1>
                    <p className="text-slate-500 text-sm">PWS ID: {user?.id} • {user?.name}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Scanner Section */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ScanLine className="w-5 h-5 mr-2 text-blue-600" />
                            Scan Outpass
                        </CardTitle>
                        <CardDescription>Scan student QR code to verify details</CardDescription>
                        <div className="flex p-1 bg-slate-100 rounded-lg mt-4 w-full">
                            <button
                                onClick={() => setScanMode('EXIT')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${scanMode === 'EXIT' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                EXIT SCAN
                            </button>
                            <button
                                onClick={() => setScanMode('ENTRY')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${scanMode === 'ENTRY' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                ENTRY SCAN
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                        {!scanning && !scanResult && (
                            <div className="text-center space-y-4">
                                <div className="w-32 h-32 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
                                    <ScanLine className="w-12 h-12 text-slate-400" />
                                </div>
                                <Button onClick={startScanning} className="w-full">
                                    Launch Camera Scanner
                                </Button>
                            </div>
                        )}

                        {scanning && (
                            <div className="w-full space-y-4">
                                <div id="reader" className="w-full"></div>
                                <Button variant="outline" onClick={stopScanning} className="w-full">
                                    Cancel Scan
                                </Button>
                            </div>
                        )}

                        {scanResult && (
                            <div className="w-full text-center space-y-4 animate-in fade-in zoom-in duration-300">
                                {(scanResult.status === 'APPROVED' && !scanResult.error) ? (
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-12 h-12 text-green-600" />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <XCircle className="w-12 h-12 text-red-600" />
                                    </div>
                                )}

                                <h3 className={`text-xl font-bold ${(scanResult.status === 'APPROVED' && !scanResult.error) ? 'text-green-700' : 'text-red-700'}`}>
                                    {(scanResult.status === 'APPROVED' && !scanResult.error) ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                                </h3>

                                {scanResult.error && (
                                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg">
                                        <p className="font-semibold">❌ {scanResult.error}</p>
                                    </div>
                                )}

                                <div className="bg-slate-50 p-4 rounded-lg text-left text-sm space-y-2 border">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-slate-500">Outpass ID</span>
                                        <span className="font-mono text-xs">{scanResult.id ? scanResult.id.slice(0, 12) : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-slate-500">Student Name</span>
                                        <span className="font-semibold">{scanResult.student || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-slate-500">Hostel Name</span>
                                        <span className="font-semibold">{scanResult.hostelName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-slate-500">College Name</span>
                                        <span className="font-semibold text-xs">{scanResult.collegeName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-slate-500">Year & Dept</span>
                                        <span className="font-semibold">{scanResult.yearAndDept || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-slate-500">Room No</span>
                                        <span className="font-semibold">{scanResult.roomNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-slate-500">From Date</span>
                                        <span className="font-semibold">{scanResult.valid?.split(' to ')[0] || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-slate-500">To Date</span>
                                        <span className="font-semibold">{scanResult.valid?.split(' to ')[1] || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-slate-500">Reason</span>
                                        <span className="font-semibold text-xs">{scanResult.reason || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-slate-500">Scan Type</span>
                                        <span className={`font-bold ${scanMode === 'EXIT' ? 'text-blue-600' : 'text-green-600'}`}>{scanMode}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Time</span>
                                        <span className="font-semibold text-xs">{new Date().toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Push to Sheets Button - Only show for APPROVED scans */}
                                {scanResult.status === 'APPROVED' && !scanResult.error && (
                                    <Button
                                        onClick={async () => {
                                            if (isPushed) return; // Prevent double-click

                                            try {
                                                // Step 1: Log to Excel FIRST
                                                const excelRes = await fetch('/api/exit-record', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        studentName: scanResult.student,
                                                        fromDate: scanResult.valid?.split(' to ')[0],
                                                        toDate: scanResult.valid?.split(' to ')[1],
                                                        collegeName: scanResult.collegeName,
                                                        hostelName: scanResult.hostelName,
                                                        roomNumber: scanResult.roomNumber,
                                                        yearAndDept: scanResult.yearAndDept,
                                                        reason: scanResult.reason,
                                                        outpassId: scanResult.id,
                                                        scanType: scanMode,
                                                        pwsId: user?.id
                                                    })
                                                });

                                                if (!excelRes.ok) {
                                                    const errData = await excelRes.json();
                                                    toast.error(`Excel Log Failed: ${errData.error || 'Unknown'}`);
                                                    return;
                                                }

                                                toast.success(`✅ ${scanMode} data pushed to Excel sheet`);
                                                setIsPushed(true); // Mark as pushed

                                                // Step 2: Update status to track progress
                                                const nextStatus = scanMode === 'EXIT' ? 'exited' : 'entered';
                                                const res = await fetch(`/api/outpass`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        id: scanResult.id,
                                                        status: nextStatus
                                                    })
                                                });

                                                if (res.ok) {
                                                    toast.success(scanMode === 'EXIT' ? '🔓 Student Exited' : '🏠 Student Entered');
                                                    // Keep result visible but update its effective status for UI
                                                    setScanResult({ ...scanResult, dbStatus: nextStatus });
                                                } else {
                                                    toast.error('Failed to update outpass status');
                                                }
                                            } catch (err) {
                                                toast.error('Error processing request');
                                                console.error(err);
                                            }
                                        }}
                                        disabled={isPushed}
                                        className={`w-full ${isPushed ? 'bg-gray-400 cursor-not-allowed' : scanMode === 'EXIT' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                                    >
                                        {isPushed ? '✅ Pushed' : '📊 Push to Sheets'}
                                    </Button>
                                )}

                                <Button onClick={startScanning} className="w-full" variant="outline">
                                    Scan Another
                                </Button>

                                {/* Expire QR Code - Only show after both EXIT and ENTRY are completed and pushed */}
                                {scanResult.dbStatus === 'entered' && (
                                    <Button
                                        onClick={async () => {
                                            if (isExpired) return; // Prevent double-click

                                            if (confirm('Are you sure you want to expire this QR code without logging to Excel?')) {
                                                try {
                                                    const res = await fetch(`/api/outpass`, {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            id: scanResult.id,
                                                            status: 'expired'
                                                        })
                                                    });

                                                    if (res.ok) {
                                                        toast.success('🚫 QR Code Expired');
                                                        setScanResult({ ...scanResult, status: 'EXPIRED', error: 'Manually Expired' });
                                                        setIsExpired(true); // Mark as expired
                                                    } else {
                                                        toast.error('Failed to expire QR code');
                                                    }
                                                } catch (err) {
                                                    toast.error('Error expiring QR code');
                                                    console.error(err);
                                                }
                                            }
                                        }}
                                        disabled={isExpired}
                                        className={`w-full ${isExpired ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                                        variant="destructive"
                                    >
                                        {isExpired ? '✅ Expired' : '🚫 Expire QR Code'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Instructions / Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-slate-600">
                        <p>1. Ensure you have allowed camera permissions.</p>
                        <p>2. Ask the student to show the QR Code from their dashboard.</p>
                        <p>3. Align the QR code within the frame.</p>
                        <p>4. Verify the details (Name, Date) on screen match the student.</p>

                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                            <h4 className="font-semibold text-yellow-800 mb-1">Security Note</h4>
                            <p>Only "APPROVED" outpasses are valid for exit. Check the dates strictly.</p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                            <h4 className="font-semibold text-blue-800 mb-1">Mobile Camera Issue?</h4>
                            <p className="mb-2">Browsers block cameras on non-secure (HTTP) connections.</p>
                            <p className="font-medium text-blue-900">To fix on Android (Chrome/Edge):</p>
                            <ol className="list-decimal pl-5 space-y-1 mt-1">
                                <li>Open <code>chrome://flags</code></li>
                                <li>Search <code>insecure origins</code></li>
                                <li>Enable <strong>"Insecure origins treated as secure"</strong></li>
                                <li>Add your IP: <code>http://10.144.77.232:3000</code></li>
                                <li>Relaunch Browser</li>
                            </ol>
                        </div>
                    </CardContent>
                </Card>
                <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
            </div>
        </div>
    );
}
