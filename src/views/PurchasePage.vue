<template>
  <div class="container-fluid">
    <div class="row mb-4">
      <div class="col">
        <h2 class="mb-3">
          <i class="bi bi-bag-plus me-2"></i>Purchase Management
        </h2>
      </div>
      <div class="col-auto">
        <button class="btn btn-primary" @click="showCreateModal">
          <i class="bi bi-plus-circle me-2"></i>New Purchase
        </button>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="purchaseStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="purchaseStore.error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ purchaseStore.error }}
    </div>

    <!-- Purchases Table -->
    <div v-else class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Invoice #</th>
                <th>Supplier</th>
                <th>Warehouse</th>
                <th>Date</th>
                <th>Status</th>
                <th>Grand Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="purchase in purchaseStore.purchases" :key="purchase.id">
                <td><strong>{{ purchase.invoice_number || purchase.id }}</strong></td>
                <td>{{ purchase.supplier_name || `Supplier ${purchase.supplier}` }}</td>
                <td>{{ purchase.warehouse_name || `Warehouse ${purchase.warehouse}` }}</td>
                <td>{{ formatDate(purchase.invoice_date) }}</td>
                <td>
                  <span class="badge" :class="getStatusClass(purchase.status)">
                    {{ purchase.status }}
                  </span>
                </td>
                <td><strong>৳{{ purchase.grand_total }}</strong></td>
                <td>
                  <button class="btn btn-sm btn-outline-info me-2" @click="viewPurchase(purchase)" title="View">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-primary me-2" @click="editPurchase(purchase)" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(purchase)" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="purchaseStore.purchases.length === 0 && !purchaseStore.loading">
                <td colspan="7" class="text-center text-muted py-4">
                  No purchases found. Click "New Purchase" to create one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="purchaseModal" tabindex="-1" aria-hidden="true" ref="modalRef">
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

            <!-- Add Item Section -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <strong>Add Items</strong>
              </div>
              <div class="card-body">
                <div class="row align-items-end">
                  <div class="col-md-3">
                    <label class="form-label">Product</label>
                    <select v-model="currentItem.product" class="form-select" @change="loadProductUnits">
                      <option value="">Select Product</option>
                      <option v-for="product in productStore.products" :key="product.id" :value="product.id">
                        {{ product.name }}
                      </option>
                    </select>
                  </div>

                  <div class="col-md-2">
                    <label class="form-label">Unit</label>
                    <select v-model="currentItem.unit" class="form-select">
                      <option value="">Select Unit</option>
                      <option v-for="unit in availableUnits" :key="unit.id" :value="unit.id">
                        {{ unit.name }}
                      </option>
                    </select>
                  </div>

                  <div class="col-md-2">
                    <label class="form-label">Quantity</label>
                    <input v-model.number="currentItem.quantity" type="number" step="0.01" class="form-control" @input="calculateLineTotal" />
                  </div>

                  <div class="col-md-2">
                    <label class="form-label">Unit Price</label>
                    <input v-model.number="currentItem.unit_price" type="number" step="0.01" class="form-control" @input="calculateLineTotal" />
                  </div>

                  <div class="col-md-2">
                    <label class="form-label">Line Total</label>
                    <input v-model="currentItem.line_total" type="number" step="0.01" class="form-control" readonly />
                  </div>

                  <div class="col-md-1">
                    <button type="button" class="btn btn-success w-100" @click="addItem">
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <div class="table-responsive mb-3">
              <table class="table table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Unit</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in formData.items" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ getProductName(item.product) }}</td>
                    <td>{{ getUnitName(item.unit) }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>৳{{ item.unit_price }}</td>
                    <td><strong>৳{{ item.line_total || (item.quantity * item.unit_price) }}</strong></td>
                    <td>
                      <button type="button" class="btn btn-sm btn-danger" @click="removeItem(index)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="formData.items.length === 0">
                    <td colspan="7" class="text-center text-muted">No items added</td>
                  </tr>
                </tbody>
                <tfoot v-if="formData.items.length > 0">
                  <tr class="table-success">
                    <td colspan="5" class="text-end"><strong>Grand Total:</strong></td>
                    <td colspan="2"><strong>৳{{ calculateGrandTotal() }}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Notes -->
            <div class="mb-3">
              <label class="form-label">Notes</label>
              <textarea v-model="formData.notes" class="form-control" rows="2" placeholder="Optional notes..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="savePurchase" :disabled="formData.items.length === 0">
              <i class="bi bi-save me-2"></i>{{ isEditing ? 'Update' : 'Save' }} Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePurchaseStore } from '../stores/purchase.store'
