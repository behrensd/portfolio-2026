'use client';

import { useRef, useEffect, useState } from 'react';

interface MobileVideoBackgroundProps {
  className?: string;
}

// Video URL from Vercel Blob
const VIDEO_URL = 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/videos/mobile-background.mp4';

/**
 * MobileVideoBackground Component
 * 
 * Seamless boomerang video background for mobile devices.
 * Uses a continuous RAF loop to control currentTime directly,
 * creating smooth forward/reverse playback without any pauses.
 * 
 * iOS Safari Notes:
 * - Native reverse playback (negative playbackRate) not supported
 * - We manually control currentTime using requestAnimationFrame
 * - Video is paused and we drive the playhead ourselves
 */
export default function MobileFrameSequence({
  className = '',
}: MobileVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const rafIdRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);
  const directionRef = useRef<1 | -1>(1); // 1 = forward, -1 = reverse
  const isRunningRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('📹 Initializing seamless boomerang video...');

    // Handle errors
    const handleError = () => {
      console.error('❌ Video error:', video.error);
      setHasError(true);
    };

    // Continuous animation loop - drives video playback in both directions
    const animate = (timestamp: number) => {
      if (!isRunningRef.current || !video.duration) {
        rafIdRef.current = requestAnimationFrame(animate);
        return;
      }

      // Calculate delta time
      const delta = lastTimestampRef.current ? (timestamp - lastTimestampRef.current) / 1000 : 0;
      lastTimestampRef.current = timestamp;

      // Update video time based on direction
      let newTime = video.currentTime + (delta * directionRef.current);

      // Handle boundaries - seamless direction switch
      if (newTime >= video.duration) {
        // Reached end, reverse
        newTime = video.duration - 0.001;
        directionRef.current = -1;
      } else if (newTime <= 0) {
        // Reached start, go forward
        newTime = 0.001;
        directionRef.current = 1;
      }

      // Update video time
      video.currentTime = newTime;

      // Continue loop
      rafIdRef.current = requestAnimationFrame(animate);
    };

    // Handle when video is ready
    const handleCanPlayThrough = () => {
      console.log('📹 Video ready, duration:', video.duration);
      setIsLoaded(true);

      // Pause the video - we'll control it manually
      video.pause();
      video.currentTime = 0;

      // Start the animation loop
      isRunningRef.current = true;
      directionRef.current = 1;
      lastTimestampRef.current = 0;
      rafIdRef.current = requestAnimationFrame(animate);

      console.log('✅ Seamless boomerang started');
    };

    // Start loading
    video.addEventListener('error', handleError);
    video.addEventListener('canplaythrough', handleCanPlayThrough);

    // Also try on loadeddata as fallback
    const handleLoadedData = () => {
      if (!isLoaded && video.readyState >= 3) {
        handleCanPlayThrough();
      }
    };
    video.addEventListener('loadeddata', handleLoadedData);

    // Force load
    video.load();

    // Fallback: if no canplaythrough after 3s, try anyway
    const fallbackTimeout = setTimeout(() => {
      if (!isLoaded && video.readyState >= 2) {
        console.log('📹 Fallback: starting with readyState', video.readyState);
        handleCanPlayThrough();
      }
    }, 3000);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('loadeddata', handleLoadedData);
      clearTimeout(fallbackTimeout);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      isRunningRef.current = false;
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
