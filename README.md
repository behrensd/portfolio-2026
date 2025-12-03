# BAI Solutions - Next.js Portfolio

Award-winning portfolio website with advanced GSAP and Anime.js animations, migrated to Next.js 15 with App Router.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3001](http://localhost:3001) to view the site.

## 📁 Project Structure

```
app/
├── components/          # React components
│   ├── Hero.tsx        # Hero section with canvas particles
│   ├── About.tsx       # About section with skills
│   ├── Projects.tsx    # Project showcase with animations
│   ├── Contact.tsx     # Contact section
│   ├── Navigation.tsx  # Floating dock navigation
│   └── LogoOverlay.tsx # Fixed logo with scroll animation
├── hooks/              # Custom animation hooks
│   ├── useHeroAnimation.ts      # Hero text animations
│   ├── useHeroCanvas.ts         # Canvas particle system
│   ├── useProjectAnimations.ts  # Project scroll animations
│   ├── useDockNavigation.ts     # Navigation interactions
│   └── useAnimeInteractions.ts  # Anime.js micro-interactions
├── globals.css         # Global styles
├── layout.tsx          # Root layout with fonts
└── page.tsx            # Main page component
```

## ✨ Features

### Award-Winning Animations

#### **Project 01: Staggered Clip-Path Reveal**
- Horizontal wipe reveal from center outward
- 3D perspective on project number (rotationY: 45°)
- Staggered content reveal from left
- Elastic tag animations with Anime.js

#### **Project 02: Split-Screen Push**
- Mockup emergence from right with depth parallax
- 3D Y-rotation on project number (-90°)
- Content slides from left while mockup pushes from right
- Elastic tag bounces with scale animations

#### **Project 03: 3D Perspective Flip**
- Content card flips from flat to upright (rotationX: -90°)
- Blur-to-focus effect on mockup
- Number fades with rotation
- Pop-in tag animations with easeOutBack

### Canvas Particle System
- **Scroll-Reactive Behavior**: Particles change speed and behavior based on active project
- **Mouse Interaction**: Particles avoid cursor with magnetic push effect
- **Dynamic Connections**: Lines connect nearby particles with adaptive distance
- **Project-Specific States**:
  - Project 01: Faster, energetic particles
  - Project 02: Particles cluster toward mockup area
  - Project 03: Slower, organized movement

### Anime.js Micro-Interactions
- **Magnetic Dock Hover**: Items follow cursor with elastic return
- **Tag Interactions**: Scale and color change on hover, ripple on click
- **Contact Links**: Staggered reveal and scale on hover
- **Hero Title**: Hover effects with color shifts
- **Skill Items**: Animated headers on hover

### Logo Animation
- Starts centered in viewport above hero text
- Smoothly animates to top-left corner on scroll
- Full 360° rotation during transition
- Clickable to scroll back to top
- Fixed overlay positioning for smooth animation

## 🛠️ Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Animations**: GSAP 3.13 + ScrollTrigger + ScrollToPlugin
- **Micro-interactions**: Anime.js 4.2
- **Styling**: Tailwind CSS 4 + Custom CSS
- **Typography**: Lato (Google Fonts)
- **Language**: TypeScript

## 🎨 Customization

### Modifying Projects
Edit `app/components/Projects.tsx` to update project data:

```typescript
const projectsData = [
  {
    id: 0,
    number: '01',
    title: 'Your Project',
    description: 'Project description...',
    tags: ['Tag1', 'Tag2', 'Tag3'],
    mockupSize: 'mockup-medium',
    mockupLabel: 'Preview Label'
  }
];
```

### Adjusting Animations
- **Project Animations**: Edit `app/hooks/useProjectAnimations.ts`
- **Canvas Behavior**: Modify `app/hooks/useHeroCanvas.ts`
- **Micro-interactions**: Update `app/hooks/useAnimeInteractions.ts`
- **Logo Animation**: Change `app/components/LogoOverlay.tsx`

### Styling
- **Global Styles**: `app/globals.css`
- **Colors**: Update CSS variables in `:root`
- **Spacing**: Modify spacing variables
- **Typography**: Change font in `app/layout.tsx`

## 🎯 Performance Optimizations

- **Hardware Acceleration**: `will-change`, `transform3d` on animated elements
- **Particle Count**: Responsive (30 mobile, 50 desktop)
- **ScrollTrigger**: Efficient scrubbing with optimized start/end points
- **Image Optimization**: Next.js Image component with priority loading
- **Animation Cleanup**: All hooks properly clean up on unmount

## 📱 Responsive Design

- Fluid typography with `clamp()`
- Responsive particle counts
- Mobile-optimized mockup sizes
- Adaptive navigation spacing
- Touch-friendly interactions

## 🔧 Development Notes

### Animation Hooks Pattern
All animations use custom hooks for:
- **Encapsulation**: Each animation system is isolated
- **Cleanup**: Automatic cleanup on component unmount
- **Reusability**: Hooks can be shared across components
- **Type Safety**: Full TypeScript support

### GSAP ScrollTrigger Usage
- All triggers properly killed on cleanup
- Optimized scrub values for smooth performance
- Start/end points calculated for precise timing
- Native scroll (no Lenis) for maximum compatibility

### Known Considerations
- Logo animation uses fixed positioning in overlay container
- Canvas particles use `requestAnimationFrame` for smooth rendering
- Anime.js v4.2.2 imported directly from npm package (`import { animate, stagger } from 'animejs'`)
- All animations initialize after DOM is ready (100ms delay)

## 📝 Migration from Vanilla

This project was migrated from a vanilla HTML/CSS/JS stack to Next.js while maintaining 100% feature parity:

✅ All GSAP animations preserved
✅ Canvas particle system intact
✅ Anime.js micro-interactions working
✅ Logo scroll animation functioning
✅ Navigation active states maintained
✅ Responsive behavior unchanged

## 🐛 Troubleshooting

### Dev Server Issues
```bash
# Kill existing process on port 3001
lsof -ti:3001 | xargs kill -9

# Restart dev server
npm run dev
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Animation Issues
- Check browser console for GSAP errors
- Verify DOM elements exist before animation initialization
- Ensure `'use client'` directive is present in component files

## 📄 License

Private portfolio project for Dom Behrens / BAI Solutions.

---

**Built with** ❤️ **using Next.js, GSAP, and Anime.js**
