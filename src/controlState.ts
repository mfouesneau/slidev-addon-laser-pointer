import type { LaserConfig } from './resolveLaser'
import { PRESETS } from './resolveLaser'

/** Size slider default bounds, in slide px. */
export const SIZE_MIN = 4
export const SIZE_MAX = 40
const STOCK_SIZE = 6

export interface ControlState {
  /** Effective color as lowercase #rrggbb when it is a hex, else as given; undefined = stock. */
  color: string | undefined
  /** Preset whose hex equals the effective color. */
  activePreset: string | undefined
  /** Value for `<input type=color>` (needs #rrggbb). */
  pickerHex: string
  size: number
  sizeMin: number
  sizeMax: number
  glow: boolean
  hasOverride: boolean
}

function normalizeHex(value: string): string | undefined {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim())
  if (!m)
    return undefined
  const h = m[1].toLowerCase()
  return `#${h.length === 3 ? [...h].map(c => c + c).join('') : h}`
}

/** What the speaker panel shows, derived from author config and override. Never throws. */
export function controlState(author: LaserConfig | undefined, override: LaserConfig): ControlState {
  const a: LaserConfig = author && typeof author === 'object' && !Array.isArray(author) ? author : {}

  const rawColor = override.color ?? a.color
  const resolved = typeof rawColor === 'string' ? (Object.hasOwn(PRESETS, rawColor) ? PRESETS[rawColor] : rawColor) : undefined
  const color = resolved === undefined ? undefined : (normalizeHex(resolved) ?? resolved)

  const rawSize = override.size ?? a.size
  const size = typeof rawSize === 'number' && Number.isFinite(rawSize) && rawSize > 0 ? rawSize : STOCK_SIZE

  const activePreset = color === undefined
    ? undefined
    : Object.keys(PRESETS).find(name => normalizeHex(PRESETS[name]) === color)

  return {
    color,
    activePreset,
    pickerHex: (color && normalizeHex(color)) || '#ff0000',
    size,
    sizeMin: Math.min(SIZE_MIN, size),
    sizeMax: Math.max(SIZE_MAX, size),
    glow: (override.glow ?? a.glow) !== false,
    hasOverride: Object.keys(override).length > 0,
  }
}

/** The open panel closes itself after this long without interaction (frees the shortcut lock). */
export const PANEL_IDLE_MS = 10_000
