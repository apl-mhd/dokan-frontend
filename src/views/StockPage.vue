<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <PageHeader title="Stock Management" icon="bi-boxes" />

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-4" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" id="stock-tab" data-bs-toggle="tab" data-bs-target="#stock" type="button" role="tab">
          <i class="bi bi-box me-2"></i>Current Stock
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="transactions-tab" data-bs-toggle="tab" data-bs-target="#transactions" type="button" role="tab">
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
        <DataTable v-if="!stockStore.loading" :columns="stockColumns" :items="stockStore.stocks || []" :pagination="stockPaginationData" empty-message="No stock data found." @page-change="handleStockPageChange">
          <template #filters>
            <div class="row g-3 mb-3">
              <!-- Search Input -->
              <div class="col-md-4">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input v-model="stockFilters.search" type="text" class="form-control" placeholder="Search by product, warehouse..." @input="handleStockFilterChange" />
                  <button v-if="stockFilters.search" class="btn btn-outline-secondary" type="button" @click="clearStockSearch" title="Clear search">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
              <!-- Warehouse Filter -->
              <div class="col-md-3">
                <select v-model="stockFilters.warehouse" class="form-select" @change="handleStockFilterChange">
                  <option value="">All Warehouses</option>
                  <option v-for="warehouse in warehouseStore.warehouses" :key="warehouse.id" :value="warehouse.id">
                    {{ warehouse.name }}
                  </option>
                </select>
              </div>
              <!-- Stock Level Filter -->
              <div class="col-md-3">
                <select v-model="stockFilters.stockLevel" class="form-select" @change="handleStockFilterChange">
                  <option value="">All Stock Levels</option>
                  <option value="low">Low (≤10)</option>
                  <option value="medium">Medium (11-100)</option>
                  <option value="high">High (>100)</option>
                </select>
              </div>
              <!-- Clear Filters Button -->
              <div class="col-md-2">
                <button v-if="hasActiveStockFilters" class="btn btn-outline-secondary w-100" type="button" @click="clearStockFilters">
                  <i class="bi bi-x-circle me-1"></i>Clear
                </button>
              </div>
            </div>
          </template>
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
        <ErrorAlert :error="stockStore.transactionsError" title="Error" dismissible @dismiss="stockStore.transactionsError = null" />

        <!-- Transactions Table -->
        <DataTable v-if="!stockStore.loadingTransactions" :columns="transactionColumns" :items="stockStore.transactions || []" :pagination="transactionPaginationData" empty-message="No stock transactions found." @page-change="handleTransactionPageChange">
          <template #filters>
            <div class="row g-3 mb-3">
              <!-- Search Input -->
              <div class="col-md-3">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input v-model="transactionFilters.search" type="text" class="form-control" placeholder="Search by product, warehouse, type..." @input="handleTransactionFilterChange" />
                  <button v-if="transactionFilters.search" class="btn btn-outline-secondary" type="button" @click="clearTransactionSearch" title="Clear search">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
              <!-- Transaction Type Filter -->
              <div class="col-md-2">
                <select v-model="transactionFilters.transactionType" class="form-select" @change="handleTransactionFilterChange">
                  <option value="">All Types</option>
                  <option value="purchase">Purchase</option>
                  <option value="sale">Sale</option>
                  <option value="sale_return">Sale Return</option>
                  <option value="purchase_return">Purchase Return</option>
                  <option value="transfer_in">Transfer In</option>
                  <option value="transfer_out">Transfer Out</option>
                  <option value="adjustment_in">Adjustment In</option>
                  <option value="adjustment_out">Adjustment Out</option>
                </select>
              </div>
              <!-- Direction Filter -->
              <div class="col-md-2">
                <select v-model="transactionFilters.direction" class="form-select" @change="handleTransactionFilterChange">
                  <option value="">All Directions</option>
                  <option value="in">In</option>
                  <option value="out">Out</option>
                </select>
              </div>
              <!-- Warehouse Filter -->
              <div class="col-md-2">
                <select v-model="transactionFilters.warehouse" class="form-select" @change="handleTransactionFilterChange">
                  <option value="">All Warehouses</option>
                  <option v-for="warehouse in warehouseStore.warehouses" :key="warehouse.id" :value="warehouse.id">
                    {{ warehouse.name }}
                  </option>
                </select>
              </div>
              <!-- Clear Filters Button -->
              <div class="col-md-3">
                <button v-if="hasActiveTransactionFilters" class="btn btn-outline-secondary w-100" type="button" @click="clearTransactionFilters">
                  <i class="bi bi-x-circle me-1"></i>Clear
                </button>
              </div>
            </div>
          </template>
          <template #body="{ items }">
            <tr v-for="transaction in items" :key="transaction.id">
              <td>{{ transaction.id }}</td>
              <td>{{ formatDateTime(transaction.created_at) }}</td>
              <td>
                <strong>{{ transaction.reference_number || transaction.reference || '-' }}</strong>
                <span v-if="transaction.reference_type" class="d-block small text-muted">
                  {{ transaction.reference_type }}
                </span>
              </td>
              <td><strong>{{ transaction.product_name || `Product ${transaction.product}` }}</strong></td>
              <td>{{ transaction.warehouse_name || `Warehouse ${transaction.warehouse}` }}</td>
              <td>
                <span class="badge" :class="getTransactionTypeClass(transaction.transaction_type)">
                  {{ transaction.transaction_type }}
                </span>
              </td>
              <td>
                <span :class="transaction.direction === 'in' ? 'text-success' : 'text-danger'">
                  {{ transaction.direction === 'in' ? '+' : '-' }}{{ formatNumber(transaction.quantity) }}
                </span>
                <span class="text-muted ms-1">{{ transaction.unit_name || 'N/A' }}</span>
              </td>
              <td>
                <strong v-if="transaction.balance_after != null">{{ formatNumber(transaction.balance_after) }}</strong>
                <span v-else class="text-muted">N/A</span>
                <span v-if="transaction.balance_after != null" class="text-muted ms-1">{{ transaction.unit_name || 'N/A' }}</span>
              </td>
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
import { useWarehouseStore } from '../stores/warehouse.store'
import { useFormatter } from '../composables/useFormatter'
import { usePagination } from '../composables/usePagination'

