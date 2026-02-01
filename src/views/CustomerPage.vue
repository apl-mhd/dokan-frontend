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
          <td>
            <strong>{{ formatCurrency(customer.balance || 0) }}</strong>
            <button class="btn btn-sm btn-link p-0 ms-1" @click="openBalanceModal(customer)" title="Adjust Balance">
              <i class="bi bi-pencil-square text-muted"></i>
            </button>
          </td>
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
            <!-- Validation Errors -->
            <div v-if="formErrors && Object.keys(formErrors).length > 0" class="alert alert-danger">
              <strong>Please fix the following errors:</strong>
              <ul class="mb-0 mt-2">
                <li v-for="(errors, field) in formErrors" :key="field">
                  <strong>{{ field }}:</strong> {{ Array.isArray(errors) ? errors[0] : errors }}
                </li>
              </ul>
            </div>

            <form @submit.prevent="handleSave" ref="formRef">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Customer Name <span class="text-danger">*</span></label>
                  <input
                    v-model="formData.name"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.name }"
                    placeholder="Enter customer name"
                    required
                    maxlength="255"
                    @blur="validateField('name')"
                  />
                  <div v-if="formErrors.name" class="invalid-feedback">
                    {{ Array.isArray(formErrors.name) ? formErrors.name[0] : formErrors.name }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Email</label>
                  <input
                    v-model="formData.email"
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.email }"
                    placeholder="Enter email"
                    @blur="validateField('email')"
                  />
                  <div v-if="formErrors.email" class="invalid-feedback">
                    {{ Array.isArray(formErrors.email) ? formErrors.email[0] : formErrors.email }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Phone <span class="text-danger">*</span></label>
                  <input
                    v-model="formData.phone"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.phone }"
                    placeholder="Enter phone number"
                    required
                    maxlength="20"
                    @blur="validateField('phone')"
                  />
                  <div v-if="formErrors.phone" class="invalid-feedback">
                    {{ Array.isArray(formErrors.phone) ? formErrors.phone[0] : formErrors.phone }}
                  </div>
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
                    :class="{ 'is-invalid': formErrors.opening_balance }"
                    placeholder="0.00"
                    @blur="validateField('opening_balance')"
                  />
                  <div v-if="formErrors.opening_balance" class="invalid-feedback">
                    {{ Array.isArray(formErrors.opening_balance) ? formErrors.opening_balance[0] : formErrors.opening_balance }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Credit Limit</label>
                  <input
                    v-model.number="formData.credit_limit"
                    type="number"
                    step="0.01"
                    min="0"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.credit_limit }"
                    placeholder="0.00"
                    @blur="validateField('credit_limit')"
                  />
                  <div v-if="formErrors.credit_limit" class="invalid-feedback">
                    {{ Array.isArray(formErrors.credit_limit) ? formErrors.credit_limit[0] : formErrors.credit_limit }}
                  </div>
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

    <!-- Balance Adjustment Modal -->
    <div class="modal fade" tabindex="-1" aria-hidden="true" ref="balanceModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Adjust Balance - {{ balanceParty?.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="balanceError" class="alert alert-danger">{{ balanceError }}</div>
            <div class="mb-3">
              <label class="form-label">Current Balance</label>
              <p class="form-control-plaintext fw-bold fs-5">{{ formatCurrency(balanceParty?.balance || 0) }}</p>
            </div>
            <div class="mb-3">
              <label class="form-label">Adjustment Amount <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text">৳</span>
                <input
                  v-model.number="balanceForm.amount"
                  type="number"
                  step="0.01"
                  class="form-control"
                  placeholder="Positive to increase, negative to decrease"
                />
              </div>
              <div class="form-text">Use positive amount to increase balance, negative to decrease.</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Date</label>
              <input v-model="balanceForm.date" type="date" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Description (optional)</label>
              <textarea v-model="balanceForm.description" class="form-control" rows="2" placeholder="e.g. Balance adjustment for correction"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" :disabled="savingBalance || !balanceForm.amount" @click="handleAdjustBalance">
              <span v-if="savingBalance" class="spinner-border spinner-border-sm me-2"></span>
              Apply Adjustment
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Modal } from 'bootstrap'
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
const formRef = ref(null)
const formErrors = ref({})

