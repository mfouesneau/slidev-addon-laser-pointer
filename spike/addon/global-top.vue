<script setup lang="ts">
// THROWAWAY spike: expose Slidev's shared state to the test script.
import { sharedState } from '@slidev/client'

const w = window as any
w.__shared = sharedState
</script>
<template><div hidden /></template>
