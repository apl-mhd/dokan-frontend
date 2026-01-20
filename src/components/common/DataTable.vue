<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <!-- Search/Filter Section -->
      <div v-if="$slots.filters" class="mb-3">
        <slot name="filters"></slot>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th v-for="column in columns" :key="column.key" :style="column.width ? `width: ${column.width}` : ''">
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Custom body slot (if provided) -->
            <slot name="body" :items="items"></slot>
            
            <!-- Auto-render rows if no body slot provided -->
            <template v-if="!$slots.body">
              <tr v-for="item in items" :key="item.id || item.name">
                <td v-for="column in columns" :key="column.key">
                  <!-- Custom column slot -->
                  <slot v-if="$slots[column.key]" :name="column.key" :item="item"></slot>
                  <!-- Default rendering -->
                  <span v-else>{{ item[column.key] }}</span>
                </td>
              </tr>
            </template>
            
            <!-- Empty State -->
            <tr v-if="items.length === 0 && !loading">
              <td :colspan="columns.length" class="text-center text-muted py-4">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                {{ emptyMessage }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && items.length > 0" class="d-flex justify-content-between align-items-center mt-3">
        <div class="text-muted small">
          Showing {{ pagination.startIndex }} to {{ pagination.endIndex }} of {{ pagination.totalItems }} entries
        </div>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: !pagination.hasPrevPage }">
              <a class="page-link" href="#" @click.prevent="$emit('page-change', pagination.currentPage - 1)">
                Previous
              </a>
            </li>
            <li
              v-for="page in displayPages"
              :key="page"
              class="page-item"
              :class="{ active: page === pagination.currentPage }"
            >
              <a class="page-link" href="#" @click.prevent="$emit('page-change', page)">
                {{ page }}
              </a>
            </li>
            <li class="page-item" :class="{ disabled: !pagination.hasNextPage }">
              <a class="page-link" href="#" @click.prevent="$emit('page-change', pagination.currentPage + 1)">
                Next
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    // Each column: { key: string, label: string, width?: string }
  },
  items: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: 'No data found'
  },
  pagination: {
    type: Object,
    default: null
    // Expected: { currentPage, totalPages, totalItems, startIndex, endIndex, hasNextPage, hasPrevPage }
  }
})

defineEmits(['page-change'])

const displayPages = computed(() => {
  if (!props.pagination) return []
  
  const { currentPage, totalPages } = props.pagination
  const pages = []
  const maxDisplayed = 5
  
  let startPage = Math.max(1, currentPage - Math.floor(maxDisplayed / 2))
  let endPage = Math.min(totalPages, startPage + maxDisplayed - 1)
  
  if (endPage - startPage < maxDisplayed - 1) {
    startPage = Math.max(1, endPage - maxDisplayed + 1)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  
  return pages
})
</script>

<style scoped>
.table th {
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

.pagination {
  margin: 0;
}
</style>

