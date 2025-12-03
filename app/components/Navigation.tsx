'use client';

const navItems = [
    { href: '#hero', label: 'Start', section: 'hero' },
    { href: '#about', label: 'About', section: 'about' },
    { href: '#projects', label: 'Work', section: 'projects' },
    { href: '#contact', label: 'Contact', section: 'contact' }
];

export default function Navigation() {
    return (
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
        </nav>
    );
}
