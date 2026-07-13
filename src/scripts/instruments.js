/*
 * instruments.js — 2D-canvas "instrument" visuals for the work/research cards.
 * Each canvas renders a discretized flow field (streamlines advected through a
 * few vortices, drawn on a faint lattice) tinted per topic. Lightweight 2D
 * canvas — no proliferating WebGL contexts. Paused off-screen; static under
 * reduced-motion.
 */

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const KINDS = {
  qgsw: { color: "73,244,209", vortices: [[0.3, 0.4, 0.9], [0.7, 0.62, -0.7]] },
  mitgcm: { color: "200,170,110", vortices: [[0.5, 0.5, 0.6], [0.22, 0.7, 0.5]] },
  cuda: { color: "255,77,61", vortices: [[0.35, 0.5, 1.1], [0.72, 0.4, -1.0]] },
  rag: { color: "150,190,240", vortices: [[0.5, 0.35, 0.7], [0.5, 0.7, -0.7]] },
  ocean: { color: "73,244,209", vortices: [[0.28, 0.5, 0.8], [0.7, 0.5, -0.8], [0.5, 0.75, 0.5]] },
};

function makeInstrument(canvas) {
  const kind = canvas.dataset.kind || "qgsw";
  const cfg = KINDS[kind] || KINDS.qgsw;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  let w = 0, h = 0, dpr = 1;
  const N = 26; // streamline seeds
  let seeds = [];

  function reseed() {
    seeds = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      life: Math.random(),
      trail: [],
    }));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    staticDrawn = false; // canvas was cleared — allow the static frame to repaint
  }

  function velocity(x, y, t) {
    let vx = 0.0018 * Math.sin(y * 6.0 + t * 0.6);
    let vy = 0.0018 * Math.cos(x * 5.2 - t * 0.5);
    for (const [cx, cy, g] of cfg.vortices) {
      const dx = x - cx;
      const dy = y - cy;
      const r2 = dx * dx + dy * dy + 0.02;
      vx += (-g * dy) / r2 * 0.0016;
      vy += (g * dx) / r2 * 0.0016;
    }
    return [vx, vy];
  }

  function drawLattice() {
    ctx.save();
    ctx.strokeStyle = `rgba(${cfg.color},0.05)`;
    ctx.lineWidth = 1;
    const step = 26;
    for (let gx = 0; gx <= w; gx += step) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 0; gy <= h; gy += step) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }
    ctx.restore();
  }

  let staticDrawn = false;
  function frame(t) {
    ctx.fillStyle = "rgba(8,10,14,0.16)";
    ctx.fillRect(0, 0, w, h);
    drawLattice();

    ctx.lineWidth = 1.2;
    for (const s of seeds) {
      const [vx, vy] = velocity(s.x, s.y, t);
      s.x += vx;
      s.y += vy;
      s.life -= 0.006;
      s.trail.push([s.x * w, s.y * h]);
      if (s.trail.length > 18) s.trail.shift();
      if (s.life <= 0 || s.x < -0.05 || s.x > 1.05 || s.y < -0.05 || s.y > 1.05) {
        s.x = Math.random();
        s.y = Math.random();
        s.life = 0.6 + Math.random() * 0.5;
        s.trail = [];
      }
      if (s.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(s.trail[0][0], s.trail[0][1]);
        for (let i = 1; i < s.trail.length; i += 1) ctx.lineTo(s.trail[i][0], s.trail[i][1]);
        ctx.strokeStyle = `rgba(${cfg.color},${0.5 * s.life})`;
        ctx.stroke();
        const head = s.trail[s.trail.length - 1];
        ctx.fillStyle = `rgba(${cfg.color},${0.9 * s.life})`;
        ctx.fillRect(head[0] - 1, head[1] - 1, 2.2, 2.2);
      }
    }
  }

  function drawStatic() {
    if (staticDrawn) return;
    ctx.fillStyle = "rgba(8,10,14,1)";
    ctx.fillRect(0, 0, w, h);
    drawLattice();
    // frozen streaks
    const T = 3.0;
    for (const s of seeds) {
      let x = s.x, y = s.y;
      ctx.beginPath();
      ctx.moveTo(x * w, y * h);
      for (let i = 0; i < 22; i += 1) {
        const [vx, vy] = velocity(x, y, T);
        x += vx * 3;
        y += vy * 3;
        ctx.lineTo(x * w, y * h);
      }
      ctx.strokeStyle = `rgba(${cfg.color},0.4)`;
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
    staticDrawn = true;
  }

  return { canvas, resize, reseed, frame, drawStatic, get w() { return w; } };
}

export function initInstruments() {
  const canvases = [...document.querySelectorAll(".instrument-canvas")];
  if (!canvases.length) return;

  const instruments = canvases.map(makeInstrument).filter(Boolean);
  const active = new Set();

  instruments.forEach((ins) => {
    ins.resize();
    ins.reseed();
  });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      instruments.forEach((ins) => {
        ins.resize();
        ins.reseed();
        if (reduced) ins.drawStatic(); // repaint the frozen frame after resize
      });
    }, 150);
  });

  if (reduced) {
    instruments.forEach((ins) => ins.drawStatic());
    return;
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ins = instruments.find((i) => i.canvas === entry.target);
          if (!ins) return;
          if (entry.isIntersecting) active.add(ins);
          else active.delete(ins);
        });
      },
      { threshold: 0.05 }
    );
    instruments.forEach((ins) => io.observe(ins.canvas));
  } else {
    instruments.forEach((ins) => active.add(ins));
  }

  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = document.visibilityState === "visible";
  });

  function loop(now) {
    const t = now * 0.001;
    if (running) active.forEach((ins) => ins.frame(t));
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
