import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Identity Guidelines",
  description:
    "The visual identity of Hoda Hashemi — the mark, electric cobalt, gradients, typography, and motion rules.",
};

const colors = [
  { name: "Electric Cobalt", hex: "#0038FF", note: "the identity. links, marks, emphasis", cls: "bg-[#0038ff] text-white" },
  { name: "Ink", hex: "#0A0C1C", note: "text on paper", cls: "bg-[#0a0c1c] text-white" },
  { name: "Paper", hex: "#FFFFFF", note: "light ground", cls: "bg-white text-[#0a0c1c] border border-line" },
  { name: "Abyss", hex: "#05060E", note: "dark ground", cls: "bg-[#05060e] text-[#eef0ff]" },
  { name: "Periwinkle", hex: "#5C7CFF", note: "accent on dark", cls: "bg-[#5c7cff] text-[#05060e]" },
  { name: "Depth", hex: "#0026B3", note: "extrusion walls, shadows of the mark", cls: "bg-[#0026b3] text-white" },
];

const gradients = [
  { name: "Cobalt Flow", css: "linear-gradient(120deg,#0038ff 10%,#2e5cff 55%,#4d7cff 100%)", use: "primary buttons, emphasis surfaces" },
  { name: "Signal", css: "linear-gradient(100deg,#0038ff,#0ea5e9 55%,#22d3ee)", use: "gradient text — one phrase per screen, never body copy" },
  { name: "Aurora", css: "radial-gradient(60% 80% at 75% 15%,rgba(0,56,255,.35),transparent 65%),radial-gradient(50% 70% at 15% 90%,rgba(0,166,255,.25),transparent 70%),#ffffff", use: "hero atmospheres, blurred ≥60px, always behind content" },
  { name: "Abyss Aurora", css: "radial-gradient(60% 80% at 75% 15%,rgba(92,124,255,.4),transparent 65%),radial-gradient(50% 70% at 15% 90%,rgba(0,166,255,.22),transparent 70%),#05060e", use: "dark-mode counterpart" },
];

const donts = [
  ["No recoloring", "the mark is cobalt, ink, or white — nothing else"],
  ["No stretching", "scale proportionally, always"],
  ["No outlines or shadows", "the mark is a solid calligraphic object"],
  ["No static tilts", "if it rotates, it rotates under real physics"],
  ["No busy backgrounds", "one aurora, or flat ground — never both at full strength"],
  ["No rainbow gradients", "every gradient lives inside the blue family"],
];

