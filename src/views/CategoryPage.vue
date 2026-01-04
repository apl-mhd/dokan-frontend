<template>
  <div class="container-fluid">
    <div class="row mb-4">
      <div class="col">
        <h2 class="mb-3">
          <i class="bi bi-tags me-2"></i>Product Categories
        </h2>
      </div>
      <div class="col-auto">
        <button class="btn btn-primary" @click="showCreateModal">
          <i class="bi bi-plus-circle me-2"></i>Add Category
        </button>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="categoryStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="categoryStore.error" class="alert alert-danger alert-dismissible" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ categoryStore.error }}
      <button type="button" class="btn-close" @click="categoryStore.error = null"></button>
    </div>

    <!-- Categories Grid -->
    <div v-else class="row g-4">
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
                    <a class="dropdown-item" href="#" @click.prevent="editCategory(category)">
                      <i class="bi bi-pencil me-2"></i>Edit
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item text-danger" href="#" @click.prevent="confirmDelete(category)">
                      <i class="bi bi-trash me-2"></i>Delete
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            <p class="card-text text-muted small" v-if="category.description">
              {{ category.description }}
            </p>
            <p class="card-text text-muted small" v-else>
              <em>No description</em>
            </p>
            
            <div class="mt-3 pt-3 border-top">
              <small class="text-muted">
                <i class="bi bi-calendar me-1"></i>
                Created: {{ formatDate(category.created_at) }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="categoryStore.categories.length === 0 && !categoryStore.loading" class="col-12">
        <div class="text-center py-5">
          <i class="bi bi-tags display-1 text-muted"></i>
          <p class="mt-3 text-muted">No categories found. Click "Add Category" to create one.</p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="categoryModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-tag me-2"></i>{{ isEditing ? 'Edit Category' : 'Add New Category' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCategory">
              <div class="mb-3">
                <label class="form-label">Category Name <span class="text-danger">*</span></label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="form-control"
                  placeholder="Enter category name"
                  required
                  maxlength="128"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea
                  v-model="formData.description"
                  class="form-control"
                  rows="3"
                  placeholder="Enter category description (optional)"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveCategory">
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
import { Modal } from 'bootstrap'

const categoryStore = useCategoryStore()
const modalRef = ref(null)
let modalInstance = null
const isEditing = ref(false)
const selectedCategory = ref(null)

const formData = ref({
  name: '',
  description: ''
})

onMounted(() => {
  categoryStore.fetchCategories()
})

const showCreateModal = () => {
  isEditing.value = false
  selectedCategory.value = null
  resetForm()
  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value)
  }
  modalInstance.show()
}

const editCategory = (category) => {
  isEditing.value = true
  selectedCategory.value = category
  formData.value = {
    name: category.name,
    description: category.description || ''
  }
  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value)
  }
  modalInstance.show()
}

const saveCategory = async () => {
  try {
    if (isEditing.value) {
      await categoryStore.updateCategory(selectedCategory.value.id, formData.value)
    } else {
      await categoryStore.createCategory(formData.value)
    }
    modalInstance.hide()
    resetForm()
  } catch (error) {
    alert('Error saving category: ' + (error.response?.data?.message || error.message))
  }
}

const confirmDelete = async (category) => {
  if (confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
    try {
      await categoryStore.deleteCategory(category.id)
    } catch (error) {
      alert('Error deleting category: ' + (error.response?.data?.message || error.message))
    }
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    description: ''
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.category-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.dropdown-toggle::after {
  display: none;
}
</style>

