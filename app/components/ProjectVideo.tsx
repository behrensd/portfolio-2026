'use client';

import { useRef, useEffect, useState } from 'react';

interface ProjectVideoProps {
    src: string;
    className?: string;
}

export default function ProjectVideo({ src, className = '' }: ProjectVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        const container = containerRef.current;
        if (!video || !container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // Use 0.9 threshold for better mobile support where 1.0 might be unreachable
                    if (entry.intersectionRatio >= 0.9 && !hasStarted) {
                        video.play().catch(() => {
                            // Autoplay was prevented
                        });
                        setHasStarted(true);
                    }
                });
            },
            {
                threshold: 0.9, // Reduced from 1.0 for mobile reliability
            }
        );

        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, [hasStarted]);

    return (
        <div ref={containerRef} className={`relative group ${className}`}>
            <video
                ref={videoRef}
                className="w-full h-auto object-contain rounded-lg block"
                muted
                loop
                playsInline
                preload="auto"
                src={src}
                onClick={() => {
                    if (videoRef.current?.paused) {
                        videoRef.current.play();
                    } else {
                        videoRef.current?.pause();
                    }
                }}
            />
        </div>
    );
}
