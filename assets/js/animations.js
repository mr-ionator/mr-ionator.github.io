/* ============================================================================
   animations.js — anime.js-powered motion layer
   Additive & guarded: if anime.js is missing, reduced-motion is on, or anything
   throws, the site falls back to the plain CSS reveals (see the inline failsafe
   in index.html). main.js yields reveal duties to us via window.__ANIME_REVEALS__.
   ========================================================================== */
(() => {
  "use strict";
  const anime = window.anime;
  const CFG = window.PORTFOLIO_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const ANIME_OK = !!anime && !reduceMotion;

  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.top < innerHeight * 0.88 && r.bottom > 0;
  };
  const clearTransforms = (els) => els.forEach((t) => (t.style.transform = ""));

  /* ---- failsafe: never leave content hidden ------------------------------ */
  function showAll() {
    const de = document.documentElement;
    de.classList.remove("anime-on");
    window.__ANIME_REVEALS__ = false;
    $$(".reveal").forEach((el) => { el.classList.add("in"); el.style.opacity = ""; el.style.transform = ""; });
    $$(".cell:not(.empty)").forEach((c) => (c.style.opacity = "1"));
    $$(".hero-inner *").forEach((el) => { el.style.opacity = ""; el.style.transform = ""; });
  }

  /* ---- IntersectionObserver-driven reveals ------------------------------- */
  const customReveal = new WeakMap();
  let io;
  function reveal(el, fn) {
    if (!el) return;
    if (inView(el)) fn(el);
    else { customReveal.set(el, fn); io.observe(el); }
  }
  function onIntersect(entries) {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const fn = customReveal.get(en.target);
      customReveal.delete(en.target);
      (fn || defaultFade)(en.target);
    });
  }

  function defaultFade(el) {
    anime({
      targets: el, opacity: [0, 1], translateY: [36, 0],
      duration: 850, easing: "easeOutExpo",
      complete: () => (el.style.transform = ""),
    });
  }

  function staggerGroup(container, childSel) {
    container.style.opacity = "1";
    const kids = $$(childSel, container);
    kids.forEach((k) => (k.style.opacity = "0"));
    anime({
      targets: kids, opacity: [0, 1], translateY: [46, 0], scale: [0.94, 1],
      delay: anime.stagger(85), duration: 780, easing: "easeOutExpo",
      complete: () => clearTransforms(kids),
    });
  }

  /* ---- section headings: split-letter reveal ----------------------------- */
  function splitChars(el) {
    if (!el || el.dataset.split) return;
    el.dataset.split = "1";
    const text = el.textContent;
    el.textContent = "";
    for (const ch of text) {
      const s = document.createElement("span");
      s.className = "char";
      s.textContent = ch === " " ? " " : ch;
      el.appendChild(s);
    }
  }
  function prepSectionHead(el) {
    const title = $(".section-title", el);
    splitChars(title);
    const idx = $(".section-index", el), note = $(".section-note", el);
    if (idx) idx.style.opacity = "0";
    if (note) note.style.opacity = "0";
    $$(".char", title).forEach((c) => (c.style.opacity = "0"));
  }
  function revealSectionHead(el) {
    el.style.opacity = "1"; el.style.transform = "none";
    const title = $(".section-title", el), idx = $(".section-index", el), note = $(".section-note", el);
    const tl = anime.timeline({ easing: "easeOutExpo" });
    if (idx) tl.add({ targets: idx, opacity: [0, 1], translateX: [-14, 0], duration: 520 });
    if (title) tl.add({
      targets: $$(".char", title), opacity: [0, 1], translateY: [34, 0], rotateZ: [8, 0],
      delay: anime.stagger(22), duration: 640,
      complete: () => clearTransforms($$(".char", title)),
    }, "-=340");
    if (note) tl.add({ targets: note, opacity: [0, 1], duration: 480 }, "-=280");
  }

  /* ---- hero intro timeline ----------------------------------------------- */
  function splitHeroName() {
    const el = $(".hero-namestring");
    if (!el || el.dataset.split) return;
    el.dataset.split = "1";
    const text = el.textContent;
    el.textContent = "";
    for (const ch of text) {
      const s = document.createElement("span");
      s.className = "char";
      s.textContent = ch === " " ? " " : ch;
      el.appendChild(s);
    }
  }
  function heroIntro() {
    const tl = anime.timeline({ easing: "easeOutExpo", duration: 850 });
    tl.add({ targets: ".hero-eyebrow", opacity: [0, 1], translateY: [14, 0], scale: [0.9, 1], duration: 650 })
      .add({ targets: ".hero-greeting", opacity: [0, 1], translateY: [22, 0], duration: 600 }, "-=420")
      .add({
        targets: ".hero-namestring .char",
        opacity: [0, 1], translateY: [70, 0], rotateX: [-90, 0], scale: [0.7, 1],
        delay: anime.stagger(42), duration: 1000, easing: "easeOutBack",
        complete: () => clearTransforms($$(".hero-namestring .char")),
      }, "-=250")
      .add({ targets: ".hero-role", opacity: [0, 1], translateY: [22, 0] }, "-=520")
      .add({ targets: ".hero-tagline", opacity: [0, 1], translateY: [22, 0] }, "-=640")
      .add({
        targets: ".hero-cta .btn", opacity: [0, 1], translateY: [26, 0], scale: [0.88, 1],
        delay: anime.stagger(110), duration: 700,
        complete: () => clearTransforms($$(".hero-cta .btn")),
      }, "-=560")
      .add({
        targets: ".hero-stats .stat", opacity: [0, 1], translateY: [22, 0],
        delay: anime.stagger(90), duration: 700,
        complete: () => clearTransforms($$(".hero-stats .stat")),
      }, "-=520")
      .add({ targets: ".scroll-hint", opacity: [0, 0.6], duration: 500 }, "-=350");
    tl.finished.then(roleRotator).catch(() => {});
  }

  /* ---- rotating role with scramble --------------------------------------- */
  function roleRotator() {
    const el = $(".hero-role");
    const roles = (Array.isArray(CFG.roles) && CFG.roles.length ? CFG.roles : [CFG.role || "Developer"]).slice();
    if (!el || roles.length < 2) return;
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*/{}[]_=+:.";
    let idx = 0;
    const scrambleTo = (text) => {
      const from = el.textContent;
      const len = Math.max(from.length, text.length);
      const queue = [];
      for (let i = 0; i < len; i++) {
        const start = Math.floor(Math.random() * 12);
        const end = start + 8 + Math.floor(Math.random() * 12);
        queue.push({ to: text[i] || "", start, end, ch: "" });
      }
      let frame = 0;
      const tick = () => {
        let out = "", done = 0;
        for (const q of queue) {
          if (frame >= q.end) { done++; out += q.to; }
          else if (frame >= q.start) {
            if (!q.ch || Math.random() < 0.3) q.ch = glyphs[(Math.random() * glyphs.length) | 0];
            out += `<span class="scramble">${q.ch}</span>`;
          }
        }
        el.innerHTML = out;
        if (done === queue.length) { el.textContent = text; return; }
        frame++; requestAnimationFrame(tick);
      };
      tick();
    };
    setInterval(() => { idx = (idx + 1) % roles.length; scrambleTo(roles[idx]); }, 3400);
  }

  /* ---- heatmap radial ripple reveal -------------------------------------- */
  function setupHeatmapReveal() {
    document.addEventListener("portfolio:heatmap", (e) => {
      try {
        const host = e.detail.host, cols = e.detail.cols || 53;
        const cells = $$(".cell:not(.empty)", host);
        if (!cells.length) return;
        const wave = () => anime({
          targets: cells, opacity: [0, 1], scale: [0.2, 1], duration: 520, easing: "easeOutQuad",
          // targets are column-major (7 per week) → grid is [7 days, N weeks]
          delay: anime.stagger(7, { grid: [7, cols], from: "center" }),
        });
        reveal(host, wave);
      } catch (err) {
        $$(".cell:not(.empty)").forEach((c) => (c.style.opacity = "1"));
      }
    });
  }

  /* ---- dynamic project cards --------------------------------------------- */
  function setupProjects() {
    document.addEventListener("portfolio:projects", (e) => {
      const grid = e.detail.grid;
      $$(".project-card", grid).forEach((k) => k.setAttribute("data-seen", ""));
      reveal(grid, (el) => staggerGroup(el, ".project-card"));
    });
  }

  /* ---- initial scroll-reveal wiring -------------------------------------- */
  function setupScrollReveals() {
    io = new IntersectionObserver(onIntersect, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    $$(".reveal").forEach((el) => {
      if (el.closest(".hero")) return;                       // hero handled by intro
      if (el.matches(".project-card, .skill-group")) { el.setAttribute("data-seen", ""); return; } // grouped
      if (el.matches(".section-head")) { prepSectionHead(el); reveal(el, revealSectionHead); return; }
      reveal(el, defaultFade);
    });
    const sw = $("#skillsWrap");
    if (sw) reveal(sw, (el) => staggerGroup(el, ".skill-group"));
  }

  /* ---- custom cursor ring ------------------------------------------------ */
  function customCursor() {
    if (!finePointer) return;
    const ring = document.createElement("div");
    ring.className = "cursor-ring"; ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(ring);
    let rx = innerWidth / 2, ry = innerHeight / 2, tx = rx, ty = ry;
    addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; ring.style.opacity = "1"; }, { passive: true });
    (function loop() {
      rx += (tx - rx) * 0.2; ry += (ty - ry) * 0.2;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
    const hot = "a, button, .chip, .project-card, .social-link, .contact-email";
    document.addEventListener("mouseover", (e) => { if (e.target.closest(hot)) ring.classList.add("grow"); });
    document.addEventListener("mouseout", (e) => { if (e.target.closest(hot)) ring.classList.remove("grow"); });
  }

  /* ---- magnetic buttons -------------------------------------------------- */
  function magnetic() {
    if (!finePointer) return;
    $$(".btn, .social-link").forEach((el) => {
      const k = el.classList.contains("btn") ? 0.34 : 0.24;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * k}px, ${(e.clientY - (r.top + r.height / 2)) * k}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }

  /* ---- particle constellation -------------------------------------------- */
  function particles() {
    const canvas = document.createElement("canvas");
    canvas.className = "particles-canvas"; canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    let w, h, dpr, pts, running = true;
    const mouse = { x: -9999, y: -9999 };
    const count = () => Math.min(88, Math.max(28, Math.floor(innerWidth / 16)));
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.width = innerWidth * dpr; h = canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + "px"; canvas.style.height = innerHeight + "px";
    };
    const seed = () => {
      pts = [];
      for (let i = 0, n = count(); i < n; i++)
        pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.28 * dpr, vy: (Math.random() - 0.5) * 0.28 * dpr });
    };
    resize(); seed();
    addEventListener("resize", () => { resize(); seed(); }, { passive: true });
    addEventListener("mousemove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });
    addEventListener("mouseout", () => { mouse.x = mouse.y = -9999; });
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) requestAnimationFrame(draw);
    });
    const LINK = 118;
    function draw() {
      if (!running) return;
      const link = LINK * dpr;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const mdx = mouse.x - p.x, mdy = mouse.y - p.y, md = Math.hypot(mdx, mdy);
        if (md < 170 * dpr) { p.x += mdx * 0.008; p.y += mdy * 0.008; }
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.4 * dpr, 0, 6.2832);
        ctx.fillStyle = "rgba(124,92,255,0.85)"; ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
          if (d < link) {
            ctx.strokeStyle = `rgba(130,150,255,${(1 - d / link) * 0.5})`;
            ctx.lineWidth = 0.6 * dpr;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        if (md < link * 1.5) {
          ctx.strokeStyle = `rgba(34,211,238,${(1 - md / (link * 1.5)) * 0.55})`;
          ctx.lineWidth = 0.8 * dpr;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---- boot -------------------------------------------------------------- */
  function boot() {
    if (!ANIME_OK) { window.__ANIM_READY__ = true; return; } // CSS reveals handle it
    try {
      setupScrollReveals();
      setupHeatmapReveal();
      setupProjects();
      splitHeroName();
      heroIntro();
      customCursor();
      magnetic();
      particles();
    } catch (e) {
      console.warn("animations failed — revealing content", e);
      showAll();
    } finally {
      window.__ANIM_READY__ = true;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
