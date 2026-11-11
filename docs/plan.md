# slidev-laser-pointer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Slidev addon that lets a deck author set the laser pointer's color and size from headmatter.

**Architecture:** A pure TS function resolves the `laserPointer` config into CSS variables. `global-top.vue` applies them on `<html>` and adds a gating class; `styles/index.css` overrides Slidev's scoped `.laser-pointer` only under that class (so unconfigured = stock).

**Tech Stack:** Slidev (current), Vue 3, TypeScript, vitest, pnpm, playwright-chromium (e2e check).

**Spec:** `docs/design.md` (same pad)

## Global Constraints

- Config key: `laserPointer` with `color` (preset name or any CSS color), `size` (slide px, number), `glow` (boolean, default `true`).
- Presets (Okabe-Ito), names prefixed `okabe-`: orange `#E69F00`, sky-blue `#56B4E9`, green `#009E73`, yellow `#F0E442`, blue `#0072B2`, vermillion `#D55E00`, purple `#CC79A7`.
- Unconfigured behavior must equal stock Slidev; no changes to Slidev internals.
- Glow is derived from the color, never configured separately.
- Fail loudly: invalid `size` throws with a message naming the bad value.
- Everything stays inside this pad; no shared deps with other pads.

## Review Focus

- `size` given as a string (`"14"`), `0`, negative, or `NaN` → throws a clear error (task 1 test).
- `color` not a preset (e.g. `"#ff00ff"`, `"rebeccapurple"`) → passed through untouched (task 1 test).
- `glow: false` → no box-shadow at all (task 1 test).
- Empty or absent `laserPointer` → no class, no variables, stock look (task 1 + task 2 e2e).
- Config removed/changed during dev HMR → class and variables are cleaned up on unmount (task 2 step on cleanup).

---

### Task 1: Config resolver (pure logic)

**Files:**
- Create: `package.json`, `tsconfig.json`, `src/resolveLaser.ts`
- Test: `tests/resolveLaser.test.ts`

**Interfaces:**
- Produces:
  - `export const PRESETS: Record<string, string>` (the seven `okabe-*` entries above)
  - `export interface LaserConfig { color?: string; size?: number; glow?: boolean }`
  - `export function resolveLaser(config: LaserConfig | undefined): Record<string, string> | null` — returns `null` when nothing is configured (undefined or `{}`), otherwise a map containing only the CSS variables that the config sets: `--slidev-laser-color` (hex or passthrough), `--slidev-laser-size` (`"<n>px"`), `--slidev-laser-glow` (a `box-shadow` value built with `color-mix`, or `"none"` when `glow === false`).

- [ ] **Step 1: Scaffold.** `git init` in the pad; `package.json` with `"type": "module"`, `keywords: ["slidev-addon", "slidev"]`, `engines: { slidev: ">=<current major>" }` (check the installed version), devDeps `vitest`, `typescript`. `.gitignore` with `node_modules`, `dist`.
- [ ] **Step 2: Write the failing tests** in `tests/resolveLaser.test.ts`:
  - `returns null for undefined and {}`
  - `maps okabe-blue to #0072B2` → `resolveLaser({color:'okabe-blue'})['--slidev-laser-color'] === '#0072B2'`
  - `passes unknown colors through` → `'rebeccapurple'` unchanged
  - `size becomes px` → `{size: 14}` gives `'14px'`
  - `rejects bad sizes` → `"14"`, `0`, `-3`, `NaN` each `toThrow(/laserPointer\.size/)`
  - `glow false gives none` and `glow default includes the color` (glow string contains `color-mix` and the resolved color)
  - `only set keys appear` → `{size: 14}` result has no `--slidev-laser-color`
- [ ] **Step 3: Run `pnpm vitest run`.** Expected: FAIL (module not found).
- [ ] **Step 4: Implement `resolveLaser` and `PRESETS` in `src/resolveLaser.ts`.** Glow: two layered shadows, `0 0 10px` at 90% and `0 0 22px` at 55% opacity via `color-mix(in srgb, <color> N%, transparent)`. When only `size` or `glow` is set (no color), glow uses `var(--slidev-laser-color, rgb(255 0 0))`.
- [ ] **Step 5: Run `pnpm vitest run`.** Expected: all PASS.
- [ ] **Step 6: Commit** `feat: resolve laserPointer config to CSS variables`.

