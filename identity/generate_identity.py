#!/usr/bin/env python3
"""Generate the Discretized Flow identity assets.

The mark samples a logarithmic vortex spiral onto a dithered Cartesian grid.
No drawing is freehanded; every cell is selected from the analytic curve.
"""

from __future__ import annotations

import math
import os
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IDENTITY = ROOT / "identity"
PUBLIC = ROOT / "public"
BRAND = PUBLIC / "brand"

INK = "#0B0C10"
SURFACE = "#14161C"
TEXT = "#F2F1ED"
TEAL = "#21E6C1"
WARM = "#FF6B4A"


def spiral_points(turns: float = 3.35, samples: int = 960) -> list[tuple[float, float, float]]:
    points: list[tuple[float, float, float]] = []
    theta0 = -0.35
    theta1 = turns * math.tau
    for i in range(samples):
        u = i / (samples - 1)
        theta = theta0 + theta1 * u
        radius = 0.055 * math.exp(0.135 * theta)
        x = 0.5 + radius * math.cos(theta)
        y = 0.5 + radius * math.sin(theta)
        points.append((x, y, u))
    return points


def vortex_cells(grid: int = 34, thickness: float = 0.043) -> set[tuple[int, int]]:
    pts = spiral_points()
    cells: set[tuple[int, int]] = set()
    for gy in range(grid):
        for gx in range(grid):
            x = (gx + 0.5) / grid
            y = (gy + 0.5) / grid
            best = min((x - px) ** 2 + (y - py) ** 2 for px, py, _ in pts)
            if best < thickness * thickness:
                cells.add((gx, gy))
    return cells


def path_for_cells(cells: set[tuple[int, int]], grid: int, size: int) -> str:
    step = size / grid
    inset = step * 0.14
    d = []
    for gx, gy in sorted(cells):
        x = gx * step + inset
        y = gy * step + inset
        s = step - inset * 2
        d.append(f"M{x:.2f},{y:.2f}h{s:.2f}v{s:.2f}h-{s:.2f}z")
    return "".join(d)


def mark_svg(
    path: Path,
    *,
    grid: int,
    size: int = 512,
    color: str = TEAL,
    background: str | None = None,
    title: str = "Discretized Flow mark",
) -> None:
    cells = vortex_cells(grid=grid, thickness=1.52 / grid)
    bg = f'<rect width="{size}" height="{size}" fill="{background}"/>' if background else ""
    d = path_for_cells(cells, grid, size)
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" role="img" aria-label="{title}">
  <title>{title}</title>
  {bg}
  <path fill="{color}" d="{d}"/>
</svg>
'''
    path.write_text(svg, encoding="utf-8")


def lockup_svg(path: Path, *, stacked: bool = False) -> None:
    mark_size = 140 if not stacked else 190
    width = 720 if not stacked else 420
    height = 190 if not stacked else 420
    mark_x = 32 if not stacked else (width - mark_size) / 2
    mark_y = 25 if not stacked else 34
    text_x = 210 if not stacked else width / 2
    text_y = 91 if not stacked else 292
    anchor = "start" if not stacked else "middle"
    cells = vortex_cells(grid=30, thickness=1.52 / 30)
    d = path_for_cells(cells, 30, mark_size)
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-label="Hoda Hashemi wordmark">
  <rect width="{width}" height="{height}" fill="{INK}"/>
  <g transform="translate({mark_x:.1f} {mark_y:.1f})">
    <path fill="{TEAL}" d="{d}"/>
  </g>
  <text x="{text_x}" y="{text_y}" fill="{TEXT}" font-family="Space Grotesk, Arial, sans-serif" font-size="46" font-weight="600" text-anchor="{anchor}">Hoda Hashemi</text>
  <text x="{text_x}" y="{text_y + 38}" fill="{TEAL}" font-family="Space Grotesk, Arial, sans-serif" font-size="16" letter-spacing="3" text-anchor="{anchor}">DISCRETIZED FLOW</text>
</svg>
'''
    path.write_text(svg, encoding="utf-8")


def png_bytes(width: int, height: int, pixels: list[tuple[int, int, int, int]]) -> bytes:
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        row = pixels[y * width : (y + 1) * width]
        for r, g, b, a in row:
            raw.extend([r, g, b, a])

    def chunk(kind: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)

    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")


def hex_rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16), alpha


def raster_mark(path: Path, size: int, *, grid: int, bg: str = INK, fg: str = TEAL) -> None:
    pixels = [hex_rgba(bg) for _ in range(size * size)]
    cells = vortex_cells(grid=grid, thickness=1.55 / grid)
    cell = size / grid
    inset = max(1, int(cell * 0.13))
    fg_rgba = hex_rgba(fg)
    for gx, gy in cells:
        x0 = int(gx * cell) + inset
        y0 = int(gy * cell) + inset
        x1 = int((gx + 1) * cell) - inset
        y1 = int((gy + 1) * cell) - inset
        for y in range(max(0, y0), min(size, y1)):
            for x in range(max(0, x0), min(size, x1)):
                pixels[y * size + x] = fg_rgba
    path.write_bytes(png_bytes(size, size, pixels))


