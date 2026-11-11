import { describe, expect, it } from 'vitest'
import { mergeConfig } from '../src/mergeConfig'

describe('mergeConfig', () => {
  it('returns undefined when both are empty', () => {
    expect(mergeConfig(undefined, {})).toBeUndefined()
    expect(mergeConfig({}, {})).toBeUndefined()
  })
  it('passes the author config through when there is no override', () => {
    expect(mergeConfig({ color: 'okabe-blue', size: 14 }, {})).toEqual({ color: 'okabe-blue', size: 14 })
  })
  it('override wins per key, other author keys survive', () => {
    expect(mergeConfig({ color: 'okabe-blue', size: 14 }, { size: 20 })).toEqual({ color: 'okabe-blue', size: 20 })
  })
  it('works with no author config', () => {
    expect(mergeConfig(undefined, { color: 'okabe-yellow' })).toEqual({ color: 'okabe-yellow' })
  })
  it('ignores undefined override values', () => {
    expect(mergeConfig({ size: 14 }, { size: undefined })).toEqual({ size: 14 })
  })
  it('does not mutate its inputs', () => {
    const author = { size: 14 }, over = { color: 'okabe-blue' }
    mergeConfig(author, over)
    expect(author).toEqual({ size: 14 })
    expect(over).toEqual({ color: 'okabe-blue' })
  })
  it('passes an invalid author config through untouched so resolveLaser can report it', () => {
    expect(mergeConfig('abc' as any, {})).toBe('abc')
    expect(mergeConfig('abc' as any, { size: 20 })).toBe('abc')
  })
})
