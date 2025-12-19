import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for Animation System
 *
 * Tests capture screenshots at key scroll positions to verify:
 * - Hero Matrix animation completes
 * - About section tiles fade in correctly
 * - Project cards slide in with proper positioning
 * - Project text (title, description, tags) appears after animations
 * - Contact section stagger animations work
 * - Mobile viewport animations behave correctly
 */

const BASE_URL = 'http://localhost:3001';
const ANIMATION_SETTLE_TIME = 1000; // Wait for animations to complete
const SCROLL_SMOOTH_TIME = 500; // Wait after scroll for smooth positioning

test.describe('Desktop Animation Snapshots', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('Hero section - Initial load', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Wait for Matrix animation to complete (2.5s duration)
    await page.waitForTimeout(3000);

    await expect(page).toHaveScreenshot('01-hero-initial.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('About section - Tile fade-in', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Scroll to about section
    await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'smooth' }));
    await page.waitForTimeout(SCROLL_SMOOTH_TIME);
    await page.waitForTimeout(ANIMATION_SETTLE_TIME);

    // Verify about section tiles are visible
    const aboutTile = page.locator('#about');
    await expect(aboutTile).toBeVisible();

    await expect(page).toHaveScreenshot('02-about-tiles.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('First project - Slide-in (before text)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Scroll to first project
    await page.evaluate(() => window.scrollTo({ top: 1600, behavior: 'smooth' }));
    await page.waitForTimeout(SCROLL_SMOOTH_TIME);

    // Wait for slide-in animation (0.9s)
    await page.waitForTimeout(1000);

    const firstProject = page.locator('.project-item[data-project="0"]');
    await expect(firstProject).toBeVisible();

    await expect(page).toHaveScreenshot('03-project-01-slide-in.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('First project - Text reveal (after text)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Scroll to first project
    await page.evaluate(() => window.scrollTo({ top: 1600, behavior: 'smooth' }));
    await page.waitForTimeout(SCROLL_SMOOTH_TIME);

    // Wait for slide-in + text reveal animations (0.9s + 0.6s + 0.4s)
    await page.waitForTimeout(2500);

    const firstProject = page.locator('.project-item[data-project="0"]');
    const projectTitle = firstProject.locator('.project-title');
    const projectDescription = firstProject.locator('.project-description');
    const projectTags = firstProject.locator('.tag');

    // Verify text elements are visible
    await expect(projectTitle).toBeVisible();
    await expect(projectDescription).toBeVisible();
    await expect(projectTags.first()).toBeVisible();

    // Verify text content exists (not empty)
    await expect(projectTitle).not.toBeEmpty();
    await expect(projectDescription).not.toBeEmpty();

    await expect(page).toHaveScreenshot('04-project-01-text-revealed.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('Second project - Complete', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Scroll to second project
    await page.evaluate(() => window.scrollTo({ top: 3200, behavior: 'smooth' }));
    await page.waitForTimeout(SCROLL_SMOOTH_TIME);
    await page.waitForTimeout(ANIMATION_SETTLE_TIME + 1500);

    const secondProject = page.locator('.project-item[data-project="1"]');
    const projectTitle = secondProject.locator('.project-title');

    await expect(secondProject).toBeVisible();
    await expect(projectTitle).toBeVisible();
    await expect(projectTitle).not.toBeEmpty();

    await expect(page).toHaveScreenshot('05-project-02-complete.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('Third project - Complete', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Scroll to third project
    await page.evaluate(() => window.scrollTo({ top: 4800, behavior: 'smooth' }));
    await page.waitForTimeout(SCROLL_SMOOTH_TIME);
    await page.waitForTimeout(ANIMATION_SETTLE_TIME + 1500);

    const thirdProject = page.locator('.project-item[data-project="2"]');
    const projectTitle = thirdProject.locator('.project-title');

    await expect(thirdProject).toBeVisible();
    await expect(projectTitle).toBeVisible();
    await expect(projectTitle).not.toBeEmpty();

    await expect(page).toHaveScreenshot('06-project-03-complete.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('Contact section - Stagger animation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Scroll to contact section
    await page.evaluate(() => window.scrollTo({ top: 6000, behavior: 'smooth' }));
    await page.waitForTimeout(SCROLL_SMOOTH_TIME);
    await page.waitForTimeout(ANIMATION_SETTLE_TIME);

    const contactSection = page.locator('#contact');
    const contactLinks = page.locator('.contact-link');

    await expect(contactSection).toBeVisible();
    await expect(contactLinks.first()).toBeVisible();

    await expect(page).toHaveScreenshot('07-contact-stagger.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('Full page scroll - Complete flow', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Wait for initial animations
    await page.waitForTimeout(3000);

    // Slow scroll through entire page
    await page.evaluate(async () => {
      const scrollHeight = document.body.scrollHeight;
      const scrollStep = 100;
      const scrollDelay = 50;

      for (let i = 0; i < scrollHeight; i += scrollStep) {
        window.scrollTo(0, i);
        await new Promise(resolve => setTimeout(resolve, scrollDelay));
      }
    });

    await page.waitForTimeout(ANIMATION_SETTLE_TIME);

    await expect(page).toHaveScreenshot('08-full-page-complete.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});

test.describe('Mobile Animation Snapshots', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('Mobile - Hero section', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Wait for Matrix animation
    await page.waitForTimeout(3000);

    await expect(page).toHaveScreenshot('mobile-01-hero.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('Mobile - About section', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }));
    await page.waitForTimeout(SCROLL_SMOOTH_TIME);
    await page.waitForTimeout(ANIMATION_SETTLE_TIME);

    await expect(page).toHaveScreenshot('mobile-02-about.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('Mobile - First project with text', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Mobile projects are further down
    await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'smooth' }));
    await page.waitForTimeout(SCROLL_SMOOTH_TIME);
    await page.waitForTimeout(2500); // Wait for text animations

    const firstProject = page.locator('.project-item[data-project="0"]');
    const projectTitle = firstProject.locator('.project-title');

    await expect(firstProject).toBeVisible();
    await expect(projectTitle).toBeVisible();
    await expect(projectTitle).not.toBeEmpty();

    await expect(page).toHaveScreenshot('mobile-03-project-01.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('Mobile - Contact section', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(SCROLL_SMOOTH_TIME);
    await page.waitForTimeout(ANIMATION_SETTLE_TIME);

    const contactSection = page.locator('#contact');
    await expect(contactSection).toBeVisible();

    await expect(page).toHaveScreenshot('mobile-04-contact.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });
});

test.describe('Regression Tests - Critical Bugs', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('Verify project text appears (Bug Fix 1.1)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Scroll to first project
    await page.evaluate(() => window.scrollTo({ top: 1600, behavior: 'smooth' }));
    await page.waitForTimeout(SCROLL_SMOOTH_TIME + 2500);

    const firstProject = page.locator('.project-item[data-project="0"]');
    const projectTitle = firstProject.locator('.project-title');
    const projectDescription = firstProject.locator('.project-description');

    // Critical: Verify text exists and is not empty
    const titleText = await projectTitle.textContent();
    const descText = await projectDescription.textContent();

    expect(titleText).toBeTruthy();
    expect(titleText?.trim().length).toBeGreaterThan(0);
    expect(descText).toBeTruthy();
    expect(descText?.trim().length).toBeGreaterThan(0);

    console.log('✅ Project text appears correctly');
    console.log(`Title: "${titleText?.substring(0, 50)}..."`);
    console.log(`Description: "${descText?.substring(0, 50)}..."`);
  });

  test('Verify text animates only once (Bug Fix 1.1)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Scroll to project
    await page.evaluate(() => window.scrollTo({ top: 1600, behavior: 'smooth' }));
    await page.waitForTimeout(3000);

    const firstProject = page.locator('.project-item[data-project="0"]');
    const dataAttribute = await firstProject.getAttribute('data-text-revealed');

    // Should have data-text-revealed="true"
    expect(dataAttribute).toBe('true');

    // Scroll back up
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1000);

    // Scroll back down
    await page.evaluate(() => window.scrollTo({ top: 1600, behavior: 'smooth' }));
    await page.waitForTimeout(1000);

    // Attribute should still be present (prevents re-animation)
    const dataAttributeAfter = await firstProject.getAttribute('data-text-revealed');
    expect(dataAttributeAfter).toBe('true');

    console.log('✅ Text animation only triggers once');
  });

  test('Verify no console errors from ScrollTrigger (Bug Fix 1.2)', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Scroll through entire page
    await page.evaluate(async () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      await new Promise(resolve => setTimeout(resolve, 3000));
    });

    // Filter out expected errors (if any)
    const scrollTriggerErrors = consoleErrors.filter(err =>
      err.toLowerCase().includes('scrolltrigger') ||
      err.toLowerCase().includes('gsap')
    );

    expect(scrollTriggerErrors).toHaveLength(0);
    console.log('✅ No ScrollTrigger errors detected');
  });
});
