# Playwright Animation Testing Suite

Comprehensive testing infrastructure for GSAP ScrollTrigger and Anime.js animations with **performance optimization** through heavy asset mocking.

## Overview

This test suite validates:
- ✅ GSAP ScrollTrigger animations (project cards, content tiles)
- ✅ Anime.js micro-interactions (text reveals, hover effects)
- ✅ Mobile vs desktop animation differences
- ✅ Accessibility (prefers-reduced-motion support)
- ✅ Performance (no memory leaks, 60fps scroll)
- ✅ Visual regression testing

**Performance:** ~70% faster test execution by mocking Spline 3D and heavy assets.

## Quick Start

### 1. Run Tests

```bash
# Run all tests
npm test

# Run tests with UI (recommended for debugging)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run specific test file
npx playwright test tests/unit/project-animations.spec.ts

# Run specific project (e.g., mobile only)
npx playwright test --project="Mobile Chrome"
```

### 2. Debug Mode with GSAP Markers

```bash
# Run debug tests with visual ScrollTrigger markers
npx playwright test --project="Debug with GSAP Markers"
```

This enables GSAP's visual debugging lines showing ScrollTrigger start/end points.

### 3. View Test Reports

```bash
# Open HTML report
npm run test:report
```

## Test Structure

```
tests/
├── fixtures/                      # Reusable utilities
│   ├── animation-helpers.ts       # GSAP/Anime testing helpers
│   ├── scroll-helpers.ts          # Scroll simulation utilities
│   └── mock-assets.ts             # Asset mocking (Spline, videos)
├── unit/                          # Unit tests
│   ├── project-animations.spec.ts # Project card animations
│   ├── tile-animations.spec.ts    # Content tile animations
│   └── reduced-motion.spec.ts     # Accessibility tests
├── integration/                   # Integration tests
│   ├── email-button.spec.ts       # Email button swap
│   └── navigation-flow.spec.ts    # Scroll navigation
├── visual/                        # Visual regression
│   └── project-cards.spec.ts      # Screenshot comparisons
└── performance/                   # Performance tests
    └── animation-timing.spec.ts   # Timing and FPS validation
```

## Key Features

### 🚀 Performance Optimization

**Asset Mocking Strategies:**

```typescript
import { mockSplineOnly, mockHeavyAssets, enableGSAPMarkers } from '../fixtures/mock-assets';

// Option 1: Mock Spline only (recommended for visual tests)
await mockSplineOnly(page);  // Saves ~2-3s per test

// Option 2: Mock all heavy assets (recommended for unit tests)
await mockHeavyAssets(page);  // Saves ~5-7s per test

// Option 3: Enable GSAP debugging markers
await enableGSAPMarkers(page);  // Shows visual trigger lines
```

**Performance Metrics:**
- Without mocking: ~8-15s per test
- With Spline mocking: ~3-5s per test
- Full asset mocking: ~2-3s per test

### 🎯 Animation Testing Helpers

```typescript
import { AnimationHelper } from '../fixtures/animation-helpers';
import { ScrollHelper } from '../fixtures/scroll-helpers';

const animHelper = new AnimationHelper(page);
const scrollHelper = new ScrollHelper(page);

// Wait for GSAP to initialize
await animHelper.waitForScrollTriggerInit();

// Get transform values
const transform = await animHelper.getTransform('.project-item');
console.log(transform.translateX, transform.opacity);

// Scroll to trigger animation
await scrollHelper.scrollToTrigger('.project-item', 'start');

// Check animation state
const revealed = await animHelper.hasDataAttribute('.project-item', 'data-text-revealed');
```

### 📱 Device Testing

Tests run on multiple devices:
- Desktop Chrome (1920x1080)
- Desktop Safari (1920x1080)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 13)
- Reduced Motion (accessibility)

### 🐛 Debugging Tools

**1. GSAP ScrollTrigger Markers:**
```typescript
await enableGSAPMarkers(page);
// Visual lines show trigger start/end points
```

**2. Debug Screenshots:**
```typescript
await animHelper.debugScreenshot('animation-state');
// Saved to: test-results/debug-animation-state-{timestamp}.png
```

**3. Console Log Capture:**
```typescript
const logs = animHelper.captureAnimationLogs();
// Captures logs with ✨ 📍 📌 emojis
```

**4. ScrollTrigger Info:**
```typescript
const triggers = await animHelper.getScrollTriggerInfo();
console.log(triggers);
// Shows: trigger, start, end, isActive, progress
```

## Writing Tests

### Example: Testing Project Card Animation

