'use client';

import { useHeroMatrixAnimation } from '../hooks/useHeroMatrixAnimation';

export default function Hero() {
    // Matrix-style scramble animation for hero text
    useHeroMatrixAnimation();

    return (
        <section id="hero" className="section-tile hero-tile">
            <div className="hero-stars" aria-hidden="true" />
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
