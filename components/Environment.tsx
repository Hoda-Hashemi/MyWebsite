"use client";

import { useEffect, useRef } from "react";

/* The OS layer: a quiet computational lattice behind every page.
   Nodes drift, links breathe, signal pulses travel — calm, cobalt-only,
   parallaxed against scroll. Static under prefers-reduced-motion. */
export function Environment() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const DPR = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    const resize = () => {
      W = innerWidth;
      H = innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    addEventListener("resize", resize);

    // seeded lattice — stable between reloads
    const N = 26;
    let s = 1372;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const nodes = Array.from({ length: N }, () => ({
      x: rnd(), y: rnd(), p: rnd() * Math.PI * 2, r: 1.4 + rnd() * 1.8,
    }));
    // connect each node to its 2 nearest neighbours
    const edges: [number, number][] = [];
    nodes.forEach((a, i) => {
      const near = nodes
        .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
        .filter((e) => e.j !== i)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2);
      near.forEach(({ j }) => {
        if (!edges.some(([u, v]) => (u === j && v === i) || (u === i && v === j)))
          edges.push([i, j]);
      });
    });
    // travelling pulses
    const pulses = [
      { e: 3, t: 0, sp: 0.14 },
      { e: 11, t: 0.5, sp: 0.1 },
      { e: 17, t: 0.2, sp: 0.12 },
    ];

    const pos = (n: (typeof nodes)[0], t: number) => ({
      x: (n.x + Math.sin(t * 0.05 + n.p) * 0.012) * W,
      y: (n.y + Math.cos(t * 0.04 + n.p * 1.7) * 0.012) * H,
    });

    let raf = 0;
    let running = true;
    document.addEventListener("visibilitychange", () => {
      running = document.visibilityState === "visible";
    });

    const draw = (now: number) => {
      if (!reduced) raf = requestAnimationFrame(draw);
      if (!running) return;
      const t = now * 0.001;
      const dark = document.documentElement.classList.contains("dark");
      const ink = dark ? "122,162,255" : "0,56,255";
      const base = dark ? 0.34 : 0.13;
      const scroll = scrollY * -0.06;

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(0, scroll % (H * 0.3));

      for (const [i, j] of edges) {
        const a = pos(nodes[i], t), b = pos(nodes[j], t);
        const breathe = 0.5 + 0.5 * Math.sin(t * 0.4 + i);
        ctx.strokeStyle = `rgba(${ink},${(0.05 + 0.05 * breathe) * base * 3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (const n of nodes) {
        const { x, y } = pos(n, t);
        const tw = 0.6 + 0.4 * Math.sin(t * 0.8 + n.p * 3);
        ctx.fillStyle = `rgba(${ink},${0.5 * base * tw})`;
        ctx.beginPath();
        ctx.arc(x, y, n.r, 0, 6.2832);
        ctx.fill();
      }
      for (const p of pulses) {
        p.t += p.sp * 0.016;
        if (p.t > 1) { p.t = 0; p.e = Math.floor(rnd() * edges.length); }
        const [i, j] = edges[p.e % edges.length];
        const a = pos(nodes[i], t), b = pos(nodes[j], t);
        const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
        ctx.fillStyle = `rgba(${ink},${0.85 * base * 2})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 6.2832);
        ctx.fill();
      }
      ctx.restore();
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
