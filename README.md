# mr-ionator — Personal Portfolio

A fast, dependency-free personal portfolio with a **live GitHub contribution heatmap**
and a **live project list**. Both pull straight from GitHub on every page load, so the
site stays up to date automatically — push a commit and a green square appears; create a
repo and it shows up as a project card. No build step, no server.

**Live:** https://mr-ionator.github.io

## Stack
- Plain HTML + CSS + JavaScript (no framework, no build)
- Motion: [anime.js](https://animejs.com) v3 (vendored locally in `assets/js/vendor/`, no CDN)
  driving the hero assembly, letter-split section titles, a radial ripple reveal on the
  heatmap, scroll choreography, magnetic buttons and a custom cursor — plus a hand-rolled
  interactive particle-constellation canvas. All in [`assets/js/animations.js`](assets/js/animations.js).
  Everything degrades gracefully: if anime.js or JS fails, or the visitor prefers reduced
  motion, the plain content still shows.
- Live data:
  - Contribution heatmap → [github-contributions-api](https://github-contributions-api.jogruber.de) (public, no token)
  - Profile + projects → GitHub REST API (public, no token)
- Hosted on **GitHub Pages** — every push to `main` redeploys automatically

## Personalize it
Everything editable lives in one file: [`assets/js/config.js`](assets/js/config.js).

Change your name, role, tagline, about text, skills, and social links there, then:

```bash
git add -A
git commit -m "Update portfolio content"
git push
```

GitHub Pages rebuilds in ~30–60 seconds. Key fields to update first:
- `name` — currently set to your handle; change to your real display name
- `role`, `tagline`, `about`
- `roles` — the list of titles that cycle with the scramble effect under your name
- `socials.linkedin` / `socials.twitter` / `socials.website` — fill in to show those links
- `email` — shown publicly on the Contact section (clear it to hide)
- `projects.pinned` — repo names to feature at the top

## Local preview
No build needed — just serve the folder:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Notes
- The unauthenticated GitHub API allows 60 requests/hour per visitor IP; results are
  cached in `localStorage` for 30 minutes to stay well under that.
- Fully responsive, dark-themed, and respects `prefers-reduced-motion`.
