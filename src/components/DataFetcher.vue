<!--
  Component rules:
  - Must load additional data once the component is ready
  - Must show placeholder text "Loading..." while it's loading
  - Must replace placeholder with actual data from response
-->

<template>
  <p>{{ message }}</p>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'DataFetcher',
  setup() {
    // Declare reactive state
    const message = ref('Loading...');

    // onMounted runs once after the component is mounted
    onMounted(async () => {
      try {
        const response = await fetch('http://localhost:3000/test');
        const data = await response.json();
        message.value = data.text;
      } catch (error) {
        console.error('Error fetching data:', error);
        message.value = 'Error fetching data';
      }
    })

    return {
      message
    }
  }
}
</script>

<style scoped>
/* Optional: local styling */
</style>
