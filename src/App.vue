<script setup>
import { ref } from "vue"
const sidebarOpen = ref(true)
</script>

<template>
  <div class="d-flex">

    <!-- Sidebar -->
    <aside
      class="sidebar bg-dark text-white p-4"
      :class="sidebarOpen ? 'sidebar-open' : 'sidebar-closed'"
    >
      <h3 class="mb-4">Dokan</h3>

      <ul class="nav flex-column gap-2">

        <li class="nav-item">
          <router-link
            to="/"
            class="nav-link"
            :class="{ active: $route.path === '/' }"
          >
            <i class="bi bi-speedometer2 me-2"></i> Dashboard
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/purchase"
            class="nav-link"
            :class="{ active: $route.path === '/purchase' }"
          >
            <i class="bi bi-bag-plus me-2"></i> Purchase
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/sale"
            class="nav-link"
            :class="{ active: $route.path === '/sale' }"
          >
            <i class="bi bi-cash-coin me-2"></i> Sale
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/product"
            class="nav-link"
            :class="{ active: $route.path === '/product' }"
          >
            <i class="bi bi-box-seam me-2"></i> Product
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/stock"
            class="nav-link"
            :class="{ active: $route.path === '/stock' }"
          >
            <i class="bi bi-boxes me-2"></i> Stock
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/supplier"
            class="nav-link"
            :class="{ active: $route.path === '/supplier' }"
          >
            <i class="bi bi-people me-2"></i> Supplier
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/customer"
            class="nav-link"
            :class="{ active: $route.path === '/customer' }"
          >
            <i class="bi bi-person-circle me-2"></i> Customer
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/warehouse"
            class="nav-link"
            :class="{ active: $route.path === '/warehouse' }"
          >
            <i class="bi bi-building me-2"></i> Warehouse
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/payment"
            class="nav-link"
            :class="{ active: $route.path === '/payment' }"
          >
            <i class="bi bi-credit-card me-2"></i> Payment
          </router-link>
        </li>

      </ul>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-grow-1">

      <!-- Top Navbar -->
      <nav class="navbar navbar-light bg-light shadow-sm px-3 d-flex align-items-center">
        
        <!-- Sidebar Toggle -->
        <button class="btn btn-outline-secondary d-lg-none" @click="sidebarOpen = !sidebarOpen">
          <i class="bi bi-list"></i>
        </button>

        <span class="navbar-brand mb-0 h4 ms-3">Welcome, User</span>
      </nav>

      <!-- Page Content -->
      <div class="container-fluid py-4" style="min-height: calc(100vh - 56px);">
        <router-view />
      </div>

    </main>

  </div>
</template>

<style>
/* Sidebar full width */
.sidebar-open {
  width: 240px;
  position: fixed;
  left: 0;
  top: 0;
  min-height: 100vh;
  transition: 0.3s ease;
  z-index: 100;
}

/* Collapsed sidebar (mobile) */
.sidebar-closed {
  width: 0;
  overflow: hidden;
  position: fixed;
  left: 0;
  top: 0;
  min-height: 100vh;
  transition: 0.3s ease;
  z-index: 100;
}

/* Main content shifts right when sidebar open */
.sidebar-open + main {
  margin-left: 240px;
  transition: 0.3s ease;
}

/* Main content full width when collapsed */
.sidebar-closed + main {
  margin-left: 0;
  transition: 0.3s ease;
}

/* Active menu item */
.nav-link {
  color: #ddd;
}
.nav-link.active {
  background-color: #495057;
  border-radius: 4px;
  color: #fff !important;
}
</style>
