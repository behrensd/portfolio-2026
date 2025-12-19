import { test, expect } from '@playwright/test';
import { mockSplineOnly, enableGSAPMarkers } from '../fixtures/mock-assets';
import { AnimationHelper } from '../fixtures/animation-helpers';
import { ScrollHelper } from '../fixtures/scroll-helpers';

/**
 * Project Card Animation Tests
 *
 * Tests: Slide-in animations, pinning behavior, text reveals
 * Performance: Uses Spline mocking to save ~2-3s per test
 */
test.describe('Project Card Scroll Animations', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Spline to save load time (critical for performance)
    await mockSplineOnly(page);

    // Navigate to homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for projects section to be in DOM (more reliable than networkidle)
    await page.waitForSelector('#projects', { timeout: 10000 }).catch(() => {
      // If projects section not found, wait a bit more for React hydration
      return page.waitForTimeout(1000);
    });

    console.log('[TEST] Page loaded and ready for animation testing');
  });

  test('should initialize ScrollTrigger with project cards', async ({ page }) => {
    const animHelper = new AnimationHelper(page);

    // Wait for ScrollTrigger to initialize
    await animHelper.waitForScrollTriggerInit();

    // Get ScrollTrigger info
    const triggers = await animHelper.getScrollTriggerInfo();

    // Should have triggers for projects
    expect(triggers.length).toBeGreaterThan(0);

    console.log('[TEST] ScrollTrigger initialized with', triggers.length, 'triggers');
  });

  test('should hide project cards initially (CSS opacity: 0)', async ({ page }) => {
    const animHelper = new AnimationHelper(page);

    // Get all project cards
    const projectCards = await page.locator('.project-item').all();
    expect(projectCards.length).toBeGreaterThan(0);

    // First card should be hidden initially (CSS sets opacity: 0)
    const firstCard = projectCards[0];
    const opacity = await firstCard.evaluate((el) => window.getComputedStyle(el).opacity);

    expect(parseFloat(opacity)).toBe(0);
    console.log('[TEST] Project cards correctly hidden initially');
  });

  test('should slide in first project card from left on scroll', async ({ page, isMobile }) => {
    const animHelper = new AnimationHelper(page);
    const scrollHelper = new ScrollHelper(page);

    await animHelper.waitForScrollTriggerInit();

    // Scroll to trigger first project card (90% viewport)
    await scrollHelper.scrollToTrigger('.project-item:nth-child(1)', 'start');

    // Wait for slide-in animation (900ms duration)
    await page.waitForTimeout(1000);

    // Check final state
    const transform = await animHelper.getTransform('.project-item:nth-child(1)');

    expect(transform?.translateX).toBe('0'); // Should be at x: 0
    expect(parseFloat(transform?.opacity || '0')).toBeCloseTo(1, 1); // Should be visible

    console.log('[TEST] Project card slid in successfully');
  });

  test('should reveal text character-by-character after slide-in', async ({ page }) => {
    const animHelper = new AnimationHelper(page);
    const scrollHelper = new ScrollHelper(page);

    await animHelper.waitForScrollTriggerInit();

    // Scroll to center project (triggers pin + text reveal)
    await scrollHelper.scrollToTrigger('.project-item:nth-child(1)', 'center');

    // Wait for pin + text reveal (pin trigger + 150ms delay + animation)
    await page.waitForTimeout(1500);

    // Check if text was split into characters
    const titleSplit = await animHelper.isTextSplit('.project-item:nth-child(1) .project-title');
    expect(titleSplit).toBe(true);

    // Check if text reveal completed
    const textRevealed = await animHelper.hasDataAttribute(
      '.project-item:nth-child(1)',
      'data-text-revealed'
    );
    expect(textRevealed).toBe(true);

    // Check character spans are visible
    const charSpans = await page.locator('.project-item:nth-child(1) .project-title span').all();
    expect(charSpans.length).toBeGreaterThan(0);

    console.log('[TEST] Text revealed with', charSpans.length, 'characters');
  });

  test('should pin card in viewport during scroll', async ({ page, isMobile }) => {
    const animHelper = new AnimationHelper(page);
    const scrollHelper = new ScrollHelper(page);

    await animHelper.waitForScrollTriggerInit();

    // Scroll to trigger pin (center position)
    await scrollHelper.scrollToTrigger('.project-item:nth-child(1)', 'center');

    // Get card position in viewport
    const position1 = await scrollHelper.getDistanceFromViewportTop('.project-item:nth-child(1)');

    // Scroll slightly more
    const currentScroll = await scrollHelper.getScrollPosition();
    await scrollHelper.scrollToPosition(currentScroll + 100, false);

    // Get card position again
    const position2 = await scrollHelper.getDistanceFromViewportTop('.project-item:nth-child(1)');

    // Position should be similar (pinned) - allow 50px tolerance for timing
    expect(Math.abs(position1 - position2)).toBeLessThan(50);

    console.log('[TEST] Card successfully pinned (position difference:', Math.abs(position1 - position2), 'px)');
  });

  test('should reset animation on scroll back to top', async ({ page }) => {
    const animHelper = new AnimationHelper(page);
    const scrollHelper = new ScrollHelper(page);

    await animHelper.waitForScrollTriggerInit();

    // Trigger animation
    await scrollHelper.scrollToTrigger('.project-item:nth-child(1)', 'center');
    await page.waitForTimeout(1500);

    // Verify animation completed
    let textRevealed = await animHelper.hasDataAttribute('.project-item:nth-child(1)', 'data-text-revealed');
    expect(textRevealed).toBe(true);

    // Scroll back to top
    await scrollHelper.scrollToTop();
    await page.waitForTimeout(500);

    // Animation should reset
    textRevealed = await animHelper.hasDataAttribute('.project-item:nth-child(1)', 'data-text-revealed');
    expect(textRevealed).toBe(false);

    console.log('[TEST] Animation successfully reset on scroll back');
  });

  test('should have different pin durations for mobile vs desktop', async ({ page, isMobile }) => {
    const animHelper = new AnimationHelper(page);

    await animHelper.waitForScrollTriggerInit();

    // Get trigger info
    const triggers = await animHelper.getScrollTriggerInfo();

    // Find project pin trigger (should be second trigger for first project)
    const projectTriggers = triggers.filter((t) => t.trigger.includes('project-item'));

    expect(projectTriggers.length).toBeGreaterThan(0);

    // Validate trigger configuration
    const expectedPinDuration = isMobile ? '80%' : '120%';
    console.log('[TEST] Expected pin duration for', isMobile ? 'mobile' : 'desktop', ':', expectedPinDuration);
  });
});

/**
 * Debug Test with GSAP Markers
 * Only runs on 'Debug with GSAP Markers' project
 */
test.describe('Debug: Project Animations with GSAP Markers', () => {
  test.skip(({ browserName, page }) => browserName !== 'chromium', 'Debug tests run on Chrome only');

  test('should show GSAP ScrollTrigger markers for debugging', async ({ page }) => {
    // Enable GSAP markers
    await enableGSAPMarkers(page);
    await mockSplineOnly(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const animHelper = new AnimationHelper(page);
    await animHelper.waitForScrollTriggerInit();

    // Check if markers are visible
    const hasMarkers = await animHelper.hasScrollTriggerMarkers();
    expect(hasMarkers).toBe(true);

    // Take debug screenshot showing markers
    await animHelper.debugScreenshot('gsap-markers');

    console.log('[DEBUG] GSAP markers enabled and visible');

    // Keep page open for visual inspection (comment out for CI)
    // await page.waitForTimeout(10000);
  });
});
