'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { detectViewport } from '../utils/viewportConfig';
import {
    createRockGeometry,
    initializeParticles,
    positionOnRing,
    calculateOrbitalOffset,
    seededRandom,
    RING_CONFIGS,
    MOBILE_RING_CONFIGS,
    getTotalParticleCount,
    type ParticleState,
    type ArmillaryRing
} from '../utils/armillaryGeometry';
import {
    calculatePhase,
    calculateSphereCenter,
    easeOutCubic,
    easeInOutQuad,
    easeOutQuad,
    type ArmillaryPhase
} from '../hooks/useArmillaryScrollProgress';

interface ArmillarySphereProps {
    scrollProgress: React.RefObject<number>;
    meshRef?: React.RefObject<THREE.InstancedMesh | null>;
    destroyedRockIdsRef?: React.RefObject<Set<number>>;
}

/**
 * Main Armillary Sphere component
 * Renders moonrock particles that assemble into a sphere and drift around contact
 */
export default function ArmillarySphere({
    scrollProgress,
    meshRef: externalMeshRef,
    destroyedRockIdsRef
}: ArmillarySphereProps) {
    const viewport = useMemo(() => detectViewport(), []);
    const isMobile = viewport.isMobile || viewport.isTablet;

    // Select ring configuration based on device
    const rings = useMemo(() =>
        isMobile ? MOBILE_RING_CONFIGS : RING_CONFIGS,
        [isMobile]
    );

    const particleCount = useMemo(() =>
        getTotalParticleCount(rings),
        [rings]
    );

    return (
        <group position={[0, 0, 0]}>
            <RockParticles
                rings={rings}
                particleCount={particleCount}
                scrollProgress={scrollProgress}
                isMobile={isMobile}
                externalMeshRef={externalMeshRef}
                destroyedRockIdsRef={destroyedRockIdsRef}
            />
        </group>
    );
}

/**
 * Instanced mesh rendering all rock particles
 */
interface RockParticlesProps {
    rings: ArmillaryRing[];
    particleCount: number;
    scrollProgress: React.RefObject<number>;
    isMobile: boolean;
    externalMeshRef?: React.RefObject<THREE.InstancedMesh | null>;
    destroyedRockIdsRef?: React.RefObject<Set<number>>;
}

