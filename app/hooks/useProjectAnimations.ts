'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useProjectAnimations() {
    useEffect(() => {
        // Delay to ensure DOM is ready
        const timer = setTimeout(() => {
            // Select all project items
            const projects = gsap.utils.toArray('.project-item');
            
            ScrollTrigger.matchMedia({
                // Desktop
                "(min-width: 769px)": function() {
                    setupAnimations(projects, {
                        start: 'top 85%',
                        end: 'top 60%',
                        scrub: 1
                    });
                },
                // Mobile
                "(max-width: 768px)": function() {
                    setupAnimations(projects, {
                        start: 'top 95%', // Trigger almost immediately when in view
                        end: 'top 70%',
                        scrub: 0.5 // Faster response on mobile
                    });
                } 
            });
            
            console.log('✨ Smooth bottom-up project animations initialized');
        }, 100);

        return () => {
            clearTimeout(timer);
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);
}

function setupAnimations(projects: any[], config: any) {
    projects.forEach((project: any) => {
        const projectContent = project.querySelector('.project-content');
        const projectNumber = project.querySelector('.project-number');
        
        // Ensure initial state is set immediately to avoid FOUC
        gsap.set(project, { y: 100, opacity: 0 });
        if (projectNumber) gsap.set(projectNumber, { y: 50, opacity: 0 });
        if (projectContent) gsap.set(projectContent, { y: 40, opacity: 0 });

        // Container Animation
        gsap.to(project, {
            scrollTrigger: {
                trigger: project,
                start: config.start,
                end: config.end,
                scrub: config.scrub,
                toggleActions: 'play none none reverse'
            },
            y: 0,
            opacity: 1,
            duration: 1.5,
            ease: 'power3.out'
        });

        // Number Parallax
        if (projectNumber) {
            gsap.to(projectNumber, {
                scrollTrigger: {
                    trigger: project,
                    start: config.start,
                    end: config.end,
                    scrub: config.scrub * 1.2
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
                    scrub: config.scrub
                },
                y: 0,
                opacity: 1,
                ease: 'power2.out'
            });
        }
    });
}
