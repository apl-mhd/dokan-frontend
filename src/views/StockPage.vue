<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <PageHeader title="Stock Management" icon="bi-boxes" />

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-4" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link active"
          id="stock-tab"
          data-bs-toggle="tab"
          data-bs-target="#stock"
          type="button"
          role="tab"
        >
          <i class="bi bi-box me-2"></i>Current Stock
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="transactions-tab"
          data-bs-toggle="tab"
          data-bs-target="#transactions"
          type="button"
          role="tab"
        >
          <i class="bi bi-arrow-left-right me-2"></i>Stock Transactions
        </button>
      </li>
    </ul>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Current Stock Tab -->
      <div class="tab-pane fade show active" id="stock" role="tabpanel">
        <!-- Loading State -->
        <LoadingSpinner v-if="stockStore.loading" />

        <!-- Error State -->
        <ErrorAlert :error="stockStore.error" title="Error" dismissible @dismiss="stockStore.error = null" />

        <!-- Stock Table -->
        <DataTable
          v-if="!stockStore.loading"
          :columns="stockColumns"
          :items="stockStore.stocks || []"
          :pagination="stockPaginationData"
          empty-message="No stock data found."
          @page-change="handleStockPageChange"
        >
          <template #body="{ items }">
            <tr v-for="stock in items" :key="stock.id">
              <td>{{ stock.id }}</td>
              <td><strong>{{ stock.product_name || `Product ${stock.product}` }}</strong></td>
              <td>{{ stock.warehouse_name || `Warehouse ${stock.warehouse}` }}</td>
              <td>
                <span class="badge" :class="getStockLevelClass(stock.quantity)">
                  {{ formatNumber(stock.quantity) }}
                </span>
              </td>
              <td>{{ stock.unit_name || 'N/A' }}</td>
              <td>{{ formatDate(stock.last_updated) }}</td>
            </tr>
          </template>
        </DataTable>
      </div>

      <!-- Stock Transactions Tab -->
      <div class="tab-pane fade" id="transactions" role="tabpanel">
        <!-- Loading State -->
        <LoadingSpinner v-if="stockStore.loadingTransactions" />

        <!-- Error State -->
        <ErrorAlert
          :error="stockStore.transactionsError"
          title="Error"
          dismissible
          @dismiss="stockStore.transactionsError = null"
        />

        <!-- Transactions Table -->
        <DataTable
          v-if="!stockStore.loadingTransactions"
          :columns="transactionColumns"
          :items="stockStore.transactions || []"
          :pagination="transactionPaginationData"
          empty-message="No stock transactions found."
          @page-change="handleTransactionPageChange"
        >
          <template #body="{ items }">
            <tr v-for="transaction in items" :key="transaction.id">
              <td>{{ transaction.id }}</td>
              <td>{{ formatDateTime(transaction.created_at) }}</td>
              <td><strong>{{ transaction.product_name || `Product ${transaction.product}` }}</strong></td>
              <td>{{ transaction.warehouse_name || `Warehouse ${transaction.warehouse}` }}</td>
              <td>
                <span class="badge" :class="getTransactionTypeClass(transaction.transaction_type)">
                  {{ transaction.transaction_type }}
                </span>
              </td>
              <td>
                <span :class="transaction.quantity > 0 ? 'text-success' : 'text-danger'">
                  {{ transaction.quantity > 0 ? '+' : '' }}{{ formatNumber(transaction.quantity) }}
                </span>
              </td>
              <td>{{ transaction.balance_after || 'N/A' }}</td>
              <td>{{ transaction.unit_name || 'N/A' }}</td>
              <td>{{ truncate(transaction.notes, 50) }}</td>
            </tr>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStockStore } from '../stores/stock.store'
import { useFormatter } from '../composables/useFormatter'
import { usePagination } from '../composables/usePagination'

// Components
import PageHeader from '../components/common/PageHeader.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorAlert from '../components/common/ErrorAlert.vue'
import DataTable from '../components/common/DataTable.vue'

// Stores
const stockStore = useStockStore()

// Composables
const { formatDate, formatDateTime, formatNumber, truncate } = useFormatter()
const stockPagination = usePagination(10)
const transactionPagination = usePagination(10)

// Table columns definition
const stockColumns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'product', label: 'Product' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'quantity', label: 'Quantity', width: '120px' },
  { key: 'unit', label: 'Unit', width: '100px' },
  { key: 'last_updated', label: 'Last Updated', width: '150px' }
]

const transactionColumns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'created_at', label: 'Date/Time', width: '180px' },
  { key: 'product', label: 'Product' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'type', label: 'Type', width: '120px' },
  { key: 'quantity', label: 'Quantity', width: '100px' },
  { key: 'unit', label: 'Unit', width: '100px' },
  { key: 'balance_after', label: 'Balance After', width: '120px' },
  { key: 'reference', label: 'Reference', width: '120px' },
  { key: 'notes', label: 'Notes' }
]

// Computed pagination data
const stockPaginationData = computed(() => ({
  currentPage: stockPagination.currentPage.value,
  totalPages: stockPagination.totalPages.value,
  totalItems: stockPagination.totalItems.value,
  startIndex: stockPagination.startIndex.value,
  endIndex: stockPagination.endIndex.value,
  hasNextPage: stockPagination.hasNextPage.value,
  hasPrevPage: stockPagination.hasPrevPage.value
}))

const transactionPaginationData = computed(() => ({
  currentPage: transactionPagination.currentPage.value,
  totalPages: transactionPagination.totalPages.value,
  totalItems: transactionPagination.totalItems.value,
  startIndex: transactionPagination.startIndex.value,
  endIndex: transactionPagination.endIndex.value,
  hasNextPage: transactionPagination.hasNextPage.value,
  hasPrevPage: transactionPagination.hasPrevPage.value
}))

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchStocks(),
    fetchTransactions()
  ])
})

// Methods
const fetchStocks = async () => {
  await stockStore.fetchStocks(stockPagination.getParams())
  if (stockStore.pagination) {
    stockPagination.updateFromResponse(stockStore.pagination)
  }
}

const fetchTransactions = async () => {
  await stockStore.fetchStockTransactions(transactionPagination.getParams())
  if (stockStore.transactionsPagination) {
    transactionPagination.updateFromResponse(stockStore.transactionsPagination)
  }
}

const handleStockPageChange = async (page) => {
  stockPagination.goToPage(page)
  await fetchStocks()
}

const handleTransactionPageChange = async (page) => {
  transactionPagination.goToPage(page)
  await fetchTransactions()
}

const getStockLevelClass = (quantity) => {
  if (quantity === 0) return 'bg-danger'
  if (quantity < 10) return 'bg-warning text-dark'
  return 'bg-success'
}

const getTransactionTypeClass = (type) => {
  const typeMap = {
    purchase: 'bg-success',
    sale: 'bg-primary',
    adjustment: 'bg-warning text-dark',
    transfer: 'bg-info'
  }
  return typeMap[type?.toLowerCase()] || 'bg-secondary'
}
</script>

<style scoped>
.nav-tabs .nav-link {
  font-weight: 500;
  color: #495057 !important;
}

.nav-tabs .nav-link:hover {
  color: #0d6efd !important;
}

.nav-tabs .nav-link.active {
  font-weight: 600;
  color: #0d6efd !important;
  background-color: #fff !important;
  border-color: #dee2e6 #dee2e6 #fff !important;
}
</style>
