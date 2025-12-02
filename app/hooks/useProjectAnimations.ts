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
            
            projects.forEach((project: any) => {
                const projectContent = project.querySelector('.project-content');
                const projectNumber = project.querySelector('.project-number');
                
                // Unified Bottom-Up Reveal Animation
                // The entire project item subtly fades in and moves up
                gsap.fromTo(project, 
                    { 
                        y: 100, 
                        opacity: 0 
                    },
                    {
                        scrollTrigger: {
                            trigger: project,
                            start: 'top 85%', // Start animation when top of project hits 85% of viewport height
                            end: 'top 60%',   // End animation when top of project hits 60%
                            scrub: 1,         // Smooth scrubbing effect linked to scroll
                            toggleActions: 'play none none reverse'
                        },
                        y: 0,
                        opacity: 1,
                        duration: 1.5,
                        ease: 'power3.out'
                    }
                );

                // Subtle parallax for the number (moves slightly faster)
                if (projectNumber) {
                    gsap.fromTo(projectNumber,
                        { y: 50, opacity: 0 },
                        {
                            scrollTrigger: {
                                trigger: project,
                                start: 'top 90%',
                                end: 'top 50%',
                                scrub: 1.2
                            },
                            y: 0,
                            opacity: 0.3, // Keep it subtle as per design
                            ease: 'power2.out'
                        }
                    );
                }
                
                // Glass card content slight lag for depth
                if (projectContent) {
                    gsap.fromTo(projectContent,
                        { y: 40, opacity: 0 },
                        {
                            scrollTrigger: {
                                trigger: project,
                                start: 'top 80%',
                                end: 'top 40%',
                                scrub: 1
                            },
                            y: 0,
                            opacity: 1,
                            ease: 'power2.out'
                        }
                    );
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
