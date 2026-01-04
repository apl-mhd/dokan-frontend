<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <PageHeader title="Sale Management" icon="bi-cash-coin">
      <template #actions>
        <button class="btn btn-primary" @click="handleCreate">
          <i class="bi bi-plus-circle me-2"></i>New Sale
        </button>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <LoadingSpinner v-if="saleStore.loading" />

    <!-- Error State -->
    <ErrorAlert :error="saleStore.error" title="Error" dismissible @dismiss="saleStore.error = null" />

    <!-- Data Table -->
    <DataTable
      v-if="!saleStore.loading"
      :columns="columns"
      :items="saleStore.sales || []"
      :pagination="paginationData"
      empty-message="No sales found. Click 'New Sale' to create one."
      @page-change="handlePageChange"
    >
      <template #body="{ items }">
        <tr v-for="sale in items" :key="sale.id">
          <td><strong>{{ sale.invoice_number || sale.id }}</strong></td>
          <td>{{ sale.customer_name || `Customer ${sale.customer}` }}</td>
          <td>{{ sale.warehouse_name || `Warehouse ${sale.warehouse}` }}</td>
          <td>{{ formatDate(sale.invoice_date) }}</td>
          <td>
            <span class="badge" :class="getStatusClass(sale.status, { delivered: 'bg-success' })">
              {{ sale.status }}
            </span>
          </td>
          <td><strong>{{ formatCurrency(sale.grand_total) }}</strong></td>
          <td>
            <button
              class="btn btn-sm btn-outline-info me-2"
              @click="handleView(sale)"
              title="View"
            >
              <i class="bi bi-eye"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-primary me-2"
              @click="handleEdit(sale)"
              title="Edit"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              @click="handleDelete(sale)"
              title="Delete"
            >
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <div class="modal fade" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Sale' : 'New Sale' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Sale Header -->
            <div class="row mb-4">
              <div class="col-md-3">
                <label class="form-label">Customer <span class="text-danger">*</span></label>
                <select v-model="formData.customer" class="form-select" required>
                  <option value="">Select Customer</option>
                  <option v-for="customer in customerStore.customers" :key="customer.id" :value="customer.id">
                    {{ customer.name }}
                  </option>
                </select>
              </div>

              <div class="col-md-3">
                <label class="form-label">Warehouse <span class="text-danger">*</span></label>
                <select v-model="formData.warehouse" class="form-select" required>
                  <option value="">Select Warehouse</option>
                  <option v-for="warehouse in warehouseStore.warehouses" :key="warehouse.id" :value="warehouse.id">
                    {{ warehouse.name }}
                  </option>
                </select>
              </div>

              <div class="col-md-3">
                <label class="form-label">Invoice Date</label>
                <input v-model="formData.invoice_date" type="date" class="form-control" />
              </div>

              <div class="col-md-3">
                <label class="form-label">Status</label>
                <select v-model="formData.status" class="form-select">
                  <option value="pending">Pending</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <!-- Invoice Items -->
            <InvoiceItemsTable
              ref="invoiceItemsRef"
              :items="formData.items"
              :products="productStore.products"
              :available-units="availableUnits"
              :show-base-unit-qty="false"
              :show-base-unit-note="false"
              add-item-title="Add Items"
              @add-item="addItem"
              @remove-item="removeItem"
              @product-change="loadProductUnits"
            />

            <!-- Notes -->
            <div class="mb-3">
              <label class="form-label">Notes</label>
              <textarea v-model="formData.notes" class="form-control" rows="2" placeholder="Optional notes..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="handleSave"
              :disabled="formData.items.length === 0"
            >
              <i class="bi bi-save me-2"></i>{{ isEditing ? 'Update' : 'Save' }} Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSaleStore } from '../stores/sale.store'
import { useCustomerStore } from '../stores/customer.store'
import { useWarehouseStore } from '../stores/warehouse.store'
import { useProductStore } from '../stores/product.store'
import { useModal } from '../composables/useModal'
import { useFormatter } from '../composables/useFormatter'
import { useConfirm } from '../composables/useConfirm'
import { usePagination } from '../composables/usePagination'

// Components
import PageHeader from '../components/common/PageHeader.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorAlert from '../components/common/ErrorAlert.vue'
import DataTable from '../components/common/DataTable.vue'
import InvoiceItemsTable from '../components/common/InvoiceItemsTable.vue'

