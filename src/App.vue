<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from './stores/authStore'

const sidebarOpen = ref(true)
const productsMenuOpen = ref(false)
const purchaseMenuOpen = ref(false)
const saleMenuOpen = ref(false)
const contactsMenuOpen = ref(false)
const paymentMenuOpen = ref(false)
const isMobile = ref(false)
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Check if mobile on mount and resize
const checkMobile = () => {
  isMobile.value = window.innerWidth < 992
  if (isMobile.value) {
    sidebarOpen.value = false
  } else {
    sidebarOpen.value = true
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const toggleProductsMenu = () => {
  productsMenuOpen.value = !productsMenuOpen.value
}

const togglePurchaseMenu = () => {
  purchaseMenuOpen.value = !purchaseMenuOpen.value
}

const toggleSaleMenu = () => {
  saleMenuOpen.value = !saleMenuOpen.value
}

const toggleContactsMenu = () => {
  contactsMenuOpen.value = !contactsMenuOpen.value
}

const togglePaymentMenu = () => {
  paymentMenuOpen.value = !paymentMenuOpen.value
}

// Check if current route is in purchase section
const isPurchaseSection = computed(() => {
  return ['/purchase', '/purchase-returns'].includes(route.path)
})

// Check if current route is in sale section
const isSaleSection = computed(() => {
  return ['/sale', '/sale-returns'].includes(route.path)
})

// Check if current route is in products section
const isProductsSection = computed(() => {
  return ['/products', '/categories', '/units', '/product'].includes(route.path)
})

// Check if current route is in contacts section
const isContactsSection = computed(() => {
  return ['/supplier', '/customer'].includes(route.path)
})

// Check if current route is in payment section
const isPaymentSection = computed(() => {
  return ['/payment', '/refund'].includes(route.path)
})

// Check if current route is login page (no layout needed)
const isLoginPage = computed(() => {
  return route.path === '/login'
})

// Auto-expand menus and collapse sidebar when navigating
watch(() => route.path, (newPath) => {
  // Auto-collapse all parent menus first
  purchaseMenuOpen.value = false
  saleMenuOpen.value = false
  productsMenuOpen.value = false
  contactsMenuOpen.value = false
  paymentMenuOpen.value = false

  // Auto-expand parent menus based on route
  if (['/purchase', '/purchase-returns'].includes(newPath)) {
    purchaseMenuOpen.value = true
  } else if (['/sale', '/sale-returns'].includes(newPath)) {
    saleMenuOpen.value = true
  } else if (['/products', '/categories', '/units', '/product'].includes(newPath)) {
    productsMenuOpen.value = true
  } else if (['/supplier', '/customer'].includes(newPath)) {
    contactsMenuOpen.value = true
  } else if (['/payment', '/refund'].includes(newPath)) {
    paymentMenuOpen.value = true
  }

  // Auto-collapse sidebar on any route change (especially on mobile)
  // Skip if it's the login page
  if (newPath !== '/login') {
    if (isMobile.value) {
      // On mobile, close sidebar after navigation
      setTimeout(() => {
        sidebarOpen.value = false
      }, 300)
    }
  }
})

const handleLogout = () => {
  if (confirm('Are you sure you want to logout?')) {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<template>
  <!-- Login page - No layout -->
  <div v-if="isLoginPage">
    <router-view />
  </div>

  <!-- Main app - With sidebar and navbar -->
  <div v-else class="d-flex">

    <!-- Sidebar -->
    <aside class="sidebar bg-dark text-white" :class="sidebarOpen ? 'sidebar-open' : 'sidebar-closed'">
      <div class="sidebar-header d-flex justify-content-between align-items-center p-3">
        <h3 class="mb-0" v-show="sidebarOpen">Dokan</h3>
        <button class="btn btn-link text-white p-0 toggle-btn" @click="toggleSidebar" title="Toggle Sidebar">
          <i class="bi" :class="sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'"></i>
        </button>
      </div>

      <div class="sidebar-nav-wrapper">
      <ul class="nav flex-column gap-2 px-3 pb-3">

        <li class="nav-item">
          <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }" :title="sidebarOpen ? '' : 'Dashboard'">
            <i class="bi bi-speedometer2"></i>
            <span v-show="sidebarOpen" class="ms-2">Dashboard</span>
          </router-link>
        </li>

        <!-- Contacts Parent Menu -->
        <li class="nav-item">
          <div class="nav-link parent-menu" :class="{ 'active': isContactsSection }" @click="toggleContactsMenu" :title="sidebarOpen ? '' : 'Contacts'">
            <i class="bi bi-person-lines-fill"></i>
            <span v-show="sidebarOpen" class="ms-2 flex-grow-1">Contacts</span>
            <i v-show="sidebarOpen" class="bi chevron-icon ms-auto" :class="contactsMenuOpen ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
          </div>

          <!-- Contacts Submenu -->
          <div class="submenu-collapse" :class="{ 'show': contactsMenuOpen && sidebarOpen }">
            <ul class="nav flex-column submenu">
              <li class="nav-item">
                <router-link to="/supplier" class="nav-link submenu-link" :class="{ 'active': $route.path === '/supplier' }">
                  <i class="bi bi-people"></i>
                  <span class="ms-2">Suppliers</span>
                </router-link>
              </li>

              <li class="nav-item">
                <router-link to="/customer" class="nav-link submenu-link" :class="{ 'active': $route.path === '/customer' }">
                  <i class="bi bi-person-circle"></i>
                  <span class="ms-2">Customers</span>
                </router-link>
              </li>
            </ul>
          </div>
        </li>

        <!-- Purchase Parent Menu -->
        <li class="nav-item">
          <div class="nav-link parent-menu" :class="{ 'active': isPurchaseSection }" @click="togglePurchaseMenu" :title="sidebarOpen ? '' : 'Purchase'">
            <i class="bi bi-bag-plus"></i>
            <span v-show="sidebarOpen" class="ms-2 flex-grow-1">Purchase</span>
            <i v-show="sidebarOpen" class="bi chevron-icon ms-auto" :class="purchaseMenuOpen ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
          </div>

          <!-- Purchase Submenu -->
          <div class="submenu-collapse" :class="{ 'show': purchaseMenuOpen && sidebarOpen }">
            <ul class="nav flex-column submenu">
              <li class="nav-item">
                <router-link to="/purchase" class="nav-link submenu-link" :class="{ 'active': $route.path === '/purchase' }">
                  <i class="bi bi-bag-plus"></i>
                  <span class="ms-2">Purchases</span>
                </router-link>
              </li>

              <li class="nav-item">
                <router-link to="/purchase-returns" class="nav-link submenu-link" :class="{ 'active': $route.path === '/purchase-returns' }">
                  <i class="bi bi-arrow-return-left"></i>
                  <span class="ms-2">Purchase Returns</span>
                </router-link>
              </li>
            </ul>
          </div>
        </li>

        <!-- Sale Parent Menu -->
        <li class="nav-item">
          <div class="nav-link parent-menu" :class="{ 'active': isSaleSection }" @click="toggleSaleMenu" :title="sidebarOpen ? '' : 'Sale'">
            <i class="bi bi-cash-coin"></i>
            <span v-show="sidebarOpen" class="ms-2 flex-grow-1">Sale</span>
            <i v-show="sidebarOpen" class="bi chevron-icon ms-auto" :class="saleMenuOpen ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
          </div>

          <!-- Sale Submenu -->
          <div class="submenu-collapse" :class="{ 'show': saleMenuOpen && sidebarOpen }">
            <ul class="nav flex-column submenu">
              <li class="nav-item">
                <router-link to="/sale" class="nav-link submenu-link" :class="{ 'active': $route.path === '/sale' }">
                  <i class="bi bi-cash-coin"></i>
                  <span class="ms-2">Sales</span>
                </router-link>
              </li>

              <li class="nav-item">
                <router-link to="/sale-returns" class="nav-link submenu-link" :class="{ 'active': $route.path === '/sale-returns' }">
                  <i class="bi bi-arrow-return-left"></i>
                  <span class="ms-2">Sale Returns</span>
                </router-link>
              </li>
            </ul>
          </div>
        </li>

        <li class="nav-item">
          <router-link to="/ledger" class="nav-link" :class="{ active: $route.path === '/ledger' }" :title="sidebarOpen ? '' : 'Ledger'">
            <i class="bi bi-journal-text"></i>
            <span v-show="sidebarOpen" class="ms-2">Ledger</span>
          </router-link>
        </li>

        <!-- Payment Parent Menu -->
        <li class="nav-item">
          <div class="nav-link parent-menu" :class="{ 'active': isPaymentSection }" @click="togglePaymentMenu" :title="sidebarOpen ? '' : 'Payment'">
            <i class="bi bi-credit-card"></i>
            <span v-show="sidebarOpen" class="ms-2 flex-grow-1">Payment</span>
            <i v-show="sidebarOpen" class="bi chevron-icon ms-auto" :class="paymentMenuOpen ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
          </div>

          <!-- Payment Submenu -->
          <div class="submenu-collapse" :class="{ 'show': paymentMenuOpen && sidebarOpen }">
            <ul class="nav flex-column submenu">
              <li class="nav-item">
                <router-link to="/payment" class="nav-link submenu-link" :class="{ 'active': $route.path === '/payment' }">
                  <i class="bi bi-cash-stack"></i>
                  <span class="ms-2">Payments</span>
                </router-link>
              </li>

              <li class="nav-item">
                <router-link to="/refund" class="nav-link submenu-link" :class="{ 'active': $route.path === '/refund' }">
                  <i class="bi bi-arrow-repeat"></i>
                  <span class="ms-2">Refunds</span>
                </router-link>
              </li>
            </ul>
          </div>
        </li>

        <li class="nav-item">
          <router-link to="/stock" class="nav-link" :class="{ active: $route.path === '/stock' }" :title="sidebarOpen ? '' : 'Stock'">
            <i class="bi bi-boxes"></i>
            <span v-show="sidebarOpen" class="ms-2">Stock</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link to="/expense" class="nav-link" :class="{ active: $route.path === '/expense' }" :title="sidebarOpen ? '' : 'Expense'">
            <i class="bi bi-wallet2"></i>
            <span v-show="sidebarOpen" class="ms-2">Expense</span>
          </router-link>
        </li>

        <!-- Products Parent Menu -->
        <li class="nav-item">
          <div class="nav-link parent-menu" :class="{ 'active': isProductsSection }" @click="toggleProductsMenu" :title="sidebarOpen ? '' : 'Products'">
            <i class="bi bi-box-seam"></i>
            <span v-show="sidebarOpen" class="ms-2 flex-grow-1">Products</span>
            <i v-show="sidebarOpen" class="bi chevron-icon ms-auto" :class="productsMenuOpen ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
          </div>

          <!-- Products Submenu -->
          <div class="submenu-collapse" :class="{ 'show': productsMenuOpen && sidebarOpen }">
            <ul class="nav flex-column submenu">
              <li class="nav-item">
                <router-link to="/products" class="nav-link submenu-link" :class="{ 'active': $route.path === '/products' }">
                  <i class="bi bi-box2"></i>
                  <span class="ms-2">All Products</span>
                </router-link>
              </li>

              <li class="nav-item">
                <router-link to="/categories" class="nav-link submenu-link" :class="{ 'active': $route.path === '/categories' }">
                  <i class="bi bi-tags"></i>
                  <span class="ms-2">Categories</span>
                </router-link>
              </li>

              <li class="nav-item">
                <router-link to="/units" class="nav-link submenu-link" :class="{ 'active': $route.path === '/units' }">
                  <i class="bi bi-rulers"></i>
                  <span class="ms-2">Units & Measures</span>
                </router-link>
              </li>
            </ul>
          </div>
        </li>

        <li class="nav-item">
          <router-link to="/warehouse" class="nav-link" :class="{ active: $route.path === '/warehouse' }" :title="sidebarOpen ? '' : 'Warehouse'">
            <i class="bi bi-building"></i>
            <span v-show="sidebarOpen" class="ms-2">Warehouse</span>
          </router-link>
        </li>

      </ul>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-grow-1">

      <!-- Top Navbar -->
      <nav class="navbar navbar-light bg-light shadow-sm px-3 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <!-- Mobile Toggle Button -->
          <button class="btn btn-outline-secondary d-lg-none me-3" @click="toggleSidebar">
            <i class="bi bi-list"></i>
          </button>
          <span class="navbar-brand mb-0 h4">Welcome, User</span>
        </div>

        <!-- Right side - User menu and logout -->
        <div class="d-flex align-items-center gap-2">
          <span class="text-muted small">{{ authStore.user?.username || 'User' }}</span>
          <button class="btn btn-outline-danger btn-sm" @click="handleLogout" title="Logout">
            <i class="bi bi-box-arrow-right"></i>
            <span class="ms-1 d-none d-md-inline">Logout</span>
          </button>
        </div>
      </nav>

      <!-- Page Content -->
      <div class="container-fluid py-4" style="min-height: calc(100vh - 56px);">
        <router-view />
      </div>

    </main>

    <!-- Mobile Overlay -->
    <div v-if="sidebarOpen && isMobile" class="sidebar-overlay" @click="toggleSidebar"></div>

  </div>
</template>

<style>
/* Sidebar styles */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 100;
  overflow: hidden;
}

.sidebar-nav-wrapper {
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

/* WebKit (Chrome, Safari, Edge) - beautified scrollbar */
.sidebar-nav-wrapper::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 3px;
}

.sidebar-nav-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

.sidebar-nav-wrapper::-webkit-scrollbar-thumb:active {
  background: rgba(255, 255, 255, 0.5);
}

/* Sidebar open state */
.sidebar-open {
  width: 240px;
}

/* Sidebar closed state */
.sidebar-closed {
  width: 60px;
}

/* Sidebar header */
.sidebar-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 60px;
}

/* Toggle button */
.toggle-btn {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
  text-decoration: none !important;
}

.toggle-btn:hover {
  transform: scale(1.1);
}

/* Main content adjustment */
.sidebar-open + main {
  margin-left: 240px;
  transition: margin-left 0.3s ease;
}

.sidebar-closed + main {
  margin-left: 60px;
  transition: margin-left 0.3s ease;
}

/* Navigation links */
.nav-link {
  color: #ddd;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  white-space: nowrap;
  text-decoration: none;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-link.active {
  background-color: #495057;
  color: #fff !important;
}

.nav-link i {
  font-size: 1.1rem;
  min-width: 20px;
}

/* Parent menu item */
.parent-menu {
  cursor: pointer;
  user-select: none;
}

.parent-menu:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.parent-menu.active {
  background-color: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.chevron-icon {
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}

/* Submenu collapse */
.submenu-collapse {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.submenu-collapse.show {
  max-height: 300px;
}

/* Submenu styles */
.submenu {
  padding-left: 0;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.submenu .nav-item {
  padding-left: 1rem;
}

.submenu-link {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-left: 2px solid transparent;
}

.submenu-link:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-left-color: rgba(255, 255, 255, 0.3);
}

.submenu-link.active {
  background-color: rgba(255, 255, 255, 0.12);
  border-left-color: #fff;
  color: #fff !important;
}

.submenu-link i {
  font-size: 0.95rem;
}

/* Mobile overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Mobile responsive */
@media (max-width: 991.98px) {
  .sidebar {
    z-index: 1000;
  }

  .sidebar-closed {
    width: 0;
    overflow: hidden;
  }

  .sidebar-closed + main {
    margin-left: 0;
  }

  .sidebar-open {
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
  }
}

/* Collapsed sidebar - hide submenus */
.sidebar-closed .submenu-collapse {
  display: none;
}

.sidebar-closed .parent-menu .chevron-icon {
  display: none;
}

/* Smooth transitions */
* {
  transition-property: margin, width;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}
</style>
