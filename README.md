# slidev-addon-laser-pointer

A [Slidev](https://sli.dev) addon that changes the color and size of the laser pointer.
Stock Slidev draws a 6px red dot, which is hard to see for red-green colorblind viewers and small on a projector.
With this addon the deck author picks a colorblind-safe color and a bigger dot from the deck's headmatter.

## Install

Requires Slidev >= 52.18 (tested on 52.18.0 with the neversink theme, and on 53.1.0; older versions are untested and Slidev will refuse to start with a "requires Slidev version range" error naming the mismatch, so check your terminal if nothing changes). The addon only uses `global-top.vue`, a stylesheet and the deck's own `vue` / `@slidev/client`).

Not on npm yet. Until it is, pick one:

```bash
# from a local checkout (symlinks it; good for hacking on the addon)
npm install --save-dev /path/to/slidev-addon-laser-pointer

# or as a packed tarball (what a published install looks like; good for trying it)
(cd /path/to/slidev-addon-laser-pointer && npm pack)        # creates slidev-addon-laser-pointer-0.0.2.tgz
npm install --save-dev /path/to/slidev-addon-laser-pointer/slidev-addon-laser-pointer-0.0.2.tgz

# or straight from GitHub
npm install --save-dev github:mfouesneau/slidev-addon-laser-pointer
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
Slide shortcuts are paused while the panel is open, so typing in it won't change slides. To keep a clicker from going dead,
the panel closes on **Escape**, on a click outside it, and after 10 seconds without interaction.
The button is not drawn in export or print renders.
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
npm test                 # unit tests
npm run demo             # configured deck on :3031
npm run demo:stock       # unconfigured deck on :3032
node scripts/check-laser.mjs http://localhost:3031/1 http://localhost:3032/1   # config check (playwright)
node scripts/check-ui.mjs http://localhost:3031 http://localhost:3032            # speaker-control check (playwright)
```

Design and findings: [`docs/design.md`](docs/design.md). Build log: [`docs/NOTES.md`](docs/NOTES.md).

## License

BSD 3-Clause. See [LICENSE](LICENSE).
