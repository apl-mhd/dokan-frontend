<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <PageHeader :title="config.title" :icon="config.icon">
      <template #actions>
        <button class="btn btn-primary" @click="handleCreate">
          <i class="bi bi-plus-circle me-2"></i>{{ config.buttonLabel }}
        </button>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <LoadingSpinner v-if="invoiceStore.loading" />

    <!-- Error State -->
    <ErrorAlert :error="invoiceStore.error" title="Error" dismissible @dismiss="invoiceStore.error = null" />

    <!-- Data Table -->
    <DataTable
      v-if="!invoiceStore.loading"
      :columns="columns"
      :items="invoiceStore[config.itemsField] || []"
      :pagination="paginationData"
      :empty-message="config.emptyMessage"
      @page-change="handlePageChange"
    >
      <template #body="{ items }">
        <tr v-for="invoice in items" :key="invoice.id">
          <td><strong>{{ invoice.invoice_number || invoice.id }}</strong></td>
          <td>{{ invoice[config.entityNameField] || `${config.entityLabel} ${invoice[config.entityField]}` }}</td>
          <td>{{ invoice.warehouse_name || `Warehouse ${invoice.warehouse}` }}</td>
          <td>{{ formatDate(invoice.invoice_date) }}</td>
          <td>
            <span class="badge" :class="getStatusClass(invoice.status, config.statusClassOptions)">
              {{ invoice.status }}
            </span>
          </td>
          <td><strong>{{ formatCurrency(invoice.grand_total) }}</strong></td>
          <td>
            <button class="btn btn-sm btn-outline-success me-2" @click="handleDownloadPDF(invoice)" title="Download PDF">
              <i class="bi bi-file-pdf"></i>
            </button>
            <button class="btn btn-sm btn-outline-info me-2" @click="handleView(invoice)" title="View">
              <i class="bi bi-eye"></i>
            </button>
            <button
              v-if="invoice.status !== config.finalStatus"
              class="btn btn-sm btn-outline-primary me-2"
              @click="handleEdit(invoice)"
              title="Edit"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="handleDelete(invoice)" title="Delete">
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
            <h5 class="modal-title">{{ config.viewLabels.title(isViewMode ? 'view' : 'edit', isEditing) }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- View Mode (Read-only) -->
            <template v-if="isViewMode">
              <!-- Invoice Header Info -->
              <div class="row mb-4">
                <div class="col-md-3">
                  <label class="form-label fw-bold">Invoice Number</label>
                  <p class="form-control-plaintext">{{ selectedInvoice?.invoice_number || `#${selectedInvoice?.id}` }}</p>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-bold">{{ config.entityLabel }}</label>
                  <p class="form-control-plaintext">{{ selectedInvoice?.[config.entityNameField] || '-' }}</p>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-bold">Warehouse</label>
                  <p class="form-control-plaintext">{{ selectedInvoice?.warehouse_name || '-' }}</p>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-bold">Invoice Date</label>
                  <p class="form-control-plaintext">{{ formatDate(selectedInvoice?.invoice_date) }}</p>
                </div>
              </div>
              <div class="row mb-4">
                <div class="col-md-3">
                  <label class="form-label fw-bold">Status</label>
                  <p>
                    <span class="badge" :class="getStatusClass(selectedInvoice?.status, config.statusClassOptions)">
                      {{ selectedInvoice?.status }}
                    </span>
                  </p>
                </div>
                <div class="col-md-9">
                  <label class="form-label fw-bold">Grand Total</label>
                  <p class="form-control-plaintext fs-5 text-success fw-bold">{{ formatCurrency(selectedInvoice?.grand_total) }}</p>
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
                    <tr v-for="(item, index) in selectedInvoice?.items || []" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>{{ getProductName(item.product) }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ item.unit_name || getUnitName(item.unit) }}</td>
                      <td>{{ formatCurrency(item.unit_price) }}</td>
                      <td><strong>{{ formatCurrency(item.line_total) }}</strong></td>
                    </tr>
                    <tr v-if="!selectedInvoice?.items || selectedInvoice.items.length === 0">
                      <td colspan="6" class="text-center text-muted">No items</td>
                    </tr>
                  </tbody>
                  <tfoot v-if="selectedInvoice?.items && selectedInvoice.items.length > 0">
                    <tr class="table-success">
                      <td colspan="4" class="text-end"><strong>Grand Total:</strong></td>
                      <td colspan="2"><strong>{{ formatCurrency(selectedInvoice.grand_total) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Notes (Read-only) -->
              <div v-if="selectedInvoice?.notes" class="mb-3">
                <label class="form-label fw-bold">Notes</label>
                <p class="form-control-plaintext">{{ selectedInvoice.notes }}</p>
              </div>
            </template>

            <!-- Edit/Create Mode (Form) -->
            <template v-else>
              <!-- Invoice Header -->
              <div class="row mb-4">
                <div class="col-md-3">
                  <label class="form-label">{{ config.entityLabel }} <span class="text-danger">*</span></label>
                  <select v-model="formData[config.entityField]" class="form-select" required>
                    <option value="">Select {{ config.entityLabel }}</option>
                    <option
                      v-for="entity in entityStore[getEntityListName()]"
                      :key="entity.id"
                      :value="entity.id"
                    >
                      {{ entity.name }}
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
                    <option v-for="status in config.statusOptions" :key="status" :value="status">
                      {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                    </option>
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
                @unit-change="handleUnitChange"
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
              <i class="bi bi-save me-2"></i>{{ config.editLabels.button(isEditing) }}
            </button>
            <button
              v-if="isViewMode && selectedInvoice?.status !== config.finalStatus"
              type="button"
              class="btn btn-primary"
              @click="switchToEditMode"
            >
              <i class="bi bi-pencil me-2"></i>{{ config.editLabels.editButton }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../../utility/axios'
import { useInvoicePage } from '../../composables/useInvoicePage'
import { useModal } from '../../composables/useModal'
import { useFormatter } from '../../composables/useFormatter'
import { useConfirm } from '../../composables/useConfirm'
import { usePagination } from '../../composables/usePagination'
import { formatUnitConversion } from '../../utility/unitConverter'

// Components
import PageHeader from '../common/PageHeader.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import ErrorAlert from '../common/ErrorAlert.vue'
import DataTable from '../common/DataTable.vue'
import InvoiceItemsTable from '../common/InvoiceItemsTable.vue'

// Props
const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['purchase', 'sale', 'purchase_return', 'sale_return'].includes(value)
  }
})

// Use invoice page composable
const { config, invoiceStore, entityStore, warehouseStore, productStore, columns, getEntityListName } = useInvoicePage(props.type)

// Composables
const { modalRef, show: showModal, hide: hideModal } = useModal()
const { formatDate, formatCurrency, getStatusClass } = useFormatter()
const { confirmDelete } = useConfirm()
const pagination = usePagination(10)

// State
const isViewMode = ref(false)
const isEditing = ref(false)
const selectedInvoice = ref(null)
const editingInvoiceId = ref(null) // Store ID when editing
const availableUnits = ref([])
const unitsCache = ref(new Map())
const currentItemConversion = ref('')
const invoiceItemsRef = ref(null)

const formData = ref({
  [config.entityField]: '',
  warehouse: '',
  invoice_date: new Date().toISOString().split('T')[0],
  status: 'pending',
  notes: '',
  items: []
})

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
  const entityListName = getEntityListName()
  await Promise.all([
    fetchInvoices(),
    entityStore[entityListName === 'suppliers' ? 'fetchSuppliers' : 'fetchCustomers'](),
    warehouseStore.fetchWarehouses(),
    productStore.fetchProducts()
  ])
})

