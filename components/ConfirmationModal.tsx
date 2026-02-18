'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import confirmationAnimation from '@/Confirmation.json';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'success' | 'destructive';
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'success'
}: ConfirmationModalProps) {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setIsConfirmed(false);
                setIsAnimating(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsAnimating(true);
        try {
            await onConfirm();
            setIsConfirmed(true);
            // Wait for animation to play a bit before closing
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            setIsAnimating(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={!isAnimating ? onClose : undefined}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full space-y-6 shadow-2xl relative overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {!isConfirmed ? (
                        <>
                            <div className="text-center space-y-3">
                                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${variant === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {variant === 'success' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {message}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 py-6 rounded-xl font-semibold border-slate-200 dark:border-slate-700"
                                    onClick={onClose}
                                    disabled={isAnimating}
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    className={`flex-1 py-6 rounded-xl font-semibold text-white shadow-lg transition-all active:scale-95 ${variant === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                    onClick={handleConfirm}
                                    disabled={isAnimating}
                                >
                                    {isAnimating ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </div>
                                    ) : confirmText}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-48 h-48 mx-auto">
                                <Lottie
                                    animationData={confirmationAnimation}
                                    loop={false}
                                    className="w-full h-full"
                                />
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-4"
                            >
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Action Confirmed!</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Successfully updated status</p>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
