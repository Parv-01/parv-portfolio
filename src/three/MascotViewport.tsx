import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useTheme } from '@/app/theme/ThemeProvider';

const MODEL = '/models/standing.glb';

export type MascotPose = {
  rotationY?: number;
  cameraZ?: number;
  cameraY?: number;
  fov?: number;
  fit?: number;
  offsetX?: number;
  offsetY?: number;
  followCursor?: boolean;
  animationSpeed?: number;
};

type Props = MascotPose & {
  className?: string;
};

const DEFAULT_POSE: Required<MascotPose> = {
  rotationY: 0,
  cameraZ: 5.0,
  cameraY: 0.6,
  fov: 36,
  fit: 1.8,

  offsetX: 0,
  offsetY: 0,

  followCursor: true,
  animationSpeed: 1,
};

export default function MascotViewport(props: Props) {
  const pose = { ...DEFAULT_POSE, ...props };
  const { theme } = useTheme();

  const lighting = useMemo(() => {
    if (theme === 'dark') {
      return {
        ambient: 0.55,
        key: { color: '#ffffff', intensity: 0.95 },
        rim: { color: '#8DA2FF', intensity: 0.45 },
        fillA: { color: '#C2A878', intensity: 0.45 },
        fillB: { color: '#8FA98E', intensity: 0.35 },
        exposure: 1.25,
      } as const;
    }
    return {
      ambient: 0.95,
      key: { color: '#ffffff', intensity: 1.15 },
      rim: { color: '#8DA2FF', intensity: 0.25 },
      fillA: { color: '#F6F1E8', intensity: 0.6 },
      fillB: { color: '#E7E1D5', intensity: 0.4 },
      exposure: 1.05,
    } as const;
  }, [theme]);

  return (
    <div
      className={props.className ?? ''}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, pose.cameraY, pose.cameraZ], fov: pose.fov }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = lighting.exposure;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <ambientLight intensity={lighting.ambient} />
        <directionalLight position={[2, 4, 4]} intensity={lighting.key.intensity} color={lighting.key.color} />
        <directionalLight position={[-3, 2, -3]} intensity={lighting.rim.intensity} color={lighting.rim.color} />
        <pointLight position={[1.5, 0.8, 1.2]} intensity={lighting.fillA.intensity} color={lighting.fillA.color} distance={6} />
        <pointLight position={[-1.5, 0.4, 0.6]} intensity={lighting.fillB.intensity} color={lighting.fillB.color} distance={5} />
        <Suspense fallback={null}>
          <Mascot pose={pose} themeIsDark={theme === 'dark'} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function Mascot({ pose, themeIsDark }: { pose: Required<MascotPose>; themeIsDark: boolean }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Object3D | null>(null);
  const { scene, animations } = useGLTF(MODEL);
  const { camera } = useThree();

  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group;
    c.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        mesh.frustumCulled = false;
        const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
        if (mat && 'metalness' in mat) {
          mat.metalness = themeIsDark
            ? Math.min((mat.metalness ?? 0.4) + 0.05, 0.7)
            : Math.min((mat.metalness ?? 0.4), 0.55);
          mat.roughness = themeIsDark
            ? Math.max((mat.roughness ?? 0.6), 0.35)
            : Math.max((mat.roughness ?? 0.6), 0.45);
          mat.envMapIntensity = themeIsDark ? 1.0 : 0.85;
          mat.needsUpdate = true;
        }
      }
    });
    return c;
  }, [scene, themeIsDark]);

  const { autoScale, centerOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const longest = Math.max(size.x, size.y, size.z) || 1;
    const scale = pose.fit / longest;
    return {
      autoScale: scale,
      centerOffset: new THREE.Vector3(
        -center.x * scale,
        (-center.y - size.y * 0.12) * scale,
        -center.z * scale
      ),
    };
  }, [cloned, pose.fit]);

  const { actions, names } = useAnimations(animations, cloned);

  useEffect(() => {
    if (!names.length) return;
    const preferred = names.find((n) => /idle|stand|breath|loop/i.test(n)) ?? names[0];
    const action = actions[preferred];
    if (!action) return;
    action.reset();
    action.timeScale = pose.animationSpeed;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.fadeIn(0.35).play();
    return () => { action.fadeOut(0.2); };
  }, [actions, names, pose.animationSpeed]);

  useEffect(() => {
    headRef.current = null;
    cloned.traverse((obj: THREE.Object3D) => {
      const anyObj = obj as THREE.Object3D & { isBone?: boolean };
      if (anyObj.isBone && obj.name && /head/i.test(obj.name)) {
        headRef.current = obj;
      }
    });
  }, [cloned]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const cd = Math.min(delta, 0.05);

    group.current.position.x = pose.offsetX;
    group.current.position.y =
      pose.offsetY +
      Math.sin(t * 1.2) * 0.04;
    group.current.position.z = 0;

    if (pose.followCursor) {
      const targetRotY = pose.rotationY + state.mouse.x * 0.18;
      const targetRotX = -state.mouse.y * 0.06;
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRotY, 3.5, cd);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetRotX, 3.5, cd);
      if (headRef.current) {
        headRef.current.rotation.y = state.mouse.x * 0.22;
        headRef.current.rotation.x = -state.mouse.y * 0.16;
      }
    } else {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pose.rotationY, 3.5, cd);
    }

    group.current.rotation.z = Math.sin(t * 0.7) * 0.008;

    const target = new THREE.Vector3(0, 0.45, 0);
    camera.lookAt(target);
  });

  return (
    <group ref={group}>
      <group ref={inner} position={centerOffset} scale={autoScale}>
        <primitive object={cloned} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL);
