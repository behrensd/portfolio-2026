# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3001
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint

# Port Management (if port 3001 is in use)
lsof -ti:3001 | xargs kill -9

# Clear Next.js cache (if build issues occur)
rm -rf .next
```

## Architecture Overview

This is a **Next.js 15 App Router** portfolio website featuring advanced GSAP and Anime.js animations. The project was migrated from a vanilla HTML/CSS/JS stack to Next.js while maintaining 100% feature parity.

### Core Design Patterns

1. **Animation Hooks Pattern**: All animations are encapsulated in custom hooks for isolation, automatic cleanup, and reusability. Each hook manages its own GSAP ScrollTriggers and tweens, storing them in refs for proper cleanup on unmount.

2. **Client-Side Only Components**: All interactive components use `'use client'` directive since animations require browser APIs. The main page (`app/page.tsx`) orchestrates all animation hooks.

3. **Mobile-First Responsive Detection**: The app uses sophisticated device detection (not just screen size) to switch between Spline 3D backgrounds (desktop) and frame sequence animations (mobile). This detection happens once on mount and doesn't switch on orientation changes to prevent component thrashing.

4. **Custom Typography System**: Uses VHS Gothic, a single-weight pixel font. Typography hierarchy is achieved through SIZE, LETTER-SPACING, COLOR, and TEXT-TRANSFORM rather than font weights. Font rendering is optimized with `-webkit-font-smoothing: none` for pixel-perfect rendering.

### Key Technical Decisions

- **Native Scroll**: No smooth scroll libraries (Lenis, etc.). Uses native browser scrolling for maximum compatibility, especially on mobile Safari.
- **GSAP ScrollTrigger**: All scroll animations use GSAP ScrollTrigger with proper cleanup. ScrollTriggers are stored in refs and killed on unmount to prevent memory leaks.
- **Anime.js for Micro-interactions**: Used for magnetic dock hover, tag interactions, and other small UI flourishes. Anime.js v4.2.2 imported directly from npm package using ES modules (`import { animate, stagger } from 'animejs'`).
- **Spline 3D Integration**: Desktop background uses Spline 3D scenes with dynamic import (no SSR) for better performance. Mobile uses frame sequence fallback.
- **Vercel Blob Storage**: Images and videos are hosted on Vercel Blob storage (referenced via environment variables).

## File Structure

```
app/
├── components/
│   ├── Hero.tsx              # Hero with Spline/frame sequence background
│   ├── SplineBackground.tsx  # Dynamic Spline loader (desktop)
│   ├── MobileFrameSequence.tsx  # Frame sequence (mobile)
│   ├── About.tsx             # Skills section
│   ├── Projects.tsx          # Project showcase
│   ├── Contact.tsx           # Contact section
│   └── Navigation.tsx        # Floating dock navigation
├── hooks/
│   ├── useProjectAnimations.ts    # Project scroll reveals
│   ├── useHeroAnimation.ts        # Hero text animations
│   ├── useHeroCanvas.ts           # Canvas particle system (if used)
│   ├── useSplineScroll.ts         # Spline scroll-based animations
│   ├── useDockNavigation.ts       # Navigation scroll behavior
│   ├── useAnimeInteractions.ts    # Anime.js micro-interactions
│   ├── useLogoScrollAnimation.ts  # Logo scroll-to-top animation
│   ├── useSafariScrollFix.ts      # Mobile touch optimization
│   └── useTileAnimations.ts       # Section tile animations
├── fonts/
│   └── vhs-gothic.ttf        # Custom pixel font
├── globals.css               # Global styles and CSS variables
├── layout.tsx                # Root layout with font loading
└── page.tsx                  # Main page (orchestrates all hooks)

scripts/
├── upload-frames.mjs         # Upload frame sequences to Vercel Blob
└── upload-image.mjs          # Upload images to Vercel Blob

