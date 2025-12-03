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
 * 
 * iOS Safari Notes:
 * - Requires playsinline and muted attributes
 * - Video must be fully buffered before seeking works reliably
 * - Using play() then pause() helps iOS buffer the video
 */
export default function MobileFrameSequence({
  className = '',
}: MobileVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('📹 Initializing mobile video background...');

    // Handle errors
    const handleError = (e: Event) => {
      console.error('❌ Video error:', video.error);
      setHasError(true);
    };

    // Video must be loaded before we can control it
    const handleCanPlayThrough = () => {
      console.log('📹 Video can play through, duration:', video.duration);
      
      // iOS Safari: Need to play briefly to enable seeking
      const initializeForIOS = async () => {
        try {
          // Play briefly to buffer and enable seeking on iOS
          video.currentTime = 0;
          await video.play();
          video.pause();
          video.currentTime = 0;
          
          console.log('✅ Video initialized for iOS');
        } catch (err) {
          console.log('⚠️ Could not auto-play for init, will try on scroll');
        }
        
        setIsLoaded(true);
        
        // Total animation time = video duration * loop count
        const totalDuration = video.duration * LOOP_COUNT;
        
        // Create ScrollTrigger to control video playback
        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5, // Smooth scrubbing
          onUpdate: (self) => {
            if (!video.duration) return;
            
            // Calculate current time based on scroll progress
            // Loop the video by using modulo
            const targetTime = (self.progress * totalDuration) % video.duration;
            
            // Only update if time changed significantly (avoid micro-updates)
            if (Math.abs(video.currentTime - targetTime) > 0.03) {
              video.currentTime = targetTime;
            }
          },
        });
        
        console.log('✨ Mobile video background initialized');
      };
      
      initializeForIOS();
    };

    // Also handle loadeddata as fallback for iOS
    const handleLoadedData = () => {
      console.log('📹 Video data loaded, readyState:', video.readyState);
      // If canplaythrough hasn't fired yet but we have data, try to initialize
      if (!isLoaded && video.readyState >= 2) {
        handleCanPlayThrough();
      }
    };

    video.addEventListener('error', handleError);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('loadeddata', handleLoadedData);

    // Force load on iOS
    video.load();

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('loadeddata', handleLoadedData);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, [isLoaded]);

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
        crossOrigin="anonymous"
        // Webkit specific attribute for older iOS Safari
      />
      {!isLoaded && !hasError && (
        <div className="frame-loading-indicator">
          <div className="loading-spinner" />
        </div>
      )}
      {hasError && (
        <div className="frame-loading-indicator">
          <span style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem' }}>
            Video failed to load
          </span>
        </div>
      )}
    </div>
  );
}
