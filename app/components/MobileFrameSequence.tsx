'use client';

import { useRef, useEffect, useState } from 'react';

interface MobileVideoBackgroundProps {
  className?: string;
}

// Boomerang video (forward + reverse baked in) from Vercel Blob
const VIDEO_URL = 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/videos/mobile-boomerang.mp4';

/**
 * MobileVideoBackground Component
 *
 * Lightweight video background for mobile devices.
 * Uses native <video> loop for smooth, battery-efficient playback.
 * Boomerang effect is baked into the video file itself.
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

    const handleError = () => setHasError(true);
    const handleCanPlay = () => {
      setIsLoaded(true);
      // Attempt autoplay (works with muted on iOS)
      video.play().catch(() => {
        // Autoplay blocked - play on first touch
        const playOnTouch = () => {
          video.play().catch(() => {});
          document.removeEventListener('touchstart', playOnTouch);
        };
        document.addEventListener('touchstart', playOnTouch, { once: true });
      });
    };

    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);

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
        muted
        loop
        playsInline
        preload="auto"
      />
      {!isLoaded && !hasError && (
        <div className="frame-loading-indicator">
          <div className="loading-spinner" />
        </div>
      )}
      {hasError && (
        <div className="frame-loading-indicator">
          <span className="frame-loading-text">
            Video failed to load
          </span>
        </div>
      )}
    </div>
  );
}
