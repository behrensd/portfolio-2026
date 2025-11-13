'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useHeroCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let particles: Particle[] = [];
        let animationFrameId: number;
        let currentBehavior: 'default' | 'project01' | 'project02' | 'project03' = 'default';
        let mouseX = 0;
        let mouseY = 0;
        
        // Set canvas size
        function resizeCanvas() {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        
        const resizeHandler = () => resizeCanvas();
        window.addEventListener('resize', resizeHandler);
        
        // Track mouse position for interactive effects
        const mouseMoveHandler = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        window.addEventListener('mousemove', mouseMoveHandler);
        
        // Enhanced Particle class with dynamic behaviors
        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;
            baseSpeedX: number;
            baseSpeedY: number;
            baseOpacity: number;
            
            constructor() {
                this.x = 0;
                this.y = 0;
                this.size = 0;
                this.speedX = 0;
                this.speedY = 0;
                this.opacity = 0;
                this.baseSpeedX = 0;
                this.baseSpeedY = 0;
                this.baseOpacity = 0;
                this.reset();
                this.baseSpeedX = this.speedX;
                this.baseSpeedY = this.speedY;
            }
            
            reset() {
                if (!canvas) return;
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.opacity = Math.random() * 0.5 + 0.2;
                this.baseOpacity = this.opacity;
            }
            
            update(behavior: typeof currentBehavior) {
                // Default behavior
                let targetSpeedX = this.baseSpeedX;
                let targetSpeedY = this.baseSpeedY;
                
                // Behavior modifications based on scroll position
                switch(behavior) {
                    case 'project01':
                        // Faster, more energetic particles
                        targetSpeedX = this.baseSpeedX * 2;
                        targetSpeedY = this.baseSpeedY * 2;
                        this.opacity = this.baseOpacity * 1.5;
                        break;
                        
                    case 'project02':
                        // Particles cluster toward right side (mockup area)
                        if (!canvas) break;
                        const pullX = canvas.width * 0.7;
                        const pullY = canvas.height * 0.5;
                        const dx = pullX - this.x;
                        const dy = pullY - this.y;
                        targetSpeedX = this.baseSpeedX + dx * 0.0003;
                        targetSpeedY = this.baseSpeedY + dy * 0.0003;
                        this.opacity = this.baseOpacity * 1.2;
                        break;
                        
                    case 'project03':
                        // Slower, more organized grid-like movement
                        targetSpeedX = this.baseSpeedX * 0.5;
                        targetSpeedY = this.baseSpeedY * 0.5;
                        this.opacity = this.baseOpacity * 0.8;
                        break;
                        
                    default:
                        this.opacity = this.baseOpacity;
                }
                
                // Smooth transition to target speeds
                this.speedX += (targetSpeedX - this.speedX) * 0.05;
                this.speedY += (targetSpeedY - this.speedY) * 0.05;
                
                // Update position
                this.x += this.speedX;
                this.y += this.speedY;
                
                // Wrap around screen
                if (!canvas) return;
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
                
                // Subtle mouse interaction
                const distToMouse = Math.sqrt(
                    Math.pow(this.x - mouseX, 2) + Math.pow(this.y - mouseY, 2)
                );
                if (distToMouse < 100) {
                    const angle = Math.atan2(this.y - mouseY, this.x - mouseX);
                    this.x += Math.cos(angle) * 0.5;
                    this.y += Math.sin(angle) * 0.5;
                }
            }
            
            draw() {
                if (!ctx) return;
                ctx.fillStyle = `rgba(255, 107, 53, ${Math.min(this.opacity, 0.7)})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Create particles
        const particleCount = window.innerWidth < 768 ? 30 : 50;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        // Setup ScrollTriggers to change particle behavior
        setupParticleBehaviorTriggers();
        
        // Animation loop
        function animate() {
            if (!canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((particle, index) => {
                particle.update(currentBehavior);
                particle.draw();
                
                // Connect nearby particles with dynamic distance
                const connectionDistance = currentBehavior === 'project01' ? 150 : 120;
                for (let j = index + 1; j < particles.length; j++) {
                    const dx = particles[j].x - particle.x;
                    const dy = particles[j].y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < connectionDistance) {
                        if (!ctx) continue;
                        const lineOpacity = 0.1 * (1 - distance / connectionDistance);
                        ctx.strokeStyle = `rgba(255, 107, 53, ${lineOpacity})`;
                        ctx.lineWidth = currentBehavior === 'project01' ? 1.5 : 1;
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            });
            
            animationFrameId = requestAnimationFrame(animate);
        }
        
        // Setup scroll-based behavior changes
        function setupParticleBehaviorTriggers() {
            // Reset to default when in hero section
            ScrollTrigger.create({
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                onEnter: () => currentBehavior = 'default',
                onEnterBack: () => currentBehavior = 'default'
            });
            
            // Project 01 behavior
            ScrollTrigger.create({
                trigger: '.project-item[data-project="0"]',
                start: 'top center',
                end: 'bottom center',
                onEnter: () => currentBehavior = 'project01',
                onEnterBack: () => currentBehavior = 'project01',
                onLeave: () => currentBehavior = 'default',
                onLeaveBack: () => currentBehavior = 'default'
            });
            
            // Project 02 behavior
            ScrollTrigger.create({
                trigger: '.project-item[data-project="1"]',
                start: 'top center',
                end: 'bottom center',
                onEnter: () => currentBehavior = 'project02',
                onEnterBack: () => currentBehavior = 'project02',
                onLeave: () => currentBehavior = 'default',
                onLeaveBack: () => currentBehavior = 'default'
            });
            
            // Project 03 behavior
            ScrollTrigger.create({
                trigger: '.project-item[data-project="2"]',
                start: 'top center',
                end: 'bottom center',
                onEnter: () => currentBehavior = 'project03',
                onEnterBack: () => currentBehavior = 'project03',
                onLeave: () => currentBehavior = 'default',
                onLeaveBack: () => currentBehavior = 'default'
            });
        }
        
        animate();
        
        console.log('✨ Enhanced scroll-reactive canvas initialized');
        
        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeHandler);
            window.removeEventListener('mousemove', mouseMoveHandler);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [canvasRef]);
}