function RockParticles({
    rings,
    particleCount,
    scrollProgress,
    isMobile,
    externalMeshRef,
    destroyedRockIdsRef
}: RockParticlesProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    // Sync external mesh ref for raycasting
    useEffect(() => {
        if (externalMeshRef && meshRef.current) {
            (externalMeshRef as React.MutableRefObject<THREE.InstancedMesh | null>).current = meshRef.current;
        }
    }, [externalMeshRef]);

    // Pre-allocated objects to avoid GC
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const tempVec = useMemo(() => new THREE.Vector3(), []);
    const tempVec2 = useMemo(() => new THREE.Vector3(), []);

    // Time tracking for animations
    const timeRef = useRef(0);
    const frameCount = useRef(0);


    // Create rock geometry (single instance shared across all particles)
    const rockGeometry = useMemo(() => createRockGeometry(42), []);

    // Load textures manually (non-blocking)
    const texturesRef = useRef<{
        albedo: THREE.Texture | null;
        normal: THREE.Texture | null;
        roughness: THREE.Texture | null;
    }>({ albedo: null, normal: null, roughness: null });

    // Create material (will be updated when textures load)
    // Matte rocky appearance - high roughness, no metalness
    const rockMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: 0x999999,
        roughness: 0.95,
        metalness: 0.0,
        flatShading: true,
        side: THREE.DoubleSide
    }), []);

    // Load textures asynchronously (non-blocking)
    useEffect(() => {
        const loader = new THREE.TextureLoader();

        const onError = (url: string) => (err: unknown) => {
            console.error(`Failed to load texture: ${url}`, err);
        };

        loader.load(
            '/volcanic-rock-albedo.jpg',
            (tex) => {
                console.log('Albedo texture loaded');
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.colorSpace = THREE.SRGBColorSpace;
                texturesRef.current.albedo = tex;
                rockMaterial.map = tex;
                rockMaterial.needsUpdate = true;
            },
            undefined,
            onError('/volcanic-rock-albedo.jpg')
        );

        loader.load(
            '/volcanic-rock-normal.png',
            (tex) => {
                console.log('Normal texture loaded');
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                texturesRef.current.normal = tex;
                rockMaterial.normalMap = tex;
                rockMaterial.normalScale = new THREE.Vector2(0.5, 0.5);
                rockMaterial.flatShading = false;
                rockMaterial.needsUpdate = true;
            },
            undefined,
            onError('/volcanic-rock-normal.png')
        );

        loader.load(
            '/volcanic-rock-roughness.jpg',
            (tex) => {
                console.log('Roughness texture loaded');
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                texturesRef.current.roughness = tex;
                rockMaterial.roughnessMap = tex;
                rockMaterial.needsUpdate = true;
            },
            undefined,
            onError('/volcanic-rock-roughness.jpg')
        );
    }, [rockMaterial]);

    // Initialize particle states
    const particles = useMemo(() => {
        const random = seededRandom(12345);
        return initializeParticles(rings, random);
    }, [rings]);

    // Animation loop
    useFrame((_, delta) => {
        if (!meshRef.current) return;

        // Frame skipping for mobile
        frameCount.current++;
        if (isMobile && frameCount.current % 2 !== 0) return;


        timeRef.current += delta;
        const time = timeRef.current;
        const progress = scrollProgress.current ?? 0;

        const { phase, phaseProgress } = calculatePhase(progress);

        // Calculate choreographed sphere center based on scroll
        const sphereCenter = calculateSphereCenter(progress);

        // Get destroyed rocks set
        const destroyedRocks = destroyedRockIdsRef?.current;

        // Update each particle
        particles.forEach((particle, i) => {
            // Check if rock is destroyed (shot in game)
            if (destroyedRocks && destroyedRocks.has(particle.id)) {
                // Hide destroyed rock
                dummy.scale.setScalar(0);
                dummy.updateMatrix();
                meshRef.current!.setMatrixAt(i, dummy.matrix);
                return;
            }

            const adjustedTime = time;

            // Calculate current position based on phase
            const position = interpolatePosition(
                particle,
                phase,
                phaseProgress,
                adjustedTime,
                rings,
                tempVec,
                tempVec2
            );

            // Apply choreographed sphere center offset
            // During drifting, fade out the sphere center offset smoothly
            if (phase === 'drifting') {
                // Blend sphere center out during early drifting for smooth transition
                const fadeOut = 1 - Math.min(1, phaseProgress * 2); // Fade out in first 50% of drifting
                position.x += sphereCenter.x * fadeOut;
                position.y += sphereCenter.y * fadeOut;
                position.z += sphereCenter.z * fadeOut;
            } else {
                position.x += sphereCenter.x;
                position.y += sphereCenter.y;
                position.z += sphereCenter.z;
            }

            // Apply position
            dummy.position.copy(position);

            // Apply scale (with slight pulse during drift phase)
            let scale = particle.scale * 0.15; // Base scale for rocks
            if (phase === 'drifting') {
                scale *= 0.8 + Math.sin(adjustedTime * 2 + particle.id) * 0.1;
            }
            dummy.scale.setScalar(scale);

            // Apply rotation (continuous spin)
            dummy.rotation.x += particle.rotationSpeed.x;
            dummy.rotation.y += particle.rotationSpeed.y;
            dummy.rotation.z += particle.rotationSpeed.z;

            // Update matrix
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh
            ref={meshRef}
            args={[rockGeometry, rockMaterial, particleCount]}
            frustumCulled={true}
        />
    );
}

/**
 * Calculate the "assembled" position for a particle at given time
 * This is used both during assembled phase and as reference for smooth transitions
 */
function getAssembledPosition(
    particle: ParticleState,
    time: number,
    rings: ArmillaryRing[],
    out: THREE.Vector3,
    tempVec: THREE.Vector3
): THREE.Vector3 {
    const ring = rings[particle.ringIndex];

    // Position on ring with self-rotation
    const selfRotAngle = particle.angleOnRing + time * ring.rotationSpeed * 0.5;
    positionOnRing(ring, selfRotAngle, out);

    // Apply ring tumbling
    const rotX = time * ring.rotationSpeed * 0.3;
    const rotY = time * ring.rotationSpeed * 0.5;
    const rotZ = time * ring.rotationSpeed * 0.2 * ring.orbitalDirection;

    // X-axis rotation
    let y1 = out.y * Math.cos(rotX) - out.z * Math.sin(rotX);
    let z1 = out.y * Math.sin(rotX) + out.z * Math.cos(rotX);
    out.y = y1;
    out.z = z1;

    // Y-axis rotation
    let x2 = out.x * Math.cos(rotY) + out.z * Math.sin(rotY);
    let z2 = -out.x * Math.sin(rotY) + out.z * Math.cos(rotY);
    out.x = x2;
    out.z = z2;

    // Z-axis rotation
    let x3 = out.x * Math.cos(rotZ) - out.y * Math.sin(rotZ);
    let y3 = out.x * Math.sin(rotZ) + out.y * Math.cos(rotZ);
    out.x = x3;
    out.y = y3;

    // Add orbital offset
    calculateOrbitalOffset(ring, time, tempVec);
    out.add(tempVec);

    return out;
}

/**
 * Interpolate particle position based on current phase
 * Uses smooth blending between phases for seamless transitions
 */
function interpolatePosition(
    particle: ParticleState,
    phase: ArmillaryPhase,
    phaseProgress: number,
    time: number,
    rings: ArmillaryRing[],
    out: THREE.Vector3,
    tempVec: THREE.Vector3
): THREE.Vector3 {
    // Apply stagger offset for varied timing
    const staggeredProgress = Math.max(0, Math.min(1,
        (phaseProgress - particle.phaseOffset * 0.2) / (1 - particle.phaseOffset * 0.2)
    ));

    // Gentle floating offset (applied to all phases)
    const floatOffset = Math.sin(time * 0.5 + particle.id * 0.7) * 0.12;
    const floatOffsetX = Math.cos(time * 0.3 + particle.id * 0.5) * 0.06;

    switch (phase) {
        case 'scattered':
            // Particles at scattered positions with gentle drift toward assembled position
            out.copy(particle.scatteredPos);
            // Get target assembled position for smooth approach
            getAssembledPosition(particle, time, rings, tempVec, new THREE.Vector3());
            // Very subtle drift toward assembled position
            const driftAmount = phaseProgress * 0.1;
            out.lerp(tempVec, driftAmount);
            // Add floating motion
            out.y += floatOffset;
            out.x += floatOffsetX;
            return out;

        case 'forming':
            // Smoothly transition from current scattered position to assembled position
            out.copy(particle.scatteredPos);
            // Get the CURRENT assembled position (not static ring position)
            getAssembledPosition(particle, time, rings, tempVec, new THREE.Vector3());
            // Smooth lerp to assembled
            out.lerp(tempVec, easeOutCubic(staggeredProgress));
            // Fade out float as forming completes
            out.y += floatOffset * (1 - staggeredProgress * 0.7);
            out.x += floatOffsetX * (1 - staggeredProgress * 0.7);
            return out;

        case 'assembled':
            // Full orbital motion - use helper function
            getAssembledPosition(particle, time, rings, out, tempVec);
            // Subtle float
            out.y += floatOffset * 0.15;
            return out;

        case 'dissolving':
            // Smoothly transition FROM current assembled position TO dispersed
            // Get current assembled position first
            getAssembledPosition(particle, time, rings, out, tempVec);

            // Use smooth cubic easing for gentle dissolution
            const dissolveEase = easeOutCubic(staggeredProgress);

            // Lerp toward dispersed position
            out.lerp(particle.dispersedPos, dissolveEase);

            // Gradual float increase as dissolving
            out.y += floatOffset * (0.15 + dissolveEase * 0.4);
            out.x += floatOffsetX * dissolveEase * 0.5;

            // Add slight outward drift for organic feel
            const driftDir = out.clone().normalize();
            out.x += driftDir.x * dissolveEase * 0.3;
            out.z += driftDir.z * dissolveEase * 0.2;
            return out;

        case 'drifting':
            // Organic wandering paths - each particle has unique trajectory
            // Use layered sine waves at different frequencies for natural motion
            const seed = particle.seed;
            const idOffset = particle.id * 0.7;

            // Multiple frequency layers for organic movement
            const slowDrift = time * 0.04;
            const medDrift = time * 0.09;
            const fastDrift = time * 0.18;

            // Unique wandering path per particle
            const wanderX =
                Math.sin(slowDrift + seed * 0.1) * 3 +
                Math.sin(medDrift * 1.3 + idOffset) * 1.5 +
                Math.cos(fastDrift * 0.7 + seed * 0.3) * 0.6;

            const wanderY =
                Math.cos(slowDrift * 0.8 + seed * 0.2) * 1.2 +
                Math.sin(medDrift + idOffset * 1.2) * 0.6 +
                Math.sin(fastDrift * 0.9 + seed * 0.15) * 0.3;

            const wanderZ =
                Math.sin(slowDrift * 0.6 + seed * 0.25) * 2.5 +
                Math.cos(medDrift * 0.9 + idOffset * 0.8) * 1.2 +
                Math.sin(fastDrift * 0.5 + seed * 0.2) * 0.5;

            // Start from dispersed position and gradually spread out
            // This creates smooth transition from dissolving phase
            const driftProgress = easeOutCubic(staggeredProgress);

            // Wandering target position (fragments spread across lower screen)
            const targetX = wanderX * 0.5;
            const targetY = -2 + wanderY * 0.4 + floatOffset;
            const targetZ = wanderZ * 0.4;

            // Blend from dispersed to wandering
            out.copy(particle.dispersedPos);
            out.x += (targetX - particle.dispersedPos.x) * driftProgress;
            out.y += (targetY - particle.dispersedPos.y) * driftProgress;
            out.z += (targetZ - particle.dispersedPos.z) * driftProgress;
            return out;

        default:
            return out.copy(particle.scatteredPos);
    }
}
