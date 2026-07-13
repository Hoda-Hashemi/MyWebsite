/*
 * main.js — interaction + scroll orchestration.
 * Smooth scroll (Lenis), GSAP ScrollTrigger choreography where each section
 * transition is a physical metaphor (advection, diffusion, wave propagation),
 * Rossby-wave horizontal drift on background layers, a magnetic custom cursor,
 * and a name that "resolves" out of the flow. All heavy motion is skipped
 * under prefers-reduced-motion. Reveal-hiding is gated behind a `.js` class so
 * content stays legible if JS is slow or unavailable.
 */

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initFluidHero } from "./fluid-hero.js";
import { initInstruments } from "./instruments.js";
import { initGithubProducts } from "./github-products.js";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;

// signal that JS is live — CSS uses this to arm the reveal animations
document.documentElement.classList.add("js");

/* ---------- smooth scroll ---------- */
function initSmoothScroll() {
  if (reduced) return;
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach((link) => {
    const href = link.getAttribute("href") || "";
    const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "";
    if (hash.length < 2) return;
    const target = document.querySelector(hash);
    if (!target) return;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      lenis.scrollTo(target, { offset: -10, duration: 1.3 });
    });
  });
}

/* ---------- reveals ---------- */
function initReveals() {
  const revealAll = () =>
    document.querySelectorAll(".panel-resolve").forEach((n) => n.classList.add("is-visible"));

  if (reduced || !("IntersectionObserver" in window)) {
    revealAll();
    document.addEventListener("products:rendered", revealAll);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );
  const observeNew = () =>
    document.querySelectorAll(".panel-resolve:not(.is-visible)").forEach((n) => observer.observe(n));
  observeNew();
  document.addEventListener("products:rendered", observeNew);
}

/* ---------- name resolves out of the flow ---------- */
function initNameResolve() {
  const title = document.querySelector("[data-resolve-text]");
  if (!title) return;
  const text = title.textContent || "";
  if (reduced) {
    title.classList.add("is-resolved");
    return;
  }
  // wrap each word so it never breaks mid-word; each letter resolves individually
  title.textContent = "";
  const frag = document.createDocumentFragment();
  text.split(/(\s+)/).forEach((token) => {
    if (token === "") return;
    if (/^\s+$/.test(token)) {
      frag.appendChild(document.createTextNode(" "));
      return;
    }
    const word = document.createElement("span");
    word.className = "word";
    [...token].forEach((ch) => {
      const span = document.createElement("span");
      span.className = "glyph";
      span.textContent = ch;
      word.appendChild(span);
    });
    frag.appendChild(word);
  });
  title.appendChild(frag);
  title.classList.add("is-resolving");

  gsap.registerPlugin(ScrollTrigger);
  gsap.fromTo(
    title.querySelectorAll(".glyph"),
    { opacity: 0, filter: "blur(16px)", yPercent: 34, scaleY: 1.35 },
    {
      opacity: 1,
      filter: "blur(0px)",
      yPercent: 0,
      scaleY: 1,
      duration: 1.15,
      ease: "power3.out",
      stagger: { each: 0.045, from: "random" },
      delay: 0.2,
      onComplete: () => title.classList.add("is-resolved"),
    }
  );
}

/* ---------- hero entrance ---------- */
function initHeroEntrance() {
  if (reduced) return;
  gsap.utils
    .toArray(".hero-copy, .hero-readout, .hero-stat-strip, .eyebrow-hero")
    .forEach((node, i) => {
      gsap.fromTo(
        node,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, delay: 0.4 + i * 0.09, ease: "power3.out" }
      );
    });
}

