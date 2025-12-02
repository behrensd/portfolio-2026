'use client';

import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Navigation from './components/Navigation';
import { useProjectAnimations } from './hooks/useProjectAnimations';
import { useDockNavigation } from './hooks/useDockNavigation';
import { useAnimeInteractions } from './hooks/useAnimeInteractions';

export default function Home() {
  // Initialize all animations and interactions
  useProjectAnimations();
  useDockNavigation();
  useAnimeInteractions();

  return (
    <>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <Navigation />
          <Hero />
          <About />
          <Projects />
          <Contact />
        </div>
      </div>
    </>
  );
}
