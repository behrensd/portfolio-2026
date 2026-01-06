import * as THREE from 'three';

/**
 * Seeded random number generator for consistent procedural generation
 */
export function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = Math.sin(s * 9999) * 10000;
        return s - Math.floor(s);
    };
}

/**
 * Create a procedurally generated rock geometry with spherical UVs
 * Uses a perturbed icosahedron for natural rocky appearance
 */
export function createRockGeometry(seed: number): THREE.BufferGeometry {
    // Start with icosahedron (20 faces base, detail 1 = 80 faces)
    const ico = new THREE.IcosahedronGeometry(1, 1);
    const positions = ico.attributes.position.array as Float32Array;

    // Create seeded random for consistent perturbation
    const random = seededRandom(seed);

    // Perturb vertices for rocky appearance
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];

        // Normalize vertex position
        const len = Math.sqrt(x * x + y * y + z * z);

        // Apply noise perturbation (±20% displacement)
        const noise = (random() - 0.5) * 0.4;
        const scale = (1 + noise) / len;

        positions[i] = x * scale;
        positions[i + 1] = y * scale;
        positions[i + 2] = z * scale;
    }

    // Generate spherical UVs for texture mapping
    const uvs = new Float32Array((positions.length / 3) * 2);

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];

        // Spherical projection
        const u = 0.5 + Math.atan2(z, x) / (2 * Math.PI);
        const v = 0.5 - Math.asin(y / Math.sqrt(x * x + y * y + z * z)) / Math.PI;

        const uvIndex = (i / 3) * 2;
        uvs[uvIndex] = u;
        uvs[uvIndex + 1] = v;
    }

    ico.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    ico.computeVertexNormals();

    return ico;
}

/**
 * Create a simplified fragment geometry for explosions
 * Uses a perturbed tetrahedron (4 faces) for lightweight rendering
 * @param seed Random seed for shape variation
 */
export function createFragmentGeometry(seed: number): THREE.BufferGeometry {
    // Tetrahedron with 4 faces - much lighter than full rocks
    const tetra = new THREE.TetrahedronGeometry(0.25, 0);
    const positions = tetra.attributes.position.array as Float32Array;

    // Apply noise perturbation for irregular fragment shapes
    const random = seededRandom(seed);
    for (let i = 0; i < positions.length; i += 3) {
        positions[i] += (random() - 0.5) * 0.08;
        positions[i + 1] += (random() - 0.5) * 0.08;
        positions[i + 2] += (random() - 0.5) * 0.08;
    }

    // Generate simple UVs for texture mapping
    const uvs = new Float32Array((positions.length / 3) * 2);
    for (let i = 0; i < positions.length; i += 3) {
        const uvIndex = (i / 3) * 2;
        uvs[uvIndex] = (positions[i] + 0.5) * 0.5;
        uvs[uvIndex + 1] = (positions[i + 1] + 0.5) * 0.5;
    }

    tetra.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    tetra.computeVertexNormals();

    return tetra;
}

/**
 * Ring configuration for the Armillary Sphere
 */
export interface ArmillaryRing {
    radius: number;
    tilt: number;           // Rotation on X axis (radians)
    rotation: number;       // Rotation on Y axis (radians)
    particleCount: number;
    rotationSpeed: number;  // Self-rotation speed (rad/sec)
    // Orbital motion config (ring center orbits around origin)
    orbitalRadius: number;  // Distance from center for orbital path
    orbitalSpeed: number;   // Orbital speed (rad/sec)
    orbitalTilt: number;    // Tilt of orbital plane
    orbitalDirection: 1 | -1; // Clockwise or counter-clockwise
}

/**
 * Default ring configuration - 4 intersecting rings forming a sphere
 * All rings share the same radius for proportional appearance
 * Different tilts create the armillary sphere structure
 */
export const RING_CONFIGS: ArmillaryRing[] = [
    {
        // Equatorial ring (horizontal)
        radius: 1.8, tilt: 0, rotation: 0, particleCount: 35,
        rotationSpeed: 0.25,
        orbitalRadius: 0.15, orbitalSpeed: 0.12, orbitalTilt: 0, orbitalDirection: 1
    },
    {
        // 60° tilted ring
        radius: 1.8, tilt: Math.PI / 3, rotation: 0, particleCount: 35,
        rotationSpeed: -0.22,
        orbitalRadius: 0.12, orbitalSpeed: 0.14, orbitalTilt: Math.PI / 8, orbitalDirection: -1
    },
    {
        // 60° tilted ring (perpendicular to previous)
        radius: 1.8, tilt: Math.PI / 3, rotation: Math.PI / 2, particleCount: 35,
        rotationSpeed: 0.28,
        orbitalRadius: 0.18, orbitalSpeed: 0.10, orbitalTilt: Math.PI / 6, orbitalDirection: 1
    },
    {
        // Near-vertical ring
        radius: 1.8, tilt: Math.PI / 2.2, rotation: Math.PI / 4, particleCount: 30,
        rotationSpeed: -0.18,
        orbitalRadius: 0.10, orbitalSpeed: 0.16, orbitalTilt: Math.PI / 5, orbitalDirection: -1
    },
];

/**
 * Mobile-optimized ring configuration (2 rings, fewer particles)
 */
