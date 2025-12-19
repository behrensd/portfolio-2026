import { Page, Route } from '@playwright/test';

/**
 * Asset Mocking Strategies for Performance Optimization
 *
 * Critical: Disable Spline 3D loading (saves ~5-10MB, 2-3s load time per test)
 * Optional: Mock images and videos for even faster execution
 */

/**
 * Mock ALL heavy assets - Maximum performance (recommended for unit tests)
 *
 * Blocks:
 * - Spline 3D scenes (.splinecode files)
 * - Spline runtime scripts
 * - Vercel Blob images (replaced with 1x1 pixel placeholder)
 * - Vercel Blob videos
 *
 * Use for: Unit tests, integration tests, performance tests
 * Savings: ~70% faster test execution
 */
export async function mockHeavyAssets(page: Page) {
  // Block Spline 3D loading (highest impact)
  await page.route('**/*.splinecode', (route: Route) => {
    console.log('[MOCK] Blocked Spline scene:', route.request().url());
    route.abort('blockedbyclient');
  });

  await page.route('**/spline.design/**', (route: Route) => {
    console.log('[MOCK] Blocked Spline runtime:', route.request().url());
    route.abort('blockedbyclient');
  });

  await page.route('**/prod.spline.design/**', (route: Route) => {
    console.log('[MOCK] Blocked Spline CDN:', route.request().url());
    route.abort('blockedbyclient');
  });

  // Mock Vercel Blob images with minimal 1x1 transparent PNG
  await page.route('**/blob.vercel-storage.com/**/*.{png,jpg,jpeg,webp,gif}', (route: Route) => {
    // Minimal 1x1 transparent PNG (base64 encoded)
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: buffer,
    });
  });

  // Block Vercel Blob videos
  await page.route('**/blob.vercel-storage.com/**/*.{mp4,webm,mov}', (route: Route) => {
    console.log('[MOCK] Blocked video:', route.request().url());
    route.abort('blockedbyclient');
  });

  console.log('[MOCK] Heavy assets mocked (Spline + images + videos)');
}

/**
 * Mock only Spline 3D - Allow images/videos (good for visual regression)
 *
 * Blocks:
 * - Spline 3D scenes only
 *
 * Use for: Visual regression tests (need real images)
 * Savings: ~40-50% faster test execution
 */
export async function mockSplineOnly(page: Page) {
  // Block Spline 3D loading
  await page.route('**/*.splinecode', (route: Route) => {
    route.abort('blockedbyclient');
  });

  await page.route('**/spline.design/**', (route: Route) => {
    route.abort('blockedbyclient');
  });

  await page.route('**/prod.spline.design/**', (route: Route) => {
    route.abort('blockedbyclient');
  });

  console.log('[MOCK] Spline only mocked (allowing images/videos)');
}

/**
 * Allow all assets - No mocking (for initial baseline generation)
 *
 * Use for: First-time visual regression baseline creation
 * Note: Slower but ensures accurate visual baselines
 */
export async function allowAllAssets(page: Page) {
  console.log('[MOCK] No asset mocking - full loading enabled');
  // No route blocking - everything loads normally
}

/**
 * Enable GSAP ScrollTrigger visual debugging markers
 *
 * Adds visual lines showing ScrollTrigger start/end points
 * Useful for debugging animation trigger timing issues
 *
 * Use for: Debug tests or when investigating trigger point issues
 */
export async function enableGSAPMarkers(page: Page) {
  await page.addInitScript(() => {
    // Enable ScrollTrigger markers when GSAP loads
    const checkGSAP = setInterval(() => {
      if ((window as any).ScrollTrigger) {
        (window as any).ScrollTrigger.config({
          markers: true, // Show visual debugging markers
        });
        console.log('[DEBUG] GSAP ScrollTrigger markers enabled');
        clearInterval(checkGSAP);
      }
    }, 100);

    // Stop checking after 5 seconds
    setTimeout(() => clearInterval(checkGSAP), 5000);
  });
}

/**
 * Disable all animations for instant state checking
 *
 * Speeds up GSAP timescale and disables CSS animations
 * Useful for testing final states without waiting for animations
 */
export async function disableAllAnimations(page: Page) {
  // Disable CSS animations
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });

  // Speed up GSAP timeline
  await page.addInitScript(() => {
    const checkGSAP = setInterval(() => {
      if ((window as any).gsap) {
        (window as any).gsap.globalTimeline.timeScale(100); // 100x faster
        console.log('[DEBUG] GSAP animations accelerated 100x');
        clearInterval(checkGSAP);
      }
    }, 100);

    setTimeout(() => clearInterval(checkGSAP), 5000);
  });

  console.log('[DEBUG] All animations disabled/accelerated');
}
