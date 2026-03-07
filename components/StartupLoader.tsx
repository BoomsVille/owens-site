"use client";

import { useEffect, useState } from "react";

export function StartupLoader() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [countdown, setCountdown] = useState(2.0);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const countdownStart = performance.now();
    const countdownDuration = 2000;
    const interval = window.setInterval(() => {
      const elapsed = performance.now() - countdownStart;
      const remainingMs = Math.max(0, countdownDuration - elapsed);
      setCountdown(Number((remainingMs / 1000).toFixed(1)));
    }, 100);

    const exitTimer = window.setTimeout(() => {
      setExiting(true);
    }, 2000);

    const unmountTimer = window.setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = previousOverflow;
    }, 2300);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(exitTimer);
      window.clearTimeout(unmountTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`startup-loader-overlay ${exiting ? "startup-loader-overlay--exit" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      <div className="startup-loader-shell">
        <p className="startup-loader-kicker">Freelance Creative</p>
        <h2 className="startup-loader-title">Loading</h2>

        <div className="startup-loader-track" aria-hidden="true">
          <span className="startup-loader-fill" />
        </div>

        <div className="startup-loader-bars" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <p className="startup-loader-countdown" aria-label={`Loading in ${countdown.toFixed(1)} seconds`}>
          {countdown.toFixed(1)}s
        </p>
      </div>
    </div>
  );
}
