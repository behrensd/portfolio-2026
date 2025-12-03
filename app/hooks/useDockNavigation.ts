'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

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
            const trigger = ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onToggle: (self) => {
                    // Don't update during programmatic navigation
                    if (isNavigating) return;
                    
                    if (self.isActive) {
                        const id = section.getAttribute('id');
                        setActiveItem(`#${id}`);
                    }
                }
            });
            triggersRef.current.push(trigger);
        });

        // Force "Contact" active when reaching bottom of page
        const bottomTrigger = ScrollTrigger.create({
            trigger: 'body',
            start: 'bottom bottom', 
            end: 'bottom bottom',
            onEnter: () => {
                if (isNavigating) return;
                setActiveItem('#contact');
            }
        });
        triggersRef.current.push(bottomTrigger);
        
        // Smooth scroll on click - using data-href to avoid native anchor behavior
        dockItems.forEach(item => {
            const handleClick = (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                
                const targetId = item.getAttribute('data-href') || item.getAttribute('href');
                const targetSection = targetId ? document.querySelector(targetId) : null;
                
                if (!targetSection || !targetId) return;
                
                // Kill any existing scroll animation immediately
                if (currentScrollTween) {
                    currentScrollTween.kill();
                    currentScrollTween = null;
                }
                
                // Also kill any other scroll tweens on window
                gsap.killTweensOf(window, 'scrollTo');
                
                // Set active state immediately on tap (don't wait for scroll)
                setActiveItem(targetId);
                isNavigating = true;
                
                // Safari needs slightly longer duration for smooth rendering
                const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                
                currentScrollTween = gsap.to(window, {
                    duration: isSafari ? 0.5 : 0.35,
                    scrollTo: {
                        y: targetSection,
                        offsetY: 0,
                        autoKill: true,
                        onAutoKill: () => {
                            // User interrupted - let scroll triggers take over
                            isNavigating = false;
                            currentScrollTween = null;
                        }
                    },
                    ease: 'power3.out',
                    overwrite: true, // Aggressively kill ALL conflicting tweens
                    onComplete: () => {
                        isNavigating = false;
                        currentScrollTween = null;
                        // Refresh ScrollTrigger after navigation completes
                        ScrollTrigger.refresh();
                    },
                    onInterrupt: () => {
                        isNavigating = false;
                        currentScrollTween = null;
                    }
                });
            };
            
            item.addEventListener('click', handleClick);
            clickHandlersRef.current.set(item, handleClick);
        });
        
        console.log('✨ Dock navigation initialized');
        
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
            
            // Clean up click handlers
            clickHandlersRef.current.forEach((handler, element) => {
                element.removeEventListener('click', handler);
            });
            clickHandlersRef.current.clear();
        };
    }, []);
}
