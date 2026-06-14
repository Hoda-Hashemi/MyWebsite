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

  function initScrollStory() {
    if (reducedMotion || !window.gsap || !window.ScrollTrigger) return;

    window.gsap.registerPlugin(window.ScrollTrigger);

    window.gsap.utils.toArray(".story-panel").forEach((panel) => {
      window.gsap.fromTo(
        panel,
        { opacity: 0.72, y: 80 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            start: "top 85%",
            end: "top 30%",
            scrub: true
          }
        }
      );
    });

    window.gsap.utils.toArray("[data-parallax]").forEach((layer) => {
      const y = Number(layer.getAttribute("data-parallax")) * -520 || -60;
      const x = Number(layer.getAttribute("data-parallax-x")) * -520 || 0;
      window.gsap.to(layer, {
        x,
        y,
        ease: "none",
        scrollTrigger: {
          trigger: layer.closest(".story-panel") || layer,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
  }

  function initStoryWebGL() {
    const canvas = document.querySelector("#story-webgl");
    if (!(canvas instanceof HTMLCanvasElement) || reducedMotion || !window.THREE) return;

    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(35, 1, 0.1, 100);
    const renderer = new window.THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    const group = new window.THREE.Group();
    const geometry = new window.THREE.IcosahedronGeometry(1.25, 1);
    const material = new window.THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const mesh = new window.THREE.Mesh(geometry, material);
    const ring = new window.THREE.Mesh(
      new window.THREE.TorusGeometry(1.7, 0.018, 8, 96),
      new window.THREE.MeshBasicMaterial({ color: 0x788bff, transparent: true, opacity: 0.85 })
    );

    group.add(mesh, ring);
    scene.add(group);
    camera.position.z = 5;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", resize);
    window.addEventListener(
      "pointermove",
      (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
        const y = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
        group.rotation.y = x * 1.2;
        group.rotation.x = y * 0.8;
      },
      { passive: true }
    );

    function animate(time) {
      mesh.rotation.x += 0.004;
      mesh.rotation.y += 0.006;
      ring.rotation.z = time * 0.00035;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    resize();
    animate(0);
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildHeader();
    initReveals();
    initScrollStory();
    if (!window.gsap || !window.ScrollTrigger) initParallax();
    initStoryWebGL();
  });
})();
