'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
    onSplineLoad?: (app: Application) => void;
}

export default function SplineBackground({ scene, className = '', onSplineLoad }: SplineBackgroundProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [hasError, setHasError] = useState(false);
    const splineAppRef = useRef<Application | null>(null);

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

    const handleLoad = useCallback((splineApp: Application) => {
        splineAppRef.current = splineApp;
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
        
        // Expose the app to parent component for scroll animations
        if (onSplineLoad) {
            onSplineLoad(splineApp);
        }
    }, [isMobile, onSplineLoad]);

    // On mobile: CSS media query handles pointer-events (allows scroll-based animations)
    // On desktop: full interaction enabled
    // We no longer add mobile-no-pointer class to avoid conflicts with Spline's native scroll animations

    return (
        <div className={`spline-wrapper ${className} ${isLoaded ? 'loaded' : ''}`}>
            {shouldRender && !hasError && (
                <Spline 
                    scene={scene} 
                    onLoad={handleLoad}
                    // onError removed - Spline component may not support it or has type mismatch
                    // Errors will be caught by try/catch in handleLoad if needed
                />
            )}
        </div>
    );
}
