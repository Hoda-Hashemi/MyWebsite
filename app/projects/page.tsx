import type { Metadata } from "next";
import { ArrowUpRight, CircleDashed, FlaskConical, Rocket } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { products } from "@/lib/data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Projects and products by Hoda Hashemi — LLM APA (in process), agentic MITgcm tooling, QGSW solvers, and CUDA implementations.",
};

const statusMeta = {
  "in-development": { label: "In process", Icon: CircleDashed },
  research: { label: "Research", Icon: FlaskConical },
  shipped: { label: "Shipped", Icon: Rocket },
} as const;

export default function ProjectsPage() {
  const featured = products.find((p) => p.featured);
  const rest = products.filter((p) => !p.featured);

  return (
    <div className="container-page py-20 md:py-28">
      <SectionHeading
        tag="Projects"
        title="Built to close the gap between the math and the machine."
        sub="Research projects below; products currently in process at the top — watch this space."
      />

      {/* ---- PRODUCTS: tools in process ---- */}
      <Reveal delay={0.08}>
        <h2 className="tag mt-16">// Products — in process</h2>
      </Reveal>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {featured && (
          <Reveal delay={0.1}>
            <article className="corners card relative h-full overflow-hidden p-8 md:p-12">
              <span className="corner-b" aria-hidden="true" />
              <div aria-hidden="true" className="hero-glow absolute inset-0 opacity-60" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-[0.72rem] tracking-[0.16em] text-muted">
                    {featured.index}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-accent-soft px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-accent">
                    <CircleDashed
                      className="h-3 w-3 animate-spin [animation-duration:3s]"
                      aria-hidden="true"
                    />
                    In process
                  </span>
                </div>
                <h3 className="mt-5 text-4xl font-semibold md:text-5xl">{featured.name}</h3>
                <p className="mt-3 text-lg text-accent">{featured.tagline}</p>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
                  {featured.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {featured.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-line px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <a
                  href={`mailto:${site.email}?subject=LLM%20APA%20updates`}
                  className="btn btn-primary mt-8"
                >
                  Get notified at launch
                </a>
              </div>
            </article>
          </Reveal>
        )}

        {/* the loading product — deliberately unresolved */}
        <Reveal delay={0.16}>
          <article
            className="card relative flex h-full flex-col overflow-hidden p-8"
            aria-label="Unannounced product, loading"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.72rem] tracking-[0.16em] text-muted">
                P-02
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-accent">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                Loading
              </span>
            </div>

            <h3
              className="mt-6 font-mono text-2xl tracking-tight text-fg/80"
              aria-hidden="true"
            >
              ▓▓▓▓▓▓░░
            </h3>
            <p className="mt-3 font-mono text-[0.78rem] leading-relaxed text-muted">
              &gt; allocating name…
              <br />
              &gt; compiling scope…
              <br />
              &gt; ETA: soon<span className="caret" aria-hidden="true" />
            </p>

            <div className="mt-auto pt-8">
              <div
                className="h-1 w-full overflow-hidden rounded-full bg-accent-soft"
                role="progressbar"
                aria-label="Product in process"
                aria-valuenow={38}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full w-[38%] rounded-full bg-accent" />
              </div>
              <p className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted">
                38% — details to be announced
              </p>
            </div>
          </article>
        </Reveal>
      </div>

      {/* ---- PROJECTS ---- */}
      <Reveal>
        <h2 className="tag mt-20">// Projects — research systems</h2>
      </Reveal>
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {rest.map((p, i) => {
          const { label, Icon } = statusMeta[p.status];
          const Wrapper = p.href ? "a" : "div";
          return (
            <Reveal as="li" key={p.index} delay={0.05 + i * 0.07}>
              <Wrapper
                {...(p.href
                  ? { href: p.href, target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="card card-hover group flex h-full flex-col p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.7rem] tracking-[0.16em] text-muted">
                    {p.index}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
                    <Icon className="h-3 w-3 text-accent" aria-hidden="true" />
                    {label}
                  </span>
                </div>
                <h3 className="mt-5 flex items-center gap-2 text-xl font-semibold transition-colors group-hover:text-accent">
                  {p.name}
                  {p.href && (
                    <ArrowUpRight
                      className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  )}
                </h3>
                <p className="mt-2 text-sm font-medium text-accent">{p.tagline}</p>
                <p className="mt-3 flex-1 text-[0.92rem] leading-relaxed text-muted">
                  {p.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Wrapper>
            </Reveal>
          );
        })}
      </ul>
    </div>
  );
}
