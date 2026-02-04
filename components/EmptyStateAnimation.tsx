"use client";

import React from 'react';
import Lottie from 'lottie-react';

interface EmptyStateAnimationProps {
    animationData: any;
    text: string;
    subtext?: string;
    className?: string;
}

const EmptyStateAnimation: React.FC<EmptyStateAnimationProps> = ({
    animationData,
    text,
    subtext,
    className = ""
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-8 px-4 text-center ${className}`}>
            <div className="w-64 h-64 md:w-80 md:h-80">
                <Lottie
                    animationData={animationData}
                    loop={true}
                    className="w-full h-full"
                />
            </div>
            {(text || subtext) && (
                <div className="mt-4 space-y-1">
                    {text && <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{text}</h3>}
                    {subtext && <p className="text-sm text-slate-500 dark:text-slate-400">{subtext}</p>}
                </div>
            )}
        </div>
    );
};

export default EmptyStateAnimation;
