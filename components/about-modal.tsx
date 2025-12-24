import { Button } from '@/components/ui/button';
import { Info, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
    const [view, setView] = useState<'info' | 'feedback' | 'success'>('info');
    const [rating, setRating] = useState<number>(0);

    // Reset view when modal closes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setView('info');
                setRating(0);
            }, 300); // Wait for close animation
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmitFeedback = () => {
        if (rating === 0) return;

        // You could send this to an API, but for now we'll just show success
        // and link to email if they want to say more
        setView('success');

        // Optional: Open email with the rating
        const mailto = `mailto:chideshv@gmail.com?subject=Hostel%20App%20Feedback&body=I%20gave%20the%20app%20a%20${rating}%20star%20rating!`;
        window.location.href = mailto;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl max-w-sm w-full space-y-4 animate-in fade-in zoom-in duration-200 shadow-2xl" onClick={e => e.stopPropagation()}>
                {view === 'info' && (
                    <>
                        <div className="text-center space-y-2">
                            <div className="flex justify-center mx-auto mb-2">
                                <img src="/logo-main.png" alt="Logo" className="h-16 w-16 object-contain rounded-full shadow-sm" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">About This App</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Hostel Management System</p>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2 text-center">
                            <p>Version 1.0.0</p>
                            <p className="font-semibold text-slate-900 dark:text-white">Developer: CHIDESH V</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">732224AI014 • DEPT. AI & DS</p>
                            <p className="font-medium text-slate-800 dark:text-slate-200 mt-2">FOR NANDHA ENGINEERING COLLEGE</p>
                            <p className="text-xs text-slate-400 mt-4">© 2024 All Rights Reserved</p>
                        </div>
                        <div className="space-y-3 pt-2">
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl transition-all active:scale-95"
                                onClick={onClose}
                            >
                                Close
                            </Button>

                            <button
                                className="uiverse-fancy-button w-full"
                                onClick={() => setView('feedback')}
                            >
                                <span className="top-key"></span>
                                <span className="text">Give Feedback</span>
                                <span className="bottom-key-1"></span>
                                <span className="bottom-key-2"></span>
                            </button>
                        </div>
                    </>
                )}

                {view === 'feedback' && (
                    <div className="text-center space-y-6 pt-2">
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rate Your Experience</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">How would you rate this app?</p>
                        </div>

                        <div className="uiverse-rating-container">
                            {[5, 4, 3, 2, 1].map((num) => (
                                <React.Fragment key={num}>
                                    <input
                                        id={`rating-${num}`}
                                        type="radio"
                                        name="rating"
                                        value={num}
                                        checked={rating === num}
                                        onChange={() => setRating(num)}
                                    />
                                    <label htmlFor={`rating-${num}`} title={`${num} stars`}>
                                        <svg viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"></path>
                                        </svg>
                                    </label>
                                </React.Fragment>
                            ))}
                        </div>

                        <div className="space-y-3 pt-4">
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                onClick={handleSubmitFeedback}
                                disabled={rating === 0}
                            >
                                {rating > 0 ? `Submit ${rating} Star Rating` : 'Select a Rating'}
                            </Button>

                            <Button
                                variant="ghost"
                                className="w-full text-slate-500 hover:text-slate-800"
                                onClick={() => setView('info')}
                            >
                                Back
                            </Button>
                        </div>
                    </div>
                )}

                {view === 'success' && (
                    <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                            <Star className="w-8 h-8 fill-current" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Thank You!</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px] mx-auto">
                                Your feedback helps us make the app better for everyone.
                            </p>
                        </div>
                        <Button
                            className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-semibold py-6 rounded-xl transition-all active:scale-95"
                            onClick={onClose}
                        >
                            Return to App
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

import React from 'react';
