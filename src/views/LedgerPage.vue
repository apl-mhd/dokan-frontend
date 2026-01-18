<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <PageHeader title="Ledger Management" icon="bi-journal-text">
      <template #actions>
        <button class="btn btn-outline-secondary" @click="refreshData" :disabled="ledgerStore.loading" title="Refresh">
          <i class="bi bi-arrow-clockwise me-2"></i>Refresh
        </button>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <LoadingSpinner v-if="ledgerStore.loading" />

    <!-- Error State -->
    <ErrorAlert :error="ledgerStore.error" title="Error" dismissible @dismiss="ledgerStore.error = null" />

    <!-- Data Table -->
    <DataTable v-if="!ledgerStore.loading" :columns="columns" :items="entriesWithBalance" :pagination="paginationData" empty-message="No ledger entries found." @page-change="handlePageChange">
      <template #filters>
        <div class="row g-3 mb-3">
          <!-- Search Input -->
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input v-model="filters.search" type="text" class="form-control" placeholder="Search by party, transaction ID, description..." @input="handleFilterChange" />
              <button v-if="filters.search" class="btn btn-outline-secondary" type="button" @click="clearSearch" title="Clear search">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <!-- Transaction Type Filter -->
          <div class="col-md-3">
            <select v-model="filters.txn_type" class="form-select" @change="handleFilterChange">
              <option value="">All Transaction Types</option>
              <option v-for="type in transactionTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>

          <!-- Date From Filter -->
          <div class="col-md-2">
            <input v-model="filters.date_from" type="date" class="form-control" placeholder="Date From" @change="handleFilterChange" />
          </div>

          <!-- Date To Filter -->
          <div class="col-md-2">
            <input v-model="filters.date_to" type="date" class="form-control" placeholder="Date To" @change="handleFilterChange" />
          </div>

          <!-- Clear Filters Button -->
          <div class="col-md-1">
            <button v-if="hasActiveFilters" class="btn btn-outline-secondary w-100" type="button" @click="clearAllFilters">
              <i class="bi bi-x-circle"></i>
            </button>
          </div>
        </div>
      </template>

      <template #body="{ items }">
        <tr v-for="entry in items" :key="entry.id">
          <td>{{ formatDate(entry.date) }}</td>
          <td>
            <strong>{{ entry.txn_id }}</strong>
          </td>
          <td>
            <span class="badge" :class="getTransactionTypeClass(entry.txn_type)">
              {{ formatTransactionType(entry.txn_type) }}
            </span>
          </td>
          <td>
            <strong>{{ entry.party_name || '-' }}</strong>
          </td>
          <td>{{ truncate(entry.description, 50) }}</td>
          <td class="text-end">
            <span v-if="entry.debit > 0" class="text-success fw-bold">
              {{ formatCurrency(entry.debit) }}
            </span>
            <span v-else class="text-muted">-</span>
          </td>
          <td class="text-end">
            <span v-if="entry.credit > 0" class="text-danger fw-bold">
              {{ formatCurrency(entry.credit) }}
            </span>
            <span v-else class="text-muted">-</span>
          </td>
          <td class="text-end">
            <strong :class="entry.running_balance >= 0 ? 'text-success' : 'text-danger'">
              {{ formatCurrency(entry.running_balance) }}
            </strong>
          </td>
        </tr>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useLedgerStore } from '../stores/ledger.store'
import { useFormatter } from '../composables/useFormatter'
import { usePagination } from '../composables/usePagination'

// Components
import PageHeader from '../components/common/PageHeader.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorAlert from '../components/common/ErrorAlert.vue'
import DataTable from '../components/common/DataTable.vue'

// Stores
const ledgerStore = useLedgerStore()

// Composables
const { formatDate, formatCurrency, truncate } = useFormatter()
const pagination = usePagination(10)

// State
const filters = ref({
  search: '',
  txn_type: '',
  date_from: '',
  date_to: ''
})

