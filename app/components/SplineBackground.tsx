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
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    // Check device type on mount
    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsSmallScreen(width < 480);
        };
        
        checkDevice();
        window.addEventListener('resize', checkDevice);
        
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    // Delay rendering to improve initial page load performance
    useEffect(() => {
        // Skip Spline on very small screens
        if (isSmallScreen) {
            return;
        }
        
        // Longer delay on mobile for better performance
        const delay = isMobile ? 1500 : 500;
        const timer = setTimeout(() => {
            setShouldRender(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [isMobile, isSmallScreen]);

    const handleLoad = (splineApp: Application) => {
        setIsLoaded(true);
        console.log('✨ Spline scene loaded');
        
        // Optimize for mobile/tablet
        if (isMobile) {
            try {
                splineApp.setZoom(0.5);
            } catch (e) {
                console.log('Zoom not available');
            }
        }
    };

    return (
        <div className={`spline-wrapper ${className} ${isLoaded ? 'loaded' : ''}`}>
            {shouldRender && !isSmallScreen && (
                <Spline 
                    scene={scene} 
                    onLoad={handleLoad}
                />
            )}
        </div>
    );
}
