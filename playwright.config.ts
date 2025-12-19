import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for GSAP + Anime.js Animation Testing
 *
 * Focus: Performance optimization by mocking heavy assets (Spline 3D, videos)
 * Tests: Scroll animations, pinning, text reveals, accessibility
 */
export default defineConfig({
  testDir: './tests',

  // Parallel execution for faster test runs
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,

  // Retries for flaky animation timing tests
  retries: process.env.CI ? 2 : 1,

  // Timeout for animation completion (30s for complex sequences)
  timeout: 30000,
  expect: {
    timeout: 10000,
  },

  // Reporters
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],

  use: {
    // Base URL for tests
    baseURL: 'http://localhost:3000',

    // Trace for debugging failures
    trace: 'on-first-retry',

    // Screenshots on failure
    screenshot: 'only-on-failure',

    // Video on failure (for debugging animation issues)
    video: 'retain-on-failure',

    // Default viewport
    viewport: { width: 1280, height: 720 },

    // Action timeout
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,
  },

  // Test projects for different devices and scenarios
  projects: [
    // Desktop browsers
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Desktop Safari',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 13'],
      },
    },

    // Accessibility: Reduced motion testing
    // Note: reducedMotion is set via context options in tests, not in config
    {
      name: 'Desktop Reduced Motion',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Mobile Reduced Motion',
      use: {
        ...devices['iPhone 13'],
      },
    },

    // Debug mode with GSAP ScrollTrigger markers enabled
    {
      name: 'Debug with GSAP Markers',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          slowMo: 500, // Slow down actions for visual inspection
        },
      },
    },
  ],

  // Local dev server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
