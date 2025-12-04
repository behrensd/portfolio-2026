'use client';

import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Navigation from './components/Navigation';
import { useProjectAnimations } from './hooks/useProjectAnimations';
import { useDockNavigation } from './hooks/useDockNavigation';
import { useAnimeInteractions } from './hooks/useAnimeInteractions';
import { useSafariScrollFix } from './hooks/useSafariScrollFix';
import { useAvatarScrollAnimation } from './hooks/useAvatarScrollAnimation';

export default function Home() {
  // Safari mobile scroll fix - must be first
  useSafariScrollFix();

  // Initialize all animations and interactions
  useProjectAnimations();
  useDockNavigation();
  useAnimeInteractions();
  useAvatarScrollAnimation();

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
