# Design: slidev-laser-pointer addon

## Intent
Stock Slidev's laser is a 6px red dot with red glows, hard-coded in scoped CSS
(`LaserPointer.vue`). Red is a poor choice for red-green colorblind viewers, and
6px (in slide coordinates, so it shrinks with the canvas scale) is small. Authors
(and later speakers) should be able to change color and size.

## Goals
- Author sets color and size in headmatter.
- Colorblind-safe named presets (Okabe-Ito), plus any raw CSS color.
- Audience clients render the same values (each client draws its own dot).
- Zero change in look when unconfigured.
- Structure so a later speaker UI only swaps the value source.

## Non-goals (v1)
- Speaker UI / runtime changes / syncing a speaker's choice to viewers.
- Custom shapes, trails, animations.
- Replacing Slidev's laser logic or cursor sync.

## Anti-goals
- Forking or patching Slidev. Duplicating its cursor sync.

## Constraints
- Stock dot lives in scoped CSS; the override needs higher specificity or `!important`.
- Dot is inside the scaled slide container, so size is in slide px.

## Approaches considered
A. CSS-only addon: tiny, but no frontmatter key, no UI path. 
B. Config-driven variable layer (chosen): headmatter -> `global-top.vue` -> CSS vars on root; override CSS reads the vars. Upgrade path: change value source.
C. Replace the laser with our own component: full control, but duplicates Slidev internals and is brittle.
Chosen: B. Fallback to C if the CSS override proves brittle.

## Design (B)
- Config (headmatter):
  ```yaml
  laserPointer:
    color: okabe-blue   # preset name or any CSS color
    size: 14            # dot diameter, slide px
    glow: true          # optional, default true
  ```
- `global-top.vue`: reads `$slidev.configs.laserPointer`, resolves preset -> color,
  sets `--slidev-laser-color`, `--slidev-laser-size`, `--slidev-laser-glow` on `document.documentElement`.
  Does nothing if unset.
- `styles/index.css`: `.slidev-slide-container .laser-pointer { ... !important }` using the vars with
  fallbacks equal to stock values, so unconfigured = stock look.
- Presets (Okabe-Ito): orange #E69F00, sky-blue #56B4E9, green #009E73, yellow #F0E442,
  blue #0072B2, vermillion #D55E00, purple #CC79A7. Glow derived from the color.
- Upgrade path: replace the config read with a ref backed by localStorage, plus a
  shared-state patch for audience sync; CSS layer untouched.

## Builder's calls (mine, not yours; change freely)
- Config key `laserPointer`; presets named as above.
- Size is slide px, not screen px (keeps it consistent with the slide scale).
- Unconfigured behavior = stock.
- Glow is derived from the chosen color rather than separately configured.

## To verify during build
- `$slidev.configs` exposes custom headmatter keys.
- Override wins over scoped styles in the production build.
- Dot is visible on the presenter's own screen and the viewer screen.

## Findings (build, 2026-11-11)
- `$slidev.configs` does expose custom headmatter keys (verified). In `global-top.vue` it is read via `useSlideContext().$slidev.configs`; importing `@slidev/client/env` does not resolve.
- Addon path in `addons:` resolves from the working directory, not from the deck file.
- The laser is localStorage-controlled per client: `slidev-cursor-style` stores the raw string `laser`.
- Class + variables are removed on HMR / config removal (verified); presenter view gets the override too.
- Implementation uses a gating class (`html.slidev-laser-custom`) rather than CSS fallbacks equal to stock.

### What a speaker-UI sync extension would need (not built)
1. Replace the config read in `global-top.vue` with a ref: author config = default, speaker choice (localStorage) = override. CSS layer unchanged.
2. A UI: Slidev's Settings panel is internal, so either a small floating control in `global-top.vue` or a presenter-page slot; color swatches (the presets) plus a size slider.
3. Audience sync: each client draws its own dot, so the presenter's choice must reach viewers. Slidev's `createSyncState(serverState, defaultState, persist)` (`@slidev/client/state/syncState`) is the mechanism behind `sharedState` (carries `cursor: {x, y, style}`). Open question, needs a spike: whether an addon can open its own channel (needs a server-side counterpart) or can safely piggyback extra fields on `sharedState` and have them survive the server round-trip. Fallback with no sync: the speaker's choice only affects their own screen, and viewers keep the author's config.
