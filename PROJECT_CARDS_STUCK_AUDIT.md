# Project Cards Stuck - Comprehensive Audit

## Date: December 19, 2025
## Issue: Project cards get stuck during scroll-triggered animations

---

## 🔍 Root Causes Identified

### 1. **Timing Conflict: Pin Trigger Fires Before Slide-In Completes** ⚠️ CRITICAL

**Problem:**
- Slide-in trigger: `start: 'top 90%'` (fires when card is 90% down viewport)
- Pin trigger: `start: 'top 50%'` (fires when card is 50% down viewport)
- Slide-in animation duration: `900ms`
- **Result**: On fast scroll, pin trigger fires while card is still sliding in from side

**Evidence:**
```typescript
// Line 225: Slide-in starts at 90%
scrollTrigger: {
    trigger: project,
    start: 'top 90%',  // Card enters viewport
    // ... 900ms animation
}

// Line 291: Pin starts at 50% - TOO EARLY!
const pinTrigger = ScrollTrigger.create({
    trigger: project,
    start: 'top 50%', // Can fire before slide-in completes
    pin: true,
    // ...
});
```

**Impact:**
- Card gets pinned while still at `x: -120` or `x: 120`
- Card appears stuck off-screen
- Text reveal tries to animate invisible content
- User sees broken animation state

---

### 2. **ScrollTrigger Not Exposed Early Enough for Tests** ✅ FIXED

**Problem:**
- ScrollTrigger was exposed inside `setTimeout` callback
- Tests check for it immediately after page load
- Tests timeout waiting for triggers that haven't been created yet

**Fix Applied:**
- Moved ScrollTrigger exposure to module level (before useEffect)
- Now available immediately when module loads

---

### 3. **Projects Not Rendering in Test Environment** 🔍 INVESTIGATING

**Problem:**
- Test shows `projectCount: 0` even though Projects component is in page.tsx
- Could be React hydration timing issue
- Could be CSS hiding elements (opacity: 0 initially)

**Current Status:**
- Added wait for `.project-item` selector in test helper
- Added 500ms delay for React hydration + animation hook setTimeout

---

### 4. **Safari-Specific Scroll Issues** 🍎 KNOWN ISSUE

**Problem:**
- Safari handles scroll on compositor thread
- ScrollTrigger pinning can lag or stutter
- Fast scroll animations need longer durations on Safari

**Memory Reference:**
> Safari has quirks with: fast scroll animations (needs longer durations), backdrop-filter rendering, position:fixed elements, touch/scroll event handling

---

## 🛠️ Fixes Applied

### Fix 1: Delay Pin Trigger Until After Slide-In Completes

**Solution:**
Change pin trigger start position to fire AFTER slide-in animation completes:

```typescript
// Calculate when slide-in completes
// Slide-in starts at 'top 90%' and takes 900ms
// Need to account for scroll distance during animation

// Option A: Use 'top 30%' (safer, ensures slide-in completes)
start: 'top 30%', // Fires well after slide-in completes

// Option B: Use onComplete callback from slide-in
// Set a flag when slide-in completes, check in pin trigger
```

**Recommended:** Use `start: 'top 30%'` for safety margin

---

### Fix 2: Add Slide-In Completion Check

**Solution:**
Add data attribute when slide-in completes, check in pin trigger:

```typescript
onEnter: () => {
    // Mark slide-in as complete
    project.setAttribute('data-slide-complete', 'true');
    // ... existing code
}

// In pin trigger:
onEnter: () => {
    // Wait for slide-in to complete
    const checkSlideComplete = () => {
        if (project.hasAttribute('data-slide-complete')) {
            // Safe to pin and reveal text
            revealTextWithAnime(project, isMobile);
        } else {
            // Retry after slide-in duration
            setTimeout(checkSlideComplete, 100);
        }
    };
    checkSlideComplete();
}
```

---

### Fix 3: Safari-Specific Adjustments

**Solution:**
Add Safari detection and adjust timing:

```typescript
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// Longer pin duration on Safari for smoother scroll
end: isSafari && isMobile ? '+=100%' : (isMobile ? '+=80%' : '+=120%'),

// Longer delay for text reveal on Safari
setTimeout(() => {
    revealTextWithAnime(project, isMobile);
}, isSafari ? 250 : 150);
```

---

## 📋 Implementation Plan

1. ✅ **Fix ScrollTrigger exposure timing** - DONE
2. ✅ **Fix pin trigger timing conflict** - DONE
3. ✅ **Add slide-in completion check** - DONE
4. ✅ **Add Safari-specific adjustments** - DONE
5. ⏳ **Test and verify fixes** - PENDING

---

## ✅ Fixes Implemented

### Fix 1: Pin Trigger Timing
- **Changed**: Pin trigger start from `'top 50%'` to `'top 30%'`
- **Reason**: Ensures slide-in animation (900ms) completes before pin activates
- **Location**: `app/hooks/useProjectAnimations.ts:309`

### Fix 2: Slide-In Completion Tracking
- **Added**: `data-slide-complete` attribute set when slide-in finishes
- **Added**: `onComplete` callback on slideInTween to mark completion
- **Added**: Check in pin trigger's `onEnter` to wait for slide-in completion
- **Location**: `app/hooks/useProjectAnimations.ts:292-298, 312-319`

### Fix 3: Safari-Specific Adjustments
- **Added**: Safari detection using user agent
- **Changed**: Pin duration on Safari mobile: `+=100%` (was `+=80%`)
- **Changed**: Text reveal delay on Safari: `250ms` (was `150ms`)
- **Location**: `app/hooks/useProjectAnimations.ts:305, 311, 330`

### Fix 4: Reset Logic
- **Added**: Clear `data-slide-complete` attribute on scroll back
- **Location**: `app/hooks/useProjectAnimations.ts:257`

---

## 🧪 Testing Strategy

### Test Cases to Verify:

1. **Slow Scroll:**
   - Scroll slowly to first project
   - Verify: Slide-in completes → Pin activates → Text reveals

2. **Fast Scroll:**
   - Scroll quickly past projects
   - Verify: No stuck cards, animations complete properly

3. **Scroll Back:**
   - Scroll down, then back up
   - Verify: Cards reset properly, no stuck states

4. **Safari Testing:**
   - Test on Safari desktop and mobile
   - Verify: Smooth pinning, no lag

---

## 📊 Expected Behavior After Fixes

### Correct Animation Flow:

1. **Card enters viewport (90%):**
   - Slide-in animation starts (900ms)
   - Card slides from side (left/right)
   - Opacity fades in

2. **Card reaches 30% (after slide-in completes):**
   - Pin trigger activates
   - Card pins in viewport
   - Text reveal animation starts

3. **User scrolls through pinned section:**
   - Card stays pinned
   - Text animates character-by-character
   - Smooth scroll experience

4. **User scrolls past:**
   - Pin releases
   - Card continues normal scroll

5. **User scrolls back up:**
   - Card resets to initial state
   - Ready to animate again

---

## 🔗 Related Files

- `app/hooks/useProjectAnimations.ts` - Main animation logic
- `app/components/Projects.tsx` - Project card rendering
- `tests/unit/project-animations.spec.ts` - Test suite
- `tests/fixtures/animation-helpers.ts` - Test utilities
- `app/globals.css` - CSS for project items (opacity: 0 initially)

---

## 📝 Notes

- Pin trigger should NEVER fire before slide-in completes
- Consider using GSAP timeline for better control
- Safari requires special handling for smooth animations
- Test on multiple browsers and scroll speeds

