'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { detectViewport } from '../utils/viewportConfig';
import ArmillarySphere from './ArmillarySphere';
import RockShootingGame from './RockShootingGame';
import ShootingUI from './ShootingUI';
import { useRockShootingGame } from '../hooks/useRockShootingGame';

interface StarsProps {
    count: number;
    scrollY: React.RefObject<number>;
}

function Stars({ count, scrollY }: StarsProps) {
    const pointsRef = useRef<THREE.Points>(null);
    const lastScrollY = useRef(0);

    const { positions, speeds } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 2] = -5 - Math.random() * 25;
            speeds[i] = 0.2 + Math.random() * 0.8;
        }

        return { positions, speeds };
    }, [count]);

    const originalPositions = useRef(new Float32Array(positions));

    useEffect(() => {
        originalPositions.current = new Float32Array(positions);
    }, [positions]);

    useFrame((_, delta) => {
        if (!pointsRef.current) return;

        const geo = pointsRef.current.geometry;
        const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        const currentScroll = scrollY.current ?? 0;
        const scrollDelta = currentScroll - lastScrollY.current;
        lastScrollY.current = currentScroll;

        for (let i = 0; i < count; i++) {
            const speed = speeds[i];
            const idx = i * 3;

            posArray[idx] += scrollDelta * speed * 0.003;
            posArray[idx] += delta * speed * 0.02;
            posArray[idx + 1] += delta * speed * 0.008 * Math.sin(i * 0.5);

            if (posArray[idx] > 35) posArray[idx] = -35;
            if (posArray[idx] < -35) posArray[idx] = 35;
            if (posArray[idx + 1] > 25) posArray[idx + 1] = -25;
            if (posArray[idx + 1] < -25) posArray[idx + 1] = 25;
        }

        posAttr.needsUpdate = true;
        pointsRef.current.rotation.y += delta * 0.002;
    });

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geo;
    }, [positions]);

    return (
        <points ref={pointsRef} geometry={geometry}>
            <pointsMaterial
                size={0.15}
                sizeAttenuation={true}
                transparent
                opacity={0.25}
                color="#ffffff"
                depthWrite={false}
            />
        </points>
    );
}

export default function StarfieldBackground() {
    const [starCount, setStarCount] = useState(150);
    const scrollY = useRef(0);
    const scrollProgress = useRef(0);

    // Ref for raycasting
    const armillaryMeshRef = useRef<THREE.InstancedMesh | null>(null);

    // Interactive destruction (always active)
    const gameState = useRockShootingGame();

    useEffect(() => {
        const viewport = detectViewport();

        if (viewport.isMobile) {
            setStarCount(80);
        } else if (viewport.isTablet) {
            setStarCount(100);
        } else {
            setStarCount(150);
        }

        const handleScroll = () => {
            scrollY.current = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            scrollProgress.current = docHeight > 0 ? window.scrollY / docHeight : 0;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle click/tap to destroy rocks
    const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        let clientX: number, clientY: number;

        if ('touches' in e) {
            const touch = e.touches[0] || (e as React.TouchEvent).changedTouches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const gameHandleShot = (window as unknown as { __gameHandleShot?: (x: number, y: number) => void }).__gameHandleShot;
        if (gameHandleShot) {
            gameHandleShot(clientX, clientY);
        }
    }, []);

    return (
        <>
            {/* Lowkey hint under hero */}
            <ShootingUI />

            <div className="starfield-canvas">
                <Canvas
                    gl={{
                        alpha: true,
                        antialias: false,
                        powerPreference: 'high-performance',
                        toneMapping: THREE.NoToneMapping,
                    }}
                    camera={{ position: [0, 0, 5], fov: 60 }}
                    style={{
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'auto',
                    }}
                    dpr={[1, 1.5]}
                    onPointerDown={handleClick}
                >
                    <Stars count={starCount} scrollY={scrollY} />

                    <ambientLight intensity={1.2} />
                    <directionalLight position={[10, 10, 10]} intensity={2} />
                    <directionalLight position={[-10, -5, 5]} intensity={0.8} />
                    <pointLight position={[0, 0, 8]} intensity={1.5} distance={20} />

                    <ArmillarySphere
                        scrollProgress={scrollProgress}
                        meshRef={armillaryMeshRef}
                        destroyedRockIdsRef={gameState.destroyedRockIdsRef}
                    />

                    <RockShootingGame
                        gameState={gameState}
                        armillaryMeshRef={armillaryMeshRef}
                    />
                </Canvas>
            </div>
        </>
    );
}