// Methods
const fetchInvoices = async () => {
  await invoiceStore[config.fetchMethod](pagination.getParams())
  if (invoiceStore.pagination) {
    pagination.updateFromResponse(invoiceStore.pagination)
  }
}

const handlePageChange = async (page) => {
  pagination.goToPage(page)
  await fetchInvoices()
}

const handleCreate = () => {
  isViewMode.value = false
  isEditing.value = false
  selectedInvoice.value = null
  editingInvoiceId.value = null
  resetForm()
  if (invoiceItemsRef.value?.cancelEdit) {
    invoiceItemsRef.value.cancelEdit()
  }
  showModal()
}

const handleEdit = async (invoice) => {
  if (invoice.status === config.finalStatus) {
    alert(config.finalStatusMessage)
    return
  }

  isViewMode.value = false
  isEditing.value = true
  selectedInvoice.value = null
  editingInvoiceId.value = invoice.id // Store ID for saving

  if (invoiceItemsRef.value?.cancelEdit) {
    invoiceItemsRef.value.cancelEdit()
  }

  // Load full invoice details
  const fullInvoice = await invoiceStore[config.fetchSingleMethod](invoice.id)

  // Cache unit names from loaded items
  if (fullInvoice.items && fullInvoice.items.length > 0) {
    fullInvoice.items.forEach(item => {
      if (item.unit_name && item.unit) {
        unitsCache.value.set(item.unit, item.unit_name)
      }
    })
  }

  formData.value = {
    [config.entityField]: fullInvoice[config.entityField],
    warehouse: fullInvoice.warehouse,
    invoice_date: fullInvoice.invoice_date,
    status: fullInvoice.status,
    notes: fullInvoice.notes || '',
    items: fullInvoice.items || []
  }

  showModal()
}

const handleView = async (invoice) => {
  isViewMode.value = true
  isEditing.value = false

  // Load full invoice details
  const fullInvoice = await invoiceStore[config.fetchSingleMethod](invoice.id)

  // Cache unit names from loaded items
  if (fullInvoice.items && fullInvoice.items.length > 0) {
    fullInvoice.items.forEach(item => {
      if (item.unit_name && item.unit) {
        unitsCache.value.set(item.unit, item.unit_name)
      }
    })
  }

  selectedInvoice.value = fullInvoice
  showModal()
}

