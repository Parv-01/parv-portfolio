# Project Flow and File Map

## 1. Boot and Entry

`index.html`
- Sets the document shell.
- Preloads fonts and sets the initial theme on `document.documentElement`.
- Mounts the app through `#root`.

`src/main.tsx`
- React entry point.
- Wraps the app in `ThemeProvider`.
- Mounts `RouterProvider` with the app router.

`src/app/routes.ts`
- Declares all routes.
- Uses `Layout` as the shared shell.
- Pages: Home, About, Projects, Blog, BlogPost, Playground, Contact, NotFound.

## 2. Global Shell

`src/app/components/layout/Layout.tsx`
- Main page shell for every route.
- Renders:
  - `BootLoader`
  - `CelestialBackground`
  - `GlobalCanvas`
  - `Vignette`
  - `Header`
  - page `Outlet`
  - `Footer`
  - `CmdKPalette`
- Also controls:
  - scroll reset on route change
  - ambient audio level by route
  - audio unlock on first user interaction

`src/app/components/layout/Header.tsx`
- Top navigation bar.
- Handles desktop nav, mobile menu, audio toggle, and command palette shortcut.

`src/app/components/layout/Footer.tsx`
- Bottom site links and socials.

`src/app/components/system/BootLoader.tsx`
- First-visit boot overlay.
- Uses `anime.js`.

`src/app/components/system/CmdKPalette.tsx`
- Global command palette.
- Navigation and quick actions.

`src/app/components/system/ReadingProgress.tsx`
- Blog reading progress bar.

## 3. Theme System

`src/app/theme/ThemeProvider.tsx`
- Stores `light` / `dark` theme in context.
- Syncs theme to `data-theme` on `<html>`.
- Persists theme in `localStorage`.

`src/styles/theme.css`
- Defines the entire design system via CSS variables.
- Dark theme is the default.
- Light theme overrides all palette values.
- Also contains shared utilities:
  - glass styles
  - aurora backdrop
  - spotlight effect
  - grain/noise layer
  - border animation
  - progress bar styles

## 4. 3D Scene

`src/three/GlobalCanvas.tsx`
- Fixed full-screen 3D canvas behind the app content.
- Renders the shared starfield.
- Moves the camera slightly with the mouse.
- Now selects star color based on current theme.

`src/three/Starfield.tsx`
- Generates random star points.
- Animates slow rotation and subtle pulsing.
- Accepts `color`, `opacity`, `size`, `blending`.

`src/three/MascotViewport.tsx`
- Renders the astronaut mascot inside a 3D canvas.
- Loads `/public/models/standing.glb`.
- Clones the GLB rig safely with `SkeletonUtils`.
- Plays the built-in GLB animation.
- Makes the mascot drift, rotate, and follow the cursor.

## 5. Mascot Position and View Control

The mascot view is controlled in two places:

1. `src/three/MascotViewport.tsx`
- Default pose is defined in `DEFAULT_POSE`.
- Important props:
  - `position`: moves the mascot group.
  - `rotationY`: turns the mascot left/right.
  - `cameraZ`: zooms the camera in/out.
  - `cameraY`: raises/lowers the camera.
  - `fov`: changes perspective.
  - `fit`: scales the mascot to fit the viewport.
  - `followCursor`: enables mouse-follow motion.
  - `animationSpeed`: changes the GLB animation speed.

2. Page usage sites
- `src/app/pages/Home.tsx`
- `src/app/components/layout/PageHero.tsx`
- `src/app/pages/About.tsx`
- `src/app/pages/Projects.tsx`
- `src/app/pages/Blog.tsx`
- `src/app/pages/Contact.tsx`

Examples:
- Home uses `<MascotViewport rotationY={-0.25} cameraZ={4.2} fov={38} fit={2.4} />`.
- `PageHero` accepts `mascotPose` and passes it to `MascotViewport`.

If you want to change mascot placement:
- For global behavior, edit `src/three/MascotViewport.tsx`.
- For a specific page, edit that page’s `mascotPose` values or the Home page `<MascotViewport />` props.

## 6. Pages and Their Work

`src/app/pages/Home.tsx`
- Landing page.
- Intro copy, role cycler, mascot, featured projects, stats, terminal panels.

