import * as THREE from "three";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initLenis() {
  if (reduced) return;
  const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.82 });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

function initReveals() {
  const nodes = document.querySelectorAll(".panel-resolve");
  if (reduced || !("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.22 }
  );
  nodes.forEach((node) => observer.observe(node));

  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray(".research-panel").forEach((panel) => {
    gsap.fromTo(
      panel,
      { "--resolve": 0 },
      {
        "--resolve": 1,
        ease: "none",
        scrollTrigger: { trigger: panel, start: "top 80%", end: "top 30%", scrub: true }
      }
    );
  });
}

function initCursor() {
  const ring = document.querySelector(".cursor-ring");
  if (!ring || matchMedia("(pointer: coarse)").matches) return;
  let x = 0;
  let y = 0;
  let tx = 0;
  let ty = 0;
  window.addEventListener("pointermove", (event) => {
    tx = event.clientX;
    ty = event.clientY;
  }, { passive: true });
  function tick() {
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  tick();
}

function initMagnetic() {
  if (matchMedia("(pointer: coarse)").matches || reduced) return;
  document.querySelectorAll(".magnetic").forEach((node) => {
    node.addEventListener("pointermove", (event) => {
      const rect = node.getBoundingClientRect();
      const dx = event.clientX - rect.left - rect.width / 2;
      const dy = event.clientY - rect.top - rect.height / 2;
      node.style.transform = `translate(${dx * 0.12}px, ${dy * 0.18}px)`;
    });
    node.addEventListener("pointerleave", () => {
      node.style.transform = "";
    });
  });
}

function initHeroField() {
  const canvas = document.querySelector("#vortex-field");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 2;

  const count = 4096;
  const positions = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const state = Array.from({ length: count }, (_, i) => {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = 0;
    phase[i] = Math.random();
    return { x, y, vx: 0, vy: 0 };
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("phase", new THREE.BufferAttribute(phase, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uDensity: { value: 8 },
      uColor: { value: new THREE.Color("#21E6C1") },
      uWarm: { value: new THREE.Color("#FF6B4A") }
    },
    vertexShader: `
      attribute float phase;
      varying float vPhase;
      void main() {
        vPhase = phase;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 2.4;
      }
    `,
    fragmentShader: `
      uniform float uDensity;
      uniform vec3 uColor;
      uniform vec3 uWarm;
      varying float vPhase;
      float bayer(vec2 p) {
        int x = int(mod(p.x, 4.0));
        int y = int(mod(p.y, 4.0));
        int i = x + y * 4;
        float m[16];
        m[0]=0.0; m[1]=8.0; m[2]=2.0; m[3]=10.0;
        m[4]=12.0; m[5]=4.0; m[6]=14.0; m[7]=6.0;
        m[8]=3.0; m[9]=11.0; m[10]=1.0; m[11]=9.0;
        m[12]=15.0; m[13]=7.0; m[14]=13.0; m[15]=5.0;
        return m[i] / 16.0;
      }
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float circle = smoothstep(0.28, 0.05, length(uv));
        float threshold = bayer(floor(gl_FragCoord.xy / max(1.0, uDensity)));
        float signal = step(threshold, 0.62 + 0.22 * sin(vPhase * 6.283));
        vec3 color = mix(uColor, uWarm, step(0.93, vPhase));
        gl_FragColor = vec4(color, circle * signal * 0.88);
      }
    `
  });
  scene.add(new THREE.Points(geometry, material));

  const pointer = { x: 0, y: 0, active: false, strength: 0 };
  const density = document.querySelector("#density");
  const densityOut = document.querySelector("#density-readout");
  const frameOut = document.querySelector("#frame-readout");

  density?.addEventListener("input", () => {
    const value = Number(density.value);
    material.uniforms.uDensity.value = value;
    if (densityOut) densityOut.value = String(value);
  });

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    pointer.active = true;
    pointer.strength = Math.min(1, pointer.strength + 0.18);
  }, { passive: true });
  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
  }
  resize();
  window.addEventListener("resize", resize);

  let frame = 0;
  let visible = true;
  document.addEventListener("visibilitychange", () => {
    visible = document.visibilityState === "visible";
  });

  function velocity(x, y, t) {
    const vortices = [
      [-0.34, 0.12, 0.45],
      [0.42, -0.18, -0.38],
      [Math.sin(t * 0.21) * 0.38, Math.cos(t * 0.17) * 0.28, 0.24]
    ];
    if (pointer.active || pointer.strength > 0.01) vortices.push([pointer.x, pointer.y, 0.62 * pointer.strength]);
    let vx = 0.012 * Math.sin(y * 3.2 + t);
    let vy = 0.012 * Math.cos(x * 2.7 - t);
    for (const [cx, cy, gamma] of vortices) {
      const dx = x - cx;
      const dy = y - cy;
      const r2 = dx * dx + dy * dy + 0.018;
      vx += (-gamma * dy) / r2 * 0.0026;
      vy += (gamma * dx) / r2 * 0.0026;
    }
    return [vx, vy];
  }

  function animate(time = 0) {
    if (!visible) {
      requestAnimationFrame(animate);
      return;
    }
    const t = time * 0.001;
    for (let i = 0; i < count; i += 1) {
      const p = state[i];
      const [vx, vy] = velocity(p.x, p.y, t);
      p.vx = (p.vx + vx) * 0.988;
      p.vy = (p.vy + vy) * 0.988;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -1.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -1.05;
      if (p.y < -1.05) p.y = 1.05;
      if (p.y > 1.05) p.y = -1.05;
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
    }
    pointer.strength *= 0.965;
    geometry.attributes.position.needsUpdate = true;
    material.uniforms.uTime.value = t;
    renderer.render(scene, camera);
    frame += 1;
    if (frameOut && frame % 6 === 0) frameOut.textContent = `frame ${String(frame).padStart(4, "0")}`;
    if (!reduced) requestAnimationFrame(animate);
  }
  animate();
}

function initPanelCanvases() {
  const canvases = document.querySelectorAll(".panel-canvas");
  canvases.forEach((canvas) => {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 2;
    const group = new THREE.Group();
    const kind = canvas.dataset.kind;
    const material = new THREE.LineBasicMaterial({ color: kind === "cuda" ? "#FF6B4A" : "#21E6C1", transparent: true, opacity: 0.72 });
    for (let j = 0; j < 12; j += 1) {
      const points = [];
      for (let i = 0; i < 90; i += 1) {
        const x = -1 + i / 44.5;
        const y = Math.sin(i * 0.16 + j * 0.42) * 0.12 + (j - 5.5) * 0.12;
        points.push(new THREE.Vector3(x, y, 0));
      }
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
    }
    scene.add(group);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
    }
    resize();
    window.addEventListener("resize", resize);

    function tick(time = 0) {
      group.rotation.z = Math.sin(time * 0.00035) * 0.04;
      group.children.forEach((line, idx) => {
        line.position.x = Math.sin(time * 0.0008 + idx) * 0.04;
      });
      renderer.render(scene, camera);
      if (!reduced) requestAnimationFrame(tick);
    }
    tick();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLenis();
  initReveals();
  initCursor();
  initMagnetic();
  initHeroField();
  initPanelCanvases();
});
