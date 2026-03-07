"use client";

import { useEffect, useState } from "react";

import { EnquiryModalButton } from "@/components/EnquiryModalButton";
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
      <div className="led-card-edge w-full rounded-2xl border border-slateLine/80 bg-slatePanel/50 p-7 sm:p-8">
        <p className="text-base leading-relaxed text-mistSoft">
          If you need a cleaner website, stronger social presence, or premium visuals for your brand, I would love to hear what you are planning.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <EnquiryModalButton />

          <button
            type="button"
            onClick={() => setIsGameOpen(true)}
            className="led-btn-edge inline-flex rounded-full border border-slateLine px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-mistSoft transition-colors duration-300 hover:border-accentBlue/80 hover:text-mist"
          >
            Or Play Retro Games
          </button>
        </div>
      </div>

      {isGameOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#020713]/60 backdrop-blur-md"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsGameOpen(false);
          }}
        >
          <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
            <div className="led-card-edge w-full max-w-5xl overflow-hidden rounded-2xl border border-slateLine/80 bg-[#071127]/95 shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
              <div className="flex items-center justify-between border-b border-slateLine/70 bg-slatePanel/35 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accentBlueSoft">Retro Game Window</p>
                <button
                  type="button"
                  onClick={() => setIsGameOpen(false)}
                  className="led-btn-edge rounded-full border border-slateLine px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-mistSoft transition-colors duration-200 hover:border-accentBlue hover:text-mist"
                >
                  Close
                </button>
              </div>
              <div className="max-h-[calc(100vh-8rem)] overflow-auto p-3 sm:p-5">
                <RetroTvGalaga />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
