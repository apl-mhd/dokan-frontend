<template>
  <div class="container-fluid">
    <PageHeader title="Dashboard" icon="bi-speedometer2">
      <template #actions>
        <button class="btn btn-outline-primary btn-sm" @click="refreshDashboard">
          <i class="bi bi-arrow-clockwise me-2"></i>Refresh
        </button>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" />

    <!-- Error State -->
    <ErrorAlert :error="error" title="Error" dismissible @dismiss="error = null" />

    <div v-if="!loading">
      <!-- Sales Section -->
      <div class="row mb-4">
        <div class="col-12">
          <h4 class="mb-3">
            <i class="bi bi-cash-coin me-2 text-success"></i>Sales Overview
          </h4>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="card text-white bg-success shadow-sm">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-white-50">Today's Sales</h6>
              <h2 class="card-title mb-0">{{ formatCurrency(stats.sales.today.total) }}</h2>
              <small>{{ stats.sales.today.count }} invoices</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card text-white bg-info shadow-sm">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-white-50">Month Sales</h6>
              <h2 class="card-title mb-0">{{ formatCurrency(stats.sales.month.total) }}</h2>
              <small>{{ stats.sales.month.count }} invoices</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card text-white bg-warning shadow-sm">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-dark-50">
                <i class="bi bi-currency-dollar me-1"></i>Customer Dues
              </h6>
              <h2 class="card-title mb-0 text-dark">{{ formatCurrency(stats.sales.pending_dues) }}</h2>
              <small class="text-dark">Outstanding payments from customers</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card text-white bg-primary shadow-sm">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-white-50">Total Invoices</h6>
              <h2 class="card-title mb-0">{{ saleStore.sales.length }}</h2>
              <router-link to="/sale" class="btn btn-sm btn-light mt-2">View All</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Combined Sales, Dues, and Payments Chart -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card shadow-sm">
            <div class="card-header bg-light">
              <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                <h5 class="mb-0">
                  <i class="bi bi-graph-up-arrow me-2"></i>Sales vs Dues vs Payments
                </h5>
                <div class="d-flex flex-wrap align-items-center gap-2">
                  <label class="mb-0 small">Customer:</label>
                  <select v-model="combinedCustomerId" class="form-select form-select-sm" style="width: 180px; flex: 0 0 auto;" @change="applyCombinedCustomerFilter">
                    <option value="">All customers</option>
                    <option v-for="c in customerStore.customers" :key="c.id" :value="c.id">
                      {{ c.name }}
                    </option>
                  </select>
                  <ul class="nav nav-tabs card-header-tabs mb-0">
                    <li class="nav-item">
                      <a href="#" class="nav-link" :class="{ active: combinedPeriod === 'weekly' }" @click.stop.prevent="updateCombinedPeriod('weekly')">
                        Weekly
                      </a>
                    </li>
                    <li class="nav-item">
                      <a href="#" class="nav-link" :class="{ active: combinedPeriod === 'monthly' }" @click.stop.prevent="updateCombinedPeriod('monthly')">
                        Monthly
                      </a>
                    </li>
                    <li class="nav-item">
                      <a href="#" class="nav-link" :class="{ active: combinedPeriod === 'custom' }" @click.stop.prevent="combinedPeriod = 'custom'">
                        Custom Range
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="d-flex flex-wrap gap-3 align-items-center mb-2 small">
                <span class="text-success fw-semibold">
                  <i class="bi bi-cash-coin me-1"></i>Total Sales: {{ formatCurrency(combinedTotals.totalSales) }}
                </span>
                <span class="text-warning text-dark fw-semibold">
                  <i class="bi bi-currency-dollar me-1"></i>Total Dues: {{ formatCurrency(combinedTotals.totalDues) }}
                </span>
                <span class="text-primary fw-semibold">
                  <i class="bi bi-credit-card me-1"></i>Total Payments: {{ formatCurrency(combinedTotals.totalPayments) }}
                </span>
              </div>
              <div v-if="combinedPeriod === 'custom'" class="d-flex gap-2 align-items-center">
                <div class="d-flex align-items-center gap-2">
                  <label class="mb-0 small">From:</label>
                  <input type="date" v-model="combinedDateFrom" class="form-control form-control-sm" style="width: auto;" @change="updateCombinedCustomDateRange" />
                </div>
                <div class="d-flex align-items-center gap-2">
                  <label class="mb-0 small">To:</label>
                  <input type="date" v-model="combinedDateTo" class="form-control form-control-sm" style="width: auto;" @change="updateCombinedCustomDateRange" />
                </div>
                <button class="btn btn-sm btn-outline-secondary" @click="applyCombinedDateRange" :disabled="!combinedDateFrom || !combinedDateTo">
                  Apply
                </button>
              </div>
            </div>
            <div class="card-body">
              <Line :key="`sales-combined-${combinedPeriod}-${combinedCustomerId || 'all'}`" :data="combinedChartData" :options="combinedChartOptions" />
            </div>
          </div>
        </div>
      </div>

      <!-- Product Sales (Base Quantity) Chart - from Stock Movement -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card shadow-sm">
            <div class="card-header bg-light">
              <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                <h5 class="mb-0">
                  <i class="bi bi-box-seam me-2"></i>Product Sales (Base Quantity)
                </h5>
                <div class="d-flex flex-wrap align-items-center gap-2">
                  <label class="mb-0 small">Product:</label>
                  <select v-model="selectedProductId" class="form-select form-select-sm" style="width: 180px; flex: 0 0 auto;" @change="applyProductFilter">
                    <option value="">Select a product</option>
                    <option v-for="p in productStore.products" :key="p.id" :value="p.id">
                      {{ p.name }}
                    </option>
                  </select>
                  <template v-if="selectedProductId">
                    <label class="mb-0 small">Unit:</label>
                    <select v-model="selectedProductUnitId" class="form-select form-select-sm" style="width: 120px; flex: 0 0 auto;">
                      <option v-for="u in productUnitsForSelectedProduct" :key="u.id" :value="u.id">{{ u.name }}</option>
                    </select>
                  </template>
                  <ul class="nav nav-tabs card-header-tabs mb-0">
                    <li class="nav-item">
                      <a href="#" class="nav-link" :class="{ active: productSalesPeriod === 'weekly' }" @click.stop.prevent="updateProductSalesPeriod('weekly')">Weekly</a>
                    </li>
                    <li class="nav-item">
                      <a href="#" class="nav-link" :class="{ active: productSalesPeriod === 'monthly' }" @click.stop.prevent="updateProductSalesPeriod('monthly')">Monthly</a>
                    </li>
                    <li class="nav-item">
                      <a href="#" class="nav-link" :class="{ active: productSalesPeriod === 'custom' }" @click.stop.prevent="productSalesPeriod = 'custom'">Custom Range</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div v-if="productSalesPeriod === 'custom'" class="d-flex gap-2 align-items-center flex-wrap">
                <div class="d-flex align-items-center gap-2">
                  <label class="mb-0 small">From:</label>
                  <input type="date" v-model="productSalesDateFrom" class="form-control form-control-sm" style="width: auto;" />
                </div>
                <div class="d-flex align-items-center gap-2">
                  <label class="mb-0 small">To:</label>
                  <input type="date" v-model="productSalesDateTo" class="form-control form-control-sm" style="width: auto;" />
                </div>
                <button class="btn btn-sm btn-outline-secondary" @click="applyProductSalesDateRange" :disabled="!productSalesDateFrom || !productSalesDateTo">Apply</button>
              </div>
            </div>
            <div class="card-body">
              <div v-if="!selectedProductId" class="text-center text-muted py-5">
                <i class="bi bi-graph-up" style="font-size: 3rem;"></i>
                <p class="mt-2 mb-0">Select a product to view sales graph</p>
              </div>
              <div v-else>
                <h6 class="text-muted mb-2">Quantity Sold Over Time</h6>
                <Line :data="productSalesTrendChartData" :options="productSalesTrendChartOptions" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Sales (Amount) Chart -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card shadow-sm">
            <div class="card-header bg-light">
              <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                <h5 class="mb-0">
                  <i class="bi bi-currency-dollar me-2"></i>Product Sales (Amount)
                </h5>
                <div class="d-flex flex-wrap align-items-center gap-2">
                  <label class="mb-0 small">Product:</label>
                  <select v-model="selectedProductId" class="form-select form-select-sm" style="width: 180px; flex: 0 0 auto;" @change="applyProductFilter">
                    <option value="">Select a product</option>
                    <option v-for="p in productStore.products" :key="p.id" :value="p.id">
                      {{ p.name }}
                    </option>
                  </select>
                  <ul class="nav nav-tabs card-header-tabs mb-0">
                    <li class="nav-item">
                      <a href="#" class="nav-link" :class="{ active: productSalesPeriod === 'weekly' }" @click.stop.prevent="updateProductSalesPeriod('weekly')">Weekly</a>
                    </li>
                    <li class="nav-item">
                      <a href="#" class="nav-link" :class="{ active: productSalesPeriod === 'monthly' }" @click.stop.prevent="updateProductSalesPeriod('monthly')">Monthly</a>
                    </li>
                    <li class="nav-item">
                      <a href="#" class="nav-link" :class="{ active: productSalesPeriod === 'custom' }" @click.stop.prevent="productSalesPeriod = 'custom'">Custom Range</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div v-if="productSalesPeriod === 'custom'" class="d-flex gap-2 align-items-center flex-wrap">
                <div class="d-flex align-items-center gap-2">
                  <label class="mb-0 small">From:</label>
                  <input type="date" v-model="productSalesDateFrom" class="form-control form-control-sm" style="width: auto;" />
                </div>
                <div class="d-flex align-items-center gap-2">
                  <label class="mb-0 small">To:</label>
                  <input type="date" v-model="productSalesDateTo" class="form-control form-control-sm" style="width: auto;" />
                </div>
                <button class="btn btn-sm btn-outline-secondary" @click="applyProductSalesDateRange" :disabled="!productSalesDateFrom || !productSalesDateTo">Apply</button>
              </div>
            </div>
            <div class="card-body">
              <div v-if="!selectedProductId" class="text-center text-muted py-5">
                <i class="bi bi-currency-dollar" style="font-size: 3rem;"></i>
                <p class="mt-2 mb-0">Select a product to view sales amount graph</p>
              </div>
              <div v-else>
                <h6 class="text-muted mb-2">Sales Amount Over Time (X: Date, Y: Amount ৳)</h6>
                <Line :data="productSalesAmountChartData" :options="productSalesAmountChartOptions" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Purchase Section -->
      <div class="row mb-4">
        <div class="col-12">
          <h4 class="mb-3">
            <i class="bi bi-bag-plus me-2 text-primary"></i>Purchase Overview
          </h4>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="card text-white bg-primary shadow-sm">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-white-50">Today's Purchases</h6>
              <h2 class="card-title mb-0">{{ formatCurrency(stats.purchases.today.total) }}</h2>
              <small>{{ stats.purchases.today.count }} invoices</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card text-white bg-secondary shadow-sm">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-white-50">Month Purchases</h6>
              <h2 class="card-title mb-0">{{ formatCurrency(stats.purchases.month.total) }}</h2>
              <small>{{ stats.purchases.month.count }} invoices</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card text-white bg-danger shadow-sm">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-white-50">
                <i class="bi bi-currency-dollar me-1"></i>Supplier Dues
              </h6>
              <h2 class="card-title mb-0">{{ formatCurrency(stats.purchases.supplier_outstanding) }}</h2>
              <small>Outstanding payments to suppliers</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card text-white bg-dark shadow-sm">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-white-50">Total Invoices</h6>
              <h2 class="card-title mb-0">{{ purchaseStore.purchases.length }}</h2>
              <router-link to="/purchase" class="btn btn-sm btn-light mt-2">View All</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Combined Purchase, Payments, and Dues Chart -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card shadow-sm">
            <div class="card-header bg-light">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="mb-0">
                  <i class="bi bi-graph-down-arrow me-2"></i>Purchase vs Payments vs Dues
                </h5>
                <ul class="nav nav-tabs card-header-tabs">
                  <li class="nav-item">
                    <a href="#" class="nav-link" :class="{ active: purchaseCombinedPeriod === 'weekly' }" @click.stop.prevent="updatePurchaseCombinedPeriod('weekly')">
                      Weekly
                    </a>
                  </li>
                  <li class="nav-item">
                    <a href="#" class="nav-link" :class="{ active: purchaseCombinedPeriod === 'monthly' }" @click.stop.prevent="updatePurchaseCombinedPeriod('monthly')">
                      Monthly
                    </a>
                  </li>
                  <li class="nav-item">
                    <a href="#" class="nav-link" :class="{ active: purchaseCombinedPeriod === 'custom' }" @click.stop.prevent="purchaseCombinedPeriod = 'custom'">
                      Custom Range
                    </a>
                  </li>
                </ul>
              </div>
              <div v-if="purchaseCombinedPeriod === 'custom'" class="d-flex gap-2 align-items-center">
                <div class="d-flex align-items-center gap-2">
                  <label class="mb-0 small">From:</label>
                  <input type="date" v-model="purchaseCombinedDateFrom" class="form-control form-control-sm" style="width: auto;" @change="updatePurchaseCombinedCustomDateRange" />
                </div>
                <div class="d-flex align-items-center gap-2">
                  <label class="mb-0 small">To:</label>
                  <input type="date" v-model="purchaseCombinedDateTo" class="form-control form-control-sm" style="width: auto;" @change="updatePurchaseCombinedCustomDateRange" />
                </div>
                <button class="btn btn-sm btn-outline-secondary" @click="applyPurchaseCombinedDateRange" :disabled="!purchaseCombinedDateFrom || !purchaseCombinedDateTo">
                  Apply
                </button>
              </div>
            </div>
            <div class="card-body">
              <Line :data="purchaseCombinedChartData" :options="combinedChartOptions" />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Row -->
      <div class="row g-4 mb-4">
        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">
                <i class="bi bi-people me-2 text-primary"></i>Suppliers
              </h5>
              <h3>{{ supplierStore.suppliers.length }}</h3>
              <router-link to="/supplier" class="btn btn-sm btn-outline-primary mt-2">
                Manage Suppliers
              </router-link>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">
                <i class="bi bi-person-circle me-2 text-success"></i>Customers
              </h5>
              <h3>{{ customerStore.customers.length }}</h3>
              <router-link to="/customer" class="btn btn-sm btn-outline-success mt-2">
                Manage Customers
              </router-link>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">
                <i class="bi bi-building me-2 text-info"></i>Warehouses
              </h5>
              <h3>{{ warehouseStore.warehouses.length }}</h3>
              <router-link to="/warehouse" class="btn btn-sm btn-outline-info mt-2">
                Manage Warehouses
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Low Stock Alert -->
      <div class="row mb-4" v-if="stats.low_stock && stats.low_stock.length > 0">
        <div class="col-12">
          <div class="card shadow-sm border-warning">
            <div class="card-header bg-warning text-dark">
              <h5 class="mb-0">
                <i class="bi bi-exclamation-triangle me-2"></i>Low Stock Alert
              </h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Warehouse</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in stats.low_stock" :key="index">
                      <td>{{ item.product__name }}</td>
                      <td>{{ item.warehouse__name }}</td>
                      <td>
                        <span class="badge bg-danger">{{ item.quantity }}</span>
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import api from '../utility/axios'
import { useProductStore } from '../stores/product.store'
import { usePurchaseStore } from '../stores/purchase.store'
import { useSaleStore } from '../stores/sale.store'
import { useStockStore } from '../stores/stock.store'
import { useSupplierStore } from '../stores/supplier.store'
import { useCustomerStore } from '../stores/customer.store'
import { useWarehouseStore } from '../stores/warehouse.store'
import { useFormatter } from '../composables/useFormatter'

