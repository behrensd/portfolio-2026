# Text & String Animation Overview: Anime.js & GSAP

Comprehensive guide to text and string animations using Anime.js and GSAP, based on web research and current codebase implementation.

## Table of Contents
1. [Anime.js Text Animations](#animejs-text-animations)
2. [GSAP Text Animations](#gsap-text-animations)
3. [Comparison & Best Practices](#comparison--best-practices)
4. [Implementation Examples](#implementation-examples)
5. [Current Project Usage](#current-project-usage)

---

## Anime.js Text Animations

### Core Features

**Anime.js** is a lightweight JavaScript animation library with a simple API for text animations.

#### Key Functions for Text

1. **`splitText()` Function**
   - Splits text into lines, words, or characters
   - Enables targeted animations on individual text units
   - Essential for character-by-character animations

```typescript
// Example: Split text into characters
import { animate } from 'animejs';

const text = "Hello World";
const chars = text.split('').map(char => {
  const span = document.createElement('span');
  span.textContent = char;
  return span;
});
```

2. **Character-by-Character Animation**
   - Animate each character individually
   - Create effects like typewriter, fade-in, or reveal animations
   - Use `stagger` for sequential character animations

```typescript
import { animate, stagger } from 'animejs';

// Animate characters with stagger
animate('.char', {
  opacity: [0, 1],
  translateY: [20, 0],
  delay: stagger(50), // 50ms between each character
  duration: 600,
  ease: 'outExpo'
});
```

3. **Word-by-Word Animation**
   - Split text into words for word-level animations
   - Useful for paragraph reveals

```typescript
// Split into words
const words = text.split(' ').map(word => {
  const span = document.createElement('span');
  span.textContent = word + ' ';
  return span;
});

animate(words, {
  opacity: [0, 1],
  translateX: [-20, 0],
  delay: stagger(100),
  duration: 400
});
```

### Common Text Animation Patterns

1. **Typewriter Effect**
```typescript
const text = "Hello, World!";
let index = 0;

const typeWriter = () => {
  if (index < text.length) {
    element.textContent += text.charAt(index);
    index++;
    setTimeout(typeWriter, 100);
  }
};
```

2. **Fade-in Characters**
```typescript
animate('.char', {
  opacity: [0, 1],
  duration: 500,
  delay: stagger(30),
  ease: 'outQuad'
});
```

3. **Slide-in Characters**
```typescript
animate('.char', {
  translateY: [30, 0],
  opacity: [0, 1],
  duration: 600,
  delay: stagger(50),
  ease: 'outExpo'
});
```

4. **Rotate-in Characters**
```typescript
animate('.char', {
  rotate: [180, 0],
  opacity: [0, 1],
  duration: 800,
  delay: stagger(40),
  ease: 'outBack'
});
```

### Resources
- **Official Docs**: [animejs.com/documentation/text/splittext](https://animejs.com/documentation/text/splittext)
- **Moving Letters Project**: [tobiasahlin.com/moving-letters](https://tobiasahlin.com/moving-letters) - Great examples of text animations

---

## GSAP Text Animations

### Core Features

**GSAP (GreenSock Animation Platform)** is a robust, high-performance animation library with extensive text animation plugins.

#### Key Plugins for Text

1. **SplitText Plugin** (Premium)
   - Splits text into characters, words, or lines
   - Automatic screen reader accessibility
   - Responsive re-splitting support
   - Most powerful text splitting solution

```typescript
import { SplitText } from 'gsap/SplitText';
import gsap from 'gsap';

// Split text into characters
const split = new SplitText('.text', {
  type: 'chars,words,lines'
});

// Animate characters
gsap.from(split.chars, {
  opacity: 0,
  y: 50,
  rotationX: -90,
  stagger: 0.02,
  duration: 0.8,
  ease: 'back.out'
});
```

2. **TextPlugin** (Free)
   - Animates text content directly
   - Typewriter effect
   - Number counting animations

```typescript
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

// Typewriter effect
gsap.to('.text', {
  duration: 2,
  text: "Hello, World!",
  ease: "none"
});

// Number counting
gsap.to('.counter', {
  duration: 2,
  text: 100,
  roundProps: "text",
  ease: "power1.out"
});
```

3. **ScrambleTextPlugin** (Premium)
   - Scrambles text with randomized characters
   - Decoding effect
   - Great for rollovers and interactive elements

```typescript
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

gsap.to('.text', {
  duration: 1,
  scrambleText: {
    text: "New Text",
    chars: "XO",
    revealDelay: 0.5,
    speed: 0.3
  }
});
```

### Common GSAP Text Patterns

1. **Character Reveal**
```typescript
const split = new SplitText('.text', { type: 'chars' });

gsap.from(split.chars, {
  opacity: 0,
  y: 20,
  rotationX: -90,
  stagger: 0.05,
  duration: 0.6,
  ease: 'back.out'
});
```

2. **Word-by-Word Animation**
```typescript
const split = new SplitText('.text', { type: 'words' });

gsap.from(split.words, {
  opacity: 0,
  y: 30,
  stagger: 0.1,
  duration: 0.8,
  ease: 'power2.out'
});
```

3. **Line-by-Line Animation**
```typescript
const split = new SplitText('.text', { type: 'lines' });

gsap.from(split.lines, {
  opacity: 0,
  y: 50,
  stagger: 0.2,
  duration: 1,
  ease: 'power3.out'
});
```

4. **Letter Explosion Effect**
```typescript
const split = new SplitText('.text', { type: 'chars' });

gsap.to(split.chars, {
  x: () => Math.random() * 500 - 250,
  y: () => Math.random() * 500 - 250,
  rotation: () => Math.random() * 360,
  opacity: 0,
  stagger: 0.02,
  duration: 1,
  ease: 'power2.out'
});
```

### Resources
- **SplitText Docs**: [gsap.com/docs/v3/Plugins/SplitText](https://gsap.com/docs/v3/Plugins/SplitText)
- **TextPlugin Docs**: [gsap.com/docs/v3/Plugins/TextPlugin](https://gsap.com/docs/v3/Plugins/TextPlugin)
- **ScrambleText Docs**: [gsap.com/docs/v3/Plugins/ScrambleTextPlugin](https://gsap.com/docs/v3/Plugins/ScrambleTextPlugin)
- **Tutorial**: [snorkl.tv/dynamic-text-effect-with-greensock](https://www.snorkl.tv/dynamic-text-effect-with-greensock-gsap-3)

---

## Comparison & Best Practices

### When to Use Anime.js

✅ **Best for:**
- Simple, lightweight text animations
- Quick implementations
- Character/word stagger effects
- Hover interactions
- Micro-interactions
- Projects where bundle size matters

❌ **Not ideal for:**
- Complex text splitting (no built-in splitter)
- Advanced text effects (scrambling, decoding)
- Typewriter effects (requires manual implementation)
- Large-scale text animations

### When to Use GSAP

✅ **Best for:**
- Complex text animations
- Professional-grade effects
- SplitText for advanced splitting
- ScrambleText for decoding effects
- Typewriter animations (TextPlugin)
- Performance-critical applications
- Scroll-triggered text reveals

❌ **Not ideal for:**
- Simple hover effects (overkill)
- Very small projects (larger bundle)
- Quick prototypes (more setup)

### Performance Comparison

| Feature | Anime.js | GSAP |
|---------|----------|------|
| Bundle Size | ~15KB | ~45KB (core) + plugins |
| Performance | Excellent | Excellent (optimized) |
| Learning Curve | Easy | Moderate |
| Text Splitting | Manual | Built-in (SplitText) |
| Typewriter | Manual | Built-in (TextPlugin) |
| Scrambling | Manual | Built-in (ScrambleText) |

### Hybrid Approach (Current Project)

The portfolio uses **both libraries strategically**:

- **GSAP + ScrollTrigger**: Scroll-triggered animations, major transitions
- **Anime.js**: Hover effects, micro-interactions, event-driven animations

---

## Implementation Examples

### Anime.js: Character Stagger Reveal

```typescript
import { animate, stagger } from 'animejs';

function animateText(element: HTMLElement) {
  const text = element.textContent || '';
  const chars = text.split('').map(char => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    return span;
  });
  
  element.textContent = '';
  chars.forEach(char => element.appendChild(char));
  
  animate(chars, {
    opacity: [0, 1],
    translateY: [20, 0],
    delay: stagger(50),
    duration: 600,
    ease: 'outExpo'
  });
}
```

### GSAP: SplitText Character Reveal

```typescript
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

function animateTextGSAP(element: HTMLElement) {
  const split = new SplitText(element, {
    type: 'chars',
    charsClass: 'char'
  });
  
  gsap.from(split.chars, {
    opacity: 0,
    y: 20,
    rotationX: -90,
    stagger: 0.05,
    duration: 0.6,
    ease: 'back.out'
  });
}
```

### GSAP: Typewriter Effect

```typescript
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

function typewriter(element: HTMLElement, text: string) {
  gsap.to(element, {
    duration: text.length * 0.05,
    text: text,
    ease: 'none'
  });
}
```

### GSAP: Scramble Text Effect

```typescript
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

function scrambleText(element: HTMLElement, newText: string) {
  gsap.to(element, {
    duration: 1,
    scrambleText: {
      text: newText,
      chars: "XO",
      revealDelay: 0.5,
      speed: 0.3
    }
  });
}
```

---

## Current Project Usage

### Current Implementation

**Location**: `app/hooks/useAnimeInteractions.ts`

The project currently uses:
- **Anime.js** for hover effects and micro-interactions
- **GSAP** for scroll-triggered animations
- **No text splitting** currently implemented

### Available in Project

✅ **Installed:**
- `animejs@4.2.2` - Full Anime.js library
- `gsap@3.13.0` - GSAP core
- `@types/animejs@3.1.13` - TypeScript types

⚠️ **Not Installed (GSAP Premium Plugins):**
- SplitText (requires GSAP membership)
- ScrambleText (requires GSAP membership)

✅ **Available (GSAP Free):**
- TextPlugin (free, but needs registration)

### Recommended Next Steps

1. **For Simple Text Animations**: Use Anime.js with manual text splitting
2. **For Advanced Effects**: Consider GSAP membership for SplitText/ScrambleText
3. **For Typewriter**: Use GSAP TextPlugin (free) or manual Anime.js implementation
4. **For Character Reveals**: Manual splitting with Anime.js (current approach)

### Example: Adding Text Animation to Hero

```typescript
// Using Anime.js (no additional dependencies)
function animateHeroText() {
  const heroLines = document.querySelectorAll('.hero-line');
  
  heroLines.forEach(line => {
    const text = line.textContent || '';
    const chars = text.split('').map(char => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      return span;
    });
    
    line.textContent = '';
    chars.forEach(char => line.appendChild(char));
    
    animate(chars, {
      opacity: [0, 1],
      translateY: [30, 0],
      delay: stagger(30),
      duration: 800,
      ease: 'outExpo'
    });
  });
}
```

---

## Summary

### Quick Reference

| Animation Type | Anime.js | GSAP |
|----------------|----------|------|
| Character Reveal | ✅ Manual split + stagger | ✅ SplitText |
| Word Animation | ✅ Manual split + stagger | ✅ SplitText |
| Typewriter | ⚠️ Manual | ✅ TextPlugin |
| Scrambling | ❌ Manual (complex) | ✅ ScrambleText |
| Hover Effects | ✅ Excellent | ⚠️ Overkill |
| Scroll Reveals | ⚠️ Manual + ScrollTrigger | ✅ ScrollTrigger |

### Recommendation for This Project

Given the current setup:
1. **Use Anime.js** for simple text animations (character/word reveals)
2. **Use GSAP** for scroll-triggered text reveals (already using ScrollTrigger)
3. **Consider GSAP membership** if advanced text effects are needed
4. **Manual text splitting** works well with Anime.js for most use cases

---

*Last updated: Based on web research and current codebase analysis*









