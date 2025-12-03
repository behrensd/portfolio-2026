import { useEffect, useRef, useCallback } from 'react';
import { Application } from '@splinetool/runtime';

export function useSplineScroll(splineApp: Application | null) {
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Smooth lerp function for rotation
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  // Animation loop for smooth rotation interpolation
  const animateRotation = useCallback(() => {
    if (!splineApp) return;

    // Smoothly interpolate current rotation towards target
    currentRotation.current = lerp(currentRotation.current, targetRotation.current, 0.08);

    // Find the scene object to rotate
    const scene = 
      splineApp.findObjectByName('Scene') || 
      splineApp.findObjectByName('Group') ||
      (splineApp as any)._scene;

    if (scene) {
      scene.rotation.y = currentRotation.current;
    }

    // Continue animating if not close enough to target
    if (Math.abs(currentRotation.current - targetRotation.current) > 0.001) {
      animationFrameRef.current = requestAnimationFrame(animateRotation);
    } else {
      animationFrameRef.current = null;
    }
  }, [splineApp]);

  useEffect(() => {
    if (!splineApp) return;

    const handleScroll = () => {
      lastScrollY.current = window.scrollY;

      if (!ticking.current) {
        // Use requestAnimationFrame for scroll calculation
        requestAnimationFrame(() => {
          const scrollY = lastScrollY.current;
          const maxScroll = document.body.scrollHeight - window.innerHeight;
          const scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

          // Set target rotation based on scroll progress
          targetRotation.current = scrollProgress * Math.PI;

          // Start animation loop if not already running
          if (!animationFrameRef.current) {
            animationFrameRef.current = requestAnimationFrame(animateRotation);
          }

          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      
      try {
        if (isMobile) {
          splineApp.setZoom(0.6);
        } else {
          splineApp.setZoom(1);
        }
      } catch (e) {
        // Zoom not available on this scene
      }
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    handleResize();
    handleScroll(); // Trigger initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [splineApp, animateRotation]);
}
