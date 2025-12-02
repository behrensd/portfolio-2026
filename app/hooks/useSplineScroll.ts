import { useEffect } from 'react';
import { Application } from '@splinetool/runtime';

export function useSplineScroll(splineRef: React.MutableRefObject<Application | null>, isLoaded: boolean) {
  useEffect(() => {
    if (!isLoaded || !splineRef.current) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollProgress = Math.min(scrollY / maxScroll, 1);

      // Try to find the Scene object to rotate
      const scene = splineRef.current?.findObjectByName('Scene');
      
      if (scene) {
        scene.rotation.y = scrollProgress * Math.PI; 
      }
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

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    handleResize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoaded]); // Re-run when loaded
}
