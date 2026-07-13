# hodahashemi.com

Personal site of **Hoda Hashemi** — computational physicist (ocean dynamics,
numerical modeling, CUDA/HPC, LLM tooling).

Design system: **هـ / Electric Monotone** — one electric-cobalt hue against
white and blue-black, terminal-inspired details, premium minimalist execution.
Full rationale in [`DESIGN.md`](DESIGN.md).

Live: <https://hodahashemi.com>

## Stack

- **Next.js 15** (App Router, static export) + **React 19** + TypeScript
- **Tailwind CSS 4** (CSS-first tokens, class-based dark mode)
- **Framer Motion** (scroll reveals, staggered headlines, menu sheet)
- **Lucide** icons · **Geist / Geist Mono / IBM Plex Sans Arabic** via `next/font`

## Structure

| Path | Purpose |
|---|---|
| `app/` | Routes: home, `products/`, `about/` (CV), `articles/`, 404, sitemap/robots/manifest |
| `components/` | Header, Footer, Logo (هـ), ThemeToggle, Reveal/StaggerText, Ticker |
| `lib/data.ts` | All content (focus areas, products, articles, CV) — edit here |
| `lib/site.ts` | Identity, links, nav |
| `public/assets/` | CV PDF |
| `public/notes/` | Legacy lecture pages (Navier–Stokes, SW, QGSW, MITgcm) — self-contained archive |
| `public/` | Generated هـ icons, OG image, CNAME |

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export → out/
```

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and publishes `out/`
to GitHub Pages on every push to `main`. Custom domain via `public/CNAME`.

## Content updates

- **Add a product/article:** append an object in `lib/data.ts`.
- **LLM APA specifics:** replace the placeholder copy in `lib/data.ts`
  (`products[0]`) and the featured blurbs on `app/page.tsx` / `app/products/page.tsx`.
- **CV:** replace `public/assets/CV_HodaHashemi.pdf` and edit the
  education/experience arrays in `lib/data.ts`.
