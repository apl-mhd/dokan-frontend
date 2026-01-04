<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col">
        <h2 class="mb-3">
          <i class="bi bi-boxes me-2"></i>Stock Management
        </h2>
      </div>
    </div>

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
        <!-- Loading Spinner -->
        <div v-if="stockStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="stockStore.error" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ stockStore.error }}
        </div>

        <!-- Stock Table -->
        <div v-else class="card shadow-sm">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Warehouse</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="stock in stockStore.stocks" :key="`${stock.product}-${stock.warehouse}`">
                    <td><strong>{{ stock.product_name || `Product ${stock.product}` }}</strong></td>
                    <td>{{ stock.warehouse_name || `Warehouse ${stock.warehouse}` }}</td>
                    <td>
                      <span class="badge bg-info fs-6">{{ stock.quantity }}</span>
                    </td>
                    <td>
                      <span v-if="stock.quantity > 10" class="badge bg-success">In Stock</span>
                      <span v-else-if="stock.quantity > 0" class="badge bg-warning">Low Stock</span>
                      <span v-else class="badge bg-danger">Out of Stock</span>
                    </td>
                    <td>{{ formatDate(stock.updated_at) }}</td>
                  </tr>
                  <tr v-if="stockStore.stocks.length === 0 && !stockStore.loading">
                    <td colspan="5" class="text-center text-muted py-4">
                      No stock records found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Stock Transactions Tab -->
      <div class="tab-pane fade" id="transactions" role="tabpanel">
        <!-- Loading Spinner -->
        <div v-if="stockStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="stockStore.error" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ stockStore.error }}
        </div>

        <!-- Transactions Table -->
        <div v-else class="card shadow-sm">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Direction</th>
                    <th>Quantity</th>
                    <th>Balance After</th>
                    <th>Unit</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="transaction in stockStore.stockTransactions" :key="transaction.id">
                    <td>{{ formatDateTime(transaction.created_at) }}</td>
                    <td><strong>{{ transaction.product_name || `Product ${transaction.product}` }}</strong></td>
                    <td>
                      <span class="badge bg-secondary">{{ formatTransactionType(transaction.transaction_type) }}</span>
                    </td>
                    <td>
                      <span
                        class="badge"
                        :class="transaction.direction === 'in' ? 'bg-success' : 'bg-danger'"
                      >
                        <i :class="transaction.direction === 'in' ? 'bi bi-arrow-down' : 'bi bi-arrow-up'"></i>
                        {{ transaction.direction.toUpperCase() }}
                      </span>
                    </td>
                    <td>{{ transaction.quantity }}</td>
                    <td><strong>{{ transaction.balance_after }}</strong></td>
                    <td>{{ transaction.unit_name || `Unit ${transaction.unit}` }}</td>
                    <td>{{ transaction.reference_id }}</td>
                  </tr>
                  <tr v-if="stockStore.stockTransactions.length === 0 && !stockStore.loading">
                    <td colspan="8" class="text-center text-muted py-4">
                      No stock transactions found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStockStore } from '../stores/stock.store'

const stockStore = useStockStore()

onMounted(() => {
  stockStore.fetchStocks()
  stockStore.fetchStockTransactions()
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString()
}

const formatTransactionType = (type) => {
  if (!type) return '-'
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
</script>

<style scoped>
.nav-tabs .nav-link {
  color: #495057;
}

.nav-tabs .nav-link.active {
  font-weight: 600;
}
</style>

