<template>
  <div class="row g-3 mb-3">
    <!-- Search Input -->
    <div class="col-md-6">
      <div class="input-group">
        <span class="input-group-text">
          <i class="bi bi-search"></i>
        </span>
        <input ref="searchInputRef" v-model="localSearch" type="text" class="form-control" :placeholder="searchPlaceholder" @input="handleSearchInput" @focus="isInputFocused = true" @blur="isInputFocused = false" autocomplete="off" />
        <button v-if="localSearch" class="btn btn-outline-secondary" type="button" @click="clearSearch" title="Clear search" tabindex="-1">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>

    <!-- Status Filter -->
    <div class="col-md-4">
      <select v-model="localStatus" class="form-select" @change="handleStatusChange">
        <option value="">All {{ statusLabel }}s</option>
        <option v-for="status in statusOptions" :key="status" :value="status">
          {{ formatStatusLabel(status) }}
        </option>
      </select>
    </div>

    <!-- Clear Filters Button -->
    <div class="col-md-2">
      <button v-if="hasActiveFilters" class="btn btn-outline-secondary w-100" type="button" @click="clearAllFilters">
        <i class="bi bi-x-circle me-1"></i>Clear
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  search: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: ''
  },
  statusOptions: {
    type: Array,
    required: true
    // Array of status values: ['pending', 'completed', 'cancelled'] etc.
  },
  statusLabel: {
    type: String,
    default: 'Status'
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  debounceMs: {
    type: Number,
    default: 500
  }
})

const emit = defineEmits(['update:search', 'update:status', 'filter-change'])

const localSearch = ref(props.search)
const localStatus = ref(props.status)
const searchTimeout = ref(null)
const searchInputRef = ref(null)
const isInputFocused = ref(false)
let isInternalUpdate = false
let lastEmittedValue = props.search

// Watch for external changes (ignore our own updates and don't interfere while typing)
watch(() => props.search, (newVal) => {
  // Only sync if:
  // 1. Not from our own update
  // 2. Value actually changed
  // 3. Input is not focused (user not actively typing)
  // 4. Not the value we just emitted
  if (!isInternalUpdate && 
      localSearch.value !== newVal && 
      !isInputFocused.value && 
      lastEmittedValue !== newVal) {
    localSearch.value = newVal
    // Clear any pending timeout if external update happens
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
      searchTimeout.value = null
    }
  }
})

watch(() => props.status, (newVal) => {
  if (!isInternalUpdate && localStatus.value !== newVal) {
    localStatus.value = newVal
  }
})

const hasActiveFilters = computed(() => {
  return !!(localSearch.value || localStatus.value)
})

const handleSearchInput = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  searchTimeout.value = setTimeout(() => {
    const currentValue = localSearch.value
    lastEmittedValue = currentValue
    isInternalUpdate = true
    emit('update:search', currentValue)
    emit('filter-change', {
      search: currentValue,
      status: localStatus.value
    })
    // Reset flag after Vue processes the update
    setTimeout(() => {
      isInternalUpdate = false
    }, 0)
  }, props.debounceMs)
}

const handleStatusChange = () => {
  isInternalUpdate = true
  emit('update:status', localStatus.value)
  emit('filter-change', {
    search: localSearch.value,
    status: localStatus.value
  })
  setTimeout(() => {
    isInternalUpdate = false
  }, 0)
}

const clearSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = null
  }
  localSearch.value = ''
  isInternalUpdate = true
  emit('update:search', '')
  emit('filter-change', {
    search: '',
    status: localStatus.value
  })
  setTimeout(() => {
    isInternalUpdate = false
  }, 0)
}

const clearAllFilters = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = null
  }
  localSearch.value = ''
  localStatus.value = ''
  isInternalUpdate = true
  emit('update:search', '')
  emit('update:status', '')
  emit('filter-change', {
    search: '',
    status: ''
  })
  setTimeout(() => {
    isInternalUpdate = false
  }, 0)
}

const formatStatusLabel = (status) => {
  if (!status) return ''
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

// Cleanup timeout on unmount
onBeforeUnmount(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = null
  }
})
</script>

<style scoped>
.input-group {
  position: relative;
}

.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
  pointer-events: none;
  z-index: 1;
}

.input-group .form-control {
  border-left: none;
  padding-left: 0;
}

.input-group .form-control:focus {
  border-left: 1px solid #86b7fe;
  padding-left: calc(var(--bs-input-padding-x) - 1px);
  z-index: 2;
}

.input-group:focus-within .input-group-text {
  border-color: #86b7fe;
  z-index: 2;
}

.input-group:focus-within .btn {
  border-color: #86b7fe;
}

.form-control:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
</style>

