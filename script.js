// ================================
// CLEAN PORTFOLIO REBUILD
// - NO Lenis (native scroll only)
// - Simple GSAP animations
// - Flat tiles slide in
// - Hero background stays
// ================================

// Wait for DOM and GSAP to load
document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    
    // Initialize everything
    setTimeout(() => {
        initHeroAnimation();
        initLogoScrollAnimation();
        initTileAnimations();
        initDockNavigation();
        initHeroCanvas();
    }, 100);
});

// ================================
// HERO SECTION ANIMATIONS
// ================================
function initHeroAnimation() {
    // Animate hero title lines
    gsap.from('.hero-line', {
        opacity: 0,
        y: 100,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power4.out',
        delay: 0.3
    });
    
    // Animate hero subtitle
    gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
        delay: 1
    });
    
    console.log('✨ Hero animations initialized');
}

// ================================
// LOGO SCROLL ANIMATION TO TOP LEFT
// ================================
function initLogoScrollAnimation() {
    const logoLink = document.getElementById('bai-logo-link');
    const logo = document.getElementById('bai-logo');
    const heroSection = document.getElementById('hero');
    if (!logoLink || !logo || !heroSection) return;
    
    // Add click handler for smooth scroll to top
    logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        gsap.to(window, {
            duration: 1,
            scrollTo: {
                y: '#hero',
                offsetY: 0
            },
            ease: 'power2.inOut'
        });
    });
    
    // Calculate initial centered position in viewport
    const setupAnimation = () => {
        const heroRect = heroSection.getBoundingClientRect();
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
                // markers: true
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
    setTimeout(setupAnimation, 100);
    
    console.log('✨ Logo scroll animation with fixed overlay initialized');
}

// ================================
// AWARD-WINNING PROJECT ANIMATIONS
// ================================
function initTileAnimations() {
    // Get all content tiles
    const tiles = gsap.utils.toArray('.content-tile');
    
    tiles.forEach((tile, index) => {
        // Simple slide-in from bottom
        gsap.to(tile, {
            scrollTrigger: {
                trigger: tile,
                start: 'top 80%',
                end: 'top 20%',
                scrub: 1,
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out'
        });
    });
    
    // Initialize individual project animations
    initProject01Animation();
    initProject02Animation();
    initProject03Animation();
    
    // Animate skill items
    const skills = gsap.utils.toArray('.skill-item');
    skills.forEach((skill, index) => {
        gsap.from(skill, {
            scrollTrigger: {
                trigger: skill,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 30,
            duration: 0.6,
            ease: 'power2.out',
            delay: index * 0.15
        });
    });
    
    console.log('✨ Award-winning animations initialized');
}

// ================================
// PROJECT 01: STAGGERED CLIP-PATH REVEAL
// ================================
function initProject01Animation() {
    const project = document.querySelector('.project-item[data-project="0"]');
    if (!project) return;
    
    const projectNumber = project.querySelector('.project-number');
    const projectContent = project.querySelector('.project-content');
    const projectInfo = project.querySelector('.project-info');
    const mockupContainer = project.querySelector('.mockup-container');
    const tags = project.querySelectorAll('.tag');
    
    // Create timeline for project 01
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: project,
            start: 'top 75%',
            end: 'top 25%',
            scrub: 1.5,
            // markers: true
        }
    });
    
    // Animate project number with 3D perspective
    tl.from(projectNumber, {
        scale: 0.5,
        transformPerspective: 800,
        rotationY: 45,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
    }, 0);
    
    // Horizontal wipe reveal from center outward using clip-path
    tl.to(projectContent, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 1,
        ease: 'power2.inOut'
    }, 0.2);
    
    // Stagger project info elements from left
    tl.from(projectInfo, {
        x: -60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, 0.4);
    
    // Animate mockup container from right
    if (mockupContainer) {
        tl.from(mockupContainer, {
            x: 100,
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            ease: 'power3.out'
        }, 0.5);
    }
    
    // Create separate trigger for anime.js tag animations
    ScrollTrigger.create({
        trigger: project,
        start: 'top 70%',
        once: true,
        onEnter: () => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: tags,
                    translateY: [20, 0],
                    opacity: [0, 1],
                    delay: anime.stagger(80, {start: 400}),
                    duration: 600,
                    easing: 'easeOutElastic(1, .8)'
                });
            }
        }
    });
    
    console.log('✅ Project 01 animation initialized');
}

