"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
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
  const speedRef = useRef<Float32Array>(new Float32Array(count));

  const { viewport } = useThree();

  useEffect(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speed = new Float32Array(count);

    const spanX = viewport.width * 1.4;
    const spanY = viewport.height * 1.4;

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * spanX;
      positions[i3 + 1] = (Math.random() - 0.5) * spanY;
      positions[i3 + 2] = (Math.random() - 0.5) * 2.2;

      const direction = new Vector3(Math.random() - 0.5, Math.random() - 0.5, (Math.random() - 0.5) * 0.35).normalize();
      const baseSpeed = mobile ? 0.005 : 0.007;
      speed[i] = baseSpeed * (0.8 + Math.random() * 0.35);
      velocities[i3] = direction.x;
      velocities[i3 + 1] = direction.y;
      velocities[i3 + 2] = direction.z;

      scales[i] = 0.5 + Math.random() * 0.95;
    }

    positionsRef.current = positions;
    velocitiesRef.current = velocities;
    scalesRef.current = scales;
    speedRef.current = speed;

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

    const positions = positionsRef.current;
    const velocities = velocitiesRef.current;
    const speed = speedRef.current;

    const dt = Math.min(delta, 0.033);
    const spanX = viewport.width * 1.5;
    const spanY = viewport.height * 1.5;

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const step = speed[i] * dt * 60;
      positions[i3] += velocities[i3] * step;
      positions[i3 + 1] += velocities[i3 + 1] * step;
      positions[i3 + 2] += velocities[i3 + 2] * step;

      if (positions[i3] > spanX * 0.5) positions[i3] = -spanX * 0.5;
      if (positions[i3] < -spanX * 0.5) positions[i3] = spanX * 0.5;
      if (positions[i3 + 1] > spanY * 0.5) positions[i3 + 1] = -spanY * 0.5;
      if (positions[i3 + 1] < -spanY * 0.5) positions[i3 + 1] = spanY * 0.5;
      if (positions[i3 + 2] > 1.4) positions[i3 + 2] = -1.4;
      if (positions[i3 + 2] < -1.4) positions[i3 + 2] = 1.4;
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
