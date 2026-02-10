'use client';

import { useState, useEffect, useCallback } from 'react';
import { useExploreStore } from '../../stores/useExploreStore';

export default function ExploreHUD() {
  const isActive = useExploreStore((s) => s.isActive);
  const pointerLocked = useExploreStore((s) => s.pointerLocked);
  const nearestPlanet = useExploreStore((s) => s.nearestPlanet);
  const exitExplore = useExploreStore((s) => s.exitExplore);
  const [hintsVisible, setHintsVisible] = useState(true);

  // Reset + auto-hide hints when entering explore mode
  useEffect(() => {
    if (!isActive) return;
    // Show hints for 5s when entering explore mode, then fade
    const timer = setTimeout(() => setHintsVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [isActive]);

  const handleExit = useCallback(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    exitExplore();
  }, [exitExplore]);

  // Listen for Escape key to exit
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        handleExit();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isActive, handleExit]);

  if (!isActive) return null;

  return (
    <div className="explore-hud">
      {/* Crosshair */}
      <div className="explore-crosshair" />

      {/* Pointer lock lost overlay */}
      {!pointerLocked && (
        <div className="explore-resume-overlay">
          <span className="explore-resume-text">Klicke um fortzufahren</span>
        </div>
      )}

      {/* Planet proximity indicator */}
      {nearestPlanet && pointerLocked && (
        <div className="explore-planet-indicator">
          <span className="explore-planet-indicator-dot" />
          Projekt in der Nähe
        </div>
      )}

      {/* Controls hint */}
      <div
        className="explore-hints"
        style={{ opacity: hintsVisible ? 1 : 0 }}
      >
        WASD bewegen &middot; Maus umsehen &middot; Shift boost
      </div>

      {/* ESC button */}
      <button
        className="explore-esc-btn"
        onClick={handleExit}
        type="button"
      >
        ESC
      </button>
    </div>
  );
}
