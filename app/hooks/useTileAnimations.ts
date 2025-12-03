'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function useTileAnimations() {
  // Store our ScrollTriggers to clean up only ours
  const triggersRef = useRef<ScrollTrigger[]>([]);
  const tweensRef = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Get all content tiles
      const tiles = gsap.utils.toArray<HTMLElement>('.content-tile');
      
      tiles.forEach((tile) => {
        const tween = gsap.to(tile, {
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
        tweensRef.current.push(tween);
        if (tween.scrollTrigger) triggersRef.current.push(tween.scrollTrigger);
      });
      
      // Animate skill items
      const skills = gsap.utils.toArray<HTMLElement>('.skill-item');
      skills.forEach((skill, index) => {
        const skillTween = gsap.from(skill, {
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
        tweensRef.current.push(skillTween);
        if (skillTween.scrollTrigger) triggersRef.current.push(skillTween.scrollTrigger);
      });
      
      console.log('✨ Tile animations initialized');
    }, 100);

    return () => {
      clearTimeout(timer);
      // Only kill our own ScrollTriggers and tweens
      triggersRef.current.forEach(t => t.kill());
      tweensRef.current.forEach(t => t.kill());
      triggersRef.current = [];
      tweensRef.current = [];
    };
  }, []);
}