// Components
import PageHeader from '../components/common/PageHeader.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorAlert from '../components/common/ErrorAlert.vue'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// Stores
const productStore = useProductStore()
const purchaseStore = usePurchaseStore()
const saleStore = useSaleStore()
const stockStore = useStockStore()
const supplierStore = useSupplierStore()
const customerStore = useCustomerStore()
const warehouseStore = useWarehouseStore()

// Composables
const { formatCurrency } = useFormatter()

// State
const loading = ref(false)
const error = ref(null)
const salesPeriod = ref('weekly')
const purchasePeriod = ref('weekly')
const paymentPeriod = ref('weekly')
const duesTab = ref('sales')
const duesPeriod = ref('weekly')
const combinedPeriod = ref('weekly')
const combinedCustomerId = ref('')
const purchaseCombinedPeriod = ref('weekly')
const combinedDateFrom = ref('')
const combinedDateTo = ref('')
const purchaseCombinedDateFrom = ref('')
const purchaseCombinedDateTo = ref('')
const selectedProductId = ref('')
const selectedProductUnitId = ref(null)
const productSalesPeriod = ref('weekly')
const productSalesDateFrom = ref('')
const productSalesDateTo = ref('')
const stats = ref({
  sales: {
    today: { total: 0, count: 0 },
    month: { total: 0, count: 0 },
    pending_dues: 0,
    trend: [],
    due_trend: []
  },
  purchases: {
    today: { total: 0, count: 0 },
    month: { total: 0, count: 0 },
    supplier_outstanding: 0,
    trend: [],
    due_trend: []
  },
  customer_payments: {
    trend: []
  },
  supplier_payments: {
    trend: []
  },
  product_sales: {
    trend: [],
    by_product: []
  },
  low_stock: []
})

