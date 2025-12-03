'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

export function useLogoScrollAnimation() {
  // Store our ScrollTriggers to clean up only ours
  const triggersRef = useRef<ScrollTrigger[]>([]);
  const tweensRef = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    const logoLink = document.getElementById('bai-logo-link');
    const logo = document.getElementById('bai-logo');
    const heroSection = document.getElementById('hero');
    
    if (!logoLink || !logo || !heroSection) return;
    
    // Add click handler for smooth scroll to top
    const handleClick = (e: Event) => {
      e.preventDefault();
      gsap.to(window, {
        duration: 1,
        scrollTo: {
          y: '#hero',
          offsetY: 0
        },
        ease: 'power2.inOut'
      });
    };
    
    logoLink.addEventListener('click', handleClick);
    
    // Calculate initial centered position in viewport
    const setupAnimation = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Initial size and position (higher in viewport, well above text)
      const initialSize = Math.min(200, viewportWidth * 0.2);
      const initialLeft = (viewportWidth - initialSize) / 2;
      const initialTop = (viewportHeight - initialSize) / 2 - 200;
      
      // Final position (top left corner)
      const finalSize = 60;
      const finalLeft = 30;
      const finalTop = 30;
      
      // Set initial position
      gsap.set(logoLink, {
        left: initialLeft,
        top: initialTop,
        width: initialSize,
        height: initialSize
      });
      
      gsap.set(logo, {
        width: initialSize,
        height: initialSize
      });
      
      // Animate to corner
      const linkTween = gsap.to(logoLink, {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top+=50 top',
          end: '+=600',
          scrub: 0.5,
        },
        left: finalLeft,
        top: finalTop,
        width: finalSize,
        height: finalSize,
        ease: 'power1.inOut'
      });
      tweensRef.current.push(linkTween);
      if (linkTween.scrollTrigger) triggersRef.current.push(linkTween.scrollTrigger);
      
      // Animate logo size
      const sizeTween = gsap.to(logo, {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top+=50 top',
          end: '+=600',
          scrub: 0.5
        },
        width: finalSize,
        height: finalSize,
        ease: 'power1.inOut'
      });
      tweensRef.current.push(sizeTween);
      if (sizeTween.scrollTrigger) triggersRef.current.push(sizeTween.scrollTrigger);
      
      // Smooth 360° rotation
      const rotateTween = gsap.to(logo, {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top+=50 top',
          end: '+=600',
          scrub: 0.3
        },
        rotation: 360,
        ease: 'none'
      });
      tweensRef.current.push(rotateTween);
      if (rotateTween.scrollTrigger) triggersRef.current.push(rotateTween.scrollTrigger);
    };
    
    // Initialize after layout is ready
    const timer = setTimeout(setupAnimation, 100);
    
    console.log('✨ Logo scroll animation initialized');
    
    return () => {
      clearTimeout(timer);
      logoLink.removeEventListener('click', handleClick);
      // Only kill our own ScrollTriggers and tweens
      triggersRef.current.forEach(t => t.kill());
      tweensRef.current.forEach(t => t.kill());
      triggersRef.current = [];
      tweensRef.current = [];
    };
  }, []);
}

