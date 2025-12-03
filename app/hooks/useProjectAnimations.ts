'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useProjectAnimations() {
    useEffect(() => {
        // Detect mobile/Safari
        const isMobile = window.innerWidth < 768;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        // On iOS, use normalizeScroll for reliable scroll detection
        if (isIOS) {
            ScrollTrigger.normalizeScroll(true);
        }
        
        // Longer delay for mobile to ensure DOM is ready
        const timer = setTimeout(() => {
            const projects = gsap.utils.toArray('.project-item');
            
            if (projects.length === 0) {
                console.warn('No project items found');
                return;
            }
            
            projects.forEach((project: any) => {
                const projectContent = project.querySelector('.project-content');
                const projectNumber = project.querySelector('.project-number');
                const mockupContainer = project.querySelector('.mockup-container');
                
                // Set initial state - simpler for better mobile performance
                gsap.set(project, { 
                    y: isMobile ? 30 : 50, 
                    opacity: 0,
                    visibility: 'visible'
                });
                if (projectNumber) gsap.set(projectNumber, { opacity: 0 });
                if (projectContent) gsap.set(projectContent, { opacity: 0 });
                if (mockupContainer) gsap.set(mockupContainer, { opacity: 0, x: isMobile ? 30 : 60 });

                // Use ScrollTrigger with toggleActions for reliable triggering
                gsap.to(project, {
                    y: 0,
                    opacity: 1,
                    duration: isMobile ? 0.4 : 0.6,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: project,
                        start: 'top 90%',
                        end: 'top 60%',
                        toggleActions: 'play none none none',
                        // Critical for iOS Safari
                        invalidateOnRefresh: true,
                    }
                });
                
                if (projectNumber) {
                    gsap.to(projectNumber, {
                        opacity: 0.9,
                        duration: 0.4,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: project,
                            start: 'top 90%',
                            toggleActions: 'play none none none',
                            invalidateOnRefresh: true,
                        }
                    });
                }
                
                if (projectContent) {
                    gsap.to(projectContent, {
                        opacity: 1,
                        duration: 0.5,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: project,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                            invalidateOnRefresh: true,
                        }
                    });
                }
                
                // Animate mockup container sliding in from the right
                if (mockupContainer) {
                    gsap.to(mockupContainer, {
                        opacity: 1,
                        x: 0,
                        duration: isMobile ? 0.5 : 0.7,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: project,
                            start: 'top 80%',
                            toggleActions: 'play none none none',
                            invalidateOnRefresh: true,
                        }
                    });
                }
            });
            
            // Multiple refreshes for Safari
            ScrollTrigger.refresh(true);
            setTimeout(() => ScrollTrigger.refresh(true), 300);
            setTimeout(() => ScrollTrigger.refresh(true), 1000);
            
            console.log('✨ Project animations initialized');
        }, isMobile ? 500 : 200);

        const handleResize = () => ScrollTrigger.refresh(true);
        const handleOrientation = () => {
            setTimeout(() => ScrollTrigger.refresh(true), 300);
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientation);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleOrientation);
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);
}
