'use client';

import { useAboutSkillsAnimation } from '../hooks/useAboutSkillsAnimation';

const developmentSkills = ['NextJS', 'Shopify Liquid', 'Three.js', 'AnimeJS', 'GSAP'];
const designSkills = ['Spline', 'Blender', 'Figma', 'Canva'];

export default function About() {
    // Initialize skills animation hook (handles pinning and matrix scramble)
    useAboutSkillsAnimation();

    return (
        <section id="about" className="content-tile">
            <div className="tile-inner">
                <h2 className="section-title">
                    <span>
                        <span className="skill-category-primary">moin</span>
                        <span className="skill-category-secondary">moin</span>
                    </span>
                </h2>
                <p className="about-description">
                    In engem Austausch mit Dir, erstelle ich maßgeschneiderte Webseiten und Web-Applikationen für <span className="skill-category-primary">deine Brand</span> oder <span className="skill-category-primary">dein Business</span>.
                    Von Shopify Development, über Web-Design mit 3D-Animationen bis hin zu KI-Integrationen. Ich bringe <span className="skill-category-primary">deine Ideen</span> zum Leben!
                </p>
                <div className="about-skills">
                    <div className="skill-item skill-item-development">
                        <h3>Development</h3>
                        <div className="skill-list">
                            {developmentSkills.map((skill, index) => (
                                <div key={index} className="skill-line" data-skill={skill}>
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="skill-item skill-item-design">
                        <h3>Design</h3>
                        <div className="skill-list">
                            {designSkills.map((skill, index) => (
                                <div key={index} className="skill-line" data-skill={skill}>
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