/* ---------- scroll choreography: physical metaphors ---------- */
function initChoreography() {
  if (reduced) return;
  gsap.registerPlugin(ScrollTrigger);

  // Research panels ASSEMBLE from the grid (--resolve drives CSS)
  gsap.utils.toArray(".work-card").forEach((panel) => {
    gsap.fromTo(
      panel,
      { "--resolve": 0 },
      {
        "--resolve": 1,
        ease: "none",
        scrollTrigger: { trigger: panel, start: "top 88%", end: "top 46%", scrub: true },
      }
    );
  });

  // Rossby-wave horizontal drift (parallax)
  gsap.utils.toArray("[data-drift]").forEach((el) => {
    const speed = parseFloat(el.dataset.drift) || 60;
    gsap.fromTo(
      el,
      { x: -speed },
      {
        x: speed,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest("section") || el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  });

  // Section titles wave in as they cross into view
  gsap.utils.toArray(".section-title").forEach((title) => {
    gsap.fromTo(
      title,
      { yPercent: 16, opacity: 0.25 },
      {
        yPercent: 0,
        opacity: 1,
        ease: "power2.out",
        scrollTrigger: { trigger: title, start: "top 92%", end: "top 60%", scrub: true },
      }
    );
  });
}

/* ---------- pointer parallax for hero fog/grain ---------- */
function initPointerParallax() {
  const root = document.querySelector(".premium-hero");
  if (!root || coarse || reduced) return;
  let x = 0.5, y = 0.5, tx = 0.5, ty = 0.5, raf = 0;
  window.addEventListener(
    "pointermove",
    (e) => {
      tx = e.clientX / Math.max(1, window.innerWidth);
      ty = e.clientY / Math.max(1, window.innerHeight);
      if (!raf) raf = requestAnimationFrame(tick);
    },
    { passive: true }
  );
  function tick() {
    x += (tx - x) * 0.08;
    y += (ty - y) * 0.08;
    root.style.setProperty("--mx", x.toFixed(4));
    root.style.setProperty("--my", y.toFixed(4));
    if (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) raf = requestAnimationFrame(tick);
    else raf = 0;
  }
}

/* ---------- custom cursor + magnetic ---------- */
function initCursor() {
  const ring = document.querySelector(".cursor-ring");
  if (!ring || coarse || reduced) return;
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
  function tick() {
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    // stop ticking once the ring has settled; pointermove restarts it
    if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) raf = requestAnimationFrame(tick);
    else raf = 0;
  }
  window.addEventListener(
    "pointermove",
    (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    },
    { passive: true }
  );
  const targets = "a, button, input, .magnetic, .work-card, .product-card, .article-row";
  document.addEventListener("pointerover", (e) => {
    if (e.target.closest && e.target.closest(targets)) ring.classList.add("is-active");
  });
  document.addEventListener("pointerout", (e) => {
    if (e.target.closest && e.target.closest(targets)) ring.classList.remove("is-active");
  });
}

function initMagnetic() {
  if (coarse || reduced) return;
  document.querySelectorAll(".magnetic").forEach((node) => {
    node.addEventListener("pointermove", (e) => {
      const rect = node.getBoundingClientRect();
      const dx = e.clientX - rect.left - rect.width / 2;
      const dy = e.clientY - rect.top - rect.height / 2;
      node.style.transform = `translate(${dx * 0.14}px, ${dy * 0.22}px)`;
    });
    node.addEventListener("pointerleave", () => {
      node.style.transform = "";
    });
  });
}

/* ---------- scroll progress bar ---------- */
function initScrollProgress() {
  const bar = document.querySelector(".scroll-progress");
  if (!bar) return;
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    bar.style.setProperty("--progress", p.toFixed(4));
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  update();
}

/* ---------- expanding work cards (disclosure pattern) ---------- */
function initWorkCards() {
  document.querySelectorAll(".work-card").forEach((card) => {
    const button = card.querySelector(".work-toggle");
    if (!button) return;
    const toggle = () => {
      const open = card.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
    };
    button.addEventListener("click", toggle); // native button: Enter/Space included
    // pointer convenience: clicking anywhere else on the card also toggles,
    // but never intercept real links or the button itself
    card.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      toggle();
    });
  });
}

function boot() {
  initSmoothScroll();
  initReveals();
  initNameResolve();
  initHeroEntrance();
  initChoreography();
  initPointerParallax();
  initCursor();
  initMagnetic();
  initWorkCards();
  initScrollProgress();
  initFluidHero();
  initInstruments();
  initGithubProducts();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
