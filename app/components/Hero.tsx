'use client';

import { useState, useCallback } from 'react';
import { useHeroAnimation } from '../hooks/useHeroAnimation';
import { useSplineScroll } from '../hooks/useSplineScroll';
import SplineBackground from './SplineBackground';
import type { Application } from '@splinetool/runtime';

export default function Hero() {
    const [splineApp, setSplineApp] = useState<Application | null>(null);
    
    useHeroAnimation();
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
