import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';
import Starfield from './Starfield';
import { useTheme } from '@/app/theme/ThemeProvider';

function CameraDrift() {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const driftX = Math.sin(t * 0.1) * 0.2;
    const driftY = Math.cos(t * 0.15) * 0.1;
    state.camera.position.x = driftX + state.mouse.x * 0.5;
    state.camera.position.y = 1.2 + driftY - state.mouse.y * 0.3;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

/**
 * Theme-aware shared starfield.
 *
 * - Dark: silvery stars, additive blending, soft pulse -> cosmic depth.
 * - Light: graphite stars, normal blending, smaller size -> ink-pin sky.
 *
 * A second, sparser, brighter layer is overlaid as "key stars" so the sky
 * never reads as a flat texture in either theme.
 */
export default function GlobalCanvas({ cinematic = false }: { cinematic?: boolean }) {
  const { theme } = useTheme();

  const settings = useMemo(() => {
    if (theme === 'dark') {
      return {
        baseColor: '#B8C2E0',
        baseOpacity: 0.78,
        baseSize: 0.065,
        baseBlending: THREE.AdditiveBlending,
        keyColor: '#FFFFFF',
        keyOpacity: 0.9,
        keySize: 0.11,
        keyBlending: THREE.AdditiveBlending,
        exposure: cinematic ? 1.7 : 1.4,
      } as const;
    }
    return {
      baseColor: '#3F4A66',
      baseOpacity: 0.92,
      baseSize: 0.05,
      baseBlending: THREE.NormalBlending,
      keyColor: '#1F2436',
      keyOpacity: 1,
      keySize: 0.085,
      keyBlending: THREE.NormalBlending,
      exposure: 1.05,
    } as const;
  }, [theme, cinematic]);

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.6, 5.2], fov: 40 }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = settings.exposure;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <Starfield
            count={2200}
            radius={62}
            color={settings.baseColor}
            opacity={settings.baseOpacity}
            blending={settings.baseBlending}
            size={settings.baseSize}
            pulse={theme === 'dark' ? 0.1 : 0.05}
          />
          <Starfield
            count={260}
            radius={48}
            color={settings.keyColor}
            opacity={settings.keyOpacity}
            blending={settings.keyBlending}
            size={settings.keySize}
            pulse={theme === 'dark' ? 0.18 : 0.04}
          />
          <CameraDrift />
        </Suspense>
      </Canvas>
    </div>
  );
}
