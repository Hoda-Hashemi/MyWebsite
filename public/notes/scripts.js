(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pageName() {
    const name = window.location.pathname.split("/").pop();
    return name || "index.html";
  }

  function buildHeader() {
    const current = pageName();
    const header = document.querySelector("#header") || document.createElement("header");
    header.id = "header";
    header.className = "site-header";
    header.innerHTML = `
      <nav class="site-nav" aria-label="Primary">
        <a class="brand-mark" href="index.html" aria-label="Hoda Hashemi home">
          <img src="logo/hoda-mark.svg" width="28" height="28" alt="">
          <span>Hoda Hashemi</span>
        </a>
        <div class="nav-links">
          <a href="index.html" data-page="index.html">Home</a>
          <a href="index.html#research">Research</a>
          <a href="index.html#notes">Notes</a>
          <a href="CV.html" data-page="CV.html">CV</a>
          <a href="index.html#contact">Contact</a>
          <span class="external-links" aria-label="External profiles">
            <a href="https://www.linkedin.com/in/hoda-hashemi-630a33204/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://github.com/Hoda-Hashemi" target="_blank" rel="noopener noreferrer">GitHub</a>
          </span>
        </div>
      </nav>
    `;

    if (!header.parentNode) document.body.prepend(header);

    header.querySelectorAll("[data-page]").forEach((link) => {
      if (link.dataset.page === current) link.classList.add("active");
    });
  }

  function initReveals() {
    const nodes = Array.from(document.querySelectorAll(".reveal, .research-card, .note-row, .timeline-item, .cv-panel, .cv-section"));
    if (reducedMotion || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    nodes.forEach((node) => {
      node.classList.add("reveal");
      observer.observe(node);
    });
  }

  function initStreamlines() {
    const canvas = document.querySelector("#streamlines");
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let time = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function velocity(x, y, t) {
      const cx1 = width * 0.32;
      const cy1 = height * 0.48;
      const cx2 = width * 0.72;
      const cy2 = height * 0.46;
      const dx1 = x - cx1;
      const dy1 = y - cy1;
      const dx2 = x - cx2;
      const dy2 = y - cy2;
      const r1 = dx1 * dx1 + dy1 * dy1 + 9000;
      const r2 = dx2 * dx2 + dy2 * dy2 + 12000;
      const s1 = 22000 / r1;
      const s2 = -18000 / r2;
      return {
        x: -dy1 * s1 - dy2 * s2 + Math.cos(y * 0.01 + t) * 0.28,
        y: dx1 * s1 + dx2 * s2 + Math.sin(x * 0.008 - t) * 0.22
      };
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(15, 92, 92, 0.22)";

      const cols = Math.max(9, Math.floor(width / 92));
      const rows = Math.max(6, Math.floor(height / 96));

      for (let j = 0; j <= rows; j += 1) {
        for (let i = 0; i <= cols; i += 1) {
          let x = (i + 0.35 * Math.sin(j + time)) * width / cols;
          let y = (j + 0.35 * Math.cos(i - time)) * height / rows;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let k = 0; k < 42; k += 1) {
            const v = velocity(x, y, time);
            x += v.x * 4.2;
            y += v.y * 4.2;
            if (x < -40 || x > width + 40 || y < -40 || y > height + 40) break;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    }

    function animate() {
      time += 0.006;
      draw();
      if (!reducedMotion) requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);
    resize();
    if (!reducedMotion) animate();
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildHeader();
    initReveals();
    initStreamlines();
  });
})();
