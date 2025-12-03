import { useEffect, useRef } from 'react';
import { Application } from '@splinetool/runtime';

export function useSplineScroll(splineRef: React.MutableRefObject<Application | null>, isLoaded: boolean) {
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoaded || !splineRef.current) return;

    const updateSpline = () => {
      if (!splineRef.current) return;

      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

      // Try to find the Scene object to rotate
      // Fallback to root object if 'Scene' not found
      const scene = 
        splineRef.current.findObjectByName('Scene') || 
        splineRef.current.findObjectByName('Group') ||
        (splineRef.current as any)._scene; 
      
      if (scene) {
        // Smoother rotation calculation
        scene.rotation.y = scrollProgress * Math.PI; 
      }

      animationFrameRef.current = requestAnimationFrame(updateSpline);
    };

    const handleResize = () => {
      if (!splineRef.current) return;
      
      const isMobile = window.innerWidth < 768;
      
      // Adjust zoom based on device width
      if (isMobile) {
        splineRef.current.setZoom(0.6); 
      } else {
        splineRef.current.setZoom(1);
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
  }, [isLoaded]); // Re-run when loaded
}
