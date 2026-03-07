"use client";

import { useEffect, useState } from "react";

export function ScrollSloth() {
  const [viewerReady, setViewerReady] = useState(false);
  const [modelFailed, setModelFailed] = useState(false);
  const [started, setStarted] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [x, setX] = useState(-24);
  const [bob, setBob] = useState(0);

  useEffect(() => {
    const existing = document.querySelector('script[data-model-viewer="true"]') as HTMLScriptElement | null;
    if (existing) {
      if (customElements.get("model-viewer")) setViewerReady(true);
      else existing.addEventListener("load", () => setViewerReady(true), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    script.dataset.modelViewer = "true";
    script.onload = () => setViewerReady(true);
    script.onerror = () => setModelFailed(true);
    document.head.appendChild(script);
  }, []);

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
    let previous = performance.now();
    let position = -24;

    const tick = (now: number) => {
      const dt = now - previous;
      previous = now;

      position += (dt / 1000) * 10.5;
      if (position > 112) {
        setStarted(false);
        return;
      }

      setX(position);
      setBob(Math.sin(now / 180) * 2.2);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [started]);

  if (!started) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-0 z-40 w-full px-2 sm:bottom-6">
      <div
        className="w-[126px] opacity-90 drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)] will-change-transform sm:w-[168px]"
        style={{ transform: `translateX(${x}vw) translateY(${bob}px)` }}
        aria-hidden="true"
      >
        {viewerReady && !modelFailed ? (
          <model-viewer
            src="/models/walker.glb"
            autoplay
            animation-name="Walk"
            camera-orbit="0deg 75deg 1.8m"
            disable-zoom
            disable-pan
            interaction-prompt="none"
            shadow-intensity="1"
            style={{
              width: "100%",
              height: "88px",
              background: "transparent"
            }}
            onError={() => setModelFailed(true)}
          />
        ) : (
          <div className="flex h-[88px] w-full items-end justify-center rounded-xl border border-slateLine/70 bg-slatePanel/35 px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-accentBlueSoft">
            Add /public/models/walker.glb
          </div>
        )}
      </div>
    </div>
  );
}
