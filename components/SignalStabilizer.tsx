"use client";

import { useEffect, useRef, useState } from "react";

/* Signal Stabilizer — a 30-second data-assimilation console.
   A noisy observation stream runs against the true state; tune gain,
   phase and the noise filter until the residual collapses. Calm on
   purpose: no timer, no score, just convergence. */
export function SignalStabilizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gain, setGain] = useState(0.45);
  const [phase, setPhase] = useState(-1.3);
  const [filter, setFilter] = useState(0.15);
  const [residual, setResidual] = useState(1);
  const [locked, setLocked] = useState(false);
  const state = useRef({ gain, phase, filter });
  state.current = { gain, phase, filter };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const DPR = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    addEventListener("resize", resize);

    // deterministic noise field
    const noise = (x: number) =>
      Math.sin(x * 7.3) * 0.55 + Math.sin(x * 13.7 + 2) * 0.3 + Math.sin(x * 29.1 + 5) * 0.15;

    let raf = 0;
    let tt = 0;
    let last = performance.now();
    let visible = true;
    const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0.05 });
    io.observe(canvas);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      if (!reduced) tt += dt;

      const { gain: A, phase: ph, filter: fl } = state.current;
      const dark = document.documentElement.classList.contains("dark");
      const accent = dark ? "122,162,255" : "0,56,255";

      ctx.clearRect(0, 0, W, H);
      const mid = H / 2, amp = H * 0.3;
      const f = 1.6;

      // truth (faint) + observation (bright)
      let sum = 0, count = 0;
      for (const pass of [0, 1] as const) {
        ctx.beginPath();
        for (let px = 0; px <= W; px += 2) {
          const x = px / W;
          const s = Math.sin((x * 3 + tt * 0.35) * f * Math.PI * 2);
          const o =
            A * Math.sin((x * 3 + tt * 0.35) * f * Math.PI * 2 + ph) +
            (1 - fl) * 0.75 * noise(x * 6 + tt * 0.5);
          const y = pass === 0 ? s : o;
          if (pass === 1 && px % 8 === 0) { sum += (o - s) ** 2; count++; }
          const Y = mid - y * amp;
          px === 0 ? ctx.moveTo(px, Y) : ctx.lineTo(px, Y);
        }
        ctx.strokeStyle = pass === 0 ? `rgba(${accent},0.28)` : `rgba(${accent},0.95)`;
        ctx.lineWidth = pass === 0 ? 1.5 : 2;
        ctx.stroke();
      }
      const r = Math.sqrt(sum / Math.max(1, count));
      setResidual(r);
      setLocked(r < 0.09);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      io.disconnect();
    };
  }, []);

  const reset = () => {
    setGain(0.3 + Math.random() * 1.4);
    setPhase(-Math.PI + Math.random() * 2 * Math.PI);
    setFilter(Math.random() * 0.3);
  };

  const slider = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    set: (v: number) => void,
    fmt: (v: number) => string
  ) => (
    <label className="grid gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted">
      <span className="flex justify-between">
        {label}
        <span className="text-accent">{fmt(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        className="accent-[#0038ff] dark:accent-[#7aa2ff]"
      />
    </label>
  );

  return (
    <div className="card gradient-border relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
          data-assimilation console — match the observation to the truth
        </p>
        <p
          aria-live="polite"
          className={`font-mono text-[0.7rem] uppercase tracking-[0.16em] ${
            locked ? "text-accent" : "text-muted"
          }`}
        >
          {locked ? "stream assimilated ✓" : `‖residual‖ = ${residual.toFixed(2)}`}
        </p>
      </div>

      <div className={`transition-shadow duration-700 ${locked ? "shadow-[inset_0_0_60px_-20px_rgba(0,56,255,0.45)]" : ""}`}>
        <canvas ref={canvasRef} className="h-52 w-full" />
      </div>

      <div className="grid gap-5 border-t border-line px-6 py-5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        {slider("gain", gain, 0.2, 2, 0.01, setGain, (v) => v.toFixed(2))}
        {slider("phase", phase, -3.14, 3.14, 0.01, setPhase, (v) => v.toFixed(2) + " rad")}
        {slider("noise filter", filter, 0, 1, 0.01, setFilter, (v) => Math.round(v * 100) + "%")}
        <button type="button" onClick={reset} className="btn btn-ghost h-10 px-4 text-[0.8rem]">
          new storm ↻
        </button>
      </div>
    </div>
  );
}