public/
├── videos/                   # Video assets
└── pics/                     # Image assets
```

## Animation System

### GSAP ScrollTrigger Pattern

All animation hooks follow this pattern:

```typescript
export function useMyAnimation() {
    const triggersRef = useRef<ScrollTrigger[]>([]);
    const tweensRef = useRef<gsap.core.Tween[]>([]);

    useEffect(() => {
        // Setup animations
        const tween = gsap.to(target, {
            /* animation props */,
            scrollTrigger: {
                trigger: element,
                start: 'top 90%',
                toggleActions: 'play none none none',
                invalidateOnRefresh: true,
            }
        });

        tweensRef.current.push(tween);
        if (tween.scrollTrigger) triggersRef.current.push(tween.scrollTrigger);

        return () => {
            // Kill only our own triggers/tweens
            triggersRef.current.forEach(t => t.kill());
            tweensRef.current.forEach(t => t.kill());
            triggersRef.current = [];
            tweensRef.current = [];
        };
    }, []);
}
```

### Animation Initialization Timing

- Animations initialize after a small delay (100-300ms) to ensure DOM is ready
- Mobile devices get longer delays for smoother initial load
- `ScrollTrigger.refresh(true)` is called after setup to recalculate positions

### Mobile Considerations

- **useSafariScrollFix** must be called FIRST in page.tsx (before other animation hooks)
- Sets `touch-action: pan-y` on body/html for proper touch handling
- normalizeScroll is disabled (caused sticky/non-fluent scrolling)
- Lower particle counts and simplified animations on mobile
- Detect mobile using touch capability + user agent + screen size

## Styling System

### CSS Variables

All styling uses CSS variables defined in `globals.css`:
- Colors: `--color-bg`, `--color-primary`, `--color-text`, etc.
- Typography: `--font-size-*`, `--letter-spacing-*`, `--line-height-*`
- Spacing: `--spacing-*` (responsive with clamp)
- Z-index: `--z-background`, `--z-content`, `--z-dock`

### Typography Hierarchy

With a single-weight pixel font, hierarchy is achieved through:
1. **Size**: `clamp()` functions for fluid typography
2. **Letter-spacing**: Tighter for headlines, wider for body text
3. **Color**: Primary color for emphasis, muted for secondary text
4. **Text-transform**: Uppercase for headers/labels

## Important Notes

### GSAP Usage
- Always register plugins: `gsap.registerPlugin(ScrollTrigger);` wrapped in `typeof window !== 'undefined'` check
- ScrollTrigger start/end points are optimized for mobile and desktop
- Use `invalidateOnRefresh: true` to recalculate on window resize
- Always kill ScrollTriggers and tweens on cleanup to prevent memory leaks

### Spline 3D Backgrounds
- Dynamically imported with `ssr: false` to prevent server-side rendering issues
- Spline app exposed via callback: `onSplineLoad={(app) => setSplineApp(app)}`
- Mobile detection should happen once on mount, not on every resize
- Zoom can be adjusted: `splineApp.setZoom(0.6)` for mobile views

### Mobile Frame Sequences
- Used as fallback when Spline is too heavy for mobile devices
- Frames are stored on Vercel Blob storage
- Upload frames using `scripts/upload-frames.mjs`

### Environment Variables
- `.env.local` contains Vercel Blob storage credentials
- Never commit `.env.local` to git (already in .gitignore)
- Images/videos reference Vercel Blob URLs directly in components

### Performance Optimizations
- Hardware acceleration: `will-change`, `transform3d` on animated elements
- Image optimization: Next.js `<Image>` component with priority loading
- Dynamic imports for heavy components (Spline, Anime.js)
- Responsive particle counts (30 mobile, 50+ desktop)

### Known Quirks
- Logo animation uses fixed positioning in overlay container for smooth scroll-based movement
- Canvas particles use `requestAnimationFrame` for smooth 60fps rendering
- Anime.js v4.2.2 provides native ES module support via npm package (no local file needed)
- Native scroll is used (no Lenis) to avoid Safari mobile issues
- All animations wait 100-300ms after mount to ensure DOM elements exist

## Anime.js Best Practices

### Installation & Import

Anime.js v4.2.2 is already installed in this project:

```typescript
// Correct v4 import syntax
import { animate, stagger } from 'animejs';

// Additional utilities (if needed)
import { createTimeline, utils, createSpring } from 'animejs';
```

**Note:** The project uses the npm package directly. No local `/lib/anime.es.js` file is needed because animejs v4.2.2 provides native ES module support.

### When to Use Anime.js vs GSAP

This project uses a **hybrid animation system**:

**Use GSAP + ScrollTrigger for:**
- Scroll-triggered animations
- Major page transitions and layout animations
- Complex timeline sequences with scrubbing
- Animations that need to sync precisely with scroll position

**Use Anime.js for:**
- Hover effects and mouse interactions
- Click/touch event-driven animations
- Micro-interactions and UI flourishes
- Stagger animations on discrete events
- Animations not tied to scroll position

### Current Implementation Pattern

**Location:** `/Users/dom/Documents/Portfolio2026/app/hooks/useAnimeInteractions.ts`

```typescript
'use client';
import { useEffect } from 'react';
import { animate, stagger } from 'animejs';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useAnimeInteractions() {
    useEffect(() => {
        // 100ms delay ensures DOM is ready
        const timer = setTimeout(() => {
            // Initialize all interactions here
            initDockHover();
            initTagInteractions();
            initContactStagger();
        }, 100);

        return () => {
            clearTimeout(timer);
            // Clean up ScrollTriggers if used
        };
    }, []);
}
```

### Integration with GSAP ScrollTrigger

For scroll-triggered Anime.js animations, use GSAP ScrollTrigger for detection and Anime.js for the animation:

```typescript
let scrollTrigger: ScrollTrigger | null = null;