export const MOBILE_RING_CONFIGS: ArmillaryRing[] = [
    {
        radius: 1.6, tilt: 0, rotation: 0, particleCount: 25,
        rotationSpeed: 0.20,
        orbitalRadius: 0.12, orbitalSpeed: 0.10, orbitalTilt: 0, orbitalDirection: 1
    },
    {
        radius: 1.6, tilt: Math.PI / 3, rotation: Math.PI / 4, particleCount: 25,
        rotationSpeed: -0.18,
        orbitalRadius: 0.10, orbitalSpeed: 0.12, orbitalTilt: Math.PI / 6, orbitalDirection: -1
    },
];

/**
 * Calculate total particle count from ring configs
 */
export function getTotalParticleCount(rings: ArmillaryRing[]): number {
    return rings.reduce((sum, ring) => sum + ring.particleCount, 0);
}

/**
 * Calculate orbital offset for a ring at given time
 * Returns the position offset of the ring's center as it orbits around origin
 */
export function calculateOrbitalOffset(
    ring: ArmillaryRing,
    time: number,
    out: THREE.Vector3
): THREE.Vector3 {
    const angle = time * ring.orbitalSpeed * ring.orbitalDirection;

    // Calculate position on orbital circle
    const x = Math.cos(angle) * ring.orbitalRadius;
    const z = Math.sin(angle) * ring.orbitalRadius;

    // Apply orbital tilt
    const y = z * Math.sin(ring.orbitalTilt);
    const zTilted = z * Math.cos(ring.orbitalTilt);

    out.set(x, y, zTilted);
    return out;
}

/**
 * Calculate position on a ring given angle and ring config
 */
export function positionOnRing(
    ring: ArmillaryRing,
    angle: number,
    out: THREE.Vector3
): THREE.Vector3 {
    // Position on XZ plane at given radius
    out.set(
        Math.cos(angle) * ring.radius,
        0,
        Math.sin(angle) * ring.radius
    );

    // Apply ring tilt (X axis rotation)
    if (ring.tilt !== 0) {
        const y = out.y;
        const z = out.z;
        out.y = y * Math.cos(ring.tilt) - z * Math.sin(ring.tilt);
        out.z = y * Math.sin(ring.tilt) + z * Math.cos(ring.tilt);
    }

    // Apply ring rotation (Y axis)
    if (ring.rotation !== 0) {
        const x = out.x;
        const z = out.z;
        out.x = x * Math.cos(ring.rotation) - z * Math.sin(ring.rotation);
        out.z = x * Math.sin(ring.rotation) + z * Math.cos(ring.rotation);
    }

    return out;
}

/**
 * Particle state interface for tracking each particle
 */
export interface ParticleState {
    id: number;
    ringIndex: number;
    angleOnRing: number;

    // Pre-computed positions
    scatteredPos: THREE.Vector3;    // Starting position (off-screen)
    ringPos: THREE.Vector3;         // Position on armillary ring
    dispersedPos: THREE.Vector3;    // Post-dissolution spread position
    driftCenter: THREE.Vector3;     // Center of contact drift orbit

    // Per-particle properties
    phaseOffset: number;            // Stagger timing (0-1)
    scale: number;                  // Size variation (0.6-1.2)
    rotationSpeed: THREE.Vector3;   // Unique spin rate per axis
    seed: number;                   // For deterministic randomness
}

/**
 * Initialize particle states with pre-computed positions
 */
export function initializeParticles(
    rings: ArmillaryRing[],
    random: () => number
): ParticleState[] {
    const particles: ParticleState[] = [];
    let id = 0;

    rings.forEach((ring, ringIndex) => {
        for (let i = 0; i < ring.particleCount; i++) {
            const angle = (i / ring.particleCount) * Math.PI * 2;

            // Ring position
            const ringPos = new THREE.Vector3();
            positionOnRing(ring, angle, ringPos);

            // Scattered position (from edges of screen - scaled down)
            const scatterAngle = random() * Math.PI * 2;
            const scatterRadius = 6 + random() * 4;
            const scatteredPos = new THREE.Vector3(
                Math.cos(scatterAngle) * scatterRadius,
                (random() - 0.5) * 8,
                Math.sin(scatterAngle) * scatterRadius - 4
            );

            // Dispersed position (gently spread from ring position)
            // Keep closer to sphere for smoother dissolve transition
            const disperseDir = ringPos.clone().normalize();
            disperseDir.x += (random() - 0.5) * 0.8;
            disperseDir.y += (random() - 0.5) * 0.8 - 0.3; // Bias downward
            disperseDir.z += (random() - 0.5) * 0.6;
            disperseDir.normalize();
            const dispersedPos = ringPos.clone().add(
                disperseDir.multiplyScalar(2 + random() * 1.5)
            );

            particles.push({
                id,
                ringIndex,
                angleOnRing: angle,
                scatteredPos,
                ringPos,
                dispersedPos,
                driftCenter: new THREE.Vector3(0, -5, 0), // Will be updated for contact card
                phaseOffset: random() * 0.3,
                scale: 0.6 + random() * 0.6,
                rotationSpeed: new THREE.Vector3(
                    (random() - 0.5) * 0.003,  // Much slower spin
                    (random() - 0.5) * 0.003,
                    (random() - 0.5) * 0.003
                ),
                seed: id * 1000 + 42
            });

            id++;
        }
    });

    return particles;
}

/**
 * Create ring line geometry for visualization
 */
export function createRingGeometry(ring: ArmillaryRing, segments: number = 64): THREE.BufferGeometry {
    const points: THREE.Vector3[] = [];
    const tempVec = new THREE.Vector3();

    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        positionOnRing(ring, angle, tempVec);
        points.push(tempVec.clone());
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
}
