<template>
  <div class="container-fluid">
    <div class="row mb-4">
      <div class="col">
        <h2 class="mb-3">
          <i class="bi bi-building me-2"></i>Warehouse Management
        </h2>
      </div>
      <div class="col-auto">
        <button class="btn btn-primary" @click="showCreateModal">
          <i class="bi bi-plus-circle me-2"></i>Add Warehouse
        </button>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="warehouseStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="warehouseStore.error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ warehouseStore.error }}
    </div>

    <!-- Warehouses Table -->
    <div v-else class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="warehouse in warehouseStore.warehouses" :key="warehouse.id">
                <td>{{ warehouse.id }}</td>
                <td><strong>{{ warehouse.name }}</strong></td>
                <td>{{ warehouse.location || '-' }}</td>
                <td>{{ formatDate(warehouse.created_at) }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-2" @click="editWarehouse(warehouse)" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(warehouse)" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="warehouseStore.warehouses.length === 0 && !warehouseStore.loading">
                <td colspan="5" class="text-center text-muted py-4">
                  No warehouses found. Click "Add Warehouse" to create one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="warehouseModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Warehouse' : 'Add New Warehouse' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveWarehouse">
              <div class="mb-3">
                <label class="form-label">Warehouse Name <span class="text-danger">*</span></label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="form-control"
                  placeholder="Enter warehouse name"
                  required
                  maxlength="20"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Location <span class="text-danger">*</span></label>
                <input
                  v-model="formData.location"
                  type="text"
                  class="form-control"
                  placeholder="Enter warehouse location"
                  required
                  maxlength="50"
                />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveWarehouse">
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
import { useWarehouseStore } from '../stores/warehouse.store'
import { Modal } from 'bootstrap'

const warehouseStore = useWarehouseStore()
const modalRef = ref(null)
let modalInstance = null
const isEditing = ref(false)
const selectedWarehouse = ref(null)

const formData = ref({
  name: '',
  location: ''
})

onMounted(() => {
  warehouseStore.fetchWarehouses()
})

const showCreateModal = () => {
  isEditing.value = false
  selectedWarehouse.value = null
  resetForm()
  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value)
  }
  modalInstance.show()
}

const editWarehouse = (warehouse) => {
  isEditing.value = true
  selectedWarehouse.value = warehouse
  formData.value = {
    name: warehouse.name,
    location: warehouse.location || ''
  }
  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value)
  }
  modalInstance.show()
}

const saveWarehouse = async () => {
  try {
    if (isEditing.value) {
      await warehouseStore.updateWarehouse(selectedWarehouse.value.id, formData.value)
    } else {
      await warehouseStore.createWarehouse(formData.value)
    }
    modalInstance.hide()
    resetForm()
  } catch (error) {
    alert('Error saving warehouse: ' + (error.response?.data?.message || error.message))
  }
}

const confirmDelete = async (warehouse) => {
  if (confirm(`Are you sure you want to delete "${warehouse.name}"?`)) {
    try {
      await warehouseStore.deleteWarehouse(warehouse.id)
    } catch (error) {
      alert('Error deleting warehouse: ' + (error.response?.data?.message || error.message))
    }
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    location: ''
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}
</script>

