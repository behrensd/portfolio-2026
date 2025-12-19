import { Page, expect } from '@playwright/test';

/**
 * Animation Testing Helper Class
 *
 * Provides utilities for testing GSAP ScrollTrigger and Anime.js animations
 * Includes debugging, state checking, and wait utilities
 */
export class AnimationHelper {
  constructor(private page: Page) {}

  /**
   * Wait for GSAP ScrollTrigger to initialize
   * Essential: Call this before any ScrollTrigger-related tests
   */
  async waitForScrollTriggerInit() {
    // First, wait for projects to be rendered (React hydration)
    // Use waitForFunction instead of waitForSelector because items have opacity: 0 initially
    await this.page.waitForFunction(
      () => document.querySelectorAll('.project-item').length > 0,
      { timeout: 10000 }
    );
    
    // Wait for React to fully hydrate and animation hook to run
    // The hook has a setTimeout delay (150-300ms) + time for ScrollTrigger setup
    await this.page.waitForTimeout(500);
    
    // First, debug what's available
    const debugInfo = await this.page.evaluate(() => {
      const projectCount = document.querySelectorAll('.project-item').length;
      const hasScrollTrigger = !!(window as any).ScrollTrigger;
      const triggerCount = hasScrollTrigger ? (window as any).ScrollTrigger.getAll().length : 0;
      return { projectCount, hasScrollTrigger, triggerCount };
    });
    console.log('[TEST] Debug info:', debugInfo);

    // Wait for ScrollTrigger to be exposed (in case module hasn't loaded yet)
    await this.page.waitForFunction(
      () => !!(window as any).ScrollTrigger,
      { timeout: 10000 }
    ).catch(() => {
      // If ScrollTrigger still not exposed, wait a bit more for module loading
      return this.page.waitForTimeout(500);
    });

    // Now wait for ScrollTrigger triggers to be created
    await this.page.waitForFunction(
      () => {
        return (
          (window as any).ScrollTrigger &&
          (window as any).ScrollTrigger.getAll().length > 0
        );
      },
      { timeout: 10000 }
    );
    console.log('[TEST] ScrollTrigger initialized');
  }

  /**
   * Wait for all ScrollTriggers to refresh
   * Use after DOM changes or window resize
   */
  async waitForScrollTriggerRefresh() {
    await this.page.evaluate(() => {
      return new Promise((resolve) => {
        (window as any).ScrollTrigger.refresh();
        setTimeout(resolve, 100);
      });
    });
  }

  /**
   * Get detailed ScrollTrigger debug information
   * Useful for debugging trigger timing issues
   */
  async getScrollTriggerInfo() {
    return await this.page.evaluate(() => {
      const triggers = (window as any).ScrollTrigger.getAll();
      return triggers.map((t: any) => ({
        trigger: t.trigger?.className || 'unknown',
        start: t.start,
        end: t.end,
        isActive: t.isActive,
        progress: t.progress,
        direction: t.direction,
      }));
    });
  }