// Chart Data
const salesChartData = computed(() => {
  const trend = stats.value.sales.trend || []
  return {
    labels: trend.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Sales (৳)',
        backgroundColor: 'rgba(25, 135, 84, 0.2)',
        borderColor: 'rgba(25, 135, 84, 1)',
        data: trend.map(item => item.amount),
        tension: 0.4
      }
    ]
  }
})

// Product Sales Trend Chart Data (from stock movement - base quantity, converted to selected unit)
const productSalesTrendChartData = computed(() => {
  const trend = stats.value.product_sales?.trend || []
  const unit = selectedProductUnit.value
  const cf = unit ? parseFloat(unit.conversion_factor) || 1 : 1
  // Convert from base to display: quantity / conversion_factor
  const toDisplayQty = (baseQty) => (parseFloat(baseQty) || 0) / cf
  return {
    labels: trend.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: unit ? `Qty Sold (${unit.name})` : 'Qty Sold',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderColor: 'rgba(102, 126, 234, 1)',
        data: trend.map(item => toDisplayQty(item.quantity)),
        tension: 0.4,
        fill: true
      }
    ]
  }
})

const productSalesTrendChartOptions = computed(() => {
  const unit = selectedProductUnit.value
  const unitName = unit ? unit.name : 'units'
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} ${unitName}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: unitName },
        ticks: { stepSize: 1 }
      }
    }
  }
})

