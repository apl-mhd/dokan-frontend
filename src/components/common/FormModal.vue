<template>
  <div class="modal fade" tabindex="-1" aria-hidden="true" ref="modalRef">
    <div class="modal-dialog" :class="modalSizeClass">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer" v-if="$slots.footer || showDefaultFooter">
          <slot name="footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="$emit('save')"
              :disabled="saveDisabled"
            >
              <i class="bi bi-save me-2"></i>{{ saveText }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  saveText: {
    type: String,
    default: 'Save'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  saveDisabled: {
    type: Boolean,
    default: false
  },
  showDefaultFooter: {
    type: Boolean,
    default: true
  }
})

defineEmits(['save'])

const modalSizeClass = computed(() => {
  const sizeMap = {
    sm: 'modal-sm',
    md: '',
    lg: 'modal-lg',
    xl: 'modal-xl'
  }
  return sizeMap[props.size] || ''
})
</script>

