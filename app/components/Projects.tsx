'use client';

import { useState } from 'react';
import ProjectVideo from './ProjectVideo';

// Projects ordered chronologically: newest (top) to oldest (bottom)
const projectsData = [
    {
        id: 1,
        number: '12/2025',
        title: 'Der BANDOPRINZ Onlineshop',
        description: 'Shopify-Store mit 3D-Produktviewer und Google Veo Intro-Video. Performance-optimiert für maximale Conversion-Raten.',
        role: 'Full-Stack Shopify Development inklusive Custom Theme, Three.js Produktviewer und optimiertem Checkout-Flow. Mobile-First Responsive Design.',
        tags: ['Shopify Liquid', 'Three.js', 'GSAP', 'Blender'],
        mockupSize: 'mockup-large',
        mockupLabel: 'E-Commerce Preview',
        url: '#',
    },
    {
        id: 0,
        number: '09/2025',
        title: 'Creator Portfolio',
        description: 'Eine Portfolio-Seite mit maßgeschneiderter 3D-Animation für ein Hamburger Creator-Kollektiv. Interaktives Reißverschluss-Intro für maximale Wiedererkennung.',
        role: 'Vollständige technische Entwicklung und Implementierung. Design in enger Zusammenarbeit mit dem Kunden. 3D-Modell und Animation von Motion Designer lw25_3d.',
        tags: ['Next.js', 'Tailwind CSS', 'GSAP', 'Blender'],
        mockupSize: 'mockup-medium',
        mockupLabel: 'Warmanziehen Preview',
        videoUrl: 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/videos/wa-mockup-v2.mp4',
        url: 'https://warmanziehen-v2.vercel.app',
        credits: {
            motionDesigner: 'lw25_3d',
            instagramHandle: '@lw25_3d'
        }
    },
    {
        id: 2,
        number: '07/2025',
        title: 'Girooo!',
        description: 'Online Präsenz für Giro di Pizza. SEO-optimiert, mit integriertem Event-Kalendar und einem modernen Design.',
        role: 'Konzeption und Entwicklung der Webseite. Integration von Event Kalendar, Kontaktformular, Google Analytics und SEO-Optimierung.',
        tags: ['Next.js', 'Tailwind CSS', 'Google Analytics', 'Resend'],
        mockupSize: 'mockup-medium',
        mockupLabel: 'Business Preview',
        mockups: [
            {
                type: 'video',
                url: 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/videos/gdp-desktop-mockup.mp4',
                label: 'Desktop'
            },
            {
                type: 'image',
                url: 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/images/gdp-about-page.jpg',
                label: 'About Page'
            },
            {
                type: 'image',
                url: 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/images/gdp-screenshot.png',
                label: 'Home Page'
            },
            {
                type: 'video',
                url: 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/videos/gdp-mobile-mockup.mp4',
                label: 'Mobile'
            }
        ],
        url: 'girodipizza.de',
    }
];

export default function Projects() {
    const [expandedMockup, setExpandedMockup] = useState<string | null>(null);

    const toggleMockup = (projectId: number, mockupIndex: number) => {
        const key = `${projectId}-${mockupIndex}`;
        setExpandedMockup(expandedMockup === key ? null : key);
    };

    return (
        <section id="projects" className="content-tile">
            <div className="tile-inner">
                <h2 className="section-title">Meine Werke</h2>
                
                {projectsData.map((project) => (
                    <div 
                        key={project.id} 
                        className="project-item" 
                        data-project={project.id}
                    >
                        <div 
                            className="project-number" 
                            data-speed={project.id === 0 || project.id === 2 ? "0.5" : undefined}
                        >
                            {project.number}
                        </div>
                        <div className="project-content">
                            <div 
                                className="project-info" 
                                data-speed={project.id === 0 || project.id === 2 ? "0.85" : undefined}
                            >
                                <h3 className="project-title">{project.title}</h3>
                                <p className="project-description">{project.description}</p>
                                
                                {project.role && (
                                    <p className="project-role">{project.role}</p>
                                )}
                            
                                
                                {project.tags && (
                                    <div className="project-tags">
                                        {project.tags.map((tag, index) => (
                                            <span key={index} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                                
                                {project.url && project.url !== '#' && (
                                    <a 
                                        href={project.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="project-link"
                                    >
                                        <span>View Site</span>
                                        <svg 
                                            width="16" 
                                            height="16" 
                                            viewBox="0 0 16 16" 
                                            fill="none"
                                            className="link-arrow"
                                        >
                                            <path 
                                                d="M4 12L12 4M12 4H6M12 4V10" 
                                                stroke="currentColor" 
                                                strokeWidth="2" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </a>
                                )}
                                
                                {project.credits && (
                                    <p className="project-credits">
                                        3D Animation: <a 
                                            href={`https://instagram.com/${project.credits.motionDesigner}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="credit-link"
                                        >
                                            {project.credits.instagramHandle}
                                        </a>
                                    </p>
                                )}
                            </div>
                            <div className={`mockup-container ${project.mockupSize}`}>
                                {project.mockups ? (
                                    <div className="mockup-grid">
                                        {project.mockups.map((mockup, index) => {
                                            const mockupKey = `${project.id}-${index}`;
                                            const isExpanded = expandedMockup === mockupKey;

                                            return (
                                                <div
                                                    key={index}
                                                    className={`mockup-item ${isExpanded ? 'expanded' : ''}`}
                                                    onClick={() => toggleMockup(project.id, index)}
                                                >
                                                    {isExpanded && (
                                                        <button
                                                            className="mockup-close"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedMockup(null);
                                                            }}
                                                            aria-label="Close"
                                                        >
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                                <path
                                                                    d="M18 6L6 18M6 6L18 18"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    <div className="mockup-expand-icon">
                                                        <svg viewBox="0 0 24 24" fill="none">
                                                            <path
                                                                d="M9 3H5C3.89543 3 3 3.89543 3 5V9M21 9V5C21 3.89543 20.1046 3 19 3H15M15 21H19C20.1046 21 21 20.1046 21 19V15M3 15V19C3 20.1046 3.89543 21 5 21H9"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                    </div>
                                                    {mockup.type === 'video' ? (
                                                        <ProjectVideo
                                                            src={mockup.url}
                                                            className="mockup-media"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={mockup.url}
                                                            alt={mockup.label}
                                                            className="mockup-media"
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : project.videoUrl ? (
                                    <ProjectVideo
                                        src={project.videoUrl}
                                        className="mockup-video"
                                    />
                                ) : (
                                    <div className="mockup-placeholder">
                                        <span className="mockup-label">{project.mockupLabel}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
