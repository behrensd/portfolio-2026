'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface MobileVideoBackgroundProps {
  className?: string;
}

// Video URL from Vercel Blob
const VIDEO_URL = 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/videos/mobile-background.mp4';

// Reverse playback speed (frames per second equivalent)
const REVERSE_SPEED = 30; // ~30fps reverse playback

/**
 * MobileVideoBackground Component
 * 
 * Autoplaying video background with boomerang effect.
 * Video plays forward, then reverses, creating a seamless loop.
 * 
 * iOS Safari Notes:
 * - Native reverse playback (negative playbackRate) not supported
 * - We manually decrement currentTime using requestAnimationFrame
 */
export default function MobileFrameSequence({
  className = '',
}: MobileVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isReversingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Reverse playback using requestAnimationFrame
  const playReverse = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const step = (timestamp: number) => {
      if (!isReversingRef.current) return;

      // Calculate time delta
      const delta = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = timestamp;

      // Decrement video time (reverse at ~1x speed)
      const newTime = video.currentTime - delta;

      if (newTime <= 0) {
        // Reached start, switch to forward playback
        video.currentTime = 0;
        isReversingRef.current = false;
        lastTimeRef.current = 0;
        video.play().catch(() => {});
        console.log('🔄 Boomerang: Forward');
      } else {
        video.currentTime = newTime;
        rafIdRef.current = requestAnimationFrame(step);
      }
    };

    rafIdRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('📹 Initializing mobile video with boomerang effect...');

    // Handle errors
    const handleError = () => {
      console.error('❌ Video error:', video.error);
      setHasError(true);
    };

    // Handle video ending (start reverse)
    const handleEnded = () => {
      console.log('🔄 Boomerang: Reverse');
      isReversingRef.current = true;
      lastTimeRef.current = 0;
      playReverse();
    };

    // Handle when video can play
    const handleCanPlay = () => {
      console.log('📹 Video can play');
      setIsLoaded(true);
      
      // Try to play the video
      video.play().then(() => {
        console.log('✅ Video playing forward');
      }).catch((err) => {
        console.log('⚠️ Auto-play blocked, will play on interaction:', err.message);
        // Try to play on first touch/scroll
        const playOnInteraction = () => {
          video.play().catch(() => {});
          document.removeEventListener('touchstart', playOnInteraction);
          document.removeEventListener('scroll', playOnInteraction);
        };
        document.addEventListener('touchstart', playOnInteraction, { once: true });
        document.addEventListener('scroll', playOnInteraction, { once: true });
      });
    };

    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);

    // Force load
    video.load();

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      isReversingRef.current = false;
    };
  }, [playReverse]);

  return (
    <div
      ref={containerRef}
      className={`mobile-video-container ${className} ${isLoaded ? 'loaded' : ''}`}
    >
      <video
        ref={videoRef}
        className="mobile-video-background"
        src={VIDEO_URL}
        autoPlay
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        // No loop - we handle boomerang manually
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
