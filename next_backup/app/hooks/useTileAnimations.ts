'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function useTileAnimations() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Get all content tiles
      const tiles = gsap.utils.toArray<HTMLElement>('.content-tile');
      
      tiles.forEach((tile) => {
        // Simple slide-in from bottom
        gsap.to(tile, {
          scrollTrigger: {
            trigger: tile,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1,
          },
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out'
        });
      });
      
      // Animate skill items
      const skills = gsap.utils.toArray<HTMLElement>('.skill-item');
      skills.forEach((skill, index) => {
        gsap.from(skill, {
          scrollTrigger: {
            trigger: skill,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: 30,
          duration: 0.6,
          ease: 'power2.out',
          delay: index * 0.15
        });
      });
      
      console.log('✨ Tile animations initialized');
    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
}