export default function BrandPage() {
  return (
    <div className="pb-24">
      {/* ---- hero: the mark ---- */}
      <section className="aurora relative border-b border-line">
        <div className="container-page relative py-24 md:py-32">
          <Reveal>
            <p className="tag">Identity guidelines — v1</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold md:text-6xl">
              One mark. One hue. <span className="text-gradient">Real physics.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              <div className="flex aspect-[4/3] items-center justify-center rounded-[14px] border border-line bg-white p-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand-mark.png" alt="The mark on paper" className="w-3/4" />
              </div>
              <div className="flex aspect-[4/3] items-center justify-center rounded-[14px] bg-[#0038ff] p-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand-mark.png" alt="The mark on cobalt" className="w-3/4 brightness-0 invert" />
              </div>
              <div className="flex aspect-[4/3] items-center justify-center rounded-[14px] bg-[#05060e] p-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand-mark.png" alt="The mark on abyss" className="w-3/4 brightness-0 invert" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-8 max-w-2xl leading-relaxed text-muted">
              The mark is a calligraphic <span aria-label="heh" className="mark-inline" /> in
              orbit: the kashida becomes a trajectory, the loop an orbital ring, the crescent
              a swing-by. It is drawn once, by hand — never redrawn, retraced, or approximated.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- clearspace & scale ---- */}
      <section className="container-page py-20 md:py-28">
        <SectionHeading
          tag="Construction"
          title="Clearspace and minimum size."
          sub="Give the mark room equal to the height of its ring on every side. Below 20px of height, use the favicon tile instead."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <Reveal>
            <div className="card relative flex aspect-[16/9] items-center justify-center overflow-hidden">
              <div className="relative border border-dashed border-accent/40 p-12">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface px-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-accent">1× ring</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand-mark.png" alt="Clearspace construction" className="w-44" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card flex aspect-[16/9] items-end justify-center gap-10 p-10">
              {[112, 64, 36, 20].map((h) => (
                <div key={h} className="flex flex-col items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand-mark.png" alt="" style={{ height: h * 0.7 }} className="w-auto" />
                  <span className="font-mono text-[0.62rem] text-muted">{h}px</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- color ---- */}
      <section className="border-t border-line bg-bg-subtle">
        <div className="container-page py-20 md:py-28">
          <SectionHeading
            tag="Color"
            title="Monotone electric."
            sub="One chromatic voice — electric cobalt — against ink and paper. Ratios: ~90% ground, ~9% ink, ~1% cobalt. When everything shouts blue, nothing does."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colors.map((c, i) => (
              <Reveal key={c.hex} delay={i * 0.05}>
                <div className={`flex aspect-[7/4] flex-col justify-between rounded-[14px] p-6 ${c.cls}`}>
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] opacity-80">{c.hex}</span>
                  <div>
                    <p className="text-lg font-semibold">{c.name}</p>
                    <p className="text-sm opacity-70">{c.note}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- gradients ---- */}
      <section className="container-page py-20 md:py-28">
        <SectionHeading
          tag="Gradients"
          title="Light moving through water."
          sub="Gradients are atmospheres, not decorations: soft, heavily blurred, and strictly inside the blue family."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {gradients.map((g, i) => (
            <Reveal key={g.name} delay={i * 0.06}>
              <div className="card overflow-hidden">
                <div className="h-44" style={{ background: g.css }} />
                <div className="flex items-baseline justify-between gap-4 p-5">
                  <p className="font-semibold">{g.name}</p>
                  <p className="text-right text-sm text-muted">{g.use}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- typography ---- */}
      <section className="border-t border-line bg-bg-subtle">
        <div className="container-page py-20 md:py-28">
          <SectionHeading
            tag="Typography"
            title="A precise voice, a terminal accent."
            sub="Geist carries the message. Geist Mono carries the instrumentation. IBM Plex Sans Arabic carries the letterform behind the mark."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            <Reveal>
              <div className="card h-full p-8">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">Geist — display & body</p>
                <p className="mt-4 text-6xl font-semibold">Aa</p>
                <p className="mt-4 text-lg font-semibold">Continuous physics,<br />discrete computation.</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">Headlines -0.02em tracking, weights 500–700. Body 400–500, 1.6–1.75 line height, ≤65ch.</p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="card h-full p-8">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">Geist Mono — instrumentation</p>
                <p className="mt-4 font-mono text-6xl font-medium">01</p>
                <p className="mt-4 font-mono text-[0.78rem] uppercase tracking-[0.14em] text-accent">ω = (2.1, 5.4, 1.6) rad/s</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">Labels, indices, coordinates, readouts. Uppercase, 0.12–0.18em tracking, always small.</p>
              </div>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="card h-full p-8">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">IBM Plex Sans Arabic — the letterform</p>
                <span className="mark-glyph mt-6 block h-16 w-28" />
                <p className="mt-4 text-lg font-semibold">The initial of Hoda.</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">Reserved for the letterform itself — never for running Arabic text set small.</p>
              </div>
            </Reveal>
          </div>

          {/* the label motif */}
          <Reveal delay={0.2}>
            <div className="card mt-4 flex flex-wrap items-center justify-between gap-6 p-8">
              <div>
                <p className="tag">Section label</p>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                  Every section label begins with the mark in miniature — the identity
                  signing each heading. It replaced the old <span className="font-mono">//</span> prefix.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <span className="tag">Projects — research systems</span>
                <span className="tag">Education</span>
                <span className="tag">Contact</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- motion ---- */}
      <section className="container-page py-20 md:py-28">
        <SectionHeading
          tag="Motion"
          title="If it moves, it obeys mechanics."
          sub="The mark never spins on a keyframe. It tumbles torque-free — Euler's equations, RK4-integrated, angular momentum conserved — the tennis-racket theorem as a brand asset."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ["Entrances", "fade-up 24px, 0.7s, cubic-bezier(.21,.47,.32,.98), once per element"],
            ["The tumble", "ω₀ = (2.1, 5.4, 1.6) rad/s · I = (1, 2.2, 3.2) · preloader only, ≤2.8s, once per session"],
            ["Respect", "prefers-reduced-motion collapses everything to a still frame — no exceptions"],
          ].map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.07}>
              <div className="card h-full p-7">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent">{t}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- don'ts ---- */}
      <section className="border-t border-line bg-bg-subtle">
        <div className="container-page py-20 md:py-28">
          <SectionHeading tag="Boundaries" title="Six ways to break it." sub="Don't." />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {donts.map(([t, d], i) => (
              <Reveal as="li" key={t} delay={i * 0.05}>
                <div className="card h-full p-6">
                  <p className="font-semibold">
                    <span aria-hidden="true" className="mr-2 text-accent">×</span>
                    {t}
                  </p>
                  <p className="mt-2 text-sm text-muted">{d}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- applications ---- */}
      <section className="container-page pt-20 md:pt-28">
        <SectionHeading
          tag="In the wild"
          title="Applications."
          sub="The same object everywhere: browser tab, social card, header, preloader."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["/icon-512.png", "App icon & favicon"],
            ["/og-image.png", "Social card"],
            ["/brand-mark.png", "Header & inline mark"],
            ["/preloader-side.png", "Preloader depth pass"],
          ].map(([src, label], i) => (
            <Reveal key={src} delay={i * 0.06}>
              <figure className="card overflow-hidden">
                <div className="flex aspect-square items-center justify-center bg-bg-subtle p-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={label} className="max-h-full w-auto max-w-full rounded-[8px]" />
                </div>
                <figcaption className="p-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted">
                  {label}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
