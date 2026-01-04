<template>
  <div class="row mb-4">
    <div class="col">
      <h2 class="mb-3">
        <i v-if="icon" :class="`bi ${icon} me-2`"></i>
        {{ title }}
      </h2>
    </div>
    <div class="col-auto" v-if="$slots.actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
h2 {
  font-weight: 600;
  color: #2c3e50;
}
</style>

