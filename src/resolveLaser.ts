/** Okabe-Ito colorblind-safe palette, addressable as `okabe-<name>`. */
export const PRESETS: Record<string, string> = {
  'okabe-orange': '#E69F00',
  'okabe-sky-blue': '#56B4E9',
  'okabe-green': '#009E73',
  'okabe-yellow': '#F0E442',
  'okabe-blue': '#0072B2',
  'okabe-vermillion': '#D55E00',
  'okabe-purple': '#CC79A7',
}

/** Shape of the `laserPointer` headmatter key. */
export interface LaserConfig {
  /** Preset name (`okabe-*`) or any CSS color. */
  color?: string
  /** Dot diameter in slide pixels. */
  size?: number
  /** Draw a glow derived from the color. Default true. */
  glow?: boolean
}

const STOCK_COLOR = 'rgb(255 0 0)'

function glowFor(color: string): string {
  const mix = (pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`
  return `0 0 10px ${mix(90)}, 0 0 22px ${mix(55)}`
}

const ALLOWED_KEYS = ['color', 'size', 'glow']

/** Optional hooks. `isColor` lets the browser vet non-preset colors (e.g. `CSS.supports`). */
export interface ResolveOptions {
  isColor?: (value: string) => boolean
}

/**
 * Resolve the `laserPointer` config into CSS variables.
 * Returns null when nothing is configured (stock look must be kept).
 * Throws a descriptive Error on any invalid value or unknown key.
 */
export function resolveLaser(
  config: LaserConfig | undefined,
  options: ResolveOptions = {},
): Record<string, string> | null {
  if (config === undefined)
    return null
  if (typeof config !== 'object' || config === null || Array.isArray(config))
    throw new Error(`laserPointer must be an object with keys ${ALLOWED_KEYS.join(', ')}, got ${JSON.stringify(config)}`)
  if (Object.keys(config).length === 0)
    return null

  const unknown = Object.keys(config).filter(k => !ALLOWED_KEYS.includes(k))
  if (unknown.length)
    throw new Error(`laserPointer: unknown key(s) ${unknown.join(', ')}; allowed: ${ALLOWED_KEYS.join(', ')}`)

  const vars: Record<string, string> = {}
  let color: string | undefined

  if (config.color !== undefined) {
    const raw = config.color
    if (typeof raw !== 'string' || raw.trim() === '')
      throw new Error(`laserPointer.color must be a preset name or CSS color string, got ${JSON.stringify(raw)}`)
    if (Object.hasOwn(PRESETS, raw)) {
      color = PRESETS[raw]
    }
    else if (raw.startsWith('okabe-')) {
      throw new Error(`laserPointer.color: unknown preset ${JSON.stringify(raw)}; presets: ${Object.keys(PRESETS).join(', ')}`)
    }
    else if (options.isColor && !options.isColor(raw)) {
      throw new Error(`laserPointer.color: ${JSON.stringify(raw)} is not a valid CSS color; presets: ${Object.keys(PRESETS).join(', ')}`)
    }
    else {
      color = raw
    }
    vars['--slidev-laser-color'] = color
  }

  if (config.size !== undefined) {
    const { size } = config
    if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0)
      throw new Error(`laserPointer.size must be a positive number (slide px), got ${JSON.stringify(size)}`)
    vars['--slidev-laser-size'] = `${size}px`
  }

  if (config.glow !== undefined && typeof config.glow !== 'boolean')
    throw new Error(`laserPointer.glow must be true or false, got ${JSON.stringify(config.glow)}`)

  vars['--slidev-laser-glow'] = config.glow === false ? 'none' : glowFor(color ?? STOCK_COLOR)

  return vars
}
