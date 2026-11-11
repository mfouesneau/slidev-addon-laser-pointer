import { describe, expect, it } from 'vitest'
import { controlState } from '../src/controlState'

describe('controlState', () => {
  it('defaults to stock size and no color', () => {
    const s = controlState(undefined, {})
    expect(s).toMatchObject({ size: 6, glow: true, hasOverride: false, color: undefined, activePreset: undefined })
  })
  it('slider range widens to include an author size outside 4-40', () => {
    expect(controlState({ size: 50 }, {})).toMatchObject({ size: 50, sizeMax: 50, sizeMin: 4 })
    expect(controlState({ size: 2 }, {})).toMatchObject({ size: 2, sizeMin: 2, sizeMax: 40 })
  })
  it('override beats author', () => {
    expect(controlState({ size: 14, color: 'okabe-blue' }, { size: 20 })).toMatchObject({ size: 20, hasOverride: true })
  })
  it('marks the active preset by hex, case-insensitively and for 3-digit hex', () => {
    expect(controlState({ color: 'okabe-blue' }, {}).activePreset).toBe('okabe-blue')
    expect(controlState({ color: '#0072b2' }, {}).activePreset).toBe('okabe-blue')
    expect(controlState({ color: '#FFF' }, {}).color).toBe('#ffffff')
    expect(controlState({ color: '#ff00ff' }, {}).activePreset).toBeUndefined()
  })
  it('exposes a hex for the custom picker, with a fallback for non-hex colors', () => {
    expect(controlState({ color: 'okabe-blue' }, {}).pickerHex).toBe('#0072b2')
    expect(controlState({ color: 'rebeccapurple' }, {}).pickerHex).toBe('#ff0000')
  })
  it('ignores a malformed author config', () => {
    expect(controlState('abc' as any, {})).toMatchObject({ size: 6, hasOverride: false })
  })
  it('glow follows override, then author, default true', () => {
    expect(controlState({ glow: false }, {}).glow).toBe(false)
    expect(controlState({ glow: false }, { glow: true }).glow).toBe(true)
  })
})
