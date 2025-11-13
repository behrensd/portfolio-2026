'use client';

export default function About() {
    return (
        <section id="about" className="content-tile">
            <div className="tile-inner">
                <h2 className="section-title">About Me</h2>
                <p className="about-description">
                    I&apos;m a freelance web developer and designer specializing in creating 
                    engaging digital experiences. From Shopify stores to interactive 
                    portfolios, I bring ideas to life through clean code and compelling 
                    motion design.
                </p>
                <div className="about-skills">
                    <div className="skill-item">
                        <h3>Development</h3>
                        <p>Shopify, JavaScript, React, Three.js</p>
                    </div>
                    <div className="skill-item">
                        <h3>Design</h3>
                        <p>Motion Design, 3D Animation, Blender</p>
                    </div>
                    <div className="skill-item">
                        <h3>Strategy</h3>
                        <p>SEO, Performance, User Experience</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
