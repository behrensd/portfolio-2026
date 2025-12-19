'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Matrix-style characters pool (alphanumeric + symbols)
const MATRIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()[]{}|;:,.<>?/\\';

interface MatrixChar {
    element: HTMLSpanElement;
    originalChar: string;
    isRevealed: boolean;
    lineType: 'bai' | 'solutions' | 'subtitle';
    scrambleCycles: number;
    maxScrambleCycles: number;
}

/**
 * Matrix-style scramble animation for hero text
 * Letters cycle through random characters until they reach the correct ones
 */
export function useHeroMatrixAnimation() {
    const animationRef = useRef<number | null>(null);
    const charsRef = useRef<MatrixChar[]>([]);
    const startTimeRef = useRef<number>(0);
    const lastUpdateTimeRef = useRef<number>(0);
    const isAnimatingRef = useRef(false);

    useEffect(() => {
        // Hide text initially to prevent flash
        const heroLines = document.querySelectorAll('.hero-line');
        const subtitle = document.querySelector('.hero-subtitle');
        
        // Set initial opacity to 0
        if (heroLines.length > 0) {
            heroLines.forEach(line => {
                (line as HTMLElement).style.opacity = '0';
            });
        }
        if (subtitle) {
            (subtitle as HTMLElement).style.opacity = '0';
        }
        
        // Start animation immediately
        const timer = setTimeout(() => {
            initMatrixAnimation();
        }, 50); // Minimal delay just for DOM readiness

        return () => {
            clearTimeout(timer);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    function initMatrixAnimation() {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;

        // Target elements: hero lines and subtitle
        const heroLines = document.querySelectorAll('.hero-line');
        const subtitle = document.querySelector('.hero-subtitle');

        if (heroLines.length === 0 && !subtitle) return;
        
        // Make elements visible now that we're starting animation
        heroLines.forEach(line => {
            (line as HTMLElement).style.opacity = '1';
        });
        if (subtitle) {
            (subtitle as HTMLElement).style.opacity = '1';
        }

        charsRef.current = [];
        startTimeRef.current = performance.now();

        // Process hero lines
        heroLines.forEach((line, lineIndex) => {
            const text = line.textContent || '';
            const isSolutions = line.classList.contains('hero-line-solutions');
            const isBai = !isSolutions && text === 'BAI';
            
            // Clear and split into characters
            line.textContent = '';
            const chars: MatrixChar[] = [];

            text.split('').forEach((char, charIndex) => {
                const span = document.createElement('span');
                span.textContent = getRandomChar();
                span.style.display = 'inline-block';
                span.style.color = getRandomMatrixColor(isSolutions);
                span.style.opacity = '1';
                
                // Preserve spaces
                if (char === ' ') {
                    span.textContent = '\u00A0';
                    span.style.width = '0.3em';
                }
                
                // Prevent wrapping for SOLUTIONS line
                if (isSolutions) {
                    span.style.whiteSpace = 'nowrap';
                }

                line.appendChild(span);

                // BAI gets 2-3 scramble cycles before revealing
                const maxCycles = isBai ? 3 : 1;
                const currentCycles = isBai ? Math.floor(Math.random() * 2) : 0; // Start at 0-1 cycles for BAI

                chars.push({
                    element: span,
                    originalChar: char,
                    isRevealed: false,
                    lineType: isBai ? 'bai' : isSolutions ? 'solutions' : 'subtitle',
                    scrambleCycles: currentCycles,
                    maxScrambleCycles: maxCycles
                });
            });

            charsRef.current.push(...chars);
        });

        // Process subtitle - preserve the non-breaking span structure
        if (subtitle) {
            // Get the full text including the name span
            const nameSpan = subtitle.querySelector('.hero-subtitle-name');
            const beforeNameText = nameSpan 
                ? Array.from(subtitle.childNodes)
                    .filter(node => node !== nameSpan && node.nodeType === Node.TEXT_NODE)
                    .map(node => node.textContent)
                    .join('')
                : '';
            const nameText = nameSpan?.textContent || '';
            const fullText = (beforeNameText + nameText).trim();
            
            // Clear subtitle
            subtitle.textContent = '';
            const chars: MatrixChar[] = [];
            
            // Find where "by " starts
            const byIndex = fullText.indexOf('by ');
            const beforeBy = fullText.substring(0, byIndex);
            const byAndName = fullText.substring(byIndex);

            // Process "Web design " part
            beforeBy.split('').forEach((char) => {
                const span = document.createElement('span');
                span.textContent = getRandomChar();
                span.style.display = 'inline-block';
                span.style.color = getRandomMatrixColor(false);
                span.style.opacity = '1';
                
                if (char === ' ') {
                    span.textContent = '\u00A0';
                    span.style.width = '0.3em';
                }

                subtitle.appendChild(span);

                chars.push({
                    element: span,
                    originalChar: char,
                    isRevealed: false,
                    lineType: 'subtitle',
                    scrambleCycles: 0,
                    maxScrambleCycles: 1
                });
            });

            // Create name container with non-breaking
            const nameContainer = document.createElement('span');
            nameContainer.className = 'hero-subtitle-name';
            nameContainer.style.whiteSpace = 'nowrap';
            subtitle.appendChild(nameContainer);

            // Process "by Dom Behrens" part inside the non-breaking container
            byAndName.split('').forEach((char) => {
                const span = document.createElement('span');
                span.textContent = getRandomChar();
                span.style.display = 'inline-block';
                span.style.color = getRandomMatrixColor(false);
                span.style.opacity = '1';
                
                if (char === ' ') {
                    span.textContent = '\u00A0';
                    span.style.width = '0.3em';
                }

                nameContainer.appendChild(span);

                chars.push({
                    element: span,
                    originalChar: char,
                    isRevealed: false,
                    lineType: 'subtitle',
                    scrambleCycles: 0,
                    maxScrambleCycles: 1
                });
            });

            charsRef.current.push(...chars);
        }

        // Start animation loop
        animateMatrix();
    }

    function getRandomChar(): string {
        return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
    }

    function getRandomMatrixColor(isSolutions: boolean): string {
        // Use only orange, black, and white during scramble
        const colors = ['#ff6b35', '#000000', '#ffffff'];
        
        if (isSolutions) {
            // For SOLUTIONS, prefer orange and white (less black)
            return colors[Math.random() > 0.3 ? (Math.random() > 0.5 ? 0 : 2) : 1];
        }
        // For other text (BAI, subtitle), use all three colors
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function animateMatrix() {
        const now = performance.now();
        const elapsed = now - startTimeRef.current;
        
        // Total animation duration: ~2.5 seconds
        const totalDuration = 2500;
        const revealDuration = 1800; // Time to reveal all characters
        const updateInterval = 30; // Update scramble every 30ms for smooth matrix effect
        
        if (elapsed < totalDuration) {
            // Update scrambling characters at regular intervals
            const shouldUpdateScramble = now - lastUpdateTimeRef.current >= updateInterval;
            
            charsRef.current.forEach((char, index) => {
                // For BAI, need to complete scramble cycles before revealing
                if (char.lineType === 'bai') {
                    // Update scramble cycles - each cycle is ~250ms
                    const cycleTime = 250;
                    const cyclesElapsed = Math.floor(elapsed / cycleTime);
                    if (cyclesElapsed > char.scrambleCycles) {
                        char.scrambleCycles = Math.min(cyclesElapsed, char.maxScrambleCycles);
                    }
                }
                
                // Calculate when this character should be revealed
                // BAI characters get delayed to allow for multiple scramble cycles
                const baiScrambleDelay = char.lineType === 'bai' ? (char.maxScrambleCycles * 250) : 0;
                const baseRevealTime = (index / charsRef.current.length) * revealDuration;
                const revealTime = baseRevealTime + baiScrambleDelay;
                
                // Only reveal if cycles are complete (for BAI) or normal timing (for others)
                const canReveal = char.lineType !== 'bai' || char.scrambleCycles >= char.maxScrambleCycles;
                
                if (elapsed >= revealTime && !char.isRevealed && canReveal) {
                    // Reveal the correct character
                    char.element.textContent = char.originalChar;
                    char.isRevealed = true;
                    
                    // Set final color based on element
                    const parent = char.element.parentElement;
                    const isSolutions = parent?.classList.contains('hero-line-solutions');
                    
                    if (isSolutions) {
                        char.element.style.color = '#ff6b35'; // Orange for SOLUTIONS
                    } else if (parent?.classList.contains('hero-subtitle')) {
                        char.element.style.color = '#ffffff'; // White for subtitle
                    } else {
                        char.element.style.color = '#ffffff'; // White for BAI
                    }
                    
                    // Add a subtle glow effect when revealed
                    gsap.to(char.element, {
                        textShadow: '0 0 8px currentColor',
                        duration: 0.15,
                        ease: 'power2.out',
                        yoyo: true,
                        repeat: 1
                    });
                } else if (!char.isRevealed && shouldUpdateScramble) {
                    // Still scrambling - show random character
                    char.element.textContent = getRandomChar();
                    char.element.style.color = getRandomMatrixColor(
                        char.element.parentElement?.classList.contains('hero-line-solutions') || false
                    );
                }
            });

            if (shouldUpdateScramble) {
                lastUpdateTimeRef.current = now;
            }

            animationRef.current = requestAnimationFrame(animateMatrix);
        } else {
            // Animation complete - ensure all characters are correct
            charsRef.current.forEach((char) => {
                if (!char.isRevealed) {
                    char.element.textContent = char.originalChar;
                    char.isRevealed = true;
                    
                    // Set final colors
                    const parent = char.element.parentElement;
                    const isSolutions = parent?.classList.contains('hero-line-solutions');
                    
                    if (isSolutions) {
                        char.element.style.color = '#ff6b35';
                    } else if (parent?.classList.contains('hero-subtitle')) {
                        char.element.style.color = '#ffffff';
                    } else {
                        char.element.style.color = '#ffffff';
                    }
                }
            });
            
            // Final subtle fade-in effect
            const allElements = charsRef.current.map(c => c.element);
            gsap.fromTo(allElements, 
                {
                    opacity: 0.9
                },
                {
                    opacity: 1,
                    duration: 0.4,
                    ease: 'power2.out',
                    stagger: 0.005
                }
            );
            
            isAnimatingRef.current = false;
        }
    }
}

