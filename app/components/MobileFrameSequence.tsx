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
 * Autoplaying looped video background for mobile devices.
 * 
 * iOS Safari Notes:
 * - Scroll-based video seeking is unreliable on iOS Safari
 * - Instead, we use simple autoplay + loop which works reliably
 * - Requires playsinline and muted attributes
 */
export default function MobileFrameSequence({
  className = '',
}: MobileVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('📹 Initializing mobile video background...');

    // Handle errors
    const handleError = () => {
      console.error('❌ Video error:', video.error);
      setHasError(true);
    };

    // Handle when video can play
    const handleCanPlay = () => {
      console.log('📹 Video can play');
      setIsLoaded(true);
      
      // Try to play the video
      video.play().then(() => {
        console.log('✅ Video playing');
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

    // Force load
    video.load();

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
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
        autoPlay
        loop
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
