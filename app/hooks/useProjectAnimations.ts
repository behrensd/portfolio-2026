'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, stagger } from 'animejs';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    // Expose immediately for Playwright tests (before useEffect runs)
    if (!(window as any).ScrollTrigger) {
        (window as any).ScrollTrigger = ScrollTrigger;
    }
    if (!(window as any).gsap) {
        (window as any).gsap = gsap;
    }
}

/**
 * Helper function to split text into characters for anime.js animation
 */
function splitTextIntoChars(element: HTMLElement): HTMLElement[] {
    if (element.children.length > 0 && element.querySelector('span')) {
        return Array.from(element.children) as HTMLElement[];
    }
    
    const text = element.getAttribute('data-original-text') || element.textContent || '';
    
    if (!text || text.trim().length === 0) {
        return [];
    }
    
    const chars: HTMLElement[] = [];
    text.split('').forEach((char) => {
        const span = document.createElement('span');
        // Preserve spaces - use regular space with white-space: pre to maintain spacing
        if (char === ' ') {
            span.textContent = ' ';
            span.style.width = '0.25em'; // Ensure space width is preserved
            span.style.minWidth = '0.25em';
        } else {
            span.textContent = char;
        }
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.whiteSpace = 'pre'; // Preserve whitespace
        chars.push(span);
    });
    
    element.textContent = '';
    chars.forEach(char => element.appendChild(char));
    
    return chars;
}

/**
 * Helper function to split text into words for anime.js animation
 */
function splitTextIntoWords(element: HTMLElement): HTMLElement[] {
    if (element.children.length > 0 && element.querySelector('span')) {
        return Array.from(element.children) as HTMLElement[];
    }
    
    const text = element.getAttribute('data-original-text') || element.textContent || '';
    
    if (!text || text.trim().length === 0) {
        return [];
    }
    
    const words: HTMLElement[] = [];
    const wordArray = text.split(' ');
    
    wordArray.forEach((word, index) => {
        const span = document.createElement('span');
        // Preserve spaces between words - add space after each word except the last
        span.textContent = word + (index < wordArray.length - 1 ? ' ' : '');
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.whiteSpace = 'pre'; // Preserve whitespace
        words.push(span);
    });
    
    element.textContent = '';
    words.forEach(word => element.appendChild(word));
    
    return words;
}

/**
 * Reveal text elements with anime.js animations
 */
