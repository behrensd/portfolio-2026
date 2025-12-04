'use client';

export default function About() {
    return (
        <section id="about" className="content-tile">
            <div className="tile-inner">
                <h2 className="section-title">
                    <span>
                        <span style={{ color: 'var(--color-primary)' }}>moin</span>
                        <span style={{ marginLeft: '0.5em' }}>moin</span>
                    </span>
                </h2>
                <p className="about-description">
                    Ich erstelle maßgeschneiderte Webseiten und Web-Applikationen für deine <span style={{ color: 'var(--color-primary)' }}>Brand</span> oder dein <span style={{ color: 'var(--color-primary)' }}>Business</span>. 
                    Von Shopify Development, über Web-Design bis hin zu 3D-Animationen, ich bringe <span style={{ color: 'var(--color-primary)' }}>deine Ideen</span> zum Leben.
                </p>
                <div className="about-skills">
                    <div className="skill-item">
                        <h3>Development</h3>
                        <p>NextJS, Shopify Liquid, Three.js, AnimeJS, GSAP</p>
                    </div>
                    <div className="skill-item">
                        <h3>Design</h3>
                        <p>Spline, Blender, Figma, Canva</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