  /**
   * Get current transform and opacity values for an element
   * Returns: { transform, opacity, translateX, translateY, scale }
   */
  async getTransform(selector: string) {
    return await this.page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;

      const style = window.getComputedStyle(el);
      const matrix = style.transform;

      // Parse matrix values
      let translateX = '0';
      let translateY = '0';
      let scale = '1';

      if (matrix && matrix !== 'none') {
        const matches = matrix.match(/matrix.*\((.+)\)/);
        if (matches) {
          const values = matches[1].split(', ');
          translateX = values[4] || '0';
          translateY = values[5] || '0';
          scale = values[0] || '1';
        }
      }

      return {
        transform: style.transform,
        opacity: style.opacity,
        translateX,
        translateY,
        scale,
      };
    }, selector);
  }

  /**
   * Check if element has a data attribute (used for animation state tracking)
   */
  async hasDataAttribute(selector: string, attribute: string): Promise<boolean> {
    return await this.page.evaluate(
      ({ sel, attr }) => {
        const el = document.querySelector(sel);
        return el ? el.hasAttribute(attr) : false;
      },
      { sel: selector, attr: attribute }
    );
  }

  /**
   * Get data attribute value
   */
  async getDataAttribute(selector: string, attribute: string): Promise<string | null> {
    return await this.page.evaluate(
      ({ sel, attr }) => {
        const el = document.querySelector(sel);
        return el ? el.getAttribute(attr) : null;
      },
      { sel: selector, attr: attribute }
    );
  }

  /**
   * Capture console logs containing animation markers (✨ 📍 📌)
   * Useful for verifying animation initialization and trigger events
   */
  captureAnimationLogs(): string[] {
    const logs: string[] = [];
    this.page.on('console', (msg) => {
      const text = msg.text();
      if (
        text.includes('✨') ||
        text.includes('📍') ||
        text.includes('📌') ||
        text.includes('[TEST]') ||
        text.includes('[DEBUG]')
      ) {
        logs.push(text);
      }
    });
    return logs;
  }

  /**
   * Wait for specific CSS property to reach expected value
   * Useful for waiting for animations to complete
   */
  async waitForCSSProperty(
    selector: string,
    property: string,
    expectedValue: string | number,
    timeout = 5000
  ) {
    await this.page.waitForFunction(
      ({ sel, prop, expected }) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.getPropertyValue(prop) === String(expected);
      },
      { sel: selector, prop: property, expected: expectedValue },
      { timeout }
    );
  }

  /**
   * Check if element is visible in viewport
   */
  async isInViewport(selector: string): Promise<boolean> {
    return await this.page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;

      const rect = el.getBoundingClientRect();
      const viewport = {
        top: 0,
        left: 0,
        bottom: window.innerHeight,
        right: window.innerWidth,
      };

      return (
        rect.top >= viewport.top &&
        rect.left >= viewport.left &&
        rect.bottom <= viewport.bottom &&
        rect.right <= viewport.right
      );
    }, selector);
  }

  /**
   * Get computed style property value
   */
  async getComputedStyle(selector: string, property: string): Promise<string | null> {
    return await this.page.evaluate(
      ({ sel, prop }) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        return window.getComputedStyle(el).getPropertyValue(prop);
      },
      { sel: selector, prop: property }
    );
  }

  /**
   * Count child elements (useful for checking text splitting)
   */
  async countChildElements(selector: string, childSelector = '*'): Promise<number> {
    return await this.page.evaluate(
      ({ sel, child }) => {
        const el = document.querySelector(sel);
        if (!el) return 0;
        return el.querySelectorAll(child).length;
      },
      { sel: selector, child: childSelector }
    );
  }

  /**
   * Check if text was split into spans (for Anime.js character animation)
   */
  async isTextSplit(selector: string): Promise<boolean> {
    return await this.page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      return el.children.length > 0 && el.querySelector('span') !== null;
    }, selector);
  }

  /**
   * Get bounding box for element
   */
  async getBoundingBox(selector: string) {
    const element = await this.page.locator(selector);
    return await element.boundingBox();
  }

  /**
   * Wait for animation to settle (no changes for specified duration)
   */
  async waitForAnimationSettle(selector: string, settleTime = 500) {
    let lastTransform = '';
    let stableCount = 0;
    const requiredStableFrames = settleTime / 50; // Check every 50ms

    while (stableCount < requiredStableFrames) {
      const transform = await this.getTransform(selector);
      const currentTransform = JSON.stringify(transform);

      if (currentTransform === lastTransform) {
        stableCount++;
      } else {
        stableCount = 0;
      }

      lastTransform = currentTransform;
      await this.page.waitForTimeout(50);
    }
  }

  /**
   * Debug: Take screenshot with timestamp for debugging
   */
  async debugScreenshot(name: string) {
    const timestamp = new Date().getTime();
    await this.page.screenshot({
      path: `test-results/debug-${name}-${timestamp}.png`,
      fullPage: false,
    });
    console.log(`[DEBUG] Screenshot saved: debug-${name}-${timestamp}.png`);
  }

  /**
   * Verify ScrollTrigger markers are visible (for debug mode)
   */
  async hasScrollTriggerMarkers(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const markers = document.querySelectorAll('.gsap-marker-scroller-start, .gsap-marker-scroller-end');
      return markers.length > 0;
    });
  }
}
