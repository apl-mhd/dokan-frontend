<template>
  <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-arrow-return-left me-2"></i>
            {{ isEditing ? 'Edit Sale Return' : 'Create Sale Return' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>

        <div class="modal-body">
          <!-- Error Alert -->
          <ErrorAlert
            v-if="error"
            :error="error"
            title="Error"
            dismissible
            @dismiss="error = null"
          />

          <!-- Step 1: Select Sale (only for create) -->
          <div v-if="!isEditing && !selectedSale" class="mb-4">
            <h6 class="mb-3">Step 1: Select Sale to Return</h6>
            <div class="row g-3">
              <div class="col-md-8">
                <input
                  v-model="saleSearch"
                  type="text"
                  class="form-control"
                  placeholder="Search by invoice number or customer name..."
                  @input="searchSales"
                />
              </div>
              <div class="col-md-4">
                <select v-model="saleSearchStatus" class="form-select" @change="searchSales">
                  <option value="">All</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>

            <!-- Sales List -->
            <div v-if="filteredSales.length" class="mt-3">
              <div class="table-responsive">
                <table class="table table-sm table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>Invoice #</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="sale in filteredSales" :key="sale.id">
                      <td>{{ sale.invoice_number }}</td>
                      <td>{{ sale.customer_name }}</td>
                      <td>{{ formatDate(sale.invoice_date) }}</td>
                      <td>{{ formatCurrency(sale.grand_total) }}</td>
                      <td>
                        <span class="badge bg-success">{{ sale.status }}</span>
                      </td>
                      <td>
                        <button
                          class="btn btn-sm btn-primary"
                          @click="selectSale(sale)"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else-if="salesLoading" class="text-center py-3">
              <LoadingSpinner />
            </div>
            <div v-else class="alert alert-info mt-3">
              <i class="bi bi-info-circle me-2"></i>
              No delivered sales found. Only delivered sales can have returns.
            </div>
          </div>

          <!-- Step 2: Return Form -->
          <div v-if="selectedSale || isEditing">
            <!-- Sale Info (Read-only) -->
            <div class="card mb-4">
              <div class="card-header bg-light">
                <h6 class="mb-0">Original Sale Information</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-3">
                    <label class="form-label text-muted small">Invoice Number</label>
                    <p class="fw-bold">{{ selectedSale?.invoice_number || form.sale_invoice_number }}</p>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label text-muted small">Customer</label>
                    <p>{{ selectedSale?.customer_name || form.customer_name }}</p>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label text-muted small">Date</label>
                    <p>{{ formatDate(selectedSale?.invoice_date || form.sale_date) }}</p>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label text-muted small">Total</label>
                    <p class="fw-bold text-success">{{ formatCurrency(selectedSale?.grand_total || form.sale_total) }}</p>
                  </div>
                </div>
                <button
                  v-if="!isEditing"
                  class="btn btn-sm btn-outline-secondary"
                  @click="selectedSale = null"
                >
                  <i class="bi bi-arrow-left me-1"></i>Change Sale
                </button>
              </div>
            </div>

            <!-- Return Details Form -->
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label">Return Date <span class="text-danger">*</span></label>
                <input
                  v-model="form.return_date"
                  type="date"
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label">Return Reason <span class="text-danger">*</span></label>
              <textarea
                v-model="form.return_reason"
                class="form-control"
                rows="2"
                placeholder="Why is the customer returning these items?"
                required
              ></textarea>
            </div>

            <!-- Return Items -->
            <div class="mb-4">
              <h6 class="mb-3">Items to Return</h6>
              
              <!-- Load Returnable Items Button -->
              <button
                v-if="!returnableItemsLoaded && !isEditing"
                class="btn btn-sm btn-outline-primary mb-3"
                @click="loadReturnableItems"
                :disabled="loadingReturnableItems"
              >
                <i class="bi bi-arrow-down-circle me-1"></i>
                {{ loadingReturnableItems ? 'Loading...' : 'Load Returnable Items' }}
              </button>

              <div class="table-responsive">
                <table class="table table-bordered">
                  <thead class="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Original Qty</th>
                      <th>Already Returned</th>
                      <th>Available</th>
                      <th>Return Qty</th>
                      <th>Unit</th>
                      <th>Price</th>
                      <th>Condition</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in form.items" :key="index">
                      <td>{{ getProductName(item) }}</td>
                      <td>{{ item.original_quantity || '-' }}</td>
                      <td>{{ item.returned_quantity || '0' }}</td>
                      <td>{{ item.available_to_return || '-' }}</td>
                      <td>
                        <input
                          v-model.number="item.return_quantity"
                          type="number"
                          class="form-control form-control-sm"
                          min="0.0001"
                          :max="item.available_to_return"
                          step="0.0001"
                          required
                          @input="calculateItemTotal(item)"
                        />
                      </td>
                      <td>{{ item.unit_name }}</td>
                      <td>{{ formatCurrency(item.unit_price) }}</td>
                      <td>
                        <select
                          v-model="item.condition"
                          class="form-select form-select-sm"
                        >
                          <option value="good">Good</option>
                          <option value="damaged">Damaged</option>
                          <option value="defective">Defective</option>
                          <option value="expired">Expired</option>
                          <option value="wrong_item">Wrong Item</option>
                        </select>
                      </td>
                      <td>{{ formatCurrency(item.line_total || 0) }}</td>
                      <td>
                        <button
                          class="btn btn-sm btn-outline-danger"
                          @click="removeItem(index)"
                          type="button"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                    <tr v-if="!form.items.length">
                      <td colspan="10" class="text-center text-muted">
                        No items selected. Load returnable items above.
                      </td>
                    </tr>
                  </tbody>
                  <tfoot v-if="form.items.length">
                    <tr class="table-light">
                      <td colspan="8" class="text-end fw-bold">Sub Total:</td>
                      <td colspan="2" class="fw-bold">{{ formatCurrency(calculateSubTotal()) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Financial Details -->
            <div class="row g-3 mb-4">
              <div class="col-md-3">
                <label class="form-label">Tax</label>
                <input
                  v-model.number="form.tax"
                  type="number"
                  class="form-control"
                  min="0"
                  step="0.01"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label">Discount</label>
                <input
                  v-model.number="form.discount"
                  type="number"
                  class="form-control"
                  min="0"
                  step="0.01"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label">Grand Total</label>
                <input
                  :value="formatCurrency(calculateGrandTotal())"
                  type="text"
                  class="form-control fw-bold"
                  readonly
                />
              </div>
              <div class="col-md-3">
                <label class="form-label">Refunded Amount</label>
                <input
                  v-model.number="form.refunded_amount"
                  type="number"
                  class="form-control"
                  min="0"
                  step="0.01"
                  :max="calculateGrandTotal()"
                />
              </div>
            </div>

            <!-- Notes -->
            <div class="mb-3">
              <label class="form-label">Notes (Optional)</label>
              <textarea
                v-model="form.notes"
                class="form-control"
                rows="2"
                placeholder="Additional notes about this return..."
              ></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="handleSubmit"
            :disabled="saving || !canSubmit"
          >
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            {{ saving ? 'Saving...' : (isEditing ? 'Update Return' : 'Create Return') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useSaleStore } from '../../stores/sale.store'
import { useSaleReturnStore } from '../../stores/saleReturn.store'
import { useProductStore } from '../../stores/product.store'
import { useFormatter } from '../../composables/useFormatter'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import ErrorAlert from '../common/ErrorAlert.vue'

// Props & Emits
const props = defineProps({
  show: Boolean,
  returnData: Object,
  isEditing: Boolean
})

const emit = defineEmits(['close', 'saved'])

// Composables
const saleStore = useSaleStore()
const saleReturnStore = useSaleReturnStore()
const productStore = useProductStore()
const { formatCurrency, formatDate } = useFormatter()

// State
const error = ref(null)
const saving = ref(false)
const saleSearch = ref('')
const saleSearchStatus = ref('delivered')
const filteredSales = ref([])
const salesLoading = ref(false)
const selectedSale = ref(null)
const returnableItemsLoaded = ref(false)
const loadingReturnableItems = ref(false)

const form = ref({
  sale_id: null,
  return_date: new Date().toISOString().split('T')[0],
  return_reason: '',
  items: [],
  tax: 0,
  discount: 0,
  refunded_amount: 0,
  notes: ''
})

// Computed
const canSubmit = computed(() => {
  return (
    (selectedSale.value || props.isEditing) &&
    form.value.return_reason &&
    form.value.items.length > 0 &&
    form.value.items.every(item => item.return_quantity > 0)
  )
})

// Methods
const searchSales = async () => {
  salesLoading.value = true
  try {
    await saleStore.fetchSales({
      search: saleSearch.value,
      status: saleSearchStatus.value || 'delivered',
      page_size: 50
    })
    filteredSales.value = saleStore.sales.filter(sale => sale.status === 'delivered')
  } catch (err) {
    console.error('Error searching sales:', err)
  } finally {
    salesLoading.value = false
  }
}

const selectSale = async (sale) => {
  selectedSale.value = sale
  form.value.sale_id = sale.id
}

const loadReturnableItems = async () => {
  if (!selectedSale.value) return
  
  loadingReturnableItems.value = true
  try {
    const items = await saleReturnStore.getReturnableItems(selectedSale.value.id)
    form.value.items = items.map(item => ({
      sale_item_id: item.sale_item_id,
      product_id: item.product_id,
      product_name: item.product_name,
      original_quantity: item.original_quantity,
      returned_quantity: item.returned_quantity,
      available_to_return: item.available_to_return,
      return_quantity: item.available_to_return, // Default to max
      unit_id: item.unit_id,
      unit_name: item.unit_name,
      unit_price: item.unit_price,
      condition: 'good',
      condition_notes: '',
      line_total: item.available_to_return * item.unit_price
    }))
    returnableItemsLoaded.value = true
  } catch (err) {
    error.value = 'Failed to load returnable items'
    console.error('Error loading returnable items:', err)
  } finally {
    loadingReturnableItems.value = false
  }
}

const calculateItemTotal = (item) => {
  item.line_total = (item.return_quantity || 0) * (item.unit_price || 0)
}

const calculateSubTotal = () => {
  return form.value.items.reduce((sum, item) => sum + (item.line_total || 0), 0)
}

const calculateGrandTotal = () => {
  const subTotal = calculateSubTotal()
  return subTotal + (form.value.tax || 0) - (form.value.discount || 0)
}

const removeItem = (index) => {
  form.value.items.splice(index, 1)
}

const getProductName = (item) => {
  return item.product_name || `Product ${item.product_id}`
}

const handleSubmit = async () => {
  error.value = null
  saving.value = true

  try {
    const returnData = {
      sale_id: form.value.sale_id,
      return_date: form.value.return_date,
      return_reason: form.value.return_reason,
      items: form.value.items.map(item => ({
        sale_item_id: item.sale_item_id,
        returned_quantity: item.return_quantity,
        condition: item.condition,
        condition_notes: item.condition_notes || ''
      })),
      tax: form.value.tax || 0,
      discount: form.value.discount || 0,
      refunded_amount: form.value.refunded_amount || 0,
      notes: form.value.notes || ''
    }

    if (props.isEditing) {
      returnData.id = props.returnData.id
      await saleReturnStore.updateSaleReturn(props.returnData.id, returnData)
    } else {
      await saleReturnStore.createSaleReturn(returnData)
    }

    emit('saved')
  } catch (err) {
    error.value = saleReturnStore.error || 'Failed to save return'
    console.error('Error saving return:', err)
  } finally {
    saving.value = false
  }
}

// Initialize
onMounted(async () => {
  if (!props.isEditing) {
    await searchSales()
  }

  // Load products for display
  await productStore.fetchProducts()

  // If editing, populate form
  if (props.isEditing && props.returnData) {
    const data = props.returnData
    form.value = {
      sale_id: data.sale,
      sale_invoice_number: data.sale_invoice_number,
      customer_name: data.customer_name,
      sale_date: data.sale_date,
      sale_total: data.sale_total,
      return_date: data.return_date,
      return_reason: data.return_reason,
      items: data.items?.map(item => ({
        sale_item_id: item.sale_item_id,
        product_id: item.product,
        product_name: item.product_name,
        return_quantity: item.returned_quantity,
        unit_id: item.unit,
        unit_name: item.unit_name,
        unit_price: item.unit_price,
        condition: item.condition,
        condition_notes: item.condition_notes || '',
        line_total: item.line_total
      })) || [],
      tax: data.tax || 0,
      discount: data.discount || 0,
      refunded_amount: data.refunded_amount || 0,
      notes: data.notes || ''
    }
  }
})
</script>

<style scoped>
.modal.show {
  display: block;
}

.table th,
.table td {
  vertical-align: middle;
}

.form-control-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
