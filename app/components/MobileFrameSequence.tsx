'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import frameData from '../data/frame-urls.json';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface MobileFrameSequenceProps {
  className?: string;
}

/**
 * GSAP image sequence helper (from official GSAP docs)
 * Scrubs through a sequence of images based on scroll position
 */
function imageSequence(config: {
  urls: string[];
  canvas: HTMLCanvasElement;
  scrollTrigger: ScrollTrigger.Vars;
  onUpdate?: () => void;
}) {
  const playhead = { frame: 0 };
  const canvas = config.canvas;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return null;

  const images = config.urls.map((url) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Required for blob storage
    img.src = url;
    return img;
  });

  const updateImage = () => {
    const frame = Math.round(playhead.frame);
    if (images[frame]?.complete && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate scaling to cover the canvas while maintaining aspect ratio
      const img = images[frame];
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imgRatio > canvasRatio) {
        // Image is wider - fit to height, center horizontally
        drawHeight = canvas.height;
        drawWidth = img.naturalWidth * (canvas.height / img.naturalHeight);
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller - fit to width, center vertically
        drawWidth = canvas.width;
        drawHeight = img.naturalHeight * (canvas.width / img.naturalWidth);
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      }
      
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
    config.onUpdate?.();
  };

  // Wait for first image to load before drawing
  images[0].onload = updateImage;

  return gsap.to(playhead, {
    frame: images.length - 1,
    ease: 'none',
    onUpdate: updateImage,
    scrollTrigger: config.scrollTrigger,
  });
}

export default function MobileFrameSequence({
  className = '',
}: MobileFrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to match viewport
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Get frame URLs from blob storage
    const forwardUrls = frameData.frames.map(f => f.url);
    
    // Create ping-pong array: 1->N then N->1
    const reverseUrls = [...forwardUrls].reverse().slice(1); // Skip first to avoid duplicate
    const urls = [...forwardUrls, ...reverseUrls];

    // Preload first few frames for faster initial render
    const preloadCount = Math.min(10, forwardUrls.length);
    let loadedCount = 0;
    
    for (let i = 0; i < preloadCount; i++) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadedCount++;
        if (loadedCount >= preloadCount) {
          setIsLoaded(true);
        }
      };
      img.src = urls[i];
    }

    // Initialize the scroll-linked animation
    tweenRef.current = imageSequence({
      urls,
      canvas,
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5, // Smooth scrubbing
      },
    });

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (tweenRef.current) {
        tweenRef.current.kill();
      }
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === document.body) {
          st.kill();
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`frame-sequence-container ${className} ${isLoaded ? 'loaded' : ''}`}
    >
      <canvas
        ref={canvasRef}
        className="frame-sequence-canvas"
      />
    </div>
  );
}
