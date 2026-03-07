"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { WorkShowcase } from "@/components/WorkShowcase";
import { BrandWork } from "@/data/work";

type AppId = "about" | "services" | "projects" | "contact" | "camera" | "home";
type WidgetId = "calendar" | "weather" | "gallery";
type DesktopGalleryImage = {
  src: string;
  alt: string;
};

type DesktopApp = {
  id: AppId;
  label: string;
  iconSrc: string;
  title: string;
  url: string;
};

const apps: DesktopApp[] = [
  { id: "home", label: "Home", iconSrc: "https://img.icons8.com/fluency/96/safari.png", title: "Portfolio Browser", url: "http://localhost:3000/" },
  { id: "about", label: "About", iconSrc: "https://img.icons8.com/fluency/96/user-male-circle.png", title: "About - Portfolio", url: "/#about" },
  { id: "services", label: "Services", iconSrc: "https://img.icons8.com/fluency/96/services.png", title: "Services - Portfolio", url: "/#services" },
  { id: "projects", label: "Work", iconSrc: "https://img.icons8.com/fluency/96/folder-invoices.png", title: "Work - Portfolio", url: "/#work" },
  { id: "contact", label: "Contact", iconSrc: "https://img.icons8.com/fluency/96/apple-mail.png", title: "Contact - Portfolio", url: "/#contact" },
  { id: "camera", label: "Photo", iconSrc: "https://img.icons8.com/fluency/96/camera--v1.png", title: "Photography - Portfolio", url: "/#work" }
];
const HOME_URL = "http://localhost:3000/";

const getInitialIconPositions = (viewportWidth: number): Record<AppId, { x: number; y: number }> => {
  const center = viewportWidth / 2;
  const leftColX = Math.max(120, center - 190);
  const rightColX = leftColX + 132;
  return {
    home: { x: leftColX, y: 120 },
    about: { x: rightColX, y: 120 },
    services: { x: leftColX, y: 240 },
    projects: { x: rightColX, y: 240 },
    contact: { x: leftColX, y: 360 },
    camera: { x: rightColX, y: 360 }
  };
};

const getInitialWidgetPositions = (viewportWidth: number): Record<WidgetId, { x: number; y: number }> => ({
  calendar: { x: 20, y: 20 },
  weather: { x: 20, y: 170 },
  gallery: { x: Math.max(20, viewportWidth - 290), y: 20 }
});

type DesktopExperienceProps = {
  galleryImages: DesktopGalleryImage[];
  workEntries: BrandWork[];
};

