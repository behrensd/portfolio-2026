'use client';

import { useEffect } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Navigation from './components/Navigation';
import { useProjectAnimations } from './hooks/useProjectAnimations';
import { useTileAnimations } from './hooks/useTileAnimations';
import { useDockNavigation } from './hooks/useDockNavigation';
import { useAnimeInteractions } from './hooks/useAnimeInteractions';
import { useSafariScrollFix } from './hooks/useSafariScrollFix';
import { initScrollTrigger } from './utils/scrollTriggerConfig';

export default function Home() {
  // Initialize ScrollTrigger with cross-browser optimizations - FIRST
  useEffect(() => {
    initScrollTrigger();
  }, []);

  // Safari mobile scroll fix - must be second
  useSafariScrollFix();

  // Initialize all animations and interactions
  useTileAnimations();
  useProjectAnimations();
  useDockNavigation();
  useAnimeInteractions();

  return (
    <>
      {/* Navigation MUST be outside smooth-wrapper to maintain true position:fixed behavior */}
      {/* If inside a transformed container, fixed elements become relative to that container */}
      <Navigation />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <Hero />
          <About />
          <Projects />
          <Contact />
        </div>
      </div>
    </>
  );
}
