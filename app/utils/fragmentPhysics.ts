import * as THREE from 'three';
import type { FragmentState } from './fragmentPool';

// Physics constants
const GRAVITY = -12;              // Gravity acceleration (slightly stronger for visual effect)
const DRAG = 0.97;                // Air resistance coefficient
const EXPLOSION_FORCE_MIN = 4;    // Minimum explosion force
const EXPLOSION_FORCE_MAX = 10;   // Maximum explosion force
const ANGULAR_VELOCITY_MAX = 12;  // Max rotation speed

/**
 * Seeded random for deterministic explosion patterns
 */
function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = Math.sin(s * 9999) * 10000;
        return s - Math.floor(s);
    };
}

/**
 * Initialize a fragment's velocity and rotation for explosion
 * @param fragment The fragment to initialize
 * @param explosionOrigin The center point of the explosion
 * @param seed Random seed for deterministic behavior
 */
export function initializeFragmentVelocity(
    fragment: FragmentState,
    explosionOrigin: THREE.Vector3,
    seed: number
): void {
    const random = seededRandom(seed + fragment.matrixIndex);

    // Random direction in sphere using spherical coordinates
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);

    // Random force within range
    const force = EXPLOSION_FORCE_MIN + random() * (EXPLOSION_FORCE_MAX - EXPLOSION_FORCE_MIN);

    // Calculate velocity vector
    fragment.velocity.set(
        Math.sin(phi) * Math.cos(theta) * force,
        Math.sin(phi) * Math.sin(theta) * force * 0.8 + 3, // Bias upward initially
        Math.cos(phi) * force
    );

    // Random angular velocity for tumbling
    fragment.angularVelocity.set(
        (random() - 0.5) * ANGULAR_VELOCITY_MAX,
        (random() - 0.5) * ANGULAR_VELOCITY_MAX,
        (random() - 0.5) * ANGULAR_VELOCITY_MAX
    );

    // Random initial scale variation
    fragment.scale = 0.6 + random() * 0.6;

    // Set initial position at explosion origin
    fragment.position.copy(explosionOrigin);

    // Random initial rotation
    fragment.rotation.set(
        random() * Math.PI * 2,
        random() * Math.PI * 2,
        random() * Math.PI * 2
    );
}

/**
 * Update a fragment's physics for one frame
 * @param fragment The fragment to update
 * @param deltaSeconds Time since last frame in seconds
 * @returns true if fragment is still alive, false if it should be released
 */
export function updateFragmentPhysics(
    fragment: FragmentState,
    deltaSeconds: number
): boolean {
    if (!fragment.active) return false;

    // Update elapsed time
    fragment.elapsed += deltaSeconds * 1000;

    // Check if fragment has expired
    if (fragment.elapsed >= fragment.lifetime) {
        return false;
    }

    // Apply gravity to velocity
    fragment.velocity.y += GRAVITY * deltaSeconds;

    // Apply drag (air resistance)
    fragment.velocity.multiplyScalar(DRAG);

    // Update position based on velocity
    fragment.position.addScaledVector(fragment.velocity, deltaSeconds);

    // Update rotation based on angular velocity
    fragment.rotation.x += fragment.angularVelocity.x * deltaSeconds;
    fragment.rotation.y += fragment.angularVelocity.y * deltaSeconds;
    fragment.rotation.z += fragment.angularVelocity.z * deltaSeconds;

    // Slow down angular velocity over time
    fragment.angularVelocity.multiplyScalar(0.99);

    // Calculate life progress (0 to 1)
    const lifeProgress = fragment.elapsed / fragment.lifetime;

    // Fade out opacity in the last 30% of lifetime
    if (lifeProgress > 0.7) {
        fragment.opacity = 1 - ((lifeProgress - 0.7) / 0.3);
    } else {
        fragment.opacity = 1;
    }

    // Shrink scale slightly over time
    fragment.scale = Math.max(0.1, fragment.scale * (1 - deltaSeconds * 0.3));

    return true;
}

/**
 * Batch update all active fragments in a pool
 * @param fragments Array of all fragments
 * @param deltaSeconds Time since last frame in seconds
 * @returns Array of fragments that should be released
 */
export function updateAllFragments(
    fragments: FragmentState[],
    deltaSeconds: number
): FragmentState[] {
    const toRelease: FragmentState[] = [];

    for (const frag of fragments) {
        if (frag.active) {
            const alive = updateFragmentPhysics(frag, deltaSeconds);
            if (!alive) {
                toRelease.push(frag);
            }
        }
    }

    return toRelease;
}

/**
 * Configuration for explosion behavior
 */
export interface ExplosionConfig {
    fragmentCount: number;     // Number of fragments to spawn
    lifetime: number;          // Base lifetime in ms
    lifetimeVariance: number;  // Random variance in lifetime
    force: number;             // Explosion force multiplier (1 = default)
}

/**
 * Get explosion config based on device
 */
export function getExplosionConfig(isMobile: boolean): ExplosionConfig {
    return isMobile
        ? {
            fragmentCount: 8,
            lifetime: 1500,
            lifetimeVariance: 300,
            force: 0.8
        }
        : {
            fragmentCount: 15,
            lifetime: 2000,
            lifetimeVariance: 500,
            force: 1.0
        };
}
