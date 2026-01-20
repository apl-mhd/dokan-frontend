<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <PageHeader title="Sales Management" icon="bi-cart-check">
      <template #actions>
        <button
          v-if="activeTab === 'sales'"
          class="btn btn-primary"
          @click="handleCreateSale"
        >
          <i class="bi bi-plus-circle me-2"></i>New Sale
        </button>
        <button
          v-if="activeTab === 'returns'"
          class="btn btn-primary"
          @click="handleCreateReturn"
        >
          <i class="bi bi-plus-circle me-2"></i>New Return
        </button>
      </template>
    </PageHeader>

    <!-- Navigation Tabs -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'sales' }"
          href="#"
          @click.prevent="activeTab = 'sales'"
        >
          <i class="bi bi-cart-check me-2"></i>
          Sales
          <span v-if="salesCount > 0" class="badge bg-primary ms-2">{{ salesCount }}</span>
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'returns' }"
          href="#"
          @click.prevent="activeTab = 'returns'"
        >
          <i class="bi bi-arrow-return-left me-2"></i>
          Sale Returns
          <span v-if="returnsCount > 0" class="badge bg-warning text-dark ms-2">{{ returnsCount }}</span>
        </a>
      </li>
    </ul>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Sales Tab -->
      <div v-show="activeTab === 'sales'" class="tab-pane fade show active">
        <SalePage ref="salePageRef" />
      </div>

      <!-- Returns Tab -->
      <div v-show="activeTab === 'returns'" class="tab-pane fade show active">
        <SaleReturnPage ref="returnPageRef" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSaleStore } from '../stores/sale.store'
import { useSaleReturnStore } from '../stores/saleReturn.store'
import PageHeader from '../components/common/PageHeader.vue'
import SalePage from './SalePage.vue'
import SaleReturnPage from './SaleReturnPage.vue'

// Composables
const route = useRoute()
const router = useRouter()
const saleStore = useSaleStore()
const saleReturnStore = useSaleReturnStore()

// State
const activeTab = ref('sales')
const salePageRef = ref(null)
const returnPageRef = ref(null)

// Computed
const salesCount = computed(() => saleStore.pagination.totalItems || 0)
const returnsCount = computed(() => saleReturnStore.pagination.totalItems || 0)

// Methods
const handleCreateSale = () => {
  // Trigger create action in SalePage if it exposes this method
  // Otherwise, you can emit an event or call the store directly
  if (salePageRef.value?.handleCreate) {
    salePageRef.value.handleCreate()
  }
}

const handleCreateReturn = () => {
  // Trigger create action in SaleReturnPage
  if (returnPageRef.value) {
    returnPageRef.value.showCreateModal = true
  }
}

// Watch route query params to set active tab
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab === 'returns') {
      activeTab.value = 'returns'
    } else {
      activeTab.value = 'sales'
    }
  },
  { immediate: true }
)

// Update URL when tab changes
watch(activeTab, (newTab) => {
  router.push({ query: { tab: newTab } })
})

// Lifecycle
onMounted(() => {
  // Set initial tab from query params
  if (route.query.tab === 'returns') {
    activeTab.value = 'returns'
  }
})
</script>

<style scoped>
.nav-tabs {
  border-bottom: 2px solid #dee2e6;
}

.nav-tabs .nav-link {
  border: none;
  color: #6c757d;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
}

.nav-tabs .nav-link:hover {
  color: #0d6efd;
  border-bottom: 2px solid #0d6efd;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  border-bottom: 2px solid #0d6efd;
  background-color: transparent;
}

.tab-content {
  padding-top: 1rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>
