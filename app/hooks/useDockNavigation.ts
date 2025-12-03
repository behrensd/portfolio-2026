'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

export function useDockNavigation() {
    // Store our ScrollTriggers to clean up only ours
    const triggersRef = useRef<ScrollTrigger[]>([]);
    const clickHandlersRef = useRef<Map<Element, EventListener>>(new Map());

    useEffect(() => {
        const dockItems = document.querySelectorAll('.dock-item');
        const sections = document.querySelectorAll('section[id]');
        
        // Update active state on scroll
        sections.forEach((section) => {
            const trigger = ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onToggle: (self) => {
                    if (self.isActive) {
                        const id = section.getAttribute('id');
                        dockItems.forEach(item => {
                            item.classList.remove('active');
                            const itemHref = item.getAttribute('data-href') || item.getAttribute('href');
                            if (itemHref === `#${id}`) {
                                item.classList.add('active');
                            }
                        });
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
                dockItems.forEach(item => item.classList.remove('active'));
                const contactLink = document.querySelector('.dock-item[data-href="#contact"]') || 
                                   document.querySelector('.dock-item[href="#contact"]');
                if (contactLink) contactLink.classList.add('active');
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
                
                if (targetSection) {
                    // Safari needs slightly longer duration for smooth rendering
                    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                    
                    gsap.to(window, {
                        duration: isSafari ? 0.6 : 0.4,
                        scrollTo: {
                            y: targetSection,
                            offsetY: 0,
                            autoKill: true
                        },
                        ease: 'power4.out', // Fast start, gentle stop - works better on Safari
                        overwrite: 'auto' // Kill any conflicting scroll tweens
                    });
                }
            };
            
            item.addEventListener('click', handleClick);
            clickHandlersRef.current.set(item, handleClick);
        });
        
        console.log('✨ Dock navigation initialized');
        
        return () => {
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
