'use client';

import { useState, useCallback } from 'react';
import { useHeroMatrixAnimation } from '../hooks/useHeroMatrixAnimation';
import { useSplineScroll } from '../hooks/useSplineScroll';
import SplineBackground from './SplineBackground';
import type { Application } from '@splinetool/runtime';

export default function Hero() {
    const [splineApp, setSplineApp] = useState<Application | null>(null);

    // Matrix-style scramble animation for hero text
    useHeroMatrixAnimation();
    // Use Spline scroll on all devices (hook handles mobile optimization internally)
    useSplineScroll(splineApp);

    const handleSplineLoad = useCallback((app: Application) => {
        setSplineApp(app);
    }, []);

    return (
        <section id="hero" className="section-tile hero-tile">
            <SplineBackground 
                scene="https://prod.spline.design/jAeJX5ac4B2WBgwq/scene.splinecode"
                className="hero-spline"
                onSplineLoad={handleSplineLoad}
            />
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
