import { ReactNode } from "react";

type SectionProps = {
  id: string;
  label: string;
  title: ReactNode;
  visualTitle?: boolean;
  children: ReactNode;
};

export function Section({ id, label, title, visualTitle = false, children }: SectionProps) {
  return (
    <section
      id={id}
      className="section-scroll relative py-14 first:pt-2 last:pb-0 sm:py-20"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accentBlue/85">{label}</p>
      {visualTitle ? (
        <div className="mt-4">{title}</div>
      ) : (
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-mist sm:text-4xl">{title}</h2>
      )}
      <div className="mt-8">{children}</div>
    </section>
  );
}
