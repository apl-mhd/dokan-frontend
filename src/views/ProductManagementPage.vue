<template>
  <div class="container-fluid">
    <!-- Header -->
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

    <!-- Search and Filter -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Search products..."
            />
          </div>
          <div class="col-md-3">
            <select v-model="filterCategory" class="form-select">
              <option value="">All Categories</option>
              <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="filterUnit" class="form-select">
              <option value="">All Units</option>
              <option v-for="unit in unitStore.units" :key="unit.id" :value="unit.id">
                {{ unit.name }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100" @click="clearFilters">
              <i class="bi bi-x-circle me-2"></i>Clear
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="productStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <!-- Error -->
    <div v-if="productStore.error" class="alert alert-danger">
      {{ productStore.error }}
    </div>

    <!-- Products Table -->
    <div v-else class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Base Unit</th>
                <th>Purchase Price</th>
                <th>Sale Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in filteredProducts" :key="product.id">
                <td>
                  <strong>{{ product.name }}</strong>
                  <br />
                  <small class="text-muted">{{ product.sku }}</small>
                </td>
                <td>
                  <span class="badge bg-info" v-if="product.category_name">
                    {{ product.category_name }}
                  </span>
                  <span class="text-muted" v-else>-</span>
                </td>
                <td>{{ product.base_unit_name || '-' }}</td>
                <td>{{ formatCurrency(product.purchase_price) }}</td>
                <td>{{ formatCurrency(product.sale_price) }}</td>
                <td>
                  <span :class="getStockBadgeClass(product.total_stock)">
                    {{ product.total_stock || 0 }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="product.is_active ? 'bg-success' : 'bg-secondary'">
                    {{ product.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-info" @click="viewProduct(product)" title="View">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-primary" @click="editProduct(product)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" @click="confirmDelete(product)" title="Delete">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredProducts.length === 0">
                <td colspan="8" class="text-center text-muted py-4">
                  No products found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="productModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-box-seam me-2"></i>{{ isEditing ? 'Edit Product' : 'Add New Product' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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
                  <label class="form-label">SKU <span class="text-danger">*</span></label>
                  <input
                    v-model="formData.sku"
                    type="text"
                    class="form-control"
                    placeholder="Enter SKU"
                    required
                  />
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Category <span class="text-danger">*</span></label>
                  <select v-model="formData.category" class="form-select" required>
                    <option value="">Select category</option>
                    <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Base Unit <span class="text-danger">*</span></label>
                  <select v-model="formData.base_unit" class="form-select" required>
                    <option value="">Select unit</option>
                    <option v-for="unit in unitStore.units" :key="unit.id" :value="unit.id">
                      {{ unit.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Purchase Price <span class="text-danger">*</span></label>
                  <input
                    v-model.number="formData.purchase_price"
                    type="number"
                    step="0.01"
                    class="form-control"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Sale Price <span class="text-danger">*</span></label>
                  <input
                    v-model.number="formData.sale_price"
                    type="number"
                    step="0.01"
                    class="form-control"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea
                  v-model="formData.description"
                  class="form-control"
                  rows="3"
                  placeholder="Enter product description"
                ></textarea>
              </div>

              <div class="mb-3 form-check">
                <input
                  v-model="formData.is_active"
                  type="checkbox"
                  class="form-check-input"
                  id="isActive"
                />
                <label class="form-check-label" for="isActive">
                  Active Product
                </label>
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

    <!-- View Modal -->
    <div class="modal fade" id="viewModal" tabindex="-1" ref="viewModalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-box-seam me-2"></i>Product Details
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedProduct">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Product Name</label>
                <p class="fw-bold">{{ selectedProduct.name }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">SKU</label>
                <p class="fw-bold">{{ selectedProduct.sku }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Category</label>
                <p>{{ selectedProduct.category_name || '-' }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Base Unit</label>
                <p>{{ selectedProduct.base_unit_name || '-' }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Purchase Price</label>
                <p class="fw-bold text-success">{{ formatCurrency(selectedProduct.purchase_price) }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Sale Price</label>
                <p class="fw-bold text-primary">{{ formatCurrency(selectedProduct.sale_price) }}</p>
              </div>
              <div class="col-12 mb-3">
                <label class="text-muted small">Description</label>
                <p>{{ selectedProduct.description || 'No description' }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Status</label>
                <p>
                  <span class="badge" :class="selectedProduct.is_active ? 'bg-success' : 'bg-secondary'">
                    {{ selectedProduct.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Total Stock</label>
                <p :class="getStockTextClass(selectedProduct.total_stock)">
                  {{ selectedProduct.total_stock || 0 }} {{ selectedProduct.base_unit_name }}
                </p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '../stores/product.store'
import { useCategoryStore } from '../stores/category.store'
import { useUnitStore } from '../stores/unit.store'
import { Modal } from 'bootstrap'

const productStore = useProductStore()
const categoryStore = useCategoryStore()
const unitStore = useUnitStore()

const modalRef = ref(null)
const viewModalRef = ref(null)
let modalInstance = null
let viewModalInstance = null

const isEditing = ref(false)
const selectedProduct = ref(null)
const searchQuery = ref('')
const filterCategory = ref('')
const filterUnit = ref('')

const formData = ref({
  name: '',
  sku: '',
  category: '',
  base_unit: '',
  purchase_price: 0,
  sale_price: 0,
  description: '',
  is_active: true
})

onMounted(() => {
  productStore.fetchProducts()
  categoryStore.fetchCategories()
  unitStore.fetchUnits()
})

const filteredProducts = computed(() => {
  let products = productStore.products

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query)
    )
  }

  if (filterCategory.value) {
    products = products.filter(p => p.category === parseInt(filterCategory.value))
  }

  if (filterUnit.value) {
    products = products.filter(p => p.base_unit === parseInt(filterUnit.value))
  }

  return products
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
    sku: product.sku,
    category: product.category,
    base_unit: product.base_unit,
    purchase_price: parseFloat(product.purchase_price),
    sale_price: parseFloat(product.sale_price),
    description: product.description || '',
    is_active: product.is_active
  }
  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value)
  }
  modalInstance.show()
}

const viewProduct = (product) => {
  selectedProduct.value = product
  if (!viewModalInstance) {
    viewModalInstance = new Modal(viewModalRef.value)
  }
  viewModalInstance.show()
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
  if (confirm(`Delete product "${product.name}"? This action cannot be undone.`)) {
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
    sku: '',
    category: '',
    base_unit: '',
    purchase_price: 0,
    sale_price: 0,
    description: '',
    is_active: true
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  filterCategory.value = ''
  filterUnit.value = ''
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0)
}

const getStockBadgeClass = (stock) => {
  const s = stock || 0
  if (s === 0) return 'badge bg-danger'
  if (s < 10) return 'badge bg-warning'
  return 'badge bg-success'
}

const getStockTextClass = (stock) => {
  const s = stock || 0
  if (s === 0) return 'text-danger fw-bold'
  if (s < 10) return 'text-warning fw-bold'
  return 'text-success fw-bold'
}
</script>

<style scoped>
.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}
</style>

