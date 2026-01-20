<template>
  <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-arrow-return-left me-2"></i>
            {{ isEditing ? 'Edit Purchase Return' : 'Create Purchase Return' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>

        <div class="modal-body">
          <!-- Error Alert -->
          <ErrorAlert v-if="error" :error="error" title="Error" dismissible @dismiss="error = null" />

          <!-- Step 1: Select Purchase (only for create) -->
          <div v-if="!isEditing && !selectedPurchase" class="mb-4">
            <h6 class="mb-3">Step 1: Select Purchase to Return</h6>
            <div class="row g-3">
              <div class="col-md-8">
                <input v-model="purchaseSearch" type="text" class="form-control" placeholder="Search by invoice number or supplier name..." @input="searchPurchases" />
              </div>
              <div class="col-md-4">
                <select v-model="purchaseSearchStatus" class="form-select" @change="searchPurchases">
                  <option value="">All</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <!-- Purchases List -->
            <div v-if="filteredPurchases.length" class="mt-3">
              <div class="table-responsive">
                <table class="table table-sm table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>Invoice #</th>
                      <th>Supplier</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="purchase in filteredPurchases" :key="purchase.id">
                      <td>{{ purchase.invoice_number }}</td>
                      <td>{{ purchase.supplier_name }}</td>
                      <td>{{ formatDate(purchase.invoice_date) }}</td>
                      <td>{{ formatCurrency(purchase.grand_total) }}</td>
                      <td>
                        <span class="badge bg-success">{{ purchase.status }}</span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-primary" @click="selectPurchase(purchase)">
                          Select
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else-if="purchasesLoading" class="text-center py-3">
              <LoadingSpinner />
            </div>
            <div v-else class="alert alert-info mt-3">
              <i class="bi bi-info-circle me-2"></i>
              No completed purchases found. Only completed purchases can have returns.
            </div>
          </div>

          <!-- Step 2: Return Form -->
          <div v-if="selectedPurchase || isEditing">
            <!-- Purchase Info (Read-only) -->
            <div class="card mb-4">
              <div class="card-header bg-light">
                <h6 class="mb-0">Original Purchase Information</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-3">
                    <label class="form-label text-muted small">Invoice Number</label>
                    <p class="fw-bold">{{ selectedPurchase?.invoice_number || form.purchase_invoice_number }}</p>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label text-muted small">Supplier</label>
                    <p>{{ selectedPurchase?.supplier_name || form.supplier_name }}</p>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label text-muted small">Date</label>
                    <p>{{ formatDate(selectedPurchase?.invoice_date || form.purchase_date) }}</p>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label text-muted small">Total</label>
                    <p class="fw-bold text-success">{{ formatCurrency(selectedPurchase?.grand_total || form.purchase_total) }}</p>
                  </div>
                </div>
                <button v-if="!isEditing" class="btn btn-sm btn-outline-secondary" @click="selectedPurchase = null">
                  <i class="bi bi-arrow-left me-1"></i>Change Purchase
                </button>
              </div>
            </div>

            <!-- Return Details Form -->
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label">Return Date <span class="text-danger">*</span></label>
                <input v-model="form.return_date" type="date" class="form-control" required />
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label">Return Reason <span class="text-danger">*</span></label>
              <textarea v-model="form.return_reason" class="form-control" rows="2" placeholder="Why are you returning these items?" required></textarea>
            </div>

            <!-- Return Items -->
            <div class="mb-4">
              <h6 class="mb-3">Items to Return</h6>

              <!-- Load Returnable Items Button -->
              <button v-if="!returnableItemsLoaded && !isEditing" class="btn btn-sm btn-outline-primary mb-3" @click="loadReturnableItems" :disabled="loadingReturnableItems">
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
                        <input v-model.number="item.return_quantity" type="number" class="form-control form-control-sm" min="0.0001" :max="item.available_to_return" step="0.0001" required @input="calculateItemTotal(item)" />
                      </td>
                      <td>{{ item.unit_name }}</td>
                      <td>{{ formatCurrency(item.unit_price) }}</td>
                      <td>
                        <select v-model="item.condition" class="form-select form-select-sm">
                          <option value="good">Good</option>
                          <option value="damaged">Damaged</option>
                          <option value="defective">Defective</option>
                          <option value="expired">Expired</option>
                          <option value="wrong_item">Wrong Item</option>
                        </select>
                      </td>
                      <td>{{ formatCurrency(item.line_total || 0) }}</td>
                      <td>
                        <button class="btn btn-sm btn-outline-danger" @click="removeItem(index)" type="button">
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
                <input v-model.number="form.tax" type="number" class="form-control" min="0" step="0.01" />
              </div>
              <div class="col-md-3">
                <label class="form-label">Discount</label>
                <input v-model.number="form.discount" type="number" class="form-control" min="0" step="0.01" />
              </div>
              <div class="col-md-3">
                <label class="form-label">Grand Total</label>
                <input :value="formatCurrency(calculateGrandTotal())" type="text" class="form-control fw-bold" readonly />
              </div>
              <div class="col-md-3">
                <label class="form-label">Refund Amount</label>
                <input v-model.number="form.refund_amount" type="number" class="form-control" min="0" step="0.01" :max="calculateGrandTotal()" />
              </div>
            </div>

            <!-- Notes -->
            <div class="mb-3">
              <label class="form-label">Notes (Optional)</label>
              <textarea v-model="form.notes" class="form-control" rows="2" placeholder="Additional notes about this return..."></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="handleSubmit" :disabled="saving || !canSubmit">
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
import { usePurchaseStore } from '../../stores/purchase.store'
import { usePurchaseReturnStore } from '../../stores/purchaseReturn.store'
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
const purchaseStore = usePurchaseStore()
const purchaseReturnStore = usePurchaseReturnStore()
const productStore = useProductStore()
const { formatCurrency, formatDate } = useFormatter()

// State
const error = ref(null)
const saving = ref(false)
const purchaseSearch = ref('')
const purchaseSearchStatus = ref('completed')
const filteredPurchases = ref([])
const purchasesLoading = ref(false)
const selectedPurchase = ref(null)
const returnableItemsLoaded = ref(false)
const loadingReturnableItems = ref(false)

const form = ref({
  purchase_id: null,
  return_date: new Date().toISOString().split('T')[0],
  return_reason: '',
  items: [],
  tax: 0,
  discount: 0,
  refund_amount: 0,
  notes: ''
})

// Computed
const canSubmit = computed(() => {
  return (
    (selectedPurchase.value || props.isEditing) &&
    form.value.return_reason &&
    form.value.items.length > 0 &&
    form.value.items.every(item => item.return_quantity > 0)
  )
})

// Methods
const searchPurchases = async () => {
  purchasesLoading.value = true
  try {
    await purchaseStore.fetchPurchases({
      search: purchaseSearch.value,
      status: purchaseSearchStatus.value || 'completed',
      page_size: 50
    })
    filteredPurchases.value = purchaseStore.purchases.filter(purchase => purchase.status === 'completed')
  } catch (err) {
    console.error('Error searching purchases:', err)
  } finally {
    purchasesLoading.value = false
  }
}

const selectPurchase = async (purchase) => {
  selectedPurchase.value = purchase
  form.value.purchase_id = purchase.id
}

const loadReturnableItems = async () => {
  if (!selectedPurchase.value) return
  
  loadingReturnableItems.value = true
  try {
    const items = await purchaseReturnStore.getReturnableItems(selectedPurchase.value.id)
    form.value.items = items.map(item => ({
      purchase_item_id: item.purchase_item_id,
      product_id: item.product_id,
      product_name: item.product_name,
      original_quantity: item.original_quantity,
      returned_quantity: item.returned_quantity,
      available_to_return: item.available_to_return,
      return_quantity: parseFloat(item.available_to_return), // Default to max
      unit_id: item.unit_id,
      unit_name: item.unit_name,
      unit_price: parseFloat(item.unit_price),
      condition: 'good',
      condition_notes: '',
      line_total: parseFloat(item.available_to_return) * parseFloat(item.unit_price)
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
      purchase_id: form.value.purchase_id,
      return_date: form.value.return_date,
      reason: form.value.return_reason,
      items: form.value.items.map(item => ({
        product_id: item.product_id,
        quantity: item.return_quantity,
        unit_id: item.unit_id,
        unit_price: item.unit_price,
        reason: item.condition_notes || `Condition: ${item.condition}`
      })),
      refund_amount: form.value.refund_amount || 0,
      notes: form.value.notes || '',
      // Create purchase returns as COMPLETED by default (so stock/ledger updates apply immediately)
      ...(props.isEditing ? {} : { status: 'completed' })
    }

    if (props.isEditing) {
      returnData.id = props.returnData.id
      await purchaseReturnStore.updatePurchaseReturn(props.returnData.id, returnData)
    } else {
      await purchaseReturnStore.createPurchaseReturn(returnData)
    }

    emit('saved')
  } catch (err) {
    error.value = purchaseReturnStore.error || 'Failed to save return'
    console.error('Error saving return:', err)
  } finally {
    saving.value = false
  }
}

// Initialize
onMounted(async () => {
  if (!props.isEditing) {
    await searchPurchases()
  }

  // Load products for display
  await productStore.fetchProducts()

  // If editing, populate form
  if (props.isEditing && props.returnData) {
    const data = props.returnData
    form.value = {
      purchase_id: data.purchase,
      purchase_invoice_number: data.purchase_invoice_number,
      supplier_name: data.supplier_name,
      purchase_date: data.purchase_date,
      purchase_total: data.purchase_total,
      return_date: data.return_date,
      return_reason: data.return_reason,
      items: data.items?.map(item => ({
        purchase_item_id: item.purchase_item_id,
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
      refund_amount: data.refund_amount || 0,
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
