import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";

// Lazy-load route components for faster initial load & reload
// Only the current route's component + its stores are loaded on demand
const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginPage.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/RegistrationPage.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/",
    name: "Dashboard",
    component: () => import("../views/DashboardPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/purchase",
    name: "Purchase",
    component: () => import("../views/PurchasePage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/purchase-returns",
    name: "PurchaseReturns",
    component: () => import("../views/PurchaseReturnPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sale",
    name: "Sale",
    component: () => import("../views/SalePage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sale-returns",
    name: "SaleReturns",
    component: () => import("../views/SaleReturnPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/product",
    name: "Product",
    component: () => import("../views/ProductPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/products",
    name: "ProductManagement",
    component: () => import("../views/ProductManagementPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/categories",
    name: "Categories",
    component: () => import("../views/CategoryPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/units",
    name: "Units",
    component: () => import("../views/UnitPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/stock",
    name: "Stock",
    component: () => import("../views/StockPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/supplier",
    name: "Supplier",
    component: () => import("../views/SupplierPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/customer",
    name: "Customer",
    component: () => import("../views/CustomerPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/warehouse",
    name: "Warehouse",
    component: () => import("../views/WarehousePage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/payment",
    name: "Payment",
    component: () => import("../views/PaymentPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/refund",
    name: "Refund",
    component: () => import("../views/RefundPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/ledger",
    name: "Ledger",
    component: () => import("../views/LedgerPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/expense",
    name: "Expense",
    component: () => import("../views/ExpensePage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("../views/SettingsPage.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login if not authenticated
    next({ name: "Login", query: { redirect: to.fullPath } });
  }
  // Check if route is for guests only (like login page)
  else if (to.meta.requiresGuest && isAuthenticated) {
    // Redirect to dashboard if already logged in
    next({ name: "Dashboard" });
  }
  // Allow navigation
  else {
    next();
  }
});

export default router;
