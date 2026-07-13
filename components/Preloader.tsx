"use client";

import { useEffect, useRef, useState } from "react";

/* Entry preloader: her mark tumbling torque-free (RK4 Euler equations,
   tri-axial, tennis-racket flips) + ISS bob. Shows once per session. */
export function Preloader() {
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("preloaded")) { setGone(true); return; }
    } catch {}
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setGone(true); return; }

    const dismiss = () => {
      try {
        sessionStorage.setItem("preloaded", "1");
      } catch {}
      setFading(true);
      setTimeout(() => setGone(true), 450);
    };
    const t = setTimeout(dismiss, 2800);
    (window as unknown as { __skip?: () => void }).__skip = dismiss;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    const face = new Image();
    const side = new Image();
    face.src = "/brand-mark.png";
    side.src = "/preloader-side.png";

    const DPR = Math.min(devicePixelRatio || 1, 2);
    let W = innerWidth,
      H = innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;

    const I = [1, 2.2, 3.2];
    let w = [2.1, 5.4, 1.6];
    let q = [1, 0, 0, 0];
    const wdot = (v: number[]) => [
      ((I[1] - I[2]) / I[0]) * v[1] * v[2],
      ((I[2] - I[0]) / I[1]) * v[2] * v[0],
      ((I[0] - I[1]) / I[2]) * v[0] * v[1],
    ];
    let last = performance.now(),
      t0 = last,
      raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!face.complete || !side.complete) return;
      const dt = Math.min((now - last) / 1000, 0.03) || 0.016;
      last = now;
      const k1 = wdot(w),
        k2 = wdot(w.map((v, i) => v + 0.5 * dt * k1[i])),
        k3 = wdot(w.map((v, i) => v + 0.5 * dt * k2[i])),
        k4 = wdot(w.map((v, i) => v + dt * k3[i]));
      w = w.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
      const [qw, qx, qy, qz] = q;
      q = [
        qw + dt * 0.5 * (-qx * w[0] - qy * w[1] - qz * w[2]),
        qx + dt * 0.5 * (qw * w[0] + qy * w[2] - qz * w[1]),
        qy + dt * 0.5 * (qw * w[1] - qx * w[2] + qz * w[0]),
        qz + dt * 0.5 * (qw * w[2] + qx * w[1] - qy * w[0]),
      ];
      const n = Math.hypot(q[0], q[1], q[2], q[3]);
      q = q.map((v) => v / n);
      const [w0, x, y, z] = q;
      const R = [
        1 - 2 * (y * y + z * z), 2 * (x * y - z * w0), 2 * (x * z + y * w0),
        2 * (x * y + z * w0), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w0),
      ];
      const SW = 1007,
        SH = 705,
        L = 30;
      const base = (Math.min(W, H) * 0.00068) as number;
      const gw = SW * base,
        gh = SH * base;
      const stepPx = Math.min(W, H) * 0.0026;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const bob = Math.sin((now - t0) * 0.0052) * H * 0.06;
      ctx.translate(W / 2, H / 2 + bob);
      ctx.transform(R[0], R[3], R[1], R[4], 0, 0);
      const ex = (R[2] * stepPx) / Math.max(0.35, Math.hypot(R[0], R[3]));
      const ey = (R[5] * stepPx) / Math.max(0.35, Math.hypot(R[1], R[4]));
      ctx.drawImage(face, -gw / 2 + ex * L, -gh / 2 + ey * L, gw, gh);
      for (let i = L - 1; i >= 1; i--)
        ctx.drawImage(side, -gw / 2 + ex * i, -gh / 2 + ey * i, gw, gh);
      ctx.drawImage(face, -gw / 2, -gh / 2, gw, gh);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (gone) return null;
  return (
    <div
      aria-hidden="true"
      className={`js-only fixed inset-0 z-[200] grid place-items-center bg-bg transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <button
        type="button"
        onClick={() => (window as unknown as { __skip?: () => void }).__skip?.()}
        className="absolute right-7 top-6 rounded-[8px] border border-accent/25 px-3.5 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-accent transition-colors hover:bg-accent hover:text-accent-contrast"
      >
        skip preload →
      </button>
      <p className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted">
        conserving angular momentum…
      </p>
    </div>
  );
}
