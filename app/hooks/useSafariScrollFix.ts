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
 * Additionally, iOS Safari has dynamic viewport height that changes when
 * the address bar shows/hides. This can cause position:fixed elements
 * to jump or appear in the wrong position.
 * 
 * This hook:
 * 1. Sets touch-action for smooth scrolling
 * 2. Uses CSS custom properties for real viewport height (dvh fallback)
 * 3. Listens to resize/visualViewport changes to update positioning
 */
export function useSafariScrollFix() {
    useEffect(() => {
        // Detect mobile devices
        const isMobile = window.innerWidth < 768;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
        // Set CSS custom property for real viewport height
        // This provides a more reliable value than 100vh on iOS Safari
        const setViewportHeight = () => {
            // Use visualViewport for most accurate size (excludes address bar)
            const vh = window.visualViewport?.height || window.innerHeight;
            document.documentElement.style.setProperty('--real-vh', `${vh}px`);
            document.documentElement.style.setProperty('--real-vh-unit', `${vh * 0.01}px`);
        };
        
        // Apply fixes for all mobile/touch devices
        if (isTouchDevice && isMobile) {
            console.log('📱 Mobile device detected - optimizing touch actions');
            
            // Set touch-action CSS for better scroll handling
            document.body.style.touchAction = 'pan-y';
            document.documentElement.style.touchAction = 'pan-y';
            
            // Set initial viewport height
            setViewportHeight();
            
            // iOS Safari specific: Listen for visualViewport changes
            // This fires when the address bar shows/hides
            if (isIOS && window.visualViewport) {
                console.log('🍎 iOS Safari detected - adding viewport height listener');
                window.visualViewport.addEventListener('resize', setViewportHeight);
                window.visualViewport.addEventListener('scroll', setViewportHeight);
            }
            
            // Also listen to regular resize for fallback
            window.addEventListener('resize', setViewportHeight, { passive: true });
            
            // Safari specific: Force repaint of fixed elements on scroll end
            // This helps position:fixed elements "settle" correctly
            if (isSafari) {
                let scrollTimeout: ReturnType<typeof setTimeout>;
                const handleScrollEnd = () => {
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        // Trigger a layout recalculation for fixed elements
                        const dock = document.querySelector('.floating-dock') as HTMLElement;
                        if (dock) {
                            // Force repaint by toggling a property
                            dock.style.transform = 'translateX(-50%) translateZ(0)';
                        }
                    }, 150);
                };
                
                window.addEventListener('scroll', handleScrollEnd, { passive: true });
                
                return () => {
                    document.body.style.touchAction = '';
                    document.documentElement.style.touchAction = '';
                    document.documentElement.style.removeProperty('--real-vh');
                    document.documentElement.style.removeProperty('--real-vh-unit');
                    window.removeEventListener('scroll', handleScrollEnd);
                    window.removeEventListener('resize', setViewportHeight);
                    if (window.visualViewport) {
                        window.visualViewport.removeEventListener('resize', setViewportHeight);
                        window.visualViewport.removeEventListener('scroll', setViewportHeight);
                    }
                };
            }
        }
        
        return () => {
            // Cleanup if needed
            document.body.style.touchAction = '';
            document.documentElement.style.touchAction = '';
            document.documentElement.style.removeProperty('--real-vh');
            document.documentElement.style.removeProperty('--real-vh-unit');
            window.removeEventListener('resize', setViewportHeight);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', setViewportHeight);
                window.visualViewport.removeEventListener('scroll', setViewportHeight);
            }
        };
    }, []);
}