import { useSupplierStore } from '../stores/supplier.store'
import { useWarehouseStore } from '../stores/warehouse.store'
import { useProductStore } from '../stores/product.store'
import { Modal } from 'bootstrap'

const purchaseStore = usePurchaseStore()
const supplierStore = useSupplierStore()
const warehouseStore = useWarehouseStore()
const productStore = useProductStore()

const modalRef = ref(null)
let modalInstance = null
const isEditing = ref(false)
const selectedPurchase = ref(null)
const availableUnits = ref([])

const formData = ref({
  supplier: '',
  warehouse: '',
  invoice_date: new Date().toISOString().split('T')[0],
  status: 'pending',
  notes: '',
  items: []
})

const currentItem = ref({
  product: '',
  unit: '',
  quantity: 0,
  unit_price: 0,
  line_total: 0
})

onMounted(() => {
  purchaseStore.fetchPurchases()
  supplierStore.fetchSuppliers()
  warehouseStore.fetchWarehouses()
  productStore.fetchProducts()
})

const showCreateModal = () => {
  isEditing.value = false
  selectedPurchase.value = null
  resetForm()
  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value)
  }
  modalInstance.show()
}

const editPurchase = async (purchase) => {
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
  
  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value)
  }
  modalInstance.show()
}

const viewPurchase = async (purchase) => {
  // Similar to edit but in read-only mode
  await editPurchase(purchase)
}

const loadProductUnits = async () => {
  if (currentItem.value.product) {
    availableUnits.value = await productStore.fetchProductUnits(currentItem.value.product)
  }
}

const calculateLineTotal = () => {
  currentItem.value.line_total = (currentItem.value.quantity * currentItem.value.unit_price).toFixed(2)
}

const addItem = () => {
  if (!currentItem.value.product || !currentItem.value.unit || currentItem.value.quantity <= 0 || currentItem.value.unit_price < 0) {
    alert('Please fill all item fields correctly')
    return
  }

  formData.value.items.push({ ...currentItem.value })
  
  // Reset current item
  currentItem.value = {
    product: '',
    unit: '',
    quantity: 0,
    unit_price: 0,
    line_total: 0
  }
  availableUnits.value = []
}

const removeItem = (index) => {
  formData.value.items.splice(index, 1)
}

const calculateGrandTotal = () => {
  return formData.value.items.reduce((sum, item) => sum + parseFloat(item.line_total || (item.quantity * item.unit_price)), 0).toFixed(2)
}

const savePurchase = async () => {
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
    modalInstance.hide()
    resetForm()
  } catch (error) {
    alert('Error saving purchase: ' + (error.response?.data?.message || error.message))
  }
}

const confirmDelete = async (purchase) => {
  if (confirm(`Are you sure you want to delete purchase ${purchase.invoice_number || purchase.id}?`)) {
    try {
      await purchaseStore.deletePurchase(purchase.id)
    } catch (error) {
      alert('Error deleting purchase: ' + (error.response?.data?.message || error.message))
    }
  }
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
  currentItem.value = {
    product: '',
    unit: '',
    quantity: 0,
    unit_price: 0,
    line_total: 0
  }
  availableUnits.value = []
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

const getStatusClass = (status) => {
  const statusClasses = {
    pending: 'bg-warning',
    completed: 'bg-success',
    cancelled: 'bg-danger'
  }
  return statusClasses[status] || 'bg-secondary'
}

const getProductName = (productId) => {
  const product = productStore.products.find(p => p.id === productId)
  return product ? product.name : `Product ${productId}`
}

const getUnitName = (unitId) => {
  // You might need to fetch units or cache them
  return `Unit ${unitId}`
}
</script>

<style scoped>
.table th {
  font-weight: 600;
  color: #495057;
}
</style>
