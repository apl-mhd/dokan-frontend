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
              class="btn btn-sm btn-outline-success me-2"
              @click="handleDownloadPDF(sale)"
              title="Download PDF"
            >
              <i class="bi bi-file-pdf"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-info me-2"
              @click="handleView(sale)"
              title="View"
            >
              <i class="bi bi-eye"></i>
            </button>
            <button
              v-if="sale.status !== 'delivered'"
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

    <!-- View/Edit Modal -->
    <div class="modal fade" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isViewMode ? 'View Sale' : (isEditing ? 'Edit Sale' : 'New Sale') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- View Mode (Read-only) -->
            <template v-if="isViewMode">
              <!-- Sale Header Info -->
              <div class="row mb-4">
                <div class="col-md-3">
                  <label class="form-label fw-bold">Invoice Number</label>
                  <p class="form-control-plaintext">{{ selectedSale?.invoice_number || `#${selectedSale?.id}` }}</p>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-bold">Customer</label>
                  <p class="form-control-plaintext">{{ selectedSale?.customer_name || '-' }}</p>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-bold">Warehouse</label>
                  <p class="form-control-plaintext">{{ selectedSale?.warehouse_name || '-' }}</p>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-bold">Invoice Date</label>
                  <p class="form-control-plaintext">{{ formatDate(selectedSale?.invoice_date) }}</p>
                </div>
              </div>
              <div class="row mb-4">
                <div class="col-md-3">
                  <label class="form-label fw-bold">Status</label>
                  <p>
                    <span class="badge" :class="getStatusClass(selectedSale?.status, { delivered: 'bg-success' })">
                      {{ selectedSale?.status }}
                    </span>
                  </p>
                </div>
                <div class="col-md-9">
                  <label class="form-label fw-bold">Grand Total</label>
                  <p class="form-control-plaintext fs-5 text-success fw-bold">{{ formatCurrency(selectedSale?.grand_total) }}</p>
                </div>
              </div>

              <!-- Items Table (Read-only) -->
              <div class="table-responsive mb-3">
                <table class="table table-bordered">
                  <thead class="table-light">
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Unit Price</th>
                      <th>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in selectedSale?.items || []" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>{{ getProductName(item.product) }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ item.unit_name || getUnitName(item.unit) }}</td>
                      <td>{{ formatCurrency(item.unit_price) }}</td>
                      <td><strong>{{ formatCurrency(item.line_total) }}</strong></td>
                    </tr>
                    <tr v-if="!selectedSale?.items || selectedSale.items.length === 0">
                      <td colspan="6" class="text-center text-muted">No items</td>
                    </tr>
                  </tbody>
                  <tfoot v-if="selectedSale?.items && selectedSale.items.length > 0">
                    <tr class="table-success">
                      <td colspan="4" class="text-end"><strong>Grand Total:</strong></td>
                      <td colspan="2"><strong>{{ formatCurrency(selectedSale.grand_total) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Notes (Read-only) -->
              <div v-if="selectedSale?.notes" class="mb-3">
                <label class="form-label fw-bold">Notes</label>
                <p class="form-control-plaintext">{{ selectedSale.notes }}</p>
              </div>
            </template>

            <!-- Edit/Create Mode (Form) -->
            <template v-else>
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
                @update-item="updateItem"
                @remove-item="removeItem"
                @product-change="loadProductUnits"
              >
                <template #unit-name="{ item }">
                  {{ getUnitNameFromItem(item) }}
                </template>
              </InvoiceItemsTable>

              <!-- Notes -->
              <div class="mb-3">
                <label class="form-label">Notes</label>
                <textarea v-model="formData.notes" class="form-control" rows="2" placeholder="Optional notes..."></textarea>
              </div>
            </template>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ isViewMode ? 'Close' : 'Cancel' }}</button>
            <button
              v-if="!isViewMode"
              type="button"
              class="btn btn-primary"
              @click="handleSave"
              :disabled="formData.items.length === 0"
            >
              <i class="bi bi-save me-2"></i>{{ isEditing ? 'Update' : 'Save' }} Sale
            </button>
            <button
              v-if="isViewMode && selectedSale?.status !== 'delivered'"
              type="button"
              class="btn btn-primary"
              @click="switchToEditMode"
            >
              <i class="bi bi-pencil me-2"></i>Edit Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../utility/axios'
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
const isViewMode = ref(false)
const isEditing = ref(false)
const selectedSale = ref(null)
const availableUnits = ref([])
const unitsCache = ref(new Map()) // Cache to store unit ID -> unit name mapping
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
  isViewMode.value = false
  isEditing.value = false
  selectedSale.value = null
  resetForm()
  // Cancel any ongoing edit in the items table
  if (invoiceItemsRef.value?.cancelEdit) {
    invoiceItemsRef.value.cancelEdit()
  }
  showModal()
}

