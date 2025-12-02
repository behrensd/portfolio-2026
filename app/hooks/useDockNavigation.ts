'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export function useDockNavigation() {
    useEffect(() => {
        const dockItems = document.querySelectorAll('.dock-item');
        const sections = document.querySelectorAll('section[id]');
        
        // Update active state on scroll
        sections.forEach((section) => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onToggle: (self) => {
                    if (self.isActive) {
                        const id = section.getAttribute('id');
                        dockItems.forEach(item => {
                            item.classList.remove('active');
                            if (item.getAttribute('href') === `#${id}`) {
                                item.classList.add('active');
                            }
                        });
                    }
                }
            });
        });

        // Force "Contact" active when reaching bottom of page
        ScrollTrigger.create({
            trigger: 'body',
            start: 'bottom bottom', 
            end: 'bottom bottom',
            onEnter: () => {
                dockItems.forEach(item => item.classList.remove('active'));
                const contactLink = document.querySelector('.dock-item[href="#contact"]');
                if (contactLink) contactLink.classList.add('active');
            }
        });
        
        // Smooth scroll on click
        dockItems.forEach(item => {
            const handleClick = (e: Event) => {
                e.preventDefault();
                const targetId = (item as HTMLAnchorElement).getAttribute('href');
                const targetSection = targetId ? document.querySelector(targetId) : null;
                
                if (targetSection) {
                    gsap.to(window, {
                        duration: 1,
                        scrollTo: {
                            y: targetSection,
                            offsetY: 0
                        },
                        ease: 'power2.inOut'
                    });
                }
            };
            
            item.addEventListener('click', handleClick);
        });
        
        console.log('✨ Dock navigation initialized');
        
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);
}
