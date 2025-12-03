'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import frameData from '../data/frame-urls.json';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface MobileFrameSequenceProps {
  className?: string;
}

// Configuration for progressive loading - optimized for smooth scrolling
const SEGMENT_SIZE = 15; // Load 15 frames at a time
const LOOKAHEAD_SEGMENTS = 3; // Preload 3 segments ahead for smoother playback
const LOOP_COUNT = 5; // Number of times to loop through frames during full scroll

/**
 * Progressive Image Loader
 * Loads frames on-demand in segments to avoid heavy initial data load
 */
class ProgressiveImageLoader {
  private images: (HTMLImageElement | null)[];
  private loadedSegments: Set<number>;
  private urls: string[];
  private onSegmentLoaded?: (segment: number) => void;

  constructor(urls: string[], onSegmentLoaded?: (segment: number) => void) {
    this.urls = urls;
    this.images = new Array(urls.length).fill(null);
    this.loadedSegments = new Set();
    this.onSegmentLoaded = onSegmentLoaded;
  }

  getSegmentForFrame(frameIndex: number): number {
    return Math.floor(frameIndex / SEGMENT_SIZE);
  }

  isFrameLoaded(frameIndex: number): boolean {
    return this.images[frameIndex]?.complete ?? false;
  }

  getImage(frameIndex: number): HTMLImageElement | null {
    return this.images[frameIndex];
  }

  // Find nearest loaded frame (for smooth fallback when frame not yet loaded)
  getNearestLoadedFrame(frameIndex: number): number {
    if (this.isFrameLoaded(frameIndex)) return frameIndex;
    
    // Search nearby frames
    for (let offset = 1; offset < 10; offset++) {
      if (frameIndex - offset >= 0 && this.isFrameLoaded(frameIndex - offset)) {
        return frameIndex - offset;
      }
      if (frameIndex + offset < this.urls.length && this.isFrameLoaded(frameIndex + offset)) {
        return frameIndex + offset;
      }
    }
    return 0; // Fallback to first frame
  }

  async loadSegment(segmentIndex: number): Promise<void> {
    if (this.loadedSegments.has(segmentIndex)) return;
    
    this.loadedSegments.add(segmentIndex);
    
    const startFrame = segmentIndex * SEGMENT_SIZE;
    const endFrame = Math.min(startFrame + SEGMENT_SIZE, this.urls.length);
    
    const loadPromises: Promise<void>[] = [];
    
    for (let i = startFrame; i < endFrame; i++) {
      if (!this.images[i]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        // Hint browser to decode images ahead of time
        img.decoding = 'async';
        this.images[i] = img;
        
        loadPromises.push(
          new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = this.urls[i];
          })
        );
      }
    }
    
    await Promise.all(loadPromises);
    this.onSegmentLoaded?.(segmentIndex);
  }

  loadSegmentsForFrame(frameIndex: number): void {
    const currentSegment = this.getSegmentForFrame(frameIndex);
    const totalSegments = Math.ceil(this.urls.length / SEGMENT_SIZE);
    
    // Load current and nearby segments (non-blocking)
    for (let i = 0; i <= LOOKAHEAD_SEGMENTS; i++) {
      const segment = currentSegment + i;
      if (segment < totalSegments) {
        this.loadSegment(segment);
      }
      const behindSegment = currentSegment - i;
      if (behindSegment >= 0) {
        this.loadSegment(behindSegment);
      }
    }
  }

  async loadInitialFrames(): Promise<void> {
    // Load first three segments for smooth start with faster animation
    await this.loadSegment(0);
    await this.loadSegment(1);
    this.loadSegment(2); // Start loading third segment non-blocking
  }

  // Preload all frames in background for seamless looping
  preloadAllFrames(): void {
    const totalSegments = Math.ceil(this.urls.length / SEGMENT_SIZE);
    for (let i = 0; i < totalSegments; i++) {
      this.loadSegment(i);
    }
  }
}

