"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Vector2 } from "three";

import { dampFactor } from "@/lib/particleCloud";

export function usePointerInfluence(idleDelayMs = 120) {
  const targetNdc = useRef(new Vector2(10, 10));
  const smoothNdc = useRef(new Vector2(10, 10));
  const influence = useRef(0);
  const lastPointerMoveAt = useRef(0);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

    targetNdc.current.set(x, y);
    lastPointerMoveAt.current = performance.now();
  }, []);

  const onPointerLeave = useCallback(() => {
    targetNdc.current.set(10, 10);
    lastPointerMoveAt.current = 0;
  }, []);

  const update = useCallback(
    (deltaSeconds: number) => {
      const now = performance.now();
      const isActive = now - lastPointerMoveAt.current <= idleDelayMs;

      smoothNdc.current.lerp(targetNdc.current, dampFactor(16, deltaSeconds));
      influence.current += (Number(isActive) - influence.current) * dampFactor(8, deltaSeconds);
    },
    [idleDelayMs]
  );

  return {
    smoothNdc,
    influence,
    update,
    bind: {
      onPointerMove,
      onPointerLeave
    }
  };
}
