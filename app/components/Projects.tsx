'use client';

import ProjectVideo from './ProjectVideo';

const projectsData = [
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
        id: 1,
        number: '12/2025',
        title: 'Der BANDOPRINZ Onlineshop',
        description: 'Hochwertige Shopify-E-Commerce-Lösung mit immersiver 3D-Produktvisualisierung und nahtloser Checkout-Experience. Performance-optimiert für maximale Conversion-Raten.',
        role: 'Full-Stack Shopify Development inklusive Custom Theme, Three.js Produktviewer und optimiertem Checkout-Flow. Mobile-First Responsive Design.',
        tags: ['Shopify Liquid', 'Three.js', 'GSAP', 'Stripe'],
        mockupSize: 'mockup-large',
        mockupLabel: 'E-Commerce Preview',
        url: '#',
        metrics: ['40% höhere Conversion-Rate', 'Ladezeit unter 1,5s', '60% mehr Mobile-Traffic']
    },
    {
        id: 2,
        number: '07/2025',
        title: 'Giro di Pizza',
        description: 'Komplette digitale Präsenz für einen deutschen B2B-Dienstleister. SEO-optimiert, GDPR-konform mit integrierter E-Mail-Infrastruktur und umfassendem Analytics-Setup.',
        role: 'Konzeption und Entwicklung der gesamten Web-Lösung. Integration von Nodemailer für automatisierte E-Mail-Workflows, Google Analytics Setup und SEO-Optimierung.',
        tags: ['Next.js', 'Tailwind CSS', 'Nodemailer', 'Analytics'],
        mockupSize: 'mockup-small',
        mockupLabel: 'Business Preview',
        url: '#',
        metrics: ['95+ Lighthouse Score', '100% GDPR-Konformität', 'Top-10 Google Rankings']
    }
];

export default function Projects() {
    return (
        <section id="projects" className="content-tile">
            <div className="tile-inner">
                <h2 className="section-title">Selected Work</h2>
                
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
                                
                                {project.metrics && (
                                    <div className="project-metrics">
                                        {project.metrics.map((metric, index) => (
                                            <span key={index} className="metric-item">
                                                {metric}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="project-tags">
                                    {project.tags.map((tag, index) => (
                                        <span key={index} className="tag">{tag}</span>
                                    ))}
                                </div>
                                
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
                                {project.videoUrl ? (
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
