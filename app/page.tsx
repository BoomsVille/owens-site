import { ContactPanel } from "@/components/ContactPanel";
import { ScrollSloth } from "@/components/ScrollSloth";
import { Section } from "@/components/Section";
import { ServiceCard } from "@/components/ServiceCard";
import { Sidebar } from "@/components/Sidebar";
import { WorkShowcase } from "@/components/WorkShowcase";
import { getCompletedWork } from "@/lib/getCompletedWork";
import Link from "next/link";

const services = [
  {
    title: "Web Development",
    description:
      "I design and build fast, modern websites that feel premium, communicate clearly, and turn visitors into enquiries."
  },
  {
    title: "Social Media Management",
    description:
      "I plan and manage consistent social content that keeps your brand active, relevant, and visible to the right audience."
  },
  {
    title: "Photography",
    description:
      "I produce clean, professional imagery that elevates your brand across websites, campaigns, and social platforms."
  },
  {
    title: "Content Creation",
    description:
      "I create scroll-stopping content built around your message, so your brand looks cohesive and confident everywhere."
  }
];

const proofStats = [
  { value: "35+", label: "Projects Delivered" },
  { value: "12+", label: "Industries Supported" },
  { value: "92%", label: "Repeat Client Rate" }
];

const processSteps = [
  {
    step: "01",
    title: "Discovery",
    detail: "We define your goals, audience, and what success should look like before production starts."
  },
  {
    step: "02",
    title: "Build & Create",
    detail: "I execute your website, social framework, and visual assets with a single creative direction."
  },
  {
    step: "03",
    title: "Launch & Optimize",
    detail: "We publish, measure performance, and refine quickly so your online presence keeps improving."
  }
];

export default async function Home() {
  const completedWork = await getCompletedWork();

  return (
    <>
      <ScrollSloth />
      <div className="w-full px-6 pb-16 pt-8 sm:px-10 lg:px-12 lg:pb-20 lg:pt-0">
        <div className="grid gap-12 lg:grid-cols-[minmax(280px,380px)_1fr] lg:gap-20">
          <Sidebar />

          <main className="min-w-0 lg:py-16">
            <Section
              id="about"
              label="About"
              title={
                <>
                  I help brands show up better online.
                  <Link
                    href="/desktop"
                    className="ml-3 inline-flex translate-y-[-3px] items-center rounded-full border border-accentBlue/75 px-3 py-1 align-middle text-[11px] font-semibold uppercase tracking-[0.12em] text-accentBlueSoft transition-colors duration-200 hover:border-accentBlueSoft hover:text-mist"
                    aria-label="Open Mac view"
                  >
                    Mac View
                  </Link>
                </>
              }
            >
              <div className="w-full space-y-5 text-base leading-relaxed text-mistSoft">
                <p>
                  I am a multidisciplinary freelancer focused on building clean websites, managing engaging social content, and creating visuals that feel polished and real.
                </p>
                <p>
                  My work is built around one goal: helping businesses present themselves with more clarity and confidence, so they attract better clients and stronger opportunities.
                </p>
                <p>
                  I combine technical execution with creative direction to deliver a complete online presence that feels consistent across every touchpoint.
                </p>
              </div>
              <div className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 touch-pan-x sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
                {proofStats.map((stat) => (
                  <article key={stat.label} className="w-[84%] shrink-0 snap-start rounded-xl border border-slateLine/75 bg-slatePanel/45 p-4 sm:w-auto sm:shrink">
                    <p className="text-2xl font-semibold text-mist">{stat.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-mistSoft">{stat.label}</p>
                  </article>
                ))}
              </div>
            </Section>

            <Section id="services" label="Services" title="Focused support for modern brands.">
              <div className="flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto pb-2 touch-pan-x sm:grid sm:grid-cols-2 sm:auto-rows-fr sm:overflow-visible sm:pb-0">
                {services.map((service) => (
                  <div key={service.title} className="h-full w-[86%] shrink-0 snap-start sm:w-auto sm:shrink">
                    <ServiceCard title={service.title} description={service.description} />
                  </div>
                ))}
              </div>
            </Section>

            <Section id="work" label="Work" title="Completed brand work.">
              <WorkShowcase entries={completedWork} />
            </Section>

            <Section id="process" label="Process" title="How we work together.">
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 touch-pan-x sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
                {processSteps.map((item) => (
                  <article key={item.step} className="w-[86%] shrink-0 snap-start rounded-xl border border-slateLine/75 bg-slatePanel/45 p-5 sm:w-auto sm:shrink">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accentBlueSoft">{item.step}</p>
                    <h3 className="mt-3 text-xl font-semibold text-mist">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-mistSoft">{item.detail}</p>
                  </article>
                ))}
              </div>
            </Section>

            <Section id="contact" label="Contact" title="Let us talk about your next project.">
              <ContactPanel />
            </Section>
          </main>
        </div>
      </div>
    </>
  );
}
