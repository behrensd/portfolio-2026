'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Matrix-style characters pool
const MATRIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&アイウエオカキクケコサシスセソタチツテト';

// Page-load persistence: resets on reload, persists during scroll
let skillsRevealedThisPageLoad = false;

interface SkillChar {
    element: HTMLSpanElement;
    originalChar: string;
    isRevealed: boolean;
    lineIndex: number;
    charIndex: number;
}

interface SkillLine {
    element: HTMLDivElement;
    chars: SkillChar[];
    lineIndex: number;
    revealThreshold: number; // Viewport position where this line reveals
}

/**
 * Matrix scramble animation for skills section
 * - Scrambles immediately on page load (even before visible)
 * - Reveals line-by-line as section scrolls into viewport
 * - No pinning - natural scroll flow
 * - Page-load persistent
 */
export function useAboutSkillsAnimation() {
    const animationRef = useRef<number | null>(null);
    const skillLinesRef = useRef<SkillLine[]>([]);
    const lastUpdateTimeRef = useRef<number>(0);
    const isInitializedRef = useRef(false);
    const hasRevealedAllRef = useRef<boolean>(false);
    const containerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        // Check page-load persistence
        if (skillsRevealedThisPageLoad) {
            hasRevealedAllRef.current = true;
            return;
        }

        // Respect reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return;
        }

        // Initialize after DOM ready
        const timer = setTimeout(() => {
            initSkillsAnimation();
        }, 150);

        return () => {
            clearTimeout(timer);
            stopAnimation();
            isInitializedRef.current = false;
        };
    }, []);

    function initSkillsAnimation() {
        if (isInitializedRef.current) return;

        const skillsContainer = document.querySelector('.about-skills') as HTMLElement;
        if (!skillsContainer) return;

        containerRef.current = skillsContainer;

        // Initialize matrix scramble on all skill lines
        initMatrixScramble();

        // Start scramble animation IMMEDIATELY (even before section is visible)
        isInitializedRef.current = true;
        startAnimation();
    }

    function initMatrixScramble() {
        const skillLines = document.querySelectorAll('.skill-line');
        if (skillLines.length === 0) return;

        skillLinesRef.current = [];
        const totalLines = skillLines.length;

        // Calculate reveal thresholds for each line
        // Lines reveal as section scrolls from bottom to center of viewport
        // First line reveals at 75% viewport, last line at 25% viewport
        const startThreshold = 0.80; // First line reveals when section top at 80% viewport
        const endThreshold = 0.25;   // Last line reveals when section top at 25% viewport

        skillLines.forEach((lineElement, lineIndex) => {
            const line = lineElement as HTMLDivElement;
            const originalText = line.textContent || '';

            if (!originalText.trim()) return;

            // Lock line dimensions
            const lineRect = line.getBoundingClientRect();
            const lineWidth = lineRect.width;
            line.style.width = `${lineWidth}px`;
            line.style.minWidth = `${lineWidth}px`;
            line.style.maxWidth = `${lineWidth}px`;

            // Calculate this line's reveal threshold (interpolate between start and end)
            const lineProgress = lineIndex / Math.max(totalLines - 1, 1);
            const revealThreshold = startThreshold - (lineProgress * (startThreshold - endThreshold));

            // Clear and split into characters
            line.textContent = '';
            const chars: SkillChar[] = [];

            // Measure character widths off-screen
            const charWidths: number[] = [];
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = `
                visibility: hidden;
                position: absolute;
                top: -9999px;
                left: -9999px;
                font-size: ${getComputedStyle(line).fontSize};
                font-family: ${getComputedStyle(line).fontFamily};
                white-space: pre;
            `;
            document.body.appendChild(tempContainer);

            originalText.split('').forEach((char) => {
                const tempSpan = document.createElement('span');
                tempSpan.textContent = char;
                tempSpan.style.display = 'inline-block';
                tempContainer.appendChild(tempSpan);
                charWidths.push(tempSpan.offsetWidth);
            });
            document.body.removeChild(tempContainer);

            // Create character spans with scrambled initial content
            originalText.split('').forEach((char, charIndex) => {
                const span = document.createElement('span');
                const isSpace = char === ' ';

                span.style.cssText = `
                    display: inline-block;
                    width: ${isSpace ? '0.3em' : charWidths[charIndex] + 'px'};
                    min-width: ${isSpace ? '0.3em' : charWidths[charIndex] + 'px'};
                    text-align: center;
                    color: ${getRandomScrambleColor()};
                    transition: color 0.15s ease;
                `;

                span.textContent = isSpace ? '\u00A0' : getRandomChar();
                span.setAttribute('data-original', char);

                line.appendChild(span);

                chars.push({
                    element: span,
                    originalChar: char,
                    isRevealed: false,
                    lineIndex,
                    charIndex
                });
            });

            skillLinesRef.current.push({
                element: line,
                chars,
                lineIndex,
                revealThreshold
            });
        });
    }

    function getRandomChar(): string {
        return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
    }

    function getRandomScrambleColor(): string {
        // More visible scramble colors - mix of bright and muted
        const colors = [
            '#F3EDEC', // parchment (bright)
            '#7D8491', // slate grey
            '#A0A8B0', // lighter grey
            '#C5C5C5', // silver
            '#E0DDD8', // warm white
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function startAnimation() {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        lastUpdateTimeRef.current = performance.now();
        animateMatrix();
    }

    function stopAnimation() {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    }

    function getScrollProgress(): { sectionTop: number; viewportHeight: number } {
        if (!containerRef.current) {
            return { sectionTop: 1, viewportHeight: window.innerHeight };
        }

        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // sectionTop: 1 = section is below viewport, 0 = section top at viewport top
        // Values > 1 mean section hasn't entered yet
        // Values < 0 mean section has scrolled past top
        const sectionTop = rect.top / viewportHeight;

        return { sectionTop, viewportHeight };
    }

    function animateMatrix() {
        const now = performance.now();
        const isMobile = window.innerWidth < 768;

        // Scramble update interval - slower = more readable scramble effect
        const scrambleInterval = isMobile ? 160 : 120;
        const shouldUpdateScramble = now - lastUpdateTimeRef.current >= scrambleInterval;

        if (skillLinesRef.current.length === 0) {
            animationRef.current = null;
            return;
        }

        const { sectionTop } = getScrollProgress();

        // Check if all lines are revealed
        let allRevealed = true;

        skillLinesRef.current.forEach((line) => {
            // Check if section has scrolled enough to reveal this line
            // Line reveals when section top position is at or above the line's threshold
            const shouldRevealLine = sectionTop <= line.revealThreshold;

            if (shouldRevealLine) {
                // Reveal characters in this line sequentially
                const totalChars = line.chars.length;
                const unrevealedChars = line.chars.filter(c => !c.isRevealed);

                if (unrevealedChars.length > 0) {
                    // Reveal characters - accelerate as we get closer to the end
                    if (shouldUpdateScramble || unrevealedChars.length < totalChars * 0.3) {
                        const charToReveal = unrevealedChars[0];
                        charToReveal.element.textContent = charToReveal.originalChar;
                        charToReveal.element.style.color = '#F3EDEC';
                        charToReveal.isRevealed = true;

                        // Subtle glow on reveal
                        gsap.fromTo(charToReveal.element,
                            { textShadow: '0 0 12px rgba(243, 237, 236, 0.8)' },
                            {
                                textShadow: '0 0 0px transparent',
                                duration: 0.4,
                                ease: 'power2.out'
                            }
                        );
                    }

                    allRevealed = false;
                }

                // Keep scrambling unrevealed chars in this line
                if (shouldUpdateScramble) {
                    line.chars.forEach((char) => {
                        if (!char.isRevealed && char.originalChar !== ' ') {
                            char.element.textContent = getRandomChar();
                            char.element.style.color = getRandomScrambleColor();
                        }
                    });
                }
            } else {
                // Section hasn't scrolled enough - keep scrambling entire line
                allRevealed = false;

                if (shouldUpdateScramble) {
                    line.chars.forEach((char) => {
                        if (!char.isRevealed && char.originalChar !== ' ') {
                            char.element.textContent = getRandomChar();
                            char.element.style.color = getRandomScrambleColor();
                        }
                    });
                }
            }
        });

        if (shouldUpdateScramble) {
            lastUpdateTimeRef.current = now;
        }

        // Persist when all revealed
        if (allRevealed && !hasRevealedAllRef.current) {
            hasRevealedAllRef.current = true;
            skillsRevealedThisPageLoad = true;
            animationRef.current = null;
            return;
        }

        // Continue animation if not all revealed
        if (!allRevealed) {
            animationRef.current = requestAnimationFrame(animateMatrix);
        }
    }
}
