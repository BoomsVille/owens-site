import Image from "next/image";

const navItems = [
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "work", label: "Work" },
  { id: "process", label: "Process" },
  { id: "contact", label: "Contact" }
];

export function Sidebar() {
  return (
    <aside className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:py-16">
      <div>
        <div className="float-right mb-3 ml-4 mt-1 block">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border border-accentBlue/55 bg-slatePanel shadow-[0_8px_18px_rgba(0,0,0,0.35)]">
            <Image
              src="/owen.jpg"
              alt="Owen Smith headshot"
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        </div>
        <p className="text-sm uppercase tracking-[0.18em] text-accentBlue/85">Creative Freelancer</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-mist sm:text-5xl">Owen Smith</h1>
        <p className="mt-5 max-w-sm text-lg leading-snug text-mist">Web Developer, Social Media Manager and Photographer</p>
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-mistSoft">
          I partner with ambitious brands to sharpen their online presence through thoughtful websites, stronger social content, and professional visual storytelling.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-accentBlue/45 bg-accentBlue/10 px-3 py-1 text-xs font-semibold tracking-[0.1em] text-accentBlueSoft">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          AVAILABLE FOR NEW PROJECTS
        </div>
      </div>

      <div className="mt-10 lg:mt-12">
        <nav aria-label="Section navigation" className="space-y-3">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="nav-link block text-sm uppercase tracking-[0.16em] text-mistSoft transition-colors duration-300 hover:text-accentBlue"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-mistSoft">
          <a className="transition-colors duration-300 hover:text-accentBlue" href="https://instagram.com" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a className="transition-colors duration-300 hover:text-accentBlue" href="https://www.facebook.com" target="_blank" rel="noreferrer">
            Facebook
          </a>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <a href="mailto:owen@freelancedesign.co.uk" className="text-sm text-accentBlueSoft transition-colors duration-300 hover:text-mist">
            owen@freelancedesign.co.uk
          </a>
          <a
            href="#contact"
            className="inline-flex rounded-full border border-accentBlue/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-accentBlueSoft transition-colors duration-300 hover:border-accentBlueSoft hover:text-mist"
          >
            Start Project
          </a>
        </div>
      </div>
    </aside>
  );
}
