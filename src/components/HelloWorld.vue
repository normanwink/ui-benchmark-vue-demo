<!--
  Component rules:
  - Must contain a <h1> with "Hello World!"
  - Text must be centered by CSS
  - Must include / import a CSS file
-->

<template>
  <div class="full-width">
    <h1 class="text-center">Hello World!</h1>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
}
</script>

<style scoped>
.full-width {
  width: 100%;
}

.text-center {
  text-align: center;
}
</style>
