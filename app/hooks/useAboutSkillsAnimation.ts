'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Matrix-style characters pool (same as hero animation)
const MATRIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()[]{}|;:,.<>?/\\';

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
}

/**
 * Pin skills card on viewport enter and reveal skills line-by-line
 * using matrix scramble animation driven by scroll progress
 */
export function useAboutSkillsAnimation() {
    const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
    const animationRef = useRef<number | null>(null);
    const skillLinesRef = useRef<SkillLine[]>([]);
    const lastUpdateTimeRef = useRef<number>(0);
    const isInitializedRef = useRef(false);
    const scrollProgressRef = useRef<number>(0);
    const isVisibleRef = useRef<boolean>(false); // Track if section is in viewport
    const visibleStartTimeRef = useRef<number>(0); // Track when section became visible
    const timeProgressRef = useRef<number>(0); // Time-based auto-progress

    useEffect(() => {
        // Respect user's motion preferences
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return;
        }

        const isMobile = window.innerWidth < 768;
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        // Wait for DOM to be ready, then start animation immediately
        const timer = setTimeout(() => {
            initSkillsAnimation(isMobile, isSafari);
        }, 200);

        return () => {
            clearTimeout(timer);
            if (scrollTriggerRef.current) {
                scrollTriggerRef.current.kill();
                scrollTriggerRef.current = null;
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            isInitializedRef.current = false;
        };
    }, []);

    function initSkillsAnimation(isMobile: boolean, isSafari: boolean) {
        if (isInitializedRef.current) return;
        
        const skillsContainer = document.querySelector('.about-skills') as HTMLElement;
        if (!skillsContainer) {
            return;
        }

        // CRITICAL: Lock container dimensions AND position BEFORE any DOM manipulation
        // Get dimensions and position while content is still in original state
        const containerRect = skillsContainer.getBoundingClientRect();
        const computedStyle = getComputedStyle(skillsContainer);
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        const containerLeft = containerRect.left;
        
        // Calculate the exact center offset needed to maintain position
        // When ScrollTrigger pins, it changes positioning context, so we need to
        // calculate how to center the element relative to viewport
        const viewportWidth = window.innerWidth;
        const halfWidth = containerWidth / 2;
        // Calculate how far from viewport center the element currently is
        const viewportCenter = viewportWidth / 2;
        const currentCenter = containerLeft + halfWidth;
        const offsetFromCenter = currentCenter - viewportCenter;
        
        // Lock width, height, and horizontal position immediately to prevent any shifts
        // Use !important to override any global CSS rules
        // Also set CSS custom property for additional override protection
        const computedGridCols = getComputedStyle(skillsContainer).gridTemplateColumns;
        skillsContainer.style.setProperty('--locked-width', `${containerWidth}px`, 'important');
        skillsContainer.style.setProperty('--locked-offset', `${offsetFromCenter}px`, 'important');
        skillsContainer.style.setProperty('--locked-grid-cols', computedGridCols, 'important');
        skillsContainer.setAttribute('data-pinned', 'true'); // Mark as pinned for CSS override
        skillsContainer.style.setProperty('width', `${containerWidth}px`, 'important');
        skillsContainer.style.setProperty('min-width', `${containerWidth}px`, 'important');
        skillsContainer.style.setProperty('max-width', `${containerWidth}px`, 'important');
        skillsContainer.style.setProperty('height', `${containerHeight}px`, 'important');
        skillsContainer.style.setProperty('min-height', `${containerHeight}px`, 'important');
        skillsContainer.style.setProperty('box-sizing', 'border-box', 'important');
        skillsContainer.style.setProperty('position', 'relative', 'important');
        // Center using left: 50% + negative margin - this works even when pinned
        skillsContainer.style.setProperty('left', '50%', 'important');
        skillsContainer.style.setProperty('margin-left', `calc(-${halfWidth}px + ${offsetFromCenter}px)`, 'important');
        skillsContainer.style.setProperty('margin-right', 'auto', 'important');
        // Keep transform for GPU acceleration but don't use it for positioning
        skillsContainer.style.setProperty('transform', 'translateZ(0)', 'important');
        // Prevent transform from interfering - but keep translateZ(0) for GPU acceleration
        skillsContainer.style.setProperty('transform', 'translateZ(0)', 'important');
        // Override will-change if set globally
        skillsContainer.style.setProperty('will-change', 'transform', 'important');
        
        // Force a reflow to ensure styles are applied
        void skillsContainer.offsetWidth;
        
        // Verify position hasn't shifted
        const afterRect = skillsContainer.getBoundingClientRect();
        if (Math.abs(afterRect.left - containerLeft) > 1) {
            // Position shifted - this shouldn't happen
        }
        
        // Lock grid items (skill-items) to prevent grid recalculation
        const skillItems = skillsContainer.querySelectorAll('.skill-item');
        skillItems.forEach((item) => {
            const itemEl = item as HTMLElement;
            const itemRect = itemEl.getBoundingClientRect();
            // Use !important to override global CSS
            itemEl.style.setProperty('width', `${itemRect.width}px`, 'important');
            itemEl.style.setProperty('min-width', `${itemRect.width}px`, 'important');
            itemEl.style.setProperty('max-width', `${itemRect.width}px`, 'important');
            itemEl.style.setProperty('flex-shrink', '0', 'important');
            itemEl.style.setProperty('flex-grow', '0', 'important');
            // Override will-change on mobile
            itemEl.style.setProperty('will-change', 'auto', 'important');
        });
        
        // Force reflow after locking items
        void skillsContainer.offsetWidth;
        
        // NOW initialize matrix scramble (after everything is locked)
        initMatrixScramble();
        
        // Force another reflow after scramble initialization to ensure layout is stable
        void skillsContainer.offsetWidth;
        
        // Verify container is still locked
        const finalWidth = skillsContainer.offsetWidth;
        const finalLeft = skillsContainer.getBoundingClientRect().left;
        if (Math.abs(finalWidth - containerWidth) > 1) {
            // Container shifted - re-lock it with !important
            skillsContainer.style.setProperty('width', `${containerWidth}px`, 'important');
            skillsContainer.style.setProperty('min-width', `${containerWidth}px`, 'important');
            skillsContainer.style.setProperty('max-width', `${containerWidth}px`, 'important');
        }
        if (Math.abs(finalLeft - containerLeft) > 1) {
            // Container horizontal position shifted after scramble init
        }
        
        // Set up ScrollTrigger pin AFTER everything is locked and stable
        // Use requestAnimationFrame to ensure all layout calculations are complete
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setupScrollTrigger(skillsContainer, isMobile, isSafari);
                
                // Start animation immediately on load (don't wait for scroll/pin)
                // This allows users to see the scramble animation right away
                startAnimation();
            });
        });
    }

    function setupScrollTrigger(skillsContainer: HTMLElement, isMobile: boolean, isSafari: boolean) {
        // Pin duration - long enough for user to see the scramble effect
        const pinDuration = isMobile ? (isSafari ? '+=90vh' : '+=75vh') : (isSafari ? '+=110vh' : '+=90vh');

        // Ensure container is still locked before creating ScrollTrigger
        const currentWidth = skillsContainer.offsetWidth;
        if (currentWidth > 0) {
            skillsContainer.style.setProperty('width', `${currentWidth}px`, 'important');
            skillsContainer.style.setProperty('min-width', `${currentWidth}px`, 'important');
            skillsContainer.style.setProperty('max-width', `${currentWidth}px`, 'important');
        }

        // Capture position right before creating ScrollTrigger
        const prePinRect = skillsContainer.getBoundingClientRect();
        const prePinLeft = prePinRect.left;
        const prePinWidth = prePinRect.width;
        let hasCorrectedPosition = false;

        scrollTriggerRef.current = ScrollTrigger.create({
            trigger: skillsContainer,
            start: 'top 65%', // Earlier trigger since About is closer to hero
            end: pinDuration,
            pin: true,
            pinSpacing: true,
            pinType: 'transform', // Use transform for pinning (more stable)
            anticipatePin: 1, // Prevent flash by anticipating pin
            invalidateOnRefresh: false, // Dimensions are locked, no need to recalculate
            refreshPriority: 0, // High priority for pinned elements
            onUpdate: (self) => {
                // Update progress - this drives the reveal
                scrollProgressRef.current = self.progress;
                
                // Correct position shift on first update after pinning
                if (self.isActive && !hasCorrectedPosition) {
                    requestAnimationFrame(() => {
                        const pinnedRect = skillsContainer.getBoundingClientRect();
                        const pinnedLeft = pinnedRect.left;
                        const shift = pinnedLeft - prePinLeft;
                        
                        if (Math.abs(shift) > 1) {
                            // Correct the shift using transform
                            const currentTransform = getComputedStyle(skillsContainer).transform;
                            let translateX = 0;
                            if (currentTransform && currentTransform !== 'none') {
                                const matrix = new DOMMatrix(currentTransform);
                                translateX = matrix.e; // e is the translateX value
                            }
                            // Apply correction - negative shift to move back
                            skillsContainer.style.setProperty('transform', `translateZ(0) translateX(${translateX - shift}px)`, 'important');
                            hasCorrectedPosition = true;
                        } else {
                            hasCorrectedPosition = true; // No shift needed
                        }
                    });
                }
                
                // Ensure animation is running while pinned
                if (self.isActive && !animationRef.current) {
                    startAnimation();
                }
            },
            onEnter: () => {
                isVisibleRef.current = true; // Mark as visible when entering viewport
                scrollProgressRef.current = 0; // Reset progress when entering
                visibleStartTimeRef.current = performance.now(); // Start time-based progress
                timeProgressRef.current = 0;
                hasCorrectedPosition = false; // Reset correction flag
                // Ensure animation is running (it should already be from load)
                if (!animationRef.current) {
                    startAnimation();
                }
            },
            onEnterBack: () => {
                isVisibleRef.current = true; // Mark as visible when re-entering
                // Reset progress when entering from bottom
                scrollProgressRef.current = scrollTriggerRef.current?.progress || 0;
                visibleStartTimeRef.current = performance.now(); // Restart time-based progress
                timeProgressRef.current = 0;
                startAnimation();
            },
            onLeave: () => {
                isVisibleRef.current = false; // Mark as not visible when leaving
                // Ensure all characters are revealed before stopping
                skillLinesRef.current.forEach((line) => {
                    line.chars.forEach((char) => {
                        if (!char.isRevealed) {
                            char.element.textContent = char.originalChar;
                            char.element.style.color = '#F3EDEC';
                            char.isRevealed = true;
                        }
                    });
                });
                stopAnimation();
            },
            onLeaveBack: () => {
                isVisibleRef.current = false; // Mark as not visible when leaving back
                stopAnimation();
                resetSkills();
            }
        });

        isInitializedRef.current = true;
    }

    function initMatrixScramble() {
        const skillLines = document.querySelectorAll('.skill-line');
        if (skillLines.length === 0) {
            return;
        }

        skillLinesRef.current = [];

        skillLines.forEach((lineElement, lineIndex) => {
            const line = lineElement as HTMLDivElement;
            const originalText = line.textContent || '';
            
            if (!originalText.trim()) return;

            // CRITICAL: Lock line width BEFORE manipulating content
            const lineRect = line.getBoundingClientRect();
            const lineWidth = lineRect.width;
            line.style.width = `${lineWidth}px`;
            line.style.minWidth = `${lineWidth}px`;
            line.style.maxWidth = `${lineWidth}px`;
            line.style.boxSizing = 'border-box';
            
            // Force reflow
            void line.offsetWidth;

            // Clear and split into characters
            line.textContent = '';
            const chars: SkillChar[] = [];

            // First pass: measure all character widths (off-screen to prevent shifts)
            const charWidths: number[] = [];
            const tempContainer = document.createElement('div');
            tempContainer.style.visibility = 'hidden';
            tempContainer.style.position = 'absolute';
            tempContainer.style.top = '-9999px';
            tempContainer.style.left = '-9999px';
            tempContainer.style.fontSize = getComputedStyle(line).fontSize;
            tempContainer.style.fontWeight = getComputedStyle(line).fontWeight;
            tempContainer.style.fontFamily = getComputedStyle(line).fontFamily;
            tempContainer.style.whiteSpace = 'pre';
            tempContainer.style.width = `${lineWidth}px`; // Match line width
            document.body.appendChild(tempContainer);
            
            originalText.split('').forEach((char) => {
                const tempSpan = document.createElement('span');
                tempSpan.textContent = char;
                tempSpan.style.display = 'inline-block';
                tempContainer.appendChild(tempSpan);
                charWidths.push(tempSpan.offsetWidth);
            });
            
            document.body.removeChild(tempContainer);
            
            // Second pass: create spans with locked widths
            originalText.split('').forEach((char, charIndex) => {
                const span = document.createElement('span');
                span.textContent = getRandomChar();
                span.style.display = 'inline-block';
                span.style.color = getRandomMatrixColor();
                span.style.opacity = '1';
                span.setAttribute('data-original', char);
                
                // Lock width to prevent layout shifts during scramble
                const charWidth = charWidths[charIndex];
                span.style.width = `${charWidth}px`;
                span.style.minWidth = `${charWidth}px`;
                span.style.textAlign = 'center';
                span.style.overflow = 'hidden';
                
                // Preserve spaces
                if (char === ' ') {
                    span.textContent = '\u00A0';
                    span.style.width = '0.3em';
                    span.style.minWidth = '0.3em';
                }

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
                lineIndex
            });
        });
    }

    function getRandomChar(): string {
        return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
    }

    function getRandomMatrixColor(): string {
        // Use parchment, slate grey, and subtle colors during scramble
        const colors = ['#F3EDEC', '#7D8491', '#D5D5D5', '#999999'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function startAnimation() {
        // Always restart animation to ensure it's running
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

    function resetSkills() {
        // Reset all characters to scrambled state
        skillLinesRef.current.forEach((line) => {
            line.chars.forEach((char) => {
                if (char.isRevealed) {
                    char.element.textContent = getRandomChar();
                    char.element.style.color = getRandomMatrixColor();
                    char.isRevealed = false;
                }
            });
        });
        scrollProgressRef.current = 0;
    }

    function animateMatrix() {
        const now = performance.now();
        // Adaptive update interval based on device performance
        // Mobile devices get longer intervals to reduce CPU usage
        const isMobile = window.innerWidth < 768;
        const updateInterval = isMobile ? 50 : 30; // Slower updates on mobile
        const shouldUpdateScramble = now - lastUpdateTimeRef.current >= updateInterval;

        const totalLines = skillLinesRef.current.length;
        if (totalLines === 0) {
            animationRef.current = null;
            return;
        }

        // Calculate time-based progress (auto-reveals over 2.5 seconds once visible)
        // Long enough for user to see the scramble effect
        const autoRevealDuration = 2500; // 2.5 seconds to fully reveal
        if (isVisibleRef.current && visibleStartTimeRef.current > 0) {
            const elapsed = now - visibleStartTimeRef.current;
            timeProgressRef.current = Math.min(elapsed / autoRevealDuration, 1);
        }

        // Use the higher of scroll progress or time progress
        // This ensures text reveals even without scrolling
        const scrollProgress = scrollProgressRef.current;
        const timeProgress = timeProgressRef.current;
        const progress = Math.max(scrollProgress, timeProgress);
        const isActive = scrollTriggerRef.current?.isActive || isVisibleRef.current;
        
        // Use a threshold slightly less than 1 to account for rounding errors
        // Consider complete when visible AND progress is high (either scroll or time)
        const completionThreshold = 0.99;
        const isComplete = isActive && progress >= completionThreshold;
        
        // If progress is complete (or very close), ensure ALL characters are revealed immediately
        if (isComplete) {
            let allRevealed = true;
            skillLinesRef.current.forEach((line) => {
                line.chars.forEach((char) => {
                    if (!char.isRevealed) {
                        char.element.textContent = char.originalChar;
                        char.element.style.color = '#F3EDEC';
                        char.isRevealed = true;
                        allRevealed = false;
                    }
                });
            });
            
            // If all characters are now revealed, we can stop
            if (allRevealed) {
                animationRef.current = null;
                return;
            }
        }
        
        skillLinesRef.current.forEach((line, lineIndex) => {
            // Each line gets equal portion of progress (1/totalLines)
            const lineStartProgress = lineIndex / totalLines;
            const lineEndProgress = (lineIndex + 1) / totalLines;
            
            // Check if this line should start revealing
            if (progress >= lineStartProgress || isComplete) {
                const lineProgress = isComplete 
                    ? 1 // Force complete reveal if overall progress is complete
                    : Math.min((progress - lineStartProgress) / (lineEndProgress - lineStartProgress), 1);
                
                line.chars.forEach((char, charIndex) => {
                    const totalChars = line.chars.length;
                    const charProgress = charIndex / totalChars;
                    
                    // Reveal character when line progress reaches its position
                    // Or if we're in completion mode, reveal all
                    if ((lineProgress >= charProgress || isComplete) && !char.isRevealed) {
                        // Reveal the correct character
                        char.element.textContent = char.originalChar;
                        char.isRevealed = true;
                        char.element.style.color = '#F3EDEC'; // Final parchment color
                        
                        // Add subtle glow effect when revealed (only if not in completion mode)
                        if (!isComplete) {
                            gsap.to(char.element, {
                                textShadow: '0 0 8px currentColor',
                                duration: 0.15,
                                ease: 'power2.out',
                                yoyo: true,
                                repeat: 1
                            });
                        }
                    } else if (!char.isRevealed && shouldUpdateScramble) {
                        // Still scrambling - show random character
                        // This happens when not pinned (progress = 0) or before reveal
                        char.element.textContent = getRandomChar();
                        char.element.style.color = getRandomMatrixColor();
                    }
                });
            } else if (shouldUpdateScramble) {
                // Line hasn't started yet - keep scrambling
                // This ensures continuous scramble animation even when not pinned
                line.chars.forEach((char) => {
                    if (!char.isRevealed) {
                        char.element.textContent = getRandomChar();
                        char.element.style.color = getRandomMatrixColor();
                    }
                });
            }
        });

        if (shouldUpdateScramble) {
            lastUpdateTimeRef.current = now;
        }

        // Check if all characters are revealed
        const allCharsRevealed = skillLinesRef.current.every(line => 
            line.chars.every(char => char.isRevealed)
        );
        
        // Always continue animation to show scramble effect
        // Continue if:
        // 1. We're pinned (isActive), OR
        // 2. Progress is not complete yet, OR  
        // 3. Not all characters are revealed yet
        // 4. Always run scramble animation (even when not pinned) to show continuous effect
        // isActive and isComplete are already defined above, reuse them
        
        // Continue animation ONLY if section is visible AND (not complete OR not revealed)
        // This prevents continuous animation when scrolled away - major performance improvement
        if (isVisibleRef.current && (!isComplete || !allCharsRevealed)) {
            animationRef.current = requestAnimationFrame(animateMatrix);
        } else if (isComplete && allCharsRevealed) {
            // Final safety check - ensure ALL characters are revealed before stopping
            skillLinesRef.current.forEach((line) => {
                line.chars.forEach((char) => {
                    if (!char.isRevealed) {
                        char.element.textContent = char.originalChar;
                        char.element.style.color = '#F3EDEC';
                        char.isRevealed = true;
                    }
                });
            });
            animationRef.current = null;
        }
    }
}

