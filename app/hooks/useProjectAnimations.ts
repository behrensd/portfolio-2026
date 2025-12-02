'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useProjectAnimations() {
    useEffect(() => {
        // CRITICAL: Normalize scroll for mobile devices
        // This fixes touch scrolling issues on iOS/Android
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
            ScrollTrigger.normalizeScroll(true);
        }

        // Delay to ensure DOM is ready
        const timer = setTimeout(() => {
            // Force ScrollTrigger to recalculate
            ScrollTrigger.refresh(true);
            
            // Select all project items
            const projects = gsap.utils.toArray('.project-item');
            
            if (projects.length === 0) {
                console.warn('No project items found');
                return;
            }
            
            // Simplified animations for better performance
            projects.forEach((project: any, index: number) => {
                const projectContent = project.querySelector('.project-content');
                const projectNumber = project.querySelector('.project-number');
                
                // Set initial state - less dramatic movement for mobile
                const yOffset = isMobile ? 40 : 60;
                gsap.set(project, { y: yOffset, opacity: 0 });
                if (projectNumber) gsap.set(projectNumber, { opacity: 0 });
                if (projectContent) gsap.set(projectContent, { opacity: 0 });

                // Simple fade-in animation - NO scrub on mobile (causes jank)
                gsap.to(project, {
                    scrollTrigger: {
                        trigger: project,
                        start: isMobile ? 'top 95%' : 'top 85%',
                        end: isMobile ? 'top 80%' : 'top 50%',
                        toggleActions: 'play none none none', // Play once, don't reverse
                        // NO scrub on mobile - it causes performance issues
                        scrub: isMobile ? false : 0.8,
                        invalidateOnRefresh: true,
                    },
                    y: 0,
                    opacity: 1,
                    duration: isMobile ? 0.6 : 1,
                    ease: 'power2.out',
                    delay: index * 0.1
                });

                // Number fade
                if (projectNumber) {
                    gsap.to(projectNumber, {
                        scrollTrigger: {
                            trigger: project,
                            start: isMobile ? 'top 95%' : 'top 85%',
                            toggleActions: 'play none none none',
                            scrub: isMobile ? false : 1,
                        },
                        opacity: 0.3,
                        duration: 0.6,
                        ease: 'power2.out'
                    });
                }
                
                // Content fade
                if (projectContent) {
                    gsap.to(projectContent, {
                        scrollTrigger: {
                            trigger: project,
                            start: isMobile ? 'top 95%' : 'top 85%',
                            toggleActions: 'play none none none',
                            scrub: isMobile ? false : 0.8,
                        },
                        opacity: 1,
                        duration: 0.6,
                        ease: 'power2.out'
                    });
                }
            });
            
            console.log('✨ Project animations initialized');
        }, 300);

        // Refresh on resize
        const handleResize = () => {
            ScrollTrigger.refresh(true);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
            // Disable normalizeScroll on cleanup
            ScrollTrigger.normalizeScroll(false);
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);
}
