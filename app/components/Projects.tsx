'use client';

import ProjectVideo from './ProjectVideo';
import ProjectCarousel from './ProjectCarousel';
import MatrixScramble from './MatrixScramble';

type MockupType = {
    type: 'video' | 'image';
    url: string;
    label: string;
};

type ProjectType = {
    id: number;
    number: string;
    title: string;
    description: string;
    role?: string;
    tags?: string[];
    mockupSize: string;
    mockupLabel: string;
    mockups?: MockupType[];
    videoUrl?: string;
    url?: string;
    credits?: {
        motionDesigner: string;
        instagramHandle: string;
    };
};

// Projects ordered chronologically: newest (top) to oldest (bottom)
const projectsData: ProjectType[] = [
    {
        id: 1,
        number: '12/2025',
        title: 'Der BANDOPRINZ Onlineshop',
        description: 'Shopify-Store mit 3D-Produktviewer und Google Veo Intro-Video. Performance-optimiert für maximale Conversion-Raten.',
        role: 'Full-Stack Shopify Development inklusive Custom Theme, Three.js Produktviewer und optimiertem Checkout-Flow. Mobile-First Responsive Design.',
        tags: ['Shopify Liquid', 'Three.js', 'Blender'],
        mockupSize: 'mockup-large',
        mockupLabel: 'E-Commerce Preview',
        videoUrl: 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/videos/bp-shop-mockup.mp4',
        url: 'https://bandoprinz.com',
        credits: {
            motionDesigner: 'olerichter__',
            instagramHandle: '@olerichter__'
        }
    },
    {
        id: 0,
        number: '09/2025',
        title: 'Creator Portfolio',
        description: 'Eine Portfolio-Seite mit maßgeschneiderter 3D-Animation für ein Hamburger Creator-Kollektiv. Interaktives Reißverschluss-Intro für maximale Wiedererkennung.',
        role: 'Vollständige technische Entwicklung und Implementierung. Design in enger Zusammenarbeit mit dem Kunden. 3D-Modell und Animation von Motion Designer olerichter__.',
        tags: ['Next.js', 'Tailwind CSS', 'GSAP', 'Blender'],
        mockupSize: 'mockup-medium',
        mockupLabel: 'Warmanziehen Preview',
        videoUrl: 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/videos/wa-mockup-v2.mp4',
        url: 'https://warmanziehen-v2.vercel.app',
        credits: {
            motionDesigner: 'olerichter__',
            instagramHandle: '@olerichter__'
        }
    },
    {
        id: 2,
        number: '07/2025',
        title: 'Girooo!',
        description: 'Online Präsenz für Giro di Pizza. SEO-optimiert, mit integriertem Event-Kalendar und einem modernen One-Page Design.',
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
                url: 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/images/gdp-events.jpg',
                label: 'Events'
            },
            {
                type: 'image',
                url: 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/images/gdp-about-page.jpg',
                label: 'About Page'
            },
            {
                type: 'video',
                url: 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/videos/gdp-mobile-mockup.mp4',
                label: 'Mobile'
            },
            {
                type: 'image',
                url: 'https://g2d5m7efa2bhvzth.public.blob.vercel-storage.com/images/gdp-screenshot.png',
                label: 'Home Page'
            }
        ],
        url: 'https://girodipizza.de',
    }
];

export default function Projects() {
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
                            <MatrixScramble 
                                className="project-number-scramble"
                                intensity={0.20}
                                speed={1000}
                            >
                                {project.number}
                            </MatrixScramble>
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
                                        3D Modell und Animation: <a 
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
                                    <ProjectCarousel mockups={project.mockups} />
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
