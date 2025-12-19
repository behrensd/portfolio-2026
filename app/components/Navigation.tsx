'use client';

import { useState } from 'react';
import LegalModal from './LegalModal';

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
                    <span className="dock-icon">mehr</span>
                    <span className="dock-indicator"></span>
                </button>
            </nav>

            {/* Legal Modal Component */}
            <LegalModal
                isOpen={showLegal}
                onClose={() => setShowLegal(false)}
            />
        </>
    );
}