// Product Sales Amount Chart Data (X: date, Y: amount)
const productSalesAmountChartData = computed(() => {
  const trend = stats.value.product_sales?.amount_trend || []
  return {
    labels: trend.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Sales Amount (৳)',
        backgroundColor: 'rgba(25, 135, 84, 0.2)',
        borderColor: 'rgba(25, 135, 84, 1)',
        data: trend.map(item => item.amount),
        tension: 0.4,
        fill: true
      }
    ]
  }
})

const productSalesAmountChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => formatCurrency(ctx.parsed.y)
      }
    }
  },
  scales: {
    x: {
      title: { display: true, text: 'Date' }
    },
    y: {
      beginAtZero: true,
      title: { display: true, text: 'Amount (৳)' },
      ticks: {
        callback: (value) => '৳' + value.toLocaleString()
      }
    }
  }
}))

const purchaseChartData = computed(() => {
  const trend = stats.value.purchases.trend || []
  return {
    labels: trend.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Purchases (৳)',
        backgroundColor: 'rgba(13, 110, 253, 0.2)',
        borderColor: 'rgba(13, 110, 253, 1)',
        data: trend.map(item => item.amount),
        tension: 0.4
      }
    ]
  }
})

const paymentChartData = computed(() => {
  const trend = stats.value.customer_payments?.trend || []
  return {
    labels: trend.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Customer Payments (৳)',
        backgroundColor: 'rgba(13, 110, 253, 0.2)',
        borderColor: 'rgba(13, 110, 253, 1)',
        data: trend.map(item => item.amount),
        tension: 0.4
      }
    ]
  }
})

