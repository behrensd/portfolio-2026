import { Page } from '@playwright/test';

/**
 * Scroll Testing Helper Class
 *
 * Provides utilities for realistic scroll simulation and viewport manipulation
 * Critical for testing GSAP ScrollTrigger animations
 */
export class ScrollHelper {
  constructor(private page: Page) {}

  /**
   * Scroll to specific Y position
   * @param y - Target scroll position
   * @param smooth - Use smooth scrolling (respects animation timing)
   */
  async scrollToPosition(y: number, smooth = true) {
    if (smooth) {
      await this.page.evaluate((yPos) => {
        window.scrollTo({ top: yPos, behavior: 'smooth' });
      }, y);
      // Wait for smooth scroll to complete (~800ms typical)
      await this.page.waitForTimeout(800);
    } else {
      await this.page.evaluate((yPos) => {
        window.scrollTo({ top: yPos, behavior: 'auto' });
      }, y);
      await this.page.waitForTimeout(100);
    }
  }

  /**
   * Scroll element into view at specified position
   * @param selector - Element to scroll to
   * @param block - Vertical alignment ('start', 'center', 'end')
   */
  async scrollIntoView(selector: string, block: ScrollLogicalPosition = 'start') {
    await this.page.evaluate(
      ({ sel, blockPos }) => {
        const el = document.querySelector(sel);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: blockPos });
        }
      },
      { sel: selector, blockPos: block }
    );
    await this.page.waitForTimeout(800);
  }

  /**
   * Get current scroll position
   */
  async getScrollPosition(): Promise<number> {
    return await this.page.evaluate(() => window.scrollY);
  }

  /**
   * Scroll to trigger a specific ScrollTrigger
   * Calculates the exact position to trigger the element
   *
   * @param triggerSelector - Element that has ScrollTrigger
   * @param triggerPoint - Where to position element ('start' = 90%, 'center' = 50%, 'end' = 10%)
   */
  async scrollToTrigger(
    triggerSelector: string,
    triggerPoint: 'start' | 'center' | 'end' = 'start'
  ) {
    const triggerTop = await this.page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return 0;
      return el.getBoundingClientRect().top + window.scrollY;
    }, triggerSelector);

    const viewportHeight = await this.page.evaluate(() => window.innerHeight);

    let scrollTarget = triggerTop;

    // Calculate scroll position based on trigger point
    if (triggerPoint === 'start') {
      // Trigger at 90% viewport (10% from bottom)
      scrollTarget = triggerTop - viewportHeight * 0.9;
    } else if (triggerPoint === 'center') {
      // Trigger at 50% viewport (centered)
      scrollTarget = triggerTop - viewportHeight * 0.5;
    } else if (triggerPoint === 'end') {
      // Trigger at 10% viewport (90% from bottom)
      scrollTarget = triggerTop - viewportHeight * 0.1;
    }

    // Ensure we don't scroll past document bounds
    scrollTarget = Math.max(0, scrollTarget);

    await this.scrollToPosition(scrollTarget);
  }

  /**
   * Simulate realistic user scroll with incremental steps
   * More realistic than instant scrolling for animation testing
   *
   * @param targetY - Target scroll position
   * @param steps - Number of scroll increments (more = smoother)
   * @param stepDelay - Delay between steps in ms
   */
  async scrollWithSteps(targetY: number, steps = 10, stepDelay = 50) {
    const currentY = await this.getScrollPosition();
    const stepSize = (targetY - currentY) / steps;

    for (let i = 1; i <= steps; i++) {
      const newY = currentY + stepSize * i;
      await this.page.evaluate((y) => window.scrollTo(0, y), newY);
      await this.page.waitForTimeout(stepDelay);
    }
  }

  /**
   * Scroll to bottom of page
   */
  async scrollToBottom() {
    const maxScroll = await this.page.evaluate(() => {
      return document.documentElement.scrollHeight - window.innerHeight;
    });
    await this.scrollToPosition(maxScroll);
  }

  /**
   * Scroll to top of page
   */
  async scrollToTop() {
    await this.scrollToPosition(0);
  }

  /**
   * Get viewport dimensions
   */
  async getViewportSize() {
    return await this.page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));
  }

  /**
   * Get document scroll height
   */
  async getScrollHeight(): Promise<number> {
    return await this.page.evaluate(() => document.documentElement.scrollHeight);
  }

  /**
   * Check if scrolled to bottom
   */
  async isAtBottom(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      return scrollTop + clientHeight >= scrollHeight - 10; // 10px tolerance
    });
  }

  /**
   * Check if scrolled to top
   */
  async isAtTop(): Promise<boolean> {
    const scrollY = await this.getScrollPosition();
    return scrollY < 10; // 10px tolerance
  }

  /**
   * Scroll until element is in viewport
   * Useful for finding elements that are off-screen
   */
  async scrollUntilVisible(selector: string, maxScrolls = 10) {
    for (let i = 0; i < maxScrolls; i++) {
      const isVisible = await this.page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;

        const rect = el.getBoundingClientRect();
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth
        );
      }, selector);

      if (isVisible) {
        return true;
      }

      // Scroll down by viewport height
      const currentY = await this.getScrollPosition();
      const viewportHeight = await this.page.evaluate(() => window.innerHeight);
      await this.scrollToPosition(currentY + viewportHeight);
    }

    return false; // Not found after max scrolls
  }

  /**
   * Get scroll progress (0 to 1)
   */
  async getScrollProgress(): Promise<number> {
    return await this.page.evaluate(() => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      return scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    });
  }

  /**
   * Simulate mouse wheel scroll
   * More realistic than programmatic scrolling for some tests
   */
  async mouseWheelScroll(deltaY: number) {
    await this.page.mouse.wheel(0, deltaY);
    await this.page.waitForTimeout(100);
  }

  /**
   * Scroll to specific section by ID
   * Useful for navigation testing
   */
  async scrollToSection(sectionId: string) {
    await this.page.evaluate((id) => {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }, sectionId);
    await this.page.waitForTimeout(800);
  }

  /**
   * Get distance element is from viewport top
   */
  async getDistanceFromViewportTop(selector: string): Promise<number> {
    return await this.page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return -1;
      return el.getBoundingClientRect().top;
    }, selector);
  }

  /**
   * Verify element is at specific viewport position
   * @param selector - Element selector
   * @param expectedPosition - Expected distance from top (in pixels or percentage)
   * @param tolerance - Allowed difference in pixels
   */
  async isAtViewportPosition(
    selector: string,
    expectedPosition: number | string,
    tolerance = 50
  ): Promise<boolean> {
    const distance = await this.getDistanceFromViewportTop(selector);

    let expected: number;
    if (typeof expectedPosition === 'string' && expectedPosition.endsWith('%')) {
      const viewportHeight = await this.page.evaluate(() => window.innerHeight);
      const percentage = parseFloat(expectedPosition) / 100;
      expected = viewportHeight * percentage;
    } else {
      expected = typeof expectedPosition === 'number' ? expectedPosition : parseInt(expectedPosition);
    }

    return Math.abs(distance - expected) <= tolerance;
  }
}
