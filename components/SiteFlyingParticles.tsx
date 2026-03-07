"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

type SiteFlyingParticlesProps = {
  className?: string;
  particleCountDesktop?: number;
  particleCountMobile?: number;
};

const VERTEX_SHADER = `
attribute float aScale;
varying float vScale;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float depth = max(-mvPosition.z, 0.0001);
  gl_PointSize = clamp((18.0 * aScale) / depth, 0.9, 4.2);
  gl_Position = projectionMatrix * mvPosition;
  vScale = aScale;
}
`;

const FRAGMENT_SHADER = `
varying float vScale;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float core = smoothstep(0.35, 0.0, d);
  float halo = smoothstep(0.5, 0.2, d) * 0.08;
  float alpha = (core + halo) * (0.2 + vScale * 0.22);

  vec3 color = mix(vec3(0.72, 0.75, 0.8), vec3(0.98), vScale * 0.8);
  gl_FragColor = vec4(color, alpha);
}
`;

function FlyingPoints({ count, mobile }: { count: number; mobile: boolean }) {
  const pointsGeometryRef = useRef<BufferGeometry>(null);
  const pointsMaterialRef = useRef<ShaderMaterial>(null);

  const positionsRef = useRef<Float32Array>(new Float32Array(count * 3));
  const velocitiesRef = useRef<Float32Array>(new Float32Array(count * 3));
  const scalesRef = useRef<Float32Array>(new Float32Array(count));
  const seedsRef = useRef<Float32Array>(new Float32Array(count));

  const mouseNdcRef = useRef(new Vector2(10, 10));
  const scatterImpulseRef = useRef(0);
  const mouseWorldRef = useRef(new Vector3(1000, 1000, 0));
  const raycasterRef = useRef(new Raycaster());
  const planeRef = useRef(new Plane(new Vector3(0, 0, 1), 0));

  const { camera, viewport } = useThree();

  useEffect(() => {
    const handler = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -((event.clientY / window.innerHeight) * 2 - 1);
      mouseNdcRef.current.set(x, y);
    };

    window.addEventListener("pointermove", handler, { passive: true });
    return () => window.removeEventListener("pointermove", handler);
  }, []);

  useEffect(() => {
    const onScatter = () => {
      scatterImpulseRef.current = 1;
    };

    window.addEventListener("pointerdown", onScatter, { passive: true });
    return () => window.removeEventListener("pointerdown", onScatter);
  }, []);

  useEffect(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);

    const spanX = viewport.width * 1.4;
    const spanY = viewport.height * 1.4;

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * spanX;
      positions[i3 + 1] = (Math.random() - 0.5) * spanY;
      positions[i3 + 2] = (Math.random() - 0.5) * 2.2;

      const baseVel = mobile ? 0.12 : 0.17;
      velocities[i3] = (Math.random() - 0.5) * baseVel;
      velocities[i3 + 1] = (Math.random() - 0.5) * baseVel;
      velocities[i3 + 2] = (Math.random() - 0.5) * baseVel * 0.2;

      scales[i] = 0.5 + Math.random() * 0.95;
      seeds[i] = Math.random() * 1000;
    }

    positionsRef.current = positions;
    velocitiesRef.current = velocities;
    scalesRef.current = scales;
    seedsRef.current = seeds;

    const geometry = pointsGeometryRef.current;
    if (!geometry) return;

    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("aScale", new BufferAttribute(scales, 1));
    geometry.computeBoundingSphere();

    return () => geometry.dispose();
  }, [count, mobile, viewport.height, viewport.width]);

  useEffect(() => {
    const material = pointsMaterialRef.current;
    if (!material) return;

    material.blending = AdditiveBlending;
    material.transparent = true;
    material.depthWrite = false;
    material.toneMapped = false;

    return () => material.dispose();
  }, []);

  useFrame((state, delta) => {
    const geometry = pointsGeometryRef.current;
    if (!geometry) return;

    const position = geometry.getAttribute("position") as BufferAttribute;
    if (!position) return;

    raycasterRef.current.setFromCamera(mouseNdcRef.current, camera);
    raycasterRef.current.ray.intersectPlane(planeRef.current, mouseWorldRef.current);

    const positions = positionsRef.current;
    const velocities = velocitiesRef.current;
    const seeds = seedsRef.current;

    const elapsed = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.033);
    const spanX = viewport.width * 1.5;
    const spanY = viewport.height * 1.5;
    const repelRadius = mobile ? 0.5 : 0.8;
    const repelStrength = mobile ? 1.8 : 2.4;
    const scatter = scatterImpulseRef.current;

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const seed = seeds[i];

      const px = positions[i3];
      const py = positions[i3 + 1];
      const pz = positions[i3 + 2];

      const dx = px - mouseWorldRef.current.x;
      const dy = py - mouseWorldRef.current.y;
      const dz = pz - mouseWorldRef.current.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance < repelRadius) {
        const t = 1 - distance / repelRadius;
        const force = t * t * repelStrength;
        const invDistance = 1 / Math.max(distance, 0.0001);
        velocities[i3] += dx * invDistance * force * dt;
        velocities[i3 + 1] += dy * invDistance * force * dt;
        velocities[i3 + 2] += dz * invDistance * force * dt * 0.2;
      }

      if (scatter > 0.001) {
        const angleA = seed * 0.014 + elapsed * 0.35;
        const angleB = seed * 0.009 + elapsed * 0.27;
        const burst = (mobile ? 0.085 : 0.11) * scatter;
        velocities[i3] += Math.cos(angleA) * burst;
        velocities[i3 + 1] += Math.sin(angleA) * burst;
        velocities[i3 + 2] += Math.sin(angleB) * burst * 0.22;
      }

      velocities[i3] += Math.sin(elapsed * 0.22 + seed * 0.01) * 0.002 * dt;
      velocities[i3 + 1] += Math.cos(elapsed * 0.19 + seed * 0.012) * 0.002 * dt;

      velocities[i3] *= 0.995;
      velocities[i3 + 1] *= 0.995;
      velocities[i3 + 2] *= 0.995;

      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      if (positions[i3] > spanX * 0.5) positions[i3] = -spanX * 0.5;
      if (positions[i3] < -spanX * 0.5) positions[i3] = spanX * 0.5;
      if (positions[i3 + 1] > spanY * 0.5) positions[i3 + 1] = -spanY * 0.5;
      if (positions[i3 + 1] < -spanY * 0.5) positions[i3 + 1] = spanY * 0.5;
      if (positions[i3 + 2] > 1.4) positions[i3 + 2] = -1.4;
      if (positions[i3 + 2] < -1.4) positions[i3 + 2] = 1.4;
    }

    if (scatterImpulseRef.current > 0) {
      scatterImpulseRef.current *= 0.91;
      if (scatterImpulseRef.current < 0.0005) scatterImpulseRef.current = 0;
    }

    position.needsUpdate = true;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={pointsGeometryRef} />
      <shaderMaterial ref={pointsMaterialRef} vertexShader={VERTEX_SHADER} fragmentShader={FRAGMENT_SHADER} />
    </points>
  );
}

export function SiteFlyingParticles({
  className,
  particleCountDesktop = 2200,
  particleCountMobile = 900
}: SiteFlyingParticlesProps) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mediaMobile = window.matchMedia("(max-width: 768px)");
    const refresh = () => setMobile(mediaMobile.matches);

    refresh();
    mediaMobile.addEventListener("change", refresh);
    return () => mediaMobile.removeEventListener("change", refresh);
  }, []);

  const count = useMemo(() => (mobile ? particleCountMobile : particleCountDesktop), [mobile, particleCountDesktop, particleCountMobile]);

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 50, near: 0.1, far: 40 }}
        dpr={[1, mobile ? 1.2 : 1.6]}
        gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(new Color("#000000"), 0);
        }}
      >
        <FlyingPoints count={count} mobile={mobile} />
      </Canvas>
    </div>
  );
}
