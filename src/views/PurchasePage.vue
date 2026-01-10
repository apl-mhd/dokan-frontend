<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <PageHeader title="Purchase Management" icon="bi-bag-plus">
      <template #actions>
        <button class="btn btn-primary" @click="handleCreate">
          <i class="bi bi-plus-circle me-2"></i>New Purchase
        </button>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <LoadingSpinner v-if="purchaseStore.loading" />

    <!-- Error State -->
    <ErrorAlert :error="purchaseStore.error" title="Error" dismissible @dismiss="purchaseStore.error = null" />

    <!-- Data Table -->
    <DataTable v-if="!purchaseStore.loading" :columns="columns" :items="purchaseStore.purchases || []" :pagination="paginationData" empty-message="No purchases found. Click 'New Purchase' to create one." @page-change="handlePageChange">
      <template #body="{ items }">
        <tr v-for="purchase in items" :key="purchase.id">
          <td><strong>{{ purchase.invoice_number || purchase.id }}</strong></td>
          <td>{{ purchase.supplier_name || `Supplier ${purchase.supplier}` }}</td>
          <td>{{ purchase.warehouse_name || `Warehouse ${purchase.warehouse}` }}</td>
          <td>{{ formatDate(purchase.invoice_date) }}</td>
          <td>
            <span class="badge" :class="getStatusClass(purchase.status)">
              {{ purchase.status }}
            </span>
          </td>
          <td><strong>{{ formatCurrency(purchase.grand_total) }}</strong></td>
          <td>
            <button class="btn btn-sm btn-outline-info me-2" @click="handleView(purchase)" title="View">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary me-2" @click="handleEdit(purchase)" title="Edit">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="handleDelete(purchase)" title="Delete">
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
            <h5 class="modal-title">{{ isEditing ? 'Edit Purchase' : 'New Purchase' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Purchase Header -->
            <div class="row mb-4">
              <div class="col-md-3">
                <label class="form-label">Supplier <span class="text-danger">*</span></label>
                <select v-model="formData.supplier" class="form-select" required>
                  <option value="">Select Supplier</option>
                  <option v-for="supplier in supplierStore.suppliers" :key="supplier.id" :value="supplier.id">
                    {{ supplier.name }}
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
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <!-- Invoice Items -->
            <InvoiceItemsTable ref="invoiceItemsRef" :items="formData.items" :products="productStore.products" :available-units="availableUnits" :show-base-unit-qty="true" :show-base-unit-note="true" add-item-title="Add Items" @add-item="addItem" @remove-item="removeItem" @product-change="loadProductUnits" @unit-change="updateUnitConversion">
              <template #unitConversion>
                {{ currentItemConversion }}
              </template>
              <template #base-unit-qty="{ item }">
                <span class="badge bg-info">{{ item }}
                  {{ getBaseUnitQuantity(item) }}
                </span>
              </template>
            </InvoiceItemsTable>

            <!-- Notes -->
            <div class="mb-3">
              <label class="form-label">Notes</label>
              <textarea v-model="formData.notes" class="form-control" rows="2" placeholder="Optional notes..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="handleSave" :disabled="formData.items.length === 0">
              <i class="bi bi-save me-2"></i>{{ isEditing ? 'Update' : 'Save' }} Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePurchaseStore } from '../stores/purchase.store'
import { useSupplierStore } from '../stores/supplier.store'
import { useWarehouseStore } from '../stores/warehouse.store'
import { useProductStore } from '../stores/product.store'
import { useModal } from '../composables/useModal'
import { useFormatter } from '../composables/useFormatter'
import { useConfirm } from '../composables/useConfirm'
import { usePagination } from '../composables/usePagination'
import { convertToBaseUnit, formatUnitConversion } from '../utility/unitConverter'

// Components
import PageHeader from '../components/common/PageHeader.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorAlert from '../components/common/ErrorAlert.vue'
import DataTable from '../components/common/DataTable.vue'
import InvoiceItemsTable from '../components/common/InvoiceItemsTable.vue'

// Stores
const purchaseStore = usePurchaseStore()
const supplierStore = useSupplierStore()
const warehouseStore = useWarehouseStore()
const productStore = useProductStore()

// Composables
const { modalRef, show: showModal, hide: hideModal } = useModal()
const { formatDate, formatCurrency, getStatusClass } = useFormatter()
const { confirmDelete } = useConfirm()
const pagination = usePagination(10)

// State
const isEditing = ref(false)
const selectedPurchase = ref(null)
const availableUnits = ref([])
const currentItemConversion = ref('')
const invoiceItemsRef = ref(null)

const formData = ref({
  supplier: '',
  warehouse: '',
  invoice_date: new Date().toISOString().split('T')[0],
  status: 'pending',
  notes: '',
  items: []
})

// Table columns definition
const columns = [
  { key: 'invoice_number', label: 'Invoice #', width: '120px' },
  { key: 'supplier', label: 'Supplier' },
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
    fetchPurchases(),
    supplierStore.fetchSuppliers(),
    warehouseStore.fetchWarehouses(),
    productStore.fetchProducts()
  ])
})

