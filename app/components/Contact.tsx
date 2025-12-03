'use client';

export default function Contact() {
    return (
        <section id="contact" className="content-tile">
            <div className="tile-content" data-speed="1">
                <div className="contact-content">
                    <h2 className="section-title" data-speed="0.8">Let&apos;s Create Something</h2>
                    <p className="contact-description" data-speed="0.9">
                        Ready to bring your project to life? Let&apos;s talk about how we can 
                        work together to create something exceptional.
                    </p>
                    <div className="contact-links" data-speed="0.95">
                        <a 
                            href="mailto:dom@baisolutions.de" 
                            className="contact-link"
                        >
                            Email
                        </a>
                        <a 
                            href="https://instagram.com/baisolutions.de" 
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
