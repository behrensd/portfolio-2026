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
 * 
 * UPDATE: Added robust retry logic for finding Spline objects on mobile.
 * Previously, mobile devices might have initialized too quickly, failing to find
 * individual cubes and falling back to rotating the entire scene (which looked choppy).
 * Now we explicitly wait and retry until we find the specific objects we want to animate.
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
    let attempts = 0;
    const maxAttempts = isMobile ? 10 : 5; // Try harder on mobile
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

      // If we haven't found specific cubes yet, and we have retries left, wait and try again.
      // We DO NOT want to fall back to the container immediately on mobile, as that causes the "choppy spinning" issue.
      if (objectsFound.length === 0 && attempts < maxAttempts) {
        console.log(`🔄 Spline objects not found, retrying... (${attempts + 1}/${maxAttempts})`);
        attempts++;
        setTimeout(initAnimation, retryDelay);
        return;
      }

      // Method 2: Fallback to common container names ONLY if we exhausted retries
      if (objectsFound.length === 0) {
        console.log('⚠️ Could not find individual cubes, falling back to container rotation.');
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
        scrub: 1.5, // Increased scrub time slightly for smoother feel on mobile
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

    // Start the initialization process
    // We add a small initial delay to give the runtime a breathing room
    setTimeout(initAnimation, isMobile ? 100 : 500);

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
