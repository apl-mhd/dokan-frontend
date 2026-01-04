import { createRouter, createWebHistory } from 'vue-router'

import DashboardPage from '../views/DashboardPage.vue'
import PurchasePage from '../views/PurchasePage.vue'
import SalePage from '../views/SalePage.vue'
import PaymentPage from '../views/PaymentPage.vue'
import ProductPage from '../views/ProductPage.vue'
import StockPage from '../views/StockPage.vue'
import SupplierPage from '../views/SupplierPage.vue'
import CustomerPage from '../views/CustomerPage.vue'
import WarehousePage from '../views/WarehousePage.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardPage,
  },
  {
    path: '/purchase',
    name: 'Purchase',
    component: PurchasePage,
  },
  {
    path: '/sale',
    name: 'Sale',
    component: SalePage,
  },
  {
    path: '/product',
    name: 'Product',
    component: ProductPage,
  },
  {
    path: '/stock',
    name: 'Stock',
    component: StockPage,
  },
  {
    path: '/supplier',
    name: 'Supplier',
    component: SupplierPage,
  },
  {
    path: '/customer',
    name: 'Customer',
    component: CustomerPage,
  },
  {
    path: '/warehouse',
    name: 'Warehouse',
    component: WarehousePage,
  },
  {
    path: '/payment',
    name: 'Payment',
    component: PaymentPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
