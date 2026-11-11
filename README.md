# 2026-11-11 slidev-laser-pointer

## Goal
Slidev addon that lets a deck author set the laser pointer's color and size
(default is a hard-coded 6px red dot: poor for colorblind viewers, small on projectors).
Later: speaker-controlled live UI synced to the audience.

## Stack
- Slidev addon (npm package: `styles/`, `global-top.vue`), Vue 3, CSS variables
- Reference: slidev `packages/client/internals/LaserPointer.vue`

## Success Criteria
- [x] `laserPointer: { color, size }` in headmatter changes the laser in play and presenter/viewer views
- [x] Okabe-Ito colorblind-safe presets selectable by name
- [x] Without config, the pointer looks exactly like stock Slidev
- [ ] Notes on what a speaker-UI sync extension needs

## Current State / Progress
- **2026-11-11** — Brainstormed; approach B (config-driven CSS-variable addon) chosen. Design: docs/design.md. Awaiting design approval; no code yet.
- **2026-11-11** — Built v0.0.1: resolver (11 unit tests), addon (global-top.vue + styles), demo decks, e2e check (configured: 14px okabe-blue; stock: 6px red gradient), HMR cleanup verified. UI-sync findings in docs/design.md. Addon usage: ADDON-README.md.
- **2026-11-11** — Review fix pass: strict validation (unknown keys, bad color/glow/config type, mistyped okabe preset, browser CSS.supports check), fail-soft to stock with console.warn. 24 tests. Deferred minors: block `url()` colors, size cap, license/repository, ADDON-README in `files`, size-only e2e case.