def raster_og(path: Path) -> None:
    w, h = 1200, 630
    pixels = [hex_rgba(INK) for _ in range(w * h)]
    grid = 52
    cells = vortex_cells(grid=grid, thickness=1.45 / grid)
    cell = 360 / grid
    fg = hex_rgba(TEAL)
    warm = hex_rgba(WARM)
    ox, oy = 92, 130
    for gx, gy in cells:
        x0 = int(ox + gx * cell)
        y0 = int(oy + gy * cell)
        x1 = int(ox + (gx + 0.72) * cell)
        y1 = int(oy + (gy + 0.72) * cell)
        color = warm if (gx + gy) % 19 == 0 else fg
        for y in range(max(0, y0), min(h, y1)):
            for x in range(max(0, x0), min(w, x1)):
                pixels[y * w + x] = color

    font = {
        "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
        "C": ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
        "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
        "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
        "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
        "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
        "I": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
        "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
        "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
        "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
        "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
        "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
        "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
        "W": ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
        "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
        "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
        " ": ["000", "000", "000", "000", "000", "000", "000"],
    }

    def draw_text(text: str, x: int, y: int, scale: int, color: tuple[int, int, int, int], gap: int = 2) -> None:
        cursor = x
        for ch in text.upper():
          glyph = font.get(ch, font[" "])
          glyph_w = len(glyph[0])
          for row, bits in enumerate(glyph):
              for col, bit in enumerate(bits):
                  if bit != "1":
                      continue
                  for yy in range(y + row * scale, y + (row + 1) * scale):
                      for xx in range(cursor + col * scale, cursor + (col + 1) * scale):
                          if 0 <= xx < w and 0 <= yy < h:
                              pixels[yy * w + xx] = color
          cursor += (glyph_w + gap) * scale

    draw_text("HODA HASHEMI", 500, 208, 8, hex_rgba(TEXT), gap=2)
    draw_text("DISCRETIZED FLOW", 500, 292, 4, fg, gap=2)
    path.write_bytes(png_bytes(w, h, pixels))


def ico(path: Path, png_paths: list[Path]) -> None:
    images = [p.read_bytes() for p in png_paths]
    header = struct.pack("<HHH", 0, 1, len(images))
    entries = []
    offset = 6 + 16 * len(images)
    for p, data in zip(png_paths, images):
        size = int(p.stem.split("-")[-1])
        entries.append(struct.pack("<BBBBHHII", size if size < 256 else 0, size if size < 256 else 0, 0, 0, 1, 32, len(data), offset))
        offset += len(data)
    path.write_bytes(header + b"".join(entries) + b"".join(images))


def main() -> None:
    IDENTITY.mkdir(exist_ok=True)
    BRAND.mkdir(parents=True, exist_ok=True)
    (PUBLIC / "assets").mkdir(exist_ok=True)

    mark_svg(IDENTITY / "mark-dark.svg", grid=34, color=INK, background=None, title="Discretized Flow mark dark")
    mark_svg(IDENTITY / "mark-light.svg", grid=34, color=TEXT, background=None, title="Discretized Flow mark light")
    mark_svg(BRAND / "mark-teal.svg", grid=34, color=TEAL, background=None)
    mark_svg(PUBLIC / "favicon.svg", grid=13, color=TEAL, background=INK, title="Hoda Hashemi favicon")
    lockup_svg(IDENTITY / "wordmark-horizontal.svg", stacked=False)
    lockup_svg(IDENTITY / "wordmark-stacked.svg", stacked=True)
    lockup_svg(BRAND / "wordmark-horizontal.svg", stacked=False)

    for size, grid in [(16, 8), (32, 10), (48, 12), (180, 18), (192, 22), (512, 38)]:
        target = BRAND / f"icon-{size}.png"
        raster_mark(target, size, grid=grid)
        if size == 180:
            raster_mark(PUBLIC / "apple-touch-icon.png", size, grid=grid)
        if size == 192:
            raster_mark(PUBLIC / "pwa-192.png", size, grid=grid)
        if size == 512:
            raster_mark(PUBLIC / "pwa-512.png", size, grid=grid)

    ico(PUBLIC / "favicon.ico", [BRAND / "icon-16.png", BRAND / "icon-32.png", BRAND / "icon-48.png"])
    raster_og(PUBLIC / "og-image.png")

    (PUBLIC / "site.webmanifest").write_text(
        """{
  "name": "Hoda Hashemi",
  "short_name": "Hoda Hashemi",
  "icons": [
    { "src": "/pwa-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/pwa-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#0B0C10",
  "background_color": "#0B0C10",
  "display": "standalone"
}
""",
        encoding="utf-8",
    )

    cname = ROOT / "CNAME"
    if cname.exists():
        (PUBLIC / "CNAME").write_text(cname.read_text(encoding="utf-8").strip() + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
