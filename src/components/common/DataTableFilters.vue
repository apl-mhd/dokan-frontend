<template>
  <div class="row g-3 mb-3">
    <!-- Search Input -->
    <div class="col-md-6">
      <div class="input-group">
        <span class="input-group-text">
          <i class="bi bi-search"></i>
        </span>
        <input v-model="localSearch" type="text" class="form-control" :placeholder="searchPlaceholder" @input="handleSearchInput" />
        <button v-if="localSearch" class="btn btn-outline-secondary" type="button" @click="clearSearch" title="Clear search">
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
import { ref, computed, watch } from 'vue'

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

// Watch for external changes
watch(() => props.search, (newVal) => {
  localSearch.value = newVal
})

watch(() => props.status, (newVal) => {
  localStatus.value = newVal
})

const hasActiveFilters = computed(() => {
  return !!(localSearch.value || localStatus.value)
})

let searchTimeout = null

const handleSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('update:search', localSearch.value)
    emit('filter-change', {
      search: localSearch.value,
      status: localStatus.value
    })
  }, props.debounceMs)
}

const handleStatusChange = () => {
  emit('update:status', localStatus.value)
  emit('filter-change', {
    search: localSearch.value,
    status: localStatus.value
  })
}

const clearSearch = () => {
  localSearch.value = ''
  emit('update:search', '')
  emit('filter-change', {
    search: '',
    status: localStatus.value
  })
}

const clearAllFilters = () => {
  localSearch.value = ''
  localStatus.value = ''
  emit('update:search', '')
  emit('update:status', '')
  emit('filter-change', {
    search: '',
    status: ''
  })
}

const formatStatusLabel = (status) => {
  if (!status) return ''
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}
</script>

<style scoped>
.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
}

.form-control:focus + .input-group-text,
.form-control:focus ~ .btn {
  border-color: #86b7fe;
}
</style>

