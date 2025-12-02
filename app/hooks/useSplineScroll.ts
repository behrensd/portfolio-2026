'use client';

import { useEffect, useRef } from 'react';
import { Application } from '@splinetool/runtime';

export function useSplineScroll(splineRef: React.MutableRefObject<Application | null>, isLoaded: boolean) {
  const animationFrameRef = useRef<number | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (!isLoaded || !splineRef.current) return;

    // Try to find any rotatable object in the scene
    const findRotatableObject = () => {
      if (!splineRef.current) return null;
      
      // Try common object names
      const names = ['Scene', 'Group', 'Mesh', 'Object', 'MainGroup', 'Root'];
      for (const name of names) {
        const obj = splineRef.current.findObjectByName(name);
        if (obj) return obj;
      }
      
      // Fallback: try to access internal scene
      try {
        return (splineRef.current as any)._scene;
      } catch {
        return null;
      }
    };

    const targetObject = findRotatableObject();
    
    const updateSpline = () => {
      if (!splineRef.current) return;

      // Use document.documentElement.scrollTop for better iOS compatibility
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const viewportHeight = window.innerHeight;
      const maxScroll = docHeight - viewportHeight;
      const scrollProgress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;

      // Only update if scroll position changed (performance optimization)
      if (Math.abs(scrollY - lastScrollY.current) > 0.5) {
        lastScrollY.current = scrollY;
        
        if (targetObject && targetObject.rotation) {
          // Smooth rotation based on scroll
          targetObject.rotation.y = scrollProgress * Math.PI;
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateSpline);
    };

    const handleResize = () => {
      if (!splineRef.current) return;
      
      const isMobile = window.innerWidth < 768;
      
      // Adjust zoom based on device width
      try {
        if (isMobile) {
          splineRef.current.setZoom(0.6);
        } else {
          splineRef.current.setZoom(1);
        }
      } catch (e) {
        // setZoom might not be available in all Spline versions
        console.log('Spline setZoom not available');
      }
    };

    // Start the animation loop
    updateSpline();
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    handleResize();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoaded]);
}
