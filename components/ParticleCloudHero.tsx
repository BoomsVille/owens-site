"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  Plane,
  Raycaster,
  ShaderMaterial,
  Vector2,
  Vector3
} from "three";

import { usePointerInfluence } from "@/hooks/usePointerInfluence";
import { createParticleBlob, dampFactor, smoothFalloff } from "@/lib/particleCloud";

type ParticleCloudHeroProps = {
  className?: string;
  height?: string | number;
  particleCountDesktop?: number;
  particleCountMobile?: number;
};

type CloudPointsProps = {
  count: number;
  mobile: boolean;
  reducedMotion: boolean;
  pointerNdcRef: MutableRefObject<Vector2>;
  pointerInfluenceRef: MutableRefObject<number>;
  syncPointer: (deltaSeconds: number) => void;
};

const VERTEX_SHADER = `
attribute float aScale;
varying float vScale;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float depth = max(-mvPosition.z, 0.0001);
  float pointSize = (24.0 * aScale) / depth;
  gl_PointSize = clamp(pointSize, 1.4, 8.4);
  gl_Position = projectionMatrix * mvPosition;
  vScale = aScale;
}
`;

const FRAGMENT_SHADER = `
varying float vScale;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float alpha = smoothstep(0.5, 0.0, d);
  alpha *= (0.44 + vScale * 0.42);

  vec3 color = mix(vec3(0.74, 0.76, 0.79), vec3(1.0), vScale * 0.8);
  gl_FragColor = vec4(color, alpha);
}
`;

function CloudPoints({
  count,
  mobile,
  reducedMotion,
  pointerNdcRef,
  pointerInfluenceRef,
  syncPointer
}: CloudPointsProps) {
  const pointsGeometryRef = useRef<BufferGeometry>(null);
  const pointsMaterialRef = useRef<ShaderMaterial>(null);

  const simulationPositionRef = useRef<Float32Array>(new Float32Array(count * 3));
  const raycasterRef = useRef(new Raycaster());
  const planeRef = useRef(new Plane(new Vector3(0, 0, 1), 0));
  const mouseWorldRef = useRef(new Vector3(1000, 1000, 0));
  const cloudCenterRef = useRef(new Vector3(0, 0, 0));

  const { camera } = useThree();

  const blob = useMemo(() => createParticleBlob(count, mobile ? 1.58 : 1.92), [count, mobile]);

  useEffect(() => {
    simulationPositionRef.current = new Float32Array(blob.origins);

    const geometry = pointsGeometryRef.current;
    if (!geometry) return;

    geometry.setAttribute("position", new BufferAttribute(simulationPositionRef.current, 3));
    geometry.setAttribute("aScale", new BufferAttribute(blob.scales, 1));
    geometry.computeBoundingSphere();

    return () => {
      geometry.dispose();
    };
  }, [blob]);

  useEffect(() => {
    const material = pointsMaterialRef.current;
    if (!material) return;

    material.blending = AdditiveBlending;
    material.transparent = true;
    material.depthWrite = false;
    material.toneMapped = false;

    return () => {
      material.dispose();
    };
  }, []);

  useFrame((state, delta) => {
    syncPointer(delta);

    const geometry = pointsGeometryRef.current;
    if (!geometry) return;

    const position = geometry.getAttribute("position") as BufferAttribute;
    if (!position) return;

    const elapsed = state.clock.getElapsedTime();
    const influence = pointerInfluenceRef.current;

    raycasterRef.current.setFromCamera(pointerNdcRef.current, camera);
    raycasterRef.current.ray.intersectPlane(planeRef.current, mouseWorldRef.current);

    const cameraDampedX = MathUtils.lerp(camera.position.x, pointerNdcRef.current.x * 0.08, dampFactor(4, delta));
    const cameraDampedY = MathUtils.lerp(camera.position.y, pointerNdcRef.current.y * 0.06, dampFactor(4, delta));
    camera.position.set(cameraDampedX, cameraDampedY, camera.position.z);
    camera.lookAt(cloudCenterRef.current);

    const positions = simulationPositionRef.current;
    const origins = blob.origins;
    const seeds = blob.seeds;

    const baseIdleAmp = mobile ? 0.028 : 0.052;
    const idleAmp = reducedMotion ? baseIdleAmp * 0.25 : baseIdleAmp;
    const radius = mobile ? 0.88 : 1.15;
    const repelStrength = mobile ? 0.22 : 0.32;
    const follow = dampFactor(14, delta);

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const seed = seeds[i];

      const ox = origins[i3];
      const oy = origins[i3 + 1];
      const oz = origins[i3 + 2];

      const phaseA = elapsed * 0.42 + seed * 0.1;
      const phaseB = elapsed * 0.29 + seed * 0.12;

      const idleX = ox + Math.sin(phaseA) * idleAmp * 0.65;
      const idleY = oy + Math.cos(phaseB) * idleAmp;
      const idleZ = oz + Math.sin(phaseA * 0.8 + phaseB * 0.35) * idleAmp * 0.8;

      const dx = idleX - mouseWorldRef.current.x;
      const dy = idleY - mouseWorldRef.current.y;
      const dz = idleZ - mouseWorldRef.current.z;

      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const force = smoothFalloff(distance, radius) * repelStrength * influence;

      const invDistance = 1 / Math.max(distance, 0.0001);
      const targetX = idleX + dx * invDistance * force;
      const targetY = idleY + dy * invDistance * force;
      const targetZ = idleZ + dz * invDistance * force;

      positions[i3] += (targetX - positions[i3]) * follow;
      positions[i3 + 1] += (targetY - positions[i3 + 1]) * follow;
      positions[i3 + 2] += (targetZ - positions[i3 + 2]) * follow;
    }

    position.needsUpdate = true;
  });

  return (
    <points frustumCulled>
      <bufferGeometry ref={pointsGeometryRef} />
      <shaderMaterial ref={pointsMaterialRef} vertexShader={VERTEX_SHADER} fragmentShader={FRAGMENT_SHADER} />
    </points>
  );
}

