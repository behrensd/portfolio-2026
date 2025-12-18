'use client';

export default function Contact() {
    return (
        <section id="contact" className="content-tile">
            <div className="tile-content" data-speed="1">
                <div className="contact-content">
                    <h2 className="section-title" data-speed="0.8">Erstgespräch vereinbaren</h2>
                    <p className="contact-description" data-speed="0.9">
                        <span style={{ color: '#ff6a00' }}>
                            Keine Lust auf generische Designs? Lass uns deine Webpräsenz zum Leben erwecken!
                        </span>
                    </p>
                    <div className="contact-links" data-speed="0.95">
                        <a 
                            href="mailto:info@behrens-ai.de" 
                            className="contact-link"
                        >
                            Email
                        </a>
                        <a 
                            href="https://instagram.com/040tech" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="contact-link"
                        >
                            Instagram
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