// ================================
// FLOATING DOCK NAVIGATION
// ================================
function initDockNavigation() {
    const dockItems = document.querySelectorAll('.dock-item');
    const sections = document.querySelectorAll('section[id]');
    
    // Update active state on scroll
    sections.forEach((section) => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            onToggle: (self) => {
                if (self.isActive) {
                    const id = section.getAttribute('id');
                    dockItems.forEach(item => {
                        item.classList.remove('active');
                        if (item.getAttribute('href') === `#${id}`) {
                            item.classList.add('active');
                        }
                    });
                }
            }
        });
    });
    
    // Smooth scroll on click (native scroll with GSAP)
    dockItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: {
                        y: targetSection,
                        offsetY: 0
                    },
                    ease: 'power2.inOut'
                });
            }
        });
    });
    
    console.log('✨ Dock navigation initialized');
}

// ================================
// ENHANCED HERO CANVAS (Scroll-Reactive Particles)
// ================================
function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let currentBehavior = 'default'; // Track particle behavior state
    let mouseX = 0;
    let mouseY = 0;
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Track mouse position for interactive effects
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Enhanced Particle class with dynamic behaviors
    class Particle {
        constructor() {
            this.reset();
            this.baseSpeedX = this.speedX;
            this.baseSpeedY = this.speedY;
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.baseOpacity = this.opacity;
        }
        
        update(behavior) {
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
}

// ================================
// PROJECT 02: SPLIT-SCREEN PUSH WITH MOCKUP EMERGENCE
// ================================
function initProject02Animation() {
    const project = document.querySelector('.project-item[data-project="1"]');
    if (!project) return;
    
    const projectNumber = project.querySelector('.project-number');
    const projectContent = project.querySelector('.project-content');
    const mockupContainer = project.querySelector('.mockup-container');
    const tags = project.querySelectorAll('.tag');
    const projectInfo = project.querySelector('.project-info');
    
    // Main timeline with ScrollTrigger
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: project,
            start: 'top 70%',
            end: 'top 20%',
            scrub: 1.8,
            // markers: true
        }
    });
    
    // Animate project number with 3D Y-rotation
    tl.from(projectNumber, {
        rotationY: -90,
        transformPerspective: 1000,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
    }, 0);
    
    // Project info slides in from left
    tl.from(projectInfo, {
        x: -80,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, 0.2);
    
    // Mockup pushes in from RIGHT with depth parallax
    if (mockupContainer) {
        tl.from(mockupContainer, {
            x: 200,
            z: -100,
            opacity: 0,
            scale: 0.85,
            duration: 1,
            ease: 'power2.out'
        }, 0.3);
    }
    
    // Animate tags with anime.js elastic effect
    ScrollTrigger.create({
        trigger: project,
        start: 'top 65%',
        once: true,
        onEnter: () => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: tags,
                    translateY: [30, 0],
                    opacity: [0, 1],
                    scale: [0.8, 1],
                    delay: anime.stagger(100, {start: 500}),
                    duration: 800,
                    easing: 'easeOutElastic(1, .6)'
                });
            }
        }
    });
    
    console.log('✅ Project 02 animation initialized');
}

// ================================
// PROJECT 03: 3D PERSPECTIVE FLIP
// ================================
function initProject03Animation() {
    const project = document.querySelector('.project-item[data-project="2"]');
    if (!project) return;
    
    const projectNumber = project.querySelector('.project-number');
    const projectContent = project.querySelector('.project-content');
    const projectInfo = project.querySelector('.project-info');
    const mockupContainer = project.querySelector('.mockup-container');
    const tags = project.querySelectorAll('.tag');
    
    // Set initial 3D state
    gsap.set(projectContent, {
        transformPerspective: 1000,
        transformOrigin: 'bottom center'
    });
    
    // Main timeline for 3D flip effect
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: project,
            start: 'top 75%',
            end: 'top 30%',
            scrub: 2,
            // markers: true
        }
    });
    
    // Number fades in with slight rotation
    tl.from(projectNumber, {
        scale: 0.6,
        rotation: -15,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)'
    }, 0);
    
    // Content card flips from flat to upright (3D perspective flip)
    tl.from(projectContent, {
        rotationX: -90,
        z: -200,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
    }, 0.1);
    
    // Info fades in with scale
    tl.from(projectInfo, {
        opacity: 0,
        scale: 0.8,
        filter: 'blur(10px)',
        duration: 0.8,
        ease: 'power2.out'
    }, 0.5);
    
    // Mockup slides in last with blur-to-focus
    if (mockupContainer) {
        tl.from(mockupContainer, {
            y: 50,
            opacity: 0,
            filter: 'blur(15px)',
            duration: 0.8,
            ease: 'power2.out'
        }, 0.7);
    }
    
    // Tags with anime.js
    ScrollTrigger.create({
        trigger: project,
        start: 'top 70%',
        once: true,
        onEnter: () => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: tags,
                    scale: [0, 1],
                    opacity: [0, 1],
                    delay: anime.stagger(100, {start: 600}),
                    duration: 700,
                    easing: 'easeOutBack'
                });
            }
        }
    });
    
    console.log('✅ Project 03 animation initialized');
}