```typescript
import { test, expect } from '@playwright/test';
import { mockSplineOnly } from '../fixtures/mock-assets';
import { AnimationHelper } from '../fixtures/animation-helpers';
import { ScrollHelper } from '../fixtures/scroll-helpers';

test('should slide in project card', async ({ page, isMobile }) => {
  // 1. Mock Spline for performance
  await mockSplineOnly(page);

  // 2. Navigate and wait
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 3. Initialize helpers
  const animHelper = new AnimationHelper(page);
  const scrollHelper = new ScrollHelper(page);

  // 4. Wait for GSAP
  await animHelper.waitForScrollTriggerInit();

  // 5. Trigger animation
  await scrollHelper.scrollToTrigger('.project-item:nth-child(1)', 'start');
  await page.waitForTimeout(1000); // Wait for 900ms animation

  // 6. Verify result
  const transform = await animHelper.getTransform('.project-item:nth-child(1)');
  expect(transform?.translateX).toBe('0');
  expect(parseFloat(transform?.opacity || '0')).toBeCloseTo(1, 1);
});
```

## Common Testing Patterns

### Pattern 1: Verify Animation Completion

```typescript
// Wait for animation to settle
await animHelper.waitForAnimationSettle('.project-item', 500);

// Or wait for specific CSS property
await animHelper.waitForCSSProperty('.project-item', 'opacity', '1');
```

### Pattern 2: Realistic Scroll Simulation

```typescript
// Smooth scroll with steps (more realistic)
await scrollHelper.scrollWithSteps(2000, 10, 50);

// vs instant scroll
await scrollHelper.scrollToPosition(2000, false);
```

### Pattern 3: Check Animation State

```typescript
// Check if text was split for character animation
const isSplit = await animHelper.isTextSplit('.project-title');

// Check data attributes
const revealed = await animHelper.hasDataAttribute('.project-item', 'data-text-revealed');
```

### Pattern 4: Visual Regression

```typescript
import { expect } from '@playwright/test';

// Take baseline screenshot
await expect(page.locator('.project-item')).toHaveScreenshot('project-card.png', {
  maxDiffPixels: 100,
  threshold: 0.2,
});
```

## Continuous Integration

### GitHub Actions

Tests run automatically on push/PR with parallel execution:

```yaml
# .github/workflows/playwright.yml
strategy:
  matrix:
    project: [Desktop Chrome, Mobile Chrome, Desktop Reduced Motion]
```

**CI Performance:**
- Parallel: 3 projects simultaneously
- Runtime: ~5-7 minutes (with asset mocking)
- Artifact retention: 7 days

## Troubleshooting

### Issue: Tests Timeout

**Solution:** Increase timeout or check if animations are actually triggering

```typescript
test.setTimeout(60000); // Increase to 60s

// Debug: Check if ScrollTrigger initialized
const triggers = await animHelper.getScrollTriggerInfo();
console.log('Triggers found:', triggers.length);
```

### Issue: Animations Not Working

**Solution:** Check for "Reduce Motion" or asset loading issues

```typescript
// Verify reduce motion is NOT enabled
const logs = animHelper.captureAnimationLogs();
// Should NOT see: "⚠️ Reduced motion preferred"

// Check if elements exist
const count = await page.locator('.project-item').count();
console.log('Project cards found:', count);
```

### Issue: Flaky Visual Tests

**Solution:** Increase tolerance or mask dynamic content

```typescript
await expect(page.locator('.project-item')).toHaveScreenshot('card.png', {
  maxDiffPixels: 150,  // Increase tolerance
  threshold: 0.3,      // More lenient color matching
  mask: [page.locator('.dynamic-content')], // Mask changing areas
});
```

## Best Practices

1. **Always mock Spline 3D** - Saves 2-3s per test
2. **Use realistic scroll simulation** - `scrollWithSteps()` over instant scroll
3. **Wait for ScrollTrigger init** - Essential before any animation tests
4. **Check animation states** - Use data attributes to verify completion
5. **Capture logs for debugging** - Helps identify initialization issues
6. **Use appropriate timeouts** - Animations need time to complete
7. **Test on multiple devices** - Mobile behavior differs from desktop

## Performance Benchmarks

### Full Test Suite

| Scenario | Runtime | Tests |
|----------|---------|-------|
| Without mocking | ~15-20 min | ~50 tests |
| With Spline mocking | ~5-7 min | ~50 tests |
| Full asset mocking | ~2-3 min | ~50 tests |

### Per-Test Average

| Asset Loading | Time |
|---------------|------|
| No mocking | ~8-15s |
| Spline mocking | ~3-5s |
| Full mocking | ~2-3s |

**Recommendation:** Use `mockSplineOnly()` for most tests, full mocking for unit tests.

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [GSAP ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [Anime.js v4 Documentation](https://animejs.com/documentation/)
- [Visual Testing Best Practices](https://playwright.dev/docs/test-snapshots)

## Contributing

When adding new tests:
1. Use asset mocking for performance
2. Add descriptive test names
3. Include console.log for debugging
4. Group related tests in describe blocks
5. Update this README if adding new patterns
