# Discretized Flow Identity

The identity mark represents continuous fluid motion made visible through numerical discretization. A logarithmic vortex spiral is sampled onto a coarse Cartesian grid, so the icon reads as a vortex at a glance and as a computed field up close.

## Palette

- Base ink: `#0B0C10`
- Raised surface: `#14161C`
- Text: `#F2F1ED`
- Vortex accent: `#21E6C1`
- Secondary highlight: `#FF6B4A`

The cool/warm pairing follows fluid-dynamics visualization conventions, where opposing colors often distinguish vorticity sign, temperature anomaly, or energy transfer. Teal anchors the identity in ocean physics; the warm accent is used sparingly as a dissipation or counter-vorticity signal.

## Assets

- `mark-dark.svg`: dark mark for light or print contexts.
- `mark-light.svg`: light mark for dark contexts.
- `wordmark-horizontal.svg`: mark with wordmark.
- `wordmark-stacked.svg`: square-context lockup.
- `../public/favicon.svg`, `../public/favicon.ico`, `../public/apple-touch-icon.png`, `../public/pwa-192.png`, `../public/pwa-512.png`: browser and app icons.
- `../public/og-image.png`: social preview image.

## Regeneration

Run:

```bash
python3 identity/generate_identity.py
```

Change `grid` arguments in `generate_identity.py` to render different discretization densities. Small icons intentionally use lower grid resolution so the mark remains legible at favicon scale.