// ================================
// ANIME.JS MICRO-INTERACTIONS
// ================================
function initAnimeJSInteractions() {
    if (typeof anime === 'undefined') {
        console.warn('⚠️ Anime.js not loaded, skipping micro-interactions');
        return;
    }
    
    // 1. Magnetic hover effect on dock items
    initMagneticDock();
    
    // 2. Tag hover animations
    initTagHoverEffects();
    
    // 3. Contact link animations
    initContactLinkAnimations();
    
    // 4. Enhanced hero title animation
    initEnhancedHeroAnimation();
    
    console.log('✨ Anime.js micro-interactions initialized');
}

// Magnetic hover effect for floating dock
function initMagneticDock() {
    const dockItems = document.querySelectorAll('.dock-item');
    
    dockItems.forEach(item => {
        item.addEventListener('mouseenter', function(e) {
            anime({
                targets: this,
                scale: 1.1,
                duration: 300,
                easing: 'easeOutElastic(1, .6)'
            });
        });
        
        item.addEventListener('mouseleave', function(e) {
            anime({
                targets: this,
                scale: 1,
                duration: 300,
                easing: 'easeOutElastic(1, .8)'
            });
        });
        
        // Magnetic pull effect
        item.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            anime({
                targets: this,
                translateX: x * 0.2,
                translateY: y * 0.2,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
        
        item.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                translateX: 0,
                translateY: 0,
                duration: 400,
                easing: 'easeOutElastic(1, .6)'
            });
        });
    });
}

// Enhanced tag hover effects
function initTagHoverEffects() {
    const tags = document.querySelectorAll('.tag');
    
    tags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: 1.15,
                color: '#ff6b35',
                duration: 300,
                easing: 'easeOutBack'
            });
        });
        
        tag.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                scale: 1,
                color: '#ff6b35',
                duration: 300,
                easing: 'easeInOutQuad'
            });
        });
        
        // Click animation (particle burst effect simulation)
        tag.addEventListener('click', function(e) {
            // Create ripple effect
            anime({
                targets: this,
                scale: [1, 1.3, 1],
                duration: 500,
                easing: 'easeOutElastic(1, .5)'
            });
        });
    });
}

// Contact link stagger reveal
function initContactLinkAnimations() {
    const contactLinks = document.querySelectorAll('.contact-link');
    
    // Initial load animation
    ScrollTrigger.create({
        trigger: '.contact-links',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            anime({
                targets: contactLinks,
                translateY: [30, 0],
                opacity: [0, 1],
                delay: anime.stagger(150),
                duration: 800,
                easing: 'easeOutExpo'
            });
        }
    });
    
    // Enhanced hover effects
    contactLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: 1.05,
                duration: 300,
                easing: 'easeOutBack'
            });
        });
        
        link.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                scale: 1,
                duration: 300,
                easing: 'easeInOutQuad'
            });
        });
    });
}

// Enhanced hero title animation with character splitting
function initEnhancedHeroAnimation() {
    const heroLines = document.querySelectorAll('.hero-line');
    
    // Add subtle continuous animation to hero subtitle
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        anime({
            targets: subtitle,
            opacity: [0.7, 1],
            duration: 2000,
            loop: true,
            direction: 'alternate',
            easing: 'easeInOutQuad'
        });
    }
    
    // Add hover effect to hero lines
    heroLines.forEach(line => {
        line.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: 1.05,
                color: '#ff6b35',
                duration: 400,
                easing: 'easeOutCubic'
            });
        });
        
        line.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                scale: 1,
                color: '#ffffff',
                duration: 400,
                easing: 'easeInOutQuad'
            });
        });
    });
}

// Skill item hover enhancement
function initSkillItemAnimations() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const heading = this.querySelector('h3');
            anime({
                targets: heading,
                translateX: [0, 10],
                color: ['#ff6b35', '#ff8c5a'],
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
        
        item.addEventListener('mouseleave', function() {
            const heading = this.querySelector('h3');
            anime({
                targets: heading,
                translateX: 10,
                color: '#ff6b35',
                duration: 300,
                easing: 'easeInOutQuad'
            });
        });
    });
}

// Initialize all anime.js interactions after DOM is ready
setTimeout(() => {
    initAnimeJSInteractions();
    initSkillItemAnimations();
}, 500);

// Refresh ScrollTrigger on window load
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
    console.log('✅ ScrollTrigger refreshed');
});
