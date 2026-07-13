# Discretized Flow Identity

The identity mark represents continuous fluid motion made visible through numerical discretization. A logarithmic vortex spiral is sampled onto a coarse Cartesian grid, so the icon reads as a vortex at a glance and as a computed field up close. The mark is two-tone: teal spiral arms with a **warm counter-vortex core**, following fluid-dynamics visualization convention where opposing colors distinguish vorticity sign, temperature anomaly, or energy transfer.

Nothing in the mark is freehand — every cell is selected by the analytic spiral in `generate_identity.py`.

## Palette

| Role | Hex |
|---|---|
| Base ink (near-black abyss) | `#050609` |
| Raised surface | `#0E1116` |
| Text | `#F4F2EC` |
| Vortex accent (primary) | `#49F4D1` |
| Counter-vorticity accent | `#FF5A3D` |
| Instrument gold (metrics, labels) | `#C8AA6E` |
| Secondary cool | `#37C6E8` |

Teal anchors the identity in ocean physics; the warm accent is used sparingly as a dissipation or counter-vorticity signal. The same palette drives the website's live Navier–Stokes hero field, lattice overlay, and section accents.

## Assets

- `mark-dark.svg`: dark mark for light or print contexts.
- `mark-light.svg`: light mark for dark contexts.
- `wordmark-horizontal.svg` / `wordmark-stacked.svg`: lockups.
- `../public/brand/mark-teal.svg`: two-tone primary mark (teal + warm core).
- `../public/favicon.svg`, `../public/favicon.ico`, `../public/apple-touch-icon.png`, `../public/pwa-192.png`, `../public/pwa-512.png`: browser and app icons.
- `../public/og-image.png`: 1200×630 social preview card.

## Regeneration

```bash
python3 identity/generate_identity.py
```

Change `grid` arguments in `generate_identity.py` to render different discretization densities. Small icons intentionally use lower grid resolution so the mark remains legible at favicon scale; the warm core is only applied at 180px and above (at 16–48px it would read as noise).
