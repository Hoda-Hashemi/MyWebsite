/*
 * github-products.js — live "Products" grid from public GitHub data.
 * Fetches repos client-side (no auth), caches in localStorage with a TTL,
 * pins the MITgcm Fortran fork, and degrades to a static message on failure.
 */

const USER = "Hoda-Hashemi";
const API = `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`;
const CACHE_KEY = "hh:gh-repos:v2";
const TTL = 1000 * 60 * 60 * 6; // 6 hours
const PINNED = ["MITgcm"]; // pin the MITgcm Fortran fork first

const LANG_COLORS = {
  Fortran: "#734f96",
  Python: "#49f4d1",
  Julia: "#9558b2",
  "C++": "#f34b7d",
  C: "#a8b9cc",
  Cuda: "#76b900",
  MATLAB: "#e16737",
  "Jupyter Notebook": "#da5b0b",
  TeX: "#c8aa6e",
  HTML: "#e34c26",
  JavaScript: "#f0db4f",
  Shell: "#89e051",
};

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.repos)) return null;
    if (Date.now() - parsed.at > TTL) return { repos: parsed.repos, stale: true };
    return { repos: parsed.repos, stale: false };
  } catch {
    return null;
  }
}

function writeCache(repos) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos }));
  } catch {
    /* private mode / quota — ignore */
  }
}

function normalize(repos) {
  return repos
    .filter((r) => !r.archived)
    .map((r) => ({
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      html_url: r.html_url,
      homepage: r.homepage,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      fork: r.fork,
      updated_at: r.updated_at,
    }));
}

function rank(repos) {
  const score = (r) => {
    let s = r.stars * 10 + r.forks * 4;
    if (PINNED.includes(r.name)) s += 100000;
    if (r.description) s += 3;
    if (!r.fork) s += 2;
    return s;
  };
  return [...repos].sort((a, b) => score(b) - score(a));
}

const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function esc(str) {
  // safe for both text and attribute contexts (escapes quotes too)
  return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ESC_MAP[c]);
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function card(repo, index) {
  const pinned = PINNED.includes(repo.name);
  const langDot = repo.language
    ? `<span class="lang"><i style="background:${LANG_COLORS[repo.language] || "#98a0a2"}"></i>${esc(repo.language)}</span>`
    : "";
  const link = repo.homepage || repo.html_url;
  return `
    <a class="product-card panel-resolve" href="${esc(link)}" target="_blank" rel="noopener noreferrer"
       style="--i:${index}">
      <div class="product-head">
        <span class="product-index">${String(index + 1).padStart(2, "0")}</span>
        ${pinned ? '<span class="product-pin">pinned</span>' : ""}
        ${repo.fork ? '<span class="product-fork">fork</span>' : ""}
      </div>
      <h3 class="product-name">${esc(repo.name)}</h3>
      <p class="product-desc">${esc(repo.description || "Research software and computational tooling.")}</p>
      <div class="product-meta">
        ${langDot}
        <span class="stat" title="stars">★ ${repo.stars}</span>
        <span class="stat" title="forks">⑂ ${repo.forks}</span>
        <span class="stat updated">${fmtDate(repo.updated_at)}</span>
      </div>
    </a>`;
}

function render(container, repos, opts = {}) {
  const ranked = rank(repos).slice(0, 6);
  if (!ranked.length) {
    renderFallback(container);
    return;
  }
  container.innerHTML = ranked.map((r, i) => card(r, i)).join("");
  container.classList.remove("is-loading");
  if (opts.stale) container.dataset.stale = "true";

  // let the reveal + parallax observers pick up freshly injected cards
  document.dispatchEvent(new CustomEvent("products:rendered"));
}

function renderFallback(container) {
  container.classList.remove("is-loading");
  container.innerHTML = `
    <div class="product-fallback panel-resolve is-visible">
      <p>Live repository data is unavailable right now.</p>
      <a class="text-link magnetic" href="https://github.com/${USER}" target="_blank" rel="noopener noreferrer">
        View all repositories on GitHub →
      </a>
    </div>`;
  document.dispatchEvent(new CustomEvent("products:rendered"));
}

export function initGithubProducts() {
  const container = document.querySelector("#products-grid");
  if (!container) return;
  container.classList.add("is-loading");

  const cached = readCache();
  if (cached && !cached.stale) {
    render(container, cached.repos);
    return; // fresh cache — no network needed
  }
  if (cached && cached.stale) {
    render(container, cached.repos, { stale: true }); // show stale immediately, refresh below
  }

  fetch(API, { headers: { Accept: "application/vnd.github+json" } })
    .then((res) => {
      if (!res.ok) throw new Error(`GitHub ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error("unexpected payload");
      const repos = normalize(data);
      writeCache(repos);
      render(container, repos);
    })
    .catch(() => {
      if (!cached) renderFallback(container);
      // if we already rendered a stale cache, keep it on screen
    });
}
