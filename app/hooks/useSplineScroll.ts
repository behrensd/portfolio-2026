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
 * Uses GSAP ScrollTrigger for consistent scroll handling across all devices.
 * This integrates properly with normalizeScroll used for mobile Safari.
 * 
 * Note: Spline scene rotation on scroll is optional - the main goal is 
 * ensuring smooth page scrolling on mobile devices.
 */
export function useSplineScroll(splineApp: Application | null) {
  const objectsToRotateRef = useRef<any[]>([]);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const initialRotationsRef = useRef<number[]>([]);
  const setupAttemptedRef = useRef(false);

  useEffect(() => {
    if (!splineApp || setupAttemptedRef.current) return;

    // Delay to allow Spline scene to fully initialize
    const setupTimer = setTimeout(() => {
      setupAttemptedRef.current = true;
      
      // Try multiple approaches to find objects to animate
      let objectsFound: any[] = [];
      
      // Method 1: Try to find specific cube objects
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

      // Method 2: Try common container names
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

      // If no objects found, that's okay - scroll still works, just no rotation
      if (objectsFound.length === 0) {
        console.log('ℹ️ No Spline objects found for rotation - scroll will work without 3D rotation');
        return;
      }

      objectsToRotateRef.current = objectsFound;
      initialRotationsRef.current = objectsFound.map(obj => obj.rotation?.y || 0);

      console.log(`✨ Found ${objectsFound.length} Spline object(s) for scroll animation`);

      // Use GSAP ScrollTrigger for consistent scroll tracking
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1, // Smooth interpolation
        onUpdate: (self) => {
          objectsToRotateRef.current.forEach((obj, index) => {
            if (obj?.rotation) {
              const initialY = initialRotationsRef.current[index] || 0;
              obj.rotation.y = initialY + (self.progress * Math.PI);
            }
          });
        }
      });
    }, 500); // Wait 500ms for Spline to fully load

    // Handle resize for zoom adjustment
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      try {
        splineApp.setZoom(isMobile ? 0.6 : 1);
      } catch (e) {
        // Zoom not available
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(setupTimer);
      window.removeEventListener('resize', handleResize);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
      setupAttemptedRef.current = false;
    };
  }, [splineApp]);
}
