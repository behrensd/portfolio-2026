'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function Contact() {
    const emailRef = useRef<HTMLAnchorElement>(null);
    const instagramRef = useRef<HTMLAnchorElement>(null);
    const hasSwappedRef = useRef(false);

    // Reset on page reload - no persistence

    const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Only swap on first click on this page load - make link unresponsive
        if (!hasSwappedRef.current && emailRef.current && instagramRef.current) {
            e.preventDefault();
            e.stopPropagation();
            hasSwappedRef.current = true;

            // Get computed styles to check layout direction
            const linksContainer = emailRef.current.parentElement;
            if (!linksContainer) return;

            const computedStyle = window.getComputedStyle(linksContainer);
            const isColumn = computedStyle.flexDirection === 'column';

            if (isColumn) {
                // Vertical swap: button height + gap
                const buttonHeight = emailRef.current.offsetHeight;
                const gap = parseFloat(computedStyle.gap) || 24;
                const offset = buttonHeight + gap;

                // Animate the swap with Y-axis translation - smooth and lightweight
                gsap.to([emailRef.current, instagramRef.current], {
                    y: (index) => index === 0 ? offset : -offset,
                    duration: 0.5,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        // Flash Instagram text white quickly after animation
                        if (instagramRef.current) {
                            gsap.to(instagramRef.current, {
                                color: '#ffffff',
                                duration: 0.15,
                                ease: 'power2.out',
                                yoyo: true,
                                repeat: 1
                            });
                        }
                    }
                });
            } else {
                // Horizontal swap: button width + gap (for desktop row layout)
                const buttonWidth = emailRef.current.offsetWidth;
                const gap = parseFloat(computedStyle.gap) || 24;
                const offset = buttonWidth + gap;

                // Animate the swap with X-axis translation
                gsap.to([emailRef.current, instagramRef.current], {
                    x: (index) => index === 0 ? offset : -offset,
                    duration: 0.5,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        // Flash Instagram text white quickly after animation
                        if (instagramRef.current) {
                            gsap.to(instagramRef.current, {
                                color: '#ffffff',
                                duration: 0.15,
                                ease: 'power2.out',
                                yoyo: true,
                                repeat: 1
                            });
                        }
                    }
                });
            }
        }
        // On second click (or if already swapped), allow normal link behavior
    };

    return (
        <section id="contact" className="content-tile">
            <div className="tile-content" data-speed="1">
                <div className="contact-content">
                    <h2 className="section-title" data-speed="0.8">Erstgespräch vereinbaren</h2>
                    <p className="contact-description" data-speed="0.9">
                        Keine Lust auf generische Designs? 
                    </p>
                    <div className="contact-links" data-speed="0.95">
                        <a 
                            ref={emailRef}
                            href="mailto:info@behrens-ai.de" 
                            className="contact-link"
                            onClick={handleEmailClick}
                        >
                            Email
                        </a>
                        <a 
                            ref={instagramRef}
                            href="https://instagram.com/040tech" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="contact-link"
                        >
                            Instagram
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