// Components
import PageHeader from '../components/common/PageHeader.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorAlert from '../components/common/ErrorAlert.vue'
import DataTable from '../components/common/DataTable.vue'

// Stores
const stockStore = useStockStore()
const warehouseStore = useWarehouseStore()

// Composables
const { formatDate, formatDateTime, formatNumber, truncate } = useFormatter()
const stockPagination = usePagination(10)
const transactionPagination = usePagination(10)

// Filter state
const stockFilters = ref({
  search: '',
  warehouse: '',
  stockLevel: ''
})

const transactionFilters = ref({
  search: '',
  transactionType: '',
  direction: '',
  warehouse: ''
})

// Computed
const hasActiveStockFilters = computed(() => {
  return !!(stockFilters.value.search || stockFilters.value.warehouse || stockFilters.value.stockLevel)
})

const hasActiveTransactionFilters = computed(() => {
  return !!(transactionFilters.value.search || transactionFilters.value.transactionType || 
           transactionFilters.value.direction || transactionFilters.value.warehouse)
})

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
  { key: 'reference', label: 'Reference', width: '160px' },
  { key: 'product', label: 'Product' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'type', label: 'Type', width: '120px' },
  { key: 'quantity', label: 'Quantity', width: '150px' },
  { key: 'balance_after', label: 'Balance After', width: '150px' },
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
  await warehouseStore.fetchWarehouses()
  await Promise.all([
    fetchStocks(),
    fetchTransactions()
  ])
})

// Methods
const fetchStocks = async () => {
  const params = stockPagination.getParams()
  
  // Add filter parameters
  if (stockFilters.value.search) {
    params.search = stockFilters.value.search
  }
  if (stockFilters.value.warehouse) {
    params.warehouse = stockFilters.value.warehouse
  }
  if (stockFilters.value.stockLevel) {
    params.stock_level = stockFilters.value.stockLevel
  }
  
  await stockStore.fetchStocks(params)
  if (stockStore.pagination) {
    stockPagination.updateFromResponse(stockStore.pagination)
  }
}

const fetchTransactions = async () => {
  const params = transactionPagination.getParams()
  
  // Add filter parameters
  if (transactionFilters.value.search) {
    params.search = transactionFilters.value.search
  }
  if (transactionFilters.value.transactionType) {
    params.transaction_type = transactionFilters.value.transactionType
  }
  if (transactionFilters.value.direction) {
    params.direction = transactionFilters.value.direction
  }
  if (transactionFilters.value.warehouse) {
    params.warehouse = transactionFilters.value.warehouse
  }
  
  await stockStore.fetchStockTransactions(params)
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

const handleStockFilterChange = async () => {
  // Reset to first page when filters change
  stockPagination.goToPage(1)
  await fetchStocks()
}

const handleTransactionFilterChange = async () => {
  // Reset to first page when filters change
  transactionPagination.goToPage(1)
  await fetchTransactions()
}

const clearStockSearch = () => {
  stockFilters.value.search = ''
  handleStockFilterChange()
}

const clearStockFilters = () => {
  stockFilters.value = {
    search: '',
    warehouse: '',
    stockLevel: ''
  }
  handleStockFilterChange()
}

const clearTransactionSearch = () => {
  transactionFilters.value.search = ''
  handleTransactionFilterChange()
}

const clearTransactionFilters = () => {
  transactionFilters.value = {
    search: '',
    transactionType: '',
    direction: '',
    warehouse: ''
  }
  handleTransactionFilterChange()
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
    purchase_return: 'bg-danger',
    sale_return: 'bg-warning text-dark',
    transfer_in: 'bg-info',
    transfer_out: 'bg-info',
    adjustment_in: 'bg-secondary',
    adjustment_out: 'bg-secondary'
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