---

### Task 2: Addon wiring, CSS override, demo deck, e2e check

**Files:**
- Create: `global-top.vue`, `styles/index.css`, `demo/slides.md`, `demo/package.json` (if Slidev must be installed separately), `scripts/check-laser.mjs`
- Modify: `package.json` (add `files`, scripts `demo`, `check`)

**Interfaces:**
- Consumes: `resolveLaser(config)` from Task 1.
- Produces: root class `slidev-laser-custom` on `<html>` and the three CSS variables when configured; addon usable via `addons: ['<path>']` in headmatter.

- [ ] **Step 1: Verify the open assumption.** In `demo/slides.md` set headmatter `laserPointer: { color: okabe-blue, size: 14 }` and a temporary `{{ $slidev.configs.laserPointer }}` in a slide. Run the dev server; confirm the object renders. If `$slidev.configs` does not expose it, stop and report (design falls back to reading the `headmatter` via `useSlideContext`/`$slidev.nav`; propose the fix before continuing).
- [ ] **Step 2: Implement `global-top.vue`.** In `<script setup lang="ts">`, `watchEffect` reads `$slidev.configs.laserPointer`, calls `resolveLaser`; if non-null, sets each variable on `document.documentElement.style` and adds class `slidev-laser-custom`; if null, does nothing. `onScopeDispose` removes the variables and the class (covers HMR).
- [ ] **Step 3: Implement `styles/index.css`.** Rule `html.slidev-laser-custom .slidev-slide-container .laser-pointer` with `!important` on `width`, `height`, `background` (flat `var(--slidev-laser-color, rgb(255 0 0))`), and `box-shadow: var(--slidev-laser-glow, none)`. No rule applies without the class.
- [ ] **Step 4: Write `scripts/check-laser.mjs`** (playwright-chromium; takes the dev-server URL as an argument). It sets `localStorage['slidev-cursor-style'] = 'laser'`, reloads, moves the mouse over the slide, reads `getComputedStyle(.laser-pointer)` and prints/asserts: width `14px` and `background-color` `rgb(0, 114, 178)` for the configured deck; then repeats against a second deck URL with no `laserPointer` and asserts width `6px` and a red-gradient `background-image` (stock). Exits non-zero on mismatch.
- [ ] **Step 5: Run** `pnpm demo` (configured deck) and a second dev server on `demo/stock.md` (same slides, no config), then `node scripts/check-laser.mjs <url>` for each. Expected: both pass.
- [ ] **Step 6: Check the viewer view and cleanup by hand.** Open `/presenter` and the play view in two tabs; confirm the dot is blue and 14px in both. Remove `laserPointer` from the headmatter while the dev server runs; confirm the dot returns to stock.
- [ ] **Step 7: Commit** `feat: addon applying laserPointer config via CSS variables`.

---

### Task 3: README and speaker-UI notes

**Files:**
- Create: `ADDON-README.md` (addon usage, kept lean); Modify: pad `README.md` progress, `docs/design.md` (append "Findings: what a UI sync extension needs")

- [ ] **Step 1: Write usage docs** in `ADDON-README.md`: install (`addons:` entry), config keys, preset table with hex values, size units, defaults.
- [ ] **Step 2: Append the findings section** to `docs/design.md`: what must change to add live control (a local ref in place of the config read in `global-top.vue`; presenter choice written into Slidev shared state, e.g. a custom field alongside `cursor`; viewer clients reading it), and whether Slidev's `createSyncState` permits extra fields (investigate and record the answer).
- [ ] **Step 3: Update pad `README.md`** success-criteria checkboxes and progress; commit `docs: usage and UI-sync notes`.

---

## Self-Review

- Spec coverage: config key/presets/size/glow (task 1), audience view and unconfigured=stock (task 2 steps 5–6), upgrade-path notes (task 3), open assumption on `$slidev.configs` (task 2 step 1). No gaps.
- Names consistent across tasks: `resolveLaser`, `PRESETS`, `--slidev-laser-{color,size,glow}`, `slidev-laser-custom`.
- One deliberate deviation from the design: unconfigured = stock is guaranteed by a gating class instead of CSS fallbacks equal to stock values. Same result, and it can't drift if Slidev changes its stock look.
