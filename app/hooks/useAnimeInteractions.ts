'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, stagger } from 'animejs';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Store ScrollTrigger for cleanup
let contactScrollTrigger: ScrollTrigger | null = null;

export function useAnimeInteractions() {
    useEffect(() => {
        const timer = setTimeout(() => {
            // 1. Magnetic hover effect on dock items
            initMagneticDock();
            
            // 2. Tag hover animations
            initTagHoverEffects();
            
            // 3. Contact link animations
            contactScrollTrigger = initContactLinkAnimations();
            
            // 4. Enhanced hero title animation
            initEnhancedHeroAnimation();
            
            // 5. Skill item animations - removed hover animations
            // initSkillItemAnimations();
        }, 150); // Changed from 100ms to prevent timing conflicts with useTileAnimations

        return () => {
            clearTimeout(timer);
            // Clean up our ScrollTrigger
            if (contactScrollTrigger) {
                contactScrollTrigger.kill();
                contactScrollTrigger = null;
            }
        };
    }, []);
}

// Magnetic hover effect for floating dock
function initMagneticDock() {
    const dockItems = document.querySelectorAll('.dock-item');
    
    dockItems.forEach(item => {
        const handleMouseEnter = function(this: HTMLElement) {
            animate(this, {
                scale: 1.1,
                duration: 300,
                ease: 'out(3)'
            });
        };
        
        const handleMouseLeave = function(this: HTMLElement) {
            animate(this, {
                scale: 1,
                duration: 300,
                ease: 'out(3)'
            });
        };
        
        // Magnetic pull effect
        const handleMouseMove = function(this: HTMLElement, e: MouseEvent) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            animate(this, {
                translateX: x * 0.2,
                translateY: y * 0.2,
                duration: 200,
                ease: 'outQuad'
            });
        };
        
        const handleMouseLeaveReset = function(this: HTMLElement) {
            animate(this, {
                translateX: 0,
                translateY: 0,
                duration: 400,
                ease: 'out(3)'
            });
        };
        
        item.addEventListener('mouseenter', handleMouseEnter);
        item.addEventListener('mouseleave', handleMouseLeave);
        item.addEventListener('mousemove', handleMouseMove as EventListener);
        item.addEventListener('mouseleave', handleMouseLeaveReset);
    });
}

// Enhanced tag hover effects
function initTagHoverEffects() {
    const tags = document.querySelectorAll('.tag');
    
    tags.forEach(tag => {
        const handleMouseEnter = function(this: HTMLElement) {
            animate(this, {
                scale: 1.15,
                color: '#ff6b35',
                duration: 300,
                ease: 'out(2)'
            });
        };
        
        const handleMouseLeave = function(this: HTMLElement) {
            animate(this, {
                scale: 1,
                color: '#ff6b35',
                duration: 300,
                ease: 'inOutQuad'
            });
        };
        
        // Click animation (particle burst effect simulation)
        const handleClick = function(this: HTMLElement) {
            animate(this, {
                scale: [1, 1.3, 1],
                duration: 500,
                ease: 'out(3)'
            });
        };
        
        tag.addEventListener('mouseenter', handleMouseEnter);
        tag.addEventListener('mouseleave', handleMouseLeave);
        tag.addEventListener('click', handleClick);
    });
}

// Contact link stagger reveal - returns ScrollTrigger for cleanup
function initContactLinkAnimations(): ScrollTrigger | null {
    const contactLinks = document.querySelectorAll('.contact-link');
    
    // Initial load animation
    const trigger = ScrollTrigger.create({
        trigger: '.contact-links',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            animate(Array.from(contactLinks), {
                translateY: [30, 0],
                opacity: [0, 1],
                delay: stagger(150),
                duration: 800,
                ease: 'outExpo'
            });
        }
    });
    
    // Enhanced hover effects
    contactLinks.forEach(link => {
        const handleMouseEnter = function(this: HTMLElement) {
            animate(this, {
                scale: 1.05,
                duration: 300,
                ease: 'out(2)'
            });
        };
        
        const handleMouseLeave = function(this: HTMLElement) {
            animate(this, {
                scale: 1,
                duration: 300,
                ease: 'inOutQuad'
            });
        };
        
        link.addEventListener('mouseenter', handleMouseEnter);
        link.addEventListener('mouseleave', handleMouseLeave);
    });
    
    return trigger;
}

// Enhanced hero title animation with character splitting
function initEnhancedHeroAnimation() {
    const heroLines = document.querySelectorAll('.hero-line');
    
    // Add subtle continuous animation to hero subtitle
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        animate(subtitle, {
            opacity: [0.7, 1],
            duration: 2000,
            loop: true,
            alternate: true,
            ease: 'inOutQuad'
        });
    }
    
    // Add hover effect to hero lines
    heroLines.forEach(line => {
        const isSolutions = line.classList.contains('hero-line-solutions');
        
        // Set SOLUTIONS to orange by default
        if (isSolutions) {
            animate(line, {
                color: '#ff6b35',
                duration: 0, // Instant
                ease: 'linear'
            });
        }
        
        const handleMouseEnter = function(this: HTMLElement) {
            if (isSolutions) {
                // SOLUTIONS: white on hover
                animate(this, {
                    scale: 1.05,
                    color: '#ffffff',
                    duration: 400,
                    ease: 'outCubic'
                });
            } else {
                // BAI: orange on hover (unchanged)
                animate(this, {
                    scale: 1.05,
                    color: '#ff6b35',
                    duration: 400,
                    ease: 'outCubic'
                });
            }
        };
        
        const handleMouseLeave = function(this: HTMLElement) {
            if (isSolutions) {
                // SOLUTIONS: back to orange
                animate(this, {
                    scale: 1,
                    color: '#ff6b35',
                    duration: 400,
                    ease: 'inOutQuad'
                });
            } else {
                // BAI: back to white (unchanged)
                animate(this, {
                    scale: 1,
                    color: '#ffffff',
                    duration: 400,
                    ease: 'inOutQuad'
                });
            }
        };
        
        line.addEventListener('mouseenter', handleMouseEnter);
        line.addEventListener('mouseleave', handleMouseLeave);
    });
}
