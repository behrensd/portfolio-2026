import * as THREE from 'three';

/**
 * Fragment state for explosion particles
 */
export interface FragmentState {
    active: boolean;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    rotation: THREE.Euler;
    angularVelocity: THREE.Vector3;
    scale: number;
    opacity: number;
    lifetime: number;      // Total lifetime in ms
    elapsed: number;       // Elapsed time in ms
    matrixIndex: number;   // Index in InstancedMesh
}

/**
 * Object pool for explosion fragments
 * Pre-allocates all fragment states to avoid GC during gameplay
 */
class FragmentPool {
    private pool: FragmentState[] = [];
    private maxFragments: number;
    private initialized: boolean = false;

    constructor(maxFragments: number = 200) {
        this.maxFragments = maxFragments;
    }

    /**
     * Initialize the pool with pre-allocated fragment states
     */
    init(): void {
        if (this.initialized) return;

        for (let i = 0; i < this.maxFragments; i++) {
            this.pool.push({
                active: false,
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                rotation: new THREE.Euler(),
                angularVelocity: new THREE.Vector3(),
                scale: 1,
                opacity: 1,
                lifetime: 2000,
                elapsed: 0,
                matrixIndex: i
            });
        }

        this.initialized = true;
    }

    /**
     * Acquire fragments from the pool
     * @param count Number of fragments to acquire
     * @returns Array of available fragments (may be fewer than requested if pool exhausted)
     */
    acquire(count: number): FragmentState[] {
        if (!this.initialized) this.init();

        const acquired: FragmentState[] = [];

        for (const frag of this.pool) {
            if (!frag.active && acquired.length < count) {
                // Reset fragment state
                frag.active = true;
                frag.elapsed = 0;
                frag.opacity = 1;
                frag.scale = 1;
                frag.position.set(0, 0, 0);
                frag.velocity.set(0, 0, 0);
                frag.rotation.set(0, 0, 0);
                frag.angularVelocity.set(0, 0, 0);

                acquired.push(frag);
            }

            if (acquired.length >= count) break;
        }

        return acquired;
    }

    /**
     * Release a fragment back to the pool
     */
    release(frag: FragmentState): void {
        frag.active = false;
        frag.elapsed = 0;
    }

    /**
     * Release all fragments back to the pool
     */
    releaseAll(): void {
        for (const frag of this.pool) {
            frag.active = false;
            frag.elapsed = 0;
        }
    }

    /**
     * Get all fragments (for rendering)
     */
    getAll(): FragmentState[] {
        return this.pool;
    }

    /**
     * Get count of active fragments
     */
    getActiveCount(): number {
        return this.pool.filter(f => f.active).length;
    }

    /**
     * Check if pool is initialized
     */
    isInitialized(): boolean {
        return this.initialized;
    }
}

// Desktop pool (200 fragments)
export const desktopFragmentPool = new FragmentPool(200);

// Mobile pool (100 fragments for performance)
export const mobileFragmentPool = new FragmentPool(100);

/**
 * Get the appropriate fragment pool based on device
 */
export function getFragmentPool(isMobile: boolean): FragmentPool {
    return isMobile ? mobileFragmentPool : desktopFragmentPool;
}
