'use client';

import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createFragmentGeometry } from '../utils/armillaryGeometry';
import { updateAllFragments } from '../utils/fragmentPhysics';
import { type FragmentState } from '../utils/fragmentPool';
import { GlowingLaserBeam } from './LaserBeam';
import type { UseRockShootingGameReturn } from '../hooks/useRockShootingGame';

interface RockShootingGameProps {
    gameState: UseRockShootingGameReturn;
    armillaryMeshRef: React.RefObject<THREE.InstancedMesh | null>;
}

/**
 * Main game component handling fragment rendering and raycasting
 */
export default function RockShootingGame({
    gameState,
    armillaryMeshRef
}: RockShootingGameProps) {
    const { camera, raycaster } = useThree();

    // Laser beam state
    const [laserVisible, setLaserVisible] = useState(false);
    const [laserStart, setLaserStart] = useState(new THREE.Vector3());
    const [laserEnd, setLaserEnd] = useState(new THREE.Vector3());

    // Fragment rendering
    const fragmentMeshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Create fragment geometry (shared across all fragments)
    const fragmentGeometry = useMemo(() => createFragmentGeometry(42), []);

    // Create fragment material (similar to rock material)
    const fragmentMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: 0x999999,
        roughness: 0.9,
        metalness: 0.0,
        flatShading: true,
        transparent: true,
        opacity: 1
    }), []);

    // Load textures for fragments (same as rocks)
    useEffect(() => {
        const loader = new THREE.TextureLoader();

        loader.load('/volcanic-rock-albedo.jpg', (tex) => {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.colorSpace = THREE.SRGBColorSpace;
            fragmentMaterial.map = tex;
            fragmentMaterial.needsUpdate = true;
        });
    }, [fragmentMaterial]);

    // Get max fragments from pool
    const maxFragments = gameState.isMobile ? 100 : 200;

    /**
     * Perform raycast to detect rock hit
     */
    const performRaycast = useCallback((
        clientX: number,
        clientY: number
    ): { hit: boolean; rockId: number | null; point: THREE.Vector3 } => {
        if (!armillaryMeshRef.current) {
            return { hit: false, rockId: null, point: new THREE.Vector3() };
        }

        // Calculate NDC from screen coordinates
        const ndc = new THREE.Vector2(
            (clientX / window.innerWidth) * 2 - 1,
            -(clientY / window.innerHeight) * 2 + 1
        );

        // Setup raycaster
        raycaster.setFromCamera(ndc, camera);

        // Intersect with armillary mesh
        const intersects = raycaster.intersectObject(armillaryMeshRef.current, false);

        if (intersects.length > 0) {
            const intersection = intersects[0];
            const instanceId = intersection.instanceId;

            if (instanceId !== undefined) {
                // Check if rock is already destroyed
                if (!gameState.destroyedRockIdsRef.current.has(instanceId)) {
                    return {
                        hit: true,
                        rockId: instanceId,
                        point: intersection.point.clone()
                    };
                }
            }
        }

        // Return the point where the ray intersects the z=0 plane for miss visualization
        const planeNormal = new THREE.Vector3(0, 0, 1);
        const planePoint = new THREE.Vector3(0, 0, 0);
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, planePoint);

        const missPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, missPoint);

        return {
            hit: false,
            rockId: null,
            point: missPoint || new THREE.Vector3()
        };
    }, [armillaryMeshRef, camera, raycaster, gameState.destroyedRockIdsRef]);

    /**
     * Handle game click/shot
     */
    const handleShot = useCallback((clientX: number, clientY: number) => {
        const { hit, rockId, point } = performRaycast(clientX, clientY);

        // Show laser beam
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        const beamStart = camera.position.clone().add(cameraDirection.multiplyScalar(0.5));

        setLaserStart(beamStart);
        setLaserEnd(point);
        setLaserVisible(true);

        // Process the shot
        gameState.handleShot(rockId, point);
    }, [performRaycast, camera, gameState]);

    /**
     * Update fragment rendering
     */
    useFrame((_, delta) => {
        if (!fragmentMeshRef.current) return;

        const fragments = gameState.fragmentPool.getAll();

        // Update physics for all active fragments
        const toRelease = updateAllFragments(fragments, delta);
        toRelease.forEach(frag => gameState.fragmentPool.release(frag));

        // Cleanup expired explosions
        gameState.cleanupExplosions();

        // Update fragment instance matrices
        fragments.forEach((frag: FragmentState, i: number) => {
            if (frag.active) {
                dummy.position.copy(frag.position);
                dummy.rotation.copy(frag.rotation);
                dummy.scale.setScalar(frag.scale);
            } else {
                // Hide inactive fragments
                dummy.scale.setScalar(0);
            }

            dummy.updateMatrix();
            fragmentMeshRef.current!.setMatrixAt(i, dummy.matrix);
        });

        fragmentMeshRef.current.instanceMatrix.needsUpdate = true;
    });

    // Expose handleShot for external click handling
    useEffect(() => {
        // Store handleShot on window for click intercept layer to call
        (window as unknown as { __gameHandleShot?: typeof handleShot }).__gameHandleShot = handleShot;

        return () => {
            delete (window as unknown as { __gameHandleShot?: typeof handleShot }).__gameHandleShot;
        };
    }, [handleShot]);

    return (
        <>
            {/* Fragment explosion particles */}
            <instancedMesh
                ref={fragmentMeshRef}
                args={[fragmentGeometry, fragmentMaterial, maxFragments]}
                frustumCulled={false}
            />

            {/* Laser beam effect */}
            <GlowingLaserBeam
                start={laserStart}
                end={laserEnd}
                visible={laserVisible}
                duration={150}
                color="#ff6b35"
                glowIntensity={3}
                onComplete={() => setLaserVisible(false)}
            />
        </>
    );
}
