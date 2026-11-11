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
  const vars = resolveLaser($slidev.configs.laserPointer as any)
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
