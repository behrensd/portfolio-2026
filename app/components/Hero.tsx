'use client';

import { useRef } from 'react';
import { useHeroAnimation } from '../hooks/useHeroAnimation';
import { useHeroCanvas } from '../hooks/useHeroCanvas';

export default function Hero() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useHeroAnimation();
    useHeroCanvas(canvasRef);

    return (
        <section id="hero" className="section-tile hero-tile">
            <canvas ref={canvasRef} id="hero-canvas" data-speed="0.5"></canvas>
            <div className="tile-content" data-speed="1">
                <div className="hero-content">
                    <div className="logo-spacer"></div>
                    <h1 className="hero-title" data-speed="0.8">
                        <span className="hero-line">BAI</span>
                        <span className="hero-line">SOLUTIONS</span>
                    </h1>
                    <p className="hero-subtitle" data-speed="0.9">
                        Web design and IT Services by Dom Behrens
                    </p>
                </div>
            </div>
        </section>
    );
}
