'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hook that tracks global scroll progress (0-1) across the entire page.
 * Used to drive the Armillary Sphere animation phases.
 *
 * Progress mapping:
 * - 0.00-0.15: Scattered (particles at edges)
 * - 0.15-0.30: Forming (converging to rings)
 * - 0.30-0.55: Assembled (orbiting on rings)
 * - 0.55-0.70: Dissolving (breaking apart)
 * - 0.70-1.00: Drifting (around contact card)
 */
export function useArmillaryScrollProgress() {
    const progressRef = useRef<number>(0);
    const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            const smoothContent = document.querySelector('#smooth-content');
            if (!smoothContent) {
                // Fallback: track scroll manually if smooth-content doesn't exist
                const handleScroll = () => {
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    progressRef.current = docHeight > 0 ? window.scrollY / docHeight : 0;
                };
                window.addEventListener('scroll', handleScroll, { passive: true });
                return () => window.removeEventListener('scroll', handleScroll);
            }

            // Create ScrollTrigger spanning entire page
            scrollTriggerRef.current = ScrollTrigger.create({
                trigger: smoothContent,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.5, // Smooth progress tracking
                onUpdate: (self) => {
                    progressRef.current = self.progress;
                }
            });
        }, 100);

        // Cleanup
        return () => {
            clearTimeout(timer);
            if (scrollTriggerRef.current) {
                scrollTriggerRef.current.kill();
                scrollTriggerRef.current = null;
            }
        };
    }, []);

    return progressRef;
}

// Animation phase enum for type safety
export type ArmillaryPhase =
    | 'scattered'
    | 'forming'
    | 'assembled'
    | 'dissolving'
    | 'drifting';

// Phase boundaries (scroll progress values)
export const PHASE_BOUNDARIES = {
    scattered: { start: 0, end: 0.15 },
    forming: { start: 0.15, end: 0.30 },
    assembled: { start: 0.30, end: 0.55 },
    dissolving: { start: 0.55, end: 0.70 },
    drifting: { start: 0.70, end: 1.0 }
} as const;

/**
 * Calculate current phase and progress within that phase
 */
export function calculatePhase(progress: number): {
    phase: ArmillaryPhase;
    phaseProgress: number;
    ringOpacity: number;
} {
    if (progress < PHASE_BOUNDARIES.forming.start) {
        return {
            phase: 'scattered',
            phaseProgress: progress / PHASE_BOUNDARIES.scattered.end,
            ringOpacity: 0
        };
    }

    if (progress < PHASE_BOUNDARIES.assembled.start) {
        const phaseProgress = (progress - PHASE_BOUNDARIES.forming.start) /
            (PHASE_BOUNDARIES.forming.end - PHASE_BOUNDARIES.forming.start);
        return {
            phase: 'forming',
            phaseProgress,
            ringOpacity: Math.min(1, phaseProgress * 1.5) // Rings fade in during forming
        };
    }

    if (progress < PHASE_BOUNDARIES.dissolving.start) {
        return {
            phase: 'assembled',
            phaseProgress: (progress - PHASE_BOUNDARIES.assembled.start) /
                (PHASE_BOUNDARIES.assembled.end - PHASE_BOUNDARIES.assembled.start),
            ringOpacity: 1
        };
    }

    if (progress < PHASE_BOUNDARIES.drifting.start) {
        const phaseProgress = (progress - PHASE_BOUNDARIES.dissolving.start) /
            (PHASE_BOUNDARIES.dissolving.end - PHASE_BOUNDARIES.dissolving.start);
        return {
            phase: 'dissolving',
            phaseProgress,
            ringOpacity: Math.max(0, 1 - phaseProgress * 1.5) // Rings fade out
        };
    }

    return {
        phase: 'drifting',
        phaseProgress: (progress - PHASE_BOUNDARIES.drifting.start) /
            (PHASE_BOUNDARIES.drifting.end - PHASE_BOUNDARIES.drifting.start),
        ringOpacity: 0
    };
}

// Easing functions for smooth transitions
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
export const easeInOutQuad = (t: number): number =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const easeOutQuad = (t: number): number => 1 - (1 - t) * (1 - t);
export const easeInOutCubic = (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Calculate the sphere center position based on scroll progress.
 * Keeps sphere centered on X axis, moves vertically through the page.
 *
 * Path:
 * - 0-15%: Start slightly high, drift down
 * - 15-30%: Continue moving to center
 * - 30-55%: Assembled - stays centered, slight depth movement
 * - 55-70%: Move toward bottom for contact
 * - 70%+: Settle near contact area
 */
export function calculateSphereCenter(progress: number): { x: number; y: number; z: number } {
    // Scattered phase: sphere center slightly above
    if (progress < PHASE_BOUNDARIES.forming.start) {
        const t = progress / PHASE_BOUNDARIES.forming.start;
        return {
            x: 0,
            y: 1.0 - t * 0.3,   // Start high, drift down slightly
            z: -0.5 + t * 0.3   // Start back, come forward
        };
    }

    // Forming phase: move toward center
    if (progress < PHASE_BOUNDARIES.assembled.start) {
        const t = (progress - PHASE_BOUNDARIES.forming.start) /
            (PHASE_BOUNDARIES.assembled.start - PHASE_BOUNDARIES.forming.start);
        const eased = easeOutCubic(t);
        return {
            x: 0,
            y: 0.7 - eased * 0.7,   // Move to center (0)
            z: -0.2 + eased * 0.2   // Come to front (0)
        };
    }

    // Assembled phase: stays centered, subtle depth breathing
    if (progress < PHASE_BOUNDARIES.dissolving.start) {
        const t = (progress - PHASE_BOUNDARIES.assembled.start) /
            (PHASE_BOUNDARIES.dissolving.start - PHASE_BOUNDARIES.assembled.start);
        return {
            x: 0,
            y: 0,
            z: Math.sin(t * Math.PI) * 0.2  // Subtle depth pulse
        };
    }

    // Dissolving phase: move toward bottom
    if (progress < PHASE_BOUNDARIES.drifting.start) {
        const t = (progress - PHASE_BOUNDARIES.dissolving.start) /
            (PHASE_BOUNDARIES.drifting.start - PHASE_BOUNDARIES.dissolving.start);
        const eased = easeInOutQuad(t);
        return {
            x: 0,
            y: -eased * 2.5,  // Move down toward contact
            z: 0.2 - eased * 0.2
        };
    }

    // Drifting phase: settled near contact area
    const t = (progress - PHASE_BOUNDARIES.drifting.start) /
        (1 - PHASE_BOUNDARIES.drifting.start);
    return {
        x: 0,
        y: -2.5 - t * 1.5,  // Continue drifting down
        z: 0
    };
}
