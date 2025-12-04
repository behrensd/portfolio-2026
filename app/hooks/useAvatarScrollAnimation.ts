'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Avatar Scroll Animation - Fixed positioning
 */
export function useAvatarScrollAnimation() {
    const proxyRef = useRef<HTMLDivElement | null>(null);
    const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
    const isLockedRef = useRef(false); // Track if avatar is locked in final position

    useEffect(() => {
        console.log('🚀 useAvatarScrollAnimation: Hook mounted');

        const timer = setTimeout(() => {
            // Find elements
            const heroSection = document.getElementById('hero');
            const heroImage = document.querySelector('.hero-image') as HTMLImageElement;
            const heroContainer = document.querySelector('.hero-image-container') as HTMLElement;
            const aboutTitle = document.querySelector('#about .section-title') as HTMLElement;

            if (!heroSection || !heroImage || !heroContainer || !aboutTitle) {
                console.error('❌ Missing elements');
                return;
            }

            console.log('✅ All elements found');

            // Device settings
            const isMobile = window.innerWidth < 768;
            const finalSize = isMobile ? 100 : 150;
            const spacing = isMobile ? 12 : 24;

            // Get INITIAL positions
            const heroRect = heroImage.getBoundingClientRect();
            const startW = heroRect.width;

            // Calculate target position
            const aboutSection = document.getElementById('about');
            const contentWidth = aboutSection ? aboutSection.offsetWidth : window.innerWidth;
            const contentLeft = aboutSection ? aboutSection.getBoundingClientRect().left : 0;
            
            const rightOffset = isMobile ? 30 : 60;
            const targetX = contentLeft + (contentWidth / 2) - (finalSize / 2) + rightOffset;

            // Create proxy element
            const proxy = document.createElement('div');
            proxy.id = 'avatar-proxy';
            proxy.style.cssText = `
                position: fixed;
                left: ${heroRect.left}px;
                top: ${heroRect.top}px;
                width: ${heroRect.width}px;
                height: ${heroRect.height}px;
                border-radius: 24px;
                overflow: hidden;
                z-index: 9999;
                pointer-events: none;
                opacity: 0;
                box-shadow: none;
            `;
            proxy.innerHTML = `<img src="${heroImage.src}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" />`;
            document.body.appendChild(proxy);
            proxyRef.current = proxy;

            // Function to get target Y position
            const getTargetY = () => {
                const titleRect = aboutTitle.getBoundingClientRect();
                const verticalOffset = isMobile ? -10 : -20;
                return titleRect.top + (titleRect.height / 2) - (finalSize / 2) + verticalOffset;
            };

            // Store the locked Y position (document-relative)
            let lockedDocumentY = 0;

            // Function to lock avatar in final position
            const lockInFinalPosition = () => {
                isLockedRef.current = true;
                
                // Calculate and store the DOCUMENT position (not viewport)
                const titleRect = aboutTitle.getBoundingClientRect();
                const verticalOffset = isMobile ? -10 : -20;
                const viewportY = titleRect.top + (titleRect.height / 2) - (finalSize / 2) + verticalOffset;
                lockedDocumentY = viewportY + window.scrollY; // Convert to document position
                
                // Now convert back to fixed position for current scroll
                const fixedY = lockedDocumentY - window.scrollY;
                
                proxy.style.left = `${targetX}px`;
                proxy.style.top = `${fixedY}px`;
                proxy.style.width = `${finalSize}px`;
                proxy.style.height = `${finalSize}px`;
                proxy.style.borderRadius = '50%';
                proxy.style.opacity = '1';
                heroImage.style.opacity = '0';
                heroContainer.style.opacity = '0';
                console.log('🔒 Avatar locked at document Y:', lockedDocumentY);
            };

            // Function to unlock and reset
            const unlockAndReset = () => {
                isLockedRef.current = false;
                proxy.style.opacity = '0';
                heroImage.style.opacity = '1';
                heroImage.style.borderRadius = '24px';
                heroContainer.style.opacity = '1';
                console.log('🔓 Avatar unlocked');
            };

            // Create ScrollTrigger
            scrollTriggerRef.current = ScrollTrigger.create({
                trigger: heroSection,
                start: 'bottom 80%',
                end: 'bottom 10%',
                scrub: 1,
                markers: false,
                onUpdate: (self) => {
                    // If locked, don't update during animation range
                    if (isLockedRef.current) return;
                    
                    const p = self.progress;

                    // Phase 1 (0-30%): Morph hero to circle
                    if (p > 0) {
                        const phase1 = Math.min(1, p / 0.3);
                        const borderRadius = 24 + (26) * phase1;
                        heroImage.style.borderRadius = `${borderRadius}px`;
                    }

                    // Phase 2 (20-50%): Fade container
                    if (p > 0.2) {
                        const phase2 = Math.min(1, (p - 0.2) / 0.3);
                        heroContainer.style.opacity = String(1 - phase2 * 0.7);
                    }

                    // Phase 3 (40-60%): Show proxy, hide hero
                    if (p > 0.4) {
                        const phase3 = Math.min(1, (p - 0.4) / 0.2);
                        proxy.style.opacity = String(phase3);
                        proxy.style.borderRadius = '50%';
                        heroImage.style.opacity = String(1 - phase3);
                        heroContainer.style.opacity = String(Math.max(0, 0.3 - phase3 * 0.3));
                    }

                    // Phase 4 (50-100%): Move proxy to target
                    if (p > 0.5) {
                        const phase4 = Math.min(1, (p - 0.5) / 0.5);
                        
                        const eased = phase4 < 0.5 
                            ? 4 * phase4 * phase4 * phase4 
                            : 1 - Math.pow(-2 * phase4 + 2, 3) / 2;

                        const currentTargetY = getTargetY();
                        const currentHeroRect = heroImage.getBoundingClientRect();
                        const currentStartX = currentHeroRect.left + currentHeroRect.width / 2 - startW / 2;
                        const currentStartY = currentHeroRect.top;

                        const currentX = currentStartX + (targetX - currentStartX) * eased;
                        const currentY = currentStartY + (currentTargetY - currentStartY) * eased;
                        const currentSize = startW + (finalSize - startW) * eased;

                        proxy.style.left = `${currentX}px`;
                        proxy.style.top = `${currentY}px`;
                        proxy.style.width = `${currentSize}px`;
                        proxy.style.height = `${currentSize}px`;
                    } else {
                        const currentHeroRect = heroImage.getBoundingClientRect();
                        proxy.style.left = `${currentHeroRect.left}px`;
                        proxy.style.top = `${currentHeroRect.top}px`;
                        proxy.style.width = `${currentHeroRect.width}px`;
                        proxy.style.height = `${currentHeroRect.height}px`;
                    }
                },
                onLeave: () => {
                    // Animation complete - lock in final position
                    lockInFinalPosition();
                },
                onEnterBack: () => {
                    // User scrolling back up - unlock to allow reverse animation
                    unlockAndReset();
                    isLockedRef.current = false; // Allow onUpdate to work again
                },
                onLeaveBack: () => {
                    // Back at the very top - ensure everything is reset
                    unlockAndReset();
                }
            });

            // Keep proxy at final position while scrolling further down (after animation)
            // Uses document-relative position so it scrolls WITH the page
            const handleScroll = () => {
                if (isLockedRef.current && proxyRef.current && lockedDocumentY > 0) {
                    // Convert document position to current viewport position
                    const fixedY = lockedDocumentY - window.scrollY;
                    proxyRef.current.style.top = `${fixedY}px`;
                }
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
            window.addEventListener('resize', () => {
                ScrollTrigger.refresh();
                if (isLockedRef.current) {
                    lockInFinalPosition(); // Recalculate position on resize
                }
            });

            return () => {
                window.removeEventListener('scroll', handleScroll);
            };
        }, 500);

        return () => {
            clearTimeout(timer);
            if (scrollTriggerRef.current) {
                scrollTriggerRef.current.kill();
            }
            if (proxyRef.current) {
                proxyRef.current.remove();
            }
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
