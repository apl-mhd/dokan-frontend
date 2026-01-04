<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <PageHeader title="Product Management" icon="bi-box-seam">
      <template #actions>
        <button class="btn btn-primary" @click="handleCreate">
          <i class="bi bi-plus-circle me-2"></i>Add Product
        </button>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <LoadingSpinner v-if="productStore.loading" />

    <!-- Error State -->
    <ErrorAlert :error="productStore.error" title="Error" dismissible @dismiss="productStore.error = null" />

    <!-- Data Table -->
    <DataTable
      v-if="!productStore.loading"
      :columns="columns"
      :items="productStore.products || []"
      :pagination="paginationData"
      empty-message="No products found. Click 'Add Product' to create one."
      @page-change="handlePageChange"
    >
      <template #body="{ items }">
        <tr v-for="product in items" :key="product.id">
          <td>{{ product.id }}</td>
          <td><strong>{{ product.name }}</strong></td>
          <td>
            <span class="badge bg-secondary">{{ product.category_name || 'N/A' }}</span>
          </td>
          <td>{{ product.base_unit_name || 'N/A' }}</td>
          <td>{{ truncate(product.description, 50) }}</td>
          <td>{{ formatDate(product.created_at) }}</td>
          <td>
            <button
              class="btn btn-sm btn-outline-primary me-2"
              @click="handleEdit(product)"
              title="Edit"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              @click="handleDelete(product)"
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
            <h5 class="modal-title">{{ isEditing ? 'Edit Product' : 'Add New Product' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSave">
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
import { useProductStore } from '../stores/product.store'
import { useModal } from '../composables/useModal'
import { useFormatter } from '../composables/useFormatter'
import { useConfirm } from '../composables/useConfirm'
import { usePagination } from '../composables/usePagination'

// Components
import PageHeader from '../components/common/PageHeader.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorAlert from '../components/common/ErrorAlert.vue'
import DataTable from '../components/common/DataTable.vue'

// Stores
const productStore = useProductStore()

// Composables
const { modalRef, show: showModal, hide: hideModal } = useModal()
const { formatDate, truncate } = useFormatter()
const { confirmDelete } = useConfirm()
const pagination = usePagination(10)

// State
const isEditing = ref(false)
const selectedProduct = ref(null)

const formData = ref({
  name: '',
  category: null,
  base_unit: null,
  description: ''
})

// Table columns definition
const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'base_unit', label: 'Base Unit' },
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
  await fetchProducts()
})

// Methods
const fetchProducts = async () => {
  await productStore.fetchProducts(pagination.getParams())
  if (productStore.pagination) {
    pagination.updateFromResponse(productStore.pagination)
  }
}

const handlePageChange = async (page) => {
  pagination.goToPage(page)
  await fetchProducts()
}

const handleCreate = () => {
  isEditing.value = false
  selectedProduct.value = null
  resetForm()
  showModal()
}

const handleEdit = (product) => {
  isEditing.value = true
  selectedProduct.value = product
  formData.value = {
    name: product.name,
    category: product.category,
    base_unit: product.base_unit,
    description: product.description || ''
  }
  showModal()
}

const handleSave = async () => {
  try {
    if (isEditing.value) {
      await productStore.updateProduct(selectedProduct.value.id, formData.value)
    } else {
      await productStore.createProduct(formData.value)
    }
    hideModal()
    resetForm()
    await fetchProducts()
  } catch (error) {
    console.error('Error saving product:', error)
    // Error is handled by store and displayed in ErrorAlert
  }
}

const handleDelete = async (product) => {
  const confirmed = await confirmDelete(product.name, 'product')
  if (confirmed) {
    try {
      await productStore.deleteProduct(product.id)
      await fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      // Error is handled by store and displayed in ErrorAlert
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
</script>

<style scoped>
.badge {
  font-size: 0.85rem;
  font-weight: 500;
}
</style>
