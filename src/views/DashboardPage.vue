<template>
  <div class="container-fluid">
    <div class="row mb-4">
      <div class="col">
        <h2 class="mb-3">
          <i class="bi bi-speedometer2 me-2"></i>Dashboard
        </h2>
        <p class="text-muted">Welcome to your inventory management system</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card text-white bg-primary shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2">Total Products</h6>
                <h2 class="card-title mb-0">{{ productStore.products.length }}</h2>
              </div>
              <div class="fs-1">
                <i class="bi bi-box-seam"></i>
              </div>
            </div>
          </div>
          <div class="card-footer bg-primary bg-opacity-75">
            <router-link to="/product" class="text-white text-decoration-none small">
              View Details <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card text-white bg-success shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2">Total Purchases</h6>
                <h2 class="card-title mb-0">{{ purchaseStore.purchases.length }}</h2>
              </div>
              <div class="fs-1">
                <i class="bi bi-bag-plus"></i>
              </div>
            </div>
          </div>
          <div class="card-footer bg-success bg-opacity-75">
            <router-link to="/purchase" class="text-white text-decoration-none small">
              View Details <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card text-white bg-info shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2">Total Sales</h6>
                <h2 class="card-title mb-0">{{ saleStore.sales.length }}</h2>
              </div>
              <div class="fs-1">
                <i class="bi bi-cash-coin"></i>
              </div>
            </div>
          </div>
          <div class="card-footer bg-info bg-opacity-75">
            <router-link to="/sale" class="text-white text-decoration-none small">
              View Details <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card text-white bg-warning shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2">Stock Items</h6>
                <h2 class="card-title mb-0">{{ stockStore.stocks.length }}</h2>
              </div>
              <div class="fs-1">
                <i class="bi bi-boxes"></i>
              </div>
            </div>
          </div>
          <div class="card-footer bg-warning bg-opacity-75">
            <router-link to="/stock" class="text-white text-decoration-none small">
              View Details <i class="bi bi-arrow-right"></i>
            </router-link>
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

    <!-- Recent Activities -->
    <div class="row">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-header bg-light">
            <h5 class="mb-0">
              <i class="bi bi-clock-history me-2"></i>Recent Purchases
            </h5>
          </div>
          <div class="card-body">
            <div v-if="recentPurchases.length === 0" class="text-center text-muted py-3">
              No recent purchases
            </div>
            <ul v-else class="list-group list-group-flush">
              <li v-for="purchase in recentPurchases" :key="purchase.id" class="list-group-item">
                <div class="d-flex justify-content-between">
                  <div>
                    <strong>{{ purchase.invoice_number || `#${purchase.id}` }}</strong>
                    <br>
                    <small class="text-muted">{{ purchase.supplier_name }}</small>
                  </div>
                  <div class="text-end">
                    <strong>৳{{ purchase.grand_total }}</strong>
                    <br>
                    <span class="badge" :class="getStatusClass(purchase.status)">
                      {{ purchase.status }}
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-header bg-light">
            <h5 class="mb-0">
              <i class="bi bi-clock-history me-2"></i>Recent Sales
            </h5>
          </div>
          <div class="card-body">
            <div v-if="recentSales.length === 0" class="text-center text-muted py-3">
              No recent sales
            </div>
            <ul v-else class="list-group list-group-flush">
              <li v-for="sale in recentSales" :key="sale.id" class="list-group-item">
                <div class="d-flex justify-content-between">
                  <div>
                    <strong>{{ sale.invoice_number || `#${sale.id}` }}</strong>
                    <br>
                    <small class="text-muted">{{ sale.customer_name }}</small>
                  </div>
                  <div class="text-end">
                    <strong>৳{{ sale.grand_total }}</strong>
                    <br>
                    <span class="badge" :class="getStatusClass(sale.status)">
                      {{ sale.status }}
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useProductStore } from '../stores/product.store'
import { usePurchaseStore } from '../stores/purchase.store'
import { useSaleStore } from '../stores/sale.store'
import { useStockStore } from '../stores/stock.store'
import { useSupplierStore } from '../stores/supplier.store'
import { useCustomerStore } from '../stores/customer.store'
import { useWarehouseStore } from '../stores/warehouse.store'

const productStore = useProductStore()
const purchaseStore = usePurchaseStore()
const saleStore = useSaleStore()
const stockStore = useStockStore()
const supplierStore = useSupplierStore()
const customerStore = useCustomerStore()
const warehouseStore = useWarehouseStore()

onMounted(() => {
  productStore.fetchProducts()
  purchaseStore.fetchPurchases()
  saleStore.fetchSales()
  stockStore.fetchStocks()
  supplierStore.fetchSuppliers()
  customerStore.fetchCustomers()
  warehouseStore.fetchWarehouses()
})

const recentPurchases = computed(() => {
  return purchaseStore.purchases.slice(0, 5)
})

const recentSales = computed(() => {
  return saleStore.sales.slice(0, 5)
})

const getStatusClass = (status) => {
  const statusClasses = {
    pending: 'bg-warning',
    completed: 'bg-success',
    delivered: 'bg-success',
    cancelled: 'bg-danger'
  }
  return statusClasses[status] || 'bg-secondary'
}
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

.list-group-item {
  border-left: none;
  border-right: none;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
}
</style>
