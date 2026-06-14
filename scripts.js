(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pageName() {
    const name = window.location.pathname.split("/").pop();
    return name || "index.html";
  }

  function buildHeader() {
    const current = pageName();
    const storage = {
      get(key) {
        try {
          return window.localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      set(key, value) {
        try {
          window.localStorage.setItem(key, value);
        } catch {
          /* Focus mode still works for this page view. */
        }
      }
    };
    const header = document.querySelector("#header") || document.createElement("header");
    header.id = "header";
    header.className = "site-header";
    header.innerHTML = `
      <nav class="site-nav" aria-label="Primary">
        <a class="brand-mark" href="index.html" data-cursor="link" aria-label="Hoda Hashemi home">
          <img src="logo/hoda-mark.svg" width="42" height="42" alt="">
          <span>Hoda Hashemi</span>
        </a>
        <div class="nav-links">
          <a href="index.html" data-page="index.html">Home</a>
          <a href="CV.html" data-page="CV.html">CV</a>
          <div class="nav-menu">
            <button type="button" aria-haspopup="true" aria-expanded="false">Scribbles</button>
            <div class="dropdown-content">
              <a href="NS.html" data-page="NS.html">Navier-Stokes equations</a>
              <a href="SW.html" data-page="SW.html">Shallow water equations</a>
              <a href="QSW.html" data-page="QSW.html">Quasi-geostrophic equations</a>
              <a href="SphericalQSW.html" data-page="SphericalQSW.html">QG equations on sphere</a>
            </div>
          </div>
          <div class="nav-menu">
            <button type="button" aria-haspopup="true" aria-expanded="false">Numerics</button>
            <div class="dropdown-content">
              <a href="InstallingMITGCM.html" data-page="InstallingMITGCM.html">Installing MITgcm</a>
              <a href="UnderstandingMITGCM.html" data-page="UnderstandingMITGCM.html">MITgcm structure</a>
            </div>
          </div>
          <a href="Articles.html" data-page="Articles.html">Articles</a>
          <a href="Publications.html" data-page="Publications.html">Publications</a>
          <a href="https://buymeacoffee.com/hodahashemi" target="_blank" rel="noreferrer">Support</a>
          <button class="theme-button" type="button" aria-label="Toggle focus mode"><span></span></button>
        </div>
      </nav>
    `;

    if (!header.parentNode) {
      document.body.prepend(header);
    }

    header.querySelectorAll("[data-page]").forEach((link) => {
      if (link.dataset.page === current) link.classList.add("active");
    });

    const menus = Array.from(header.querySelectorAll(".nav-menu"));
    const closeMenus = (except) => {
      menus.forEach((menu) => {
        if (menu === except) return;
        menu.classList.remove("is-open");
        menu.querySelector("button")?.setAttribute("aria-expanded", "false");
      });
    };

    menus.forEach((menu) => {
      const button = menu.querySelector("button");
      const setOpen = (open) => {
        menu.classList.toggle("is-open", open);
        button?.setAttribute("aria-expanded", open ? "true" : "false");
      };

      button?.addEventListener("click", (event) => {
        event.preventDefault();
        const open = !menu.classList.contains("is-open");
        closeMenus(menu);
        setOpen(open);
      });

      menu.addEventListener("mouseenter", () => {
        closeMenus(menu);
        setOpen(true);
      });

      menu.addEventListener("mouseleave", () => setOpen(false));
      menu.addEventListener("focusout", (event) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !menu.contains(next)) setOpen(false);
      });
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof Element && header.contains(target)) return;
      closeMenus();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenus();
    });

    header.querySelector(".theme-button")?.addEventListener("click", () => {
      document.body.classList.toggle("focus-mode");
      storage.set("focus-mode", document.body.classList.contains("focus-mode") ? "1" : "0");
    });

    if (storage.get("focus-mode") === "1") {
      document.body.classList.add("focus-mode");
    }
  }

  function initCursor() {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = document.createElement("div");
    cursor.className = "pomegranate-cursor";
    cursor.innerHTML = '<span class="pomegranate-fruit"></span><span class="pomegranate-leaf"></span>';
    document.body.appendChild(cursor);
    document.body.classList.add("has-pomegranate-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;

    const move = () => {
      x += (targetX - x) * 0.28;
      y += (targetY - y) * 0.28;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(move);
    };
    move();

    window.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.classList.add("is-visible");
    });

    window.addEventListener("pointerdown", () => cursor.classList.add("is-active"));
    window.addEventListener("pointerup", () => cursor.classList.remove("is-active"));
    window.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));
  }

  function initSparks() {
    if (reducedMotion) return;

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest("a, button, .feature-card, .lab-card")) return;

      const spark = document.createElement("div");
      spark.className = "click-spark";
      spark.style.left = `${event.clientX}px`;
      spark.style.top = `${event.clientY}px`;
      document.body.appendChild(spark);
      spark.addEventListener("animationend", () => spark.remove(), { once: true });
    });
  }

  function initReveals() {
    const candidates = document.querySelectorAll(
      ".feature-card, .lab-card, .cv-panel, .cv-section, .timeline-item, .metric, .section-head, .page-hero"
    );

    candidates.forEach((node) => node.classList.add("reveal"));

    if (reducedMotion || !("IntersectionObserver" in window)) {
      candidates.forEach((node) => node.classList.add("is-visible"));
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
      { threshold: 0.12 }
    );

    candidates.forEach((node) => observer.observe(node));
  }

  function initParallax() {
    const layers = Array.from(document.querySelectorAll("[data-parallax]"));
    if (reducedMotion || layers.length === 0) return;

    let ticking = false;

    const update = () => {
      layers.forEach((layer) => {
        const speedY = Number(layer.getAttribute("data-parallax")) || 0;
        const speedX = Number(layer.getAttribute("data-parallax-x")) || 0;
        const rotateSpeed = Number(layer.getAttribute("data-parallax-rotate")) || 0;
        const rect = layer.getBoundingClientRect();
        const centerDelta = window.innerHeight * 0.5 - rect.top;
        const deltaY = centerDelta * speedY;
        const deltaX = centerDelta * speedX;
        const rotation = centerDelta * rotateSpeed;
        layer.style.transform = `translate3d(${deltaX.toFixed(2)}px, ${deltaY.toFixed(2)}px, 0) rotate(${rotation.toFixed(2)}deg)`;
      });
      ticking = false;
    };

    const request = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    request();
  }

  function initHeroField() {
    const canvas = document.querySelector("#hero-field");
    if (!(canvas instanceof HTMLCanvasElement) || reducedMotion) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const colors = ["#FF0000", "#151E73", "#788BFF", "#819C86", "#F4FAFF"];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let particles = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(110, Math.min(240, Math.floor((width * height) / 8200)));
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 2 + Math.floor(Math.random() * 3),
        vx: -0.22 + Math.random() * 0.44,
        vy: 0.08 + Math.random() * 0.38,
        color: colors[index % colors.length],
        phase: Math.random() * Math.PI * 2,
        stem: Math.random() > 0.78
      }));
    }

    function draw(time) {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      particles.forEach((particle) => {
        const pullX = (pointerX - 0.5) * 0.26;
        const pullY = (pointerY - 0.5) * 0.18;
        particle.x += particle.vx + pullX + Math.sin(time * 0.001 + particle.phase) * 0.08;
        particle.y += particle.vy + pullY;

        if (particle.x < -12) particle.x = width + 12;
        if (particle.x > width + 12) particle.x = -12;
        if (particle.y > height + 12) particle.y = -12;

        const px = Math.round(particle.x / 4) * 4;
        const py = Math.round(particle.y / 4) * 4;
        context.fillStyle = particle.color;
        context.globalAlpha = 0.34 + Math.sin(time * 0.004 + particle.phase) * 0.18;
        context.fillRect(px, py, particle.size, particle.size);

        if (particle.stem) {
          context.globalAlpha *= 0.42;
          context.fillRect(px, py + particle.size + 3, 1, 26);
          context.fillRect(px - 5, py + 12, 6, 1);
          context.fillRect(px, py + 20, 6, 1);
        }
      });

      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    window.addEventListener(
      "pointermove",
      (event) => {
        pointerX = event.clientX / Math.max(width, 1);
        pointerY = event.clientY / Math.max(height, 1);
      },
      { passive: true }
    );

    resize();
    draw(0);
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildHeader();
    initCursor();
    initSparks();
    initReveals();
    initParallax();
    initHeroField();
  });
})();
