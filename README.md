# Hoda Hashemi Website

Astro + Three.js personal portfolio for Hoda Hashemi, built as a high-end immersive computational-physics website. The homepage uses a live WebGL field, smooth-scroll choreography, premium typography, scientific readouts, and research panels around the "Discretized Flow" identity.

Live site: https://hodahashemi.com/

Identity system: [`identity/IDENTITY.md`](identity/IDENTITY.md)

## Local use

Install dependencies and run Astro:

```bash
npm install
npm run dev
```

## Content editing

- Main landing page: `src/pages/index.astro`
- Global styling and premium homepage system: `src/styles/global.css`
- Three.js vortex field, panel instruments, smooth scroll, and interactions: `src/scripts/flow-field.js`
- Print-friendly CV page: `src/pages/CV.astro`
- Placeholder research-note pages: `src/pages/notes/*.astro`
- Generated identity assets: `identity/` and `public/brand/`

The note bodies are structural placeholders. Replace them with Hoda's real derivations, setup notes, and project documentation.

## Deployment

GitHub Pages is configured through `.github/workflows/deploy.yml`. Every push to `main` runs `npm ci`, `npm run build`, and deploys Astro's `dist/` output.
