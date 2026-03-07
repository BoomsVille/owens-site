import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EnquiryModalButton } from "@/components/EnquiryModalButton";
import { servicePageMap, servicePages } from "@/lib/servicePages";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return servicePages.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = servicePageMap.get(slug);
  if (!service) return {};

  return {
    title: service.navLabel,
    description: service.intro
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = servicePageMap.get(slug);
  if (!service) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10 sm:px-10">
      <div className="led-card-edge rounded-2xl border border-slateLine/75 bg-slatePanel/45 p-6 sm:p-10">
        <Link
          href="/#services"
          className="led-btn-edge inline-flex rounded-full border border-accentBlue/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accentBlueSoft transition-colors duration-200 hover:border-accentBlueSoft hover:text-mist"
        >
          Back to Services
        </Link>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accentBlue/85">{service.subtitle}</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-mist sm:text-5xl">{service.title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-mistSoft">{service.intro}</p>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-accentBlueSoft">{service.fromPrice}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {service.outcomes.map((outcome) => (
            <span key={outcome} className="rounded-full border border-slateLine/80 bg-slatePanel/60 px-3 py-1 text-xs uppercase tracking-[0.11em] text-accentBlueSoft">
              {outcome}
            </span>
          ))}
        </div>
      </div>

      <section className="mt-10">
        <article className="led-card-edge rounded-2xl border border-slateLine/75 bg-slatePanel/45 p-6">
          <h2 className="text-2xl font-semibold text-mist">What you get</h2>
          <ul className="mt-5 space-y-3">
            {service.includes.map((item) => (
              <li key={item} className="rounded-xl border border-slateLine/70 bg-slatePanel/45 p-3 text-sm text-mistSoft">
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="led-card-edge mt-8 rounded-2xl border border-slateLine/75 bg-slatePanel/45 p-6">
        <h2 className="text-2xl font-semibold text-mist">Delivery process</h2>
        <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 touch-pan-x sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
          {service.process.map((step) => (
            <div key={step.step} className="w-[86%] shrink-0 snap-start rounded-xl border border-slateLine/70 bg-slatePanel/45 p-4 sm:w-auto sm:shrink">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accentBlueSoft">{step.step}</p>
              <p className="mt-2 text-lg font-semibold text-mist">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-mistSoft">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="led-card-edge mt-8 rounded-2xl border border-slateLine/75 bg-slatePanel/45 p-6">
        <h2 className="text-2xl font-semibold text-mist">FAQs</h2>
        <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 touch-pan-x sm:block sm:overflow-visible sm:pb-0">
          {service.faqs.map((faq) => (
            <article key={faq.question} className="w-[88%] shrink-0 snap-start rounded-xl border border-slateLine/70 bg-slatePanel/45 p-4 sm:mb-4 sm:w-auto sm:shrink-0">
              <h3 className="text-base font-semibold text-mist">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mistSoft">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="led-card-edge mt-8 rounded-2xl border border-accentBlue/45 bg-accentBlue/10 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accentBlueSoft">Ready To Start</p>
        <h2 className="mt-3 text-2xl font-semibold text-mist sm:text-3xl">Let us scope your {service.navLabel.toLowerCase()} project.</h2>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <EnquiryModalButton
            service={service.navLabel}
            buttonLabel="Start Your Enquiry"
            className="led-btn-edge inline-flex rounded-full border border-accentBlue/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-accentBlueSoft transition-colors duration-300 hover:border-accentBlueSoft hover:text-mist"
          />
          <Link
            href="/#contact"
            className="led-btn-edge inline-flex rounded-full border border-slateLine/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-mistSoft transition-colors duration-300 hover:text-mist"
          >
            Open Contact Section
          </Link>
        </div>
      </section>
    </main>
  );
}