export function DesktopExperience({ galleryImages, workEntries }: DesktopExperienceProps) {
  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [clock, setClock] = useState("");
  const [dayLabel, setDayLabel] = useState("");
  const [isNarrow, setIsNarrow] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 760, height: 520 });
  const [windowPos, setWindowPos] = useState({ x: 320, y: 56 });
  const [iconPos, setIconPos] = useState<Record<AppId, { x: number; y: number }>>({
    home: { x: 0, y: 0 },
    about: { x: 0, y: 0 },
    services: { x: 0, y: 0 },
    projects: { x: 0, y: 0 },
    contact: { x: 0, y: 0 },
    camera: { x: 0, y: 0 }
  });
  const [widgetPos, setWidgetPos] = useState<Record<WidgetId, { x: number; y: number }>>({
    calendar: { x: 20, y: 20 },
    weather: { x: 20, y: 170 },
    gallery: { x: 20, y: 20 }
  });
  const [showWorkPopup, setShowWorkPopup] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const suppressIconClickRef = useRef<AppId | null>(null);
  const activeGalleryImage = galleryImages.length > 0 ? galleryImages[galleryIndex % galleryImages.length] : null;

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      );
      setDayLabel(
        now.toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric"
        })
      );
    };

    updateClock();
    setIsNarrow(window.innerWidth < 1200);
    setIconPos(getInitialIconPositions(window.innerWidth));
    setWidgetPos(getInitialWidgetPositions(window.innerWidth));
    const timer = window.setInterval(updateClock, 1000);
    const onResize = () => setIsNarrow(window.innerWidth < 1200);
    window.addEventListener("resize", onResize);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (galleryImages.length <= 1) return;
    const timer = window.setInterval(() => {
      setGalleryIndex((current) => (current + 1) % galleryImages.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [galleryImages]);

  const appMap = useMemo(() => new Map(apps.map((app) => [app.id, app])), []);

  const launchApp = (id: AppId) => {
    if (id === "home") {
      window.location.href = HOME_URL;
      return;
    }
    if (id === "projects") {
      setShowWorkPopup(true);
      return;
    }
    setActiveApp(id);
    setIsExpanded(false);
    if (isNarrow) setWindowPos({ x: 20, y: 56 });
  };

  const closeApp = () => {
    setActiveApp(null);
    setIsExpanded(false);
  };

  const submitContactEmail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const lines = [
      contactName ? `Name: ${contactName}` : "",
      contactEmail ? `Email: ${contactEmail}` : "",
      "",
      contactMessage
    ]
      .filter(Boolean)
      .join("\n");
    const mailto = `mailto:hello@owensmith.co.uk?subject=${encodeURIComponent(contactSubject || "New project enquiry")}&body=${encodeURIComponent(lines)}`;
    window.location.href = mailto;
  };

  const toggleMenu = (menuName: string) => {
    setMenuOpen((current) => (current === menuName ? null : menuName));
  };

  const startWindowDrag = (event: React.MouseEvent<HTMLElement>) => {
    if (isExpanded) return;
    const target = event.target as HTMLElement;
    if (target.closest("button")) return;

    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startPos = { ...windowPos };

    const onMove = (moveEvent: MouseEvent) => {
      const nextX = Math.max(8, startPos.x + (moveEvent.clientX - startX));
      const nextY = Math.max(42, startPos.y + (moveEvent.clientY - startY));
      setWindowPos({ x: nextX, y: nextY });
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const startWidgetDrag = (id: WidgetId, event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startPos = { ...widgetPos[id] };

    const onMove = (moveEvent: MouseEvent) => {
      const nextX = Math.max(8, startPos.x + (moveEvent.clientX - startX));
      const nextY = Math.max(8, startPos.y + (moveEvent.clientY - startY));
      setWidgetPos((current) => ({ ...current, [id]: { x: nextX, y: nextY } }));
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const startIconDrag = (id: AppId, event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startPos = { ...iconPos[id] };
    let moved = false;

    const onMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) moved = true;

      const nextX = Math.max(8, startPos.x + deltaX);
      const nextY = Math.max(8, startPos.y + deltaY);
      setIconPos((current) => ({ ...current, [id]: { x: nextX, y: nextY } }));
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (moved) {
        suppressIconClickRef.current = id;
        window.setTimeout(() => {
          if (suppressIconClickRef.current === id) suppressIconClickRef.current = null;
        }, 120);
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_18%,#74b8ff_0%,#4f8fe0_28%,#2b5baf_55%,#17346d_80%,#0a1c3f_100%)]">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2200&q=80"
      >
        <source src="/desktop-loop.mp4" type="video/mp4" />
        <source src="https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4" type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.14),transparent_34%,rgba(0,0,0,0.2))]" />
      <div className="pointer-events-none absolute inset-0 bg-slate-900/25" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-cyan-100/20 blur-3xl" />
      <div className="pointer-events-none absolute right-16 top-24 h-64 w-64 rounded-full bg-indigo-200/20 blur-3xl" />

      <header className="relative z-40 flex h-10 items-center justify-between border-b border-white/30 bg-white/28 px-3 text-[12px] text-white backdrop-blur-xl">
        <div className="flex items-center gap-4 font-semibold">
          <span className="text-[14px]"></span>
          <button type="button" onClick={() => toggleMenu("Finder")} className="rounded px-1.5 py-0.5 hover:bg-white/35">
            Finder
          </button>
          <button type="button" onClick={() => toggleMenu("File")} className="hidden rounded px-1.5 py-0.5 hover:bg-white/35 sm:inline">
            File
          </button>
          <button type="button" onClick={() => toggleMenu("Edit")} className="hidden rounded px-1.5 py-0.5 hover:bg-white/35 sm:inline">
            Edit
          </button>
          <button type="button" onClick={() => toggleMenu("View")} className="hidden rounded px-1.5 py-0.5 hover:bg-white/35 sm:inline">
            View
          </button>
          <button type="button" onClick={() => toggleMenu("Go")} className="hidden rounded px-1.5 py-0.5 hover:bg-white/35 sm:inline">
            Go
          </button>
          <button type="button" onClick={() => toggleMenu("Window")} className="hidden rounded px-1.5 py-0.5 hover:bg-white/35 sm:inline">
            Window
          </button>
          <button type="button" onClick={() => toggleMenu("Help")} className="hidden rounded px-1.5 py-0.5 hover:bg-white/35 sm:inline">
            Help
          </button>
        </div>
        <div className="flex items-center gap-3 font-semibold">
          <Link href={HOME_URL} className="rounded px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-white/35">
            Back To Home
          </Link>
          <span>{dayLabel}</span>
          <span>{clock}</span>
        </div>
      </header>

      {menuOpen && (
        <div className="absolute left-4 top-11 z-50 w-52 rounded-xl border border-white/50 bg-white/85 p-2 text-xs text-slate-700 shadow-[0_18px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          {menuOpen === "Finder" && (
            <button type="button" onClick={() => { launchApp("home"); setMenuOpen(null); }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-slate-100">
              Open Portfolio Browser
            </button>
          )}
          {menuOpen === "File" && (
            <button type="button" onClick={() => { launchApp("services"); setMenuOpen(null); }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-slate-100">
              New Services Window
            </button>
          )}
          {menuOpen === "Edit" && <p className="px-2 py-1.5 text-slate-500">No editable content in desktop mode.</p>}
          {menuOpen === "View" && (
            <button
              type="button"
              onClick={() => {
                if (activeApp) setIsExpanded((v) => !v);
                setMenuOpen(null);
              }}
              className="block w-full rounded px-2 py-1.5 text-left hover:bg-slate-100"
            >
              {isExpanded ? "Restore Browser Window" : "Expand Browser Window"}
            </button>
          )}
          {menuOpen === "Go" && (
            <button type="button" onClick={() => { launchApp("about"); setMenuOpen(null); }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-slate-100">
              Go to About
            </button>
          )}
          {menuOpen === "Window" && (
            <button type="button" onClick={() => { closeApp(); setMenuOpen(null); }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-slate-100">
              Close Browser
            </button>
          )}
          {menuOpen === "Help" && (
            <button type="button" onClick={() => { launchApp("contact"); setMenuOpen(null); }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-slate-100">
              Contact Support
            </button>
          )}
        </div>
      )}

      <main className="relative h-[calc(100%-40px)]" onClick={() => setMenuOpen(null)}>
        <div className="absolute inset-0 z-20 hidden xl:block">
          <section
            onMouseDown={(event) => startWidgetDrag("calendar", event)}
            className="absolute w-64 cursor-move rounded-3xl border border-white/30 bg-slate-900/45 p-4 text-white backdrop-blur-xl"
            style={{ left: widgetPos.calendar.x, top: widgetPos.calendar.y }}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-rose-300">Calendar</p>
            <p className="mt-2 text-3xl font-semibold">Fri</p>
            <p className="text-sm text-white/85">{dayLabel}</p>
          </section>

          <section
            onMouseDown={(event) => startWidgetDrag("weather", event)}
            className="absolute w-64 cursor-move rounded-3xl border border-white/30 bg-slate-900/45 p-4 text-white backdrop-blur-xl"
            style={{ left: widgetPos.weather.x, top: widgetPos.weather.y }}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Weather</p>
            <p className="mt-2 text-4xl font-semibold">8°</p>
            <p className="text-sm text-white/85">London · Cloudy</p>
            <p className="text-xs text-white/70">H:11° L:8°</p>
          </section>

          <section
            className="absolute w-72 rounded-3xl border border-white/30 bg-slate-900/45 p-3 text-white backdrop-blur-xl"
            style={{ left: widgetPos.gallery.x, top: widgetPos.gallery.y }}
          >
            <div onMouseDown={(event) => startWidgetDrag("gallery", event)} className="cursor-move rounded-2xl bg-white/10 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">Photos</p>
              <p className="text-[10px] text-white/70">Widget Preview</p>
            </div>

            {activeGalleryImage ? (
              <div className="mt-3 rounded-2xl bg-black/25 p-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10">
                  <img src={activeGalleryImage.src} alt={activeGalleryImage.alt} className="h-full w-full object-cover" loading="lazy" />
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-white/75">No project images found yet.</p>
            )}
          </section>
        </div>

        <div className="absolute inset-0 z-20">
          {apps.map((app) => (
            <button
              key={app.id}
              type="button"
              onMouseDown={(event) => startIconDrag(app.id, event)}
              onClick={() => {
                if (suppressIconClickRef.current === app.id) return;
                launchApp(app.id);
              }}
              className="group absolute flex w-[104px] cursor-grab flex-col items-center rounded-2xl p-2 text-white transition hover:bg-white/12 active:cursor-grabbing"
              style={{ left: iconPos[app.id].x, top: iconPos[app.id].y }}
            >
              <span className="relative flex h-[80px] w-[80px] items-center justify-center rounded-[22px] border border-white/35 bg-white/10 shadow-[0_14px_24px_rgba(0,0,0,0.32)] transition group-hover:scale-[1.05]">
                <img src={app.iconSrc} alt={app.label} className="h-[72px] w-[72px] rounded-[18px] object-cover" draggable={false} />
              </span>
              <span className="mt-2 text-[13px] font-semibold leading-tight tracking-[0.01em] text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">
                {app.label}
              </span>
            </button>
          ))}
        </div>

        <div className="relative h-full px-4 pb-4 pt-14 sm:px-8">
          {activeApp && (() => {
            const app = appMap.get(activeApp);
            if (!app) return null;

            return (
              <section
                className="absolute overflow-hidden rounded-2xl border border-white/50 bg-slate-100/90 shadow-[0_24px_54px_rgba(0,0,0,0.28)] backdrop-blur-lg"
                style={{
                  top: isExpanded ? 10 : windowPos.y,
                  left: isExpanded ? 10 : windowPos.x,
                  width: isExpanded ? "calc(100% - 20px)" : `min(94vw, ${windowSize.width}px)`,
                  height: isExpanded ? "calc(100% - 20px)" : `${windowSize.height}px`,
                  zIndex: 30
                }}
              >
                <header onMouseDown={startWindowDrag} className="cursor-move border-b border-slate-300/65 bg-slate-200/95 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Close window"
                        onClick={closeApp}
                        className="h-3.5 w-3.5 rounded-full bg-[#ff5f57]"
                      />
                      <button type="button" aria-label="Minimize window" onClick={closeApp} className="h-3.5 w-3.5 rounded-full bg-[#febc2e]" />
                      <button
                        type="button"
                        aria-label="Expand window"
                        onClick={() => setIsExpanded((v) => !v)}
                        className="h-3.5 w-3.5 rounded-full bg-[#28c840]"
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{app.title}</span>
                    <span className="w-[42px]" />
                  </div>
                  <div className="mt-2 rounded-md border border-slate-300 bg-white/80 px-3 py-1.5 text-[11px] text-slate-600">{app.url}</div>
                </header>
                <div className="h-[calc(100%-68px)] bg-white">
                  {activeApp === "services" ? (
                    <article className="h-full overflow-y-auto bg-[#fffef8] p-5 text-slate-800">
                      <h3 className="font-mono text-lg font-semibold">Services Offered</h3>
                      <p className="mt-1 font-mono text-xs text-slate-500">notepad.txt</p>
                      <div className="mt-4 space-y-4 font-mono text-sm leading-relaxed">
                        <section>
                          <p className="font-semibold">1. Web Development</p>
                          <p className="text-slate-700">Design and build modern, fast websites tailored to your brand and conversion goals.</p>
                        </section>
                        <section>
                          <p className="font-semibold">2. Social Media Management</p>
                          <p className="text-slate-700">Plan, create, and manage consistent content to grow visibility and engagement.</p>
                        </section>
                        <section>
                          <p className="font-semibold">3. Photography</p>
                          <p className="text-slate-700">Professional photo content for websites, campaigns, and social channels.</p>
                        </section>
                        <section>
                          <p className="font-semibold">4. Content Creation</p>
                          <p className="text-slate-700">Brand-aligned creative assets built to communicate clearly and perform.</p>
                        </section>
                      </div>
                    </article>
                  ) : activeApp === "contact" ? (
                    <article className="h-full overflow-y-auto bg-[#f7f8fb] p-5 text-slate-800">
                      <h3 className="text-base font-semibold text-slate-700">New Message</h3>
                      <form onSubmit={submitContactEmail} className="mt-4 space-y-3">
                        <div className="rounded-lg border border-slate-300 bg-white px-3 py-2">
                          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">To</label>
                          <p className="mt-1 text-sm text-slate-800">hello@owensmith.co.uk</p>
                        </div>
                        <div className="rounded-lg border border-slate-300 bg-white px-3 py-2">
                          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Your Name</label>
                          <input
                            value={contactName}
                            onChange={(event) => setContactName(event.target.value)}
                            className="mt-1 w-full bg-transparent text-sm text-slate-800 outline-none"
                            placeholder="Your name"
                          />
                        </div>
                        <div className="rounded-lg border border-slate-300 bg-white px-3 py-2">
                          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Your Email</label>
                          <input
                            type="email"
                            value={contactEmail}
                            onChange={(event) => setContactEmail(event.target.value)}
                            className="mt-1 w-full bg-transparent text-sm text-slate-800 outline-none"
                            placeholder="name@company.com"
                          />
                        </div>
                        <div className="rounded-lg border border-slate-300 bg-white px-3 py-2">
                          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Subject</label>
                          <input
                            value={contactSubject}
                            onChange={(event) => setContactSubject(event.target.value)}
                            className="mt-1 w-full bg-transparent text-sm text-slate-800 outline-none"
                            placeholder="Project enquiry"
                          />
                        </div>
                        <div className="rounded-lg border border-slate-300 bg-white px-3 py-2">
                          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Message</label>
                          <textarea
                            value={contactMessage}
                            onChange={(event) => setContactMessage(event.target.value)}
                            className="mt-1 h-40 w-full resize-y bg-transparent text-sm text-slate-800 outline-none"
                            placeholder="Hi Owen, I’d like help with..."
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-blue-500"
                          >
                            Send
                          </button>
                        </div>
                      </form>
                    </article>
                  ) : activeApp === "camera" ? (
                    <article className="h-full overflow-y-auto bg-[#0f172a] p-4 text-white">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-200">Photo Gallery</h3>
                        <p className="text-[11px] text-white/65">{galleryImages.length} images</p>
                      </div>
                      {galleryImages.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {galleryImages.map((image, index) => (
                            <a
                              key={`${image.src}-${index}`}
                              href={image.src}
                              target="_blank"
                              rel="noreferrer"
                              className="relative aspect-square overflow-hidden rounded-lg border border-white/10"
                            >
                              <img
                                src={image.src}
                                alt={image.alt}
                                className="h-full w-full object-cover"
                                loading={index < 12 ? "eager" : "lazy"}
                                decoding="async"
                              />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-white/75">No gallery images found yet.</p>
                      )}
                    </article>
                  ) : (
                    <iframe title={app.title} src={app.url} className="h-full w-full border-0" />
                  )}
                </div>
                {!isExpanded && (
                  <button
                    type="button"
                    aria-label="Resize browser window"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      const startX = event.clientX;
                      const startY = event.clientY;
                      const startW = windowSize.width;
                      const startH = windowSize.height;

                      const onMove = (moveEvent: MouseEvent) => {
                        const nextW = Math.max(520, startW + moveEvent.clientX - startX);
                        const nextH = Math.max(360, startH + moveEvent.clientY - startY);
                        setWindowSize({ width: nextW, height: nextH });
                      };

                      const onUp = () => {
                        window.removeEventListener("mousemove", onMove);
                        window.removeEventListener("mouseup", onUp);
                      };

                      window.addEventListener("mousemove", onMove);
                      window.addEventListener("mouseup", onUp);
                    }}
                    className="absolute bottom-1 right-1 h-4 w-4 cursor-se-resize rounded-sm bg-slate-400/55"
                  />
                )}
              </section>
            );
          })()}
        </div>
        {showWorkPopup && (
          <div className="absolute inset-0 z-[55] flex items-start justify-center bg-slate-950/45 p-6 backdrop-blur-md">
            <section className="max-h-[92%] w-full max-w-6xl overflow-y-auto rounded-2xl border border-white/30 bg-slate-900/80 p-5 shadow-[0_24px_54px_rgba(0,0,0,0.4)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-accentBlueSoft">Work</p>
                  <h2 className="text-2xl font-semibold text-mist">Completed brand work.</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWorkPopup(false)}
                  className="rounded-full border border-white/35 bg-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white"
                >
                  Close
                </button>
              </div>
              <WorkShowcase entries={workEntries} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
