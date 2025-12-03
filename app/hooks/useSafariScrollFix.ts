'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Mobile Scroll Fix (iOS Safari & Android)
 * 
 * iOS Safari handles touch scrolling on the compositor thread, not JavaScript.
 * This means scroll events don't fire properly during momentum scrolling.
 * 
 * UPDATE: normalizeScroll() caused "sticky" and non-fluent scrolling behavior 
 * on some devices. We are disabling it to prioritize native scroll feel.
 * We still keep touch-action optimization.
 */
export function useSafariScrollFix() {
    useEffect(() => {
        // Detect mobile devices
        const isMobile = window.innerWidth < 768;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Apply fixes for all mobile/touch devices
        if (isTouchDevice && isMobile) {
            console.log('📱 Mobile device detected - optimizing touch actions');
            
            // Set touch-action CSS for better scroll handling
            // 'pan-y' allows vertical scrolling but prevents horizontal swipes/zooms 
            // that might interfere with the experience
            document.body.style.touchAction = 'pan-y';
            document.documentElement.style.touchAction = 'pan-y';
            
            // Note: normalizeScroll disabled due to performance/feel issues
        }
        
        return () => {
            // Cleanup if needed
            document.body.style.touchAction = '';
            document.documentElement.style.touchAction = '';
        };
    }, []);
}
