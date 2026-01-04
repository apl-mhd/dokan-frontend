<template>
  <div class="container-fluid">
    <div class="row mb-4">
      <div class="col">
        <h2 class="mb-3">
          <i class="bi bi-cash-coin me-2"></i>Sale Management
        </h2>
      </div>
      <div class="col-auto">
        <button class="btn btn-primary" @click="showCreateModal">
          <i class="bi bi-plus-circle me-2"></i>New Sale
        </button>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="saleStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="saleStore.error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ saleStore.error }}
    </div>

    <!-- Sales Table -->
    <div v-else class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Warehouse</th>
                <th>Date</th>
                <th>Status</th>
                <th>Grand Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in saleStore.sales" :key="sale.id">
                <td><strong>{{ sale.invoice_number || sale.id }}</strong></td>
                <td>{{ sale.customer_name || `Customer ${sale.customer}` }}</td>
                <td>{{ sale.warehouse_name || `Warehouse ${sale.warehouse}` }}</td>
                <td>{{ formatDate(sale.invoice_date) }}</td>
                <td>
                  <span class="badge" :class="getStatusClass(sale.status)">
                    {{ sale.status }}
                  </span>
                </td>
                <td><strong>৳{{ sale.grand_total }}</strong></td>
                <td>
                  <button class="btn btn-sm btn-outline-info me-2" @click="viewSale(sale)" title="View">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-primary me-2" @click="editSale(sale)" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(sale)" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="saleStore.sales.length === 0 && !saleStore.loading">
                <td colspan="7" class="text-center text-muted py-4">
                  No sales found. Click "New Sale" to create one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="saleModal" tabindex="-1" aria-hidden="true" ref="modalRef">
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
                    <input v-model.number="currentItem.quantity" type="number" step="0.0001" class="form-control" @input="calculateLineTotal" />
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
            <button type="button" class="btn btn-primary" @click="saveSale" :disabled="formData.items.length === 0">
              <i class="bi bi-save me-2"></i>{{ isEditing ? 'Update' : 'Save' }} Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSaleStore } from '../stores/sale.store'
import { useCustomerStore } from '../stores/customer.store'
import { useWarehouseStore } from '../stores/warehouse.store'
import { useProductStore } from '../stores/product.store'
import { Modal } from 'bootstrap'

const saleStore = useSaleStore()
const customerStore = useCustomerStore()
const warehouseStore = useWarehouseStore()
const productStore = useProductStore()

const modalRef = ref(null)
let modalInstance = null
const isEditing = ref(false)
const selectedSale = ref(null)
const availableUnits = ref([])

const formData = ref({
  customer: '',
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
  saleStore.fetchSales()
  customerStore.fetchCustomers()
  warehouseStore.fetchWarehouses()
  productStore.fetchProducts()
})

const showCreateModal = () => {
  isEditing.value = false
  selectedSale.value = null
  resetForm()
  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value)
  }
  modalInstance.show()
}

const editSale = async (sale) => {
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
  
  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value)
  }
  modalInstance.show()
}

const viewSale = async (sale) => {
  await editSale(sale)
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

const saveSale = async () => {
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
    modalInstance.hide()
    resetForm()
  } catch (error) {
    alert('Error saving sale: ' + (error.response?.data?.message || error.message))
  }
}

const confirmDelete = async (sale) => {
  if (confirm(`Are you sure you want to delete sale ${sale.invoice_number || sale.id}?`)) {
    try {
      await saleStore.deleteSale(sale.id)
    } catch (error) {
      alert('Error deleting sale: ' + (error.response?.data?.message || error.message))
    }
  }
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
    delivered: 'bg-success',
    cancelled: 'bg-danger'
  }
  return statusClasses[status] || 'bg-secondary'
}

const getProductName = (productId) => {
  const product = productStore.products.find(p => p.id === productId)
  return product ? product.name : `Product ${productId}`
}

const getUnitName = (unitId) => {
  return `Unit ${unitId}`
}
</script>

<style scoped>
.table th {
  font-weight: 600;
  color: #495057;
}
</style>
