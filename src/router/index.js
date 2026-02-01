import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

import LoginPage from '../views/LoginPage.vue'
import DashboardPage from '../views/DashboardPage.vue'
import PurchasePage from '../views/PurchasePage.vue'
import PurchaseReturnPage from '../views/PurchaseReturnPage.vue'
import SalePage from '../views/SalePage.vue'
import SalesManagementPage from '../views/SalesManagementPage.vue'
import SaleReturnPage from '../views/SaleReturnPage.vue'
import PaymentPage from '../views/PaymentPage.vue'
import RefundPage from '../views/RefundPage.vue'
import ProductPage from '../views/ProductPage.vue'
import ProductManagementPage from '../views/ProductManagementPage.vue'
import CategoryPage from '../views/CategoryPage.vue'
import UnitPage from '../views/UnitPage.vue'
import StockPage from '../views/StockPage.vue'
import SupplierPage from '../views/SupplierPage.vue'
import CustomerPage from '../views/CustomerPage.vue'
import WarehousePage from '../views/WarehousePage.vue'
import LedgerPage from '../views/LedgerPage.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/purchase',
    name: 'Purchase',
    component: PurchasePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/purchase-returns',
    name: 'PurchaseReturns',
    component: PurchaseReturnPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/sale',
    name: 'Sale',
    component: SalePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/sale-returns',
    name: 'SaleReturns',
    component: SaleReturnPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/product',
    name: 'Product',
    component: ProductPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'ProductManagement',
    component: ProductManagementPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: CategoryPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/units',
    name: 'Units',
    component: UnitPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/stock',
    name: 'Stock',
    component: StockPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/supplier',
    name: 'Supplier',
    component: SupplierPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/customer',
    name: 'Customer',
    component: CustomerPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/warehouse',
    name: 'Warehouse',
    component: WarehousePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/payment',
    name: 'Payment',
    component: PaymentPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/refund',
    name: 'Refund',
    component: RefundPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/ledger',
    name: 'Ledger',
    component: LedgerPage,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login if not authenticated
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } 
  // Check if route is for guests only (like login page)
  else if (to.meta.requiresGuest && isAuthenticated) {
    // Redirect to dashboard if already logged in
    next({ name: 'Dashboard' })
  } 
  // Allow navigation
  else {
    next()
  }
})

export default router
