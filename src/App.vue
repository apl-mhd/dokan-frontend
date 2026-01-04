<script setup>
import { ref } from "vue"
const sidebarOpen = ref(true)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div class="d-flex">

    <!-- Sidebar -->
    <aside
      class="sidebar bg-dark text-white"
      :class="sidebarOpen ? 'sidebar-open' : 'sidebar-closed'"
    >
      <div class="sidebar-header d-flex justify-content-between align-items-center p-3">
        <h3 class="mb-0" v-show="sidebarOpen">Dokan</h3>
        <button 
          class="btn btn-link text-white p-0 toggle-btn" 
          @click="toggleSidebar"
          title="Toggle Sidebar"
        >
          <i class="bi" :class="sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'"></i>
        </button>
      </div>

      <ul class="nav flex-column gap-2 px-3 pb-3">

        <li class="nav-item">
          <router-link
            to="/"
            class="nav-link"
            :class="{ active: $route.path === '/' }"
            :title="sidebarOpen ? '' : 'Dashboard'"
          >
            <i class="bi bi-speedometer2"></i>
            <span v-show="sidebarOpen" class="ms-2">Dashboard</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/purchase"
            class="nav-link"
            :class="{ active: $route.path === '/purchase' }"
            :title="sidebarOpen ? '' : 'Purchase'"
          >
            <i class="bi bi-bag-plus"></i>
            <span v-show="sidebarOpen" class="ms-2">Purchase</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/sale"
            class="nav-link"
            :class="{ active: $route.path === '/sale' }"
            :title="sidebarOpen ? '' : 'Sale'"
          >
            <i class="bi bi-cash-coin"></i>
            <span v-show="sidebarOpen" class="ms-2">Sale</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/product"
            class="nav-link"
            :class="{ active: $route.path === '/product' }"
            :title="sidebarOpen ? '' : 'Product'"
          >
            <i class="bi bi-box-seam"></i>
            <span v-show="sidebarOpen" class="ms-2">Product</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/stock"
            class="nav-link"
            :class="{ active: $route.path === '/stock' }"
            :title="sidebarOpen ? '' : 'Stock'"
          >
            <i class="bi bi-boxes"></i>
            <span v-show="sidebarOpen" class="ms-2">Stock</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/supplier"
            class="nav-link"
            :class="{ active: $route.path === '/supplier' }"
            :title="sidebarOpen ? '' : 'Supplier'"
          >
            <i class="bi bi-people"></i>
            <span v-show="sidebarOpen" class="ms-2">Supplier</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/customer"
            class="nav-link"
            :class="{ active: $route.path === '/customer' }"
            :title="sidebarOpen ? '' : 'Customer'"
          >
            <i class="bi bi-person-circle"></i>
            <span v-show="sidebarOpen" class="ms-2">Customer</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/warehouse"
            class="nav-link"
            :class="{ active: $route.path === '/warehouse' }"
            :title="sidebarOpen ? '' : 'Warehouse'"
          >
            <i class="bi bi-building"></i>
            <span v-show="sidebarOpen" class="ms-2">Warehouse</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/payment"
            class="nav-link"
            :class="{ active: $route.path === '/payment' }"
            :title="sidebarOpen ? '' : 'Payment'"
          >
            <i class="bi bi-credit-card"></i>
            <span v-show="sidebarOpen" class="ms-2">Payment</span>
          </router-link>
        </li>

      </ul>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-grow-1">

      <!-- Top Navbar -->
      <nav class="navbar navbar-light bg-light shadow-sm px-3 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <!-- Mobile Toggle Button -->
          <button 
            class="btn btn-outline-secondary d-lg-none me-3" 
            @click="toggleSidebar"
          >
            <i class="bi bi-list"></i>
          </button>
          <span class="navbar-brand mb-0 h4">Welcome, User</span>
        </div>
        
        <!-- Right side (can add user menu, notifications, etc.) -->
        <div>
          <!-- Add user profile, logout, etc. here -->
        </div>
      </nav>

      <!-- Page Content -->
      <div class="container-fluid py-4" style="min-height: calc(100vh - 56px);">
        <router-view />
      </div>

    </main>

  </div>
</template>

<style>
/* Sidebar styles */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  min-height: 100vh;
  transition: width 0.3s ease;
  z-index: 100;
  overflow-x: hidden;
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

/* Mobile responsive */
@media (max-width: 991.98px) {
  .sidebar-closed {
    width: 0;
    overflow: hidden;
  }
  
  .sidebar-closed + main {
    margin-left: 0;
  }
  
  /* Overlay for mobile when sidebar is open */
  .sidebar-open::after {
    content: '';
    position: fixed;
    top: 0;
    left: 240px;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }
}

/* Smooth transitions */
* {
  transition-property: margin, width;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}
</style>
