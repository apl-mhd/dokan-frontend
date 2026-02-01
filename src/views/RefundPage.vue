<template>
  <div class="container-fluid">
    <PageHeader title="Refunds" />

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'customer_refund' }"
          @click="activeTab = 'customer_refund'"
          style="cursor: pointer"
        >
          <i class="bi bi-arrow-return-right text-warning"></i>
          Customer Refunds
          <!-- <span v-if="customerRefunds.length" class="badge bg-warning text-dark ms-2">
            {{ customerRefunds.length }}
          </span> -->
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'supplier_refund' }"
          @click="activeTab = 'supplier_refund'"
          style="cursor: pointer"
        >
          <i class="bi bi-arrow-return-left text-info"></i>
          Supplier Refunds
          <span v-if="supplierRefunds.length" class="badge bg-info ms-2">
            {{ supplierRefunds.length }}
          </span>
        </a>
      </li>
    </ul>

    <!-- Action Buttons -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex gap-2">
        <button class="btn btn-primary" @click="openCreateModal">
          <i class="bi bi-plus-circle"></i>
          {{ activeTab === 'customer_refund' ? 'Refund to Customer' : 'Receive Refund from Supplier' }}
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="d-flex gap-2">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control"
          style="width: 250px"
          placeholder="Search refunds..."
          @input="handleSearch"
        >
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
      </div>
    </div>

    <!-- Loading Spinner -->
    <LoadingSpinner v-if="loading" />

    <!-- Error Alert -->
    <ErrorAlert v-if="error && !loading" :message="error" />

    <!-- Refunds Table -->
    <div v-if="!loading && !error">
      <DataTable :columns="tableColumns" :items="currentRefunds" :loading="loading">
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
          <span
            class="fw-bold"
            :class="activeTab === 'customer_refund' ? 'text-warning' : 'text-info'"
          >
            ৳{{ formatCurrency(item.amount) }}
          </span>
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
            <button class="btn btn-outline-info" @click="viewRefund(item)" title="View">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-outline-danger" @click="deleteRefund(item)" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && currentRefunds.length === 0" class="card">
      <div class="card-body text-center py-5">
        <i class="bi bi-arrow-repeat text-muted" style="font-size: 3rem"></i>
        <p class="text-muted mt-3">
          No {{ activeTab === 'customer_refund' ? 'customer' : 'supplier' }} refunds found
        </p>
        <button class="btn btn-primary" @click="openCreateModal">
          <i class="bi bi-plus-circle"></i>
          {{ activeTab === 'customer_refund' ? 'Refund to Customer' : 'Receive Refund from Supplier' }}
        </button>
      </div>
    </div>

    <!-- Modals -->
    <RefundFormModal
      ref="formModal"
      :refund-type="activeTab"
      :parties="currentParties"
      @submit="handleSubmit"
      @close="handleModalClose"
    />

    <RefundViewModal
      ref="viewModal"
      :refund="selectedRefund"
      :refund-type="activeTab"
      @close="selectedRefund = null"
    />
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
import RefundFormModal from '../components/payment/RefundFormModal.vue'
import RefundViewModal from '../components/payment/RefundViewModal.vue'

const paymentStore = usePaymentStore()
const customerStore = useCustomerStore()
const supplierStore = useSupplierStore()
const { formatCurrency, formatDate } = useFormatter()
const { confirm } = useConfirm()

const activeTab = ref('customer_refund')
const searchQuery = ref('')
const filterMethod = ref('')
const selectedRefund = ref(null)
const formModal = ref(null)
const viewModal = ref(null)

const loading = computed(() => paymentStore.loading)
const error = computed(() => paymentStore.error)
const customerRefunds = computed(() => paymentStore.customerRefunds)
const supplierRefunds = computed(() => paymentStore.supplierRefunds)

const currentRefunds = computed(() => {
  return activeTab.value === 'customer_refund' ? customerRefunds.value : supplierRefunds.value
})

const currentParties = computed(() => {
  return activeTab.value === 'customer_refund' ? customerStore.customers : supplierStore.suppliers
})

const tableColumns = computed(() => [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'party', label: activeTab.value === 'customer_refund' ? 'Customer' : 'Supplier' },
  { key: 'payment_method', label: 'Method' },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'reference_number', label: 'Reference' },
  { key: 'actions', label: 'Actions', width: '120px' }
])

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

const loadRefunds = async () => {
  const params = {}
  if (searchQuery.value) params.search = searchQuery.value
  if (filterMethod.value) params.payment_method = filterMethod.value

  try {
    if (activeTab.value === 'customer_refund') {
      await paymentStore.fetchCustomerRefunds(params)
    } else {
      await paymentStore.fetchSupplierRefunds(params)
    }
  } catch (err) {
    console.error('Failed to load refunds:', err)
  }
}

const handleSearch = () => {
  loadRefunds()
}

const handleFilter = () => {
  loadRefunds()
}

const openCreateModal = () => {
  if (formModal.value) {
    formModal.value.openModal()
  }
}

const handleModalClose = () => {
  // Modal closed
}

const viewRefund = (refund) => {
  selectedRefund.value = refund
  if (viewModal.value) {
    viewModal.value.openModal()
  }
}

const deleteRefund = async (refund) => {
  const confirmed = await confirm(
    `Are you sure you want to delete this refund of ৳${formatCurrency(refund.amount)}?`
  )

  if (confirmed) {
    try {
      await paymentStore.deleteRefund(refund.id, activeTab.value)
      alert('Refund deleted successfully')
      loadRefunds()
    } catch (err) {
      alert('Failed to delete refund: ' + (err.response?.data?.error || err.message))
    }
  }
}

const handleSubmit = async () => {
  alert('Refund created successfully')
  await Promise.all([
    loadRefunds(),
    customerStore.fetchCustomers(),
    supplierStore.fetchSuppliers()
  ])
}

watch(activeTab, () => {
  searchQuery.value = ''
  filterMethod.value = ''
  loadRefunds()
})

onMounted(async () => {
  await Promise.all([
    customerStore.fetchCustomers(),
    supplierStore.fetchSuppliers(),
    loadRefunds()
  ])
})
</script>

<style scoped>
.nav-tabs .nav-link {
  color: #6c757d !important;
}

.nav-tabs .nav-link.active {
  color: #0d6efd !important;
  font-weight: 600;
  background-color: #fff !important;
}

.nav-tabs .nav-link:hover {
  color: #0d6efd !important;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
</style>
