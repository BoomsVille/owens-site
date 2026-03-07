"use client";

import { useEffect, useState } from "react";

export function ScrollSloth() {
  const [started, setStarted] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [x, setX] = useState(-24);
  const [bob, setBob] = useState(0);

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
        className="w-[170px] opacity-85 drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)] will-change-transform sm:w-[210px]"
        style={{ transform: `translateX(${x}vw) translateY(${bob}px)` }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 260 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="112" cy="66" rx="76" ry="36" fill="#2A3B58" />
          <ellipse cx="190" cy="58" rx="22" ry="20" fill="#2A3B58" />
          <path d="M176 45C185 39 198 39 206 46C206 52 202 56 196 58C189 59 182 56 176 45Z" fill="#2A3B58" />
          <path d="M48 78C34 84 26 94 25 106C30 112 39 112 46 108C52 99 54 88 48 78Z" fill="#2A3B58" />
          <path d="M78 90C67 98 62 110 67 118H80C86 109 86 98 78 90Z" fill="#2A3B58" />
          <path d="M124 92C112 101 108 112 114 120H126C132 111 132 100 124 92Z" fill="#2A3B58" />
          <path d="M165 89C153 97 147 108 153 118H167C173 109 172 98 165 89Z" fill="#2A3B58" />
          <path d="M208 80C197 88 191 99 195 110H209C216 101 217 90 208 80Z" fill="#2A3B58" />
          <path d="M52 106L48 115L52 116L56 108Z" fill="#2A3B58" />
          <path d="M57 105L54 114L58 115L61 107Z" fill="#2A3B58" />
          <path d="M62 104L60 112L64 113L66 106Z" fill="#2A3B58" />
          <path d="M212 108L208 116L212 117L216 110Z" fill="#2A3B58" />
          <path d="M217 107L214 115L218 116L220 109Z" fill="#2A3B58" />
          <path d="M222 106L220 114L224 115L226 108Z" fill="#2A3B58" />
          <ellipse cx="197" cy="56" rx="2.2" ry="2.2" fill="#151F30" />
          <ellipse cx="188" cy="55" rx="1.9" ry="1.9" fill="#151F30" />
        </svg>
      </div>
    </div>
  );
}
