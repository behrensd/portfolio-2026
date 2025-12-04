'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

/**
 * Avatar Scroll Animation - ANIME.JS IMPLEMENTATION (FIXED)
 *
 * CRITICAL FIX: Uses viewport-percentage positioning instead of getBoundingClientRect
 * on About section (which is off-screen during trigger).
 *
 * Simple 2-phase animation using the ACTUAL hero image (no proxy):
 * 1. Phase 1: Avatar in hero center (onload.png)
 * 2. Phase 2: Avatar locks to fixed viewport position (onclick.png) - stays locked
 *
 * Key improvements:
 * - Target position calculated as viewport percentages (always visible)
 * - Bounds validation ensures avatar stays within viewport
 * - No conflicts with GSAP (useHeroAnimation) - different timing and properties
 * - Uses scale transform instead of width/height for better performance
 * - Text lines animated with translateY only (GSAP owns initial y/opacity)
 */
export function useAvatarScrollAnimation() {
    const isLockedRef = useRef(false);
    const heroImageRef = useRef<HTMLImageElement | null>(null);
    const heroContainerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            // Get elements
            const heroSection = document.getElementById('hero');
            const heroImage = document.querySelector('.hero-image') as HTMLImageElement;
            const heroContainer = document.querySelector('.hero-image-container') as HTMLElement;

            if (!heroSection || !heroImage || !heroContainer) {
                console.warn('Avatar animation: Required elements not found');
                return;
            }

            heroImageRef.current = heroImage;
            heroContainerRef.current = heroContainer;

            const isMobile = window.innerWidth < 768;
            const lockedSize = isMobile ? 200 : 300;

            // Calculate lock threshold (when hero exits viewport)
            const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;

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

                console.log('🎯 Calculated lock position:', {
                    target: { x: targetX, y: targetY },
                    validated: { x: safeX, y: safeY },
                    viewport: { w: viewportWidth, h: viewportHeight },
                    avatarSize: lockedSize
                });

                return { x: safeX, y: safeY };
            };

            // Scroll handler with RAF
            let rafId: number | null = null;

            const handleScroll = () => {
                if (rafId) cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    const scrollThreshold = heroBottom - window.innerHeight * 0.5;

                    if (!isLockedRef.current && scrollY > scrollThreshold) {
                        lockAvatar();
                    }

                    rafId = null;
                });
            };

            function lockAvatar() {
                isLockedRef.current = true;

                console.log('🔒 Locking avatar to fixed position');

                // Get current position before changing to fixed
                const rect = heroImage.getBoundingClientRect();
                const lockPos = calculateLockPosition();

                console.log('📍 Current position:', { x: rect.left, y: rect.top });
                console.log('📍 Target position:', lockPos);
                console.log('✅ Avatar will be VISIBLE in viewport');

                // Get hero text lines for animation
                const baiLine = document.querySelector('.hero-line:not(.hero-line-solutions)') as HTMLElement;
                const solutionsLine = document.querySelector('.hero-line-solutions') as HTMLElement;

                // Change hero image to fixed positioning
                heroImage.style.position = 'fixed';
                heroImage.style.left = '0';
                heroImage.style.top = '0';
                heroImage.style.zIndex = '10002';
                heroImage.style.margin = '0';
                heroImage.style.transformOrigin = 'top left';

                // Set initial transform to current position
                heroImage.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;

                // Switch to onclick image
                heroImage.src = 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/heroavatars/onclick.png';

                // Fade out container to remove it from layout
                animate(heroContainer, {
                    opacity: [1, 0],
                    duration: 600,
                    ease: 'out(3)',
                    onComplete: () => {
                        heroContainer.style.pointerEvents = 'none';
                        heroContainer.style.visibility = 'hidden';
                    }
                });

                // Animate text lines moving toward each other (closing the gap)
                // Note: GSAP animations from useHeroAnimation are complete by now
                // We only animate translateY here - no conflict with GSAP's initial y/opacity
                if (baiLine) {
                    animate(baiLine, {
                        translateY: [0, 50],  // Move BAI down
                        duration: 600,
                        ease: 'out(3)'
                    });
                }

                if (solutionsLine) {
                    animate(solutionsLine, {
                        translateY: [0, -50],  // Move SOLUTIONS up
                        duration: 600,
                        ease: 'out(3)'
                    });
                }

                // Animate avatar to lock position
                // Use scale instead of width/height for better performance
                const currentSize = rect.width;
                const scaleFactor = lockedSize / currentSize;

                animate(heroImage, {
                    translateX: [rect.left, lockPos.x],
                    translateY: [rect.top, lockPos.y],
                    scale: [1, scaleFactor],
                    duration: 800,
                    ease: 'out(3)',
                    onBegin: () => {
                        console.log('🎨 Animation started');
                    },
                    onComplete: () => {
                        console.log('✅ Avatar locked successfully at viewport position');
                        console.log('   Final position:', lockPos);
                    }
                });
            }

            // Attach scroll listener
            window.addEventListener('scroll', handleScroll, { passive: true });

            // Handle window resize - recalculate with new viewport dimensions
            const handleResize = () => {
                if (isLockedRef.current && heroImageRef.current) {
                    const lockPos = calculateLockPosition();

                    // Animate to new position based on new viewport size
                    animate(heroImageRef.current, {
                        translateX: lockPos.x,
                        translateY: lockPos.y,
                        duration: 300,
                        ease: 'out(2)'
                    });

                    console.log('🔄 Viewport resized, avatar repositioned to:', lockPos);
                }
            };

            window.addEventListener('resize', handleResize, { passive: true });

            console.log('✨ Avatar scroll animation initialized (Anime.js, viewport-based positioning)');

            // Cleanup function
            return () => {
                if (rafId) cancelAnimationFrame(rafId);
                window.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', handleResize);

                // Reset hero image to original state
                if (heroImageRef.current) {
                    heroImageRef.current.style.position = '';
                    heroImageRef.current.style.left = '';
                    heroImageRef.current.style.top = '';
                    heroImageRef.current.style.zIndex = '';
                    heroImageRef.current.style.transform = '';
                    heroImageRef.current.style.width = '';
                    heroImageRef.current.style.height = '';
                    heroImageRef.current.src = 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/heroavatars/onload.png';
                }

                if (heroContainerRef.current) {
                    heroContainerRef.current.style.opacity = '';
                    heroContainerRef.current.style.pointerEvents = '';
                    heroContainerRef.current.style.transform = '';
                    heroContainerRef.current.style.visibility = '';
                }

                // Reset hero text lines
                const heroLines = document.querySelectorAll('.hero-line');
                heroLines.forEach((line) => {
                    (line as HTMLElement).style.transform = '';
                });
            };
        }, 300); // 300ms delay ensures DOM is ready and GSAP initial animations started

        return () => {
            clearTimeout(timer);
        };
    }, []);
}
