<template>
  <div v-if="error" class="alert" :class="alertClass" role="alert">
    <i :class="`bi ${icon} me-2`"></i>
    <span v-if="title" class="fw-bold">{{ title }}: </span>
    {{ errorMessage }}
    <button
      v-if="dismissible"
      type="button"
      class="btn-close"
      @click="$emit('dismiss')"
      aria-label="Close"
    ></button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  error: {
    type: [String, Object, Error],
    default: null
  },
  title: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'danger',
    validator: (value) => ['danger', 'warning', 'info', 'success'].includes(value)
  },
  dismissible: {
    type: Boolean,
    default: false
  }
})

defineEmits(['dismiss'])

const alertClass = computed(() => {
  const classes = [`alert-${props.variant}`]
  if (props.dismissible) classes.push('alert-dismissible fade show')
  return classes.join(' ')
})

const icon = computed(() => {
  const iconMap = {
    danger: 'bi-exclamation-triangle',
    warning: 'bi-exclamation-circle',
    info: 'bi-info-circle',
    success: 'bi-check-circle'
  }
  return iconMap[props.variant] || 'bi-exclamation-triangle'
})

const errorMessage = computed(() => {
  if (!props.error) return ''
  if (typeof props.error === 'string') return props.error
  if (props.error.message) return props.error.message
  if (props.error.response?.data?.message) return props.error.response.data.message
  if (props.error.response?.data?.detail) return props.error.response.data.detail
  return 'An error occurred'
})
</script>

