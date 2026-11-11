# slidev-addon-laser-pointer

A [Slidev](https://sli.dev) addon that changes the color and size of the laser pointer.
Stock Slidev draws a 6px red dot, which is hard to see for red-green colorblind viewers and small on a projector.
With this addon the deck author picks a colorblind-safe color and a bigger dot from the deck's headmatter.

## Install

Requires Slidev >= 53 (the addon only uses `global-top.vue`, a stylesheet and the deck's own `vue` / `@slidev/client`).

Not on npm yet. Until it is, pick one:

```bash
# from a local checkout (symlinks it; good for hacking on the addon)
npm install --save-dev /path/to/slidev-addon-laser-pointer

# or as a packed tarball (what a published install looks like; good for trying it)
(cd /path/to/slidev-addon-laser-pointer && npm pack)        # creates slidev-addon-laser-pointer-0.0.1.tgz
npm install --save-dev /path/to/slidev-addon-laser-pointer/slidev-addon-laser-pointer-0.0.1.tgz

# or straight from a git remote, once pushed
npm install --save-dev github:<user>/slidev-addon-laser-pointer
```

Once published: `npm install --save-dev slidev-addon-laser-pointer`.

## Enable it in a deck

Add the addon and the config to the first frontmatter block (the headmatter) of your `slides.md`:

```yaml
---
addons:
  - slidev-addon-laser-pointer
laserPointer:
  color: okabe-blue   # preset name or any CSS color
  size: 14            # dot diameter in slide px (stock: 6)
  glow: true          # default true; the glow is derived from the color
---
```

Prefer the installed package name. A relative path in `addons:` (`addons: [./path/to/addon]`) is resolved
from the parent of the folder that holds your deck file (observed with Slidev 53.1.0), which is easy to get wrong.

Then turn the laser on while presenting: Settings (gear icon) > Cursor style > **Laser**.
The addon changes how the laser looks; it does not turn it on.

## Change it live (speaker control)

With the addon enabled, a small round button sits in the bottom-right corner of the slide view (faint until you hover it).
It opens a panel with:

- the seven colorblind-safe swatches, plus a custom color picker
- a size slider (4 to 40 slide px)
- a glow toggle
- **Reset to deck default**

Your choice beats the deck's `laserPointer` config and the stock look, in that order.
It only affects your own screen: nothing is synced to the audience, and it resets when you reload the page.
Slide shortcuts are paused while the panel is open, so typing in it won't change slides. The button is hidden when printing or exporting.
Works whether or not the deck has a `laserPointer` config, so a deck with no config still gets the button.

Notes:
- No `laserPointer` key: the pointer is stock Slidev until you pick something in the panel.
- Every viewer's browser draws its own dot, so the audience sees the same color and size, as long as they load the same deck.
- A bad value (misspelled preset, `size: 0`, unknown key) logs a warning in the browser console and keeps the stock pointer; the deck still loads.

## Options

| key | type | default | meaning |
|---|---|---|---|
| `color` | preset name or CSS color | stock red | any CSS color works (`#ff00ff`, `rebeccapurple`, `rgb(...)`) |
| `size` | positive number | 6 | diameter in slide pixels, so it scales with the slide like the stock dot |
| `glow` | boolean | `true` | `false` removes the glow |

### Colorblind-safe presets (Okabe-Ito)

| name | hex |
|---|---|
| `okabe-orange` | #E69F00 |
| `okabe-sky-blue` | #56B4E9 |
| `okabe-green` | #009E73 |
| `okabe-yellow` | #F0E442 |
| `okabe-blue` | #0072B2 |
| `okabe-vermillion` | #D55E00 |
| `okabe-purple` | #CC79A7 |

Pick for contrast with your slide background: yellow or sky-blue on dark slides, blue or vermillion on light ones.

## Development

```bash
npm install
npm test                 # unit tests for the config resolver
npm run demo             # configured deck on :3031
npm run demo:stock       # unconfigured deck on :3032
node scripts/check-laser.mjs http://localhost:3031/1 http://localhost:3032/1   # config check (playwright)
node scripts/check-ui.mjs http://localhost:3031 http://localhost:3032            # speaker-control check (playwright)
```

Design: `docs/design.md`. Plan: `docs/plan.md`.

---

## Scratchpad notes

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
- [x] Notes on what a speaker-UI sync extension needs

## Current State / Progress
- **2026-11-11** — Brainstormed; approach B (config-driven CSS-variable addon) chosen. Design: docs/design.md. Awaiting design approval; no code yet.
- **2026-11-11** — Built v0.0.1: resolver (11 unit tests), addon (global-top.vue + styles), demo decks, e2e check (configured: 14px okabe-blue; stock: 6px red gradient), HMR cleanup verified. UI-sync findings in docs/design.md. Addon usage: top of this README.
- **2026-11-11** — Review fix pass: strict validation (unknown keys, bad color/glow/config type, mistyped okabe preset, browser CSS.supports check), fail-soft to stock with console.warn. 24 tests. Deferred minors: block `url()` colors, size cap, license/repository, size-only e2e case.
- **2026-11-11** — README rewritten as the addon doc (install, enable, options, presets); local-path install + enable-by-name verified in a clean consumer project. ADDON-README.md removed (npm ships README.md).
- **2026-11-11** — sharedState spike (see docs/design.md, "Spike: sharedState"): extra fields sync in dev and static builds; deletes do not sync in static builds. Spike files in spike/ (throwaway). Corrected the `addons:` relative-path rule.
- **2026-11-11** — Speaker UI v1 built (floating button, local-only, session-only; decisions in docs/design.md addendum). 31 unit tests; scripts/check-ui.mjs 10 checks; verified from a packed tarball in a clean project. Dev note: start the two demo servers a few seconds apart (shared Vite cache race).