function revealTextWithAnime(project: HTMLElement, isMobile: boolean) {
    // Allow re-animation - remove the guard that prevents it
    // The resetCardState function will handle cleaning up previous animations
    console.log('✨ Revealing text for project:', project.getAttribute('data-project'));

    const title = project.querySelector('.project-title') as HTMLElement;
    const description = project.querySelector('.project-description') as HTMLElement;
    const role = project.querySelector('.project-role') as HTMLElement;
    const tags = project.querySelectorAll('.tag');
    const link = project.querySelector('.project-link') as HTMLElement;
    const credits = project.querySelector('.project-credits') as HTMLElement;

    // Title: Character-by-character reveal
    if (title && !title.hasAttribute('data-split')) {
        try {
            title.setAttribute('data-split', 'true');
            // CRITICAL FIX: Set parent opacity to 1 BEFORE splitting
            gsap.set(title, { opacity: 1, visibility: 'visible' });

            const titleChars = splitTextIntoChars(title);
            if (titleChars.length > 0) {
                animate(titleChars, {
                    opacity: [0, 1],
                    translateY: [20, 0],
                    scale: [0.8, 1],
                    delay: stagger(50),
                    duration: 600,
                    ease: 'outElastic(1, 0.5)'
                });
            } else {
                gsap.set(title, { opacity: 1, visibility: 'visible' });
            }
        } catch (error) {
            console.error('Error animating title:', error);
            gsap.set(title, { opacity: 1, visibility: 'visible' });
        }
    } else if (title) {
        const titleSpans = title.querySelectorAll('span');
        if (titleSpans.length > 0) {
            gsap.set(title, { opacity: 1, visibility: 'visible' });
            gsap.set(titleSpans, { opacity: 1, visibility: 'visible' });
        } else {
            gsap.set(title, { opacity: 1, visibility: 'visible' });
        }
    }

    // Description: Word-by-word reveal
    if (description && !description.hasAttribute('data-split')) {
        try {
            description.setAttribute('data-split', 'true');
            // CRITICAL FIX: Set parent opacity to 1 BEFORE splitting
            gsap.set(description, { opacity: 1, visibility: 'visible' });

            const descWords = splitTextIntoWords(description);
            if (descWords.length > 0) {
                animate(descWords, {
                    opacity: [0, 1],
                    translateX: [-20, 0],
                    delay: stagger(100),
                    duration: 400,
                    ease: 'outExpo'
                });
            } else {
                gsap.set(description, { opacity: 1, visibility: 'visible' });
            }
        } catch (error) {
            console.error('Error animating description:', error);
            gsap.set(description, { opacity: 1, visibility: 'visible' });
        }
    } else if (description) {
        const descSpans = description.querySelectorAll('span');
        if (descSpans.length > 0) {
            gsap.set(description, { opacity: 1, visibility: 'visible' });
            gsap.set(descSpans, { opacity: 1, visibility: 'visible' });
        } else {
            gsap.set(description, { opacity: 1, visibility: 'visible' });
        }
    }
    
    // Role: Fade in
    if (role) {
        animate(role, {
            opacity: [0, 1],
            translateY: [10, 0],
            delay: 300,
            duration: 400,
            ease: 'outExpo'
        });
    }
    
    // Tags: Individual tag reveals
    if (tags.length > 0) {
        const tagsArray = Array.from(tags) as HTMLElement[];
        animate(tagsArray, {
            opacity: [0, 1],
            scale: [0.5, 1],
            translateY: [10, 0],
            delay: stagger(80),
            duration: 350,
            ease: 'outBack(1.5)'
        });
    }
    
    // Link: Fade in
    if (link) {
        animate(link, {
            opacity: [0, 1],
            scale: [0.9, 1],
            delay: 400,
            duration: 300,
            ease: 'outExpo'
        });
    }
    
    // Credits: Fade in
    if (credits) {
        animate(credits, {
            opacity: [0, 1],
            delay: 500,
            duration: 300,
            ease: 'outExpo'
        });
    }

    // Mark as revealed IMMEDIATELY to prevent duplicate triggers
    // This must be at the END after all animations are queued
    project.setAttribute('data-text-revealed', 'true');
    console.log('✅ Text reveal complete for project:', project.getAttribute('data-project'));
}