export function ParticleCloudHero({
  className,
  height = "100vh",
  particleCountDesktop = 12000,
  particleCountMobile = 8000
}: ParticleCloudHeroProps) {
  const [mobile, setMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const pointer = usePointerInfluence(130);

  useEffect(() => {
    const mediaMobile = window.matchMedia("(max-width: 768px)");
    const mediaReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const refresh = () => {
      setMobile(mediaMobile.matches);
      setReducedMotion(mediaReduced.matches);
    };

    refresh();
    mediaMobile.addEventListener("change", refresh);
    mediaReduced.addEventListener("change", refresh);

    return () => {
      mediaMobile.removeEventListener("change", refresh);
      mediaReduced.removeEventListener("change", refresh);
    };
  }, []);

  const particleCount = mobile ? particleCountMobile : particleCountDesktop;
  const maxDpr = mobile ? 1.25 : 1.75;

  return (
    <section
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height,
        background:
          "radial-gradient(1100px 700px at 50% 20%, #181b21 0%, #12151a 45%, #0d1014 100%)"
      }}
      {...pointer.bind}
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: mobile ? 56 : 50, near: 0.1, far: 30 }}
        dpr={[1, maxDpr]}
        gl={{ antialias: !mobile, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(new Color("#0d1014"), 1);
        }}
      >
        <CloudPoints
          count={particleCount}
          mobile={mobile}
          reducedMotion={reducedMotion}
          pointerNdcRef={pointer.smoothNdc}
          pointerInfluenceRef={pointer.influence}
          syncPointer={pointer.update}
        />

        <EffectComposer multisampling={mobile ? 0 : 2}>
          <Bloom
            intensity={mobile ? 0.34 : 0.42}
            luminanceThreshold={0.12}
            luminanceSmoothing={0.55}
            mipmapBlur={false}
            radius={0.22}
          />
        </EffectComposer>

        <AdaptiveDpr pixelated />
        <Preload all />
      </Canvas>
    </section>
  );
}
