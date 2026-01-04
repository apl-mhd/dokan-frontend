<template>
  <div class="empty-state text-center py-5">
    <i :class="`bi ${icon} empty-state-icon`"></i>
    <h4 class="mt-3 mb-2">{{ title }}</h4>
    <p class="text-muted mb-4">{{ message }}</p>
    <slot name="action">
      <button v-if="actionText" class="btn btn-primary" @click="$emit('action')">
        <i v-if="actionIcon" :class="`bi ${actionIcon} me-2`"></i>
        {{ actionText }}
      </button>
    </slot>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'bi-inbox'
  },
  title: {
    type: String,
    default: 'No Data Found'
  },
  message: {
    type: String,
    default: 'There are no items to display.'
  },
  actionText: {
    type: String,
    default: ''
  },
  actionIcon: {
    type: String,
    default: 'bi-plus-circle'
  }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state-icon {
  font-size: 4rem;
  color: #dee2e6;
}

.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>

