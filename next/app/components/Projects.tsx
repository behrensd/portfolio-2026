'use client';

const projectsData = [
    {
        id: 0,
        number: '01',
        title: 'Interactive Portfolio',
        description: 'Modern portfolio website featuring smooth animations and scroll-based storytelling for maximum engagement.',
        tags: ['Anime.js', 'GSAP', 'WebGL'],
        mockupSize: 'mockup-medium',
        mockupLabel: 'Portfolio Preview'
    },
    {
        id: 1,
        number: '02',
        title: 'E-Commerce Experience',
        description: 'Custom Shopify store with 3D scroll animations and seamless checkout experience. Built with performance in mind.',
        tags: ['Shopify', 'Three.js', 'GSAP'],
        mockupSize: 'mockup-large',
        mockupLabel: 'E-Commerce Storefront'
    },
    {
        id: 2,
        number: '03',
        title: 'Business Website',
        description: 'Complete web solution with SEO optimization, email infrastructure, and GDPR compliance for German market.',
        tags: ['SEO', 'Email Setup', 'Analytics'],
        mockupSize: 'mockup-small',
        mockupLabel: 'Business Site'
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
                                <div className="project-tags">
                                    {project.tags.map((tag, index) => (
                                        <span key={index} className="tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className={`mockup-container ${project.mockupSize}`}>
                                <div className="mockup-placeholder">
                                    <span className="mockup-label">{project.mockupLabel}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