// Stores
const saleStore = useSaleStore()
const customerStore = useCustomerStore()
const warehouseStore = useWarehouseStore()
const productStore = useProductStore()

// Composables
const { modalRef, show: showModal, hide: hideModal } = useModal()
const { formatDate, formatCurrency, getStatusClass } = useFormatter()
const { confirmDelete } = useConfirm()
const pagination = usePagination(10)

// State
const isEditing = ref(false)
const selectedSale = ref(null)
const availableUnits = ref([])
const invoiceItemsRef = ref(null)

const formData = ref({
  customer: '',
  warehouse: '',
  invoice_date: new Date().toISOString().split('T')[0],
  status: 'pending',
  notes: '',
  items: []
})

// Table columns definition
const columns = [
  { key: 'invoice_number', label: 'Invoice #', width: '120px' },
  { key: 'customer', label: 'Customer' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'invoice_date', label: 'Date', width: '120px' },
  { key: 'status', label: 'Status', width: '100px' },
  { key: 'grand_total', label: 'Grand Total', width: '120px' },
  { key: 'actions', label: 'Actions', width: '180px' }
]

// Computed pagination data for DataTable
const paginationData = computed(() => ({
  currentPage: pagination.currentPage.value,
  totalPages: pagination.totalPages.value,
  totalItems: pagination.totalItems.value,
  startIndex: pagination.startIndex.value,
  endIndex: pagination.endIndex.value,
  hasNextPage: pagination.hasNextPage.value,
  hasPrevPage: pagination.hasPrevPage.value
}))

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchSales(),
    customerStore.fetchCustomers(),
    warehouseStore.fetchWarehouses(),
    productStore.fetchProducts()
  ])
})

// Methods
const fetchSales = async () => {
  await saleStore.fetchSales(pagination.getParams())
  if (saleStore.pagination) {
    pagination.updateFromResponse(saleStore.pagination)
  }
}

const handlePageChange = async (page) => {
  pagination.goToPage(page)
  await fetchSales()
}

const handleCreate = () => {
  isEditing.value = false
  selectedSale.value = null
  resetForm()
  showModal()
}

const handleEdit = async (sale) => {
  isEditing.value = true
  selectedSale.value = sale
  
  // Load full sale details
  const fullSale = await saleStore.fetchSale(sale.id)
  
  formData.value = {
    customer: fullSale.customer,
    warehouse: fullSale.warehouse,
    invoice_date: fullSale.invoice_date,
    status: fullSale.status,
    notes: fullSale.notes || '',
    items: fullSale.items || []
  }
  
  showModal()
}

const handleView = async (sale) => {
  await handleEdit(sale)
}

const handleSave = async () => {
  if (!formData.value.customer || !formData.value.warehouse) {
    alert('Please select customer and warehouse')
    return
  }

  if (formData.value.items.length === 0) {
    alert('Please add at least one item')
    return
  }

  try {
    if (isEditing.value) {
      await saleStore.updateSale(selectedSale.value.id, formData.value)
    } else {
      await saleStore.createSale(formData.value)
    }
    hideModal()
    resetForm()
    await fetchSales()
  } catch (error) {
    console.error('Error saving sale:', error)
    // Error is handled by store and displayed in ErrorAlert
  }
}

const handleDelete = async (sale) => {
  const confirmed = await confirmDelete(sale.invoice_number || `#${sale.id}`, 'sale')
  if (confirmed) {
    try {
      await saleStore.deleteSale(sale.id)
      await fetchSales()
    } catch (error) {
      console.error('Error deleting sale:', error)
      // Error is handled by store and displayed in ErrorAlert
    }
  }
}

const loadProductUnits = async (productId) => {
  if (productId) {
    availableUnits.value = await productStore.fetchProductUnits(productId)
  }
}

const addItem = (item) => {
  formData.value.items.push({ ...item })
  availableUnits.value = []
}

const removeItem = (index) => {
  formData.value.items.splice(index, 1)
}

const resetForm = () => {
  formData.value = {
    customer: '',
    warehouse: '',
    invoice_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: '',
    items: []
  }
  availableUnits.value = []
  if (invoiceItemsRef.value) {
    invoiceItemsRef.value.resetCurrentItem()
  }
}
</script>

