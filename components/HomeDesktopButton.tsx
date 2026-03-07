"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function HomeDesktopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(window.self === window.top);
  }, []);

  if (!show) return null;

  return (
    <Link
      href="/desktop"
      className="fixed left-4 top-4 z-50 rounded-lg border border-white/20 bg-slate-900/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition hover:border-white/50 hover:bg-slate-900/75"
    >
      Desktop
    </Link>
  );
}
