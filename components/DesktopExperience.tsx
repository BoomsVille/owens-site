"use client";

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
  { id: "home", label: "Home", iconSrc: "/desktop-ui-icons/safari.png", title: "Portfolio Browser", url: "https://freelancecreative.co.uk/" },
  { id: "about", label: "About", iconSrc: "/desktop-ui-icons/notes.png", title: "About - Portfolio", url: "https://freelancecreative.co.uk/#about" },
  { id: "services", label: "Services", iconSrc: "/desktop-ui-icons/terminal.png", title: "Services - Portfolio", url: "https://freelancecreative.co.uk/#services" },
  { id: "projects", label: "Work", iconSrc: "/desktop-ui-icons/vscode.png", title: "Work - Portfolio", url: "https://freelancecreative.co.uk/#work" },
  { id: "contact", label: "Contact", iconSrc: "/desktop-ui-icons/mail.png", title: "Contact - Portfolio", url: "https://freelancecreative.co.uk/#contact" },
  { id: "camera", label: "Photo", iconSrc: "/desktop-ui-icons/facetime.png", title: "Photography - Portfolio", url: "https://freelancecreative.co.uk/#work" }
];
const HOME_URL = "/";
const dockOrder: AppId[] = ["home", "about", "services", "projects", "contact", "camera"];
const LIVE_BG_VIDEO = "/9667568-hd_1920_1080_25fps.mp4";

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
  const [videoReady, setVideoReady] = useState(false);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [darkDesktop, setDarkDesktop] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(73);
  const [volumeLevel, setVolumeLevel] = useState(75);
  const [isExitingToHome, setIsExitingToHome] = useState(false);
  const [dockMouseX, setDockMouseX] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const suppressIconClickRef = useRef<AppId | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
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
    setIsTouchDevice(window.matchMedia("(hover: none), (pointer: coarse)").matches);
    setIconPos(getInitialIconPositions(window.innerWidth));
    setWidgetPos(getInitialWidgetPositions(window.innerWidth));
    const timer = window.setInterval(updateClock, 1000);
    const onResize = () => {
      setIsNarrow(window.innerWidth < 1200);
      setIsTouchDevice(window.matchMedia("(hover: none), (pointer: coarse)").matches);
    };
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

  useEffect(() => {
    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "video";
    preloadLink.href = LIVE_BG_VIDEO;
    document.head.appendChild(preloadLink);
    return () => {
      document.head.removeChild(preloadLink);
    };
  }, []);

  const appMap = useMemo(() => new Map(apps.map((app) => [app.id, app])), []);
  const dockApps = useMemo(
    () => dockOrder.map((id) => appMap.get(id)).filter((item): item is DesktopApp => Boolean(item)),
    [appMap]
  );

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

  const animateExitToHome = () => {
    if (isExitingToHome) return;
    setIsExitingToHome(true);
    window.setTimeout(() => {
      window.location.href = HOME_URL;
    }, 420);
  };

  const submitContactEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsContactSubmitting(true);
    const lines = [
      contactName ? `Name: ${contactName}` : "",
      contactEmail ? `Email: ${contactEmail}` : "",
      "",
      contactMessage
    ]
      .filter(Boolean)
      .join("\n");
    const mailto = `mailto:owen@freelancedesign.co.uk?subject=${encodeURIComponent(contactSubject || "New project enquiry")}&body=${encodeURIComponent(lines)}`;

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          business: "",
          budget: "",
          message: contactMessage,
          service: contactSubject || "Desktop contact",
          pageUrl: window.location.href
        })
      });

      if (!response.ok) {
        window.location.href = mailto;
      }
    } catch {
      window.location.href = mailto;
    } finally {
      setIsContactSubmitting(false);
    }
  };

  const toggleMenu = (menuName: string) => {
    setMenuOpen((current) => (current === menuName ? null : menuName));
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // no-op: fullscreen can be blocked in some environments
    }
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

  const getDockScale = (index: number) => {
    if (dockMouseX === null || isTouchDevice || !dockRef.current) return 1;
    const rect = dockRef.current.getBoundingClientRect();
    const iconCount = dockApps.length;
    if (!iconCount) return 1;
    const iconSpacing = rect.width / iconCount;
    const iconCenter = iconSpacing * (index + 0.5);
    const distance = Math.abs(dockMouseX - iconCenter);
    const maxDistance = iconSpacing * 1.8;
    if (distance >= maxDistance) return 1;
    return 1 + 0.5 * Math.pow(1 - distance / maxDistance, 2);
  };

  return (
    <div
      className={`relative h-screen overflow-hidden bg-black transition-all duration-[420ms] ease-out ${
        isExitingToHome ? "scale-[0.985] opacity-0 blur-[1px]" : "scale-100 opacity-100 blur-0"
      }`}
    >
      <video
        ref={liveVideoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-45"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => {
          if (liveVideoRef.current) liveVideoRef.current.playbackRate = 0.5;
        }}
        onLoadedData={() => {
          if (liveVideoRef.current) liveVideoRef.current.playbackRate = 0.5;
          setVideoReady(true);
        }}
        onLoadedMetadata={() => {
          if (liveVideoRef.current) liveVideoRef.current.playbackRate = 0.5;
        }}
        onError={() => setVideoReady(false)}
      >
        <source src={LIVE_BG_VIDEO} type="video/mp4" />
      </video>
      <div className={`pointer-events-none absolute inset-0 ${darkDesktop ? "bg-black/42" : "bg-white/10"}`} />

      <header className={`relative z-40 text-[12px] backdrop-blur-xl ${darkDesktop ? "bg-[#2f2f32]/90 text-white" : "bg-[#d7dde8]/90 text-[#1f2a3b]"}`}>
        <div className="flex h-11 items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 pr-1">
              <button type="button" aria-label="Close desktop" onClick={animateExitToHome} className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <button type="button" aria-label="Minimize desktop" onClick={animateExitToHome} className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <button type="button" aria-label="Desktop fullscreen" onClick={toggleFullscreen} className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <button
              type="button"
              onClick={animateExitToHome}
              aria-label="Back to home"
              className={`text-sm ${darkDesktop ? "text-white/70 hover:text-white" : "text-[#1f2a3b]/70 hover:text-[#1f2a3b]"}`}
            >
              ◀
            </button>
            <span className={`text-sm ${darkDesktop ? "text-white/35" : "text-[#1f2a3b]/35"}`}>▶</span>
            <span className={`text-sm ${darkDesktop ? "text-white/35" : "text-[#1f2a3b]/35"}`}>⟳</span>
          </div>
          <div className={`mx-4 max-w-[56vw] flex-1 rounded-md px-3 py-1 text-center text-[12px] ${darkDesktop ? "border border-white/10 bg-[#3b3b3f]/90 text-white/90" : "border border-black/10 bg-white/80 text-[#1f2a3b]/90"}`}>
            freelancecreative.co.uk
          </div>
          <div />
        </div>

        <div className={`flex h-8 items-center justify-between px-3 ${darkDesktop ? "bg-black/40" : "bg-white/35"}`}>
          <div className="flex items-center gap-3 font-semibold">
            <span className="text-[14px] leading-none"></span>
            <button type="button" onClick={() => toggleMenu("Finder")} className={`rounded px-1.5 py-0.5 ${darkDesktop ? "hover:bg-white/14" : "hover:bg-black/10"}`}>
              Finder
            </button>
            <button type="button" onClick={() => toggleMenu("File")} className={`hidden rounded px-1.5 py-0.5 sm:inline ${darkDesktop ? "hover:bg-white/14" : "hover:bg-black/10"}`}>
              File
            </button>
            <button type="button" onClick={() => toggleMenu("Edit")} className={`hidden rounded px-1.5 py-0.5 sm:inline ${darkDesktop ? "hover:bg-white/14" : "hover:bg-black/10"}`}>
              Edit
            </button>
            <button type="button" onClick={() => toggleMenu("View")} className={`hidden rounded px-1.5 py-0.5 sm:inline ${darkDesktop ? "hover:bg-white/14" : "hover:bg-black/10"}`}>
              View
            </button>
            <button type="button" onClick={() => toggleMenu("Go")} className={`hidden rounded px-1.5 py-0.5 sm:inline ${darkDesktop ? "hover:bg-white/14" : "hover:bg-black/10"}`}>
              Go
            </button>
            <button type="button" onClick={() => toggleMenu("Window")} className={`hidden rounded px-1.5 py-0.5 sm:inline ${darkDesktop ? "hover:bg-white/14" : "hover:bg-black/10"}`}>
              Window
            </button>
          </div>
          <div className={`flex items-center gap-3 font-semibold ${darkDesktop ? "text-white/90" : "text-[#1f2a3b]/90"}`}>
            <span className="text-[11px]">100%</span>
            <button type="button" onClick={() => setShowControlCenter((v) => !v)} className={`rounded px-1 ${darkDesktop ? "hover:bg-white/14" : "hover:bg-black/10"}`} title="Control Center">
              ☰
            </button>
            <span>{dayLabel}</span>
            <span>{clock}</span>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="absolute left-4 top-[74px] z-50 w-52 rounded-xl border border-white/35 bg-[#242b3b]/92 p-2 text-xs text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {menuOpen === "Finder" && (
            <button type="button" onClick={() => { launchApp("home"); setMenuOpen(null); }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-white/12">
              Open Portfolio Browser
            </button>
          )}
          {menuOpen === "File" && (
            <button type="button" onClick={() => { launchApp("services"); setMenuOpen(null); }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-white/12">
              New Services Window
            </button>
          )}
          {menuOpen === "Edit" && <p className="px-2 py-1.5 text-white/70">No editable content in desktop mode.</p>}
          {menuOpen === "View" && (
            <button
              type="button"
              onClick={() => {
                if (activeApp) setIsExpanded((v) => !v);
                setMenuOpen(null);
              }}
              className="block w-full rounded px-2 py-1.5 text-left hover:bg-white/12"
            >
              {isExpanded ? "Restore Browser Window" : "Expand Browser Window"}
            </button>
          )}
          {menuOpen === "Go" && (
            <button type="button" onClick={() => { launchApp("about"); setMenuOpen(null); }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-white/12">
              Go to About
            </button>
          )}
          {menuOpen === "Window" && (
            <button type="button" onClick={() => { closeApp(); setMenuOpen(null); }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-white/12">
              Close Browser
            </button>
          )}
          {menuOpen === "Help" && (
            <button type="button" onClick={() => { launchApp("contact"); setMenuOpen(null); }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-white/12">
              Contact Support
            </button>
          )}
        </div>
      )}

      {showControlCenter && (
        <section className={`absolute right-4 top-[78px] z-50 w-[300px] rounded-2xl p-3 shadow-[0_20px_44px_rgba(0,0,0,0.4)] backdrop-blur-2xl ${darkDesktop ? "border border-white/10 bg-[#222b3a]/92 text-white" : "border border-black/10 bg-[#eef2f8]/92 text-[#1f2a3b]"}`}>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setDarkDesktop((v) => !v)} className={`rounded-xl p-2 text-xs ${darkDesktop ? "bg-blue-600/95 text-white" : "bg-[#d7deea] text-[#1f2a3b]"}`}>{darkDesktop ? "Dark" : "Light"}</button>
            <button type="button" onClick={toggleFullscreen} className={`rounded-xl p-2 text-xs ${darkDesktop ? "bg-white/10 text-white" : "bg-[#d7deea] text-[#1f2a3b]"}`}>Fullscreen</button>
          </div>
          <div className={`mt-3 rounded-xl p-3 ${darkDesktop ? "bg-white/8" : "bg-black/5"}`}>
            <div className="mb-2 flex items-center justify-between text-sm"><span>Display</span><span>{displayLevel}%</span></div>
            <input type="range" min={0} max={100} value={displayLevel} onChange={(event) => setDisplayLevel(Number(event.target.value))} className="w-full accent-slate-200" />
          </div>
          <div className={`mt-2 rounded-xl p-3 ${darkDesktop ? "bg-white/8" : "bg-black/5"}`}>
            <div className="mb-2 flex items-center justify-between text-sm"><span>Volume</span><span>{volumeLevel}%</span></div>
            <input type="range" min={0} max={100} value={volumeLevel} onChange={(event) => setVolumeLevel(Number(event.target.value))} className="w-full accent-slate-200" />
          </div>
        </section>
      )}

      <main
        className="relative h-[calc(100%-76px)] pb-24"
        onClick={() => {
          setMenuOpen(null);
          setShowControlCenter(false);
        }}
      >
        <div className="absolute inset-0 z-20 hidden xl:block">
          <section
            onMouseDown={(event) => startWidgetDrag("calendar", event)}
            className="absolute w-64 cursor-move rounded-3xl border border-white/30 bg-slate-900/45 p-4 text-white backdrop-blur-xl"
            style={{ left: widgetPos.calendar.x, top: widgetPos.calendar.y }}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-rose-300">Calendar</p>
            <p className="mt-2 text-3xl font-semibold">{dayLabel.split(",")[0] || "Day"}</p>
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
              <span className="relative flex h-[80px] w-[80px] items-center justify-center rounded-[22px] border border-white/20 bg-black/10 shadow-[0_14px_24px_rgba(0,0,0,0.32)] transition group-hover:scale-[1.05]">
                <img src={app.iconSrc} alt={app.label} className="h-[68px] w-[68px] object-contain" draggable={false} />
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
                        onClick={animateExitToHome}
                        className="h-3.5 w-3.5 rounded-full bg-[#ff5f57]"
                      />
                      <button type="button" aria-label="Minimize window" onClick={animateExitToHome} className="h-3.5 w-3.5 rounded-full bg-[#febc2e]" />
                      <button
                        type="button"
                        aria-label="Window fullscreen"
                        onClick={toggleFullscreen}
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
                          <p className="mt-1 text-sm text-slate-800">owen@freelancedesign.co.uk</p>
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
                            disabled={isContactSubmitting}
                            className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-blue-500"
                          >
                            {isContactSubmitting ? "Sending..." : "Send"}
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

        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-40 flex justify-center px-3">
          <div
            ref={dockRef}
            className="pointer-events-auto flex items-end gap-1 rounded-[20px] border border-white/20 bg-white/20 px-2 py-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.36)] backdrop-blur-2xl"
            onMouseMove={(event) => {
              if (isTouchDevice || !dockRef.current) return;
              const rect = dockRef.current.getBoundingClientRect();
              setDockMouseX(event.clientX - rect.left);
            }}
            onMouseLeave={() => setDockMouseX(null)}
          >
            {dockApps.map((app, index) => {
              const isActive = activeApp === app.id || (app.id === "projects" && showWorkPopup);
              const scale = getDockScale(index);
              return (
                <button
                  key={`dock-${app.id}`}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    launchApp(app.id);
                  }}
                  className="group relative flex h-[58px] w-[58px] items-end justify-center"
                  style={{
                    transform: `translateY(${(scale - 1) * -10}px)`,
                    zIndex: Math.round(scale * 10)
                  }}
                  title={app.label}
                >
                  <span
                    className="relative flex h-[46px] w-[46px] items-center justify-center overflow-hidden rounded-[12px] border border-white/30 bg-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
                    style={{
                      transform: `scale(${scale})`,
                      transition: dockMouseX === null || isTouchDevice ? "transform 180ms ease, opacity 180ms ease" : "none",
                      opacity: isActive ? 1 : 0.94
                    }}
                  >
                    <img src={app.iconSrc} alt={app.label} className="h-[40px] w-[40px] object-contain" draggable={false} />
                  </span>
                  <span
                    className={`absolute -bottom-0.5 h-[4px] w-[4px] rounded-full bg-white transition-opacity ${isActive ? "opacity-95" : "opacity-0 group-hover:opacity-50"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
