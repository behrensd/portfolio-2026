'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface MobileVideoBackgroundProps {
  className?: string;
}

// Video URL from Vercel Blob
const VIDEO_URL = 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/videos/mobile-background.mp4';

// Number of times to loop through video during full page scroll
const LOOP_COUNT = 3;

/**
 * MobileVideoBackground Component
 * 
 * Scroll-linked video background for mobile devices.
 * - Video playback is synced to scroll position via GSAP ScrollTrigger
 * - Loops through the video LOOP_COUNT times during full page scroll
 * - Uses object-fit: cover for fullscreen coverage
 * - Hardware accelerated with position: fixed
 */
export default function MobileFrameSequence({
  className = '',
}: MobileVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Video must be loaded before we can control it
    const handleLoadedMetadata = () => {
      console.log('📹 Video metadata loaded, duration:', video.duration);
      setIsLoaded(true);
      
      // Set initial frame
      video.currentTime = 0;
      
      // Total animation time = video duration * loop count
      const totalDuration = video.duration * LOOP_COUNT;
      
      // Create a proxy object for GSAP to animate
      const playhead = { time: 0 };
      
      // Create ScrollTrigger to control video playback
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3, // Smooth scrubbing
        onUpdate: (self) => {
          // Calculate current time based on scroll progress
          // Loop the video by using modulo
          const targetTime = (self.progress * totalDuration) % video.duration;
          
          // Only update if time changed significantly (avoid micro-updates)
          if (Math.abs(video.currentTime - targetTime) > 0.02) {
            video.currentTime = targetTime;
          }
        },
      });
      
      console.log('✨ Mobile video background initialized');
    };

    // Handle video ready state
    if (video.readyState >= 1) {
      // Already loaded
      handleLoadedMetadata();
    } else {
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
    }

    // Ensure video can seek quickly
    video.preload = 'auto';

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`mobile-video-container ${className} ${isLoaded ? 'loaded' : ''}`}
    >
      <video
        ref={videoRef}
        className="mobile-video-background"
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        // Don't autoplay - we control playback via scroll
      />
      {!isLoaded && (
        <div className="frame-loading-indicator">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  );
}
