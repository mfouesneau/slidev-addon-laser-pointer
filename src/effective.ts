import type { LaserConfig, ResolveOptions } from './resolveLaser'
import { mergeConfig } from './mergeConfig'
import { resolveLaser } from './resolveLaser'

export interface Effective {
  /** CSS variables to apply, or null for the stock pointer. */
  vars: Record<string, string> | null
  /** Why the author's config was rejected, if it was. */
  warning?: string
}

/**
 * Resolve author config + speaker override. If the author's config is invalid,
 * report it but still honor the speaker's (always valid) override.
 */
export function resolveEffective(
  author: LaserConfig | undefined,
  override: LaserConfig,
  options: ResolveOptions = {},
): Effective {
  try {
    return { vars: resolveLaser(mergeConfig(author, override), options) }
  }
  catch (err) {
    const warning = (err as Error).message
    try {
      return { vars: resolveLaser(mergeConfig(undefined, override), options), warning }
    }
    catch {
      return { vars: null, warning }
    }
  }
}