const handleEdit = async (sale) => {
  if (sale.status === 'delivered') {
    alert('Cannot edit a delivered sale')
    return
  }
  
  isViewMode.value = false
  isEditing.value = true
  selectedSale.value = null
  
  // Cancel any ongoing edit in the items table
  if (invoiceItemsRef.value?.cancelEdit) {
    invoiceItemsRef.value.cancelEdit()
  }
  
  // Load full sale details
  const fullSale = await saleStore.fetchSale(sale.id)
  
  // Cache unit names from loaded items
  if (fullSale.items && fullSale.items.length > 0) {
    fullSale.items.forEach(item => {
      if (item.unit_name && item.unit) {
        unitsCache.value.set(item.unit, item.unit_name)
      }
    })
  }
  
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
  isViewMode.value = true
  isEditing.value = false
  
  // Load full sale details
  const fullSale = await saleStore.fetchSale(sale.id)
  
  // Cache unit names from loaded items
  if (fullSale.items && fullSale.items.length > 0) {
    fullSale.items.forEach(item => {
      if (item.unit_name && item.unit) {
        unitsCache.value.set(item.unit, item.unit_name)
      }
    })
  }
  
  selectedSale.value = fullSale
  
  showModal()
}

const switchToEditMode = () => {
  if (selectedSale.value?.status === 'delivered') {
    alert('Cannot edit a delivered sale')
    return
  }
  
  isViewMode.value = false
  isEditing.value = true
  
  // Cancel any ongoing edit in the items table
  if (invoiceItemsRef.value?.cancelEdit) {
    invoiceItemsRef.value.cancelEdit()
  }
  
  formData.value = {
    customer: selectedSale.value.customer,
    warehouse: selectedSale.value.warehouse,
    invoice_date: selectedSale.value.invoice_date,
    status: selectedSale.value.status,
    notes: selectedSale.value.notes || '',
    items: selectedSale.value.items || []
  }
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

const handleDownloadPDF = async (sale) => {
  try {
    const response = await api.get(`/sales/${sale.id}/pdf/`, {
      responseType: 'blob'
    })
    
    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice_${sale.invoice_number || sale.id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading PDF:', error)
    alert('Failed to download PDF invoice. Please try again.')
  }
}

const loadProductUnits = async (productId) => {
  if (productId) {
    availableUnits.value = await productStore.fetchProductUnits(productId)
    // Update units cache with newly loaded units
    availableUnits.value.forEach(unit => {
      unitsCache.value.set(unit.id, unit.name)
    })
  }
}

const getProductName = (productId) => {
  const product = productStore.products.find(p => p.id === productId)
  return product ? product.name : `Product ${productId}`
}

const getUnitName = (unitId) => {
  if (!unitId) return 'N/A'
  
  // First check availableUnits (current form)
  const unit = availableUnits.value.find(u => u.id === unitId)
  if (unit) return unit.name
  
  // Check cache
  if (unitsCache.value.has(unitId)) {
    return unitsCache.value.get(unitId)
  }
  
  return `Unit ${unitId}`
}

const getUnitNameFromItem = (item) => {
  // First try to get from item (stored when adding/updating or from API)
  if (item.unit_name) {
    return item.unit_name
  }
  
  // Fallback to lookup
  return getUnitName(item.unit)
}

const addItem = (item) => {
  formData.value.items.push({ ...item })
  // Cache the unit name if available
  if (item.unit_name && item.unit) {
    unitsCache.value.set(item.unit, item.unit_name)
  }
  availableUnits.value = []
}

const updateItem = (index, item) => {
  if (index >= 0 && index < formData.value.items.length) {
    formData.value.items[index] = { ...item }
    // Cache the unit name if available
    if (item.unit_name && item.unit) {
      unitsCache.value.set(item.unit, item.unit_name)
    }
    availableUnits.value = []
  }
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
  // Keep unitsCache to preserve unit names for displayed items
  if (invoiceItemsRef.value) {
    invoiceItemsRef.value.resetCurrentItem()
    if (invoiceItemsRef.value.cancelEdit) {
      invoiceItemsRef.value.cancelEdit()
    }
  }
}
</script>

