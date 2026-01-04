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

    <!-- Categories Grid -->
    <div v-if="!categoryStore.loading && categoryStore.categories.length > 0" class="row g-4">
      <div v-for="category in categoryStore.categories" :key="category.id" class="col-md-4 col-lg-3">
        <div class="card h-100 shadow-sm category-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h5 class="card-title mb-0">
                <i class="bi bi-tag-fill text-primary me-2"></i>{{ category.name }}
              </h5>
              <div class="dropdown">
                <button class="btn btn-sm btn-link text-muted" type="button" data-bs-toggle="dropdown">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="handleEdit(category)">
                      <i class="bi bi-pencil me-2"></i>Edit
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item text-danger" href="#" @click.prevent="handleDelete(category)">
                      <i class="bi bi-trash me-2"></i>Delete
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <p class="card-text text-muted small">
              {{ truncate(category.description, 80) || 'No description' }}
            </p>
            <div class="mt-3">
              <span class="badge bg-light text-dark border">
                <i class="bi bi-box me-1"></i>ID: {{ category.id }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-if="!categoryStore.loading && categoryStore.categories.length === 0"
      icon="bi-tags"
      title="No Categories Found"
      message="Start by creating your first product category."
      action-text="Add Category"
      @action="handleCreate"
    />

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
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '../stores/category.store'
import { useModal } from '../composables/useModal'
import { useFormatter } from '../composables/useFormatter'
import { useConfirm } from '../composables/useConfirm'

// Components
import PageHeader from '../components/common/PageHeader.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorAlert from '../components/common/ErrorAlert.vue'
import EmptyState from '../components/common/EmptyState.vue'

// Stores
const categoryStore = useCategoryStore()

// Composables
const { modalRef, show: showModal, hide: hideModal } = useModal()
const { truncate } = useFormatter()
const { confirmDelete } = useConfirm()

// State
const isEditing = ref(false)
const selectedCategory = ref(null)

const formData = ref({
  name: '',
  description: ''
})

// Lifecycle
onMounted(async () => {
  await categoryStore.fetchCategories()
})

// Methods
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

<style scoped>
.category-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-title {
  font-size: 1.1rem;
  color: #2c3e50;
}
</style>
