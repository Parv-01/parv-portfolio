import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Props = {
  count?: number;
  radius?: number;
  color?: string;
  opacity?: number;
  size?: number;
  blending?: THREE.Blending;
  pulse?: number;
};

/**
 * A spherical starfield. Visual tuning is fully controllable from props so
 * the same component renders well on both a near-black and near-white sky.
 *
 * - `color`     : star tint
 * - `opacity`   : base opacity around which we modulate the pulse
 * - `size`      : star point size (world units; size attenuated)
 * - `blending`  : additive for dark backgrounds, normal for light backgrounds
 * - `pulse`     : amplitude (0..1) of the gentle breathing animation
 */
export default function Starfield({
  count = 2000,
  radius = 60,
  color = '#A8B2D1',
  opacity = 0.85,
  size = 0.06,
  blending = THREE.AdditiveBlending,
  pulse = 0.08,
}: Props) {
  const points = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.35 + Math.random() * 0.65);
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = 0.6 + Math.random() * 0.8;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size,
      sizeAttenuation: true,
      transparent: true,
      opacity,
      depthWrite: false,
      blending,
    });
    return { geometry: geo, material: mat };
  }, [blending, color, count, opacity, radius, size]);

  useEffect(() => {
    if (!material) return;
    material.color = new THREE.Color(color);
    material.opacity = opacity;
    material.blending = blending;
    material.size = size;
    material.needsUpdate = true;
  }, [material, color, opacity, blending, size]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!points.current) return;
    points.current.rotation.y = t * 0.012;
    points.current.rotation.x = Math.sin(t * 0.07) * 0.05;
    const mat = points.current.material as THREE.PointsMaterial;
    mat.opacity = Math.max(0, opacity + Math.sin(t * 1.2) * pulse);
  });

  return <points ref={points} geometry={geometry} material={material} />;
}