// Balance adjustment modal
const balanceModalRef = ref(null)
let balanceModalInstance = null
const balanceParty = ref(null)
const balanceForm = ref({ amount: null, description: '', date: '' })
const savingBalance = ref(false)
const balanceError = ref('')

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

const validateField = (fieldName) => {
  // Clear error for this field
  if (formErrors.value[fieldName]) {
    delete formErrors.value[fieldName]
  }

  const value = formData.value[fieldName]

  // Client-side validation
  switch (fieldName) {
    case 'name':
      if (!value || !value.trim()) {
        formErrors.value.name = 'Customer name cannot be empty.'
      } else if (value.trim().length < 2) {
        formErrors.value.name = 'Customer name must be at least 2 characters long.'
      }
      break
    case 'email':
      if (value && value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          formErrors.value.email = 'Enter a valid email address.'
        }
      }
      break
    case 'phone':
      if (!value || !value.trim()) {
        formErrors.value.phone = 'Phone number is required.'
      } else {
        const cleanedPhone = value.replace(/[\s\-+()]/g, '')
        if (!/^\d+$/.test(cleanedPhone)) {
          formErrors.value.phone = 'Phone number must contain only digits and common formatting characters.'
        } else if (cleanedPhone.length < 10) {
          formErrors.value.phone = 'Phone number must be at least 10 digits long.'
        }
      }
      break
    case 'credit_limit':
      if (value !== null && value !== undefined && value < 0) {
        formErrors.value.credit_limit = 'Credit limit cannot be negative.'
      }
      break
  }
}

const validateForm = () => {
  formErrors.value = {}
  
  // Validate all fields
  validateField('name')
  validateField('email')
  validateField('phone')
  validateField('credit_limit')

  return Object.keys(formErrors.value).length === 0
}

const handleSave = async () => {
  // Clear previous errors
  formErrors.value = {}

  // Client-side validation
  if (!validateForm()) {
    return
  }

  // Check HTML5 validation
  if (formRef.value && !formRef.value.checkValidity()) {
    formRef.value.reportValidity()
    return
  }

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
    
    // Handle validation errors from backend
    if (error.response?.data?.details) {
      const details = error.response.data.details
      if (typeof details === 'object') {
        formErrors.value = details
      } else {
        formErrors.value = { _general: details }
      }
    } else if (error.response?.data?.error) {
      formErrors.value = { _general: error.response.data.error }
    }
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
  formErrors.value = {}
}

const openBalanceModal = (customer) => {
  balanceParty.value = customer
  balanceForm.value = { amount: null, description: '', date: new Date().toISOString().split('T')[0] }
  balanceError.value = ''
  if (balanceModalRef.value) {
    if (!balanceModalInstance) {
      balanceModalInstance = new Modal(balanceModalRef.value)
    }
    balanceModalInstance.show()
  }
}

const handleAdjustBalance = async () => {
  if (!balanceParty.value || balanceForm.value.amount === null || balanceForm.value.amount === '') {
    balanceError.value = 'Please enter an amount'
    return
  }
  if (balanceForm.value.amount === 0) {
    balanceError.value = 'Amount cannot be zero'
    return
  }
  savingBalance.value = true
  balanceError.value = ''
  try {
    await customerStore.adjustBalance(balanceParty.value.id, {
      amount: parseFloat(balanceForm.value.amount),
      description: balanceForm.value.description,
      date: balanceForm.value.date || null
    })
    balanceModalInstance?.hide()
    balanceParty.value = null
    await fetchCustomers()
  } catch (err) {
    balanceError.value = customerStore.error || 'Failed to adjust balance'
  } finally {
    savingBalance.value = false
  }
}
</script>
