import type { Metadata } from "next";
import { ArrowUpRight, BookOpen, GraduationCap } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { articles } from "@/lib/data";

export const metadata: Metadata = {
  title: "Articles & Lectures",
  description:
    "Lecture notes and guides by Hoda Hashemi — Navier-Stokes, shallow-water equations, QGSW theory, and practical MITgcm walkthroughs.",
};

export default function ArticlesPage() {
  return (
    <div className="container-page py-20 md:py-28">
      <SectionHeading
        tag="Articles — Lectures"
        title="The notebook, published."
        sub="Full derivations and practical guides from my research notes. Each opens as a standalone lecture page with rendered mathematics."
      />

      <ul className="mt-14 divide-y divide-line border-y border-line">
        {articles.map((a, i) => (
          <Reveal as="li" key={a.index} delay={i * 0.05}>
            <a
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid gap-3 py-7 sm:grid-cols-[5rem_1fr_auto] sm:items-start sm:gap-6"
            >
              <span className="pt-1 font-mono text-[0.72rem] tracking-[0.16em] text-muted">
                {a.index}
              </span>
              <span>
                <span className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xl font-semibold transition-colors group-hover:text-accent">
                    {a.title}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">
                    {a.kind === "lecture" ? (
                      <GraduationCap className="h-3 w-3 text-accent" aria-hidden="true" />
                    ) : (
                      <BookOpen className="h-3 w-3 text-accent" aria-hidden="true" />
                    )}
                    {a.kind}
                  </span>
                </span>
                <span className="mt-2 block max-w-2xl text-[0.95rem] leading-relaxed text-muted">
                  {a.description}
                </span>
                <span className="mt-3 flex flex-wrap gap-2">
                  {a.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-accent"
                    >
                      {t}
                    </span>
                  ))}
                </span>
              </span>
              <ArrowUpRight
                className="hidden h-5 w-5 text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent sm:block"
                aria-hidden="true"
              />
            </a>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={0.2}>
        <p className="mt-8 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted">
          // Archive pages retain their original lecture styling.
        </p>
      </Reveal>
    </div>
  );
}
