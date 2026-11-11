import { describe, expect, it } from 'vitest'
import { resolveEffective } from '../src/effective'

describe('resolveEffective', () => {
  it('merges author and override', () => {
    const r = resolveEffective({ color: 'okabe-blue', size: 14 }, { size: 20 })
    expect(r.vars!['--slidev-laser-size']).toBe('20px')
    expect(r.vars!['--slidev-laser-color']).toBe('#0072B2')
    expect(r.warning).toBeUndefined()
  })
  it('returns no vars and no warning when nothing is set', () => {
    expect(resolveEffective(undefined, {})).toEqual({ vars: null })
  })
  it('a broken author config warns but the speaker override still applies', () => {
    const r = resolveEffective({ size: 'big' } as any, { color: 'okabe-yellow' })
    expect(r.warning).toMatch(/laserPointer\.size/)
    expect(r.vars!['--slidev-laser-color']).toBe('#F0E442')
  })
  it('a broken author config with no override warns and gives stock', () => {
    const r = resolveEffective({ colour: 'x' } as any, {})
    expect(r.warning).toMatch(/colour/)
    expect(r.vars).toBeNull()
  })
})
