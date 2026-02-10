'use client';

import { useCallback, useEffect, useState } from 'react';
import { useExploreStore } from '../../stores/useExploreStore';

export default function DiveInButton() {
  const [isDesktop, setIsDesktop] = useState(false);
  const setTransitioning = useExploreStore((s) => s.setTransitioning);
  const enterExplore = useExploreStore((s) => s.enterExplore);
  const setSavedScrollY = useExploreStore((s) => s.setSavedScrollY);
  const isActive = useExploreStore((s) => s.isActive);
  const isTransitioning = useExploreStore((s) => s.isTransitioning);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024 && !('ontouchstart' in window));
  }, []);

  const handleDiveIn = useCallback(async () => {
    if (isActive || isTransitioning) return;

    // Save scroll position
    setSavedScrollY(window.scrollY);
    setTransitioning(true);

    // Dynamically import GSAP for the transition
    const { gsap } = await import('gsap');

    // Create the zoom overlay element with the same background as the body
    const bgUrl = getComputedStyle(document.body).backgroundImage;
    const zoomDiv = document.createElement('div');
    zoomDiv.className = 'explore-zoom-bg';
    zoomDiv.style.backgroundImage = bgUrl;
    document.body.appendChild(zoomDiv);

    // Get the explore overlay
    const overlay = document.getElementById('explore-overlay');

    // Create a scanline / pixel dissolve container for the 8-bit feel
    const scanlines = document.createElement('div');
    scanlines.className = 'explore-scanlines';
    document.body.appendChild(scanlines);

    // Timeline: zoom into image → black → stars appear
    const tl = gsap.timeline({
      onComplete: () => {
        // Clean up transition elements
        zoomDiv.remove();
        scanlines.remove();
        // Disable page scroll
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        // Activate explore mode
        enterExplore();
      },
    });

    // Phase 1: Hide page content, show scanlines
    tl.to('.floating-dock', {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: 'power2.in',
    }, 0);

    tl.to('.hero-content', {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: 'power2.in',
    }, 0);

    tl.to('#smooth-wrapper', {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
    }, 0.1);

    // Phase 2: Zoom the background image while adding a radial vignette collapse
    tl.fromTo(zoomDiv, {
      opacity: 1,
      scale: 1,
      filter: 'brightness(1)',
    }, {
      scale: 6,
      filter: 'brightness(0)',
      duration: 1.0,
      ease: 'power3.in',
    }, 0.15);

    // Scanlines flash - the 8-bit aesthetic touch
    tl.fromTo(scanlines, {
      opacity: 0,
    }, {
      opacity: 0.6,
      duration: 0.2,
      ease: 'none',
    }, 0.3);

    tl.to(scanlines, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
    }, 0.7);

    // Phase 3: Fade in the explore overlay
    if (overlay) {
      tl.fromTo(overlay, {
        opacity: 0,
        display: 'block',
        visibility: 'visible',
      }, {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      }, 0.8);
    }
  }, [isActive, isTransitioning, setTransitioning, enterExplore, setSavedScrollY]);

  if (!isDesktop) return null;

  return (
    <button
      className="explore-dive-btn"
      onClick={handleDiveIn}
      type="button"
      aria-label="3D Space Explorer starten"
    >
      <span className="explore-dive-btn-text">Dive In</span>
      <span className="explore-dive-btn-icon">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1L7 13M7 13L1 7M7 13L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
        </svg>
      </span>
    </button>
  );
}
