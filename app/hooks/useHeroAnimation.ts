'use client';

import { useEffect } from 'react';
import gsap from 'gsap';

export function useHeroAnimation() {
    useEffect(() => {
        // Delay to ensure DOM is ready
        const timer = setTimeout(() => {
            // Animate hero title lines - fade in from below
            // End at y:0, then useAvatarScrollAnimation will separate them
            gsap.from('.hero-line', {
                opacity: 0,
                y: 100,
                duration: 1.2,
                stagger: 0.2,
                ease: 'power4.out',
                delay: 0.3
            });

            // Animate hero subtitle
            gsap.from('.hero-subtitle', {
                opacity: 0,
                y: 30,
                duration: 1,
                ease: 'power3.out',
                delay: 1
            });
        }, 100);

        return () => {
            clearTimeout(timer);
        };
    }, []);
}
