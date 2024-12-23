<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import DataFetcher from './components/DataFetcher.vue'
</script>

<!--
  Component rules:
  - Must include the HelloWorld component
  - Must include the DataFetcher component
  - Must include / import a CSS file
-->

<template>
  <div class="root">
    <HelloWorld />
    <DataFetcher />
  </div>
</template>

<style scoped>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
