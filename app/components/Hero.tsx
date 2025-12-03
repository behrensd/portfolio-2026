'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHeroAnimation } from '../hooks/useHeroAnimation';
import { useSplineScroll } from '../hooks/useSplineScroll';
import SplineBackground from './SplineBackground';
import MobileFrameSequence from './MobileFrameSequence';
import type { Application } from '@splinetool/runtime';

export default function Hero() {
    const [splineApp, setSplineApp] = useState<Application | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isClient, setIsClient] = useState(false);
    
    useHeroAnimation();
    // Only use Spline scroll on desktop
    useSplineScroll(isMobile ? null : splineApp);

    // Detect mobile on client side
    useEffect(() => {
        setIsClient(true);
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile, { passive: true });
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSplineLoad = useCallback((app: Application) => {
        setSplineApp(app);
    }, []);

    return (
        <section id="hero" className="section-tile hero-tile">
            {isClient && isMobile ? (
                <MobileFrameSequence className="hero-frame-sequence" />
            ) : (
                <SplineBackground 
                    scene="https://prod.spline.design/jAeJX5ac4B2WBgwq/scene.splinecode"
                    className="hero-spline"
                    onSplineLoad={handleSplineLoad}
                />
            )}
            <div className="tile-content" data-speed="1">
                <div className="hero-content">
                    <div className="logo-spacer"></div>
                    <h1 className="hero-title" data-speed="0.8">
                        <span className="hero-line">BAI</span>
                        <span className="hero-line">SOLUTIONS</span>
                    </h1>
                    <p className="hero-subtitle" data-speed="0.9">
                        Web design by Dom Behrens
                    </p>
                </div>
            </div>
        </section>
    );
}
