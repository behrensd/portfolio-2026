'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { batchedScrollTriggerRefresh } from '../utils/scrollOptimization';
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
 * Helper function to split text into WORDS for anime.js animation
 * CRITICAL: We split by words, not characters, to preserve text-wrap: balance
 * Each word span has white-space: nowrap to prevent mid-word breaks
 */
function splitTextIntoChars(element: HTMLElement): HTMLElement[] {
    if (element.children.length > 0 && element.querySelector('span')) {
        return Array.from(element.children) as HTMLElement[];
    }

    const text = element.getAttribute('data-original-text') || element.textContent || '';

    if (!text || text.trim().length === 0) {
        return [];
    }

    // Split by words to preserve text-wrap: balance behavior
    const words = text.split(/(\s+)/); // Keep whitespace as separate items
    const spans: HTMLElement[] = [];

    words.forEach((word) => {
        if (!word) return;

        const span = document.createElement('span');
        span.textContent = word;

        // Use inline (not inline-block) to preserve text-wrap behavior
        // Only actual words get inline-block for animation, whitespace stays inline
        if (word.trim()) {
            span.style.display = 'inline-block';
            span.style.whiteSpace = 'nowrap'; // CRITICAL: Keep word intact
        } else {
            span.style.display = 'inline';
            span.style.whiteSpace = 'pre'; // Preserve space width
        }
        span.style.opacity = '0';
        spans.push(span);
    });

    element.textContent = '';
    spans.forEach(span => element.appendChild(span));

    return spans.filter(s => s.textContent?.trim()); // Only return word spans for animation
}

/**
 * Helper function to split text into words for anime.js animation
 * Preserves text-wrap behavior by keeping words as atomic units
 */
function splitTextIntoWords(element: HTMLElement): HTMLElement[] {
    if (element.children.length > 0 && element.querySelector('span')) {
        return Array.from(element.children) as HTMLElement[];
    }

    const text = element.getAttribute('data-original-text') || element.textContent || '';

    if (!text || text.trim().length === 0) {
        return [];
    }

    // Split by whitespace but preserve it
    const parts = text.split(/(\s+)/);
    const spans: HTMLElement[] = [];

    parts.forEach((part) => {
        if (!part) return;

        const span = document.createElement('span');
        span.textContent = part;

        if (part.trim()) {
            // Actual word - use inline-block for animation but keep word intact
            span.style.display = 'inline-block';
            span.style.whiteSpace = 'nowrap'; // CRITICAL: Prevent mid-word breaks
        } else {
            // Whitespace - use inline to preserve natural flow
            span.style.display = 'inline';
            span.style.whiteSpace = 'pre';
        }
        span.style.opacity = '0';
        spans.push(span);
    });

    element.textContent = '';
    spans.forEach(span => element.appendChild(span));

    return spans.filter(s => s.textContent?.trim()); // Only return word spans for animation
}

/**
 * Reveal text elements with anime.js animations
 * CRITICAL: Splits text by words (not characters) to preserve CSS text-wrap: balance
 */
