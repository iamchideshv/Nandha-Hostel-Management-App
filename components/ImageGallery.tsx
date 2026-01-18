'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
    '/gallary/WhatsApp Image 2026-01-18 at 11.56.44 AM.jpeg',
    '/gallary/WhatsApp Image 2026-01-18 at 12.02.22 PM.jpeg',
    '/gallary/WhatsApp Image 2026-01-18 at 12.04.10 PM.jpeg',
    '/gallary/WhatsApp Image 2026-01-18 at 12.05.51 PM.jpeg',
    '/gallary/WhatsApp Image 2026-01-18 at 12.15.29 PM.jpeg',
    '/gallary/WhatsApp Image 2026-01-18 at 12.19.15 PM.jpeg',
    '/gallary/WhatsApp Image 2026-01-18 at 12.19.36 PM.jpeg',
    '/gallary/WhatsApp Image 2026-01-18 at 12.34.17 PM.jpeg',
    '/gallary/WhatsApp Image 2026-01-18 at 12.35.07 PM.jpeg',
];

export function ImageGallery() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            paginate(1);
        }, 5000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrentIndex((prevIndex) => (prevIndex + newDirection + images.length) % images.length);
    };

    return (
        <section className="w-full max-w-6xl mx-auto px-4 py-12">
            <div className="relative h-[300px] md:h-[500px] w-full overflow-hidden rounded-3xl shadow-2xl border-4 border-white dark:border-slate-800">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.img
                        key={currentIndex}
                        src={images[currentIndex]}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.5 }
                        }}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </AnimatePresence>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Controls */}
                <div className="absolute inset-0 flex items-center justify-between p-4 z-10">
                    <button
                        onClick={() => paginate(-1)}
                        className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all border border-white/30"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => paginate(1)}
                        className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all border border-white/30"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {/* Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setDirection(index > currentIndex ? 1 : -1);
                                setCurrentIndex(index);
                            }}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                                }`}
                        />
                    ))}
                </div>

                <div className="absolute bottom-12 left-8 z-10 text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">Campus Gallery</h2>
                    <p className="text-white/80 text-sm md:text-base font-medium drop-shadow-md">Experience our world-class infrastructure and vibrant campus life</p>
                </div>
            </div>
        </section>
    );
}
