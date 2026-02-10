'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  planetVertexShader,
  planetFragmentShader,
  atmosphereVertexShader,
  atmosphereFragmentShader,
} from '../../shaders/planetShaders';

interface PlanetProps {
  id: string;
  position: [number, number, number];
  radius: number;
  colors: { primary: string; secondary: string; atmosphere: string };
  noiseConfig: { scale: number; speed: number; octaves: number; distortion: number };
  rotationSpeed: number;
}

export default function Planet({ position, radius, colors, noiseConfig, rotationSpeed }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(colors.primary) },
    uColor2: { value: new THREE.Color(colors.secondary) },
    uNoiseScale: { value: noiseConfig.scale },
    uDistortion: { value: noiseConfig.distortion },
  }), [colors.primary, colors.secondary, noiseConfig.scale, noiseConfig.distortion]);

  const atmosUniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(colors.atmosphere) },
    uIntensity: { value: 0.6 },
  }), [colors.atmosphere]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta * noiseConfig.speed * 50;
    }
  });

  return (
    <group position={position}>
      {/* Main planet body */}
      <mesh ref={meshRef} frustumCulled>
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={planetVertexShader}
          fragmentShader={planetFragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* Atmosphere glow (BackSide Fresnel) */}
      <mesh frustumCulled>
        <sphereGeometry args={[radius * 1.15, 32, 32]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={atmosUniforms}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Local point light */}
      <pointLight
        color={colors.atmosphere}
        intensity={2}
        distance={radius * 10}
        position={[radius * 0.5, radius * 0.3, radius * 0.5]}
      />
    </group>
  );
}