// Methods
const fetchPurchases = async () => {
  await purchaseStore.fetchPurchases(pagination.getParams())
  if (purchaseStore.pagination) {
    pagination.updateFromResponse(purchaseStore.pagination)
  }
}

const handlePageChange = async (page) => {
  pagination.goToPage(page)
  await fetchPurchases()
}

const handleCreate = () => {
  isEditing.value = false
  selectedPurchase.value = null
  resetForm()
  showModal()
}

const handleEdit = async (purchase) => {
  isEditing.value = true
  selectedPurchase.value = purchase
  
  // Load full purchase details
  const fullPurchase = await purchaseStore.fetchPurchase(purchase.id)
  
  formData.value = {
    supplier: fullPurchase.supplier,
    warehouse: fullPurchase.warehouse,
    invoice_date: fullPurchase.invoice_date,
    status: fullPurchase.status,
    notes: fullPurchase.notes || '',
    items: fullPurchase.items || []
  }
  
  showModal()
}

const handleView = async (purchase) => {
  await handleEdit(purchase)
}

const handleSave = async () => {
  if (!formData.value.supplier || !formData.value.warehouse) {
    alert('Please select supplier and warehouse')
    return
  }

  if (formData.value.items.length === 0) {
    alert('Please add at least one item')
    return
  }

  try {
    if (isEditing.value) {
      await purchaseStore.updatePurchase(selectedPurchase.value.id, formData.value)
    } else {
      await purchaseStore.createPurchase(formData.value)
    }
    hideModal()
    resetForm()
    await fetchPurchases()
  } catch (error) {
    console.error('Error saving purchase:', error)
    // Error is handled by store and displayed in ErrorAlert
  }
}

const handleDelete = async (purchase) => {
  const confirmed = await confirmDelete(purchase.invoice_number || `#${purchase.id}`, 'purchase')
  if (confirmed) {
    try {
      await purchaseStore.deletePurchase(purchase.id)
      await fetchPurchases()
    } catch (error) {
      console.error('Error deleting purchase:', error)
      // Error is handled by store and displayed in ErrorAlert
    }
  }
}

const loadProductUnits = async (productId) => {
  if (productId) {
    availableUnits.value = await productStore.fetchProductUnits(productId)
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

const getBaseUnitQuantity = (item) => {
  const unit = availableUnits.value.find(u => u.id === item.unit)

  return availableUnits.value

  const product = productStore.products.find(p => p.id === item.product)
  const baseUnitName = product?.base_unit_name || 'base unit'
  
  if (!unit) {
    return `${item.quantity} ${baseUnitName}`
  }
  
  const baseQty = convertToBaseUnit(item.quantity, unit)
  return `${baseQty} ${unit}`
}

const addItem = (item) => {
  formData.value.items.push({ ...item })
  availableUnits.value = []
  currentItemConversion.value = ''
}

const removeItem = (index) => {
  formData.value.items.splice(index, 1)
}

const resetForm = () => {
  formData.value = {
    supplier: '',
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
  }
}
</script>
