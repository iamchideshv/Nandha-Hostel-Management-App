'use client';

import React from 'react';

interface LoaderProps {
    className?: string;
    fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ className = '', fullScreen = false }) => {
    const loaderContent = (
        <div className={`loading-wave ${className}`}>
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                {loaderContent}
            </div>
        );
    }

    return loaderContent;
};
