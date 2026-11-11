import type { LaserConfig } from './resolveLaser'
import { ref } from 'vue'

/** The speaker's live override. Module-level on purpose: session only, resets on reload. */
export const override = ref<LaserConfig>({})

/** Size slider bounds, in slide px. */
export const SIZE_MIN = 4
export const SIZE_MAX = 40

/**
 * Registry of mounted controls. Slidev renders `global-top.vue` once per slide view
 * (e.g. the presenter's main slide and its next-slide preview), but only one
 * control should exist on the page: the first registered one draws it.
 */
export const instances = ref<symbol[]>([])
