'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function LogoOverlay() {
    useEffect(() => {
        const logoLink = document.getElementById('bai-logo-link');
        const logo = document.getElementById('bai-logo');
        const heroSection = document.getElementById('hero');
        
        if (!logoLink || !logo || !heroSection) return;
        
        // Add click handler for smooth scroll to top
        const handleClick = (e: Event) => {
            e.preventDefault();
            gsap.to(window, {
                duration: 1,
                scrollTo: {
                    y: '#hero',
                    offsetY: 0
                },
                ease: 'power2.inOut'
            });
        };
        
        logoLink.addEventListener('click', handleClick);
        
        // Calculate initial centered position in viewport
        const setupAnimation = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Initial size and position (higher in viewport, well above text)
            const initialSize = Math.min(200, viewportWidth * 0.2);
            const initialLeft = (viewportWidth - initialSize) / 2;
            const initialTop = (viewportHeight - initialSize) / 2 - 200; // Much higher up
            
            // Final position (top left corner)
            const finalSize = 60;
            const finalLeft = 30;
            const finalTop = 30;
            
            // Set initial position
            gsap.set(logoLink, {
                left: initialLeft,
                top: initialTop,
                width: initialSize,
                height: initialSize
            });
            
            gsap.set(logo, {
                width: initialSize,
                height: initialSize
            });
            
            // Animate to corner - starts immediately, finishes quickly
            gsap.to(logoLink, {
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top+=50 top', // Start almost immediately
                    end: '+=400', // Shorter distance = faster completion
                    scrub: 1.5, // Quicker response
                },
                left: finalLeft,
                top: finalTop,
                width: finalSize,
                height: finalSize,
                ease: 'power2.inOut'
            });
            
            // Animate logo size
            gsap.to(logo, {
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top+=50 top',
                    end: '+=400',
                    scrub: 1.5
                },
                width: finalSize,
                height: finalSize,
                ease: 'power2.inOut'
            });
            
            // Smooth 360° rotation
            gsap.to(logo, {
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top+=50 top',
                    end: '+=400',
                    scrub: 1.5
                },
                rotation: 360,
                ease: 'none'
            });
        };
        
        // Initialize after layout is ready
        const timer = setTimeout(setupAnimation, 100);
        
        console.log('✨ Logo scroll animation with fixed overlay initialized');
        
        // Cleanup
        return () => {
            logoLink.removeEventListener('click', handleClick);
            clearTimeout(timer);
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <div id="logo-overlay-container">
            <a href="#hero" className="hero-logo-link" id="bai-logo-link">
                <Image
                    src="/logo.png"
                    alt="BAI Solutions Logo"
                    className="hero-logo"
                    id="bai-logo"
                    width={200}
                    height={200}
                    priority
                />
            </a>
        </div>
    );
}
