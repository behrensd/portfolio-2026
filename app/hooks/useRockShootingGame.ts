'use client';

import { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { getFragmentPool, type FragmentState } from '../utils/fragmentPool';
import { initializeFragmentVelocity, getExplosionConfig } from '../utils/fragmentPhysics';
import { detectViewport } from '../utils/viewportConfig';

/**
 * Explosion state tracking
 */
export interface ExplosionState {
    id: string;
    rockId: number;
    origin: THREE.Vector3;
    fragments: FragmentState[];
    startTime: number;
    lifetime: number;
}

/**
 * Simplified hook for interactive rock destruction
 * No timer, no score - just explosions
 */
export function useRockShootingGame() {
    const viewport = detectViewport();
    const isMobile = viewport.isMobile || viewport.isTablet;

    // Refs for mutable state
    const destroyedRockIdsRef = useRef<Set<number>>(new Set());
    const activeExplosionsRef = useRef<ExplosionState[]>([]);

    // Get appropriate fragment pool and config
    const fragmentPool = getFragmentPool(isMobile);
    const explosionConfig = getExplosionConfig(isMobile);

    // Maximum concurrent explosions
    const maxExplosions = isMobile ? 3 : 5;

    // Initialize fragment pool on mount
    useEffect(() => {
        fragmentPool.init();
    }, [fragmentPool]);

    /**
     * Spawn an explosion at a rock position
     */
    const spawnExplosion = useCallback((rockId: number, hitPoint: THREE.Vector3): boolean => {
        // Check if rock is already destroyed
        if (destroyedRockIdsRef.current.has(rockId)) {
            return false;
        }

        // Enforce explosion limit
        if (activeExplosionsRef.current.length >= maxExplosions) {
            const oldest = activeExplosionsRef.current.shift();
            if (oldest) {
                oldest.fragments.forEach(frag => fragmentPool.release(frag));
            }
        }

        // Acquire fragments from pool
        const fragments = fragmentPool.acquire(explosionConfig.fragmentCount);

        if (fragments.length === 0) {
            return false;
        }

        // Initialize fragment velocities
        const seed = Date.now() + rockId;
        fragments.forEach(frag => {
            frag.lifetime = explosionConfig.lifetime +
                (Math.random() - 0.5) * explosionConfig.lifetimeVariance;
            initializeFragmentVelocity(frag, hitPoint, seed);
        });

        // Create explosion state
        const explosion: ExplosionState = {
            id: `explosion-${Date.now()}-${rockId}`,
            rockId,
            origin: hitPoint.clone(),
            fragments,
            startTime: performance.now(),
            lifetime: explosionConfig.lifetime + explosionConfig.lifetimeVariance
        };

        activeExplosionsRef.current.push(explosion);
        destroyedRockIdsRef.current.add(rockId);

        return true;
    }, [fragmentPool, explosionConfig, maxExplosions]);

    /**
     * Handle a click/tap shot
     */
    const handleShot = useCallback((hitRockId: number | null, hitPoint: THREE.Vector3): boolean => {
        if (hitRockId === null) {
            return false;
        }
        return spawnExplosion(hitRockId, hitPoint);
    }, [spawnExplosion]);

    /**
     * Cleanup expired explosions - call in useFrame
     */
    const cleanupExplosions = useCallback(() => {
        const now = performance.now();

        activeExplosionsRef.current = activeExplosionsRef.current.filter(explosion => {
            if (now - explosion.startTime >= explosion.lifetime) {
                explosion.fragments.forEach(frag => fragmentPool.release(frag));
                return false;
            }
            return true;
        });
    }, [fragmentPool]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            fragmentPool.releaseAll();
        };
    }, [fragmentPool]);

    return {
        destroyedRockIdsRef,
        activeExplosionsRef,
        fragmentPool,
        handleShot,
        cleanupExplosions,
        isMobile,
        explosionConfig
    };
}

export type UseRockShootingGameReturn = ReturnType<typeof useRockShootingGame>;
