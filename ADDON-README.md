# slidev-addon-laser-pointer

Change the color and size of Slidev's laser pointer (cursor style "Laser" in Settings).
Stock is a 6px red dot; this addon lets the deck author pick a colorblind-safe color and a larger dot.

## Use

```yaml
---
addons:
  - slidev-addon-laser-pointer   # in this pad: `.` (path is relative to the working directory)
laserPointer:
  color: okabe-blue   # preset name or any CSS color
  size: 14            # dot diameter in slide px (stock: 6)
  glow: true          # default true; glow is derived from the color
---
```

No `laserPointer` key: pointer is untouched (stock Slidev). `size` must be a positive number or the deck errors with a message naming the value.

## Presets (Okabe-Ito, colorblind-safe)

| name | hex |
|---|---|
| okabe-orange | #E69F00 |
| okabe-sky-blue | #56B4E9 |
| okabe-green | #009E73 |
| okabe-yellow | #F0E442 |
| okabe-blue | #0072B2 |
| okabe-vermillion | #D55E00 |
| okabe-purple | #CC79A7 |

## Dev

`npm test` (unit), `npm run demo` / `npm run demo:stock` (ports 3031/3032), then
`node scripts/check-laser.mjs http://localhost:3031/1 http://localhost:3032/1`.
