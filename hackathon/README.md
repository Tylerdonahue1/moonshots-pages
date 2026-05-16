# Build with Gemini XPRIZE — `/hackathon`

The marketing landing page for the Build with Gemini XPRIZE hackathon. Lives at
[media.moonshots.com/hackathon](https://media.moonshots.com/hackathon).

## Files

| File | What it is |
|---|---|
| `index.html` | Page shell — meta tags, CSS (all inline), React/ReactDOM script tags, lazy Three.js loader, cookie banner |
| `sections.jsx` | **Source** — React components for Nav, Hero, Demo, Categories, GoogleStack, Prize, FAQ, CTA, Footer |
| `app.jsx` | **Source** — App entrypoint, calls `ReactDOM.createRoot(...).render(<App />)` |
| `sections.js`, `app.js` | **Generated** — precompiled JSX, served to users (no Babel needed) |
| `build.mjs` | esbuild compile script |
| `package.json` | Local dev deps (esbuild only) — Vercel doesn't run this |
| `assets/wordmark-white.svg` | Nav + footer wordmark — "Build with ♦ Gemini · XPRIZE" |
| `assets/wordmark-black.svg` | Same on light surfaces (unused currently) |
| `assets/lockup-white.svg` | Hero co-presenter lockup with Google branding |
| `assets/lockup-black.svg` | Lockup on light surfaces |
| `assets/xprize-mark.png` | Favicon + apple-touch-icon |
| `assets/og-image.png` | 1200×630 social-share preview |

## Edit / build / deploy workflow

```bash
cd hackathon
# Edit sections.jsx or app.jsx
npm install            # one-time, installs esbuild
npm run compile        # regenerates sections.js + app.js
# Commit BOTH the .jsx source AND the .js output, then git push
```

Vercel auto-deploys on push to `main` and serves static files. **There is no Vercel
build step** — the `.js` files are precompiled and committed.

## Cache busting

When you change `sections.js` / `app.js`, also bump the `?v=YYYYMMDDx` query string in
`index.html`'s script tags so iOS Safari + CDN edges pick up the new files. Convention:
`?v=20260515a`, `?v=20260515b`, etc.

## Known gotchas (read before changing layout)

### Don't add `<base href="/hackathon/">`
Vercel's `cleanUrls + trailingSlash:false` serves this page at `/hackathon` (no slash).
A `<base href="/hackathon/">` would resolve relative hashes like `#categories` to
`/hackathon/#categories` — a *different* URL than the current page. Click → browser
navigates → Vercel redirects back, losing the scroll-to-anchor. **Always use absolute
`/hackathon/...` paths** for assets and scripts.

### Smooth scroll doesn't work — use instant
This page triggers a Chrome bug where all smooth-scroll APIs silently fail and leave
`scrollY` at 0. Likely caused by the Aurora WebGL canvas + body overflow:clip + the
document scrollHeight (~12,000px). The nav uses a JS click delegate that calls
`scrollIntoView({behavior: "instant"})`, which works reliably. CSS `scroll-behavior:
smooth` was removed.

If you ever try to re-enable smooth scroll, expect to re-debug — the symptom is
"hash changes but scrollY stays at 0".

### `body { overflow-x: clip }` (not `hidden`)
Mobile safety to prevent horizontal scroll. `clip` (not `hidden`) is required because
`overflow-x: hidden` on body creates a scroll container that breaks anchor-link scroll
in some Chrome configurations.

### Mobile hero — `.hero-overlay` switches from absolute to static
On desktop the hero overlay is `position: absolute; inset: 0` and flex-centered. On
mobile (≤720px) it switches to `position: static` with `padding: 88px 0 56px` so
content flows naturally and the hero grows past 100vh as needed. The Aurora canvas
behind it continues to absolutely fill the hero.

### Lockup SVG has a faint artifact on the right
The official `lockup-white.svg` has a faint vertical line in the embedded raster
pattern at its right edge. Hidden via `clip-path: inset(0 1.5% 0 0)` in CSS. If a
new lockup variant is dropped in, recheck whether the clip is still needed.

## Performance baseline

- **Cold transfer:** ~1.5 MB / 11 requests (1.24 MB is Three.js, lazy-loaded after FCP)
- **FCP (desktop):** ~440 ms
- **No render-blocking JS** — React/ReactDOM use `defer`, Three.js loads via
  `requestIdleCallback` after first paint

## Tagging conventions

Sections that need to be navigable from the sticky nav must have a matching `id`:

| Nav label | ID | Component |
|---|---|---|
| Categories | `#categories` | `<Categories />` |
| Tools | `#google-stack` | `<GoogleStack />` |
| About | `#about-xprize` | `<AboutXPRIZE />` |
| Prize & dates | `#prize` | `<Prize />` |
| FAQ | `#faq` | `<Faq />` |
| (logo) | `#top` | `<header className="hero-shell" id="top">` |
| (final CTA "See the prize") | `#prize` | `<Prize />` |

Any section anchor relies on the global `section[id], header[id] { scroll-margin-top:
80px; }` rule so the section header isn't hidden under the 68px sticky nav.

## Cookie banner

Shows on first visit. User choice (`"accepted"` or `"declined"`) is stored in
`localStorage` under key `mxs_cookie_consent_v1`. Banner is inline HTML + JS at the
end of `<body>`, not a React component — works the same on the rules page.
