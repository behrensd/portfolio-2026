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

    // Check device type on mount
    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkDevice();
        window.addEventListener('resize', checkDevice);
        
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    // Delay rendering to improve initial page load performance
    useEffect(() => {
        // Delay more on mobile for smoother experience
        const delay = isMobile ? 800 : 300;
        const timer = setTimeout(() => {
            setShouldRender(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [isMobile]);

    const handleLoad = (splineApp: Application) => {
        setIsLoaded(true);
        console.log('✨ Spline scene loaded');
        
        // Zoom out on mobile for better view
        if (isMobile) {
            try {
                splineApp.setZoom(0.6);
            } catch (e) {
                console.log('Zoom not available');
            }
        }
    };

    return (
        <div className={`spline-wrapper ${className} ${isLoaded ? 'loaded' : ''}`}>
            {shouldRender && (
                <Spline 
                    scene={scene} 
                    onLoad={handleLoad}
                />
            )}
        </div>
    );
}
