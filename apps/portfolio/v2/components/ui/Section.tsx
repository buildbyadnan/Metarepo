import React from "react";

type SectionProps = {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function Section({ id, title, subtitle, children }: SectionProps) {
  return (
    <section id={id} className="relative py-16 md:py-24 border-t border-cyan-500/10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-bold brand-heading">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm md:text-base text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
