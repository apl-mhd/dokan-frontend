<template>
  <div class="container-fluid">
    <div class="row mb-4">
      <div class="col">
        <h2 class="mb-3">
          <i class="bi bi-people me-2"></i>Supplier Management
        </h2>
      </div>
      <div class="col-auto">
        <button class="btn btn-primary" @click="showCreateModal">
          <i class="bi bi-plus-circle me-2"></i>Add Supplier
        </button>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="supplierStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="supplierStore.error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ supplierStore.error }}
    </div>

    <!-- Suppliers Table -->
    <div v-else class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="supplier in supplierStore.suppliers" :key="supplier.id">
                <td>{{ supplier.id }}</td>
                <td><strong>{{ supplier.name }}</strong></td>
                <td>{{ supplier.email || '-' }}</td>
                <td>{{ supplier.phone || '-' }}</td>
                <td>{{ supplier.address || '-' }}</td>
                <td>
                  <span class="badge" :class="supplier.is_active ? 'bg-success' : 'bg-secondary'">
                    {{ supplier.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-2" @click="editSupplier(supplier)" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(supplier)" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="supplierStore.suppliers.length === 0 && !supplierStore.loading">
                <td colspan="7" class="text-center text-muted py-4">
                  No suppliers found. Click "Add Supplier" to create one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="supplierModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Supplier' : 'Add New Supplier' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveSupplier">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Supplier Name <span class="text-danger">*</span></label>
                  <input
                    v-model="formData.name"
                    type="text"
                    class="form-control"
                    placeholder="Enter supplier name"
                    required
                    maxlength="255"
                  />
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Email</label>
                  <input
                    v-model="formData.email"
                    type="email"
                    class="form-control"
                    placeholder="Enter email"
                  />
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Phone</label>
                  <input
                    v-model="formData.phone"
                    type="text"
                    class="form-control"
                    placeholder="Enter phone number"
                    maxlength="20"
                  />
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Status</label>
                  <select v-model="formData.is_active" class="form-select">
                    <option :value="true">Active</option>
                    <option :value="false">Inactive</option>
                  </select>
                </div>

                <div class="col-md-12 mb-3">
                  <label class="form-label">Address</label>
                  <textarea
                    v-model="formData.address"
                    class="form-control"
                    rows="3"
                    placeholder="Enter supplier address"
                  ></textarea>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveSupplier">
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
import { useSupplierStore } from '../stores/supplier.store'
import { Modal } from 'bootstrap'

const supplierStore = useSupplierStore()
const modalRef = ref(null)
let modalInstance = null
const isEditing = ref(false)
const selectedSupplier = ref(null)

const formData = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  is_active: true
})

onMounted(() => {
  supplierStore.fetchSuppliers()
})

const showCreateModal = () => {
  isEditing.value = false
  selectedSupplier.value = null
  resetForm()
  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value)
  }
  modalInstance.show()
}

const editSupplier = (supplier) => {
  isEditing.value = true
  selectedSupplier.value = supplier
  formData.value = {
    name: supplier.name,
    email: supplier.email || '',
    phone: supplier.phone || '',
    address: supplier.address || '',
    is_active: supplier.is_active
  }
  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value)
  }
  modalInstance.show()
}

const saveSupplier = async () => {
  try {
    if (isEditing.value) {
      await supplierStore.updateSupplier(selectedSupplier.value.id, formData.value)
    } else {
      await supplierStore.createSupplier(formData.value)
    }
    modalInstance.hide()
    resetForm()
  } catch (error) {
    alert('Error saving supplier: ' + (error.response?.data?.message || error.message))
  }
}

const confirmDelete = async (supplier) => {
  if (confirm(`Are you sure you want to delete "${supplier.name}"?`)) {
    try {
      await supplierStore.deleteSupplier(supplier.id)
    } catch (error) {
      alert('Error deleting supplier: ' + (error.response?.data?.message || error.message))
    }
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    phone: '',
    address: '',
    is_active: true
  }
}
</script>

