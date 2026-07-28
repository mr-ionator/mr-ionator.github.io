/* ============================================================================
   Portfolio — live GitHub data + interactions
   ========================================================================== */
(() => {
  "use strict";
  const CFG = window.PORTFOLIO_CONFIG || {};
  const USER = CFG.githubUsername || "mr-ionator";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- tiny fetch cache (localStorage, 30 min) --------------------------- */
  const CACHE_MS = 30 * 60 * 1000;
  async function getJSON(url, key) {
    try {
      const hit = JSON.parse(localStorage.getItem(key) || "null");
      if (hit && Date.now() - hit.t < CACHE_MS) return hit.d;
    } catch (_) {}
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    const d = await res.json();
    try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d })); } catch (_) {}
    return d;
  }

  /* ---- fill static config-bound text ------------------------------------- */
  function applyConfig() {
    $$("[data-config]").forEach((el) => {
      const v = CFG[el.dataset.config];
      if (v) el.textContent = v;
    });
    const yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();
    if (CFG.name) document.title = `${CFG.name} — Portfolio`;
    if (CFG.socials && CFG.socials.github) {
      const pl = $("#profileLink"); if (pl) pl.href = CFG.socials.github;
    }
  }

  /* ---- about ------------------------------------------------------------- */
  function renderAbout() {
    const box = $("#aboutParagraphs");
    if (box && Array.isArray(CFG.about)) {
      box.innerHTML = CFG.about.map((p) => `<p>${p}</p>`).join("");
    }
    const meta = $("#aboutMeta");
    if (meta) {
      const chips = [];
      if (CFG.location) chips.push(`<span class="chip">📍 ${CFG.location}</span>`);
      if (CFG.availability) chips.push(`<span class="chip">🟢 ${CFG.availability}</span>`);
      meta.innerHTML = chips.join("");
    }
  }

  /* ---- skills ------------------------------------------------------------ */
  function renderSkills() {
    const wrap = $("#skillsWrap");
    if (!wrap || !CFG.skills) return;
    wrap.innerHTML = Object.entries(CFG.skills).map(([group, items]) => `
      <div class="skill-group reveal">
        <h3>${group}</h3>
        <div class="chip-row">
          ${items.map((s) => `<span class="chip"><span class="dot" style="background:${langColor(s)}"></span>${s}</span>`).join("")}
        </div>
      </div>`).join("");
    observeReveals(wrap);
  }

  /* ---- contact ----------------------------------------------------------- */
  const ICONS = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.3-1.69-1.3-1.69-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.4-1.27.73-1.56-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.2.8 24 1.77 24h20.45c.98 0 1.78-.8 1.78-1.75V1.75C24 .78 23.2 0 22.22 0Z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.48l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.48 3.24H4.29L17.61 20.65Z"/></svg>',
    website: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
  };
  function renderContact() {
    const em = $("#contactEmail");
    if (em && CFG.email) { em.textContent = CFG.email; em.href = `mailto:${CFG.email}`; }
    else if (em) { em.parentElement.removeChild(em); }

    const box = $("#contactSocials");
    if (!box) return;
    const links = [];
    if (CFG.email) links.push(["email", `mailto:${CFG.email}`, "Email"]);
    const S = CFG.socials || {};
    if (S.github) links.push(["github", S.github, "GitHub"]);
    if (S.linkedin) links.push(["linkedin", S.linkedin, "LinkedIn"]);
    if (S.twitter) links.push(["twitter", S.twitter, "X / Twitter"]);
    if (S.website) links.push(["website", S.website, "Website"]);
    box.innerHTML = links.map(([k, href, label]) =>
      `<a class="social-link" href="${href}" ${href.startsWith("mailto") ? "" : 'target="_blank" rel="noopener"'}>${ICONS[k] || ""}${label}</a>`
    ).join("");
  }

  /* ---- GitHub profile → avatar + stats ----------------------------------- */
  async function loadProfile() {
    try {
      const d = await getJSON(`https://api.github.com/users/${USER}`, `gh_user_${USER}`);
      const av = $("#avatar");
      if (av) av.src = d.avatar_url;
      animateStat($('[data-stat="repos"]'), d.public_repos);
      animateStat($('[data-stat="followers"]'), d.followers);
    } catch (e) {
      console.warn("profile load failed", e);
      const av = $("#avatar");
      if (av) av.src = `https://avatars.githubusercontent.com/${USER}`;
    }
  }

  /* ---- Contribution heatmap ---------------------------------------------- */
  async function loadHeatmap() {
    const host = $("#heatmap");
    if (!host) return;
    try {
      // Public, CORS-enabled contributions API (no token needed).
      const d = await getJSON(
        `https://github-contributions-api.jogruber.de/v4/${USER}?y=last`,
        `gh_contrib_${USER}`
      );
      const contributions = (d.contributions || []).filter((c) => c.date);
      if (!contributions.length) throw new Error("no contribution data");

      const total = (d.total && (d.total.lastYear ?? Object.values(d.total)[0])) ||
        contributions.reduce((s, c) => s + (c.count || 0), 0);
      animateStat($("#contribTotal"), total);
      animateStat($('[data-stat="contributions"]'), total);

      renderHeatmap(host, contributions);
    } catch (e) {
      console.warn("heatmap load failed", e);
      host.innerHTML = `<div class="heatmap-loading">Couldn't load live contributions.
        <a href="https://github.com/${USER}" target="_blank" rel="noopener" style="color:var(--cyan)">View on GitHub ↗</a></div>`;
    }
  }

  function renderHeatmap(host, contributions) {
    const byDate = new Map(contributions.map((c) => [c.date, c]));
    const parse = (s) => new Date(s + "T00:00:00Z");
    const iso = (d) => d.toISOString().slice(0, 10);
    const first = parse(contributions[0].date);
    const last = parse(contributions[contributions.length - 1].date);

    // Align grid to full weeks (Sun → Sat)
    const start = new Date(first); start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    const end = new Date(last); end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));

    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const frag = document.createDocumentFragment();
    let col = 0, cur = new Date(start), lastMonth = -1;

    while (cur <= end) {
      // month label sits in the header row above the week where a new month starts
      if (cur.getUTCDate() <= 7 && cur.getUTCMonth() !== lastMonth) {
        const lbl = document.createElement("span");
        lbl.className = "hm-month";
        lbl.textContent = MONTHS[cur.getUTCMonth()];
        lbl.style.gridColumn = col + 1; // 1-indexed CSS grid column
        frag.appendChild(lbl);
        lastMonth = cur.getUTCMonth();
      }
      for (let row = 0; row < 7; row++) {
        const key = iso(cur);
        const rec = byDate.get(key);
        const cell = document.createElement("span");
        cell.className = "cell";
        cell.style.gridRow = row + 2;   // row 1 is reserved for month labels
        cell.style.gridColumn = col + 1;
        if (cur < first || cur > last) {
          cell.classList.add("empty");
        } else {
          const level = rec ? rec.level : 0;
          const count = rec ? rec.count : 0;
          cell.dataset.level = level;
          cell.dataset.count = count;
          cell.dataset.date = key;
          // anime.js drives the reveal when active; otherwise use the CSS keyframe
          if (!reduceMotion && !window.__ANIME_REVEALS__) cell.style.animationDelay = Math.min(col * 14, 900) + "ms";
        }
        frag.appendChild(cell);
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
      col++;
    }
    host.innerHTML = "";
    host.appendChild(frag);
    attachHeatmapTooltips(host);
    document.dispatchEvent(new CustomEvent("portfolio:heatmap", { detail: { host, cols: col } }));
  }

  function attachHeatmapTooltips(host) {
    const tip = $("#tooltip");
    if (!tip) return;
    const fmt = (s) => new Date(s + "T00:00:00Z").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    host.addEventListener("mouseover", (e) => {
      const c = e.target.closest(".cell");
      if (!c || c.classList.contains("empty")) return;
      const n = +c.dataset.count;
      tip.textContent = `${n === 0 ? "No" : n} contribution${n === 1 ? "" : "s"} · ${fmt(c.dataset.date)}`;
      const r = c.getBoundingClientRect();
      tip.style.left = r.left + r.width / 2 + "px";
      tip.style.top = r.top - 8 + "px";
      tip.classList.add("show");
    });
    host.addEventListener("mouseout", () => tip.classList.remove("show"));
  }

  /* ---- Projects ---------------------------------------------------------- */
  async function loadProjects() {
    const grid = $("#projectsGrid");
    if (!grid) return;
    const P = CFG.projects || {};
    try {
      const repos = await getJSON(
        `https://api.github.com/users/${USER}/repos?sort=updated&per_page=100`,
        `gh_repos_${USER}`
      );
      const excl = new Set((P.excludeRepos || []).map((s) => s.toLowerCase()));
      let list = repos.filter((r) => {
        if (P.excludeForks && r.fork) return false;
        if (excl.has(r.name.toLowerCase())) return false;
        return true;
      });

      // pinned first, then by pushed date
      const pinned = (P.pinned || []).map((s) => s.toLowerCase());
      list.sort((a, b) => {
        const pa = pinned.indexOf(a.name.toLowerCase());
        const pb = pinned.indexOf(b.name.toLowerCase());
        if (pa !== -1 || pb !== -1) return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
        return new Date(b.pushed_at) - new Date(a.pushed_at);
      });

      if (!list.length) { grid.innerHTML = `<p style="color:var(--text-faint)">No public repositories to show yet.</p>`; return; }

      const max = P.maxShown || 6;
      renderProjects(grid, list.slice(0, max));

      const btn = $("#showMoreBtn");
      if (btn && list.length > max) {
        btn.hidden = false;
        btn.addEventListener("click", () => {
          renderProjects(grid, list);
          btn.hidden = true;
        }, { once: true });
      }
    } catch (e) {
      console.warn("projects load failed", e);
      grid.innerHTML = `<p style="color:var(--text-faint)">Couldn't load projects live (GitHub API limit?).
        <a href="https://github.com/${USER}?tab=repositories" target="_blank" rel="noopener" style="color:var(--cyan)">Browse them on GitHub ↗</a></p>`;
    }
  }

  function renderProjects(grid, repos) {
    grid.innerHTML = repos.map((r) => {
      const desc = r.description ? escapeHtml(r.description) : "No description provided.";
      const lang = r.language
        ? `<span class="lang"><span class="lang-dot" style="background:${langColor(r.language)}"></span>${r.language}</span>` : "";
      const stars = r.stargazers_count ? `<span class="m-item">★ ${r.stargazers_count}</span>` : "";
      const forks = r.forks_count ? `<span class="m-item">⑂ ${r.forks_count}</span>` : "";
      const home = r.homepage
        ? `<a href="${r.homepage}" target="_blank" rel="noopener" title="Live site" aria-label="Live site">↗</a>` : "";
      return `
      <article class="project-card reveal" tabindex="0">
        <div class="pc-top">
          <span class="pc-icon">{ }</span>
          <span class="pc-links">
            ${home}
            <a href="${r.html_url}" target="_blank" rel="noopener" title="Source code" aria-label="Source code">&lt;/&gt;</a>
          </span>
        </div>
        <h3 class="project-name">${escapeHtml(r.name)}</h3>
        <p class="project-desc">${desc}</p>
        <div class="project-meta">${lang}${stars}${forks}
          <span class="m-item">updated ${timeAgo(r.pushed_at)}</span>
        </div>
      </article>`;
    }).join("");
    observeReveals(grid);
    attachCardTilt(grid);
    document.dispatchEvent(new CustomEvent("portfolio:projects", { detail: { grid } }));
  }

  function attachCardTilt(grid) {
    $$(".project-card", grid).forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---- helpers ----------------------------------------------------------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function timeAgo(iso) {
    const d = (Date.now() - new Date(iso)) / 1000;
    const map = [[31536000, "y"], [2592000, "mo"], [604800, "w"], [86400, "d"], [3600, "h"], [60, "m"]];
    for (const [s, u] of map) if (d >= s) return `${Math.floor(d / s)}${u} ago`;
    return "just now";
  }
  function animateStat(el, target) {
    if (!el) return;
    target = +target || 0;
    if (reduceMotion) { el.textContent = target.toLocaleString(); return; }
    const dur = 1100, t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // GitHub linguist-ish colors for common languages
  const LANG_COLORS = {
    JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", Kotlin: "#A97BFF",
    Java: "#b07219", "C++": "#f34b7d", C: "#555555", "C#": "#178600", Go: "#00ADD8",
    Rust: "#dea584", Ruby: "#701516", PHP: "#4F5D95", Swift: "#F05138", Dart: "#00B4AB",
    HTML: "#e34c26", CSS: "#563d7c", SCSS: "#c6538c", Shell: "#89e051", HCL: "#844FBA",
    Vue: "#41b883", Svelte: "#ff3e00", Dockerfile: "#384d54", "Jupyter Notebook": "#DA5B0B",
    Makefile: "#427819", Lua: "#000080", "Objective-C": "#438eff", Terraform: "#844FBA",
    React: "#61dafb", "Node.js": "#539e43", Linux: "#fcc624", Git: "#f05032",
    Docker: "#2496ed", "Android SDK": "#3ddc84", "Jetpack Compose": "#3ddc84",
    "GitHub Actions": "#2088FF",
  };
  function langColor(l) { return LANG_COLORS[l] || "#7c5cff"; }

  /* ---- interactions: cursor, scroll, nav, reveals ------------------------ */
  function initInteractions() {
    // cursor glow
    const glow = $(".cursor-glow");
    if (glow && !reduceMotion && matchMedia("(pointer:fine)").matches) {
      let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
      addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; glow.style.opacity = "1"; });
      (function loop() {
        gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
        glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%,-50%)`;
        requestAnimationFrame(loop);
      })();
    }

    // scroll progress + nav state
    const nav = $("#nav"), prog = $(".scroll-progress");
    const onScroll = () => {
      const y = scrollY;
      nav.classList.toggle("scrolled", y > 20);
      const h = document.documentElement.scrollHeight - innerHeight;
      if (prog) prog.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // mobile menu
    const toggle = $("#navToggle"), links = $("#navLinks");
    if (toggle && links) {
      toggle.addEventListener("click", () => {
        const open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      $$("a", links).forEach((a) => a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }));
    }

    // active section highlight
    const secs = $$("main section[id]");
    const navMap = new Map($$(".nav-links a").map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          navMap.forEach((a) => a.classList.remove("active"));
          const a = navMap.get(en.target.id);
          if (a) a.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach((s) => spy.observe(s));
  }

  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); obs.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  function observeReveals(root = document) {
    if (window.__ANIME_REVEALS__) return; // anime.js owns reveals when active
    $$(".reveal:not(.in)", root).forEach((el, i) => {
      if (!el.style.transitionDelay && i % 3 && !reduceMotion) el.classList.add("d" + (i % 3));
      revealObserver.observe(el);
    });
  }

  /* ---- boot -------------------------------------------------------------- */
  function init() {
    applyConfig();
    renderAbout();
    renderSkills();
    renderContact();
    initInteractions();
    observeReveals();
    loadProfile();
    loadHeatmap();
    loadProjects();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
