<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <PageHeader title="Product Categories" icon="bi-tags">
      <template #actions>
        <button class="btn btn-primary" @click="handleCreate">
          <i class="bi bi-plus-circle me-2"></i>Add Category
        </button>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <LoadingSpinner v-if="categoryStore.loading" />

    <!-- Error State -->
    <ErrorAlert :error="categoryStore.error" title="Error" dismissible @dismiss="categoryStore.error = null" />

    <!-- Data Table -->
    <DataTable
      v-if="!categoryStore.loading"
      :columns="columns"
      :items="categoryStore.categories || []"
      :pagination="paginationData"
      empty-message="No categories found. Click 'Add Category' to create one."
      @page-change="handlePageChange"
    >
      <template #filters>
        <DataTableFilters v-model:search="filters.search" :status-options="[]" :status-label="''" search-placeholder="Search by name or description..." @filter-change="handleFilterChange" />
      </template>
      <template #body="{ items }">
        <tr v-for="category in items" :key="category.id">
          <td>{{ category.id }}</td>
          <td><strong>{{ category.name }}</strong></td>
          <td>{{ truncate(category.description, 80) || 'No description' }}</td>
          <td>{{ formatDate(category.created_at) }}</td>
          <td>
            <button
              class="btn btn-sm btn-outline-primary me-2"
              @click="handleEdit(category)"
              title="Edit"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              @click="handleDelete(category)"
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
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Category' : 'Add New Category' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSave">
              <div class="mb-3">
                <label class="form-label">Category Name <span class="text-danger">*</span></label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="form-control"
                  placeholder="Enter category name"
                  required
                  maxlength="255"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea
                  v-model="formData.description"
                  class="form-control"
                  rows="3"
                  placeholder="Enter category description"
                ></textarea>
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
import { useCategoryStore } from '../stores/category.store'
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
const categoryStore = useCategoryStore()

// Composables
const { modalRef, show: showModal, hide: hideModal } = useModal()
const { formatDate, truncate } = useFormatter()
const { confirmDelete } = useConfirm()
const pagination = usePagination(10)

// State
const isEditing = ref(false)
const selectedCategory = ref(null)
const filters = ref({
  search: ''
})

const formData = ref({
  name: '',
  description: ''
})

// Table columns definition
const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'created_at', label: 'Created At' },
  { key: 'actions', label: 'Actions', width: '150px' }
]

// Computed pagination data for DataTable
const paginationData = computed(() => ({
  currentPage: pagination.currentPage.value,
  totalPages: pagination.totalPages.value,
  totalItems: pagination.totalItems.value,
  startIndex: pagination.startIndex.value,
  endIndex: pagination.endIndex.value,
  hasNextPage: pagination.hasNextPage.value,
  hasPrevPage: pagination.hasPrevPage.value
}))

// Lifecycle
onMounted(async () => {
  await fetchCategories()
})

// Methods
const fetchCategories = async () => {
  const params = pagination.getParams()
  
  // Add search parameter
  if (filters.value.search) {
    params.search = filters.value.search
  }
  
  await categoryStore.fetchCategories(params)
  if (categoryStore.pagination) {
    pagination.updateFromResponse(categoryStore.pagination)
  }
}

const handlePageChange = async (page) => {
  pagination.goToPage(page)
  await fetchCategories()
}

const handleFilterChange = async () => {
  // Reset to first page when filters change
  pagination.goToPage(1)
  await fetchCategories()
}

const handleCreate = () => {
  isEditing.value = false
  selectedCategory.value = null
  resetForm()
  showModal()
}

const handleEdit = (category) => {
  isEditing.value = true
  selectedCategory.value = category
  formData.value = {
    name: category.name,
    description: category.description || ''
  }
  showModal()
}

const handleSave = async () => {
  try {
    if (isEditing.value) {
      await categoryStore.updateCategory(selectedCategory.value.id, formData.value)
    } else {
      await categoryStore.createCategory(formData.value)
    }
    hideModal()
    resetForm()
    await fetchCategories()
  } catch (error) {
    console.error('Error saving category:', error)
    // Error is handled by store and displayed in ErrorAlert
  }
}

const handleDelete = async (category) => {
  const confirmed = await confirmDelete(category.name, 'category')
  if (confirmed) {
    try {
      await categoryStore.deleteCategory(category.id)
      await fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      // Error is handled by store and displayed in ErrorAlert
    }
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    description: ''
  }
}
</script>

