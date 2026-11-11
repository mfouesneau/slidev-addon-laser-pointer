import { describe, expect, it } from 'vitest'
import { resolveLaser } from '../src/resolveLaser'

describe('resolveLaser', () => {
  it('returns null for undefined and {}', () => {
    expect(resolveLaser(undefined)).toBeNull()
    expect(resolveLaser({})).toBeNull()
  })
  it('maps okabe-blue to #0072B2', () => {
    expect(resolveLaser({ color: 'okabe-blue' })!['--slidev-laser-color']).toBe('#0072B2')
  })
  it('passes unknown colors through', () => {
    expect(resolveLaser({ color: 'rebeccapurple' })!['--slidev-laser-color']).toBe('rebeccapurple')
    expect(resolveLaser({ color: '#ff00ff' })!['--slidev-laser-color']).toBe('#ff00ff')
  })
  it('size becomes px', () => {
    expect(resolveLaser({ size: 14 })!['--slidev-laser-size']).toBe('14px')
  })
  it.each([['14'], [0], [-3], [NaN]])('rejects bad size %s', (size) => {
    expect(() => resolveLaser({ size: size as any })).toThrow(/laserPointer\.size/)
  })
  it('glow false gives none', () => {
    expect(resolveLaser({ color: 'okabe-blue', glow: false })!['--slidev-laser-glow']).toBe('none')
  })
  it('default glow includes color-mix and the resolved color', () => {
    const glow = resolveLaser({ color: 'okabe-blue' })!['--slidev-laser-glow']
    expect(glow).toContain('color-mix')
    expect(glow).toContain('#0072B2')
  })
  it('only set keys appear', () => {
    const vars = resolveLaser({ size: 14 })!
    expect(vars).not.toHaveProperty('--slidev-laser-color')
    expect(vars['--slidev-laser-size']).toBe('14px')
  })

  it.each([[123], [null], ['']])('rejects non-color value %s', (color) => {
    expect(() => resolveLaser({ color: color as any })).toThrow(/laserPointer\.color/)
  })
  it('rejects a mistyped okabe preset and lists the valid ones', () => {
    expect(() => resolveLaser({ color: 'okabe-bleu' })).toThrow(/okabe-blue/)
  })
  it('rejects unknown keys', () => {
    expect(() => resolveLaser({ colour: 'red' } as any)).toThrow(/colour/)
  })
  it.each([['abc'], [42], [[]]])('rejects non-object config %s', (cfg) => {
    expect(() => resolveLaser(cfg as any)).toThrow(/laserPointer must be an object/)
  })
  it.each([['false'], [0], [null]])('rejects non-boolean glow %s', (glow) => {
    expect(() => resolveLaser({ glow: glow as any })).toThrow(/laserPointer\.glow/)
  })
  it('does not treat inherited object members as presets', () => {
    expect(resolveLaser({ color: 'toString' })!['--slidev-laser-color']).toBe('toString')
  })
  it('uses the injected validator to reject unparseable colors', () => {
    expect(() => resolveLaser({ color: 'nope' }, { isColor: () => false })).toThrow(/laserPointer\.color.*nope/)
    expect(resolveLaser({ color: 'okabe-blue' }, { isColor: () => false })!['--slidev-laser-color']).toBe('#0072B2')
  })
})
