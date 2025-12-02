'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSplineScroll } from '../hooks/useSplineScroll';
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
    const splineRef = useRef<Application | null>(null);
    
    // Activate scroll interaction with loaded state dependency
    useSplineScroll(splineRef, isLoaded);

    // Delay rendering to improve initial page load performance
    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldRender(true);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    const handleLoad = (splineApp: Application) => {
        splineRef.current = splineApp;
        setIsLoaded(true);
        console.log('✨ Spline scene loaded');
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
