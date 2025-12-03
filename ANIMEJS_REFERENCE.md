# Anime.js v4 Reference Guide

Complete reference guide for working with Anime.js v4.2.2 in this Next.js portfolio project.

## Table of Contents
- [Installation & Setup](#installation--setup)
- [Core Concepts](#core-concepts)
- [Animation Parameters](#animation-parameters)
- [Easing Functions](#easing-functions)
- [Stagger System](#stagger-system)
- [Callbacks](#callbacks)
- [Control Methods](#control-methods)
- [Advanced Features (v4)](#advanced-features-v4)
- [V3 to V4 Migration](#v3-to-v4-migration)
- [Current Implementation Patterns](#current-implementation-patterns)
- [Code Examples](#code-examples)
- [Enhancement Opportunities](#enhancement-opportunities)

---

## Installation & Setup

### Installation Status
✅ **animejs v4.2.2** is installed via npm
✅ **@types/animejs v3.1.13** provides TypeScript support

```bash
# Already installed in this project
npm install animejs
npm install -D @types/animejs
```

### Import Syntax (v4)

```typescript
// Named imports from npm package
import { animate, stagger } from 'animejs';

// Additional utilities (if needed)
import { createTimeline, utils, createSpring } from 'animejs';
```

**Note:** This project correctly uses direct imports from the npm package. The animejs v4.2.2 package provides proper ES module support, so no local `/lib/anime.es.js` file is needed.

---

## Core Concepts

### The `animate()` Function

The primary function for creating animations in v4:

```typescript
animate(targets, parameters);
```

**Signature:**
- **First argument:** Targets (required)
- **Second argument:** Animation parameters object

### Target Types

Anime.js accepts multiple target formats:

```typescript
// CSS Selector
animate('.element', { opacity: 0.5 });

// DOM Element
const el = document.querySelector('.element');
animate(el, { opacity: 0.5 });

// NodeList
const elements = document.querySelectorAll('.element');
animate(elements, { opacity: 0.5 });

// Array of elements
animate([el1, el2, el3], { opacity: 0.5 });

// JavaScript Object
const obj = { value: 0 };
animate(obj, { value: 100 });
```

### Animatable Properties

#### CSS Properties
```typescript
animate('.box', {
  opacity: 0.5,
  backgroundColor: '#ff6b35',
  width: '200px',
  padding: '20px'
});
```

#### CSS Transforms
```typescript
animate('.box', {
  translateX: 250,        // Pixels by default
  translateY: '50%',      // Percentage string
  scale: 1.5,             // Unitless values
  rotate: 180,            // Degrees
  skewX: 15
});
```

#### CSS Variables
```typescript
animate(':root', {
  '--primary-color': '#ff6b35'
});
```

#### SVG Attributes
```typescript
animate('circle', {
  r: 50,
  cx: 100,
  cy: 100,
  fill: '#ff6b35'
});
```

#### JavaScript Object Properties
```typescript
const counter = { count: 0 };
animate(counter, {
  count: 100,
  duration: 1000,
  onUpdate: () => {
    console.log(Math.floor(counter.count));
  }
});
```

---

## Animation Parameters

### Core Parameters

```typescript
animate('.element', {
  // Animation values
  opacity: 0.5,                    // Target value
  translateX: 250,                 // With unit inference

  // Timing
  duration: 1000,                  // Milliseconds (default: 1000)
  delay: 500,                      // Start delay in ms (default: 0)

  // Easing
  ease: 'out(2)',                  // Easing function (default: 'out(2)')

  // Looping
  loop: 3,                         // Number of repetitions (not total iterations!)
  alternate: true,                 // Reverse on alternate loops (default: false)
  reversed: false,                 // Start in reverse (default: false)

  // Playback
  autoplay: true,                  // Auto-start (default: true)

  // Callbacks
  onBegin: () => console.log('Started'),
  onUpdate: () => console.log('Updating'),
  onComplete: () => console.log('Done')
});
```

### Property-Specific Parameters

Use object syntax for per-property overrides:

```typescript
animate('.element', {
  translateX: {
    to: 250,                       // Target value (renamed from 'value' in v3)
    duration: 800,                 // Override duration
    delay: 200,                    // Override delay
    ease: 'outQuad'               // Override easing
  },
  opacity: 0.5,                    // Simple value
  scale: {
    to: 1.5,
    duration: 1200,
    ease: 'outCubic'
  }
});
```

### From/To Values

```typescript
animate('.element', {
  opacity: { from: 0, to: 1 },     // Explicit from/to
  translateX: { from: -100, to: 250 }
});
```

### Relative Values

```typescript
animate('.element', {
  translateX: '+=100',             // Add 100px to current value
  rotate: '-=45',                  // Subtract 45deg
  width: '*=2'                     // Multiply by 2
});
```

---

## Easing Functions

### V4 Easing Syntax

Anime.js v4 uses simplified easing names (removed 'ease' prefix from v3):

#### Power Easing
```typescript
ease: 'in(2)'        // easeIn with power 2 (quad)
ease: 'out(2)'       // easeOut with power 2 (default)
ease: 'inOut(3)'     // easeInOut with power 3 (cubic)
ease: 'outIn(4)'     // easeOutIn with power 4 (quart)
```

#### Named Easing
```typescript
ease: 'linear'
ease: 'inQuad' / 'outQuad' / 'inOutQuad'
ease: 'inCubic' / 'outCubic' / 'inOutCubic'
ease: 'inQuart' / 'outQuart' / 'inOutQuart'
ease: 'inQuint' / 'outQuint' / 'inOutQuint'
ease: 'inExpo' / 'outExpo' / 'inOutExpo'
ease: 'inCirc' / 'outCirc' / 'inOutCirc'
ease: 'inBack' / 'outBack' / 'inOutBack'
ease: 'inElastic' / 'outElastic' / 'inOutElastic'
ease: 'inBounce' / 'outBounce' / 'inOutBounce'
```

#### Custom Easing Function
```typescript
ease: (t) => t * t   // Quadratic ease
ease: (t) => 1 - Math.pow(1 - t, 3)  // Custom cubic
```

#### Cubic Bézier
```typescript
ease: 'cubicBezier(0.42, 0, 0.58, 1)'
```

#### Spring Easing
```typescript
import { createSpring } from 'animejs';

const spring = createSpring({
  mass: 1,
  stiffness: 80,
  damping: 10,
  velocity: 0
});

animate('.element', {
  translateX: 250,
  ease: spring
});
```

---

## Stagger System

The `stagger()` utility creates sequential timing offsets for multiple targets:

### Basic Stagger

```typescript
import { animate, stagger } from 'animejs';

animate('.item', {
  translateY: 20,
  opacity: 1,
  delay: stagger(100)  // 100ms delay between each element
});
```

### Stagger Options

```typescript
delay: stagger(100, {
  start: 500,          // Initial delay before stagger begins
  from: 'center',      // Start point: 'first', 'last', 'center', index number
  reversed: true,      // Reverse the stagger order
  ease: 'outQuad',     // Apply easing to stagger intervals
  grid: [5, 4],        // 2D grid layout [columns, rows]
  axis: 'x'            // Grid axis: 'x' or 'y'
});
```

### Stagger Direction

```typescript
// Start from first element (default)
delay: stagger(100, { from: 'first' })

// Start from last element
delay: stagger(100, { from: 'last' })

// Start from center and spread outward
delay: stagger(100, { from: 'center' })

// Start from specific index
delay: stagger(100, { from: 2 })
```

### Grid Stagger

```typescript
// For elements arranged in a grid
animate('.grid-item', {
  scale: 1,
  opacity: 1,
  delay: stagger(50, {
    grid: [5, 4],    // 5 columns, 4 rows
    from: 'center',
    axis: 'x'        // Stagger along x-axis first
  })
});
```

---

## Callbacks

All callbacks receive the animation instance as an argument:

### Available Callbacks

```typescript
animate('.element', {
  opacity: 0.5,

  // Fires AFTER delay completes (changed from v3!)
  onBegin: (anim) => {
    console.log('Animation started', anim);
  },

  // Fires on every frame during animation
  onUpdate: (anim) => {
    console.log('Progress:', anim.progress);
  },

  // Fires when animation completes
  onComplete: (anim) => {
    console.log('Animation finished', anim);
  },

  // Fires at the start of each loop iteration
  onLoop: (anim) => {
    console.log('Loop iteration:', anim.loop);
  },

  // Fires before each render frame
  onRender: (anim) => {
    console.log('Rendering frame');
  },

  // Fires before onUpdate
  onBeforeUpdate: (anim) => {
    console.log('About to update');
  },

  // Fires when animation is paused
  onPause: (anim) => {
    console.log('Animation paused');
  }
});
```

### Promise Support

Anime.js v4 animations return promises:

```typescript
// Using .then()
animate('.element', { opacity: 0 })
  .then(() => {
    console.log('Animation complete');
    return animate('.element', { opacity: 1 });
  })
  .then(() => {
    console.log('Fade back in complete');
  });

// Using async/await
async function sequence() {
  await animate('.element', { opacity: 0 });
  await animate('.element', { translateX: 100 });
  console.log('Sequence complete');
}
```

---

## Control Methods

Animation instances have methods for playback control:

```typescript
const anim = animate('.element', {
  translateX: 250,
  autoplay: false  // Don't start automatically
});

// Playback control
anim.play();        // Play forward
anim.pause();       // Pause playback
anim.resume();      // Resume in current direction
anim.reverse();     // Play backward
anim.restart();     // Reset to start and play

// Seeking
anim.seek(500);     // Jump to 500ms
anim.seek('50%');   // Jump to 50% progress

// Timing manipulation
anim.stretch(2);    // Double the duration

// State changes
anim.complete();    // Jump to end state
anim.reset();       // Reset to initial state
anim.revert();      // Revert all changes
anim.cancel();      // Cancel animation

// Refresh
anim.refresh();     // Recalculate values
```

### Animation Properties

```typescript
anim.progress       // Current progress (0 to 1)
anim.currentTime    // Current time in ms
anim.duration       // Total duration
anim.paused         // Boolean: is paused
anim.completed      // Boolean: is completed
anim.reversed       // Boolean: is reversed
anim.loop           // Current loop iteration
```

---

## Advanced Features (v4)

### Timer

Replacement for setTimeout/setInterval that stays in sync with animations:

```typescript
import { createTimer } from 'animejs';

const timer = createTimer({
  duration: 2000,
  onUpdate: (timer) => {
    console.log('Progress:', timer.progress);
  },
  onComplete: () => {
    console.log('Timer finished');
  }
});
```

### Animatable

Optimized for frequently changing values (e.g., cursor following):

```typescript
import { createAnimatable } from 'animejs';

const animatable = createAnimatable('.element', {
  translateX: 0,
  translateY: 0
});

document.addEventListener('mousemove', (e) => {
  animatable.animate({
    translateX: e.clientX,
    translateY: e.clientY,
    duration: 300,
    ease: 'out(3)'
  });
});
```

### Draggable

Add drag interactions with physics:

```typescript
import { createDraggable } from 'animejs';

const draggable = createDraggable('.element', {
  container: '.container',  // Constrain to container
  trigger: '.handle',       // Drag handle
  snap: {
    x: 50,                 // Snap to 50px grid
    y: 50
  },
  onDrag: (draggable) => {
    console.log('Dragging:', draggable.x, draggable.y);
  },
  onRelease: (draggable) => {
    console.log('Released with velocity:', draggable.velocityX);
  }
});
```

### Scroll

Synchronize animations with scroll position:

```typescript
import { createScroll } from 'animejs';

const scrollAnim = createScroll({
  targets: '.element',
  translateY: [0, 200],
  opacity: [1, 0],
  trigger: '.section',
  start: 'top 80%',     // Start when section hits 80% from top
  end: 'top 20%',       // End when section hits 20% from top
  scrub: true           // Tie directly to scroll position
});
```

### Scope

Create animation contexts with shared settings and media query support:

```typescript
import { createScope } from 'animejs';

const scope = createScope({
  root: '.animation-container',
  defaults: {
    duration: 800,
    ease: 'outQuad'
  },
  mediaQueries: {
    '(max-width: 768px)': {
      duration: 400  // Shorter animations on mobile
    }
  }
});

// Animations created within scope inherit defaults
scope.animate('.element', {
  translateX: 100  // Uses 800ms duration from scope
});

// Revert all animations in scope
scope.revert();
```

### SVG Utilities

#### Motion Path
```typescript
import { createMotionPath } from 'animejs';

const path = createMotionPath('path#motion-path');

animate('.element', {
  translateX: path('x'),
  translateY: path('y'),
  rotate: path('angle'),
  duration: 2000
});
```

#### Drawable Path (Line Drawing)
```typescript
import { svg } from 'animejs';

const drawable = svg.createDrawable('path');

animate('path', {
  draw: '0 1',  // From 0% to 100% drawn
  duration: 2000
});
```

#### Shape Morphing
```typescript
import { morphTo } from 'animejs';

animate('path', {
  d: morphTo('path#target-shape'),
  duration: 1500
});
```

---

## V3 to V4 Migration

### Key Changes Affecting This Project

#### ✅ Import Syntax (Already Updated)
```typescript
// v3 (old)
import anime from 'animejs';
anime({ targets: '.element', opacity: 0.5 });

// v4 (current - ✅ correct)
import { animate } from 'animejs';
animate('.element', { opacity: 0.5 });
```

#### ✅ Targets as First Argument (Already Updated)
```typescript
// v3
anime({ targets: '.element', opacity: 0.5 });

// v4 (✅ correct)
animate('.element', { opacity: 0.5 });
```

#### ✅ Easing Parameter (Already Updated)
```typescript
// v3
easing: 'easeOutQuad'

// v4 (✅ correct)
ease: 'outQuad'
```

#### ⚠️ Loop Semantics Changed
**Important:** Loop count now means **repetitions**, not total iterations!

```typescript
// v3: loop: 1 = run once (1 total iteration)
// v4: loop: 1 = repeat once (2 total iterations)

// To run exactly once in v4:
loop: 0  // or omit loop parameter

// To run 3 times total in v4:
loop: 2  // (runs once + repeats 2 times = 3 total)
```

#### Object Syntax Value Parameter
```typescript
// v3
opacity: { value: 0.5, duration: 250 }

// v4
opacity: { to: 0.5, duration: 250 }
```

#### Direction Parameter
```typescript
// v3
direction: 'reverse'
direction: 'alternate'

// v4
reversed: true
alternate: true
```

#### Callbacks
```typescript
// v3
update: (anim) => {}
begin: (anim) => {}

// v4
onUpdate: (anim) => {}
onBegin: (anim) => {}  // Note: fires AFTER delay in v4
```

### Complete Migration Checklist

- [x] Change `import anime` to `import { animate }`
- [x] Move targets to first argument
- [x] Rename `easing` to `ease`
- [x] Shorten easing function names (`easeOutQuad` → `outQuad`)
- [ ] Check loop counts (v4 semantics: repetitions, not iterations)
- [x] Rename callback properties (`update` → `onUpdate`, etc.)
- [ ] Change `value` to `to` in object syntax (if used)
- [ ] Change `direction` to `reversed`/`alternate` (if used)

---

## Current Implementation Patterns

### Hook Location
`/Users/dom/Documents/Portfolio2026/app/hooks/useAnimeInteractions.ts`

### Hybrid Animation System

This project uses a **two-library approach**:

- **GSAP + ScrollTrigger**: Scroll-triggered animations, major page transitions, layout animations
- **Anime.js**: Hover effects, click interactions, micro-interactions, event-driven animations

### Architecture Pattern

```typescript
'use client';
import { useEffect } from 'react';
import { animate, stagger } from 'animejs';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useAnimeInteractions() {
    useEffect(() => {
        // 100ms delay ensures DOM is ready
        const timer = setTimeout(() => {
            // Initialize all animations here
            initializeMagneticDock();
            initializeTagInteractions();
            initializeContactLinks();
            // ... etc
        }, 100);

        return () => {
            clearTimeout(timer);
            // Cleanup ScrollTriggers
            if (contactScrollTrigger) {
                contactScrollTrigger.kill();
            }
            // Note: Event listeners not currently cleaned up
        };
    }, []);
}
```

### Integration with GSAP ScrollTrigger

Contact links use GSAP ScrollTrigger to detect scroll, then Anime.js for the animation:

```typescript
let contactScrollTrigger: ScrollTrigger | null = null;

const contactLinks = document.querySelectorAll('.contact-link');
if (contactLinks.length > 0) {
    contactScrollTrigger = ScrollTrigger.create({
        trigger: '.contact-links',
        start: 'top 90%',
        once: true,
        onEnter: () => {
            animate('.contact-link', {
                translateY: [30, 0],
                opacity: [0, 1],
                duration: 600,
                delay: stagger(150, { from: 'first' }),
                ease: 'out(3)'
            });
        }
    });
}
```

### Initialization Timing

All animations initialize after a **100ms delay** to ensure:
- DOM elements are mounted
- Next.js client hydration is complete
- Elements are accessible via querySelector

### Current Features

1. **Magnetic Dock Hover**
   - Scale animation on mouseenter (1 → 1.1)
   - Magnetic pull effect following cursor
   - Smooth reset on mouseleave

2. **Tag Interactions**
   - Hover: Scale to 1.15, color change to `#ff6b35`
   - Click: Ripple effect with scale array `[1, 1.3, 1]`

3. **Contact Link Stagger**
   - Scroll-triggered (GSAP ScrollTrigger)
   - 150ms stagger between links
   - TranslateY + opacity fade-in

4. **Hero Title Hover**
   - Scale + color transition on hover
   - Continuous opacity pulse on subtitle

5. **Skill Item Animations**
   - H3 header scale on hover
   - Smooth ease with `out(2)` and `inOutQuad`

---

## Code Examples

### Example 1: Magnetic Dock Hover (From Current Implementation)

```typescript
const dockItems = document.querySelectorAll('.dock-item');

dockItems.forEach(item => {
    const htmlItem = item as HTMLElement;

    // Scale on enter
    htmlItem.addEventListener('mouseenter', function() {
        animate(this, {
            scale: 1.1,
            duration: 300,
            ease: 'out(3)'
        });
    });

    // Magnetic follow on move
    htmlItem.addEventListener('mousemove', function(e: MouseEvent) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        animate(this, {
            translateX: x * 0.3,
            translateY: y * 0.3,
            duration: 300,
            ease: 'outQuad'
        });
    });

    // Reset on leave
    htmlItem.addEventListener('mouseleave', function() {
        animate(this, {
            scale: 1,
            translateX: 0,
            translateY: 0,
            duration: 400,
            ease: 'out(3)'
        });
    });
});
```

### Example 2: Tag Click Ripple Effect

```typescript
const tags = document.querySelectorAll('.tag');

tags.forEach(tag => {
    // Hover
    tag.addEventListener('mouseenter', function() {
        animate(this, {
            scale: 1.15,
            color: '#ff6b35',
            duration: 300,
            ease: 'out(2)'
        });
    });

    // Reset
    tag.addEventListener('mouseleave', function() {
        animate(this, {
            scale: 1,
            color: '#ffffff',
            duration: 300,
            ease: 'out(2)'
        });
    });

    // Click ripple
    tag.addEventListener('click', function() {
        animate(this, {
            scale: [1, 1.3, 1],  // Array = keyframes
            duration: 600,
            ease: 'inOutQuad'
        });
    });
});
```

### Example 3: Scroll-Triggered Stagger

```typescript
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, stagger } from 'animejs';

let scrollTrigger: ScrollTrigger | null = null;

scrollTrigger = ScrollTrigger.create({
    trigger: '.contact-links',
    start: 'top 90%',
    once: true,
    onEnter: () => {
        animate('.contact-link', {
            translateY: [30, 0],    // From 30px to 0
            opacity: [0, 1],        // Fade in
            duration: 600,
            delay: stagger(150, {   // 150ms between each
                from: 'first'
            }),
            ease: 'out(3)'
        });
    }
});

// Cleanup
return () => {
    if (scrollTrigger) scrollTrigger.kill();
};
```

### Example 4: Continuous Loop Animation

```typescript
// Hero subtitle pulse
animate('.hero-subtitle', {
    opacity: [0.7, 1],
    duration: 2000,
    ease: 'inOutQuad',
    loop: true,        // Infinite loop (no number = infinite)
    alternate: true    // Ping-pong between values
});
```

### Example 5: Sequential Promises

```typescript
async function introSequence() {
    await animate('.logo', {
        scale: [0, 1],
        opacity: [0, 1],
        duration: 800,
        ease: 'outCubic'
    });

    await animate('.title', {
        translateY: [-50, 0],
        opacity: [0, 1],
        duration: 600,
        ease: 'out(2)'
    });

    await animate('.subtitle', {
        opacity: [0, 1],
        duration: 400
    });

    console.log('Intro complete!');
}

introSequence();
```

---

## Enhancement Opportunities

### 1. Event Listener Cleanup

**Current Issue:** Event listeners are not removed on unmount, causing potential memory leaks if component unmounts/remounts.

**Enhancement:**
```typescript
export function useAnimeInteractions() {
    useEffect(() => {
        const listeners: Array<{
            element: Element,
            event: string,
            handler: EventListener
        }> = [];

        const addListener = (el: Element, event: string, handler: EventListener) => {
            el.addEventListener(event, handler);
            listeners.push({ element: el, event, handler });
        };

        // Use addListener instead of direct addEventListener
        dockItems.forEach(item => {
            addListener(item, 'mouseenter', handleEnter);
            addListener(item, 'mousemove', handleMove);
            addListener(item, 'mouseleave', handleLeave);
        });

        return () => {
            // Remove all listeners on cleanup
            listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
        };
    }, []);
}
```

### 2. Event Delegation

**Current:** Individual listeners on every element
**Enhancement:** Single delegated listener per container

```typescript
// Instead of listener on each .tag
document.querySelector('.tags-container')?.addEventListener('click', (e) => {
    const tag = (e.target as Element).closest('.tag');
    if (!tag) return;

    animate(tag, {
        scale: [1, 1.3, 1],
        duration: 600,
        ease: 'inOutQuad'
    });
});
```

### 3. Use Animatable for Cursor Following

**Current:** Using `animate()` on every mousemove
**Enhancement:** Use `Animatable` class for better performance

```typescript
import { createAnimatable } from 'animejs';

const magneticItems = document.querySelectorAll('.dock-item');
const animatables = new Map();

magneticItems.forEach(item => {
    const animatable = createAnimatable(item, {
        translateX: 0,
        translateY: 0
    });
    animatables.set(item, animatable);

    item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        animatable.animate({
            translateX: x * 0.3,
            translateY: y * 0.3,
            duration: 300,
            ease: 'outQuad'
        });
    });
});
```

### 4. Explore Scroll Class

**Potential:** Replace some GSAP ScrollTrigger usage with Anime.js `Scroll` class for a more unified animation system:

```typescript
import { createScroll } from 'animejs';

// Alternative to GSAP ScrollTrigger
createScroll({
    targets: '.contact-link',
    translateY: [30, 0],
    opacity: [0, 1],
    delay: stagger(150),
    trigger: '.contact-links',
    start: 'top 90%',
    once: true
});
```

### 5. Timeline for Complex Sequences

**Use Case:** Multi-step animation sequences
```typescript
import { createTimeline } from 'animejs';

const tl = createTimeline({
    defaults: {
        duration: 600,
        ease: 'out(2)'
    }
});

tl.add('.logo', { scale: [0, 1] })
  .add('.title', { translateY: [-50, 0] }, '-=200')  // Overlap by 200ms
  .add('.subtitle', { opacity: [0, 1] });
```

---

## Quick Reference

### Common Patterns

```typescript
// Basic fade
animate('.element', { opacity: 0, duration: 400 });

// Move and fade
animate('.element', {
    translateX: 100,
    opacity: 0,
    duration: 600,
    ease: 'outQuad'
});

// Stagger animation
animate('.item', {
    translateY: [20, 0],
    opacity: [0, 1],
    delay: stagger(100),
    duration: 500
});

// Hover scale
element.addEventListener('mouseenter', function() {
    animate(this, { scale: 1.1, duration: 300 });
});

// Loop infinitely
animate('.element', {
    rotate: 360,
    duration: 2000,
    loop: true,
    ease: 'linear'
});

// Sequential animation
await animate('.el1', { opacity: 1 });
await animate('.el2', { opacity: 1 });
```

### Performance Tips

1. Use `will-change` CSS for animated properties
2. Prefer transforms over position/dimensions
3. Use `Animatable` for high-frequency updates
4. Batch similar animations together
5. Clean up event listeners on unmount
6. Use `once: true` on ScrollTriggers when possible

---

## Resources

- **Official Documentation:** [animejs.com/documentation](https://animejs.com/documentation/)
- **GitHub Repository:** [github.com/juliangarnier/anime](https://github.com/juliangarnier/anime)
- **V4 Migration Guide:** [github.com/juliangarnier/anime/wiki/Migrating-from-v3-to-v4](https://github.com/juliangarnier/anime/wiki/Migrating-from-v3-to-v4)
- **What's New in V4:** [github.com/juliangarnier/anime/wiki/What's-new-in-Anime.js-V4](https://github.com/juliangarnier/anime/wiki/What's-new-in-Anime.js-V4)
- **npm Package:** [npmjs.com/package/animejs](https://www.npmjs.com/package/animejs)

---

**Last Updated:** December 2025
**Anime.js Version:** 4.2.2
**Project:** BAI Solutions Portfolio (Next.js 15)
