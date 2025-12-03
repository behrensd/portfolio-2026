'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Mobile Scroll Fix (iOS Safari & Android)
 * 
 * iOS Safari handles touch scrolling on the compositor thread, not JavaScript.
 * This means scroll events don't fire properly during momentum scrolling.
 * 
 * ScrollTrigger.normalizeScroll() forces scrolling to the JS thread,
 * ensuring animations work properly on mobile Safari.
 * 
 * IMPORTANT: This is the ONLY place normalizeScroll should be called
 * to avoid conflicts with other scroll handlers.
 */
export function useSafariScrollFix() {
    useEffect(() => {
        // Detect mobile devices
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isMobile = window.innerWidth < 768;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Apply fixes for all mobile/touch devices
        if (isTouchDevice && isMobile) {
            console.log('📱 Mobile device detected - enabling scroll optimizations');
            
            // Set touch-action CSS for better scroll handling
            document.body.style.touchAction = 'pan-y';
            document.documentElement.style.touchAction = 'pan-y';
            
            // Enable normalizeScroll for mobile devices
            // This ensures consistent scroll event firing
            if (isIOS || (isSafari && isMobile)) {
                console.log('🍎 iOS/Safari detected - enabling normalizeScroll');
                ScrollTrigger.normalizeScroll({
                    // Reduced momentum for snappier feel
                    momentum: 0.3,
                    // Allow iOS address bar behavior
                    allowNestedScroll: true,
                    // Handle touch events
                    type: "touch,wheel,pointer"
                });
            } else if (isAndroid) {
                console.log('🤖 Android detected - enabling normalizeScroll');
                ScrollTrigger.normalizeScroll({
                    momentum: 0.5,
                    allowNestedScroll: true,
                    type: "touch,wheel,pointer"
                });
            }
        }
        
        // Force a refresh after setup with staggered timing
        const timer1 = setTimeout(() => {
            ScrollTrigger.refresh(true);
        }, 100);
        
        const timer2 = setTimeout(() => {
            ScrollTrigger.refresh(true);
        }, 500);
        
        // Handle orientation changes on mobile
        const handleOrientationChange = () => {
            setTimeout(() => {
                ScrollTrigger.refresh(true);
            }, 300);
        };
        
        // Handle resize events
        const handleResize = () => {
            ScrollTrigger.refresh(true);
        };
        
        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleResize, { passive: true });
        
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            window.removeEventListener('orientationchange', handleOrientationChange);
            window.removeEventListener('resize', handleResize);
        };
    }, []);
}

