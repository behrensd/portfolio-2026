'use client';

import { useState } from 'react';

export default function Footer() {
    const [showLegal, setShowLegal] = useState(false);

    return (
        <footer className="footer">
            <button
                className="footer-toggle"
                onClick={() => setShowLegal(!showLegal)}
                aria-expanded={showLegal}
            >
                {showLegal ? 'Close' : 'Legal'}
            </button>

            {showLegal && (
                <div className="footer-legal">
                    <div className="footer-legal-content">
                        <section>
                            <h3>Privacy</h3>
                            <p>
                                This site does not collect or store personal data.
                                No cookies, no tracking, no analytics.
                            </p>
                        </section>

                        <section>
                            <h3>Copyright</h3>
                            <p>
                                © {new Date().getFullYear()} Dom Behrens. All rights reserved.
                                Design, code, and content created by Dom Behrens.
                            </p>
                        </section>

                        <section>
                            <h3>Terms of Use</h3>
                            <p>
                                This portfolio is for demonstration purposes.
                                Projects shown may be subject to their own licenses and terms.
                                Contact for permissions regarding content reuse.
                            </p>
                        </section>
                    </div>
                </div>
            )}
        </footer>
    );
}
