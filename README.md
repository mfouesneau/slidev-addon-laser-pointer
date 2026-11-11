# 2026-11-11 slidev-laser-pointer

## Goal
Slidev addon that lets a deck author set the laser pointer's color and size
(default is a hard-coded 6px red dot: poor for colorblind viewers, small on projectors).
Later: speaker-controlled live UI synced to the audience.

## Stack
- Slidev addon (npm package: `styles/`, `global-top.vue`), Vue 3, CSS variables
- Reference: slidev `packages/client/internals/LaserPointer.vue`

## Success Criteria
- [ ] `laserPointer: { color, size }` in headmatter changes the laser in play and presenter/viewer views
- [ ] Okabe-Ito colorblind-safe presets selectable by name
- [ ] Without config, the pointer looks exactly like stock Slidev
- [ ] Notes on what a speaker-UI sync extension needs

## Current State / Progress
- **2026-11-11** — Brainstormed; approach B (config-driven CSS-variable addon) chosen. Design: docs/design.md. Awaiting design approval; no code yet.
