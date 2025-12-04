'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Avatar Scroll Animation - MOBILE SAFARI OPTIMIZED
 * 
 * Performance optimizations:
 * 1. Uses transform (translate, scale) instead of left/top/width/height
 * 2. Normalizes scroll for iOS Safari
 * 3. Simplified calculations in onUpdate
 * 4. Reduced DOM reads with cached values
 * 5. Uses requestAnimationFrame-friendly patterns
 */
export function useAvatarScrollAnimation() {
    const proxyRef = useRef<HTMLDivElement | null>(null);
    const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
    const isLockedRef = useRef(false);

    useEffect(() => {
        // Detect iOS Safari for specific optimizations
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isMobileSafari = isIOS && isSafari;

        // Normalize scroll on iOS for smoother animations
        if (isMobileSafari) {
            ScrollTrigger.normalizeScroll(true);
        }

        const timer = setTimeout(() => {
            const heroSection = document.getElementById('hero');
            const heroImage = document.querySelector('.hero-image') as HTMLImageElement;
            const heroContainer = document.querySelector('.hero-image-container') as HTMLElement;
            const aboutTitle = document.querySelector('#about .section-title') as HTMLElement;

            if (!heroSection || !heroImage || !heroContainer || !aboutTitle) {
                return;
            }

            const isMobile = window.innerWidth < 768;
            const finalSize = isMobile ? 100 : 150;
            const spacing = isMobile ? 12 : 24;

            // Cache initial measurements (avoid repeated DOM reads)
            const heroRect = heroImage.getBoundingClientRect();
            const startX = heroRect.left + heroRect.width / 2;
            const startY = heroRect.top + heroRect.height / 2;
            const startSize = heroRect.width;
            const scaleRatio = finalSize / startSize;

            // Calculate target once
            const aboutSection = document.getElementById('about');
            const contentWidth = aboutSection?.offsetWidth || window.innerWidth;
            const contentLeft = aboutSection?.getBoundingClientRect().left || 0;
            const rightOffset = isMobile ? 30 : 60;

            // Create GPU-optimized proxy element
            const proxy = document.createElement('div');
            proxy.id = 'avatar-proxy';
            proxy.style.cssText = `
                position: fixed;
                left: 0;
                top: 0;
                width: ${startSize}px;
                height: ${startSize}px;
                border-radius: 24px;
                overflow: hidden;
                z-index: 9999;
                pointer-events: none;
                opacity: 0;
                transform: translate3d(${heroRect.left}px, ${heroRect.top}px, 0);
                will-change: transform, opacity;
                -webkit-transform: translate3d(${heroRect.left}px, ${heroRect.top}px, 0);
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
            `;
            proxy.innerHTML = `<img src="${heroImage.src}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" loading="eager" />`;
            document.body.appendChild(proxy);
            proxyRef.current = proxy;

            // Pre-calculate target position
            let targetX = contentLeft + (contentWidth / 2) - (finalSize / 2) + rightOffset;
            let targetY = 0; // Will be updated
            let lockedDocumentY = 0;

            const updateTargetY = () => {
                const titleRect = aboutTitle.getBoundingClientRect();
                const verticalOffset = isMobile ? -10 : -20;
                return titleRect.top + (titleRect.height / 2) - (finalSize / 2) + verticalOffset;
            };

            const lockInFinalPosition = () => {
                isLockedRef.current = true;
                targetY = updateTargetY();
                lockedDocumentY = targetY + window.scrollY;

                // Use transforms for GPU acceleration
                gsap.set(proxy, {
                    x: targetX,
                    y: targetY,
                    scale: scaleRatio,
                    borderRadius: '50%',
                    opacity: 1
                });
                gsap.set(heroImage, { opacity: 0 });
                gsap.set(heroContainer, { opacity: 0 });
            };

            const unlockAndReset = () => {
                isLockedRef.current = false;
                gsap.set(proxy, { opacity: 0 });
                gsap.set(heroImage, { opacity: 1, borderRadius: '24px' });
                gsap.set(heroContainer, { opacity: 1 });
            };

            // Create optimized ScrollTrigger
            scrollTriggerRef.current = ScrollTrigger.create({
                trigger: heroSection,
                start: 'bottom 80%',
                end: 'bottom 10%',
                scrub: isMobileSafari ? 2 : 1, // Slower scrub on mobile for smoothness
                fastScrollEnd: true, // Optimize fast scrolling
                onUpdate: (self) => {
                    if (isLockedRef.current) return;

                    const p = self.progress;

                    // Phase 1: Morph to circle (GPU-friendly border-radius)
                    if (p <= 0.3) {
                        const phase1 = p / 0.3;
                        heroImage.style.borderRadius = `${24 + 26 * phase1}px`;
                    }

                    // Phase 2: Fade (GPU-friendly opacity)
                    if (p > 0.2 && p <= 0.5) {
                        const phase2 = (p - 0.2) / 0.3;
                        heroContainer.style.opacity = String(1 - phase2 * 0.7);
                    }

                    // Phase 3: Swap visibility
                    if (p > 0.4 && p <= 0.6) {
                        const phase3 = (p - 0.4) / 0.2;
                        proxy.style.opacity = String(phase3);
                        proxy.style.borderRadius = '50%';
                        heroImage.style.opacity = String(1 - phase3);
                        heroContainer.style.opacity = String(Math.max(0, 0.3 - phase3 * 0.3));
                    }

                    // Phase 4: Move with transforms (GPU-accelerated)
                    if (p > 0.5) {
                        const phase4 = Math.min(1, (p - 0.5) / 0.5);
                        // Smooth cubic easing
                        const eased = phase4 < 0.5
                            ? 4 * phase4 * phase4 * phase4
                            : 1 - Math.pow(-2 * phase4 + 2, 3) / 2;

                        const currentTargetY = updateTargetY();
                        const currentHeroRect = heroImage.getBoundingClientRect();
                        const currentStartX = currentHeroRect.left;
                        const currentStartY = currentHeroRect.top;

                        const moveX = currentStartX + (targetX - currentStartX) * eased;
                        const moveY = currentStartY + (currentTargetY - currentStartY) * eased;
                        const currentScale = 1 + (scaleRatio - 1) * eased;

                        // Single transform update (GPU-friendly)
                        proxy.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(${currentScale})`;
                    } else {
                        // Track hero position with transform
                        const currentHeroRect = heroImage.getBoundingClientRect();
                        proxy.style.transform = `translate3d(${currentHeroRect.left}px, ${currentHeroRect.top}px, 0)`;
                    }
                },
                onLeave: lockInFinalPosition,
                onEnterBack: () => {
                    unlockAndReset();
                    isLockedRef.current = false;
                },
                onLeaveBack: unlockAndReset
            });

            // Throttled scroll handler for locked state
            let ticking = false;
            const handleScroll = () => {
                if (!ticking && isLockedRef.current && proxyRef.current && lockedDocumentY > 0) {
                    ticking = true;
                    requestAnimationFrame(() => {
                        const fixedY = lockedDocumentY - window.scrollY;
                        proxyRef.current!.style.transform = `translate3d(${targetX}px, ${fixedY}px, 0) scale(${scaleRatio})`;
                        ticking = false;
                    });
                }
            };

            window.addEventListener('scroll', handleScroll, { passive: true });

            // Safe refresh on resize
            const handleResize = () => {
                ScrollTrigger.refresh(true); // true = safe refresh
                if (isLockedRef.current) {
                    lockInFinalPosition();
                }
            };
            window.addEventListener('resize', handleResize, { passive: true });

            return () => {
                window.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', handleResize);
            };
        }, 500);

        return () => {
            clearTimeout(timer);
            
            // Disable normalizeScroll on cleanup
            if (isMobileSafari) {
                ScrollTrigger.normalizeScroll(false);
            }
            
            scrollTriggerRef.current?.kill();
            proxyRef.current?.remove();

            const heroImage = document.querySelector('.hero-image') as HTMLElement;
            const heroContainer = document.querySelector('.hero-image-container') as HTMLElement;
            if (heroImage) {
                heroImage.style.opacity = '1';
                heroImage.style.borderRadius = '24px';
            }
            if (heroContainer) {
                heroContainer.style.opacity = '1';
            }
        };
    }, []);
}
