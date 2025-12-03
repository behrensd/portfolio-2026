'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Safari Mobile Scroll Fix
 * 
 * iOS Safari handles touch scrolling on the compositor thread, not JavaScript.
 * This means scroll events don't fire properly during momentum scrolling.
 * 
 * ScrollTrigger.normalizeScroll() forces scrolling to the JS thread,
 * ensuring animations work properly on mobile Safari.
 */
export function useSafariScrollFix() {
    useEffect(() => {
        // Detect iOS Safari
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isMobile = window.innerWidth < 768;
        
        if (isIOS || (isSafari && isMobile)) {
            console.log('🍎 iOS/Safari detected - enabling normalizeScroll');
            
            // Enable normalizeScroll for Safari mobile
            // This forces scrolling to happen on the JavaScript thread
            ScrollTrigger.normalizeScroll({
                // Allow native touch scrolling momentum
                momentum: 0.5,
                // Allow iOS address bar behavior
                allowNestedScroll: true,
                // Handle touch events
                type: "touch,wheel,pointer"
            });
            
            // Also add touch-action CSS for better touch handling
            document.body.style.touchAction = 'pan-y';
            document.documentElement.style.touchAction = 'pan-y';
        }
        
        // Force a refresh after setup
        const timer = setTimeout(() => {
            ScrollTrigger.refresh(true);
        }, 100);
        
        // Handle orientation changes on mobile
        const handleOrientationChange = () => {
            setTimeout(() => {
                ScrollTrigger.refresh(true);
            }, 300);
        };
        
        window.addEventListener('orientationchange', handleOrientationChange);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('orientationchange', handleOrientationChange);
            // Don't disable normalizeScroll on cleanup as it affects other ScrollTriggers
        };
    }, []);
}

