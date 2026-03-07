import Link from "next/link";

type ServiceCardProps = {
  title: string;
  description: string;
  href?: string;
};

export function ServiceCard({ title, description, href }: ServiceCardProps) {
  const card = (
    <article className="led-card-edge group flex h-full min-h-[190px] flex-col rounded-2xl border border-slateLine/80 bg-slatePanel/45 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accentBlue/70 hover:bg-slatePanel/60 hover:shadow-panel sm:min-h-[210px]">
      <h3 className="text-xl font-semibold text-mist">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-mistSoft">{description}</p>
      {href ? (
        <span className="mt-5 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-accentBlueSoft">
          Learn More
        </span>
      ) : null}
    </article>
  );

  if (!href) return card;
  return (
    <Link href={href} aria-label={`Open ${title} service page`}>
      {card}
    </Link>
  );
}
