'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export function useProjectAnimations() {
    // Store our ScrollTriggers to clean up only ours
    const triggersRef = useRef<ScrollTrigger[]>([]);
    const tweensRef = useRef<gsap.core.Tween[]>([]);

    useEffect(() => {
        // Detect mobile
        const isMobile = window.innerWidth < 768;
        
        // Note: normalizeScroll is handled centrally in useSafariScrollFix
        
        // Delay for DOM readiness
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
                
                // Set initial state
                gsap.set(project, { 
                    y: isMobile ? 30 : 50, 
                    opacity: 0,
                    visibility: 'visible'
                });
                if (projectNumber) gsap.set(projectNumber, { opacity: 0 });
                if (projectContent) gsap.set(projectContent, { opacity: 0 });
                if (mockupContainer) gsap.set(mockupContainer, { opacity: 0, x: isMobile ? 30 : 60 });

                // Create tweens and store them
                const projectTween = gsap.to(project, {
                    y: 0,
                    opacity: 1,
                    duration: isMobile ? 0.4 : 0.6,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: project,
                        start: 'top 90%',
                        end: 'top 60%',
                        toggleActions: 'play none none none',
                        invalidateOnRefresh: true,
                    }
                });
                tweensRef.current.push(projectTween);
                if (projectTween.scrollTrigger) triggersRef.current.push(projectTween.scrollTrigger);
                
                if (projectNumber) {
                    const numberTween = gsap.to(projectNumber, {
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
                    tweensRef.current.push(numberTween);
                    if (numberTween.scrollTrigger) triggersRef.current.push(numberTween.scrollTrigger);
                }
                
                if (projectContent) {
                    const contentTween = gsap.to(projectContent, {
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
                    tweensRef.current.push(contentTween);
                    if (contentTween.scrollTrigger) triggersRef.current.push(contentTween.scrollTrigger);
                }
                
                if (mockupContainer) {
                    const mockupTween = gsap.to(mockupContainer, {
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
                    tweensRef.current.push(mockupTween);
                    if (mockupTween.scrollTrigger) triggersRef.current.push(mockupTween.scrollTrigger);
                }
            });
            
            // Single refresh after setup
            ScrollTrigger.refresh(true);
            
            console.log('✨ Project animations initialized');
        }, isMobile ? 300 : 150);

        return () => {
            clearTimeout(timer);
            // Only kill our own ScrollTriggers and tweens
            triggersRef.current.forEach(t => t.kill());
            tweensRef.current.forEach(t => t.kill());
            triggersRef.current = [];
            tweensRef.current = [];
        };
    }, []);
}
