'use client';

import { useState } from 'react';

const navItems = [
    { href: '#hero', label: 'Start', section: 'hero' },
    { href: '#about', label: 'moin', section: 'about' },
    { href: '#projects', label: 'Projekte', section: 'projects' },
    { href: '#contact', label: 'Kontakt', section: 'contact' }
];

export default function Navigation() {
    const [showLegal, setShowLegal] = useState(false);

    return (
        <>
            <nav className="floating-dock">
                {navItems.map((item) => (
                    <button
                        key={item.section}
                        type="button"
                        className="dock-item"
                        data-section={item.section}
                        data-href={item.href}
                    >
                        <span className="dock-icon">{item.label}</span>
                        <span className="dock-indicator"></span>
                    </button>
                ))}
                <button
                    type="button"
                    className="dock-item"
                    onClick={() => setShowLegal(true)}
                >
                    <span className="dock-icon">mehr...</span>
                    <span className="dock-indicator"></span>
                </button>
            </nav>

            {/* Legal Modal */}
            <div className={`legal-modal ${showLegal ? 'legal-modal--open' : ''}`}>
                <div className="legal-modal-content">
                    <button
                        className="legal-modal-close"
                        onClick={() => setShowLegal(false)}
                        aria-label="Schließen"
                    >
                        ×
                    </button>

                    <div className="legal-modal-scroll">
                        <section className="legal-section">
                            <h2>Impressum</h2>
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

                        <section className="legal-section">
                            <h2>Datenschutz</h2>
                            <p>
                                Diese Website erhebt keine personenbezogenen Daten.
                                Keine Cookies, kein Tracking, keine Analyse.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>Urheberrecht</h2>
                            <p>
                                © {new Date().getFullYear()} Dominik Behrens. Alle Rechte vorbehalten.
                                Design, Code und Inhalte erstellt von Dominik Behrens.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>Haftung für Inhalte</h2>
                            <p>
                                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte
                                auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
                                Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
                                übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach
                                Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>Haftung für Links</h2>
                            <p>
                                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte
                                wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch
                                keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der
                                jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>EU-Streitschlichtung</h2>
                            <p>
                                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
                                    https://ec.europa.eu/consumers/odr/
                                </a>
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>Verantwortlich für den Inhalt</h2>
                            <p>
                                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:<br />
                                Dominik Behrens<br />
                                Anschrift wie oben
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            {/* Modal backdrop */}
            {showLegal && (
                <div
                    className="legal-modal-backdrop"
                    onClick={() => setShowLegal(false)}
                />
            )}
        </>
    );
}
