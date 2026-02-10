'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExploreStore } from '../../stores/useExploreStore';

export default function PlayerController() {
  const { camera, gl } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const keys = useRef<Record<string, boolean>>({});
  const isLocked = useRef(false);
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  const setPointerLocked = useExploreStore((s) => s.setPointerLocked);

  const requestLock = useCallback(() => {
    const canvas = gl.domElement;
    if (!document.pointerLockElement) {
      canvas.requestPointerLock().catch(() => {
        // Browser denied pointer lock
      });
    }
  }, [gl]);

  useEffect(() => {
    const canvas = gl.domElement;

    // Set initial camera rotation order via the Three.js object directly
    // This is the standard R3F pattern for first-person controllers
    // eslint-disable-next-line react-hooks/immutability
    camera.rotation.order = 'YXZ';
    euler.current.copy(camera.rotation);

    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked.current) return;
      euler.current.y -= e.movementX * 0.002;
      euler.current.x -= e.movementY * 0.002;
      // Clamp vertical look
      euler.current.x = Math.max(
        -Math.PI / 2 + 0.01,
        Math.min(Math.PI / 2 - 0.01, euler.current.x)
      );
      camera.rotation.copy(euler.current);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      if (['w', 'a', 's', 'd', ' ', 'shift', 'control', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      isLocked.current = locked;
      setPointerLocked(locked);
    };

    const onPointerLockError = () => {
      isLocked.current = false;
      setPointerLocked(false);
    };

    const onClick = () => {
      if (!isLocked.current && useExploreStore.getState().isActive) {
        requestLock();
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('pointerlockerror', onPointerLockError);
    canvas.addEventListener('click', onClick);

    const lockTimer = setTimeout(() => {
      requestLock();
    }, 200);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('pointerlockerror', onPointerLockError);
      canvas.removeEventListener('click', onClick);
      clearTimeout(lockTimer);

      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
      keys.current = {};
    };
  }, [camera, gl, setPointerLocked, requestLock]);

  useFrame((_, delta) => {
    direction.current.set(0, 0, 0);

    const k = keys.current;
    if (k['w'] || k['arrowup']) direction.current.z -= 1;
    if (k['s'] || k['arrowdown']) direction.current.z += 1;
    if (k['a'] || k['arrowleft']) direction.current.x -= 1;
    if (k['d'] || k['arrowright']) direction.current.x += 1;
    if (k[' ']) direction.current.y += 1;
    if (k['control']) direction.current.y -= 1;

    const hasInput = direction.current.length() > 0;

    if (hasInput) {
      direction.current.normalize();
      direction.current.applyQuaternion(camera.quaternion);
    }

    const boost = k['shift'];
    const speed = boost ? 30 : 15;
    const targetVelocity = hasInput
      ? direction.current.clone().multiplyScalar(speed)
      : new THREE.Vector3(0, 0, 0);

    const lerpFactor = hasInput ? 0.1 : 0.05;
    velocity.current.lerp(targetVelocity, lerpFactor);

    if (velocity.current.length() > 0.01) {
      camera.position.addScaledVector(velocity.current, delta);
    }
  });

  return null;
}