const duesChartData = computed(() => {
  const trend = duesTab.value === 'sales' 
    ? (stats.value.sales.due_trend || [])
    : (stats.value.purchases.due_trend || [])
  
  return {
    labels: trend.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: duesTab.value === 'sales' ? 'Customer Dues (৳)' : 'Supplier Dues (৳)',
        backgroundColor: duesTab.value === 'sales' 
          ? 'rgba(255, 193, 7, 0.2)'
          : 'rgba(220, 53, 69, 0.2)',
        borderColor: duesTab.value === 'sales'
          ? 'rgba(255, 193, 7, 1)'
          : 'rgba(220, 53, 69, 1)',
        data: trend.map(item => item.amount),
        tension: 0.4
      }
    ]
  }
})

const duesChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '৳' + value.toLocaleString()
        }
      }
    }
  }
}

// Totals for Sales vs Dues vs Payments (based on current filter)
const combinedTotals = computed(() => {
  const salesTrend = stats.value.sales?.trend || []
  const duesTrend = stats.value.sales?.due_trend || []
  const paymentTrend = stats.value.customer_payments?.trend || []
  const totalSales = salesTrend.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const totalPayments = paymentTrend.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  // Dues: use last value as "ending outstanding" (typical for balance-over-time), fallback to sum
  const totalDues = duesTrend.length
    ? (Number(duesTrend[duesTrend.length - 1].amount) || 0)
    : duesTrend.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  return { totalSales, totalDues, totalPayments }
})

