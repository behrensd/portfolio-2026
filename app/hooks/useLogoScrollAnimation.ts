'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

export function useLogoScrollAnimation() {
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
      const initialTop = (viewportHeight - initialSize) / 2 - 200; // Much higher up
      
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
      
      // Animate to corner - smooth and buttery
      gsap.to(logoLink, {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top+=50 top', // Start almost immediately
          end: '+=600', // Longer distance = smoother animation
          scrub: 0.5, // Much smoother response (lower = smoother)
        },
        left: finalLeft,
        top: finalTop,
        width: finalSize,
        height: finalSize,
        ease: 'power1.inOut' // Gentler easing
      });
      
      // Animate logo size
      gsap.to(logo, {
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
      
      // Smooth 360° rotation - extra smooth
      gsap.to(logo, {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top+=50 top',
          end: '+=600',
          scrub: 0.3 // Even smoother for rotation
        },
        rotation: 360,
        ease: 'none' // Linear for rotation looks best
      });
    };
    
    // Initialize after layout is ready
    const timer = setTimeout(setupAnimation, 100);
    
    console.log('✨ Logo scroll animation with fixed overlay initialized');
    
    return () => {
      clearTimeout(timer);
      logoLink.removeEventListener('click', handleClick);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
}

