import Image from "next/image";

type WorkCardProps = {
  category: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
};

export function WorkCard({ category, title, summary, image, imageAlt }: WorkCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slateLine/80 bg-slatePanel/45 transition-all duration-300 hover:border-accentBlue/70 hover:shadow-panel">
      <div className="relative h-48 w-full overflow-hidden sm:h-56">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accentBlue/80">{category}</p>
        <h3 className="mt-3 text-xl font-semibold text-mist">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-mistSoft">{summary}</p>
      </div>
    </article>
  );
}
