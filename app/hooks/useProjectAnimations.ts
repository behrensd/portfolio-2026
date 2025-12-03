'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useProjectAnimations() {
    useEffect(() => {
        // Delay to ensure DOM is ready - longer for Safari
        const timer = setTimeout(() => {
            // Select all project items
            const projects = gsap.utils.toArray('.project-item');
            
            if (projects.length === 0) {
                console.warn('No project items found');
                return;
            }
            
            // Simple fade-in animation for each project
            projects.forEach((project: any, index: number) => {
                const projectContent = project.querySelector('.project-content');
                const projectNumber = project.querySelector('.project-number');
                
                // Set initial state
                gsap.set(project, { 
                    y: 40, 
                    opacity: 0,
                    visibility: 'visible' // Ensure visible for Safari
                });
                if (projectNumber) gsap.set(projectNumber, { opacity: 0 });
                if (projectContent) gsap.set(projectContent, { y: 20, opacity: 0 });

                // Create scroll trigger
                ScrollTrigger.create({
                    trigger: project,
                    start: 'top 95%',
                    end: 'bottom 10%',
                    onEnter: () => {
                        gsap.to(project, {
                            y: 0,
                            opacity: 1,
                            duration: 0.6,
                            ease: 'power2.out',
                        });
                        
                        if (projectNumber) {
                            gsap.to(projectNumber, {
                                opacity: 0.9,
                                duration: 0.5,
                                ease: 'power2.out',
                            });
                        }
                        
                        if (projectContent) {
                            gsap.to(projectContent, {
                                y: 0,
                                opacity: 1,
                                duration: 0.5,
                                ease: 'power2.out',
                                delay: 0.1
                            });
                        }
                    },
                    // Also trigger when scrolling back up (for Safari)
                    onEnterBack: () => {
                        gsap.to(project, { opacity: 1, y: 0, duration: 0.3 });
                        if (projectNumber) gsap.to(projectNumber, { opacity: 0.9, duration: 0.3 });
                        if (projectContent) gsap.to(projectContent, { opacity: 1, y: 0, duration: 0.3 });
                    },
                    once: false, // Allow re-triggering on Safari
                    invalidateOnRefresh: true // Important for Safari resize/orientation
                });
            });
            
            // Force refresh after setup - critical for Safari
            ScrollTrigger.refresh(true);
            
            // Additional refresh after a short delay for Safari
            setTimeout(() => {
                ScrollTrigger.refresh(true);
            }, 500);
            
            console.log('✨ Project animations initialized');
        }, 200);

        // Refresh on resize and orientation change (Safari mobile)
        const handleResize = () => {
            ScrollTrigger.refresh(true);
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);
}
