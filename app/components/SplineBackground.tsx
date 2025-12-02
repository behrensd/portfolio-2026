'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

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

    // Delay rendering to improve initial page load performance
    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldRender(true);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    const handleLoad = () => {
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
