/**
 * GSAP ScrollTrigger Configuration Utility
 *
 * Provides centralized ScrollTrigger setup with:
 * - Cross-browser compatibility (iOS Safari, Instagram browser, etc.)
 * - Responsive breakpoints via ScrollTrigger.matchMedia()
 * - Optimized settings per device type
 * - Prevention of mobile viewport resize issues
 */

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    detectViewport,
    getScrollTriggerConfig,
    shouldPreventMobileResize,
    type ViewportConfig
} from './viewportConfig';

// Global flag to prevent address bar show/hide from triggering refresh
let hasInitializedScrollTrigger = false;

/**
 * Initialize ScrollTrigger with cross-browser optimizations
 * Call this once at app initialization
 */
export function initScrollTrigger(): void {
    if (typeof window === 'undefined' || hasInitializedScrollTrigger) return;

    const config = detectViewport();

    // Configure ScrollTrigger defaults
    ScrollTrigger.config({
        // Limit ScrollTrigger update frequency for better performance
        limitCallbacks: true,
        // Sync ScrollTrigger with native scroll for smoother animations
        syncInterval: config.isMobile ? 0 : undefined,
    });

    // Prevent mobile address bar resize from triggering refresh
    if (shouldPreventMobileResize(config)) {
        // Track previous dimensions
        let previousWidth = window.innerWidth;
        let previousHeight = window.innerHeight;

        // Remove 'resize' from autoRefreshEvents
        ScrollTrigger.config({
            autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
        });

        // Manual resize handling: only refresh if width changes (orientation)
        window.addEventListener('resize', () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;

            // Only refresh if width changed (orientation change or actual resize)
            // Ignore height-only changes (address bar show/hide)
            if (newWidth !== previousWidth) {
                ScrollTrigger.refresh();
                previousWidth = newWidth;
                previousHeight = newHeight;
            } else if (Math.abs(newHeight - previousHeight) > 100) {
                // Significant height change might be orientation, refresh just in case
                ScrollTrigger.refresh();
                previousHeight = newHeight;
            }
        }, { passive: true });
    }

    hasInitializedScrollTrigger = true;
}

/**
 * Setup responsive ScrollTrigger with matchMedia
 *
 * This allows different ScrollTrigger configurations per breakpoint.
 * ScrollTriggers are automatically reverted/killed when media query changes.
 *
 * @param setup - Function that receives viewport config and returns cleanup function
 */
export function setupResponsiveScrollTrigger(
    setup: (config: ViewportConfig) => (() => void) | void
): (() => void) {
    if (typeof window === 'undefined') return () => {};

    // Define breakpoints matching our CSS
    ScrollTrigger.matchMedia({
        // Extra small phones (< 480px)
        '(max-width: 479px)': () => {
            const config = detectViewport();
            return setup({ ...config, breakpoint: 'xs' });
        },

        // Small phones/mobile (480px - 767px)
        '(min-width: 480px) and (max-width: 767px)': () => {
            const config = detectViewport();
            return setup({ ...config, breakpoint: 'sm' });
        },

        // Tablets (768px - 1023px)
        '(min-width: 768px) and (max-width: 1023px)': () => {
            const config = detectViewport();
            return setup({ ...config, breakpoint: 'md' });
        },

        // Small desktop (1024px - 1279px)
        '(min-width: 1024px) and (max-width: 1279px)': () => {
            const config = detectViewport();
            return setup({ ...config, breakpoint: 'lg' });
        },

        // Large desktop (>= 1280px)
        '(min-width: 1280px)': () => {
            const config = detectViewport();
            return setup({ ...config, breakpoint: 'xl' });
        },
    });

    // Return cleanup function (ScrollTrigger.matchMedia handles cleanup automatically)
    return () => {
        // Cleanup is handled by ScrollTrigger.matchMedia
    };
}

/**
 * Create a ScrollTrigger with optimized settings for current viewport
 *
 * @param trigger - Element or selector to trigger on
 * @param options - ScrollTrigger options (will be merged with optimized defaults)
 * @param triggerType - Type of trigger for preset configs
 */
