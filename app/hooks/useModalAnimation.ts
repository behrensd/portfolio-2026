'use client';

import { useEffect, useRef, RefObject } from 'react';
import gsap from 'gsap';

/**
 * Modal Animation Hook - GSAP-based slide-in/slide-out
 *
 * Manages full-screen modal animations with proper enter/exit transitions.
 * Follows project's GSAP animation patterns with mobile optimization.
 *
 * @param modalState - Current modal state (closed | opening | open | closing)
 * @param onAnimationComplete - Callback when animation finishes
 * @returns Ref to attach to modal element
 */
export function useModalAnimation(
    modalState: 'closed' | 'opening' | 'open' | 'closing',
    onAnimationComplete: (finalState: 'open' | 'closed') => void
): RefObject<HTMLDivElement | null> {
    const modalRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);
    const prevStateRef = useRef(modalState);

    useEffect(() => {
        const isMobile = window.innerWidth < 768;

        // Debug: State change detection
        if (prevStateRef.current !== modalState) {
            console.log('🔄 Modal state:', prevStateRef.current, '→', modalState);
            prevStateRef.current = modalState;
        }

        // Kill existing timeline to prevent conflicts
        if (timelineRef.current) {
            timelineRef.current.kill();
            timelineRef.current = null;
        }

        if (!modalRef.current) {
            if (modalState !== 'closed') {
                console.warn('⚠️ Modal element not found', { modalState });
            }
            return;
        }

        // OPENING ANIMATION - Slide in from right
        if (modalState === 'opening') {
            console.log('▶️ Modal opening animation started', {
                duration: isMobile ? 400 : 500,
                ease: 'power3.out',
                mobile: isMobile
            });

            const timeline = gsap.timeline({
                onComplete: () => {
                    console.log('✅ Modal opened successfully');
                    onAnimationComplete('open');
                }
            });

            timeline
                .set(modalRef.current, {
                    display: 'fixed',
                    x: '100%', // Start off-screen to the right
                    opacity: 1
                })
                .to(modalRef.current, {
                    x: '0%', // Slide to final position
                    duration: isMobile ? 0.4 : 0.5,
                    ease: 'power3.out', // Smooth modern ease
                    force3D: true // Hardware acceleration
                });

            timelineRef.current = timeline;
        }

        // CLOSING ANIMATION - Slide out to right
        if (modalState === 'closing') {
            console.log('▶️ Modal closing animation started', {
                duration: isMobile ? 300 : 400,
                ease: 'power2.in',
                mobile: isMobile
            });

            const timeline = gsap.timeline({
                onComplete: () => {
                    console.log('✅ Modal closed successfully');
                    onAnimationComplete('closed');
                }
            });

            timeline.to(modalRef.current, {
                x: '100%', // Slide off-screen to the right
                duration: isMobile ? 0.3 : 0.4,
                ease: 'power2.in', // Snappier exit
                force3D: true
            });

            timelineRef.current = timeline;
        }

        // Cleanup function
        return () => {
            if (timelineRef.current) {
                timelineRef.current.kill();
                timelineRef.current = null;
            }
        };
    }, [modalState, onAnimationComplete]);

    // Lifecycle logging
    useEffect(() => {
        console.log('✨ Modal animation hook initialized');
        return () => {
            console.log('🧹 Modal animation hook cleanup');
        };
    }, []);

    return modalRef;
}
