<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { onScopeDispose, watchEffect } from 'vue'
import LaserControl from './src/LaserControl.vue'
import { resolveEffective } from './src/effective'
import { getApplier, override } from './src/overrideState'

const { $slidev } = useSlideContext()
const owner = Symbol('global-top')
const applier = getApplier()

watchEffect(() => {
  const { vars, warning } = resolveEffective(
    $slidev.configs.laserPointer as any,
    override.value,
    { isColor: c => CSS.supports('color', c) },
  )
  // Fail soft during a talk: keep going with what is valid, but say why.
  if (warning)
    console.warn(`[slidev-addon-laser-pointer] ${warning}; ignoring the deck's laserPointer config.`)
  applier.set(owner, vars)
})

onScopeDispose(() => applier.release(owner))
</script>

<template>
  <LaserControl />
</template>
