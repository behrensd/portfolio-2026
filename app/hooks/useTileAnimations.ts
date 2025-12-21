'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createOptimizedScrollTrigger } from '../utils/scrollTriggerConfig';
import { detectViewport, getAnimationDelay, getAnimationDuration } from '../utils/viewportConfig';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function useTileAnimations() {
  // Store our ScrollTriggers to clean up only ours
  const triggersRef = useRef<ScrollTrigger[]>([]);
  const tweensRef = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    const viewport = detectViewport();

    // Respect user's motion preferences
    if (viewport.shouldUseReducedAnimations) {
      console.log('⚠️ Reduced motion preferred - skipping tile animations');
      // Set elements to visible immediately
      const tiles = gsap.utils.toArray<HTMLElement>('.content-tile, .skill-item');
      tiles.forEach(tile => {
        gsap.set(tile, { opacity: 1, y: 0 });
      });
      return;
    }

    const delay = getAnimationDelay(viewport);
    const duration = getAnimationDuration(viewport, 1);

    const timer = setTimeout(() => {
      // Get all content tiles
      const tiles = gsap.utils.toArray<HTMLElement>('.content-tile');

      if (tiles.length === 0) {
        console.warn('⚠️ No .content-tile elements found');
        return;
      }

      console.log(`✨ Found ${tiles.length} content tiles to animate on ${viewport.breakpoint}`);

      tiles.forEach((tile, index) => {
        const tween = gsap.fromTo(tile,
          // FROM state (explicit initial)
          { opacity: 0, y: viewport.isMobile ? 20 : 30 },
          // TO state
          {
            opacity: 1,
            y: 0,
            duration: duration,
            ease: 'power2.out',
            scrollTrigger: createOptimizedScrollTrigger(
              tile,
              {
                toggleActions: 'play none none none',  // Stay visible after first animation
                onEnter: () => {
                  console.log(`📍 Tile ${index + 1} entered viewport`);
                }
              },
              'content-reveal'
            )
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
          scrollTrigger: createOptimizedScrollTrigger(
            skill,
            {
              toggleActions: 'play none none none',
            },
            'content-reveal'
          ),
          opacity: 0,
          y: viewport.isMobile ? 20 : 30,
          duration: getAnimationDuration(viewport, 0.6),
          ease: 'power2.out',
          delay: index * 0.15
        });
        tweensRef.current.push(skillTween);
        if (skillTween.scrollTrigger) triggersRef.current.push(skillTween.scrollTrigger);
      });

      console.log('✨ Tile animations initialized');
    }, delay);

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

