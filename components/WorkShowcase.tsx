"use client";

import { useEffect, useRef, useState } from "react";

import { BrandCaseStudy } from "@/components/BrandCaseStudy";
import { BrandWork } from "@/data/work";

type WorkShowcaseProps = {
  entries: BrandWork[];
};

export function WorkShowcase({ entries }: WorkShowcaseProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const touchStartLeftRef = useRef(0);
  const touchStartIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackHeight, setTrackHeight] = useState<number | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let ticking = false;

    const updateActive = () => {
      const children = Array.from(container.children) as HTMLElement[];
      const containerRect = container.getBoundingClientRect();
      let bestIndex = 0;
      let bestVisibleWidth = -1;

      children.forEach((child, idx) => {
        const childRect = child.getBoundingClientRect();
        const visibleWidth = Math.max(0, Math.min(childRect.right, containerRect.right) - Math.max(childRect.left, containerRect.left));
        if (visibleWidth > bestVisibleWidth) {
          bestVisibleWidth = visibleWidth;
          bestIndex = idx;
        }
      });

      setActiveIndex(bestIndex);
      const activeChild = children[bestIndex];
      if (activeChild) setTrackHeight(activeChild.offsetHeight);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateActive);
    };

    updateActive();
    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const isMobileViewport = () => window.matchMedia("(max-width: 767px)").matches;

    const onTouchStart = () => {
      if (!isMobileViewport()) return;
      touchStartLeftRef.current = container.scrollLeft;

      const children = Array.from(container.children) as HTMLElement[];
      const nearestIndex = children.reduce(
        (best, child, idx) => {
          const distance = Math.abs(child.offsetLeft - container.scrollLeft);
          return distance < best.distance ? { index: idx, distance } : best;
        },
        { index: 0, distance: Number.POSITIVE_INFINITY }
      ).index;

      touchStartIndexRef.current = nearestIndex;
    };

    const onTouchEnd = () => {
      if (!isMobileViewport()) return;

      const delta = container.scrollLeft - touchStartLeftRef.current;
      if (Math.abs(delta) < 8) return;

      const direction = delta > 0 ? 1 : -1;
      const children = Array.from(container.children) as HTMLElement[];
      const maxIndex = Math.max(0, children.length - 1);
      const targetIndex = Math.max(0, Math.min(maxIndex, touchStartIndexRef.current + direction));
      const target = children[targetIndex];
      if (!target) return;

      container.scrollTo({
        left: target.offsetLeft,
        behavior: "smooth"
      });
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const activeEntry = entries[Math.min(activeIndex, entries.length - 1)];

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.12em] text-accentBlueSoft">Swipe horizontally for next project →</p>
        <div className="flex items-center gap-2">
          {[...entries, { slug: "more-projects" }].map((entry, idx) => (
            <span key={entry.slug} className={`h-1.5 rounded-full ${idx === activeIndex ? "w-7 bg-accentBlue/80" : "w-3 bg-slateLine/80"}`} />
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex items-start snap-x snap-mandatory gap-0 overflow-x-auto overflow-y-hidden pb-2 transition-[height] duration-300"
        style={trackHeight ? { height: `${trackHeight}px` } : undefined}
      >
        {entries.map((entry) => (
          <div key={entry.slug} className="w-full min-w-full shrink-0 snap-start [scroll-snap-stop:always]">
            <BrandCaseStudy entry={entry} />
          </div>
        ))}
        <div className="w-full min-w-full shrink-0 snap-start [scroll-snap-stop:always]">
          <article className="rounded-2xl border border-dashed border-accentBlue/45 bg-slatePanel/35 p-7">
            <p className="text-xs uppercase tracking-[0.15em] text-accentBlue/85">More Projects</p>
            <h3 className="mt-3 text-2xl font-semibold text-mist">More completed case studies coming next.</h3>
            <p className="mt-4 w-full text-sm leading-relaxed text-mistSoft">
              New brands and project outcomes will continue to be added here. Keep swiping this section as the portfolio grows.
            </p>
          </article>
        </div>
      </div>

      {activeEntry?.testimonial && (
        <div className="mt-8">
          <article className="rounded-xl border border-slateLine/75 bg-slatePanel/45 p-5">
            <p className="text-sm leading-relaxed text-mistSoft">“{activeEntry.testimonial.quote}”</p>
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-accentBlueSoft">{activeEntry.testimonial.name}</p>
          </article>
        </div>
      )}
    </>
  );
}
