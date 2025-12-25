'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface MobileVideoBackgroundProps {
  className?: string;
}

// Video URL from Vercel Blob
const VIDEO_URL = 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/videos/mobile-background.mp4';

// Reverse playback speed (0.5 = half speed for smoother seeking)
const REVERSE_SPEED = 1;
// Update interval for reverse (ms) - less frequent = smoother on mobile
const REVERSE_UPDATE_INTERVAL = 25; // ~40fps for reverse

/**
 * MobileVideoBackground Component
 * 
 * Seamless boomerang video background for mobile devices.
 * - Forward: Uses native video.play() for smooth playback
 * - Reverse: Uses throttled currentTime updates at slower speed
 * 
 * iOS Safari Notes:
 * - Native reverse playback not supported
 * - Manual reverse is throttled for smoother performance
 */
export default function MobileFrameSequence({
  className = '',
}: MobileVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isReversingRef = useRef(false);
  const reverseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop reverse playback (declared first so startReverse can reference it)
  const stopReverse = useCallback(() => {
    isReversingRef.current = false;
    if (reverseIntervalRef.current) {
      clearInterval(reverseIntervalRef.current);
      reverseIntervalRef.current = null;
    }
  }, []);

  // Start reverse playback
  const startReverse = useCallback(() => {
    const video = videoRef.current;
    if (!video || isReversingRef.current) return;

    isReversingRef.current = true;
    video.pause();

    // Use setInterval for more consistent timing than RAF
    reverseIntervalRef.current = setInterval(() => {
      if (!isReversingRef.current) return;

      const step = (REVERSE_UPDATE_INTERVAL / 1000) * REVERSE_SPEED;
      const newTime = video.currentTime - step;

      if (newTime <= 0) {
        // Reached start, switch to forward
        video.currentTime = 0;
        stopReverse();
        video.play().catch(() => {});
      } else {
        video.currentTime = newTime;
      }
    }, REVERSE_UPDATE_INTERVAL);
  }, [stopReverse]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Handle errors
    const handleError = () => {
      setHasError(true);
    };

    // Handle video ending - start reverse
    const handleEnded = () => {
      startReverse();
    };

    // Handle timeupdate to catch near-end (backup for ended event)
    const handleTimeUpdate = () => {
      if (!isReversingRef.current && video.duration && video.currentTime >= video.duration - 0.1) {
        video.pause();
        startReverse();
      }
    };

    // Handle when video is ready
    const handleCanPlay = () => {
      setIsLoaded(true);

      // Start playing forward
      video.play().then(() => {
        // Video playing forward
      }).catch((err) => {
        // Auto-play blocked, try to play on first touch
        const playOnTouch = () => {
          video.play().catch(() => {});
          document.removeEventListener('touchstart', playOnTouch);
        };
        document.addEventListener('touchstart', playOnTouch, { once: true });
      });
    };

    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);

    // Force load
    video.load();

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      stopReverse();
    };
  }, [startReverse, stopReverse]);

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
          <span className="frame-loading-text">
            Video failed to load
          </span>
        </div>
      )}
    </div>
  );
}
