<script setup lang="ts">
import { lockShortcuts, useSlideContext } from '@slidev/client'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { instances, override, SIZE_MAX, SIZE_MIN } from './overrideState'
import { PRESETS } from './resolveLaser'

const { $slidev } = useSlideContext()

// One control per page: the first registered instance draws it (see `instances`).
const id = Symbol('laser-control')
const visible = computed(() => instances.value[0] === id)
onMounted(() => { instances.value = [...instances.value, id] })

const open = ref(false)
let unlock: (() => void) | undefined
watch(open, (isOpen) => {
  // While the popover is open, typed keys must not navigate slides.
  if (isOpen) unlock = lockShortcuts()
  else { unlock?.(); unlock = undefined }
})
onBeforeUnmount(() => {
  unlock?.()
  instances.value = instances.value.filter(i => i !== id)
})

const author = computed<Record<string, any>>(() => {
  const cfg = $slidev.configs.laserPointer
  return cfg && typeof cfg === 'object' && !Array.isArray(cfg) ? cfg : {}
})

const color = computed<string | undefined>(() => {
  const c = override.value.color ?? author.value.color
  return typeof c === 'string' ? (PRESETS[c] ?? c) : undefined
})
const size = computed<number>(() => {
  const s = override.value.size ?? author.value.size
  return typeof s === 'number' && Number.isFinite(s) ? Math.min(Math.max(s, SIZE_MIN), SIZE_MAX) : 6
})
const glow = computed(() => (override.value.glow ?? author.value.glow) !== false)
const hasOverride = computed(() => Object.keys(override.value).length > 0)

const swatches = Object.entries(PRESETS).map(([name, hex]) => ({ name, hex, label: name.replace('okabe-', '') }))

function set(patch: Record<string, unknown>) {
  override.value = { ...override.value, ...patch }
}
function reset() {
  override.value = {}
}
function onSize(e: Event) {
  set({ size: Number((e.target as HTMLInputElement).value) })
}
function onCustomColor(e: Event) {
  set({ color: (e.target as HTMLInputElement).value })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="slidev-laser-control" :class="{ open }" data-testid="laser-control">
      <div v-if="open" class="panel" role="dialog" aria-label="Laser pointer settings">
        <div class="title">Laser pointer</div>
        <div class="swatches">
          <button
            v-for="s in swatches" :key="s.name" type="button" class="swatch"
            :class="{ active: color === s.hex }" :style="{ background: s.hex }"
            :title="s.label" :aria-label="`Color ${s.label}`" :data-name="s.name"
            @click="set({ color: s.name })"
          />
          <label class="swatch custom" title="Custom color" aria-label="Custom color">
            <input type="color" :value="color && color.startsWith('#') ? color : '#ff0000'" @input="onCustomColor">
          </label>
        </div>
        <label class="row">
          <span>Size {{ size }}</span>
          <input type="range" :min="SIZE_MIN" :max="SIZE_MAX" step="1" :value="size" aria-label="Size" @input="onSize">
        </label>
        <label class="row">
          <span>Glow</span>
          <input type="checkbox" :checked="glow" aria-label="Glow" @change="set({ glow: ($event.target as HTMLInputElement).checked })">
        </label>
        <button type="button" class="reset" :disabled="!hasOverride" @click="reset">Reset to deck default</button>
      </div>
      <button type="button" class="toggle" title="Laser pointer settings" aria-label="Laser pointer settings" :aria-expanded="open" @click="open = !open">
        <span class="dot" :style="{ background: color ?? '#ff3030' }" />
      </button>
    </div>
  </Teleport>
</template>

<style>
.slidev-laser-control { position: fixed; right: 12px; bottom: 12px; z-index: 1000; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; font: 13px/1.3 system-ui, sans-serif; }
.slidev-laser-control .toggle { width: 30px; height: 30px; border-radius: 50%; border: 1px solid rgba(255,255,255,.35); background: rgba(20,20,20,.75); display: grid; place-items: center; cursor: pointer; opacity: .2; transition: opacity .15s; padding: 0; }
.slidev-laser-control:hover .toggle, .slidev-laser-control.open .toggle, .slidev-laser-control .toggle:focus-visible { opacity: 1; }
.slidev-laser-control .dot { width: 12px; height: 12px; border-radius: 50%; display: block; }
.slidev-laser-control .panel { background: rgba(20,20,20,.94); color: #fff; padding: 10px 12px; border-radius: 10px; width: 230px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 6px 24px rgba(0,0,0,.4); }
.slidev-laser-control .title { font-weight: 600; }
.slidev-laser-control .swatches { display: flex; flex-wrap: wrap; gap: 6px; }
.slidev-laser-control .swatch { width: 24px; height: 24px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; position: relative; overflow: hidden; }
.slidev-laser-control .swatch.active { border-color: #fff; box-shadow: 0 0 0 1px #000; }
.slidev-laser-control .swatch.custom { background: conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00); }
.slidev-laser-control .swatch.custom input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
.slidev-laser-control .row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.slidev-laser-control .row input[type=range] { flex: 1; }
.slidev-laser-control .reset { background: transparent; color: inherit; border: 1px solid rgba(255,255,255,.35); border-radius: 6px; padding: 4px 8px; cursor: pointer; }
.slidev-laser-control .reset:disabled { opacity: .4; cursor: default; }
@media print { .slidev-laser-control { display: none; } }
</style>
