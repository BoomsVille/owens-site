"use client";

import { Suspense, useEffect, useState } from "react";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import type { Group } from "three";

function WalkerModel({ progress }: { progress: number }) {
  const gltf = useGLTF("/models/walker.glb");
  const rootRef = useRef<Group>(null);
  const { actions } = useAnimations(gltf.animations, gltf.scene);

  useEffect(() => {
    const walkAction =
      actions.Walk ||
      actions.walk ||
      Object.entries(actions).find(([name]) => name.toLowerCase().includes("walk"))?.[1] ||
      Object.entries(actions).find(([name]) => name.toLowerCase().includes("run"))?.[1] ||
      Object.values(actions)[0];

    if (!walkAction) return;

    walkAction.reset();
    walkAction.timeScale = 1.15;
    walkAction.fadeIn(0.2).play();

    return () => {
      walkAction.fadeOut(0.2);
    };
  }, [actions]);

  useFrame((state) => {
    if (!rootRef.current) return;
    const t = state.clock.getElapsedTime();
    const depth = -0.72 + progress * 0.82;
    const scale = 0.62 + progress * 0.28;
    // Keep heading stable and add small stride-like body motion.
    rootRef.current.rotation.y = -0.42;
    rootRef.current.rotation.x = 0.08 + Math.sin(t * 9.6) * 0.018;
    rootRef.current.rotation.z = Math.sin(t * 9.6) * 0.01;
    rootRef.current.position.y = -0.58 + Math.abs(Math.sin(t * 9.6)) * 0.03;
    rootRef.current.position.z = depth;
    rootRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={rootRef} position={[0, -0.82, -0.72]}>
      <primitive object={gltf.scene} />
    </group>
  );
}

useGLTF.preload("/models/walker.glb");

export function ScrollSloth() {
  const [started, setStarted] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [bob, setBob] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (started || hasRun) return;

    const onFirstScroll = () => {
      if (window.scrollY > 0) {
        setStarted(true);
        setHasRun(true);
        window.removeEventListener("scroll", onFirstScroll);
      }
    };

    window.addEventListener("scroll", onFirstScroll, { passive: true });
    return () => window.removeEventListener("scroll", onFirstScroll);
  }, [started, hasRun]);

  useEffect(() => {
    if (!started) return;

    let raf = 0;
    const startedAt = performance.now();
    const durationMs = 14000;

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const t = Math.min(1, elapsed / durationMs);
      setProgress(t);
      setBob(Math.sin(now / 260) * 1.3);

      if (t >= 1) {
        return;
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [started]);

  if (!started) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[2] flex items-center justify-center">
      <div
        className="w-[124px] opacity-88 will-change-transform sm:w-[168px]"
        style={{ transform: `translateY(${bob}px)` }}
        aria-hidden="true"
      >
        <div className="h-[94px] w-full">
          <Canvas camera={{ position: [0, 0.26, 2.2], fov: 44 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
            <ambientLight intensity={0.92} />
            <directionalLight position={[2.8, 3.3, 2.4]} intensity={1.36} />
            <directionalLight position={[-2.8, 1.1, -2]} intensity={0.52} />
            <mesh position={[0, -1.15, -0.15]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.72, 32]} />
              <meshBasicMaterial color="#050913" transparent opacity={0.34} />
            </mesh>
            <Suspense fallback={null}>
              <WalkerModel progress={progress} />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  );
}
