/* Lecture-note archive chrome — injects header/footer linking back to
   hodahashemi.com and runs the scroll reveals. Electric-monotone identity. */
(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function buildHeader() {
    const header = document.querySelector("#header") || document.createElement("header");
    header.id = "header";
    header.className = "site-header";
    header.innerHTML = `
      <nav class="site-nav" aria-label="Primary">
        <a class="brand-mark" href="/" aria-label="Hoda Hashemi home">
          <img src="logo/hoda-mark.svg" width="28" height="28" alt="">
          <span>Hoda Hashemi</span>
        </a>
        <div class="nav-links">
          <a href="/">Home</a>
          <a href="/projects/">Projects</a>
          <a href="/articles/" class="active">Articles</a>
          <a href="/about/">About</a>
          <span class="external-links" aria-label="External profiles">
            <a href="https://github.com/Hoda-Hashemi" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/hoda-hashemi-630a33204/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </span>
        </div>
      </nav>
    `;
    if (!header.parentNode) document.body.prepend(header);
  }

  function buildFooter() {
    if (document.querySelector(".note-foot")) return;
    const foot = document.createElement("footer");
    foot.className = "note-foot";
    foot.innerHTML = `<a href="/articles/">&larr; all articles</a>`;
    document.body.appendChild(foot);
  }

  function initReveals() {
    const nodes = Array.from(
      document.querySelectorAll("main > h2, main > p, main > div[id], .lab-card, main img")
    );
    if (reducedMotion || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("reveal", "is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08 }
    );
    nodes.forEach((node) => {
      node.classList.add("reveal");
      observer.observe(node);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildHeader();
    buildFooter();
    initReveals();
  });
})();