// Combined Chart Data - Sales, Dues, and Payments
const combinedChartData = computed(() => {
  // Include combinedPeriod in dependencies to force recomputation when period changes
  const period = combinedPeriod.value
  const salesTrend = stats.value.sales?.trend || []
  const duesTrend = stats.value.sales?.due_trend || []
  const paymentTrend = stats.value.customer_payments?.trend || []
  
  // Collect all unique dates from all three trends to ensure we have complete data
  const allDates = new Set()
  salesTrend.forEach(item => allDates.add(item.date))
  duesTrend.forEach(item => allDates.add(item.date))
  paymentTrend.forEach(item => allDates.add(item.date))
  
  // Sort dates chronologically
  const baseDates = Array.from(allDates).sort()
  
  // Create maps for quick lookup by date
  const salesMap = new Map(salesTrend.map(item => [item.date, item.amount]))
  const duesMap = new Map(duesTrend.map(item => [item.date, item.amount]))
  const paymentMap = new Map(paymentTrend.map(item => [item.date, item.amount]))
  
  // Build data arrays aligned by date
  const salesData = baseDates.map(date => salesMap.get(date) || 0)
  const duesData = baseDates.map(date => duesMap.get(date) || 0)
  const paymentData = baseDates.map(date => paymentMap.get(date) || 0)
  
  // Create labels from base dates
  const labels = baseDates.map(date => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
  
  return {
    labels: labels,
    datasets: [
      {
        label: 'Sales (৳)',
        backgroundColor: 'rgba(25, 135, 84, 0.2)',
        borderColor: 'rgba(25, 135, 84, 1)',
        data: salesData,
        tension: 0.4,
        fill: false
      },
      {
        label: 'Customer Dues (৳)',
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
        borderColor: 'rgba(255, 193, 7, 1)',
        data: duesData,
        tension: 0.4,
        fill: false
      },
      {
        label: 'Customer Payments (৳)',
        backgroundColor: 'rgba(13, 110, 253, 0.2)',
        borderColor: 'rgba(13, 110, 253, 1)',
        data: paymentData,
        tension: 0.4,
        fill: false
      }
    ]
  }
})

const combinedChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '৳' + value.toLocaleString()
        }
      }
    }
  },
  interaction: {
    mode: 'index',
    intersect: false
  }
}

