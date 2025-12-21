'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { batchedScrollTriggerRefresh } from '../utils/scrollOptimization';
import { createOptimizedScrollTrigger } from '../utils/scrollTriggerConfig';
import { detectViewport, getAnimationDuration } from '../utils/viewportConfig';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

// Global scroll tween reference - allows killing from anywhere
let currentScrollTween: gsap.core.Tween | null = null;
let isNavigating = false;

export function useDockNavigation() {
    // Store our ScrollTriggers to clean up only ours
    const triggersRef = useRef<ScrollTrigger[]>([]);
    const clickHandlersRef = useRef<Map<Element, EventListener>>(new Map());

    useEffect(() => {
        const viewport = detectViewport();
        const dockItems = document.querySelectorAll('.dock-item');
        const sections = document.querySelectorAll('section[id]');

        // Helper to update active state immediately
        const setActiveItem = (targetHref: string) => {
            dockItems.forEach(item => {
                item.classList.remove('active');
                const itemHref = item.getAttribute('data-href') || item.getAttribute('href');
                if (itemHref === targetHref) {
                    item.classList.add('active');
                }
            });
        };

        // Update active state on scroll (only when not navigating via click)
        sections.forEach((section) => {
            const trigger = createOptimizedScrollTrigger(
                section as HTMLElement,
                {
                    onToggle: (self: any) => {
                        // Don't update during programmatic navigation
                        if (isNavigating) return;

                        if (self.isActive) {
                            const id = section.getAttribute('id');
                            setActiveItem(`#${id}`);
                        }
                    }
                },
                'navigation'
            );
            triggersRef.current.push(trigger);
        });

        // Force "Contact" active when reaching bottom of page
        const bottomTrigger = createOptimizedScrollTrigger(
            'body',
            {
                start: 'bottom bottom',
                end: 'bottom bottom',
                onEnter: () => {
                    if (isNavigating) return;
                    setActiveItem('#contact');
                }
            },
            'navigation'
        );
        triggersRef.current.push(bottomTrigger);

        // Smooth scroll on click
        dockItems.forEach(item => {
            // Skip items without data-section (e.g., "mehr" button)
            if (!item.hasAttribute('data-section')) return;

            const handleNavigation = (e: Event) => {
                e.preventDefault();
                e.stopPropagation();

                const targetId = item.getAttribute('data-href') || item.getAttribute('href');
                const targetSection = targetId ? document.querySelector(targetId) : null;

                if (!targetSection || !targetId) return;

                // Set active state immediately
                setActiveItem(targetId);
                isNavigating = true;

                // iOS Safari & mobile: Use native scrollIntoView (always works)
                // Also use for Instagram in-app browser
                if (viewport.isIOS || viewport.isSafari || viewport.isInstagramBrowser || viewport.isMobile) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Reset navigation flag after scroll completes
                    // Native smooth scroll takes ~500-800ms
                    setTimeout(() => {
                        isNavigating = false;
                        batchedScrollTriggerRefresh();
                    }, 800);
                } else {
                    // Desktop non-Safari: Use GSAP for more control
                    if (currentScrollTween) {
                        currentScrollTween.kill();
                        currentScrollTween = null;
                    }

                    gsap.killTweensOf(window, 'scrollTo');

                    currentScrollTween = gsap.to(window, {
                        duration: getAnimationDuration(viewport, 0.6),
                        scrollTo: {
                            y: targetSection,
                            offsetY: 0,
                            autoKill: true
                        },
                        ease: 'power2.out',
                        overwrite: 'auto',
                        onComplete: () => {
                            isNavigating = false;
                            currentScrollTween = null;
                            batchedScrollTriggerRefresh();
                        },
                        onInterrupt: () => {
                            isNavigating = false;
                            currentScrollTween = null;
                        }
                    });
                }
            };

            item.addEventListener('click', handleNavigation);
            clickHandlersRef.current.set(item, handleNavigation);
        });
        
        return () => {
            // Kill any active scroll tween
            if (currentScrollTween) {
                currentScrollTween.kill();
                currentScrollTween = null;
            }
            isNavigating = false;
            
            // Only kill our own ScrollTriggers
            triggersRef.current.forEach(trigger => trigger.kill());
            triggersRef.current = [];
            
            // Clean up event handlers
            clickHandlersRef.current.forEach((handler, element) => {
                element.removeEventListener('click', handler);
            });
            clickHandlersRef.current.clear();
        };
    }, []);
}