export default function MobileFrameSequence({
  className = '',
}: MobileFrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const loaderRef = useRef<ProgressiveImageLoader | null>(null);
  const lastDrawnFrameRef = useRef<number>(-1);
  const initialDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingFrameRef = useRef<number>(0);

  // Optimized draw function with RAF batching
  const drawFrame = useCallback((frameIndex: number, canvas: HTMLCanvasElement, force = false) => {
    const loader = loaderRef.current;
    if (!loader) return;
    
    // Skip if same frame already drawn (unless forced)
    if (!force && frameIndex === lastDrawnFrameRef.current) return;
    
    // Get actual frame to draw (nearest loaded if target not ready)
    const actualFrame = loader.isFrameLoaded(frameIndex) 
      ? frameIndex 
      : loader.getNearestLoadedFrame(frameIndex);
    
    const img = loader.getImage(actualFrame);
    if (!img?.complete || !img.naturalWidth) return;
    
    // Get optimized 2D context (no alpha for better performance)
    const ctx = canvas.getContext('2d', { 
      alpha: false,
      desynchronized: true // Allows canvas to update independently of DOM
    });
    if (!ctx) return;
    
    // Calculate scaling to cover canvas
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgRatio > canvasRatio) {
      drawHeight = canvas.height;
      drawWidth = img.naturalWidth * (canvas.height / img.naturalHeight);
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = canvas.width;
      drawHeight = img.naturalHeight * (canvas.width / img.naturalWidth);
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    }
    
    // Draw with black background (faster than clearRect + draw)
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    
    lastDrawnFrameRef.current = actualFrame;
  }, []);

  // RAF-based drawing for smooth updates
  const scheduleDrawFrame = useCallback((frameIndex: number, canvas: HTMLCanvasElement) => {
    pendingFrameRef.current = frameIndex;
    
    if (rafIdRef.current !== null) return; // Already scheduled
    
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      drawFrame(pendingFrameRef.current, canvas);
    });
  }, [drawFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize canvas with optimized size
    const initializeCanvasSize = () => {
      const width = window.innerWidth;
      // Use stable height calculation
      const height = Math.max(window.innerHeight, window.screen.availHeight * 0.85);
      
      canvas.width = width;
      canvas.height = height;
      initialDimensionsRef.current = { width, height };
    };
    
    initializeCanvasSize();

    // Only resize on orientation change
    const handleResize = () => {
      if (!initialDimensionsRef.current) return;
      
      const newWidth = window.innerWidth;
      const widthChanged = Math.abs(newWidth - initialDimensionsRef.current.width) > 50;
      
      if (widthChanged) {
        const newHeight = Math.max(window.innerHeight, window.screen.availHeight * 0.85);
        canvas.width = newWidth;
        canvas.height = newHeight;
        initialDimensionsRef.current = { width: newWidth, height: newHeight };
        
        if (loaderRef.current) {
          drawFrame(lastDrawnFrameRef.current, canvas, true);
        }
      }
    };
    
    const handleOrientation = () => {
      // Multiple redraws to handle Safari's delayed viewport updates
      const redraw = () => {
        const width = window.innerWidth;
        const height = Math.max(window.innerHeight, window.screen.availHeight * 0.85);
        canvas.width = width;
        canvas.height = height;
        initialDimensionsRef.current = { width, height };
        if (loaderRef.current && lastDrawnFrameRef.current >= 0) {
          drawFrame(lastDrawnFrameRef.current, canvas, true);
        }
      };
      
      // Safari needs multiple attempts as viewport size settles after rotation
      setTimeout(redraw, 100);
      setTimeout(redraw, 300);
      setTimeout(redraw, 500);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientation);

    // Build frame URLs - loops through frames multiple times for smoother animation
    const urls = frameData.frames.map(f => f.url);
    const totalFrames = urls.length;

    // Initialize loader
    loaderRef.current = new ProgressiveImageLoader(urls);

    const loader = loaderRef.current;
    const playhead = { frame: 0 };

    // Start animation after initial load
    loader.loadInitialFrames().then(() => {
      setIsLoaded(true);
      drawFrame(0, canvas, true);
      
      // Start preloading all frames in background for seamless looping
      loader.preloadAllFrames();

      // Animate through all frames LOOP_COUNT times with boomerang/ping-pong effect
      // Each cycle: forward (0→130) + reverse (129→1) = smooth bounce loop
      // This avoids jarring snap-back to frame 0
      const cycleLength = (totalFrames - 1) * 2; // One ping-pong cycle (forward + reverse)
      const totalAnimationFrames = cycleLength * LOOP_COUNT;
      
      tweenRef.current = gsap.to(playhead, {
        frame: totalAnimationFrames,
        ease: 'none',
        onUpdate: () => {
          const rawFrame = Math.round(playhead.frame);
          
          // Calculate position within current ping-pong cycle
          const positionInCycle = rawFrame % cycleLength;
          
          // Boomerang logic: forward then reverse
          let frameIndex;
          if (positionInCycle <= totalFrames - 1) {
            // Forward half: 0 → 130
            frameIndex = positionInCycle;
          } else {
            // Reverse half: 129 → 1 (bounce back, skipping endpoints)
            frameIndex = cycleLength - positionInCycle;
          }
          
          // Preload nearby segments (accounting for both directions)
          loader.loadSegmentsForFrame(frameIndex);
          
          // Preload frames in both directions for smooth playback
          if (frameIndex < 20) {
            loader.loadSegmentsForFrame(0);
          }
          if (frameIndex > totalFrames - 20) {
            loader.loadSegmentsForFrame(totalFrames - 1);
          }
          
          // Schedule frame draw via RAF for smooth rendering
          scheduleDrawFrame(frameIndex, canvas);
        },
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3, // Faster response for buttery smooth scrolling with multiple loops
        },
      });
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientation);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (tweenRef.current) {
        tweenRef.current.kill();
      }
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === document.body) {
          st.kill();
        }
      });
    };
  }, [drawFrame, scheduleDrawFrame]);

  return (
    <div
      ref={containerRef}
      className={`frame-sequence-container ${className} ${isLoaded ? 'loaded' : ''}`}
    >
      <canvas
        ref={canvasRef}
        className="frame-sequence-canvas"
      />
      {!isLoaded && (
        <div className="frame-loading-indicator">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  );
}
