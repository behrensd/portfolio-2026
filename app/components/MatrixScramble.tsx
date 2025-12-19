'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface MatrixScrambleProps {
    children: ReactNode;
    className?: string;
    intensity?: number; // 0-1, controls how often characters scramble
    speed?: number; // milliseconds between scrambles
}

const MATRIX_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

export default function MatrixScramble({ 
    children,
    className = '', 
    intensity = 0.15, // Subtle by default
    speed = 3000 
}: MatrixScrambleProps) {
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const originalText = container.textContent || '';
        if (!originalText) return;

        // Split text into characters
        const chars = originalText.split('');
        const spans: HTMLElement[] = [];

        // Create spans for each character
        container.textContent = '';
        chars.forEach((char) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block';
            span.setAttribute('data-original', char);
            container.appendChild(span);
            spans.push(span);
        });

        let scrambleInterval: NodeJS.Timeout;

        const scramble = () => {
            // Randomly scramble some characters based on intensity
            spans.forEach((span) => {
                if (Math.random() < intensity) {
                    const randomChar = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
                    span.textContent = randomChar;
                    span.style.opacity = '0.7';
                } else {
                    // Restore original character
                    const original = span.getAttribute('data-original');
                    if (original) {
                        span.textContent = original;
                        span.style.opacity = '1';
                    }
                }
            });
        };

        // Start scrambling after a short delay
        const startDelay = setTimeout(() => {
            scrambleInterval = setInterval(scramble, speed);
        }, 1000);

        // Cleanup
        return () => {
            clearTimeout(startDelay);
            clearInterval(scrambleInterval);
        };
    }, [intensity, speed]);

    return (
        <span 
            ref={containerRef}
            className={`matrix-scramble ${className}`}
            style={{
                display: 'inline-block',
            }}
        >
            {children}
        </span>
    );
}