scrollTrigger = ScrollTrigger.create({
    trigger: '.section',
    start: 'top 90%',
    once: true,
    onEnter: () => {
        animate('.element', {
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 600,
            delay: stagger(150),
            ease: 'out(3)'
        });
    }
});

// Always clean up
return () => {
    if (scrollTrigger) scrollTrigger.kill();
};
```

### Initialization Timing

All Anime.js interactions initialize with a **100ms delay** after mount:

```typescript
useEffect(() => {
    const timer = setTimeout(() => {
        // Initialize animations
    }, 100);

    return () => clearTimeout(timer);
}, []);
```

**Why?**
- Ensures DOM elements are fully mounted
- Prevents querySelector returning null
- Allows Next.js client hydration to complete

### V4 Syntax Reference

Key v4 changes (already implemented correctly in this project):

```typescript
// ✅ Correct v4 syntax (current implementation)
import { animate, stagger } from 'animejs';

animate('.element', {
    translateX: 250,
    opacity: 0.5,
    duration: 600,
    ease: 'outQuad',        // Renamed from 'easing'
    delay: stagger(100)
});

// ❌ Old v3 syntax (don't use)
import anime from 'animejs';
anime({
    targets: '.element',
    translateX: 250,
    easing: 'easeOutQuad'
});
```

### Common Patterns

**Hover Effect:**
```typescript
element.addEventListener('mouseenter', function() {
    animate(this, {
        scale: 1.1,
        duration: 300,
        ease: 'out(3)'
    });
});

element.addEventListener('mouseleave', function() {
    animate(this, {
        scale: 1,
        duration: 400,
        ease: 'out(3)'
    });
});
```

**Stagger Animation:**
```typescript
animate('.item', {
    translateY: [20, 0],
    opacity: [0, 1],
    duration: 500,
    delay: stagger(100, {
        from: 'center'  // Start from center and spread outward
    }),
    ease: 'out(2)'
});
```

**Magnetic Effect:**
```typescript
element.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    animate(this, {
        translateX: x * 0.3,  // 30% of distance
        translateY: y * 0.3,
        duration: 300,
        ease: 'outQuad'
    });
});
```

### Easing Functions

Anime.js v4 uses simplified easing names:

```typescript
ease: 'out(2)'      // Power ease with parameter (default)
ease: 'outQuad'     // Named ease
ease: 'outCubic'
ease: 'outExpo'
ease: 'inOutQuad'
ease: 'inOutElastic'
ease: (t) => t * t  // Custom function
```

### Advanced Features

Anime.js v4 includes powerful new utilities:

**Timer** - Replacement for setTimeout/setInterval:
```typescript
import { createTimer } from 'animejs';
```

**Animatable** - For high-frequency updates (cursor following):
```typescript
import { createAnimatable } from 'animejs';
```

**Draggable** - Drag interactions with physics:
```typescript
import { createDraggable } from 'animejs';
```

**Scroll** - Native scroll synchronization (alternative to GSAP ScrollTrigger):
```typescript
import { createScroll } from 'animejs';
```

### Reference Documentation

For comprehensive Anime.js documentation, see:
- **Project Reference:** `/Users/dom/Documents/Portfolio2026/ANIMEJS_REFERENCE.md`
- **Official Docs:** [animejs.com/documentation](https://animejs.com/documentation/)
- **V4 Migration:** [github.com/juliangarnier/anime/wiki/Migrating-from-v3-to-v4](https://github.com/juliangarnier/anime/wiki/Migrating-from-v3-to-v4)

## Troubleshooting

### Animations Not Working
1. Check browser console for GSAP errors
2. Verify DOM elements exist before animation init (check selectors)
3. Ensure `'use client'` directive is present in component
4. Check that useSafariScrollFix is called first in page.tsx

### Build Errors
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies if needed
3. Check for TypeScript errors with proper types from @types packages

### Mobile Scroll Issues
- Verify `touch-action: pan-y` is set on body/html
- Don't use `normalizeScroll()` (causes sticky behavior)
- Ensure ScrollTrigger animations have mobile-optimized start/end points
- Check that mobile detection logic in Hero component is working correctly

### Spline Loading Issues
- Check network tab to ensure scene URL is accessible
- Verify Spline is not being SSR'd (should have `ssr: false`)
- Try clearing browser cache if scene appears corrupted
- Mobile should fallback to MobileFrameSequence automatically
- memorize that we made significant progress witht his last chaneg and should go forward from here