`src/app/pages/About.tsx`
- Biography, timeline, skills.

`src/app/pages/Projects.tsx`
- Filters and searches project cards.

`src/app/pages/Blog.tsx`
- Lists MDX posts.
- Tag filtering.
- Side stats and external writing links.

`src/app/pages/BlogPost.tsx`
- Loads one MDX post by slug.
- Renders article body and reading progress.

`src/app/pages/Contact.tsx`
- Contact form and profile links.

`src/app/pages/Playground.tsx`
- 8085 toy simulator.
- Step/run/reset controls.

`src/app/pages/NotFound.tsx`
- 404 fallback.

## 7. Content Layer

`src/content/projects.ts`
- Static project data used by Home and Projects.

`src/content/timeline.ts`
- Static timeline used by About.

`src/content/blog/index.ts`
- Auto-loads all `.mdx` blog posts with `import.meta.glob`.
- Exposes `loadPosts()` and `findPost()`.

`src/content/blog/*.mdx`
- Actual blog article bodies.

## 8. Utility Layer

`src/lib/anime.ts`
- Lazy loader for `anime.js`.
- Used by boot loader and reveal animations.

`src/audio/AudioManager.ts`
- Web Audio singleton.
- Loads:
  - `/audio/ambient.mp3`
  - `/audio/click.mp3`
- Handles:
  - ambient loop
  - click sound
  - mute state
  - theme/route audio levels

## 9. Click Sound Flow

Why it was missing before:
- The click sound existed in `AudioManager`, but it was not consistently triggered.

Current flow:
- `Layout` unlocks audio after the first user gesture.
- A global click listener in `Layout` plays click audio for common interactive targets:
  - `button`
  - `a`
  - `[role="button"]`
  - `[data-click-sound]`

Where to tweak it:
- `src/app/components/layout/Layout.tsx`
- `src/audio/AudioManager.ts`

If you want stronger or softer clicks:
- Edit `g.gain.value` in `playClick()`.
- Edit the path `CLICK_URL` if you replace the file.

## 10. Starry White Background Fix

Why stars were weak on white background:
- The old star color was tuned for dark mode.
- Light background needed a darker star tone and different blending.

What now controls it:
- `src/three/GlobalCanvas.tsx`
  - chooses star color from theme
  - switches blending mode
  - adjusts opacity and size
- `src/three/Starfield.tsx`
  - receives `color`, `opacity`, `size`, `blending`

Current light-theme tuning:
- `color`: `#6B7280`
- `opacity`: `0.7`
- `size`: `0.045`
- `blending`: `THREE.NormalBlending`

Where to tweak for stronger white-bg stars:
- `src/three/GlobalCanvas.tsx`
  - change the light-theme `starColor`
  - change `opacity`
  - change `size`
  - change `blending`
- `src/styles/theme.css`
  - if the white theme background is too bright, slightly darken `--bg-base` or `--bg-elevated`

Recommended star settings for white background:
- Use a darker gray star color.
- Keep `NormalBlending` instead of additive blending.
- Reduce size a bit so the field looks natural.

## 11. Public Assets

`public/models/standing.glb`
- Mascot model.

`public/audio/click.mp3`
- UI click sound.

`public/audio/ambient.mp3`
- Background ambient audio.

`public/images/og.png`, `public/images/og.svg`
- Social preview assets.

`public/resume/parv-agarwal-resume.pdf`
- Downloadable resume.

## 12. Build and Tooling

`vite.config.ts`
- Vite config.
- Adds alias `@ -> src`.
- Enables MDX, Tailwind, React.

`package.json`
- Scripts:
  - `npm run dev`
  - `npm run build`
  - `npm run preview`
  - `npm run typecheck`

## 13. Quick Edit Guide

- Mascot pose on a page: edit that page’s `mascotPose` or `MascotViewport` props.
- Mascot global motion: edit `src/three/MascotViewport.tsx`.
- White-background stars: edit `src/three/GlobalCanvas.tsx` first.
- Star geometry/animation: edit `src/three/Starfield.tsx`.
- Click sound: edit `src/audio/AudioManager.ts` or the global click hook in `Layout`.
- Theme colors: edit `src/styles/theme.css`.
