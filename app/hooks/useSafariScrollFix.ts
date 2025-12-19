'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    // Expose ScrollTrigger early for tests (this hook runs first in page.tsx)
    if (!(window as any).ScrollTrigger) {
        (window as any).ScrollTrigger = ScrollTrigger;
    }
    if (!(window as any).gsap) {
        (window as any).gsap = gsap;
    }
}

/**
 * Mobile Scroll Fix (iOS Safari & Android)
 * 
 * iOS Safari handles touch scrolling on the compositor thread, not JavaScript.
 * This means scroll events don't fire properly during momentum scrolling.
 * 
 * This hook keeps it simple:
 * 1. Sets touch-action for smooth vertical scrolling
 * 2. No viewport manipulation to avoid scroll interference
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
            document.body.style.touchAction = 'pan-y';
            document.documentElement.style.touchAction = 'pan-y';
            
            // Optimize overscroll behavior for better performance
            // This prevents scroll chaining and improves momentum scrolling
            document.documentElement.style.overscrollBehaviorY = 'contain';
            document.body.style.overscrollBehaviorY = 'contain';
        }
        
        // Safari-specific optimizations (both mobile and desktop)
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isSafari) {
            // Optimize scroll performance on Safari
            document.documentElement.style.overscrollBehaviorY = 'contain';
            document.body.style.overscrollBehaviorY = 'contain';
        }
        
        return () => {
            document.body.style.touchAction = '';
            document.documentElement.style.touchAction = '';
        };
    }, []);
}
