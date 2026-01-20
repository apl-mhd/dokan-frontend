<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <PageHeader title="Purchase Returns" icon="bi-arrow-return-left">
      <template #actions>
        <button class="btn btn-primary" @click="showCreateModal = true">
          <i class="bi bi-plus-circle me-2"></i>Create Return
        </button>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <LoadingSpinner v-if="purchaseReturnStore.loading && !purchaseReturns.length" />

    <!-- Error State -->
    <ErrorAlert :error="purchaseReturnStore.error" title="Error" dismissible @dismiss="purchaseReturnStore.error = null" />

    <!-- Data Table -->
    <DataTable v-if="!purchaseReturnStore.loading || purchaseReturns.length" :columns="columns" :items="purchaseReturns" :pagination="paginationData" empty-message="No purchase returns found. Create your first return to get started." @page-change="handlePageChange">
      <template #filters>
        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <input v-model="filters.search" type="text" class="form-control" placeholder="Search by return number, invoice, supplier..." @input="handleFilterChange" />
          </div>
          <div class="col-md-3">
            <select v-model="filters.status" class="form-select" @change="handleFilterChange">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="col-md-3">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
            </button>
          </div>
        </div>
      </template>

      <template #body="{ items }">
        <tr v-for="returnItem in items" :key="returnItem.id">
          <td><strong>{{ returnItem.return_number || `#${returnItem.id}` }}</strong></td>
          <td>{{ returnItem.purchase_invoice_number || `Purchase #${returnItem.purchase}` }}</td>
          <td>{{ returnItem.supplier_name || `Supplier ${returnItem.supplier}` }}</td>
          <td>{{ formatDate(returnItem.return_date) }}</td>
          <td>
            <span class="badge" :class="getStatusClass(returnItem.status)">
              {{ returnItem.status }}
            </span>
          </td>
          <td><strong>{{ formatCurrency(returnItem.grand_total) }}</strong></td>
          <td>{{ formatCurrency(returnItem.refund_amount) }}</td>
          <td>
            <div class="btn-group btn-group-sm" role="group">
              <button class="btn btn-outline-info" @click="handleView(returnItem)" title="View">
                <i class="bi bi-eye"></i>
              </button>
              <button v-if="returnItem.status === 'pending'" class="btn btn-outline-primary" @click="handleEdit(returnItem)" title="Edit">
                <i class="bi bi-pencil"></i>
              </button>
              <button v-if="returnItem.status === 'pending'" class="btn btn-outline-success" @click="handleComplete(returnItem)" title="Complete">
                <i class="bi bi-check-circle"></i>
              </button>
              <button v-if="returnItem.status === 'pending'" class="btn btn-outline-warning" @click="handleCancel(returnItem)" title="Cancel">
                <i class="bi bi-x-circle"></i>
              </button>
              <button v-if="returnItem.status === 'pending'" class="btn btn-outline-danger" @click="handleDelete(returnItem)" title="Delete">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <PurchaseReturnFormModal v-if="showCreateModal || showEditModal" :show="showCreateModal || showEditModal" :return-data="selectedReturn" :is-editing="showEditModal" @close="closeModals" @saved="handleSaved" />

    <!-- View Modal -->
    <PurchaseReturnViewModal v-if="showViewModal" :show="showViewModal" :return-data="selectedReturn" @close="showViewModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePurchaseReturnStore } from '../stores/purchaseReturn.store'
import { useFormatter } from '../composables/useFormatter'
import { useConfirm } from '../composables/useConfirm'
import PageHeader from '../components/common/PageHeader.vue'
import DataTable from '../components/common/DataTable.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorAlert from '../components/common/ErrorAlert.vue'
import PurchaseReturnFormModal from '../components/purchaseReturn/PurchaseReturnFormModal.vue'
import PurchaseReturnViewModal from '../components/purchaseReturn/PurchaseReturnViewModal.vue'

// Composables
const purchaseReturnStore = usePurchaseReturnStore()
const { formatCurrency, formatDate } = useFormatter()
const { confirm } = useConfirm()

// State
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const selectedReturn = ref(null)

const filters = ref({
  search: '',
  status: '',
  page: 1,
  page_size: 10
})

// Computed
const purchaseReturns = computed(() => purchaseReturnStore.purchaseReturns)
const paginationData = computed(() => purchaseReturnStore.pagination)

const columns = [
  { label: 'Return #', key: 'return_number' },
  { label: 'Purchase Invoice', key: 'purchase_invoice_number' },
  { label: 'Supplier', key: 'supplier_name' },
  { label: 'Return Date', key: 'return_date' },
  { label: 'Status', key: 'status' },
  { label: 'Total', key: 'grand_total' },
  { label: 'Refund', key: 'refund_amount' },
  { label: 'Actions', key: 'actions' }
]

// Methods
const fetchReturns = async () => {
  const params = {
    page: filters.value.page,
    page_size: filters.value.page_size
  }

  if (filters.value.search) params.search = filters.value.search
  if (filters.value.status) params.status = filters.value.status

  await purchaseReturnStore.fetchPurchaseReturns(params)
}

const handleFilterChange = () => {
  filters.value.page = 1
  fetchReturns()
}

const handlePageChange = (page) => {
  filters.value.page = page
  fetchReturns()
}

const resetFilters = () => {
  filters.value = {
    search: '',
    status: '',
    page: 1,
    page_size: 10
  }
  fetchReturns()
}

const handleView = (returnItem) => {
  selectedReturn.value = returnItem
  showViewModal.value = true
}

const handleEdit = (returnItem) => {
  selectedReturn.value = returnItem
  showEditModal.value = true
}

const handleComplete = async (returnItem) => {
  const confirmed = await confirm(
    `Are you sure you want to complete return ${returnItem.return_number}? This will update inventory and accounting.`
  )

  if (confirmed) {
    try {
      await purchaseReturnStore.completePurchaseReturn(returnItem.id)
      await fetchReturns()
      alert('Purchase return completed successfully!')
    } catch (error) {
      console.error('Error completing return:', error)
    }
  }
}

const handleCancel = async (returnItem) => {
  const confirmed = await confirm(
    `Are you sure you want to cancel return ${returnItem.return_number}? This action cannot be undone.`
  )

  if (confirmed) {
    try {
      await purchaseReturnStore.cancelPurchaseReturn(returnItem.id)
      await fetchReturns()
      alert('Purchase return cancelled successfully!')
    } catch (error) {
      console.error('Error cancelling return:', error)
    }
  }
}

const handleDelete = async (returnItem) => {
  const confirmed = await confirm(
    `Are you sure you want to delete return ${returnItem.return_number}? This action cannot be undone.`
  )

  if (confirmed) {
    try {
      await purchaseReturnStore.deletePurchaseReturn(returnItem.id)
      await fetchReturns()
      alert('Purchase return deleted successfully!')
    } catch (error) {
      console.error('Error deleting return:', error)
    }
  }
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedReturn.value = null
}

const handleSaved = () => {
  closeModals()
  fetchReturns()
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-warning text-dark',
    completed: 'bg-success',
    cancelled: 'bg-danger'
  }
  return classes[status] || 'bg-secondary'
}

// Lifecycle
onMounted(() => {
  fetchReturns()
})
</script>

<style scoped>
.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