// Calculate running balance for each entry PER PARTY
// Entries come from backend sorted by date descending (newest first)
// We need to calculate balance from oldest to newest per party, then reverse for display
const entriesWithBalance = computed(() => {
  if (!ledgerStore.ledgerEntries || ledgerStore.ledgerEntries.length === 0) {
    return []
  }
  
  // Group entries by party (each party has separate running balance)
  // Use party ID for grouping (most reliable)
  const entriesByParty = {}
  ledgerStore.ledgerEntries.forEach(entry => {
    // Use party_id first (explicit from serializer), then party (foreign key), then party_name
    const partyKey = entry.party_id ? String(entry.party_id) :
                     entry.party ? String(entry.party) :
                     entry.party_name || 'unknown'
    
    if (!entriesByParty[partyKey]) {
      entriesByParty[partyKey] = []
    }
    entriesByParty[partyKey].push(entry)
  })
  
  // Process each party's entries separately
  const allEntriesWithBalance = []
  
  Object.values(entriesByParty).forEach(partyEntries => {
    // Sort entries by date ascending (oldest first) for proper running balance calculation
    const sortedEntries = [...partyEntries].sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB // Sort by date ascending
      }
      // If dates are equal, sort by created_at ascending
      return new Date(a.created_at || 0) - new Date(b.created_at || 0)
    })
    
    // Calculate running balance from oldest to newest FOR THIS PARTY
    // Check if opening balance entry exists in the ledger entries
    const hasOpeningBalanceEntry = sortedEntries.some(entry => entry.txn_type === 'opening_balance')
    
    // Start with opening balance if no opening balance ledger entry exists
    // Get opening_balance from first entry (all entries for same party have same opening_balance)
    const partyOpeningBalance = sortedEntries.length > 0 && sortedEntries[0].party_opening_balance 
      ? parseFloat(sortedEntries[0].party_opening_balance) 
      : 0
    
    let runningBalance = hasOpeningBalanceEntry ? 0 : (partyOpeningBalance || 0)
    
    sortedEntries.forEach(entry => {
      // Calculate running balance: Previous Balance + Debit - Credit
      runningBalance = runningBalance + parseFloat(entry.debit || 0) - parseFloat(entry.credit || 0)
      allEntriesWithBalance.push({
        ...entry,
        running_balance: runningBalance
      })
    })
  })
  
  // Sort all entries by date descending (newest first) for display
  return allEntriesWithBalance.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    if (dateB.getTime() !== dateA.getTime()) {
      return dateB - dateA // Sort by date descending (newest first)
    }
    // If dates are equal, sort by created_at descending
    return new Date(b.created_at || 0) - new Date(a.created_at || 0)
  })
})

// Transaction types for filter
const transactionTypes = [
  { value: 'opening_balance', label: 'Opening Balance' },
  { value: 'sale', label: 'Sale' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'sale_return', label: 'Sale Return' },
  { value: 'purchase_return', label: 'Purchase Return' },
  { value: 'payment_received', label: 'Payment Received' },
  { value: 'payment_made', label: 'Payment Made' },
  { value: 'adjustment', label: 'Adjustment' }
]

// Table columns definition
const columns = [
  { key: 'date', label: 'Date', width: '120px' },
  { key: 'txn_id', label: 'Transaction ID', width: '150px' },
  { key: 'txn_type', label: 'Type', width: '130px' },
  { key: 'party', label: 'Party', width: '150px' },
  { key: 'description', label: 'Description' },
  { key: 'debit', label: 'Debit', width: '120px' },
  { key: 'credit', label: 'Credit', width: '120px' },
  { key: 'amount', label: 'Balance', width: '120px' }
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

// Check if filters are active
const hasActiveFilters = computed(() => {
  return !!(filters.value.search || filters.value.txn_type || filters.value.date_from || filters.value.date_to)
})

// Lifecycle
onMounted(async () => {
  await fetchLedgerEntries()
})

// Methods
const fetchLedgerEntries = async () => {
  const params = pagination.getParams()
  
  // Add filter parameters
  if (filters.value.search) {
    params.search = filters.value.search
  }
  if (filters.value.txn_type) {
    params.txn_type = filters.value.txn_type
  }
  if (filters.value.date_from) {
    params.date_from = filters.value.date_from
  }
  if (filters.value.date_to) {
    params.date_to = filters.value.date_to
  }
  
  await ledgerStore.fetchLedgerEntries(params)
  if (ledgerStore.pagination) {
    pagination.updateFromResponse(ledgerStore.pagination)
  }
}

const handlePageChange = async (page) => {
  pagination.goToPage(page)
  await fetchLedgerEntries()
}

const handleFilterChange = async () => {
  // Reset to first page when filters change
  pagination.goToPage(1)
  await fetchLedgerEntries()
}

const clearSearch = () => {
  filters.value.search = ''
  handleFilterChange()
}

const clearAllFilters = () => {
  filters.value = {
    search: '',
    txn_type: '',
    date_from: '',
    date_to: ''
  }
  handleFilterChange()
}

const refreshData = async () => {
  await fetchLedgerEntries()
}

const getTransactionTypeClass = (type) => {
  const typeMap = {
    sale: 'bg-success',
    purchase: 'bg-primary',
    payment_received: 'bg-success',
    payment_made: 'bg-danger',
    opening_balance: 'bg-info',
    sale_return: 'bg-warning text-dark',
    purchase_return: 'bg-warning text-dark',
    adjustment: 'bg-secondary'
  }
  return typeMap[type] || 'bg-secondary'
}

const formatTransactionType = (type) => {
  const typeMap = {
    opening_balance: 'Opening Balance',
    sale: 'Sale',
    purchase: 'Purchase',
    sale_return: 'Sale Return',
    purchase_return: 'Purchase Return',
    payment_received: 'Payment Received',
    payment_made: 'Payment Made',
    adjustment: 'Adjustment'
  }
  return typeMap[type] || type
}
</script>

<style scoped>
.text-end {
  text-align: right;
}
</style>
