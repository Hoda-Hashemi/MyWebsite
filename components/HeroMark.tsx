"use client";

import { useEffect, useRef } from "react";

/* The hero's living mark: tumbles torque-free (tennis-racket theorem, RK4)
   and takes real torque from the cursor — swipe across it to spin it up.
   Also drives the cursor-following gradient via --gx/--gy on the section. */
export function HeroMark() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const section = canvas.closest("section");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // cursor gradient (cheap, even under reduced motion it just sits still)
    let gx = 0.72, gy = 0.3, tx = gx, ty = gy;
    const onMove = (e: PointerEvent) => {
      if (!section) return;
      const r = section.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
    };
    section?.addEventListener("pointermove", onMove, { passive: true });

    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    const face = new Image();
    const side = new Image();
    face.src = "/brand-mark.png";
    side.src = "/preloader-side.png";

    const DPR = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
    };
    resize();
    addEventListener("resize", resize);

    const I = [1, 2.2, 3.2];
    let w = [0.9, 2.2, 0.6];          // gentle idle tumble
    let q = [1, 0, 0, 0];
    let lastPtr: { x: number; y: number; t: number } | null = null;

    const torque = (e: PointerEvent) => {
      // cursor velocity across the hero applies torque about the view axes
      const now = performance.now();
      if (lastPtr) {
        const dt = Math.max(8, now - lastPtr.t) / 1000;
        const vx = (e.clientX - lastPtr.x) / dt / 1000;
        const vy = (e.clientY - lastPtr.y) / dt / 1000;
        // world-frame kick: horizontal swipe -> spin about screen-y, vertical -> screen-x
        const kw = [vy * 2.2, vx * 2.2, vx * 0.4];
        // map into body frame: ω_body += Rᵀ · Δω_world
        const [w0, x, y, z] = q;
        const R = [
          1 - 2 * (y * y + z * z), 2 * (x * y - z * w0), 2 * (x * z + y * w0),
          2 * (x * y + z * w0), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w0),
          2 * (x * z - y * w0), 2 * (y * z + x * w0), 1 - 2 * (x * x + y * y),
        ];
        w = [
          w[0] + R[0] * kw[0] + R[3] * kw[1] + R[6] * kw[2],
          w[1] + R[1] * kw[0] + R[4] * kw[1] + R[7] * kw[2],
          w[2] + R[2] * kw[0] + R[5] * kw[1] + R[8] * kw[2],
        ];
        const mag = Math.hypot(...w);
        const cap = 11;
        if (mag > cap) w = w.map((v) => (v / mag) * cap);
      }
      lastPtr = { x: e.clientX, y: e.clientY, t: now };
    };
    if (!reduced) section?.addEventListener("pointermove", torque, { passive: true });

    const wdot = (v: number[]) => [
      ((I[1] - I[2]) / I[0]) * v[1] * v[2],
      ((I[2] - I[0]) / I[1]) * v[2] * v[0],
      ((I[0] - I[1]) / I[2]) * v[0] * v[1],
    ];

    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      // gradient follow
      gx += (tx - gx) * 0.08;
      gy += (ty - gy) * 0.08;
      section?.style.setProperty("--gx", (gx * 100).toFixed(2) + "%");
      section?.style.setProperty("--gy", (gy * 100).toFixed(2) + "%");

      if (!face.complete || !side.complete) return;
      const dt = Math.min((now - last) / 1000, 0.03) || 0.016;
      last = now;

      if (!reduced) {
        const k1 = wdot(w),
          k2 = wdot(w.map((v, i) => v + 0.5 * dt * k1[i])),
          k3 = wdot(w.map((v, i) => v + 0.5 * dt * k2[i])),
          k4 = wdot(w.map((v, i) => v + dt * k3[i]));
        w = w.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
        // gentle drag so cursor kicks decay back to the idle tumble
        const mag = Math.hypot(...w);
        if (mag > 3.2) w = w.map((v) => v * Math.pow(0.55, dt));
        const [qw2, qx2, qy2, qz2] = q;
        q = [
          qw2 + dt * 0.5 * (-qx2 * w[0] - qy2 * w[1] - qz2 * w[2]),
          qx2 + dt * 0.5 * (qw2 * w[0] + qy2 * w[2] - qz2 * w[1]),
          qy2 + dt * 0.5 * (qw2 * w[1] - qx2 * w[2] + qz2 * w[0]),
          qz2 + dt * 0.5 * (qw2 * w[2] + qx2 * w[1] - qy2 * w[0]),
        ];
        const n = Math.hypot(q[0], q[1], q[2], q[3]);
        q = q.map((v) => v / n);
      }

      const [w0, x, y, z] = q;
      const R = [
        1 - 2 * (y * y + z * z), 2 * (x * y - z * w0), 2 * (x * z + y * w0),
        2 * (x * y + z * w0), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w0),
      ];
      const SW = 1007, SH = 705, L = 26;
      const base = Math.min(W, H) * 0.001;
      const gw = SW * base, gh = SH * base;
      const stepPx = Math.min(W, H) * 0.0026;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.translate(W / 2, H / 2 + Math.sin(now * 0.0035) * H * 0.03);
      ctx.transform(R[0], R[3], R[1], R[4], 0, 0);
      const ex = (R[2] * stepPx) / Math.max(0.35, Math.hypot(R[0], R[3]));
      const ey = (R[5] * stepPx) / Math.max(0.35, Math.hypot(R[1], R[4]));
      ctx.drawImage(face, -gw / 2 + ex * L, -gh / 2 + ey * L, gw, gh);
      for (let i = L - 1; i >= 1; i--)
        ctx.drawImage(side, -gw / 2 + ex * i, -gh / 2 + ey * i, gw, gh);
      ctx.drawImage(face, -gw / 2, -gh / 2, gw, gh);
      if (hudRef.current && Math.floor(now / 120) % 2 === 0) {
        hudRef.current.textContent =
          "ω = (" + w.map((v) => v.toFixed(1)).join(", ") + ") rad/s";
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      section?.removeEventListener("pointermove", onMove);
      section?.removeEventListener("pointermove", torque);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="container-page pointer-events-none absolute left-0 right-0 top-8 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted"
      >
        sandbox — <span className="text-accent">torque-free rigid body</span>, rk4, l conserved
      </div>
      <div
        ref={hudRef}
        aria-hidden="true"
        className="container-page pointer-events-none absolute left-0 right-0 top-14 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-accent"
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </>
  );
}
