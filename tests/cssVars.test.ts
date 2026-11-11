import { describe, expect, it } from 'vitest'
import { createVarsApplier } from '../src/cssVars'

function fakeRoot() {
  const props = new Map<string, string>()
  const classes = new Set<string>()
  return {
    props, classes,
    style: { setProperty: (k: string, v: string) => void props.set(k, v), removeProperty: (k: string) => void props.delete(k) },
    classList: { add: (c: string) => void classes.add(c), remove: (c: string) => void classes.delete(c) },
  }
}

describe('createVarsApplier', () => {
  it('sets variables and the class, and clears them when the owner releases', () => {
    const root = fakeRoot(), a = createVarsApplier(root as any, 'on')
    const o = Symbol('a')
    a.set(o, { '--x': '1' })
    expect(root.props.get('--x')).toBe('1'); expect(root.classes.has('on')).toBe(true)
    a.release(o)
    expect(root.props.size).toBe(0); expect(root.classes.has('on')).toBe(false)
  })
  it('an owner releasing does not wipe what another live owner applied', () => {
    const root = fakeRoot(), a = createVarsApplier(root as any, 'on')
    const live = Symbol('live'), preview = Symbol('preview')
    a.set(live, { '--x': '1' }); a.set(preview, { '--x': '1' })
    a.release(preview)
    expect(root.props.get('--x')).toBe('1'); expect(root.classes.has('on')).toBe(true)
    a.release(live)
    expect(root.classes.has('on')).toBe(false)
  })
  it('set(owner, null) means stock and removes the class when no one else applies', () => {
    const root = fakeRoot(), a = createVarsApplier(root as any, 'on')
    const o = Symbol('o')
    a.set(o, { '--x': '1' }); a.set(o, null)
    expect(root.props.size).toBe(0); expect(root.classes.has('on')).toBe(false)
  })
  it('changing the variables drops stale ones', () => {
    const root = fakeRoot(), a = createVarsApplier(root as any, 'on')
    const o = Symbol('o')
    a.set(o, { '--x': '1', '--y': '2' }); a.set(o, { '--x': '3' })
    expect(root.props.get('--x')).toBe('3'); expect(root.props.has('--y')).toBe(false)
  })
})
