'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useHeroAnimation } from '../hooks/useHeroAnimation';
import { useSplineScroll } from '../hooks/useSplineScroll';
import SplineBackground from './SplineBackground';
import MobileFrameSequence from './MobileFrameSequence';
import type { Application } from '@splinetool/runtime';

// Detect if device is truly mobile (not just small screen)
function detectMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Check user agent for mobile devices
    const mobileUA = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
    
    // Check if screen is small in either dimension (handles landscape)
    const smallScreen = Math.min(window.screen.width, window.screen.height) < 768;
    
    // It's mobile if it has touch + mobile UA, OR touch + small physical screen
    return (hasTouch && mobileUA) || (hasTouch && smallScreen);
}

export default function Hero() {
    const [splineApp, setSplineApp] = useState<Application | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const initialMobileRef = useRef<boolean | null>(null);
    
    useHeroAnimation();
    // Only use Spline scroll on desktop
    useSplineScroll(isMobile ? null : splineApp);

    // Detect mobile on client side - only once on mount to prevent switching
    useEffect(() => {
        setIsClient(true);
        
        // Only detect once - don't switch between Spline/MobileFrameSequence on orientation change
        if (initialMobileRef.current === null) {
            const mobile = detectMobileDevice();
            initialMobileRef.current = mobile;
            setIsMobile(mobile);
        }
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
                        Web design by Dom Behrens
                    </p>
                </div>
            </div>
        </section>
    );
}
