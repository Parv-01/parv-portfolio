# Parv Agarwal — Portfolio

My personal site. Research at the intersection of classical machine learning,
quantum computing and neuromorphic systems.

Live at [parvagarwal.is-a.dev](https://parvagarwal.is-a.dev) (and on Netlify
during staging).

## Stack

- **React 18 + TypeScript** for the application layer
- **Vite 6** as the bundler and dev server
- **React Router 7** for client-side routing
- **Tailwind CSS 4** with custom CSS variables for theming
- **Three.js + @react-three/fiber + drei** for the astronaut model and starfield
- **anime.js** for micro-interactions (boot loader, counters, scroll reveals)
- **Motion (Framer)** for page-level transitions
- **MDX** for blog posts with frontmatter

## Features

- Animated GLB astronaut mascot framed differently on every page
- Cosmic 3D starfield + aurora gradient backdrop
- Light and dark themes with a toggle, persisted in localStorage
- Custom typography pairing — Fraunces (display), Inter (body), JetBrains Mono (code)
- Command palette (⌘K / Ctrl+K / `/`) for fast navigation and actions
- Boot-loader sequence on first session visit
- MDX blog with reading progress, tag filtering and cross-post links
- 8085 microprocessor toy simulator on /playground
- Mouse-following spotlight and magnetic CTAs
- Reduced-motion support throughout

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # preview the production build
npm run typecheck
```

## Adding a blog post

Drop a new `.mdx` file into `src/content/blog/` with frontmatter:

```mdx
---
title: "Post title"
excerpt: "One-sentence summary."
date: "2026-05-15"
readTime: "8 min"
tags: ["NLP", "Research"]
featured: false
---

Body content goes here. Standard Markdown plus MDX features.
```

Vite picks it up automatically — no manual index step needed.

## Project layout

```
src/
  app/
    components/    UI primitives (cards, layout, system widgets)
    pages/         Route components
    theme/         Theme provider and hook
    routes.ts      React Router config
  audio/           Web Audio singleton (ambient + click)
  content/         Projects, timeline, MDX blog posts
  lib/             Small helpers (lazy anime.js loader)
  styles/          Global CSS with light/dark themes
  three/           R3F canvas, starfield and mascot viewport
  main.tsx         Entry point
```

## Deployment

`netlify.toml` and `public/_redirects` ship in the repo so a fresh Netlify site
auto-detects everything. Push to GitHub, connect the repo on Netlify and it
builds with `npm run build` and publishes `dist/`.

## License

MIT — see [LICENSE](./LICENSE).
