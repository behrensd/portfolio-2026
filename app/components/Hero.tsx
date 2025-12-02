'use client';

import { useHeroAnimation } from '../hooks/useHeroAnimation';
import SplineBackground from './SplineBackground';

export default function Hero() {
    useHeroAnimation();

    return (
        <section id="hero" className="section-tile hero-tile">
            <SplineBackground 
                scene="https://prod.spline.design/jAeJX5ac4B2WBgwq/scene.splinecode"
                className="hero-spline"
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