// Combined Purchase Chart Data - Purchase, Payments, and Dues
const purchaseCombinedChartData = computed(() => {
  const purchaseTrend = stats.value.purchases.trend || []
  const duesTrend = stats.value.purchases.due_trend || []
  const paymentTrend = stats.value.supplier_payments?.trend || []
  
  // Use purchase trend as base since it should have all dates
  // Create maps for quick lookup by date
  const purchaseMap = new Map(purchaseTrend.map(item => [item.date, item.amount]))
  const duesMap = new Map(duesTrend.map(item => [item.date, item.amount]))
  const paymentMap = new Map(paymentTrend.map(item => [item.date, item.amount]))
  
  // Use purchase trend dates as the base (they should all have same date range from API)
  const baseDates = purchaseTrend.map(item => item.date)
  
  // Build data arrays aligned by date
  const purchaseData = baseDates.map(date => purchaseMap.get(date) || 0)
  const duesData = baseDates.map(date => duesMap.get(date) || 0)
  const paymentData = baseDates.map(date => paymentMap.get(date) || 0)
  
  // Create labels from base dates
  const labels = baseDates.map(date => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
  
  return {
    labels: labels,
    datasets: [
      {
        label: 'Purchases (৳)',
        backgroundColor: 'rgba(13, 110, 253, 0.2)',
        borderColor: 'rgba(13, 110, 253, 1)',
        data: purchaseData,
        tension: 0.4,
        fill: false
      },
      {
        label: 'Supplier Payments (৳)',
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        borderColor: 'rgba(40, 167, 69, 1)',
        data: paymentData,
        tension: 0.4,
        fill: false
      },
      {
        label: 'Supplier Dues (৳)',
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
        borderColor: 'rgba(220, 53, 69, 1)',
        data: duesData,
        tension: 0.4,
        fill: false
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '৳' + value.toLocaleString()
        }
      }
    }
  }
}

// Methods
const fetchDashboardStats = async (periodOverride = null, dateFrom = null, dateTo = null, chartType = 'sales') => {
  loading.value = true
  error.value = null
  try {
    // Use override period if provided, otherwise use the most common period
    let period = periodOverride || 'weekly'
    if (!periodOverride) {
      // If any chart is set to monthly, fetch monthly data
      if (salesPeriod.value === 'monthly' || purchasePeriod.value === 'monthly' || duesPeriod.value === 'monthly') {
        period = 'monthly'
      }
    }
    
    const params = { period }
    if (dateFrom && dateTo) {
      params.date_from = dateFrom
      params.date_to = dateTo
    }
    if (chartType) {
      params.chart_type = chartType
    }
    if (selectedProductId.value) {
      params.product_ids = String(selectedProductId.value)
      params.product_sales_period = productSalesPeriod.value
      if (productSalesPeriod.value === 'custom' && productSalesDateFrom.value && productSalesDateTo.value) {
        params.product_sales_date_from = productSalesDateFrom.value
        params.product_sales_date_to = productSalesDateTo.value
      }
    }
    if (combinedCustomerId.value) {
      params.customer_id = combinedCustomerId.value
    }

    const response = await api.get('/dashboard/stats/', { params })
    stats.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch dashboard statistics'
    console.error('Error fetching dashboard stats:', err)
  } finally {
    loading.value = false
  }
}

// Product units for selected product (base + alternatives in same category)
const productUnitsForSelectedProduct = computed(() => {
  if (!selectedProductId.value) return []
  const p = productStore.products.find(pr => pr.id === parseInt(selectedProductId.value))
  if (!p) return []
  if (p.base_unit && p.units && p.units.length) {
    return p.units
  }
  if (p.base_unit) {
    return [{
      id: p.base_unit.id,
      name: p.base_unit.name,
      conversion_factor: p.base_unit.conversion_factor || '1',
      is_base_unit: true
    }]
  }
  return [{ id: 0, name: 'pcs', conversion_factor: '1', is_base_unit: true }]
})

const selectedProductUnit = computed(() => {
  const units = productUnitsForSelectedProduct.value
  const id = selectedProductUnitId.value
  return units.find(u => u.id === id || String(u.id) === String(id)) || units[0]
})

watch(selectedProductId, (newId) => {
  if (!newId) {
    selectedProductUnitId.value = null
    return
  }
  const units = productUnitsForSelectedProduct.value
  const base = units.find(u => u.is_base_unit) || units[0]
  selectedProductUnitId.value = base ? base.id : null
}, { immediate: true })

watch(productUnitsForSelectedProduct, (units) => {
  if (!units.length || !selectedProductId.value) return
  const current = selectedProductUnitId.value
  const valid = units.some(u => u.id === current || String(u.id) === String(current))
  if (!valid) {
    const base = units.find(u => u.is_base_unit) || units[0]
    selectedProductUnitId.value = base ? base.id : null
  }
})

const applyProductFilter = async () => {
  if (!selectedProductId.value) return
  await fetchDashboardStats()
  await nextTick()
}

const updateProductSalesPeriod = async (period) => {
  if (productSalesPeriod.value === period) return
  productSalesPeriod.value = period
  if (period !== 'custom') {
    productSalesDateFrom.value = ''
    productSalesDateTo.value = ''
  }
  if (selectedProductId.value) {
    await fetchDashboardStats()
  }
  await nextTick()
}

const applyProductSalesDateRange = async () => {
  if (!productSalesDateFrom.value || !productSalesDateTo.value) return
  if (new Date(productSalesDateFrom.value) > new Date(productSalesDateTo.value)) {
    error.value = 'Start date must be before end date'
    return
  }
  if (selectedProductId.value) {
    await fetchDashboardStats()
  }
  await nextTick()
}

const updateSalesPeriod = (period) => {
  salesPeriod.value = period
  purchasePeriod.value = period // Sync all charts to same period
  paymentPeriod.value = period
  duesPeriod.value = period
  combinedPeriod.value = period
  purchaseCombinedPeriod.value = period
  fetchDashboardStats(period)
}

const updatePurchasePeriod = (period) => {
  salesPeriod.value = period // Sync all charts to same period
  purchasePeriod.value = period
  paymentPeriod.value = period
  duesPeriod.value = period
  combinedPeriod.value = period
  purchaseCombinedPeriod.value = period
  fetchDashboardStats(period)
}

const updatePaymentPeriod = (period) => {
  paymentPeriod.value = period
  salesPeriod.value = period // Sync all charts to same period
  purchasePeriod.value = period
  duesPeriod.value = period
  combinedPeriod.value = period
  purchaseCombinedPeriod.value = period
  fetchDashboardStats(period)
}

const updateDuesPeriod = (period) => {
  salesPeriod.value = period // Sync all charts to same period
  purchasePeriod.value = period
  paymentPeriod.value = period
  duesPeriod.value = period
  combinedPeriod.value = period
  purchaseCombinedPeriod.value = period
  fetchDashboardStats(period)
}

const updateCombinedPeriod = async (period) => {
  if (combinedPeriod.value === period) return // Already set, no need to update
  combinedPeriod.value = period
  if (period !== 'custom') {
    // Reset date range when switching to weekly/monthly
    combinedDateFrom.value = ''
    combinedDateTo.value = ''
    salesPeriod.value = period // Sync all charts to same period
    purchasePeriod.value = period
    paymentPeriod.value = period
    duesPeriod.value = period
    purchaseCombinedPeriod.value = period
    await fetchDashboardStats(period)
  }
  // Force chart update by triggering reactivity
  await nextTick()
}

const updateCombinedCustomDateRange = () => {
  // This is called when date inputs change, but we wait for Apply button
}

const applyCombinedCustomerFilter = async () => {
  const period = combinedPeriod.value
  if (period === 'custom' && combinedDateFrom.value && combinedDateTo.value) {
    await fetchDashboardStats('custom', combinedDateFrom.value, combinedDateTo.value)
  } else {
    await fetchDashboardStats(period)
  }
  await nextTick()
}

const applyCombinedDateRange = async () => {
  if (!combinedDateFrom.value || !combinedDateTo.value) return
  
  // Validate date range
  if (new Date(combinedDateFrom.value) > new Date(combinedDateTo.value)) {
    error.value = 'Start date must be before end date'
    return
  }
  
  await fetchDashboardStats('custom', combinedDateFrom.value, combinedDateTo.value)
  await nextTick()
}

const updatePurchaseCombinedPeriod = async (period) => {
  if (purchaseCombinedPeriod.value === period) return // Already set, no need to update
  purchaseCombinedPeriod.value = period
  if (period !== 'custom') {
    // Reset date range when switching to weekly/monthly
    purchaseCombinedDateFrom.value = ''
    purchaseCombinedDateTo.value = ''
    salesPeriod.value = period // Sync all charts to same period
    purchasePeriod.value = period
    paymentPeriod.value = period
    duesPeriod.value = period
    combinedPeriod.value = period
    await fetchDashboardStats(period, null, null, 'purchase')
  }
  // Force chart update by triggering reactivity
  await nextTick()
}

const updatePurchaseCombinedCustomDateRange = () => {
  // This is called when date inputs change, but we wait for Apply button
}

const applyPurchaseCombinedDateRange = async () => {
  if (!purchaseCombinedDateFrom.value || !purchaseCombinedDateTo.value) return
  
  // Validate date range
  if (new Date(purchaseCombinedDateFrom.value) > new Date(purchaseCombinedDateTo.value)) {
    error.value = 'Start date must be before end date'
    return
  }
  
  await fetchDashboardStats('custom', purchaseCombinedDateFrom.value, purchaseCombinedDateTo.value, 'purchase')
  await nextTick()
}

const switchDuesTab = (tab) => {
  duesTab.value = tab
  // No need to refetch, just switch the tab
}

const refreshDashboard = async () => {
  // Fetch customers first so dropdown is populated before stats (stats may use customer filter)
  await customerStore.fetchCustomers()
  await Promise.all([
    fetchDashboardStats(),
    productStore.fetchProducts(),
    purchaseStore.fetchPurchases(),
    saleStore.fetchSales(),
    stockStore.fetchStocks(),
    supplierStore.fetchSuppliers(),
    warehouseStore.fetchWarehouses()
  ])
}

// Lifecycle
onMounted(() => {
  refreshDashboard()
})
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

.text-white-50 {
  opacity: 0.7;
}

.text-dark-50 {
  opacity: 0.7;
}

/* Fix nav-tabs styling */
.nav-tabs {
  border-bottom: 1px solid #dee2e6;
}

.nav-tabs .nav-item {
  margin-bottom: -1px;
}

.nav-tabs .nav-link {
  color: #495057 !important;
  border: none !important;
  border-bottom: 2px solid transparent !important;
  background: transparent !important;
  cursor: pointer !important;
  padding: 0.5rem 1rem !important;
  text-decoration: none !important;
  user-select: none !important;
}

.nav-tabs .nav-link:hover:not(.active) {
  border-bottom-color: #dee2e6 !important;
  color: #495057 !important;
  background-color: rgba(0, 0, 0, 0.02) !important;
}

.nav-tabs .nav-link.active {
  color: #0d6efd !important;
  background-color: transparent !important;
  border-bottom-color: #0d6efd !important;
  border-bottom-width: 2px !important;
  font-weight: 500 !important;
}

.nav-tabs .nav-link:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>
