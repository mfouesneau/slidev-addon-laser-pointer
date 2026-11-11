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

/**
 * Resolve the `laserPointer` config into CSS variables.
 * Returns null when nothing is configured (stock look must be kept).
 * Throws when `size` is not a positive finite number.
 */
export function resolveLaser(config: LaserConfig | undefined): Record<string, string> | null {
  if (!config || Object.keys(config).length === 0)
    return null

  const vars: Record<string, string> = {}
  let color: string | undefined

  if (config.color !== undefined) {
    color = PRESETS[config.color] ?? config.color
    vars['--slidev-laser-color'] = color
  }

  if (config.size !== undefined) {
    const { size } = config
    if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0)
      throw new Error(`laserPointer.size must be a positive number (slide px), got ${JSON.stringify(size)}`)
    vars['--slidev-laser-size'] = `${size}px`
  }

  if (config.glow === false)
    vars['--slidev-laser-glow'] = 'none'
  else
    vars['--slidev-laser-glow'] = glowFor(color ?? STOCK_COLOR)

  return vars
}
