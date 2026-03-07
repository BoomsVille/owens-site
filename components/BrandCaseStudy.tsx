"use client";

import { useEffect, useRef, useState } from "react";

import { BrandWork, WorkImage } from "@/data/work";

type BrandCaseStudyProps = {
  entry: BrandWork;
};

type WorkImageCardProps = {
  image: WorkImage;
  id: string;
  fallbackSlides?: WorkImage[];
};

const warmedSlideSources = new Set<string>();

function WorkImageCard({ image, id, fallbackSlides = [] }: WorkImageCardProps) {
  const derivedSlides = image.cardLabel
    ? []
    : fallbackSlides
        .filter((slide) => slide.src !== image.src)
        .map((slide) => ({ src: slide.src, alt: slide.alt, caption: slide.caption }));
  const slides = [{ src: image.src, alt: image.alt, caption: image.caption }, ...(image.cardCarousel?.length ? image.cardCarousel : derivedSlides)];
  const [activeIndex, setActiveIndex] = useState(0);
  const isDevelopmentCard = image.cardLabel?.toLowerCase() === "development";
  const activeSlide = slides[activeIndex];
  const activeSlideRef = useRef<HTMLDivElement | null>(null);
  const [canScrollDevelopmentImage, setCanScrollDevelopmentImage] = useState(false);
  const [isDevelopmentImageAtTop, setIsDevelopmentImageAtTop] = useState(true);

  const canSlide = slides.length > 1;

  const goPrev = () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % slides.length);

  useEffect(() => {
    slides.forEach((slide) => {
      if (warmedSlideSources.has(slide.src)) return;
      warmedSlideSources.add(slide.src);
      const img = new window.Image();
      img.decoding = "async";
      img.src = slide.src;
    });
  }, [slides]);

  useEffect(() => {
    if (!isDevelopmentCard || !activeSlideRef.current) return;

    const updateScrollState = () => {
      if (!activeSlideRef.current) return;
      const node = activeSlideRef.current;
      setCanScrollDevelopmentImage(node.scrollHeight > node.clientHeight + 1);
      setIsDevelopmentImageAtTop(node.scrollTop <= 6);
    };

    activeSlideRef.current.scrollTop = 0;
    setIsDevelopmentImageAtTop(true);
    setCanScrollDevelopmentImage(false);
    const rafOne = requestAnimationFrame(updateScrollState);
    const rafTwo = requestAnimationFrame(updateScrollState);

    return () => {
      cancelAnimationFrame(rafOne);
      cancelAnimationFrame(rafTwo);
    };
  }, [activeSlide.src, isDevelopmentCard]);

  return (
    <figure className="led-card-edge w-[84%] shrink-0 snap-start [scroll-snap-stop:always] overflow-hidden rounded-xl border border-slateLine/70 bg-slatePanel/40 sm:w-[48%] md:w-[calc((100%_-_2rem)/3)]">
      <div className="relative w-full overflow-hidden aspect-[4/5]">
        <div
          ref={activeSlideRef}
          onScroll={(event) => {
            if (!isDevelopmentCard) return;
            setIsDevelopmentImageAtTop(event.currentTarget.scrollTop <= 6);
          }}
          className={`absolute inset-0 z-20 block ${isDevelopmentCard ? "overflow-y-auto touch-pan-y overscroll-contain" : "overflow-hidden"}`}
        >
          <img
            src={activeSlide.src}
            alt={activeSlide.alt}
            loading="lazy"
            onLoad={() => {
              if (!isDevelopmentCard || !activeSlideRef.current) return;
              const node = activeSlideRef.current;
              setCanScrollDevelopmentImage(node.scrollHeight > node.clientHeight + 1);
              setIsDevelopmentImageAtTop(node.scrollTop <= 6);
            }}
            className={isDevelopmentCard ? "block h-auto w-full" : "block h-full w-full object-cover object-center"}
          />
        </div>

        {isDevelopmentCard && canScrollDevelopmentImage && isDevelopmentImageAtTop && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/30 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
            Scroll down
          </div>
        )}

        {canSlide && (
          <div className="absolute inset-x-2 top-2 z-30 flex justify-between">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                goPrev();
              }}
              aria-label={`Previous slide ${id}`}
              className="led-btn-edge rounded-full border border-slateLine/85 bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-mist transition-colors duration-200 hover:border-accentBlue/80 hover:text-white"
            >
              {"<"}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                goNext();
              }}
              aria-label={`Next slide ${id}`}
              className="led-btn-edge rounded-full border border-slateLine/85 bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-mist transition-colors duration-200 hover:border-accentBlue/80 hover:text-white"
            >
              {">"}
            </button>
          </div>
        )}
      </div>
      <figcaption className="px-3 py-2 text-xs uppercase tracking-[0.1em] text-mistSoft">{image.cardLabel ?? activeSlide.caption ?? "Project Image"}</figcaption>
    </figure>
  );
}

export function BrandCaseStudy({ entry }: BrandCaseStudyProps) {
  const galleries = entry.galleries?.length
    ? entry.galleries
    : [
        {
          title: "Swipe for more",
          images: entry.images
        }
      ];
  const activeGallery = galleries[0];

  return (
    <article className="led-card-edge rounded-2xl border border-slateLine/75 bg-slatePanel/45 p-6 sm:p-7">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-accentBlue/85">Brand Project</p>
            <h3 className="mt-2 text-2xl font-semibold text-mist">{entry.brand}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-accentBlue/45 bg-accentBlue/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accentBlueSoft">
              {entry.status}
            </span>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-mistSoft">{entry.overview}</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accentBlueSoft">Services Used</p>
            <ul className="mt-3 space-y-2 text-sm text-mistSoft">
              {entry.services.map((service) => (
                <li key={service}>• {service}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accentBlueSoft">Deliverables</p>
            <ul className="mt-3 space-y-2 text-sm text-mistSoft">
              {entry.deliverables.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>

        {entry.links && entry.links.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accentBlueSoft">Live Links</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="led-btn-edge rounded-full border border-slateLine/85 bg-slatePanel/45 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-accentBlueSoft transition-colors duration-200 hover:border-accentBlue/85 hover:text-mist"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {entry.notes && (
          <p className="led-card-edge mt-6 rounded-xl border border-slateLine/75 bg-slatePanel/40 px-4 py-3 text-xs leading-relaxed text-mistSoft">{entry.notes}</p>
        )}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          {activeGallery.images.length > 1 && (
            <div className="ml-auto text-[10px] uppercase tracking-[0.12em] text-mistSoft/85 md:hidden">Swipe right for more →</div>
          )}
        </div>
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 touch-pan-x">
          {activeGallery.images.map((image, index) => (
            <WorkImageCard
              key={`${entry.slug}-${activeGallery.title}-${image.src}`}
              image={image}
              id={`${entry.slug}-${activeGallery.title}-${index + 1}`}
              fallbackSlides={activeGallery.images}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
