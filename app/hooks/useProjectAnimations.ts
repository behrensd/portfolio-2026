'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { batchedScrollTriggerRefresh } from '../utils/scrollOptimization';

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
 * Simple element stagger reveal using GSAP timeline
 * Replaced complex word-by-word animation with reliable fade-in
 */
function revealTextElements(project: HTMLElement, isMobile: boolean) {
    const title = project.querySelector('.project-title');
    const description = project.querySelector('.project-description');
    const role = project.querySelector('.project-role');
    const tags = project.querySelectorAll('.tag');
    const link = project.querySelector('.project-link');
    const credits = project.querySelector('.project-credits');
    const number = project.querySelector('.project-number');
    const mockup = project.querySelector('.mockup-container');

    // Simple sequential reveal with GSAP timeline
    const timeline = gsap.timeline();

    // Number and mockup animate alongside card slide
    if (number) {
        timeline.to(number, {
            autoAlpha: 0.9,
            duration: 0.3,
            ease: 'power2.out'
        }, 0);
    }

    if (mockup) {
        timeline.to(mockup, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            ease: 'power3.out'
        }, 0);
    }

    // Text elements staggered - simple and reliable
    if (title) {
        timeline.to(title, {
            autoAlpha: 1,
            duration: 0.4,
            ease: 'power2.out'
        }, 0.1);
    }

    if (description) {
        timeline.to(description, {
            autoAlpha: 1,
            duration: 0.4,
            ease: 'power2.out'
        }, 0.2);
    }

    if (role) {
        timeline.to(role, {
            autoAlpha: 1,
            duration: 0.3,
            ease: 'power2.out'
        }, 0.3);
    }

    if (tags.length > 0) {
        timeline.to(tags, {
            autoAlpha: 1,
            duration: 0.3,
            stagger: 0.05,
            ease: 'power2.out'
        }, 0.35);
    }

    if (link) {
        timeline.to(link, {
            autoAlpha: 1,
            duration: 0.3,
            ease: 'power2.out'
        }, 0.4);
    }

    if (credits) {
        timeline.to(credits, {
            autoAlpha: 1,
            duration: 0.3,
            ease: 'power2.out'
        }, 0.45);
    }

    // Mark as text revealed
    project.setAttribute('data-text-revealed', 'true');
}

