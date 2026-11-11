<script setup lang="ts">
import { lockShortcuts, useSlideContext } from '@slidev/client'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { controlState, PANEL_IDLE_MS } from './controlState'
import { instances, override } from './overrideState'
import { PRESETS } from './resolveLaser'

const { $slidev } = useSlideContext()

// One control per page: the first registered instance draws it (see `instances`).
const id = Symbol('laser-control')
const visible = computed(() => instances.value[0] === id)
// Never in export/print renders (PNG export uses screen media, where print CSS does not apply).
const exporting = /(^|\/)export(\/|$)/.test(location.pathname) || new URLSearchParams(location.search).has('print')
onMounted(() => {
  if (!exporting)
    instances.value = [...instances.value, id]
})

const rootEl = ref<HTMLElement>()
const open = ref(false)
let unlock: (() => void) | undefined
let idleTimer: ReturnType<typeof setTimeout> | undefined

function blurIfInside() {
  const active = document.activeElement as HTMLElement | null
  // Otherwise Space/Enter on the refocused toggle would re-open the panel instead of advancing slides.
  if (active && rootEl.value?.contains(active))
    active.blur()
}
function close() {
  open.value = false
  blurIfInside()
}
function bump() {
  clearTimeout(idleTimer)
  idleTimer = setTimeout(close, PANEL_IDLE_MS)
}
function onDocPointerDown(e: PointerEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node))
    close()
}
function onDocKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape')
    close()
}

watch(open, (isOpen) => {
  if (isOpen) {
    // While open, typed keys must not navigate slides; the panel also closes on Escape,
    // on a click outside, and after PANEL_IDLE_MS idle, so a clicker is never dead for long.
    unlock = lockShortcuts()
    document.addEventListener('pointerdown', onDocPointerDown, true)
    document.addEventListener('keydown', onDocKeyDown, true)
    bump()
  }
  else {
    unlock?.(); unlock = undefined
    clearTimeout(idleTimer)
    document.removeEventListener('pointerdown', onDocPointerDown, true)
    document.removeEventListener('keydown', onDocKeyDown, true)
  }
})
onBeforeUnmount(() => {
  open.value = false
  unlock?.()
  clearTimeout(idleTimer)
  document.removeEventListener('pointerdown', onDocPointerDown, true)
  document.removeEventListener('keydown', onDocKeyDown, true)
  instances.value = instances.value.filter(i => i !== id)
})

const state = computed(() => controlState($slidev.configs.laserPointer as any, override.value))
const swatches = Object.entries(PRESETS).map(([name, hex]) => ({ name, hex, label: name.replace('okabe-', '') }))

function set(patch: Record<string, unknown>) {
  override.value = { ...override.value, ...patch }
}
function reset() {
  override.value = {}
}
function toggle() {
  if (open.value)
    close()
  else
    open.value = true
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" ref="rootEl" class="slidev-laser-control" :class="{ open }" data-testid="laser-control">
      <div v-if="open" class="panel" role="dialog" aria-label="Laser pointer settings" @pointermove="bump" @keydown="bump" @input="bump">
        <div class="title">Laser pointer</div>
        <div class="swatches">
          <button
            v-for="s in swatches" :key="s.name" type="button" class="swatch"
            :class="{ active: state.activePreset === s.name }" :aria-pressed="state.activePreset === s.name" :style="{ background: s.hex }"
            :title="s.label" :aria-label="`Color ${s.label}`" :data-name="s.name"
            @click="set({ color: s.name })"
          />
          <label class="swatch custom" title="Custom color" aria-label="Custom color">
            <input type="color" :value="state.pickerHex" aria-label="Custom color" @input="set({ color: ($event.target as HTMLInputElement).value })">
          </label>
        </div>
        <label class="row">
          <span>Size {{ Math.round(state.size * 10) / 10 }}</span>
          <input type="range" :min="state.sizeMin" :max="state.sizeMax" step="1" :value="state.size" aria-label="Size" @input="set({ size: Number(($event.target as HTMLInputElement).value) })">
        </label>
        <label class="row">
          <span>Glow</span>
          <input type="checkbox" :checked="state.glow" aria-label="Glow" @change="set({ glow: ($event.target as HTMLInputElement).checked })">
        </label>
        <button type="button" class="reset" :disabled="!state.hasOverride" @click="reset">Reset to deck default</button>
      </div>
      <button type="button" class="toggle" title="Laser pointer settings" aria-label="Laser pointer settings" :aria-expanded="open" @click="toggle">
        <span class="dot" :style="{ background: state.color ?? '#ff3030' }" />
      </button>
    </div>
  </Teleport>
</template>

<style>
.slidev-laser-control { position: fixed; right: 12px; bottom: 12px; z-index: 1000; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; font: 13px/1.3 system-ui, sans-serif; }
.slidev-laser-control .toggle { width: 30px; height: 30px; border-radius: 50%; border: 1px solid rgba(255,255,255,.35); background: rgba(20,20,20,.75); display: grid; place-items: center; cursor: pointer; opacity: .6; transition: opacity .15s; padding: 0; }
.slidev-laser-control:hover .toggle, .slidev-laser-control.open .toggle, .slidev-laser-control .toggle:focus-visible { opacity: 1; outline: 2px solid #fff; outline-offset: 2px; }
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
