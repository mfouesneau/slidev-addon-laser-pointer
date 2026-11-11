<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { onScopeDispose, watchEffect } from 'vue'
import { resolveLaser } from './src/resolveLaser'

const { $slidev } = useSlideContext()
const ACTIVE_CLASS = 'slidev-laser-custom'
const root = document.documentElement
let applied: string[] = []

function clear() {
  for (const name of applied)
    root.style.removeProperty(name)
  applied = []
  root.classList.remove(ACTIVE_CLASS)
}

watchEffect(() => {
  clear()
  let vars: Record<string, string> | null
  try {
    vars = resolveLaser($slidev.configs.laserPointer as any, { isColor: c => CSS.supports('color', c) })
  }
  catch (err) {
    // Fail soft during a talk: keep the stock pointer, but say why.
    console.warn(`[slidev-addon-laser-pointer] ${(err as Error).message}; using the stock pointer.`)
    return
  }
  if (!vars)
    return
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value)
    applied.push(name)
  }
  root.classList.add(ACTIVE_CLASS)
})

onScopeDispose(clear)
</script>

<template>
  <div hidden />
</template>