export function useProjectAnimations() {
    const triggersRef = useRef<ScrollTrigger[]>([]);
    const tweensRef = useRef<gsap.core.Tween[]>([]);
    const refreshHandlerRef = useRef<(() => void) | null>(null);
    const scrollHandlerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const initKey = 'project-animations-initialized';
        if ((window as any)[initKey]) {
            return;
        }
        (window as any)[initKey] = true;

        const isMobile = window.innerWidth < 768;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Reduced motion: show everything immediately with class
        if (prefersReducedMotion) {
            const projects = gsap.utils.toArray('.project-item');
            projects.forEach((project: any) => {
                gsap.set(project, { autoAlpha: 1, x: 0 });
                gsap.set(project.querySelectorAll('.project-title, .project-description, .tag, .project-number, .mockup-container, .project-role, .project-link, .project-credits'), { autoAlpha: 1 });
                project.classList.add('is-revealed');
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

            // Simplified slide distances
            const slideDistance = isMobile ? 50 : 80;

            projects.forEach((project: any, index: number) => {
                const projectNumber = project.querySelector('.project-number');
                const mockupContainer = project.querySelector('.mockup-container');
                const title = project.querySelector('.project-title');
                const description = project.querySelector('.project-description');
                const tags = project.querySelectorAll('.tag');
                const role = project.querySelector('.project-role');
                const link = project.querySelector('.project-link');
                const credits = project.querySelector('.project-credits');

                // Alternate slide direction
                const slideDirection = index % 2 === 0 ? 'left' : 'right';

                // Set initial state - card hidden and offset
                gsap.set(project, {
                    x: slideDirection === 'left' ? -slideDistance : slideDistance,
                    autoAlpha: 0
                });

                // Hide all content elements
                if (title) gsap.set(title, { autoAlpha: 0 });
                if (description) gsap.set(description, { autoAlpha: 0 });
                if (tags.length > 0) gsap.set(tags, { autoAlpha: 0 });
                if (role) gsap.set(role, { autoAlpha: 0 });
                if (link) gsap.set(link, { autoAlpha: 0 });
                if (credits) gsap.set(credits, { autoAlpha: 0 });
                if (projectNumber) gsap.set(projectNumber, { autoAlpha: 0 });
                if (mockupContainer) gsap.set(mockupContainer, { autoAlpha: 0, scale: 0.95 });

                // Animation function - triggers ONCE and adds permanent class
                const triggerAnimation = () => {
                    if (project.hasAttribute('data-animated-once')) {
                        return;
                    }

                    // Mark as animated
                    project.setAttribute('data-animated-once', 'true');
                    project.setAttribute('data-slide-complete', 'true');

                    // Slide in the card
                    gsap.to(project, {
                        x: 0,
                        autoAlpha: 1,
                        duration: 0.6,
                        ease: 'power3.out',
                        onComplete: () => {
                            // Add bulletproof visibility class
                            project.classList.add('is-revealed');
                        }
                    });

                    // Reveal text elements with stagger
                    setTimeout(() => {
                        revealTextElements(project, isMobile);
                    }, 100);
                };

                // Create ScrollTrigger
                const triggerStart = isMobile ? 'top 80%' : 'top 70%';
                const scrollTrigger = ScrollTrigger.create({
                    trigger: project,
                    start: triggerStart,
                    end: 'bottom 10%',
                    invalidateOnRefresh: false,
                    refreshPriority: 1,
                    once: true,
                    onEnter: () => {
                        triggerAnimation();
                    }
                });

                triggersRef.current.push(scrollTrigger);

                // Check if already in viewport OR above viewport on load
                // This handles: normal load, mid-page refresh, and bottom-of-page refresh
                const checkInitialVisibility = () => {
                    if (!project.offsetParent && project.offsetHeight === 0) {
                        setTimeout(checkInitialVisibility, 50);
                        return;
                    }

                    const rect = project.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const threshold = isMobile ? 0.8 : 0.7;

                    // In viewport: top is above threshold AND bottom is visible
                    const isInViewport = rect.top < viewportHeight * threshold && rect.bottom > 0;

                    // ABOVE viewport: element has been scrolled past (bottom is above viewport top)
                    // This catches cards when user refreshes at bottom of page
                    const isAboveViewport = rect.bottom < 0;

                    if ((isInViewport || isAboveViewport) && !project.hasAttribute('data-slide-complete')) {
                        project.setAttribute('data-slide-complete', 'true');
                        project.setAttribute('data-animated-once', 'true');

                        // If above viewport, show instantly (no animation needed - user already scrolled past)
                        if (isAboveViewport) {
                            gsap.set(project, { x: 0, autoAlpha: 1 });
                            project.classList.add('is-revealed');
                            // Show all child elements instantly too
                            const children = project.querySelectorAll('.project-title, .project-description, .project-role, .tag, .project-link, .project-credits, .project-number, .mockup-container');
                            gsap.set(children, { autoAlpha: 1 });
                            gsap.set(project.querySelector('.mockup-container'), { scale: 1 });
                            project.setAttribute('data-text-revealed', 'true');
                        } else {
                            // In viewport - animate normally
                            gsap.to(project, {
                                x: 0,
                                autoAlpha: 1,
                                duration: 0.6,
                                ease: 'power3.out',
                                onComplete: () => {
                                    project.classList.add('is-revealed');
                                }
                            });

                            setTimeout(() => {
                                revealTextElements(project, isMobile);
                            }, 100);
                        }
                    }
                };

                checkInitialVisibility();
                setTimeout(checkInitialVisibility, 100);
                setTimeout(checkInitialVisibility, 300);
            });

            // Safety net: re-apply visibility class on any ScrollTrigger refresh
            refreshHandlerRef.current = () => {
                document.querySelectorAll('.project-item[data-animated-once]').forEach(el => {
                    if (!el.classList.contains('is-revealed')) {
                        el.classList.add('is-revealed');
                    }
                });
            };
            ScrollTrigger.addEventListener('refresh', refreshHandlerRef.current);

            // Additional safety net: on scroll, check for any unrevealed cards above viewport
            let scrollTicking = false;
            scrollHandlerRef.current = () => {
                if (!scrollTicking) {
                    scrollTicking = true;
                    requestAnimationFrame(() => {
                        document.querySelectorAll('.project-item:not([data-slide-complete])').forEach(el => {
                            const rect = el.getBoundingClientRect();
                            // If card is above viewport (already scrolled past) but not revealed
                            if (rect.bottom < 0) {
                                el.setAttribute('data-slide-complete', 'true');
                                el.setAttribute('data-animated-once', 'true');
                                el.setAttribute('data-text-revealed', 'true');
                                gsap.set(el, { x: 0, autoAlpha: 1 });
                                el.classList.add('is-revealed');
                                const children = el.querySelectorAll('.project-title, .project-description, .project-role, .tag, .project-link, .project-credits, .project-number, .mockup-container');
                                gsap.set(children, { autoAlpha: 1 });
                                gsap.set(el.querySelector('.mockup-container'), { scale: 1 });
                            }
                        });
                        scrollTicking = false;
                    });
                }
            };

            // Run safety check on scroll (throttled via rAF)
            window.addEventListener('scroll', scrollHandlerRef.current, { passive: true });

            batchedScrollTriggerRefresh(true);
        }, isMobile ? 350 : 200);

        return () => {
            clearTimeout(timer);
            triggersRef.current.forEach(t => t.kill());
            tweensRef.current.forEach(t => t.kill());
            triggersRef.current = [];
            tweensRef.current = [];

            // Clean up event handlers
            if (refreshHandlerRef.current) {
                ScrollTrigger.removeEventListener('refresh', refreshHandlerRef.current);
                refreshHandlerRef.current = null;
            }
            if (scrollHandlerRef.current) {
                window.removeEventListener('scroll', scrollHandlerRef.current);
                scrollHandlerRef.current = null;
            }

            delete (window as any)[initKey];
        };
    }, []);
}
