/**
 * Scroll Performance Optimization Utilities
 * 
 * Provides batched ScrollTrigger refresh calls and performance optimizations
 * to reduce scroll-related jank and improve overall scroll performance.
 */

import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Debounce timer for batched refresh calls
let refreshTimer: number | null = null;
let pendingRefresh = false;

/**
 * Batched ScrollTrigger refresh with debouncing
 * 
 * Instead of calling ScrollTrigger.refresh() multiple times,
 * this batches refresh calls and executes them once after a short delay.
 * This reduces the number of layout recalculations and improves performance.
 * 
 * @param immediate - If true, refresh immediately without debouncing
 */
export function batchedScrollTriggerRefresh(immediate = false): void {
    if (immediate) {
        // Clear any pending refresh
        if (refreshTimer !== null) {
            cancelAnimationFrame(refreshTimer);
            refreshTimer = null;
        }
        pendingRefresh = false;
        ScrollTrigger.refresh();
        return;
    }

    // Mark that a refresh is pending
    pendingRefresh = true;

    // Clear existing timer
    if (refreshTimer !== null) {
        cancelAnimationFrame(refreshTimer);
    }

    // Schedule refresh on next animation frame
    // This batches multiple refresh calls into a single execution
    refreshTimer = requestAnimationFrame(() => {
        if (pendingRefresh) {
            ScrollTrigger.refresh();
            pendingRefresh = false;
        }
        refreshTimer = null;
    });
}

/**
 * Force immediate refresh (use sparingly, e.g., after major layout changes)
 */
export function forceScrollTriggerRefresh(): void {
    batchedScrollTriggerRefresh(true);
}

/**
 * Cleanup function to cancel any pending refresh
 */
export function cancelPendingRefresh(): void {
    if (refreshTimer !== null) {
        cancelAnimationFrame(refreshTimer);
        refreshTimer = null;
    }
    pendingRefresh = false;
}

