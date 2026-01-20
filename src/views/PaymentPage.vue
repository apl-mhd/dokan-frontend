<template>
  <div class="container-fluid">
    <PageHeader title="Payments" />

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'customer' }" @click="activeTab = 'customer'" style="cursor: pointer;">
          <i class="bi bi-arrow-down-circle text-success"></i>
          Customer Payments
          <span v-if="customerPayments.length" class="badge bg-success ms-2">
            {{ customerPayments.length }}
          </span>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'supplier' }" @click="activeTab = 'supplier'" style="cursor: pointer;">
          <i class="bi bi-arrow-up-circle text-danger"></i>
          Supplier Payments
          <span v-if="supplierPayments.length" class="badge bg-danger ms-2">
            {{ supplierPayments.length }}
          </span>
        </a>
      </li>
    </ul>

    <!-- Action Buttons -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex gap-2">
        <button class="btn btn-primary" @click="openCreateModal">
          <i class="bi bi-plus-circle"></i>
          {{ activeTab === 'customer' ? 'Receive Payment' : 'Make Payment' }}
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="d-flex gap-2">
        <input v-model="searchQuery" type="text" class="form-control" style="width: 250px" :placeholder="`Search payments...`" @input="handleSearch">

        <select v-model="filterMethod" class="form-select" style="width: 180px" @change="handleFilter">
          <option value="">All Methods</option>
          <option value="cash">💵 Cash</option>
          <option value="bank">🏦 Bank</option>
          <option value="bkash">📱 bKash</option>
          <option value="nagad">📱 Nagad</option>
          <option value="rocket">📱 Rocket</option>
          <option value="upay">📱 Upay</option>
          <option value="card">💳 Card</option>
          <option value="cheque">📝 Cheque</option>
        </select>

        <select v-model="filterStatus" class="form-select" style="width: 150px" @change="handleFilter">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <!-- Loading Spinner -->
    <LoadingSpinner v-if="loading" />

    <!-- Error Alert -->
    <ErrorAlert v-if="error && !loading" :message="error" />

    <!-- Payments Table -->
    <div v-if="!loading && !error">
      <DataTable :columns="tableColumns" :items="currentPayments" :loading="loading">
        <template #date="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <template #party="{ item }">
          <div>
            <div class="fw-bold">{{ item.customer_name || item.supplier_name }}</div>
            <small class="text-muted">{{ item.customer_phone || item.supplier_phone }}</small>
          </div>
        </template>

        <template #payment_method="{ item }">
          <span class="badge" :class="getMethodBadgeClass(item.payment_method)">
            {{ getMethodIcon(item.payment_method) }} {{ getMethodLabel(item.payment_method) }}
          </span>
        </template>

        <template #amount="{ item }">
          <span class="fw-bold text-success">৳{{ formatCurrency(item.amount) }}</span>
        </template>

        <template #status="{ item }">
          <span class="badge" :class="getStatusBadgeClass(item.status)">
            {{ getStatusLabel(item.status) }}
          </span>
        </template>

        <template #reference_number="{ item }">
          <span v-if="item.reference_number">{{ item.reference_number }}</span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #actions="{ item }">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-info" @click="viewPayment(item)" title="View">
              <i class="bi bi-eye"></i>
            </button>
            <button v-if="item.status === 'pending'" class="btn btn-outline-primary" @click="editPayment(item)" title="Edit">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger" @click="deletePayment(item)" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Empty State (when no data) -->
    <div v-if="!loading && !error && currentPayments.length === 0" class="card">
      <div class="card-body text-center py-5">
        <i class="bi bi-wallet2 text-muted" style="font-size: 3rem;"></i>
        <p class="text-muted mt-3">No payments found</p>
        <button class="btn btn-primary" @click="openCreateModal">
          <i class="bi bi-plus-circle"></i>
          {{ activeTab === 'customer' ? 'Receive Payment' : 'Make Payment' }}
        </button>
      </div>
    </div>

    <!-- Modals -->
    <PaymentFormModal ref="formModal" :payment-type="activeTab" :parties="currentParties" :payment="selectedPayment" @submit="handleSubmit" @close="selectedPayment = null" />

    <PaymentViewModal ref="viewModal" :payment="selectedPayment" :payment-type="activeTab" @close="selectedPayment = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { usePaymentStore } from '../stores/payment.store'
import { useCustomerStore } from '../stores/customer.store'
import { useSupplierStore } from '../stores/supplier.store'
import { useFormatter, useConfirm } from '../composables'
import PageHeader from '../components/common/PageHeader.vue'
import DataTable from '../components/common/DataTable.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorAlert from '../components/common/ErrorAlert.vue'
import PaymentFormModal from '../components/payment/PaymentFormModal.vue'
import PaymentViewModal from '../components/payment/PaymentViewModal.vue'

const paymentStore = usePaymentStore()
const customerStore = useCustomerStore()
const supplierStore = useSupplierStore()
const { formatCurrency, formatDate } = useFormatter()
const { confirm } = useConfirm()

