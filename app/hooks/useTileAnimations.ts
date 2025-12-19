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
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      console.log('⚠️ Reduced motion preferred - skipping tile animations');
      return;
    }

    const timer = setTimeout(() => {
      // Get all content tiles
      const tiles = gsap.utils.toArray<HTMLElement>('.content-tile');

      if (tiles.length === 0) {
        console.warn('⚠️ No .content-tile elements found');
        return;
      }

      console.log(`✨ Found ${tiles.length} content tiles to animate`);

      tiles.forEach((tile, index) => {
        const tween = gsap.fromTo(tile,
          // FROM state (explicit initial)
          { opacity: 0, y: 30 },
          // TO state
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: tile,
              start: 'top 90%',  // Earlier trigger (was 80%)
              toggleActions: 'play none none reverse',  // Reverse on scroll back
              invalidateOnRefresh: false, // Layout is stable
              refreshPriority: 1, // Batch with other content tiles
              onEnter: () => {
                console.log(`📍 Tile ${index + 1} entered viewport - animating`);
              }
            }
          }
        );
        tweensRef.current.push(tween);
        if (tween.scrollTrigger) triggersRef.current.push(tween.scrollTrigger);
      });
      
      // Animate skill items
      const skills = gsap.utils.toArray<HTMLElement>('.skill-item');

      if (skills.length === 0) {
        console.warn('⚠️ No .skill-item elements found');
      } else {
        console.log(`✨ Found ${skills.length} skill items to animate`);
      }

      skills.forEach((skill, index) => {
        const skillTween = gsap.from(skill, {
          scrollTrigger: {
            trigger: skill,
            start: 'top 85%',
            toggleActions: 'play none none none',
            invalidateOnRefresh: false, // Layout is stable
            refreshPriority: 1 // Batch with other content
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

