<template>
  <div class="text-center" :class="containerClass">
    <div class="spinner-border" :class="spinnerClass" role="status">
      <span class="visually-hidden">{{ message }}</span>
    </div>
    <div v-if="showMessage" class="mt-2 text-muted">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: 'Loading...'
  },
  showMessage: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info'].includes(value)
  },
  containerClass: {
    type: String,
    default: 'py-5'
  }
})

const spinnerClass = computed(() => {
  const classes = []
  if (props.size === 'sm') classes.push('spinner-border-sm')
  if (props.variant) classes.push(`text-${props.variant}`)
  return classes.join(' ')
})
</script>