export function createOptimizedScrollTrigger(
    trigger: string | HTMLElement,
    options: ScrollTrigger.Vars,
    triggerType: 'content-reveal' | 'project-card' | 'hero-scroll' | 'navigation' | 'avatar-scroll' = 'content-reveal'
): ScrollTrigger {
    const config = detectViewport();
    const presetConfig = getScrollTriggerConfig(triggerType, config);

    // Merge preset config with user options
    const finalOptions: ScrollTrigger.Vars = {
        ...presetConfig,
        ...options,
        trigger: trigger,
    };

    // iOS-specific fixes
    if (config.isIOS || config.isSafari) {
        // Skip every other touchmove event on iOS (GSAP best practice)
        finalOptions.anticipatePin = 1;
    }

    // Instagram browser optimization
    if (config.isInstagramBrowser) {
        // Instagram browser benefits from less aggressive scrubbing
        if (typeof finalOptions.scrub === 'number') {
            finalOptions.scrub = Math.max(finalOptions.scrub as number, 0.5);
        }
    }

    // Development markers - DISABLED
    // Uncomment below to enable debugging markers in development
    // if (process.env.NODE_ENV === 'development' && options.markers !== false) {
    //     finalOptions.markers = true;
    //     finalOptions.id = options.id || triggerType;
    // }

    return ScrollTrigger.create(finalOptions);
}

/**
 * Batch ScrollTrigger creation for better performance
 *
 * Use this when creating multiple ScrollTriggers at once (e.g., for multiple project cards)
 * to reduce layout thrashing.
 *
 * @param triggers - Array of trigger configurations
 */
export function batchCreateScrollTriggers(
    triggers: Array<{
        trigger: string | HTMLElement;
        options: ScrollTrigger.Vars;
        triggerType?: 'content-reveal' | 'project-card' | 'hero-scroll' | 'navigation' | 'avatar-scroll';
    }>
): ScrollTrigger[] {
    const results: ScrollTrigger[] = [];

    // Create all triggers without refreshing
    ScrollTrigger.batch(triggers.map(t => t.trigger), {
        onEnter: () => {}, // Will be overridden by individual configs
    });

    // Create individual triggers
    for (const { trigger, options, triggerType } of triggers) {
        results.push(createOptimizedScrollTrigger(trigger, options, triggerType));
    }

    // Refresh once after all are created
    ScrollTrigger.refresh();

    return results;
}

/**
 * Safe ScrollTrigger.refresh() that respects reduced motion preferences
 */
export function safeScrollTriggerRefresh(force = false): void {
    const config = detectViewport();

    if (config.shouldUseReducedAnimations && !force) {
        return;
    }

    ScrollTrigger.refresh();
}

/**
 * Get hardware-accelerated element styles for smooth animations
 * Apply these to elements that will be animated
 */
export function getHardwareAcceleratedStyles(): React.CSSProperties {
    return {
        transform: 'translate3d(0, 0, 0)',
        WebkitTransform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'transform, opacity',
    };
}

/**
 * Apply iOS-specific fixes to an element
 */
export function applyIOSScrollFixes(element: HTMLElement): void {
    const config = detectViewport();

    if (!config.isIOS && !config.isSafari) return;

    // Force hardware acceleration
    element.style.transform = 'translate3d(0, 0, 0)';
    element.style.webkitTransform = 'translate3d(0, 0, 0)';
    element.style.backfaceVisibility = 'hidden';
    element.style.webkitBackfaceVisibility = 'hidden';

    // Prevent sticky positioning issues
    if (config.isIOS) {
        element.style.perspective = '1000px';
        element.style.webkitPerspective = '1000px';
    }
}

/**
 * Check if element is currently in viewport
 * Useful for initial visibility checks
 */
export function isElementInViewport(
    element: HTMLElement,
    threshold: number = 0.9
): boolean {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

    const verticalThreshold = viewportHeight * threshold;
    const isVerticallyVisible = rect.top < verticalThreshold && rect.bottom > 0;
    const isHorizontallyVisible = rect.left < viewportWidth && rect.right > 0;

    return isVerticallyVisible && isHorizontallyVisible;
}
