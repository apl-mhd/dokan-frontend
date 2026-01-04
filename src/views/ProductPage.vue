<template>
  <div class="container-fluid">
    <div class="row mb-4">
      <div class="col">
        <h2 class="mb-3">
          <i class="bi bi-box-seam me-2"></i>Product Management
        </h2>
      </div>
      <div class="col-auto">
        <button class="btn btn-primary" @click="showCreateModal">
          <i class="bi bi-plus-circle me-2"></i>Add Product
        </button>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="productStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="productStore.error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ productStore.error }}
    </div>

    <!-- Products Table -->
    <div v-else class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Base Unit</th>
                <th>Description</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in productStore.products" :key="product.id">
                <td>{{ product.id }}</td>
                <td>
                  <strong>{{ product.name }}</strong>
                </td>
                <td>
                  <span class="badge bg-secondary">{{ product.category_name || 'N/A' }}</span>
                </td>
                <td>{{ product.base_unit_name || 'N/A' }}</td>
                <td>{{ product.description || '-' }}</td>
                <td>{{ formatDate(product.created_at) }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-2" @click="editProduct(product)" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(product)" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="productStore.products.length === 0 && !productStore.loading">
                <td colspan="7" class="text-center text-muted py-4">
                  No products found. Click "Add Product" to create one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="productModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Product' : 'Add New Product' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProduct">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Product Name <span class="text-danger">*</span></label>
                  <input
                    v-model="formData.name"
                    type="text"
                    class="form-control"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Category <span class="text-danger">*</span></label>
                  <input
                    v-model="formData.category"
                    type="number"
                    class="form-control"
                    placeholder="Category ID"
                    required
                  />
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Base Unit</label>
                  <input
                    v-model="formData.base_unit"
                    type="number"
                    class="form-control"
                    placeholder="Base Unit ID"
                  />
                </div>

                <div class="col-md-12 mb-3">
                  <label class="form-label">Description</label>
                  <textarea
                    v-model="formData.description"
                    class="form-control"
                    rows="3"
                    placeholder="Enter product description"
                  ></textarea>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveProduct">
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
import { useProductStore } from '../stores/product.store'
import { Modal } from 'bootstrap'

const productStore = useProductStore()
const modalRef = ref(null)
let modalInstance = null
const isEditing = ref(false)
const selectedProduct = ref(null)

const formData = ref({
  name: '',
  category: null,
  base_unit: null,
  description: ''
})

onMounted(() => {
  productStore.fetchProducts()
})

const showCreateModal = () => {
  isEditing.value = false
  selectedProduct.value = null
  resetForm()
  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value)
  }
  modalInstance.show()
}

const editProduct = (product) => {
  isEditing.value = true
  selectedProduct.value = product
  formData.value = {
    name: product.name,
    category: product.category,
    base_unit: product.base_unit,
    description: product.description || ''
  }
  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value)
  }
  modalInstance.show()
}

const saveProduct = async () => {
  try {
    if (isEditing.value) {
      await productStore.updateProduct(selectedProduct.value.id, formData.value)
    } else {
      await productStore.createProduct(formData.value)
    }
    modalInstance.hide()
    resetForm()
  } catch (error) {
    alert('Error saving product: ' + (error.response?.data?.message || error.message))
  }
}

const confirmDelete = async (product) => {
  if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
    try {
      await productStore.deleteProduct(product.id)
    } catch (error) {
      alert('Error deleting product: ' + (error.response?.data?.message || error.message))
    }
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    category: null,
    base_unit: null,
    description: ''
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.table th {
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.85rem;
  font-weight: 500;
}
</style>

