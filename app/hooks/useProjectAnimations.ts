'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, stagger } from 'animejs';

gsap.registerPlugin(ScrollTrigger);

export function useProjectAnimations() {
    useEffect(() => {
        // Delay to ensure DOM is ready
        const timer = setTimeout(() => {
            // Get all content tiles
            const tiles = gsap.utils.toArray('.content-tile');
            
            tiles.forEach((tile) => {
                // Simple slide-in from bottom
                gsap.to(tile as HTMLElement, {
                    scrollTrigger: {
                        trigger: tile as HTMLElement,
                        start: 'top 80%',
                        end: 'top 20%',
                        scrub: 1,
                    },
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power2.out'
                });
            });
            
            // Initialize individual project animations
            initProject01Animation();
            initProject02Animation();
            initProject03Animation();
            
            // Animate skill items
            const skills = gsap.utils.toArray('.skill-item');
            skills.forEach((skill, index) => {
                gsap.from(skill as HTMLElement, {
                    scrollTrigger: {
                        trigger: skill as HTMLElement,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    },
                    opacity: 0,
                    y: 30,
                    duration: 0.6,
                    ease: 'power2.out',
                    delay: index * 0.15
                });
            });
            
            console.log('✨ Award-winning animations initialized');
        }, 100);

        return () => {
            clearTimeout(timer);
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);
}

// PROJECT 01: STAGGERED CLIP-PATH REVEAL
function initProject01Animation() {
    const project = document.querySelector('.project-item[data-project="0"]');
    if (!project) return;
    
    const projectNumber = project.querySelector('.project-number');
    const projectContent = project.querySelector('.project-content');
    const projectInfo = project.querySelector('.project-info');
    const mockupContainer = project.querySelector('.mockup-container');
    const tags = project.querySelectorAll('.tag');
    
    // Create timeline for project 01
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: project,
            start: 'top 75%',
            end: 'top 25%',
            scrub: 1.5,
        }
    });
    
    // Animate project number with 3D perspective
    tl.from(projectNumber, {
        scale: 0.5,
        transformPerspective: 800,
        rotationY: 45,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
    }, 0);
    
    // Horizontal wipe reveal from center outward using clip-path
    tl.to(projectContent, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 1,
        ease: 'power2.inOut'
    }, 0.2);
    
    // Stagger project info elements from left
    tl.from(projectInfo, {
        x: -60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, 0.4);
    
    // Animate mockup container from right
    if (mockupContainer) {
        tl.from(mockupContainer, {
            x: 100,
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            ease: 'power3.out'
        }, 0.5);
    }
    
    // Create separate trigger for anime.js tag animations
    ScrollTrigger.create({
        trigger: project,
        start: 'top 70%',
        once: true,
        onEnter: () => {
            animate(Array.from(tags), {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(80, {start: 400}),
                duration: 600,
                ease: 'out(3)'
            });
        }
    });
    
    console.log('✅ Project 01 animation initialized');
}

// PROJECT 02: SPLIT-SCREEN PUSH WITH MOCKUP EMERGENCE
function initProject02Animation() {
    const project = document.querySelector('.project-item[data-project="1"]');
    if (!project) return;
    
    const projectNumber = project.querySelector('.project-number');
    const projectContent = project.querySelector('.project-content');
    const mockupContainer = project.querySelector('.mockup-container');
    const tags = project.querySelectorAll('.tag');
    const projectInfo = project.querySelector('.project-info');
    
    // Main timeline with ScrollTrigger
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: project,
            start: 'top 70%',
            end: 'top 20%',
            scrub: 1.8,
        }
    });
    
    // Animate project number with 3D Y-rotation
    tl.from(projectNumber, {
        rotationY: -90,
        transformPerspective: 1000,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
    }, 0);
    
    // Project info slides in from left
    tl.from(projectInfo, {
        x: -80,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, 0.2);
    
    // Mockup pushes in from RIGHT with depth parallax
    if (mockupContainer) {
        tl.from(mockupContainer, {
            x: 200,
            z: -100,
            opacity: 0,
            scale: 0.85,
            duration: 1,
            ease: 'power2.out'
        }, 0.3);
    }
    
    // Animate tags with anime.js elastic effect
    ScrollTrigger.create({
        trigger: project,
        start: 'top 65%',
        once: true,
        onEnter: () => {
            animate(Array.from(tags), {
                translateY: [30, 0],
                opacity: [0, 1],
                scale: [0.8, 1],
                delay: stagger(100, {start: 500}),
                duration: 800,
                ease: 'out(3)'
            });
        }
    });
    
    console.log('✅ Project 02 animation initialized');
}

// PROJECT 03: 3D PERSPECTIVE FLIP
function initProject03Animation() {
    const project = document.querySelector('.project-item[data-project="2"]');
    if (!project) return;
    
    const projectNumber = project.querySelector('.project-number');
    const projectContent = project.querySelector('.project-content');
    const projectInfo = project.querySelector('.project-info');
    const mockupContainer = project.querySelector('.mockup-container');
    const tags = project.querySelectorAll('.tag');
    
    // Set initial 3D state
    gsap.set(projectContent, {
        transformPerspective: 1000,
        transformOrigin: 'bottom center'
    });
    
    // Main timeline for 3D flip effect
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: project,
            start: 'top 75%',
            end: 'top 30%',
            scrub: 2,
        }
    });
    
    // Number fades in with slight rotation
    tl.from(projectNumber, {
        scale: 0.6,
        rotation: -15,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)'
    }, 0);
    
    // Content card flips from flat to upright (3D perspective flip)
    tl.from(projectContent, {
        rotationX: -90,
        z: -200,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
    }, 0.1);
    
    // Info fades in with scale
    tl.from(projectInfo, {
        opacity: 0,
        scale: 0.8,
        filter: 'blur(10px)',
        duration: 0.8,
        ease: 'power2.out'
    }, 0.5);
    
    // Mockup slides in last with blur-to-focus
    if (mockupContainer) {
        tl.from(mockupContainer, {
            y: 50,
            opacity: 0,
            filter: 'blur(15px)',
            duration: 0.8,
            ease: 'power2.out'
        }, 0.7);
    }
    
    // Tags with anime.js
    ScrollTrigger.create({
        trigger: project,
        start: 'top 70%',
        once: true,
        onEnter: () => {
            animate(Array.from(tags), {
                scale: [0, 1],
                opacity: [0, 1],
                delay: stagger(100, {start: 600}),
                duration: 700,
                ease: 'out(2)'
            });
        }
    });
    
    console.log('✅ Project 03 animation initialized');
}