export function useProjectAnimations() {
    const triggersRef = useRef<ScrollTrigger[]>([]);
    const tweensRef = useRef<gsap.core.Tween[]>([]);
    // observersRef removed - no longer using IntersectionObserver

    useEffect(() => {
        const initKey = 'project-animations-initialized';
        if ((window as any)[initKey]) {
            return;
        }
        (window as any)[initKey] = true;

        const isMobile = window.innerWidth < 768;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            const projects = gsap.utils.toArray('.project-item');
            projects.forEach((project: any) => {
                gsap.set(project, { opacity: 1, x: 0, visibility: 'visible' });
                gsap.set(project.querySelectorAll('.project-title, .project-description, .tag'), { opacity: 1 });
            });
            return;
        }

        const timer = setTimeout(() => {
            const projects = gsap.utils.toArray('.project-item');

            console.log('🚀 Initializing project animations for', projects.length, 'projects');

            if (projects.length === 0) {
                console.warn('⚠️ No .project-item elements found');
                return;
            }

            // Clean up existing triggers
            const existingTriggers = ScrollTrigger.getAll().filter(t =>
                t.trigger && (t.trigger as HTMLElement).classList.contains('project-item')
            );
            existingTriggers.forEach(t => t.kill());

            projects.forEach((project: any, index: number) => {
                console.log(`📋 Setting up project ${index}:`, project.getAttribute('data-project'));
                const projectNumber = project.querySelector('.project-number');
                const mockupContainer = project.querySelector('.mockup-container');
                const title = project.querySelector('.project-title') as HTMLElement;
                const description = project.querySelector('.project-description') as HTMLElement;
                const tags = project.querySelectorAll('.tag');
                const role = project.querySelector('.project-role') as HTMLElement;
                const link = project.querySelector('.project-link') as HTMLElement;
                const credits = project.querySelector('.project-credits') as HTMLElement;
                
                // Determine slide direction
                const slideDirection = index % 2 === 0 ? 'left' : 'right';
                const slideDistance = isMobile ? 80 : 120;
                
                // Set initial state
                gsap.set(project, { 
                    x: slideDirection === 'left' ? -slideDistance : slideDistance,
                    opacity: 0,
                    visibility: 'visible'
                });
                
                // Hide text elements initially
                if (title) {
                    if (!title.hasAttribute('data-original-text')) {
                        title.setAttribute('data-original-text', title.textContent || '');
                    }
                    gsap.set(title, { opacity: 0, visibility: 'visible' });
                }
                if (description) {
                    if (!description.hasAttribute('data-original-text')) {
                        description.setAttribute('data-original-text', description.textContent || '');
                    }
                    gsap.set(description, { opacity: 0, visibility: 'visible' });
                }
                if (tags.length > 0) {
                    gsap.set(tags, { opacity: 0, visibility: 'visible' });
                }
                
                // Keep role, link, credits visible
                if (role) gsap.set(role, { opacity: 1, visibility: 'visible' });
                if (link) gsap.set(link, { opacity: 1, visibility: 'visible' });
                if (credits) gsap.set(credits, { opacity: 1, visibility: 'visible' });
                
                if (projectNumber) gsap.set(projectNumber, { opacity: 0 });
                if (mockupContainer) gsap.set(mockupContainer, { opacity: 0, scale: 0.95 });

                // Unified text reveal function
                const triggerTextReveal = () => {
                    // Only check if slide is complete - allow re-animation
                    if (!project.hasAttribute('data-slide-complete')) {
                        console.log('⚠️ triggerTextReveal called but slide not complete:', project.getAttribute('data-project'));
                        return;
                    }

                    console.log('🎬 Triggering text reveal for project:', project.getAttribute('data-project'));
                    revealTextWithAnime(project, isMobile);
                };

                // Reset function to prepare card for animation
                const resetCardState = () => {
                    console.log('🔄 Resetting card state for project:', project.getAttribute('data-project'));
                    
                    // Kill any running animations on this project to prevent conflicts
                    gsap.killTweensOf(project);
                    gsap.killTweensOf(projectNumber);
                    gsap.killTweensOf(mockupContainer);
                    if (title) gsap.killTweensOf(title);
                    if (description) gsap.killTweensOf(description);
                    if (tags.length > 0) gsap.killTweensOf(tags);
                    
                    // Reset card position and visibility
                    gsap.set(project, { 
                        x: slideDirection === 'left' ? -slideDistance : slideDistance, 
                        opacity: 0,
                        visibility: 'visible'
                    });
                    
                    // Remove completion flags to allow re-animation
                    project.removeAttribute('data-text-revealed');
                    project.removeAttribute('data-slide-complete');
                    
                    // Reset number and mockup
                    if (projectNumber) {
                        gsap.set(projectNumber, { opacity: 0 });
                    }
                    if (mockupContainer) {
                        gsap.set(mockupContainer, { opacity: 0, scale: 0.95 });
                    }
                    
                    // Reset text elements - clear any existing splits and reset opacity
                    if (title) {
                        // Clear any existing child spans
                        const titleSpans = title.querySelectorAll('span');
                        if (titleSpans.length > 0) {
                            const originalText = title.getAttribute('data-original-text') || title.textContent || '';
                            title.textContent = originalText;
                            title.removeAttribute('data-split');
                        }
                        gsap.set(title, { opacity: 0, visibility: 'visible' });
                    }
                    if (description) {
                        // Clear any existing child spans
                        const descSpans = description.querySelectorAll('span');
                        if (descSpans.length > 0) {
                            const originalText = description.getAttribute('data-original-text') || description.textContent || '';
                            description.textContent = originalText;
                            description.removeAttribute('data-split');
                        }
                        gsap.set(description, { opacity: 0, visibility: 'visible' });
                    }
                    if (tags.length > 0) {
                        // Reset all tag spans if they exist
                        tags.forEach((tag: Element) => {
                            const tagElement = tag as HTMLElement;
                            const tagSpans = tagElement.querySelectorAll('span');
                            if (tagSpans.length > 0) {
                                const originalText = tagElement.textContent || '';
                                tagElement.textContent = originalText;
                            }
                        });
                        gsap.set(tags, { opacity: 0, visibility: 'visible' });
                    }
                };

                // Shared animation function for onEnter and onEnterBack
                const triggerAnimation = () => {
                    // Always allow re-animation
                    console.log('🎯 ScrollTrigger - starting animation for project:', project.getAttribute('data-project'));

                    // Mark slide as starting
                    project.setAttribute('data-slide-complete', 'true');

                    // Animate the card slide-in (manual control for reliable re-animation)
                    gsap.to(project, {
                        x: 0,
                        opacity: 1,
                        duration: 0.9,
                        ease: 'power3.out',
                        overwrite: true // Kill any existing animations
                    });

                    // Fade in number and mockup
                    if (projectNumber) {
                        gsap.to(projectNumber, {
                            opacity: 0.9,
                            duration: 0.4,
                            ease: 'power2.out',
                            overwrite: true
                        });
                    }
                    if (mockupContainer) {
                        gsap.to(mockupContainer, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.7,
                            ease: 'power3.out',
                            overwrite: true
                        });
                    }

                    // Trigger text reveal IMMEDIATELY (unified animation)
                    // Small delay to let card start sliding in
                    setTimeout(triggerTextReveal, 100);
                };

                // Create ScrollTrigger without attaching to a tween - we'll control animations manually
                const scrollTrigger = ScrollTrigger.create({
                    trigger: project,
                    start: 'top 90%',
                    end: 'bottom 10%',
                    invalidateOnRefresh: true,
                    // Observe both directions
                    onEnter: () => {
                        console.log('⬇️ onEnter triggered');
                        triggerAnimation();
                    },
                    onEnterBack: () => {
                        console.log('⬆️ onEnterBack triggered');
                        triggerAnimation();
                    },
                    onLeave: () => {
                        console.log('⬆️ onLeave triggered - scrolling up past card');
                        // Reset when scrolling up past the card
                        resetCardState();
                    },
                    onLeaveBack: () => {
                        console.log('⬇️ onLeaveBack triggered - scrolling down past card');
                        // Reset when scrolling down past the card
                        resetCardState();
                    }
                });

                // Store the ScrollTrigger
                triggersRef.current.push(scrollTrigger);

                // IntersectionObserver removed - no longer needed
                // Text reveal now triggers directly in onEnter and checkInitialVisibility
                // This eliminates the "double pulse" issue

                // Check if card is already in viewport on load (for first card and mid-page reloads)
                const checkInitialVisibility = () => {
                    // Ensure element is in DOM and has dimensions before checking
                    if (!project.offsetParent && project.offsetHeight === 0 && project.offsetWidth === 0) {
                        // Element not yet rendered, retry after a short delay
                        setTimeout(checkInitialVisibility, 50);
                        return;
                    }

                    const rect = project.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const isInViewport = rect.top < viewportHeight * 0.9 && rect.bottom > 0;

                    if (isInViewport && !project.hasAttribute('data-slide-complete')) {
                        console.log('👁️ Project already in viewport on load:', project.getAttribute('data-project'));

                        // Mark as complete immediately
                        project.setAttribute('data-slide-complete', 'true');

                        // Ensure visibility is set before animating
                        gsap.set(project, { visibility: 'visible' });

                        // Animate card
                        gsap.to(project, {
                            x: 0,
                            opacity: 1,
                            duration: 0.8,
                            ease: 'power3.out',
                            onComplete: () => {
                                // Ensure card stays visible after animation
                                gsap.set(project, { opacity: 1, visibility: 'visible' });
                            }
                        });

                        if (projectNumber) {
                            gsap.to(projectNumber, { opacity: 0.9, duration: 0.3, ease: 'power2.out' });
                        }
                        if (mockupContainer) {
                            gsap.to(mockupContainer, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
                        }

                        // Trigger text reveal IMMEDIATELY (unified animation)
                        setTimeout(triggerTextReveal, 100);
                    } else if (!isInViewport) {
                        // Card not in viewport - ensure it's properly hidden but visible in DOM
                        gsap.set(project, { visibility: 'visible' });
                    }
                };

                // Check immediately (catches first card and mid-page reloads)
                // Also add a delayed check as fallback for timing issues
                checkInitialVisibility();
                setTimeout(checkInitialVisibility, 100);
                setTimeout(checkInitialVisibility, 300);
            });

            ScrollTrigger.refresh(true);
        }, isMobile ? 350 : 200); // Changed from 150/300 to prevent timing conflicts

        return () => {
            clearTimeout(timer);
            triggersRef.current.forEach(t => t.kill());
            tweensRef.current.forEach(t => t.kill());
            triggersRef.current = [];
            tweensRef.current = [];

            delete (window as any)[initKey];
        };
    }, []);
}
