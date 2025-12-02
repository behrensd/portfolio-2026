'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Application } from '@splinetool/runtime';

// Dynamic import for better performance - no SSR
const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => null
});

interface SplineBackgroundProps {
    scene: string;
    className?: string;
}

export default function SplineBackground({ scene, className = '' }: SplineBackgroundProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on mount
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Delay rendering to improve initial page load performance
    // On mobile, delay even more or skip entirely for performance
    useEffect(() => {
        const delay = isMobile ? 1000 : 300; // Longer delay on mobile
        const timer = setTimeout(() => {
            setShouldRender(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [isMobile]);

    const handleLoad = (splineApp: Application) => {
        setIsLoaded(true);
        console.log('✨ Spline scene loaded');
        
        // On mobile, try to reduce quality/zoom for performance
        if (isMobile) {
            try {
                splineApp.setZoom(0.5); // Zoom out more on mobile
            } catch (e) {
                // setZoom might not be available
            }
        }
    };

    // Don't render Spline on very small screens (< 480px) for performance
    const shouldSkipSpline = typeof window !== 'undefined' && window.innerWidth < 480;

    return (
        <div className={`spline-wrapper ${className} ${isLoaded ? 'loaded' : ''}`}>
            {shouldRender && !shouldSkipSpline && (
                <Spline 
                    scene={scene} 
                    onLoad={handleLoad}
                />
            )}
        </div>
    );
}
