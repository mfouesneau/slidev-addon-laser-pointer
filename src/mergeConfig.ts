import type { LaserConfig } from './resolveLaser'

/**
 * Merge the author's `laserPointer` config with the speaker's live override.
 * The override wins per key. Returns undefined when nothing is set.
 * A malformed author config (not a plain object) is returned as is, so that
 * `resolveLaser` can report it.
 */
export function mergeConfig(
  author: LaserConfig | undefined,
  override: LaserConfig,
): LaserConfig | undefined {
  if (author !== undefined && (typeof author !== 'object' || author === null || Array.isArray(author)))
    return author

  const defined = Object.fromEntries(Object.entries(override).filter(([, v]) => v !== undefined))
  const merged = { ...author, ...defined }
  return Object.keys(merged).length === 0 ? undefined : merged
}
