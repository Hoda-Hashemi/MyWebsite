# hodahashemi.com — Design System v3 "هـ / Electric Monotone"

## 1. UX strategy

**Audience, in priority order:**
1. Recruiters & academic committees — need the CV fast, legible, downloadable.
2. Research collaborators — need credibility signals: derivations, code, systems.
3. Future product users — need to see LLM APA and the tooling work.

**Strategy:** a four-surface site where every path is ≤ 2 clicks from what each
audience needs. The homepage is the brand statement; About/CV is the
conversion page (Download CV is persistent in the header on every page);
Products stakes the ground for LLM APA before launch; Articles proves depth
with real derivations rather than blog filler.

**Identity thesis:** *monotone electric*. One hue — electric cobalt `#0038FF` —
against paper white and abyssal blue-black. Inspired by early-web/cybercafé
high-contrast aesthetics (single accent, terminal typography, registration
marks) executed with modern restraint: large whitespace, an 8px rhythm,
soft shadows, and one flourish per screen. The هـ monogram (the Arabic
initial of *Hoda*) is the mark: personal, ownable, and set in the identity blue.

## 2. Wireframe

```
┌────────────────────────────────────────────────┐
│ HEADER  هـ Hoda Hashemi   NAV(mono)  ☾  [CV]  │  fixed, glass
├────────────────────────────────────────────────┤
│ HOME                                           │
│  ┌ status pill · coords · sys tags (mono)      │  hero, 100svh
│  ├ H1: staggered words + blinking caret        │  dot-grid + single-hue glow
│  ├ intro paragraph (measure ~60ch)             │
│  └ [View portfolio] [Products] [GitHub]        │
│  ── keyword ticker (marquee, decorative) ──    │
│  FOCUS: 2×2 cards (icon tile, index, gloss)    │
│  FEATURED: LLM APA panel (+corner marks, هـ)   │  full-bleed subtle band
│  WRITING: 3 index rows → /articles             │
│  CTA: big type + email button                  │
├────────────────────────────────────────────────┤
│ PRODUCTS  heading → featured LLM APA (status   │
│  spinner badge) → 3-col grid of systems        │
│ ABOUT     name block + facts card (corners) →  │
│  education/research timelines (rail + dots) →  │
│  projects 2×2 → skills chips 4-col             │
│ ARTICLES  index rows: № / title / kind badge / │
│  tags / ↗ (opens archive lecture pages)        │
├────────────────────────────────────────────────┤
│ FOOTER  هـ + blurb / index / contact / motto   │
└────────────────────────────────────────────────┘
```

Mobile: single column; nav collapses to an animated sheet (solid background);
facts card stacks above timelines; grids collapse 4→2→1.

## 3. Design rationale

- **One hue only.** Everything chromatic is `--accent`. This makes the blue
  *mean something* (interactive, identity, emphasis) and gives the site a
  recognizable monotone signature in both themes. Dark mode shifts the same
  hue lighter (`#5C7CFF`) to keep WCAG AA contrast rather than dimming it.
- **Terminal grammar, premium execution.** Mono uppercase micro-labels
  (`// SECTION`), index numbers (`P-01`, `A-03`), coordinates, a keyword
  ticker, `+` registration marks, and a blinking caret supply the "cyber"
  texture — while type scale, spacing, and soft shadows stay Linear/Stripe
  clean. The kitsch stays out (no scanlines, no glitch, no neon spam).
- **The dot grid is the only metaphor.** A faint lattice nods to numerical
  discretization (her actual research) without decorating over content.
- **Typography.** Geist for UI (tight tracking on display sizes), Geist Mono
  for the terminal layer, IBM Plex Sans Arabic for the هـ monogram — a
  geometric Arabic sans that matches Geist's modernism.
- **Motion policy.** Framer Motion; two verbs only: *resolve* (fade-up /
  word-stagger on entry) and *respond* (hover lift, arrow nudges, icon tile
  inversion). Every animation is once-per-view, ≤ 0.7s, and disabled cleanly
  under `prefers-reduced-motion` (`useReducedMotion` + CSS kill-switch).
- **8px system.** All spacing steps are multiples of 4/8; section padding is
  96–128px desktop, 80px mobile; cards use 24–28px interior padding.

## 4. Component architecture

```
app/
  layout.tsx        fonts (next/font), metadata, theme no-flash script,
                    JSON-LD Person, skip link, Header/Footer shell
  page.tsx          Home (server) — composes client motion components
  products/page.tsx Products (featured + grid)
  about/page.tsx    About/CV (timelines, projects, skills)
  articles/page.tsx Articles index → /notes/*.html archive
  not-found.tsx     404 with هـ
  sitemap.ts / robots.ts / manifest.ts (static metadata routes)
components/
  Header.tsx        client: nav state, active route, mobile sheet
  Footer.tsx        server
  Logo.tsx          server: هـ tile + wordmark
  ThemeToggle.tsx   client: .dark class + localStorage
  Reveal.tsx        client: Reveal (fade-up), StaggerText (word cascade)
  SectionHeading.tsx, Ticker.tsx
lib/
  site.ts           identity, URLs, nav
  data.ts           typed content: focus areas, products, articles, CV
```

Server components by default; client islands only where motion or state
lives. Content is data-driven — adding a product or article is a one-object
edit in `lib/data.ts`.

## 5. Accessibility & performance

- WCAG AA: accent-on-white 6.9:1, white-on-accent 6.9:1 (buttons), dark-mode
  accent 5.2:1, muted text ≥ 4.5:1 in both themes. Verified at build time.
- Skip link, semantic landmarks, `aria-current` nav, `aria-expanded` on the
  menu, decorative elements `aria-hidden`, focus-visible rings everywhere.
- Static export; First Load JS ≈ 103–146 kB; fonts self-hosted via
  `next/font`; icons are hand-packed PNGs/ICO; zero third-party requests.

## 6. Identity assets

`public/icon-512.png`, `icon-192.png`, `apple-touch-icon.png`, `favicon.ico`
(16/32/48 packed), `og-image.png` (1200×630) — all rendered from the هـ
glyph in IBM Plex Sans Arabic on the identity blue. Regenerate by re-running
the icon render script against `scratchpad/icons.html` (headless Chrome).
