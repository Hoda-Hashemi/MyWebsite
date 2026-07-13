import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Cpu,
  Globe2,
  Waves,
} from "lucide-react";
import { Reveal, StaggerText } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Ticker } from "@/components/Ticker";
import { focusAreas, articles, type Focus } from "@/lib/data";
import { site } from "@/lib/site";

const icons: Record<Focus["icon"], React.ComponentType<{ className?: string }>> = {
  waves: Waves,
  globe: Globe2,
  cpu: Cpu,
  bot: Bot,
};

export default function HomePage() {
  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="hero-glow absolute inset-0" />
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="container-page relative flex min-h-[calc(100svh-4rem)] flex-col justify-center py-24">
          {/* terminal meta row */}
          <Reveal delay={0.05}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-accent"
                />
                Open to research collaboration
              </span>
              <span className="hidden sm:inline">33.90°N — 35.48°E // BEIRUT</span>
              <span className="hidden md:inline">SYS: OCEAN / GPU / LLM</span>
            </div>
          </Reveal>

          <h1 className="mt-10 max-w-4xl text-[2.6rem] font-semibold leading-[1.02] sm:text-6xl md:text-7xl">
            <StaggerText text="Continuous physics," delay={0.15} />
            <br />
            <StaggerText
              text="discrete computation."
              delay={0.5}
              className="text-accent"
            />
            <span aria-hidden="true" className="caret" />
          </h1>

          <Reveal delay={0.85}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
              I&apos;m {site.name} — a computational physicist modeling ocean
              dynamics with numerical methods, from quasi-geostrophic theory
              (the mathematics of large-scale ocean flow) to CUDA kernels and
              LLM agents that operate simulation code.
            </p>
          </Reveal>

          <Reveal delay={1}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/about/" className="btn btn-primary">
                View portfolio <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/projects/" className="btn btn-ghost">
                Projects
              </Link>
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                GitHub <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={1.15} className="mt-auto pt-16">
            <p
              aria-hidden="true"
              className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted"
            >
              scroll ↓ // sections loaded: 04
            </p>
          </Reveal>
        </div>
      </section>

      <Ticker />

      {/* ================= FOCUS ================= */}
      <section className="container-page py-24 md:py-32">
        <SectionHeading
          tag="Fields 01–04"
          title="Four instruments, one lab."
          sub="Each research thread feeds the others: theory sets the equations, systems make them run, GPUs make them fast, and language models make them usable."
        />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2">
          {focusAreas.map((f, i) => {
            const Icon = icons[f.icon];
            return (
              <Reveal as="li" key={f.index} delay={i * 0.08}>
                <div className="card card-hover group h-full p-7">
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-line bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-accent-contrast">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[0.7rem] tracking-[0.16em] text-muted">
                      {f.index}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{f.title}</h3>
                  <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-accent">
                    {f.gloss}
                  </p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
                    {f.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* ================= FEATURED PRODUCT ================= */}
      <section className="border-y border-line bg-bg-subtle">
        <div className="container-page py-24 md:py-32">
          <Reveal>
            <div className="corners card relative overflow-hidden p-8 md:p-14">
              <span className="corner-b" aria-hidden="true" />
              <div
                aria-hidden="true"
                className="hero-glow absolute inset-0 opacity-60"
              />
              <div className="relative grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="tag">// Incoming — P-01</p>
                  <h2 className="mt-4 text-4xl font-semibold md:text-5xl">
                    LLM <span className="text-accent">APA</span>
                  </h2>
                  <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
                    A new LLM-powered product, currently in development.
                    Specifics are under wraps — architecture notes and a launch
                    breakdown will be published here first.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/projects/" className="btn btn-primary">
                      Projects index <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <a href={`mailto:${site.email}?subject=LLM%20APA`} className="btn btn-ghost">
                      Get notified
                    </a>
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  className="hidden select-none items-center justify-center md:flex"
                >
                  <div className="monogram text-[9rem] leading-none text-accent opacity-90">
                    هـ
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= WRITING ================= */}
      <section className="container-page py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            tag="Notebook"
            title="Derivations, written down."
            sub="Lecture notes and guides from the research notebook — every equation earned, not assumed."
          />
          <Reveal delay={0.1}>
            <Link
              href="/articles/"
              className="group inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-accent"
            >
              All articles
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </Reveal>
        </div>

        <ul className="mt-12 divide-y divide-line border-y border-line">
          {articles.slice(0, 3).map((a, i) => (
            <Reveal as="li" key={a.index} delay={i * 0.07}>
              <a
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-2 py-6 transition-colors sm:grid-cols-[5rem_1fr_auto] sm:items-baseline sm:gap-6"
              >
                <span className="font-mono text-[0.72rem] tracking-[0.16em] text-muted">
                  {a.index}
                </span>
                <span>
                  <span className="text-lg font-medium transition-colors group-hover:text-accent">
                    {a.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {a.description}
                  </span>
                </span>
                <ArrowUpRight
                  className="hidden h-4 w-4 text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent sm:block"
                  aria-hidden="true"
                />
              </a>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ================= CTA ================= */}
      <section className="border-t border-line">
        <div className="container-page relative overflow-hidden py-24 text-center md:py-36">
          <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-70" />
          <Reveal className="relative">
            <p className="tag">// Contact</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold md:text-6xl">
              Let&apos;s build something{" "}
              <span className="text-accent">rigorous</span>.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base text-muted">
              Research collaboration, scientific software, or GPU problems that
              refuse to go fast — my inbox is open.
            </p>
            <div className="mt-9 flex justify-center gap-3">
              <a href={`mailto:${site.email}`} className="btn btn-primary">
                {site.email}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