const switchToEditMode = () => {
  if (selectedInvoice.value?.status === config.finalStatus) {
    alert(config.finalStatusMessage)
    return
  }

  isViewMode.value = false
  isEditing.value = true

  if (invoiceItemsRef.value?.cancelEdit) {
    invoiceItemsRef.value.cancelEdit()
  }

  formData.value = {
    [config.entityField]: selectedInvoice.value[config.entityField],
    warehouse: selectedInvoice.value.warehouse,
    invoice_date: selectedInvoice.value.invoice_date,
    status: selectedInvoice.value.status,
    notes: selectedInvoice.value.notes || '',
    items: selectedInvoice.value.items || []
  }
}

const handleSave = async () => {
  if (!formData.value[config.entityField] || !formData.value.warehouse) {
    alert(`Please select ${config.entityLabel.toLowerCase()} and warehouse`)
    return
  }

  if (formData.value.items.length === 0) {
    alert('Please add at least one item')
    return
  }

  try {
    if (isEditing.value && editingInvoiceId.value) {
      await invoiceStore[config.updateMethod](editingInvoiceId.value, formData.value)
    } else {
      await invoiceStore[config.createMethod](formData.value)
    }
    hideModal()
    resetForm()
    await fetchInvoices()
  } catch (error) {
    console.error(`Error saving ${props.type}:`, error)
  }
}

const handleDelete = async (invoice) => {
  const confirmed = await confirmDelete(invoice.invoice_number || `#${invoice.id}`, props.type)
  if (confirmed) {
    try {
      await invoiceStore[config.deleteMethod](invoice.id)
      await fetchInvoices()
    } catch (error) {
      console.error(`Error deleting ${props.type}:`, error)
    }
  }
}

const handleDownloadPDF = async (invoice) => {
  try {
    const response = await api.get(config.pdfEndpoint(invoice.id), {
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = config.pdfFileName(invoice)
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
    availableUnits.value.forEach(unit => {
      unitsCache.value.set(unit.id, unit.name)
    })
    // Only update unit conversion for purchase types
    if (props.type === 'purchase' || props.type === 'purchase_return') {
      updateUnitConversion()
    }
  }
}

const handleUnitChange = () => {
  // Only update unit conversion for purchase types
  if (props.type === 'purchase' || props.type === 'purchase_return') {
    updateUnitConversion()
  }
}

const updateUnitConversion = () => {
  const currentItem = invoiceItemsRef.value?.currentItem
  if (currentItem?.unit && currentItem?.quantity > 0) {
    const selectedUnit = availableUnits.value.find(u => u.id === currentItem.unit)
    if (selectedUnit) {
      const product = productStore.products.find(p => p.id === currentItem.product)
      const baseUnitName = product?.base_unit_name || 'base unit'
      currentItemConversion.value = formatUnitConversion(
        currentItem.quantity,
        selectedUnit,
        baseUnitName
      )
    }
  } else {
    currentItemConversion.value = ''
  }
}

const getProductName = (productId) => {
  const product = productStore.products.find(p => p.id === productId)
  return product ? product.name : `Product ${productId}`
}

const getUnitName = (unitId) => {
  if (!unitId) return 'N/A'

  const unit = availableUnits.value.find(u => u.id === unitId)
  if (unit) return unit.name

  if (unitsCache.value.has(unitId)) {
    return unitsCache.value.get(unitId)
  }

  return `Unit ${unitId}`
}

const getUnitNameFromItem = (item) => {
  if (item.unit_name) {
    return item.unit_name
  }
  return getUnitName(item.unit)
}

const addItem = (item) => {
  formData.value.items.push({ ...item })
  if (item.unit_name && item.unit) {
    unitsCache.value.set(item.unit, item.unit_name)
  }
  availableUnits.value = []
  currentItemConversion.value = ''
}

const updateItem = (index, item) => {
  if (index >= 0 && index < formData.value.items.length) {
    formData.value.items[index] = { ...item }
    if (item.unit_name && item.unit) {
      unitsCache.value.set(item.unit, item.unit_name)
    }
    availableUnits.value = []
    currentItemConversion.value = ''
  }
}

const removeItem = (index) => {
  formData.value.items.splice(index, 1)
}

const resetForm = () => {
  formData.value = {
    [config.entityField]: '',
    warehouse: '',
    invoice_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: '',
    items: []
  }
  availableUnits.value = []
  currentItemConversion.value = ''
  if (invoiceItemsRef.value) {
    invoiceItemsRef.value.resetCurrentItem()
    if (invoiceItemsRef.value.cancelEdit) {
      invoiceItemsRef.value.cancelEdit()
    }
  }
}
</script>

