'use client';

import { useEffect } from 'react';
import { useExploreStore } from '../../stores/useExploreStore';
import SpaceExplorer from './SpaceExplorer';
import ExploreHUD from './ExploreHUD';

export default function ExploreOverlay() {
  const isActive = useExploreStore((s) => s.isActive);
  const isTransitioning = useExploreStore((s) => s.isTransitioning);

  // Listen for exit events from the store
  useEffect(() => {
    if (!isActive && !isTransitioning) {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  }, [isActive, isTransitioning]);

  // Intercept exit from the store (called by HUD ESC button)
  useEffect(() => {
    const unsubscribe = useExploreStore.subscribe(
      (state, prevState) => {
        // Detect when isActive switches from true to false
        if (prevState.isActive && !state.isActive) {
          // Re-enable scroll
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';

          // Restore scroll
          const scrollY = state.savedScrollY;
          window.scrollTo(0, scrollY);

          // Animate page back in
          import('gsap').then(({ gsap }) => {
            const overlay = document.getElementById('explore-overlay');
            if (overlay) {
              gsap.to(overlay, { opacity: 0, duration: 0.4, ease: 'power2.in' });
            }
            gsap.fromTo('#smooth-wrapper', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.2 });
            gsap.fromTo('.floating-dock', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.3 });
            gsap.fromTo('.hero-content', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out', delay: 0.2 });
          });
        }
      }
    );
    return () => unsubscribe();
  }, []);

  // Only render Canvas when active or transitioning
  const shouldRender = isActive || isTransitioning;

  return (
    <div
      id="explore-overlay"
      className="explore-overlay"
      style={{
        display: shouldRender ? 'block' : 'none',
        opacity: shouldRender ? undefined : 0,
      }}
    >
      {shouldRender && (
        <>
          <SpaceExplorer />
          <ExploreHUD />
        </>
      )}
    </div>
  );
}
