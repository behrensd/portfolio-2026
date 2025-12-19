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
                {showLegal ? 'weniger...' : 'mehr...'}
            </button>

            {showLegal && (
                <div className="footer-legal">
                    <div className="footer-legal-content">
                        <section>
                            <h3>Impressum</h3>
                            <p>
                                Dominik Behrens<br />
                                BAI Solutions<br />
                                Manshardtstraße 13a<br />
                                22119 Hamburg
                            </p>
                            <p>
                                Telefon: +49 170 6967961<br />
                                E-Mail: info@behrens-ai.de
                            </p>
                        </section>

                        <section>
                            <h3>Datenschutz</h3>
                            <p>
                                Diese Website erhebt keine personenbezogenen Daten.
                                Keine Cookies, kein Tracking, keine Analyse.
                            </p>
                        </section>

                        <section>
                            <h3>Urheberrecht</h3>
                            <p>
                                © {new Date().getFullYear()} Dominik Behrens. Alle Rechte vorbehalten.
                                Design, Code und Inhalte erstellt von Dominik Behrens.
                            </p>
                        </section>

                        <section>
                            <h3>Haftung für Inhalte</h3>
                            <p>
                                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte
                                auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
                            </p>
                        </section>
                    </div>
                </div>
            )}
        </footer>
    );
}
