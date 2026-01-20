<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <PageHeader title="Customer Management" icon="bi-person-circle">
      <template #actions>
        <button class="btn btn-primary" @click="handleCreate">
          <i class="bi bi-plus-circle me-2"></i>Add Customer
        </button>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <LoadingSpinner v-if="customerStore.loading" />

    <!-- Error State -->
    <ErrorAlert :error="customerStore.error" title="Error" dismissible @dismiss="customerStore.error = null" />

    <!-- Data Table -->
    <DataTable
      v-if="!customerStore.loading"
      :columns="columns"
      :items="customerStore.customers || []"
      :pagination="paginationData"
      empty-message="No customers found. Click 'Add Customer' to create one."
      @page-change="handlePageChange"
    >
      <template #filters>
        <div class="row g-3 mb-3">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input
                v-model="filters.search"
                type="text"
                class="form-control"
                placeholder="Search by name, email, phone..."
                @input="handleFilterChange"
              />
              <button v-if="filters.search" class="btn btn-outline-secondary" type="button" @click="clearSearch" title="Clear search">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
          <div class="col-md-3">
            <select v-model="filters.is_active" class="form-select" @change="handleFilterChange">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div class="col-md-2">
            <button v-if="hasActiveFilters" class="btn btn-outline-secondary w-100" type="button" @click="clearFilters">
              <i class="bi bi-x-circle me-1"></i>Clear
            </button>
          </div>
        </div>
      </template>
      <template #body="{ items }">
        <tr v-for="customer in items" :key="customer.id">
          <td>{{ customer.id }}</td>
          <td><strong>{{ customer.name }}</strong></td>
          <td>{{ customer.email || '-' }}</td>
          <td>{{ customer.phone || '-' }}</td>
          <td>{{ truncate(customer.address, 40) }}</td>
          <td><strong>{{ formatCurrency(customer.balance || 0) }}</strong></td>
          <td>
            <span class="badge" :class="customer.is_active ? 'bg-success' : 'bg-secondary'">
              {{ customer.is_active ? 'Active' : 'Inactive' }}
            </span>
          </td>
          <td>
            <button
              class="btn btn-sm btn-outline-primary me-2"
              @click="handleEdit(customer)"
              title="Edit"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              @click="handleDelete(customer)"
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
            <h5 class="modal-title">{{ isEditing ? 'Edit Customer' : 'Add New Customer' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSave">
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

                <div class="col-md-6 mb-3">
                  <label class="form-label">Opening Balance</label>
                  <input
                    v-model.number="formData.opening_balance"
                    type="number"
                    step="0.01"
                    class="form-control"
                    placeholder="0.00"
                  />
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Credit Limit</label>
                  <input
                    v-model.number="formData.credit_limit"
                    type="number"
                    step="0.01"
                    class="form-control"
                    placeholder="0.00"
                  />
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
import { useCustomerStore } from '../stores/customer.store'
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
const customerStore = useCustomerStore()

// Composables
const { modalRef, show: showModal, hide: hideModal } = useModal()
const { truncate, formatCurrency } = useFormatter()
const { confirmDelete } = useConfirm()
const pagination = usePagination(10)

// State
const isEditing = ref(false)
const selectedCustomer = ref(null)

const filters = ref({
  search: '',
  is_active: ''
})

const hasActiveFilters = computed(() => !!(filters.value.search || filters.value.is_active))

const formData = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  is_active: true,
  opening_balance: 0.00,
  credit_limit: 0.00
})

// Table columns definition
const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'balance', label: 'Balance', width: '140px' },
  { key: 'status', label: 'Status', width: '100px' },
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
  await fetchCustomers()
})

// Methods
const fetchCustomers = async () => {
  const params = pagination.getParams()
  if (filters.value.search) params.search = filters.value.search
  if (filters.value.is_active !== '') params.is_active = filters.value.is_active
  await customerStore.fetchCustomers(params)
  if (customerStore.pagination) {
    pagination.updateFromResponse(customerStore.pagination)
  }
}

const handlePageChange = async (page) => {
  pagination.goToPage(page)
  await fetchCustomers()
}

const handleFilterChange = async () => {
  pagination.goToPage(1)
  await fetchCustomers()
}

const clearSearch = () => {
  filters.value.search = ''
  handleFilterChange()
}

const clearFilters = () => {
  filters.value = { search: '', is_active: '' }
  handleFilterChange()
}

const handleCreate = () => {
  isEditing.value = false
  selectedCustomer.value = null
  resetForm()
  showModal()
}

const handleEdit = (customer) => {
  isEditing.value = true
  selectedCustomer.value = customer
  formData.value = {
    name: customer.name,
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    is_active: customer.is_active,
    opening_balance: customer.opening_balance || 0.00,
    credit_limit: customer.credit_limit || 0.00
  }
  showModal()
}

const handleSave = async () => {
  try {
    if (isEditing.value) {
      await customerStore.updateCustomer(selectedCustomer.value.id, formData.value)
    } else {
      await customerStore.createCustomer(formData.value)
    }
    hideModal()
    resetForm()
    await fetchCustomers()
  } catch (error) {
    console.error('Error saving customer:', error)
    // Error is handled by store and displayed in ErrorAlert
  }
}

const handleDelete = async (customer) => {
  const confirmed = await confirmDelete(customer.name, 'customer')
  if (confirmed) {
    try {
      await customerStore.deleteCustomer(customer.id)
      await fetchCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      // Error is handled by store and displayed in ErrorAlert
    }
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    phone: '',
    address: '',
    is_active: true,
    opening_balance: 0.00,
    credit_limit: 0.00
  }
}
</script>
