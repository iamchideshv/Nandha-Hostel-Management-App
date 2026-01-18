'use client';

import React, { useMemo } from 'react';

export function FallingStars() {
    const stars = useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => {
            const topOffset = Math.random() * 100;
            const fallDuration = Math.random() * 6 + 6;
            const fallDelay = Math.random() * 10;
            const starTailLength = (Math.random() * 250 + 500) / 100;

            return (
                <div
                    key={i}
                    className="star"
                    style={{
                        '--top-offset': `${topOffset}vh`,
                        '--fall-duration': `${fallDuration}s`,
                        '--fall-delay': `${fallDelay}s`,
                        '--star-tail-length': `${starTailLength}em`,
                    } as React.CSSProperties}
                />
            );
        });
    }, []);

    return <div className="stars">{stars}</div>;
}
