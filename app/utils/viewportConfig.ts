/**
 * Viewport Detection and Configuration Utility
 *
 * Provides centralized viewport/device detection and ScrollTrigger configuration
 * for consistent, cross-browser scroll animations.
 *
 * Key Features:
 * - Accurate mobile/tablet/desktop detection
 * - iOS Safari and Instagram in-app browser detection
 * - Standardized ScrollTrigger start/end values per viewport
 * - Performance-optimized settings per device type
 */

export interface ViewportConfig {
    // Device detection
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isTouchDevice: boolean;

    // Browser detection
    isIOS: boolean;
    isSafari: boolean;
    isInstagramBrowser: boolean;
    isWebKit: boolean;

    // Viewport dimensions
    width: number;
    height: number;
    breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

    // Performance hints
    prefersReducedMotion: boolean;
    shouldUseReducedAnimations: boolean;
}

export interface ScrollTriggerConfig {
    // Standard start/end values for this viewport
    start: string;
    end: string;

    // Performance settings
    scrub: number | boolean;
    invalidateOnRefresh: boolean;
    refreshPriority: number;

    // Viewport-specific tweaks
    markers?: boolean; // Only for development
}

/**
 * Detect current viewport configuration
 */
export function detectViewport(): ViewportConfig {
    if (typeof window === 'undefined') {
        // Server-side default
        return {
            isMobile: false,
            isTablet: false,
            isDesktop: true,
            isTouchDevice: false,
            isIOS: false,
            isSafari: false,
            isInstagramBrowser: false,
            isWebKit: false,
            width: 1920,
            height: 1080,
            breakpoint: 'lg',
            prefersReducedMotion: false,
            shouldUseReducedAnimations: false,
        };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Touch capability detection
    const isTouchDevice = 'ontouchstart' in window ||
                          navigator.maxTouchPoints > 0 ||
                          (navigator as any).msMaxTouchPoints > 0;

    // iOS detection (includes iPadOS)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Safari detection (desktop and mobile)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Instagram in-app browser detection
    // Instagram uses WKWebView on iOS with specific user agent
    const isInstagramBrowser = /Instagram/i.test(navigator.userAgent);

    // WebKit detection (Safari, Instagram, Chrome on iOS)
    const isWebKit = /AppleWebKit/i.test(navigator.userAgent);

    // Breakpoint detection
    let breakpoint: ViewportConfig['breakpoint'];
    if (width < 480) breakpoint = 'xs';
    else if (width < 768) breakpoint = 'sm';
    else if (width < 1024) breakpoint = 'md';
    else if (width < 1280) breakpoint = 'lg';
    else breakpoint = 'xl';

    // Device type detection
    const isMobile = width < 768 && isTouchDevice;
    const isTablet = width >= 768 && width < 1024 && isTouchDevice;
    const isDesktop = width >= 1024 || !isTouchDevice;

    // Motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Determine if we should use reduced animations
    // True for: reduced motion preference, low-end devices, or very small screens
    const shouldUseReducedAnimations = prefersReducedMotion ||
                                       (isMobile && width < 360) ||
                                       (isIOS && !window.requestIdleCallback); // Older iOS devices

    return {
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        isIOS,
        isSafari,
        isInstagramBrowser,
        isWebKit,
        width,
        height,
        breakpoint,
        prefersReducedMotion,
        shouldUseReducedAnimations,
    };
}

/**
 * Get ScrollTrigger configuration for a given trigger type and viewport
 *
 * @param triggerType - Type of scroll trigger (content-reveal, project-card, navigation, etc.)
 * @param config - Current viewport configuration
 */
export function getScrollTriggerConfig(
    triggerType: 'content-reveal' | 'project-card' | 'hero-scroll' | 'navigation' | 'avatar-scroll',
    config: ViewportConfig
): ScrollTriggerConfig {
    const { isMobile, isTablet, isDesktop, shouldUseReducedAnimations } = config;

    // Base configuration per trigger type
    const baseConfigs: Record<typeof triggerType, ScrollTriggerConfig> = {
        'content-reveal': {
            // For tiles, skills, etc.
            start: isMobile ? 'top 85%' : isTablet ? 'top 80%' : 'top 75%',
            end: 'bottom 10%',
            scrub: false,
            invalidateOnRefresh: false,
            refreshPriority: 1,
        },
        'project-card': {
            // For project items with complex animations
            start: isMobile ? 'top 90%' : isTablet ? 'top 85%' : 'top 80%',
            end: 'bottom 10%',
            scrub: false,
            invalidateOnRefresh: false,
            refreshPriority: 1,
        },
        'hero-scroll': {
            // For hero section parallax/scroll effects
            start: 'top top',
            end: 'bottom top',
            scrub: isMobile ? 0.5 : 1,
            invalidateOnRefresh: true,
            refreshPriority: 2,
        },
        'navigation': {
            // For dock navigation active state
            start: 'top center',
            end: 'bottom center',
            scrub: false,
            invalidateOnRefresh: false,
            refreshPriority: 3,
        },
        'avatar-scroll': {
            // For avatar scroll animation
            start: 'bottom 80%',
            end: 'bottom 20%',
            scrub: isMobile ? 0.5 : 1,
            invalidateOnRefresh: true,
            refreshPriority: 2,
        },
    };

    const baseConfig = baseConfigs[triggerType];

    // Apply reduced motion overrides
    if (shouldUseReducedAnimations) {
        return {
            ...baseConfig,
            scrub: false,
            invalidateOnRefresh: false,
        };
    }

    return baseConfig;
}

/**
 * Get animation delay for viewport
 * Longer delays on mobile to ensure DOM readiness
 */
export function getAnimationDelay(config: ViewportConfig): number {
    const { isMobile, isIOS } = config;

    // iOS needs longer delays due to rendering pipeline
    if (isIOS) return 350;
    if (isMobile) return 300;
    return 150;
}

/**
 * Get optimal animation duration for viewport
 */
export function getAnimationDuration(config: ViewportConfig, baseDuration: number = 0.8): number {
    const { isMobile, shouldUseReducedAnimations } = config;

    if (shouldUseReducedAnimations) return 0; // Instant
    if (isMobile) return baseDuration * 0.8; // Slightly faster on mobile
    return baseDuration;
}

/**
 * Check if ScrollTrigger should skip resize events on vertical-only mobile resize
 * (prevents address bar show/hide from triggering refresh)
 */
export function shouldPreventMobileResize(config: ViewportConfig): boolean {
    return config.isMobile || config.isTablet;
}

/**
 * Get cache key for viewport config
 * Useful for memoization/caching
 */
export function getViewportCacheKey(config: ViewportConfig): string {
    return `${config.breakpoint}-${config.isTouchDevice ? 'touch' : 'mouse'}-${config.isIOS ? 'ios' : 'other'}`;
}

// Export a singleton instance that updates on resize
let currentViewport: ViewportConfig | null = null;
let resizeTimeout: number | null = null;

/**
 * Get current viewport config (cached with resize debouncing)
 */
export function getCurrentViewport(): ViewportConfig {
    if (!currentViewport) {
        currentViewport = detectViewport();
    }
    return currentViewport;
}

/**
 * Initialize viewport detection with resize listener
 * Call this once on app init
 */
export function initViewportDetection(onResize?: (config: ViewportConfig) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    currentViewport = detectViewport();

    const handleResize = () => {
        if (resizeTimeout !== null) {
            clearTimeout(resizeTimeout);
        }

        // Debounce resize events
        resizeTimeout = window.setTimeout(() => {
            const oldConfig = currentViewport!;
            const newConfig = detectViewport();

            // Only trigger callback if breakpoint changed
            if (oldConfig.breakpoint !== newConfig.breakpoint ||
                oldConfig.isMobile !== newConfig.isMobile) {
                currentViewport = newConfig;
                onResize?.(newConfig);
            }

            resizeTimeout = null;
        }, 250);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Return cleanup function
    return () => {
        window.removeEventListener('resize', handleResize);
        if (resizeTimeout !== null) {
            clearTimeout(resizeTimeout);
        }
    };
}