const activeTab = ref('customer')
const searchQuery = ref('')
const filterMethod = ref('')
const filterStatus = ref('')
const selectedPayment = ref(null)
const formModal = ref(null)
const viewModal = ref(null)

const loading = computed(() => paymentStore.loading)
const error = computed(() => paymentStore.error)
const customerPayments = computed(() => paymentStore.customerPayments)
const supplierPayments = computed(() => paymentStore.supplierPayments)

const currentPayments = computed(() => {
  return activeTab.value === 'customer' ? customerPayments.value : supplierPayments.value
})

const currentParties = computed(() => {
  return activeTab.value === 'customer' ? customerStore.customers : supplierStore.suppliers
})

const tableColumns = computed(() => [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'party', label: activeTab.value === 'customer' ? 'Customer' : 'Supplier' },
  { key: 'payment_method', label: 'Method' },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'reference_number', label: 'Reference' },
  { key: 'actions', label: 'Actions', width: '150px' }
])

// Helper functions
const getMethodIcon = (method) => {
  const icons = {
    cash: '💵', bank: '🏦', bkash: '📱', nagad: '📱',
    rocket: '📱', upay: '📱', card: '💳', cheque: '📝', others: '📋'
  }
  return icons[method] || '💰'
}

const getMethodLabel = (method) => {
  const labels = {
    cash: 'Cash', bank: 'Bank', bkash: 'bKash', nagad: 'Nagad',
    rocket: 'Rocket', upay: 'Upay', card: 'Card', cheque: 'Cheque', others: 'Others'
  }
  return labels[method] || method
}

const getMethodBadgeClass = (method) => {
  const classes = {
    cash: 'bg-success', bank: 'bg-primary', bkash: 'bg-danger',
    nagad: 'bg-warning text-dark', rocket: 'bg-info', upay: 'bg-secondary',
    card: 'bg-dark', cheque: 'bg-light text-dark', others: 'bg-secondary'
  }
  return classes[method] || 'bg-secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    completed: '✅ Completed', pending: '⏳ Pending',
    failed: '❌ Failed', cancelled: '🚫 Cancelled'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    completed: 'bg-success', pending: 'bg-warning text-dark',
    failed: 'bg-danger', cancelled: 'bg-secondary'
  }
  return classes[status] || 'bg-secondary'
}

const loadPayments = async () => {
  const params = {}
  if (searchQuery.value) params.search = searchQuery.value
  if (filterMethod.value) params.payment_method = filterMethod.value
  if (filterStatus.value) params.status = filterStatus.value

  try {
    if (activeTab.value === 'customer') {
      await paymentStore.fetchCustomerPayments(params)
    } else {
      await paymentStore.fetchSupplierPayments(params)
    }
  } catch (error) {
    console.error('Failed to load payments:', error)
  }
}

const handleSearch = () => {
  loadPayments()
}

const handleFilter = () => {
  loadPayments()
}

const openCreateModal = () => {
  selectedPayment.value = null
  if (formModal.value) {
    formModal.value.openModal()
  }
}

const viewPayment = (payment) => {
  selectedPayment.value = payment
  if (viewModal.value) {
    viewModal.value.openModal()
  }
}

const editPayment = (payment) => {
  selectedPayment.value = payment
  if (formModal.value) {
    formModal.value.openModal()
  }
}

const deletePayment = async (payment) => {
  const confirmed = await confirm(
    `Are you sure you want to delete this payment of ৳${formatCurrency(payment.amount)}?`
  )
  
  if (confirmed) {
    try {
      if (activeTab.value === 'customer') {
        await paymentStore.deleteCustomerPayment(payment.id)
      } else {
        await paymentStore.deleteSupplierPayment(payment.id)
      }
      alert('Payment deleted successfully')
    } catch (error) {
      alert('Failed to delete payment: ' + (error.response?.data?.error || error.message))
    }
  }
}

const handleSubmit = async (data, paymentId) => {
  try {
    if (paymentId) {
      // Update existing payment
      if (activeTab.value === 'customer') {
        await paymentStore.updateCustomerPayment(paymentId, data)
      } else {
        await paymentStore.updateSupplierPayment(paymentId, data)
      }
      alert('Payment updated successfully')
    } else {
      // Create new payment
      if (activeTab.value === 'customer') {
        await paymentStore.createCustomerPayment(data)
      } else {
        await paymentStore.createSupplierPayment(data)
      }
      alert('Payment created successfully')
    }
    loadPayments()
  } catch (error) {
    alert('Failed to save payment: ' + (error.response?.data?.error || error.message))
  }
}

// Watch tab changes
watch(activeTab, () => {
  searchQuery.value = ''
  filterMethod.value = ''
  filterStatus.value = ''
  loadPayments()
})

// Load data on mount
onMounted(async () => {
  await Promise.all([
    customerStore.fetchCustomers(),
    supplierStore.fetchSuppliers(),
    loadPayments()
  ])
})
</script>

<style scoped>
.nav-tabs .nav-link {
  color: #6c757d;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  font-weight: 600;
}

.nav-tabs .nav-link:hover {
  color: #0d6efd;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
</style>
