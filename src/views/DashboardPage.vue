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
              <h6 class="card-subtitle mb-2 text-dark-50">Pending Customer Dues</h6>
              <h2 class="card-title mb-0 text-dark">{{ formatCurrency(stats.sales.pending_dues) }}</h2>
              <small class="text-dark">Outstanding payments</small>
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

      <!-- Sales Trend Chart -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card shadow-sm">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="bi bi-graph-up me-2"></i>Sales Trend (Last 7 Days)
              </h5>
            </div>
            <div class="card-body">
              <Line :data="salesChartData" :options="chartOptions" />
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
              <h6 class="card-subtitle mb-2 text-white-50">Supplier Outstanding</h6>
              <h2 class="card-title mb-0">{{ formatCurrency(stats.purchases.supplier_outstanding) }}</h2>
              <small>Pending payments</small>
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

      <!-- Purchase Trend Chart -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card shadow-sm">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="bi bi-graph-down me-2"></i>Purchase Trend (Last 7 Days)
              </h5>
            </div>
            <div class="card-body">
              <Line :data="purchaseChartData" :options="chartOptions" />
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
import { ref, computed, onMounted } from 'vue'
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
const stats = ref({
  sales: {
    today: { total: 0, count: 0 },
    month: { total: 0, count: 0 },
    pending_dues: 0,
    trend: []
  },
  purchases: {
    today: { total: 0, count: 0 },
    month: { total: 0, count: 0 },
    supplier_outstanding: 0,
    trend: []
  },
  low_stock: []
})

// Chart Data
const salesChartData = computed(() => ({
  labels: stats.value.sales.trend.map(item => {
    const date = new Date(item.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }),
  datasets: [
    {
      label: 'Sales (৳)',
      backgroundColor: 'rgba(25, 135, 84, 0.2)',
      borderColor: 'rgba(25, 135, 84, 1)',
      data: stats.value.sales.trend.map(item => item.amount),
      tension: 0.4
    }
  ]
}))

const purchaseChartData = computed(() => ({
  labels: stats.value.purchases.trend.map(item => {
    const date = new Date(item.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }),
  datasets: [
    {
      label: 'Purchases (৳)',
      backgroundColor: 'rgba(13, 110, 253, 0.2)',
      borderColor: 'rgba(13, 110, 253, 1)',
      data: stats.value.purchases.trend.map(item => item.amount),
      tension: 0.4
    }
  ]
}))

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
const fetchDashboardStats = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/dashboard/stats/')
    stats.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch dashboard statistics'
    console.error('Error fetching dashboard stats:', err)
  } finally {
    loading.value = false
  }
}

const refreshDashboard = async () => {
  await Promise.all([
    fetchDashboardStats(),
    productStore.fetchProducts(),
    purchaseStore.fetchPurchases(),
    saleStore.fetchSales(),
    stockStore.fetchStocks(),
    supplierStore.fetchSuppliers(),
    customerStore.fetchCustomers(),
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
</style>
