'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Seeded pseudo-random number generator (deterministic, satisfies purity rules)
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateStarData(count: number) {
  const random = createSeededRandom(42);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const r = 600 + random() * 400;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const colorRoll = random();
    if (colorRoll < 0.7) {
      colors[i * 3] = 0.95 + random() * 0.05;
      colors[i * 3 + 1] = 0.95 + random() * 0.05;
      colors[i * 3 + 2] = 0.95 + random() * 0.05;
    } else if (colorRoll < 0.85) {
      colors[i * 3] = 0.95 + random() * 0.05;
      colors[i * 3 + 1] = 0.9 + random() * 0.06;
      colors[i * 3 + 2] = 0.8 + random() * 0.1;
    } else {
      colors[i * 3] = 0.7 + random() * 0.15;
      colors[i * 3 + 1] = 0.8 + random() * 0.1;
      colors[i * 3 + 2] = 0.95 + random() * 0.05;
    }

    sizes[i] = 0.3 + random() * 1.2;
    phases[i] = random() * Math.PI * 2;
  }

  return { positions, colors, sizes, phases };
}

export default function ExploreStars({ count = 4000 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  const starData = useMemo(() => generateStarData(count), [count]);

  const { camera } = useThree();

  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(starData.positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(starData.colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(new Float32Array(starData.sizes), 1));
    geometryRef.current = geo;

    if (pointsRef.current) {
      pointsRef.current.geometry = geo;
    }

    return () => {
      geo.dispose();
    };
  }, [starData]);

  useFrame((_, delta) => {
    if (!pointsRef.current || !geometryRef.current) return;

    timeRef.current += delta;

    // Follow camera position so stars appear infinitely far
    pointsRef.current.position.copy(camera.position);

    // Subtle twinkle by modulating point sizes
    const sizeAttr = geometryRef.current.getAttribute('size') as THREE.BufferAttribute;
    if (!sizeAttr) return;
    const sizeArray = sizeAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const twinkle = 0.7 + 0.3 * Math.sin(timeRef.current * (0.5 + (i % 7) * 0.15) + starData.phases[i]);
      sizeArray[i] = starData.sizes[i] * twinkle;
    }
    sizeAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry />
      <pointsMaterial
        vertexColors
        size={0.8}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
