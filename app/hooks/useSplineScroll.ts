import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Application } from '@splinetool/runtime';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Spline Scroll Animation Hook
 * 
 * Uses GSAP ScrollTrigger for consistent scroll handling.
 * 
 * DESKTOP:
 * - Animates individual cubes (rotation) on scroll.
 * - Retries finding specific objects if needed.
 * 
 * MOBILE:
 * - DISABLES scroll-driven rotation ("spin") completely to prevent choppiness.
 * - Keeps the scene visible and running (smooth intrinsic animation).
 * - Ensures the model is zoomed out correctly.
 */
export function useSplineScroll(splineApp: Application | null) {
  const objectsToRotateRef = useRef<any[]>([]);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const initialRotationsRef = useRef<number[]>([]);
  const setupAttemptedRef = useRef(false);

  useEffect(() => {
    if (!splineApp || setupAttemptedRef.current) return;

    setupAttemptedRef.current = true;

    const isMobile = window.innerWidth < 768;
    
    // MOBILE OPTIMIZATION:
    // User requested "smoothly animate on mobile without the spin".
    // This means we skip the scroll-linked rotation logic entirely on mobile.
    // The Spline scene will simply play its default state/animation without JS interference.
    if (isMobile) {
      // Ensure correct zoom for mobile
      try {
        splineApp.setZoom(0.6);
      } catch (e) {
        // Zoom not available
      }
      return;
    }

    // DESKTOP LOGIC:
    let attempts = 0;
    const maxAttempts = 5;
    const retryDelay = 200;

    const initAnimation = () => {
      // Try multiple approaches to find objects to animate
      let objectsFound: any[] = [];
      
      // Method 1: Try to find specific cube objects (The Preferred "Individual Cubes" Animation)
      const cubeNames = ['Cube 4', 'Cube 3', 'Cube 2', 'Cube', 'Cloner', 'Object'];
      cubeNames.forEach(name => {
        try {
          const obj = splineApp.findObjectByName(name);
          if (obj && obj.rotation) {
            objectsFound.push(obj);
          }
        } catch (e) {
          // Object not found, continue
        }
      });

      // Retry logic for desktop to ensure we get the cubes
      if (objectsFound.length === 0 && attempts < maxAttempts) {
        attempts++;
        setTimeout(initAnimation, retryDelay);
        return;
      }

      // Method 2: Fallback to common container names ONLY if we exhausted retries
      if (objectsFound.length === 0) {
        const containerNames = ['Scene', 'Group', 'Container', 'Root', 'Main'];
        for (const name of containerNames) {
          try {
            const obj = splineApp.findObjectByName(name);
            if (obj && obj.rotation) {
              objectsFound.push(obj);
              break;
            }
          } catch (e) {
            // Continue to next name
          }
        }
      }

      // If absolutely nothing found
      if (objectsFound.length === 0) {
        return;
      }

      objectsToRotateRef.current = objectsFound;
      initialRotationsRef.current = objectsFound.map(obj => obj.rotation?.y || 0);

      // Use GSAP ScrollTrigger for consistent scroll tracking (DESKTOP ONLY)
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5, // Smoother rotation (lower = smoother)
        refreshPriority: 2, // Lower priority for background animation
        onUpdate: (self) => {
          objectsToRotateRef.current.forEach((obj, index) => {
            if (obj?.rotation) {
              const initialY = initialRotationsRef.current[index] || 0;
              // Apply rotation
              obj.rotation.y = initialY + (self.progress * Math.PI);
            }
          });
        }
      });
    };

    // Start the initialization process for desktop
    setTimeout(initAnimation, 500);

    // Handle resize for zoom adjustment
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      try {
        splineApp.setZoom(mobile ? 0.6 : 1);
      } catch (e) {
        // Zoom not available
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
      setupAttemptedRef.current = false;
    };
  }, [splineApp]);
}