function revealTextWithAnime(project: HTMLElement, isMobile: boolean) {
    const title = project.querySelector('.project-title') as HTMLElement;
    const description = project.querySelector('.project-description') as HTMLElement;
    const role = project.querySelector('.project-role') as HTMLElement;
    const tags = project.querySelectorAll('.tag');
    const link = project.querySelector('.project-link') as HTMLElement;
    const credits = project.querySelector('.project-credits') as HTMLElement;

    // Title: Word-by-word reveal (not character - preserves text-wrap)
    if (title && !title.hasAttribute('data-split')) {
        try {
            title.setAttribute('data-split', 'true');
            // Set parent visible BEFORE splitting to let CSS calculate layout
            gsap.set(title, { autoAlpha: 1 });

            // Force reflow to ensure CSS layout is calculated
            void title.offsetHeight;

            const titleWords = splitTextIntoChars(title); // Now splits by words
            if (titleWords.length > 0) {
                animate(titleWords, {
                    opacity: [0, 1],
                    translateY: [15, 0],
                    delay: stagger(80), // Slightly slower for word animation
                    duration: 500,
                    ease: 'outExpo'
                });
            } else {
                gsap.set(title, { autoAlpha: 1 });
            }
        } catch (error) {
            gsap.set(title, { autoAlpha: 1 });
        }
    } else if (title) {
        const titleSpans = title.querySelectorAll('span');
        if (titleSpans.length > 0) {
            gsap.set(title, { autoAlpha: 1 });
            gsap.set(titleSpans, { autoAlpha: 1 });
        } else {
            gsap.set(title, { autoAlpha: 1 });
        }
    }

    // Description: Word-by-word reveal
    if (description && !description.hasAttribute('data-split')) {
        try {
            description.setAttribute('data-split', 'true');
            // Set parent visible BEFORE splitting
            gsap.set(description, { autoAlpha: 1 });

            // Force reflow to ensure CSS layout is calculated
            void description.offsetHeight;

            const descWords = splitTextIntoWords(description);
            if (descWords.length > 0) {
                animate(descWords, {
                    opacity: [0, 1],
                    translateY: [10, 0], // Vertical instead of horizontal for less jarring
                    delay: stagger(40), // Faster stagger for longer text
                    duration: 350,
                    ease: 'outExpo'
                });
            } else {
                gsap.set(description, { autoAlpha: 1 });
            }
        } catch (error) {
            gsap.set(description, { autoAlpha: 1 });
        }
    } else if (description) {
        const descSpans = description.querySelectorAll('span');
        if (descSpans.length > 0) {
            gsap.set(description, { autoAlpha: 1 });
            gsap.set(descSpans, { autoAlpha: 1 });
        } else {
            gsap.set(description, { autoAlpha: 1 });
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
                // Use autoAlpha for consistent visibility handling
                gsap.set(project, { autoAlpha: 1, x: 0 });
                gsap.set(project.querySelectorAll('.project-title, .project-description, .tag, .project-number, .mockup-container, .project-role, .project-link, .project-credits'), { autoAlpha: 1 });
            });
            return;
        }

        const timer = setTimeout(() => {
            const projects = gsap.utils.toArray('.project-item');

            if (projects.length === 0) {
                return;
            }

            // Clean up existing triggers
            const existingTriggers = ScrollTrigger.getAll().filter(t =>
                t.trigger && (t.trigger as HTMLElement).classList.contains('project-item')
            );
            existingTriggers.forEach(t => t.kill());

            projects.forEach((project: any, index: number) => {
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
                
                // Set initial state using autoAlpha (handles visibility + opacity together)
                // autoAlpha: 0 keeps element invisible, autoAlpha: 1 makes it visible
                gsap.set(project, {
                    x: slideDirection === 'left' ? -slideDistance : slideDistance,
                    autoAlpha: 0 // Keeps visibility: hidden until animated
                });

                // Hide text elements initially with autoAlpha
                if (title) {
                    if (!title.hasAttribute('data-original-text')) {
                        title.setAttribute('data-original-text', title.textContent || '');
                    }
                    gsap.set(title, { autoAlpha: 0 });
                }
                if (description) {
                    if (!description.hasAttribute('data-original-text')) {
                        description.setAttribute('data-original-text', description.textContent || '');
                    }
                    gsap.set(description, { autoAlpha: 0 });
                }
                if (tags.length > 0) {
                    gsap.set(tags, { autoAlpha: 0 });
                }

                // Keep role, link, credits visible using autoAlpha
                if (role) gsap.set(role, { autoAlpha: 1 });
                if (link) gsap.set(link, { autoAlpha: 1 });
                if (credits) gsap.set(credits, { autoAlpha: 1 });

                if (projectNumber) gsap.set(projectNumber, { autoAlpha: 0 });
                if (mockupContainer) gsap.set(mockupContainer, { autoAlpha: 0, scale: 0.95 });

                // Unified text reveal function
                const triggerTextReveal = () => {
                    // Only check if slide is complete - allow re-animation
                    if (!project.hasAttribute('data-slide-complete')) {
                        return;
                    }

                    revealTextWithAnime(project, isMobile);
                };

                // REMOVED: resetCardState function
                // Cards now stay visible permanently after first animation
                // Only page refresh will reset them

                // Animation function - triggers ONCE and stays visible forever
                const triggerAnimation = () => {
                    // Only animate if not already animated
                    if (project.hasAttribute('data-animated-once')) {
                        return;
                    }

                    // Mark as animated permanently
                    project.setAttribute('data-animated-once', 'true');
                    project.setAttribute('data-slide-complete', 'true');

                    // Animate the card slide-in (happens once, stays forever)
                    // Use autoAlpha to handle visibility + opacity together
                    gsap.to(project, {
                        x: 0,
                        autoAlpha: 1,
                        duration: 0.9,
                        ease: 'power3.out',
                        overwrite: true // Kill any existing animations
                    });

                    // Fade in number and mockup using autoAlpha
                    if (projectNumber) {
                        gsap.to(projectNumber, {
                            autoAlpha: 0.9,
                            duration: 0.4,
                            ease: 'power2.out',
                            overwrite: true
                        });
                    }
                    if (mockupContainer) {
                        gsap.to(mockupContainer, {
                            autoAlpha: 1,
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
                // Trigger later so users can see the slide-in animation
                const triggerStart = isMobile ? 'top 80%' : 'top 70%';
                const scrollTrigger = ScrollTrigger.create({
                    trigger: project,
                    start: triggerStart,
                    end: 'bottom 10%',
                    invalidateOnRefresh: false, // Layout is stable, no need to recalculate
                    refreshPriority: 1, // Batch with other project triggers
                    once: true, // CRITICAL: Only trigger once, then stay visible forever
                    onEnter: () => {
                        triggerAnimation();
                    }
                    // REMOVED: onEnterBack, onLeave, onLeaveBack
                    // Cards now stay visible permanently after first animation
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
                    // Match ScrollTrigger start: 80% for mobile, 70% for desktop
                    const threshold = isMobile ? 0.8 : 0.7;
                    const isInViewport = rect.top < viewportHeight * threshold && rect.bottom > 0;

                    if (isInViewport && !project.hasAttribute('data-slide-complete')) {
                        // Mark as complete immediately
                        project.setAttribute('data-slide-complete', 'true');
                        project.setAttribute('data-animated-once', 'true');

                        // Animate card using autoAlpha for smooth visibility transition
                        gsap.to(project, {
                            x: 0,
                            autoAlpha: 1,
                            duration: 0.8,
                            ease: 'power3.out'
                        });

                        if (projectNumber) {
                            gsap.to(projectNumber, { autoAlpha: 0.9, duration: 0.3, ease: 'power2.out' });
                        }
                        if (mockupContainer) {
                            gsap.to(mockupContainer, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
                        }

                        // Trigger text reveal IMMEDIATELY (unified animation)
                        setTimeout(triggerTextReveal, 100);
                    }
                    // Cards not in viewport stay hidden (autoAlpha: 0) - no visibility change needed
                };

                // Check immediately (catches first card and mid-page reloads)
                // Also add a delayed check as fallback for timing issues
                checkInitialVisibility();
                setTimeout(checkInitialVisibility, 100);
                setTimeout(checkInitialVisibility, 300);
            });

            batchedScrollTriggerRefresh(true); // Force immediate refresh after cleanup
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
