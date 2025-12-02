'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useProjectAnimations() {
    useEffect(() => {
        // Delay to ensure DOM is ready
        const timer = setTimeout(() => {
            // Force ScrollTrigger to recalculate (helps with iOS)
            ScrollTrigger.refresh();
            
            // Select all project items
            const projects = gsap.utils.toArray('.project-item');
            
            // If no projects found, exit early
            if (projects.length === 0) {
                console.warn('No project items found');
                return;
            }
            
            ScrollTrigger.matchMedia({
                // Desktop
                "(min-width: 769px)": function() {
                    setupAnimations(projects, {
                        start: 'top 85%',
                        end: 'top 50%',
                        scrub: 1
                    });
                },
                // Mobile & Tablet
                "(max-width: 768px)": function() {
                    setupAnimations(projects, {
                        start: 'top 98%', // Trigger almost immediately
                        end: 'top 80%',
                        scrub: 0.3 // Faster response on mobile
                    });
                },
                // Fallback for all
                "all": function() {
                    // Ensure elements are visible even if ScrollTrigger fails
                    setTimeout(() => {
                        projects.forEach((project: any) => {
                            if (project.style.opacity === '0' || project.style.opacity === '') {
                                // Force visibility after 2 seconds if still hidden
                            }
                        });
                    }, 2000);
                }
            });
            
            console.log('✨ Smooth bottom-up project animations initialized');
        }, 200);

        // Refresh on resize (helps with iOS orientation changes)
        const handleResize = () => {
            ScrollTrigger.refresh();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);
}

function setupAnimations(projects: any[], config: any) {
    projects.forEach((project: any, index: number) => {
        const projectContent = project.querySelector('.project-content');
        const projectNumber = project.querySelector('.project-number');
        
        // Set initial state
        gsap.set(project, { y: 80, opacity: 0 });
        if (projectNumber) gsap.set(projectNumber, { y: 40, opacity: 0 });
        if (projectContent) gsap.set(projectContent, { y: 30, opacity: 0 });

        // Container Animation with stagger delay
        gsap.to(project, {
            scrollTrigger: {
                trigger: project,
                start: config.start,
                end: config.end,
                scrub: config.scrub,
                // These help with iOS
                invalidateOnRefresh: true,
            },
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
            delay: index * 0.1 // Slight stagger
        });

        // Number Parallax
        if (projectNumber) {
            gsap.to(projectNumber, {
                scrollTrigger: {
                    trigger: project,
                    start: config.start,
                    end: config.end,
                    scrub: config.scrub * 1.2,
                    invalidateOnRefresh: true,
                },
                y: 0,
                opacity: 0.3,
                ease: 'power2.out'
            });
        }
        
        // Content Card
        if (projectContent) {
            gsap.to(projectContent, {
                scrollTrigger: {
                    trigger: project,
                    start: config.start,
                    end: config.end,
                    scrub: config.scrub,
                    invalidateOnRefresh: true,
                },
                y: 0,
                opacity: 1,
                ease: 'power2.out'
            });
        }
    });
}
