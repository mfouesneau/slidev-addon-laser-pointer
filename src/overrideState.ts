import type { LaserConfig } from './resolveLaser'
import { ref } from 'vue'
import { createVarsApplier } from './cssVars'

/** The speaker's live override. Module-level on purpose: session only, resets on reload. */
export const override = ref<LaserConfig>({})

/**
 * Registry of mounted controls. Slidev renders `global-top.vue` once per slide view
 * (e.g. the presenter's main slide and its next-slide preview), but only one
 * control should exist on the page: the first registered one draws it.
 */
export const instances = ref<symbol[]>([])

/** Page-wide CSS applier, shared by every `global-top.vue` instance (created lazily, browser only). */
let applier: ReturnType<typeof createVarsApplier> | undefined
export function getApplier() {
  return applier ??= createVarsApplier(document.documentElement, 'slidev-laser-custom')
}
