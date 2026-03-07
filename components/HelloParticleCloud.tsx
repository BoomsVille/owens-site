"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Plane,
  Raycaster,
  ShaderMaterial,
  Vector2,
  Vector3
} from "three";

import { usePointerInfluence } from "@/hooks/usePointerInfluence";
import { createTextParticleCloud, dampFactor, smoothFalloff } from "@/lib/particleCloud";

type HelloParticleCloudProps = {
  className?: string;
  text?: string;
  particleCountDesktop?: number;
  particleCountMobile?: number;
};

const VERTEX_SHADER = `
attribute float aScale;
varying float vScale;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float depth = max(-mvPosition.z, 0.0001);
  gl_PointSize = clamp((22.0 * aScale) / depth, 1.2, 8.0);
  gl_Position = projectionMatrix * mvPosition;
  vScale = aScale;
}
`;

const FRAGMENT_SHADER = `
varying float vScale;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float core = smoothstep(0.34, 0.0, d);
  float halo = smoothstep(0.5, 0.22, d) * 0.15;
  float alpha = (core + halo) * (0.34 + vScale * 0.34);

  vec3 color = mix(vec3(0.72, 0.74, 0.78), vec3(0.98), vScale * 0.8);
  gl_FragColor = vec4(color, alpha);
}
`;

function HelloPoints({
  text,
  count,
  mobile,
  reducedMotion,
  pointerNdcRef,
  pointerInfluenceRef,
  syncPointer
}: {
  text: string;
  count: number;
  mobile: boolean;
  reducedMotion: boolean;
  pointerNdcRef: MutableRefObject<Vector2>;
  pointerInfluenceRef: MutableRefObject<number>;
  syncPointer: (deltaSeconds: number) => void;
}) {
  const pointsGeometryRef = useRef<BufferGeometry>(null);
  const pointsMaterialRef = useRef<ShaderMaterial>(null);

  const simulationPositionRef = useRef<Float32Array>(new Float32Array(count * 3));
  const raycasterRef = useRef(new Raycaster());
  const planeRef = useRef(new Plane(new Vector3(0, 0, 1), 0));
  const mouseWorldRef = useRef(new Vector3(1000, 1000, 0));

  const { camera } = useThree();

  const cloud = useMemo(() => createTextParticleCloud(count, text), [count, text]);

  useEffect(() => {
    simulationPositionRef.current = new Float32Array(cloud.origins);

    const geometry = pointsGeometryRef.current;
    if (!geometry) return;

    geometry.setAttribute("position", new BufferAttribute(simulationPositionRef.current, 3));
    geometry.setAttribute("aScale", new BufferAttribute(cloud.scales, 1));
    geometry.computeBoundingSphere();

    return () => {
      geometry.dispose();
    };
  }, [cloud]);

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

    const driftX = Math.sin(elapsed * 0.14) * (mobile ? 0.014 : 0.02);
    const driftY = Math.cos(elapsed * 0.12) * (mobile ? 0.01 : 0.016);
    const driftZ = Math.sin(elapsed * 0.11) * (mobile ? 0.012 : 0.018);

    camera.position.x += (pointerNdcRef.current.x * 0.012 - camera.position.x) * dampFactor(4.2, delta);
    camera.position.y += (pointerNdcRef.current.y * 0.009 - camera.position.y) * dampFactor(4.2, delta);
    camera.position.z += (9 - camera.position.z) * dampFactor(4.2, delta);
    camera.lookAt(0, 0, 0);

    const positions = simulationPositionRef.current;
    const origins = cloud.origins;
    const seeds = cloud.seeds;

    const baseIdleAmp = mobile ? 0.016 : 0.024;
    const idleAmp = reducedMotion ? baseIdleAmp * 0.25 : baseIdleAmp;
    const radius = mobile ? 0.9 : 1.2;
    const repelStrength = mobile ? 12 : 17;
    const follow = dampFactor(14, delta);

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const seed = seeds[i];

      const ox = origins[i3];
      const oy = origins[i3 + 1];
      const oz = origins[i3 + 2];

      const t1 = elapsed * 0.35 + seed * 0.11;
      const t2 = elapsed * 0.27 + seed * 0.08;
      const floatLift = Math.sin(elapsed * 0.32 + seed * 0.01) * idleAmp * 0.2;

      const idleX = ox + driftX + Math.sin(t1) * idleAmp * 0.55;
      const idleY = oy + driftY + Math.cos(t2) * idleAmp + floatLift;
      const idleZ = oz + driftZ + Math.sin(t1 * 0.75 + t2 * 0.3) * idleAmp * 0.75;

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

export function HelloParticleCloud({
  className,
  text = "HELLO",
  particleCountDesktop = 4200,
  particleCountMobile = 2200
}: HelloParticleCloudProps) {
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

  return (
    <div className={className} {...pointer.bind}>
      <Canvas
        camera={{ position: [0, 0, 9], fov: mobile ? 54 : 46, near: 0.1, far: 32 }}
        dpr={[1, mobile ? 1.4 : 2]}
        gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(new Color("#000000"), 0);
        }}
      >
        <HelloPoints
          text={text}
          count={mobile ? particleCountMobile : particleCountDesktop}
          mobile={mobile}
          reducedMotion={reducedMotion}
          pointerNdcRef={pointer.smoothNdc}
          pointerInfluenceRef={pointer.influence}
          syncPointer={pointer.update}
        />
        <EffectComposer multisampling={mobile ? 0 : 2}>
          <Bloom
            intensity={mobile ? 0.06 : 0.1}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.55}
            mipmapBlur={false}
            radius={0.06}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
