'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

/**
 * Avatar Scroll Animation - ANIME.JS IMPLEMENTATION
 *
 * Simple 2-phase animation using the ACTUAL hero image (no proxy):
 * 1. Phase 1: Avatar in hero center (onload.png)
 * 2. Phase 2: Avatar locks center-right next to "MOIN MOIN" (onclick.png) - stays locked
 *
 * Key insight: Instead of creating a proxy, we just change the hero image from
 * relative to fixed positioning and animate it directly!
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
            const aboutTitle = document.querySelector('#about .section-title') as HTMLElement;

            if (!heroSection || !heroImage || !heroContainer || !aboutTitle) {
                console.warn('Avatar animation: Required elements not found');
                return;
            }

            heroImageRef.current = heroImage;
            heroContainerRef.current = heroContainer;

            const isMobile = window.innerWidth < 768;
            const lockedSize = isMobile ? 200 : 300;
            const spacing = isMobile ? 40 : 60;

            // Calculate lock threshold (when hero exits viewport)
            const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;

            // Calculate lock position (center-right next to "MOIN MOIN")
            const calculateLockPosition = () => {
                const titleRect = aboutTitle.getBoundingClientRect();
                const titleCenterY = titleRect.top + (titleRect.height / 2);

                const lockX = titleRect.right + spacing;
                const lockY = titleCenterY - (lockedSize / 2);

                return { x: lockX, y: lockY };
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
                // BAI moves down, SOLUTIONS moves up
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
                animate(heroImage, {
                    translateX: [rect.left, lockPos.x],
                    translateY: [rect.top, lockPos.y],
                    width: [rect.width, lockedSize],
                    height: [rect.height, lockedSize],
                    duration: 800,
                    ease: 'out(3)',
                    onBegin: () => {
                        console.log('🎨 Animation started');
                    },
                    onComplete: () => {
                        console.log('✅ Avatar locked successfully');
                    }
                });
            }

            // Attach scroll listener
            window.addEventListener('scroll', handleScroll, { passive: true });

            // Handle window resize
            const handleResize = () => {
                if (isLockedRef.current && heroImageRef.current) {
                    const lockPos = calculateLockPosition();

                    animate(heroImageRef.current, {
                        translateX: lockPos.x,
                        translateY: lockPos.y,
                        duration: 300,
                        ease: 'out(2)'
                    });
                }
            };

            window.addEventListener('resize', handleResize, { passive: true });

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
                }

                // Reset hero text lines
                const heroLines = document.querySelectorAll('.hero-line');
                heroLines.forEach((line) => {
                    (line as HTMLElement).style.transform = '';
                    (line as HTMLElement).style.opacity = '';
                });
            };
        }, 300); // 300ms delay ensures DOM is ready

        return () => {
            clearTimeout(timer);
        };
    }, []);
}
