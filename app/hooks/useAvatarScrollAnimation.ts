'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Avatar Scroll Animation - SCROLL-TIED IMPLEMENTATION
 *
 * CRITICAL FIX: Uses viewport-percentage positioning instead of getBoundingClientRect
 * on About section (which is off-screen during trigger).
 *
 * Scroll-tied animation using GSAP ScrollTrigger with scrub:
 * 1. Phase 1: Avatar in hero center (onload.png)
 * 2. Phase 2: Avatar smoothly follows scroll to fixed viewport position (onclick.png)
 * 3. Phase 3: Avatar locks in place once scroll completes
 *
 * Key improvements:
 * - Target position calculated as viewport percentages (always visible)
 * - Bounds validation ensures avatar stays within viewport
 * - ScrollTrigger with scrub ties animation to scroll progress (visible throughout)
 * - Uses scale transform instead of width/height for better performance
 * - Text lines animated with translateY only
 */
export function useAvatarScrollAnimation() {
    const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
    const heroImageRef = useRef<HTMLImageElement | null>(null);
    const heroContainerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            // Get elements
            const heroSection = document.getElementById('hero');
            const heroImage = document.querySelector('.hero-image') as HTMLImageElement;
            const heroContainer = document.querySelector('.hero-image-container') as HTMLElement;
            const baiLine = document.querySelector('.hero-line:not(.hero-line-solutions)') as HTMLElement;
            const solutionsLine = document.querySelector('.hero-line-solutions') as HTMLElement;

            if (!heroSection || !heroImage || !heroContainer) {
                return;
            }

            heroImageRef.current = heroImage;
            heroContainerRef.current = heroContainer;

            const isMobile = window.innerWidth < 768;
            const lockedSize = isMobile ? 200 : 300;

            /**
             * Calculate target position as viewport percentages
             * CRITICAL FIX: This eliminates dependency on About section's position
             *
             * Desktop: 70% from left, 30% from top
             * Mobile: 50% from left, 35% from top
             */
            const calculateLockPosition = () => {
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                // Target position as viewport percentages
                const targetX = viewportWidth * (isMobile ? 0.5 : 0.7);
                const targetY = viewportHeight * (isMobile ? 0.35 : 0.3);

                // Bounds validation - ensure avatar stays within viewport
                const minX = 20;
                const maxX = viewportWidth - lockedSize - 20;
                const minY = 20;
                const maxY = viewportHeight - lockedSize - 20;

                const safeX = Math.max(minX, Math.min(targetX, maxX));
                const safeY = Math.max(minY, Math.min(targetY, maxY));

                return { x: safeX, y: safeY };
            };

            // Get initial and target positions
            const initialRect = heroImage.getBoundingClientRect();
            const lockPos = calculateLockPosition();

            // Calculate gap size (avatar height + some spacing)
            const avatarHeight = initialRect.height;
            const gapSize = avatarHeight + (isMobile ? 20 : 40); // Avatar height + spacing

            // Set initial text line separation after useHeroAnimation completes
            // This creates space for the avatar between BAI and SOLUTIONS
            if (baiLine) {
                gsap.to(baiLine, {
                    y: -gapSize / 2,
                    duration: 0.6,
                    ease: 'power2.out',
                    delay: 0.2 // Small delay to let hero animation settle
                });
            }
            if (solutionsLine) {
                gsap.to(solutionsLine, {
                    y: gapSize / 2,
                    duration: 0.6,
                    ease: 'power2.out',
                    delay: 0.2
                });
            }

            // Prepare hero image for fixed positioning and animation
            heroImage.style.position = 'fixed';
            heroImage.style.left = '0';
            heroImage.style.top = '0';
            heroImage.style.zIndex = '10002';
            heroImage.style.margin = '0';
            heroImage.style.transformOrigin = 'top left';
            heroImage.style.transform = `translate3d(${initialRect.left}px, ${initialRect.top}px, 0)`;

            const initialSize = initialRect.width;
            const scaleFactor = lockedSize / initialSize;

            // Create scroll-tied animation with ScrollTrigger
            scrollTriggerRef.current = ScrollTrigger.create({
                trigger: heroSection,
                start: 'bottom 80%', // Start when hero bottom reaches 80% of viewport
                end: 'bottom 20%',   // End when hero bottom reaches 20% of viewport
                scrub: 1,            // Smooth scrubbing with 1 second lag
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    const progress = self.progress;

                    // Apply easeIn to text line animation for smoother closing
                    // easeIn: slow start, fast end (accelerates as lines come together)
                    const easeInProgress = progress * progress; // Simple easeIn quadratic

                    // Interpolate avatar position (linear with scroll)
                    const currentX = initialRect.left + (lockPos.x - initialRect.left) * progress;
                    const currentY = initialRect.top + (lockPos.y - initialRect.top) * progress;
                    const currentScale = 1 + (scaleFactor - 1) * progress;

                    // Update avatar transform
                    heroImage.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${currentScale})`;

                    // Fade out container
                    heroContainer.style.opacity = String(1 - progress);

                    // Animate text lines moving toward each other with easeIn
                    // Start position: -gapSize/2 (BAI up) and +gapSize/2 (SOLUTIONS down)
                    // End position: 0 (both centered)
                    // Use GSAP's y property to avoid conflicts with useHeroAnimation
                    if (baiLine) {
                        const baiY = -gapSize / 2 + (gapSize / 2) * easeInProgress;
                        gsap.set(baiLine, { y: baiY });
                    }
                    if (solutionsLine) {
                        const solutionsY = gapSize / 2 - (gapSize / 2) * easeInProgress;
                        gsap.set(solutionsLine, { y: solutionsY });
                    }

                    // Switch image at 50% progress
                    if (progress > 0.5 && heroImage.src.includes('onload.png')) {
                        heroImage.src = 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/heroavatars/onclick.png';
                    }

                    // When animation completes (progress = 1)
                    if (progress === 1) {
                        heroContainer.style.pointerEvents = 'none';
                        heroContainer.style.visibility = 'hidden';
                    }
                }
            });

            // Cleanup function
            return () => {
                if (scrollTriggerRef.current) {
                    scrollTriggerRef.current.kill();
                    scrollTriggerRef.current = null;
                }

                // Reset hero image to original state
                if (heroImageRef.current) {
                    heroImageRef.current.style.position = '';
                    heroImageRef.current.style.left = '';
                    heroImageRef.current.style.top = '';
                    heroImageRef.current.style.zIndex = '';
                    heroImageRef.current.style.transform = '';
                    heroImageRef.current.src = 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/heroavatars/onload.png';
                }

                if (heroContainerRef.current) {
                    heroContainerRef.current.style.opacity = '';
                    heroContainerRef.current.style.pointerEvents = '';
                    heroContainerRef.current.style.visibility = '';
                }

                // Reset hero text lines using GSAP to clear y property
                const currentBaiLine = document.querySelector('.hero-line:not(.hero-line-solutions)') as HTMLElement;
                const currentSolutionsLine = document.querySelector('.hero-line-solutions') as HTMLElement;

                if (currentBaiLine) gsap.set(currentBaiLine, { clearProps: 'y' });
                if (currentSolutionsLine) gsap.set(currentSolutionsLine, { clearProps: 'y' });
            };
        }, 300); // 300ms delay ensures DOM is ready and GSAP initial animations started

        return () => {
            clearTimeout(timer);
        };
    }, []);
}
