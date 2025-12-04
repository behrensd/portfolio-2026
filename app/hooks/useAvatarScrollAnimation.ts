'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Helper: Smooth easing functions using GSAP's power ease
const easeInOutCubic = (t: number) => gsap.parseEase('power2.inOut')(t);
const easeOutQuart = (t: number) => gsap.parseEase('power4.out')(t);
const easeInOutQuart = (t: number) => gsap.parseEase('power4.inOut')(t);

// Helper: Clamp value between min and max
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Helper: Linear interpolation with easing
const lerp = (start: number, end: number, progress: number, easeFn = (t: number) => t) => {
    return start + (end - start) * easeFn(progress);
};

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
    const hasLockedOnceRef = useRef(false); // Track if avatar has ever locked
    const avatarStateRef = useRef<'onload' | 'onlock' | 'onclick'>('onload');

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
            const scrollAvatarSize = isMobile ? 120 : 180; // Size during scroll (onload)
            const lockedAvatarSize = isMobile ? 200 : 300; // Larger size for onlock/onclick
            const spacing = isMobile ? 12 : 24;

            // Cache initial measurements (avoid repeated DOM reads)
            const heroRect = heroImage.getBoundingClientRect();

            // Cache hero position for smoother tracking
            let cachedHeroRect = { ...heroRect };
            const updateCachedRect = () => {
                cachedHeroRect = heroImage.getBoundingClientRect();
            };

            // Calculate target once
            const aboutSection = document.getElementById('about');
            const contentWidth = aboutSection?.offsetWidth || window.innerWidth;
            const contentLeft = aboutSection?.getBoundingClientRect().left || 0;
            const rightOffset = isMobile ? 30 : 60;

            // Helper: Update avatar image based on state
            const updateAvatarImage = (state: 'onload' | 'onlock' | 'onclick') => {
                const images = {
                    onload: '/pics/heroavatars/onload.png',
                    onlock: '/pics/heroavatars/onlock.png',
                    onclick: '/pics/heroavatars/onclick.png'
                };
                const imgElement = proxyRef.current?.querySelector('img') as HTMLImageElement;
                if (imgElement && images[state]) {
                    imgElement.src = images[state];
                    avatarStateRef.current = state;

                    // Increase size for onlock and onclick states
                    if ((state === 'onlock' || state === 'onclick') && proxyRef.current) {
                        // For onclick, shift 1rem (16px) to the left
                        const leftOffset = state === 'onclick' ? -16 : 0;
                        const adjustedX = targetX + leftOffset;

                        gsap.to(proxyRef.current, {
                            width: lockedAvatarSize,
                            height: lockedAvatarSize,
                            x: adjustedX,
                            duration: 0.4,
                            ease: 'power2.out'
                        });

                        // Update targetX if onclick to maintain position during scroll
                        if (state === 'onclick') {
                            targetX = adjustedX;
                        }
                    }
                }
            };

            // Create GPU-optimized proxy element - NO circular frame, consistent size
            const proxy = document.createElement('div');
            proxy.id = 'avatar-proxy';
            proxy.style.cssText = `
                position: fixed;
                left: 0;
                top: 0;
                width: ${scrollAvatarSize}px;
                height: ${scrollAvatarSize}px;
                border-radius: 16px;
                overflow: hidden;
                z-index: 9999;
                pointer-events: none;
                opacity: 0;
                transform: translate3d(${heroRect.left}px, ${heroRect.top}px, 0);
                will-change: transform, opacity, width, height;
                -webkit-transform: translate3d(${heroRect.left}px, ${heroRect.top}px, 0);
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
                cursor: pointer;
            `;
            proxy.innerHTML = `<img src="/pics/heroavatars/onload.png" alt="" style="width:100%;height:100%;object-fit:contain;border-radius:inherit;" loading="eager" />`;
            document.body.appendChild(proxy);
            proxyRef.current = proxy;

            // Pre-calculate target position (will be updated when size changes)
            let currentSize = scrollAvatarSize;
            let targetX = contentLeft + (contentWidth / 2) - (currentSize / 2) + rightOffset;
            let targetY = 0; // Will be updated
            let lockedDocumentY = 0;

            const updateTargetY = (size: number = currentSize) => {
                const titleRect = aboutTitle.getBoundingClientRect();
                const verticalOffset = isMobile ? -74 : -84; // Moved up by 4rem (64px) + original offset
                return titleRect.top + (titleRect.height / 2) - (size / 2) + verticalOffset;
            };

            const updateTargetX = (size: number = currentSize) => {
                return contentLeft + (contentWidth / 2) - (size / 2) + rightOffset;
            };

            const lockInFinalPosition = () => {
                isLockedRef.current = true;
                hasLockedOnceRef.current = true; // Mark that avatar has locked - PERMANENT

                // Position at current (small) size first
                targetY = updateTargetY(scrollAvatarSize);
                targetX = updateTargetX(scrollAvatarSize);
                lockedDocumentY = targetY + window.scrollY;

                // Position avatar at final location with scroll size
                gsap.set(proxy, {
                    x: targetX,
                    y: targetY,
                    opacity: 1
                });
                gsap.set(heroImage, { opacity: 0 });
                gsap.set(heroContainer, { opacity: 0 });

                // Enable pointer events when locked
                proxy.style.pointerEvents = 'auto';

                // Phase 2: Delay transition to onlock until AFTER positioning is complete
                // This ensures onlock only shows when fully mounted next to "moin moin"
                setTimeout(() => {
                    if (avatarStateRef.current === 'onload') {
                        // Update size and recalculate position for larger avatar
                        currentSize = lockedAvatarSize;
                        targetX = updateTargetX(lockedAvatarSize);
                        targetY = updateTargetY(lockedAvatarSize);
                        lockedDocumentY = targetY + window.scrollY;

                        // Animate to new position with size change
                        gsap.to(proxy, {
                            x: targetX,
                            y: targetY,
                            duration: 0.4,
                            ease: 'power2.out'
                        });

                        // Change image to onlock (this will also trigger size increase)
                        updateAvatarImage('onlock');
                    }
                }, 300); // 300ms delay to ensure positioning is complete
            };

            const unlockAndReset = () => {
                // NEVER unlock if avatar has already locked once (requirement: "locked for good")
                if (hasLockedOnceRef.current) return;

                if (!isLockedRef.current) return; // Already unlocked
                isLockedRef.current = false;

                // Smooth transition back instead of instant reset
                gsap.to(proxy, {
                    opacity: 0,
                    duration: 0.2,
                    ease: 'power2.out'
                });

                // Disable pointer events when unlocked
                proxy.style.pointerEvents = 'none';

                // Don't reset hero image/container here - let ScrollTrigger onUpdate handle it
            };

            // Create optimized ScrollTrigger
            scrollTriggerRef.current = ScrollTrigger.create({
                trigger: heroSection,
                start: 'bottom 90%', // Trigger earlier (was 80%)
                end: 'bottom 20%', // End later for smoother transition
                scrub: isMobileSafari ? 2 : 1, // Slower scrub on mobile for smoothness
                fastScrollEnd: true, // Optimize fast scrolling
                onUpdate: (self) => {
                    if (isLockedRef.current) return;

                    const p = clamp(self.progress, 0, 1);

                    // Update cached rect for smoother tracking
                    updateCachedRect();

                    // Simplified animation - NO border-radius changes, NO scaling
                    // Phase 1: Fade hero container (0-40%)
                    if (p >= 0 && p <= 0.4) {
                        const phase1 = clamp(p / 0.4, 0, 1);
                        const opacity = lerp(1, 0.3, phase1, easeOutQuart);
                        heroContainer.style.opacity = String(opacity);
                    }

                    // Phase 2: Crossfade from hero to proxy (30-60%)
                    if (p >= 0.3 && p <= 0.6) {
                        const phase2 = clamp((p - 0.3) / 0.3, 0, 1);
                        const easedPhase = easeInOutQuart(phase2);

                        proxy.style.opacity = String(easedPhase);
                        heroImage.style.opacity = String(1 - easedPhase);
                        heroContainer.style.opacity = String(Math.max(0, lerp(0.3, 0, phase2)));
                    } else if (p < 0.3) {
                        proxy.style.opacity = '0';
                        heroImage.style.opacity = '1';
                    } else if (p > 0.6) {
                        proxy.style.opacity = '1';
                        heroImage.style.opacity = '0';
                    }

                    // Phase 3: Move to final position (40-100%)
                    if (p > 0.4) {
                        const phase3 = clamp((p - 0.4) / 0.6, 0, 1);
                        const eased = easeInOutQuart(phase3);

                        const currentTargetY = updateTargetY();
                        const currentStartX = cachedHeroRect.left;
                        const currentStartY = cachedHeroRect.top;

                        const moveX = lerp(currentStartX, targetX, eased);
                        const moveY = lerp(currentStartY, currentTargetY, eased);

                        // NO SCALING - just position
                        proxy.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
                    } else {
                        // Track hero position
                        proxy.style.transform = `translate3d(${cachedHeroRect.left}px, ${cachedHeroRect.top}px, 0)`;
                    }
                },
                onLeave: lockInFinalPosition,
                onEnterBack: () => {
                    unlockAndReset();
                    isLockedRef.current = false;
                },
                onLeaveBack: unlockAndReset
            });

            // Click handler: Phase 3 - Switch from onlock to onclick when clicked
            const handleAvatarClick = () => {
                if (!isLockedRef.current) return; // Only clickable when locked

                // Phase 3: onlock → onclick (allow clicking even if already onclick)
                if (avatarStateRef.current === 'onlock' || avatarStateRef.current === 'onclick') {
                    updateAvatarImage('onclick');
                }
            };

            proxy.addEventListener('click', handleAvatarClick);

            // Optimized scroll handler for locked state with RAF batching
            let rafId: number | null = null;
            let lastScrollY = window.scrollY;

            const handleScroll = () => {
                if (!isLockedRef.current || !proxyRef.current || lockedDocumentY <= 0) return;

                // Cancel previous RAF if not yet executed
                if (rafId !== null) {
                    cancelAnimationFrame(rafId);
                }

                rafId = requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;

                    // Only update if scroll position actually changed
                    if (currentScrollY !== lastScrollY) {
                        const fixedY = lockedDocumentY - currentScrollY;
                        // NO SCALING - same size throughout
                        proxyRef.current!.style.transform = `translate3d(${targetX}px, ${fixedY}px, 0)`;
                        lastScrollY = currentScrollY;
                    }

                    rafId = null;
                });
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
                // Cancel any pending animation frame
                if (rafId !== null) {
                    cancelAnimationFrame(rafId);
                }
                window.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', handleResize);
                proxy.removeEventListener('click', handleAvatarClick);
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
