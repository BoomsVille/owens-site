"use client";

import { useEffect, useState } from "react";

import { RetroTvGalaga } from "@/components/RetroTvGalaga";

export function ContactPanel() {
  const [isGameOpen, setIsGameOpen] = useState(false);

  useEffect(() => {
    if (!isGameOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isGameOpen]);

  return (
    <>
      <div className="w-full rounded-2xl border border-slateLine/80 bg-slatePanel/50 p-7 sm:p-8">
        <p className="text-base leading-relaxed text-mistSoft">
          If you need a cleaner website, stronger social presence, or premium visuals for your brand, I would love to hear what you are planning.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href="mailto:hello@yourname.com"
            className="inline-flex rounded-full border border-accentBlue/80 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-accentBlueSoft transition-colors duration-300 hover:border-accentBlueSoft hover:text-mist"
          >
            Start Your Enquiry
          </a>

          <button
            type="button"
            onClick={() => setIsGameOpen(true)}
            className="inline-flex rounded-full border border-slateLine px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-mistSoft transition-colors duration-300 hover:border-accentBlue/80 hover:text-mist"
          >
            Or Play Retro Games
          </button>
        </div>
      </div>

      {isGameOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050a14]/55 p-4 backdrop-blur-md"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsGameOpen(false);
          }}
        >
          <div className="w-full max-w-4xl">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGameOpen(false)}
                className="rounded-full border border-slateLine bg-slatePanel/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-mistSoft transition-colors duration-300 hover:border-accentBlue hover:text-mist"
              >
                Close
              </button>
            </div>
            <RetroTvGalaga />
          </div>
        </div>
      )}
    </>
  );
}
