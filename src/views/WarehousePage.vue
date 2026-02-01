<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <PageHeader title="Warehouse Management" icon="bi-building">
      <template #actions>
        <button class="btn btn-primary" @click="handleCreate">
          <i class="bi bi-plus-circle me-2"></i>Add Warehouse
        </button>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <LoadingSpinner v-if="warehouseStore.loading" />

    <!-- Error State -->
    <ErrorAlert :error="warehouseStore.error" title="Error" dismissible @dismiss="warehouseStore.error = null" />

    <!-- Data Table -->
    <DataTable
      v-if="!warehouseStore.loading"
      :columns="columns"
      :items="displayedItems"
      :pagination="paginationData"
      empty-message="No warehouses found. Click 'Add Warehouse' to create one."
      @page-change="handlePageChange"
    >
      <template #filters>
        <DataTableFilters
          :search="filters.search"
          @update:search="(v) => { filters.value.search = v }"
          :status-options="[]"
          :status-label="''"
          search-placeholder="Search by name or location..."
          @filter-change="handleFilterChange"
        />
      </template>
      <template #body="{ items }">
        <tr v-for="warehouse in items" :key="warehouse.id">
          <td>{{ warehouse.id }}</td>
          <td><strong>{{ warehouse.name }}</strong></td>
          <td>{{ truncate(warehouse.location, 40) || '-' }}</td>
          <td>{{ formatDate(warehouse.created_at) }}</td>
          <td>
            <button
              class="btn btn-sm btn-outline-primary me-2"
              @click="handleEdit(warehouse)"
              title="Edit"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              @click="handleDelete(warehouse)"
              title="Delete"
            >
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <div class="modal fade" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Warehouse' : 'Add New Warehouse' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSave">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Warehouse Name <span class="text-danger">*</span></label>
                  <input
                    v-model="formData.name"
                    type="text"
                    class="form-control"
                    placeholder="Enter warehouse name"
                    required
                    maxlength="255"
                  />
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Location</label>
                  <input
                    v-model="formData.location"
                    type="text"
                    class="form-control"
                    placeholder="Enter warehouse location"
                    maxlength="255"
                  />
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="handleSave">
              <i class="bi bi-save me-2"></i>{{ isEditing ? 'Update' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useWarehouseStore } from '../stores/warehouse.store'
import { useModal } from '../composables/useModal'
import { useFormatter } from '../composables/useFormatter'
import { useConfirm } from '../composables/useConfirm'
import { usePagination } from '../composables/usePagination'

// Components
import PageHeader from '../components/common/PageHeader.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorAlert from '../components/common/ErrorAlert.vue'
import DataTable from '../components/common/DataTable.vue'
import DataTableFilters from '../components/common/DataTableFilters.vue'

// Stores
const warehouseStore = useWarehouseStore()

// Composables
const { modalRef, show: showModal, hide: hideModal } = useModal()
const { formatDate, truncate } = useFormatter()
const { confirmDelete } = useConfirm()
const pagination = usePagination(10)

// State
const isEditing = ref(false)
const selectedWarehouse = ref(null)
const filters = ref({ search: '' })

const formData = ref({
  name: '',
  location: ''
})

// Table columns definition
const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Name' },
  { key: 'location', label: 'Location' },
  { key: 'created_at', label: 'Created At', width: '150px' },
  { key: 'actions', label: 'Actions', width: '150px' }
]

// Filtered warehouses (client-side search)
const filteredWarehouses = computed(() => {
  const list = warehouseStore.warehouses || []
  const q = (filters.value.search || '').toLowerCase().trim()
  if (!q) return list
  return list.filter(
    (w) =>
      (w.name || '').toLowerCase().includes(q) ||
      (w.location || '').toLowerCase().includes(q)
  )
})

// Paginated slice for display
const displayedItems = computed(() => {
  const list = filteredWarehouses.value
  const start = (pagination.currentPage.value - 1) * pagination.pageSize.value
  return list.slice(start, start + pagination.pageSize.value)
})

// Computed pagination data for DataTable (client-side)
const paginationData = computed(() => {
  const total = filteredWarehouses.value.length
  const start = (pagination.currentPage.value - 1) * pagination.pageSize.value + 1
  const end = Math.min(pagination.currentPage.value * pagination.pageSize.value, total)
  const totalPages = Math.ceil(total / pagination.pageSize.value) || 1
  return {
    currentPage: pagination.currentPage.value,
    totalPages,
    totalItems: total,
    startIndex: total > 0 ? start : 0,
    endIndex: total > 0 ? end : 0,
    hasNextPage: pagination.currentPage.value < totalPages,
    hasPrevPage: pagination.currentPage.value > 1
  }
})

// Lifecycle
onMounted(async () => {
  await fetchWarehouses()
})

// Methods
const fetchWarehouses = async () => {
  await warehouseStore.fetchWarehouses()
}

const handlePageChange = (page) => {
  pagination.goToPage(page)
}

const handleFilterChange = () => {
  pagination.goToPage(1)
}

const handleCreate = () => {
  isEditing.value = false
  selectedWarehouse.value = null
  resetForm()
  showModal()
}

const handleEdit = (warehouse) => {
  isEditing.value = true
  selectedWarehouse.value = warehouse
  formData.value = {
    name: warehouse.name,
    location: warehouse.location || ''
  }
  showModal()
}

const handleSave = async () => {
  try {
    if (isEditing.value) {
      await warehouseStore.updateWarehouse(selectedWarehouse.value.id, formData.value)
    } else {
      await warehouseStore.createWarehouse(formData.value)
    }
    hideModal()
    resetForm()
    await fetchWarehouses()
  } catch (error) {
    console.error('Error saving warehouse:', error)
    // Error is handled by store and displayed in ErrorAlert
  }
}

const handleDelete = async (warehouse) => {
  const confirmed = await confirmDelete(warehouse.name, 'warehouse')
  if (confirmed) {
    try {
      await warehouseStore.deleteWarehouse(warehouse.id)
      await fetchWarehouses()
    } catch (error) {
      console.error('Error deleting warehouse:', error)
      // Error is handled by store and displayed in ErrorAlert
    }
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    location: ''
  }
}
</script>
