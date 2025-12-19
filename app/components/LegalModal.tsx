'use client';

import { useState, useCallback, useEffect } from 'react';
import { useModalAnimation } from '../hooks/useModalAnimation';
import { legalSections } from '../data/legalContent';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LegalModal({ isOpen, onClose }: LegalModalProps) {
    // Four-state system for GSAP animations
    const [modalState, setModalState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');

    // Callback when animation completes
    const handleAnimationComplete = useCallback((finalState: 'open' | 'closed') => {
        setModalState(finalState);
        if (finalState === 'closed') {
            onClose();
        }
    }, [onClose]);

    // Get modal ref from animation hook
    const modalRef = useModalAnimation(modalState, handleAnimationComplete);

    // Sync external isOpen prop with internal animation state
    useEffect(() => {
        if (isOpen && modalState === 'closed') {
            console.log('🔘 Opening legal modal');
            setModalState('opening');
        } else if (!isOpen && (modalState === 'open' || modalState === 'opening')) {
            console.log('🔘 Closing legal modal');
            setModalState('closing');
        }
    }, [isOpen, modalState]);

    // Close handler
    const handleClose = () => {
        console.log('🔘 User clicked close button');
        setModalState('closing');
    };

    // Only render when not fully closed
    const shouldRender = modalState !== 'closed';

    if (!shouldRender) return null;

    return (
        <div ref={modalRef} className="legal-modal">
            <div className="legal-modal-content">
                <button
                    className="legal-modal-close"
                    onClick={handleClose}
                    aria-label="Schließen"
                >
                    ×
                </button>

                <div className="legal-modal-scroll">
                    {legalSections.map((section, index) => (
                        <section key={index} className="legal-section">
                            <h2>{section.title}</h2>
                            {Array.isArray(section.content) ? (
                                <p>
                                    {section.content.map((line, lineIndex) => (
                                        <span key={lineIndex}>
                                            {line}
                                            {lineIndex < section.content.length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            ) : (
                                <p>{section.content}</p>
                            )}
                            {section.link && (
                                <p>
                                    <a
                                        href={section.link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {section.link.text}
                                    </a>
                                </p>
                            )}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
