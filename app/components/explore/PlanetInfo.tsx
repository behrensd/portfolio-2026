'use client';

import { useRef, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { type ExplorePlanet } from '../../data/exploreProjects';

interface PlanetInfoProps {
  planet: ExplorePlanet;
  visible: boolean;
}

export default function PlanetInfo({ planet, visible }: PlanetInfoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.style.opacity = visible ? '1' : '0';
      wrapperRef.current.style.transform = visible ? 'translateX(0)' : 'translateX(-10px)';
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Html
      position={[
        planet.position[0] + planet.radius * 2,
        planet.position[1] + planet.radius * 0.5,
        planet.position[2],
      ]}
      distanceFactor={25}
      style={{ pointerEvents: 'none' }}
      zIndexRange={[100, 0]}
    >
      <div
        ref={wrapperRef}
        className="explore-planet-info"
        style={{
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          opacity: 0,
          transform: 'translateX(-10px)',
        }}
      >
        <div className="explore-planet-info-date">{planet.date}</div>
        <h3 className="explore-planet-info-title">{planet.title}</h3>
        <p className="explore-planet-info-desc">{planet.description}</p>
        <div className="explore-planet-info-tags">
          {planet.tags.map((tag) => (
            <span key={tag} className="explore-planet-info-tag">{tag}</span>
          ))}
        </div>
        <a
          href={planet.url}
          target="_blank"
          rel="noopener noreferrer"
          className="explore-planet-info-link"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          Seite besuchen &rarr;
        </a>
      </div>
    </Html>
  );
}
