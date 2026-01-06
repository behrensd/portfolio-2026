'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LaserBeamProps {
    start: THREE.Vector3;
    end: THREE.Vector3;
    visible: boolean;
    duration?: number;
    color?: string;
    onComplete?: () => void;
}

/**
 * Laser beam visual effect for shooting
 * Renders a glowing line from start to end point with fade animation
 */
export default function LaserBeam({
    start,
    end,
    visible,
    duration = 150,
    color = '#ff6b35',
    onComplete
}: LaserBeamProps) {
    const lineRef = useRef<THREE.Line>(null);
    const materialRef = useRef<THREE.LineBasicMaterial>(null);
    const startTimeRef = useRef<number>(0);
    const isActiveRef = useRef(false);

    // Create line geometry
    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(6); // 2 points * 3 coordinates
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geo;
    }, []);

    // Update geometry when start/end change
    useEffect(() => {
        if (visible && geometry) {
            const positions = geometry.attributes.position.array as Float32Array;
            positions[0] = start.x;
            positions[1] = start.y;
            positions[2] = start.z;
            positions[3] = end.x;
            positions[4] = end.y;
            positions[5] = end.z;
            geometry.attributes.position.needsUpdate = true;

            // Reset animation
            startTimeRef.current = performance.now();
            isActiveRef.current = true;
        }
    }, [visible, start, end, geometry]);

    // Animate opacity fade
    useFrame(() => {
        if (!isActiveRef.current || !materialRef.current) return;

        const elapsed = performance.now() - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Fade out opacity
        materialRef.current.opacity = 1 - progress;

        // Complete callback
        if (progress >= 1) {
            isActiveRef.current = false;
            if (onComplete) {
                onComplete();
            }
        }
    });

    if (!visible && !isActiveRef.current) return null;

    return (
        // @ts-expect-error - R3F intrinsic element type conflicts with SVG line
        <line ref={lineRef} geometry={geometry}>
            <lineBasicMaterial
                ref={materialRef}
                color={color}
                transparent
                opacity={1}
                linewidth={2}
                depthTest={false}
                depthWrite={false}
            />
        </line>
    );
}

/**
 * Enhanced laser beam with glow effect using multiple lines
 */
interface GlowingLaserBeamProps extends LaserBeamProps {
    glowIntensity?: number;
}

export function GlowingLaserBeam({
    start,
    end,
    visible,
    duration = 150,
    color = '#ff6b35',
    glowIntensity = 3,
    onComplete
}: GlowingLaserBeamProps) {
    const groupRef = useRef<THREE.Group>(null);
    const startTimeRef = useRef<number>(0);
    const isActiveRef = useRef(false);

    // Create multiple line geometries for glow effect
    const lines = useMemo(() => {
        const result: { geometry: THREE.BufferGeometry; opacity: number; scale: number }[] = [];

        // Core beam
        result.push({
            geometry: new THREE.BufferGeometry(),
            opacity: 1,
            scale: 1
        });

        // Glow layers
        for (let i = 0; i < glowIntensity; i++) {
            result.push({
                geometry: new THREE.BufferGeometry(),
                opacity: 0.3 - (i * 0.08),
                scale: 1 + (i * 0.3)
            });
        }

        // Initialize all geometries
        result.forEach(line => {
            const positions = new Float32Array(6);
            line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        });

        return result;
    }, [glowIntensity]);

    // Update geometries when positions change
    useEffect(() => {
        if (visible) {
            lines.forEach(line => {
                const positions = line.geometry.attributes.position.array as Float32Array;
                positions[0] = start.x;
                positions[1] = start.y;
                positions[2] = start.z;
                positions[3] = end.x;
                positions[4] = end.y;
                positions[5] = end.z;
                line.geometry.attributes.position.needsUpdate = true;
            });

            startTimeRef.current = performance.now();
            isActiveRef.current = true;
        }
    }, [visible, start, end, lines]);

    // Animate fade
    useFrame(() => {
        if (!isActiveRef.current || !groupRef.current) return;

        const elapsed = performance.now() - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Update all line materials
        groupRef.current.children.forEach((child, index) => {
            if (child instanceof THREE.Line && child.material instanceof THREE.LineBasicMaterial) {
                child.material.opacity = lines[index].opacity * (1 - progress);
            }
        });

        if (progress >= 1) {
            isActiveRef.current = false;
            if (onComplete) {
                onComplete();
            }
        }
    });

    if (!visible && !isActiveRef.current) return null;

    return (
        <group ref={groupRef}>
            {lines.map((lineData, index) => (
                // @ts-expect-error - R3F intrinsic element type conflicts with SVG line
                <line key={index} geometry={lineData.geometry}>
                    <lineBasicMaterial
                        color={color}
                        transparent
                        opacity={lineData.opacity}
                        linewidth={lineData.scale}
                        depthTest={false}
                        depthWrite={false}
                    />
                </line>
            ))}
        </group>
    );
}
