'use client';

import { useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ExploreStars from './ExploreStars';
import Planet from './Planet';
import PlayerController from './PlayerController';
import PlanetInfo from './PlanetInfo';
import { explorePlanets } from '../../data/exploreProjects';
import { useExploreStore } from '../../stores/useExploreStore';

// Proximity detection component (runs inside Canvas)
function ProximityDetector() {
  const { camera } = useThree();
  const setNearestPlanet = useExploreStore((s) => s.setNearestPlanet);
  const lastNearest = useRef<string | null>(null);

  useFrame(() => {
    const cameraPos = camera.position;
    let nearest: string | null = null;
    let nearestDist = Infinity;

    for (const planet of explorePlanets) {
      const px = planet.position[0];
      const py = planet.position[1];
      const pz = planet.position[2];
      const dx = cameraPos.x - px;
      const dy = cameraPos.y - py;
      const dz = cameraPos.z - pz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const threshold = planet.radius * 3.5;

      if (dist < threshold && dist < nearestDist) {
        nearest = planet.id;
        nearestDist = dist;
      }
    }

    // Only update store when value actually changes
    if (nearest !== lastNearest.current) {
      lastNearest.current = nearest;
      setNearestPlanet(nearest);
    }
  });

  return null;
}

// The scene contents (inside Canvas)
function Scene() {
  const nearestPlanet = useExploreStore((s) => s.nearestPlanet);

  return (
    <>
      {/* Fog for depth */}
      <fog attach="fog" args={['#000000', 80, 350]} />

      {/* Ambient light - space is dark */}
      <ambientLight intensity={0.15} />

      {/* Subtle center glow at spawn */}
      <pointLight position={[0, 0, 0]} intensity={0.3} distance={60} color="#334455" />

      {/* Stars */}
      <ExploreStars count={4000} />

      {/* Planets */}
      {explorePlanets.map((planet) => (
        <Planet
          key={planet.id}
          id={planet.id}
          position={planet.position}
          radius={planet.radius}
          colors={planet.colors}
          noiseConfig={planet.noise}
          rotationSpeed={planet.rotationSpeed}
        />
      ))}

      {/* Planet info panels */}
      {explorePlanets.map((planet) => (
        <PlanetInfo
          key={`info-${planet.id}`}
          planet={planet}
          visible={nearestPlanet === planet.id}
        />
      ))}

      {/* Player controls */}
      <PlayerController />

      {/* Proximity detection */}
      <ProximityDetector />
    </>
  );
}

export default function SpaceExplorer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    gl.setClearColor('#000000', 1);
    gl.toneMapping = THREE.NoToneMapping;
  }, []);

  return (
    <Canvas
      ref={canvasRef}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      camera={{
        position: [0, 0, 0],
        fov: 70,
        near: 0.1,
        far: 2000,
      }}
      dpr={[1, 1.5]}
      onCreated={onCreated}
      style={{ width: '100%', height: '100%' }}
    >
      <Scene />
    </Canvas>
  );
}
