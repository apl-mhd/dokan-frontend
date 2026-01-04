<template>
  <div class="container-fluid">
    <div class="row mb-4">
      <div class="col">
        <h2 class="mb-3">
          <i class="bi bi-person-circle me-2"></i>Customer Management
        </h2>
      </div>
      <div class="col-auto">
        <button class="btn btn-primary" @click="showCreateModal">
          <i class="bi bi-plus-circle me-2"></i>Add Customer
        </button>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="customerStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="customerStore.error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ customerStore.error }}
    </div>

    <!-- Customers Table -->
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
              <tr v-for="customer in customerStore.customers" :key="customer.id">
                <td>{{ customer.id }}</td>
                <td><strong>{{ customer.name }}</strong></td>
                <td>{{ customer.email || '-' }}</td>
                <td>{{ customer.phone || '-' }}</td>
                <td>{{ customer.address || '-' }}</td>
                <td>
                  <span class="badge" :class="customer.is_active ? 'bg-success' : 'bg-secondary'">
                    {{ customer.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-2" @click="editCustomer(customer)" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(customer)" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="customerStore.customers.length === 0 && !customerStore.loading">
                <td colspan="7" class="text-center text-muted py-4">
                  No customers found. Click "Add Customer" to create one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="customerModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Customer' : 'Add New Customer' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCustomer">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Customer Name <span class="text-danger">*</span></label>
                  <input
                    v-model="formData.name"
                    type="text"
                    class="form-control"
                    placeholder="Enter customer name"
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
                    placeholder="Enter customer address"
                  ></textarea>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveCustomer">
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
import { useCustomerStore } from '../stores/customer.store'
import { Modal } from 'bootstrap'

const customerStore = useCustomerStore()
const modalRef = ref(null)
let modalInstance = null
const isEditing = ref(false)
const selectedCustomer = ref(null)

const formData = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  is_active: true
})

onMounted(() => {
  customerStore.fetchCustomers()
})

const showCreateModal = () => {
  isEditing.value = false
  selectedCustomer.value = null
  resetForm()
  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value)
  }
  modalInstance.show()
}

const editCustomer = (customer) => {
  isEditing.value = true
  selectedCustomer.value = customer
  formData.value = {
    name: customer.name,
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    is_active: customer.is_active
  }
  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value)
  }
  modalInstance.show()
}

const saveCustomer = async () => {
  try {
    if (isEditing.value) {
      await customerStore.updateCustomer(selectedCustomer.value.id, formData.value)
    } else {
      await customerStore.createCustomer(formData.value)
    }
    modalInstance.hide()
    resetForm()
  } catch (error) {
    alert('Error saving customer: ' + (error.response?.data?.message || error.message))
  }
}

const confirmDelete = async (customer) => {
  if (confirm(`Are you sure you want to delete "${customer.name}"?`)) {
    try {
      await customerStore.deleteCustomer(customer.id)
    } catch (error) {
      alert('Error deleting customer: ' + (error.response?.data?.message || error.message))
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

