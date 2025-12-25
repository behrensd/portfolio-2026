'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHeroMatrixAnimation } from '../hooks/useHeroMatrixAnimation';
import { useSplineScroll } from '../hooks/useSplineScroll';
import SplineBackground from './SplineBackground';
import MobileFrameSequence from './MobileFrameSequence';
import type { Application } from '@splinetool/runtime';

export default function Hero() {
    const [splineApp, setSplineApp] = useState<Application | null>(null);
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    // Detect mobile once on mount (touch + screen size + user agent)
    useEffect(() => {
        const checkMobile = () => {
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth < 768;
            const isMobileUA = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            return (hasTouch && isSmallScreen) || isMobileUA;
        };
        setIsMobile(checkMobile());
        // Intentionally not adding resize listener to prevent component thrashing
    }, []);

    // Matrix-style scramble animation for hero text
    useHeroMatrixAnimation();
    // Use Spline scroll on desktop only
    useSplineScroll(isMobile ? null : splineApp);

    const handleSplineLoad = useCallback((app: Application) => {
        setSplineApp(app);
    }, []);

    return (
        <section id="hero" className="section-tile hero-tile">
            {isMobile === false && (
                <SplineBackground
                    scene="https://prod.spline.design/jAeJX5ac4B2WBgwq/scene.splinecode"
                    className="hero-spline"
                    onSplineLoad={handleSplineLoad}
                />
            )}
            {isMobile === true && (
                <MobileFrameSequence className="hero-mobile-bg" />
            )}
            <div className="tile-content" data-speed="1">
                <div className="hero-content">
                    <h1 className="hero-title" data-speed="0.8">
                        <span className="hero-line">BAI</span>
                        <div className="hero-image-container">
                            {/* Using native img tag for scroll animation compatibility */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/heroavatars/onload.png"
                                alt="Dom Behrens"
                                className="hero-image"
                                loading="eager"
                                decoding="async"
                            />
                        </div>
                        <span className="hero-line hero-line-solutions">SOLUTIONS</span>
                    </h1>
                    <p className="hero-subtitle" data-speed="0.9">
                        Web design <span className="hero-subtitle-name">by Dom Behrens</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
