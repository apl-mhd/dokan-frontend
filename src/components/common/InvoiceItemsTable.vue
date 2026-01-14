<template>
  <div>
    <!-- Add Item Section -->
    <div class="card mb-3">
      <div class="card-header bg-light d-flex justify-content-between align-items-center">
        <strong>{{ editingIndex !== null ? 'Edit Item' : addItemTitle }}</strong>
        <span v-if="editingIndex !== null" class="badge bg-info">Editing item #{{ editingIndex + 1 }}</span>
      </div>
      <div class="card-body">
        <div class="row align-items-end">
          <div class="col-md-3">
            <label class="form-label">Product</label>
            <VueSelect v-model="currentItem.product" :options="products" label="name" :reduce="product => product.id" placeholder="Select Product" @update:model-value="handleProductChange" />
          </div>

          <div class="col-md-2">
            <label class="form-label">Unit</label>
            <VueSelect v-model="currentItem.unit" :options="unitOptions" label="label" :reduce="unit => unit.id" placeholder="Select Unit" @update:model-value="$emit('unit-change')" />
          </div>

          <div class="col-md-2">
            <label class="form-label">Quantity</label>
            <input v-model.number="currentItem.quantity" type="number" step="0.01" class="form-control" @input="calculateLineTotal" />
            <small v-if="$slots.unitConversion" class="text-muted">
              <slot name="unitConversion"></slot>
            </small>
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
            <button v-if="editingIndex === null" type="button" class="btn btn-success w-100" @click="handleAddItem">
              <i class="bi bi-plus"></i>
            </button>
            <div v-else class="d-flex gap-1">
              <button type="button" class="btn btn-primary flex-fill" @click="handleUpdateItem">
                <i class="bi bi-check"></i>
              </button>
              <button type="button" class="btn btn-secondary flex-fill" @click="handleCancelEdit">
                <i class="bi bi-x"></i>
              </button>
            </div>
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
            <th>Quantity</th>
            <th>Unit</th>
            <th v-if="showBaseUnitQty">Base Unit Qty</th>
            <th>Unit Price</th>
            <th>Line Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="index">
            <td>{{ index + 1 }}</td>
            <td>
              <slot name="product-name" :item="item">
                {{ getProductName(item.product) }}
              </slot>
            </td>
            <td>{{ item.quantity }}</td>
            <td>
              <slot name="unit-name" :item="item">
                {{ getUnitName(item.unit, item) }}
              </slot>
            </td>
            <td v-if="showBaseUnitQty">
              <slot name="base-unit-qty" :item="item">
                <span class="badge bg-info">{{ item.base_unit_quantity || '-' }}</span>
              </slot>
            </td>
            <td>{{ formatCurrency(item.unit_price) }}</td>
            <td><strong>{{ formatCurrency(item.line_total || (item.quantity * item.unit_price)) }}</strong></td>
            <td>
              <div class="btn-group" role="group">
                <button type="button" class="btn btn-sm btn-primary" @click="handleEditItem(index)" :disabled="editingIndex !== null && editingIndex !== index" title="Edit">
                  <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="btn btn-sm btn-danger" @click="$emit('remove-item', index)" :disabled="editingIndex !== null" title="Delete">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td :colspan="showBaseUnitQty ? 8 : 7" class="text-center text-muted">No items added</td>
          </tr>
        </tbody>
        <tfoot v-if="items.length > 0">
          <tr v-if="showBaseUnitNote" class="table-info">
            <td :colspan="showBaseUnitQty ? 8 : 7" class="text-muted">
              <i class="bi bi-info-circle me-2"></i>
              <strong>Note:</strong> All stock quantities are stored in base units for accurate inventory tracking.
            </td>
          </tr>
          <tr class="table-success">
            <td :colspan="showBaseUnitQty ? 5 : 4" class="text-end"><strong>Grand Total:</strong></td>
            <td :colspan="showBaseUnitQty ? 3 : 2"><strong>{{ formatCurrency(grandTotal) }}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFormatter } from '../../composables/useFormatter'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  products: {
    type: Array,
    default: () => []
  },
  availableUnits: {
    type: Array,
    default: () => []
  },
  showBaseUnitQty: {
    type: Boolean,
    default: false
  },
  showBaseUnitNote: {
    type: Boolean,
    default: false
  },
  addItemTitle: {
    type: String,
    default: 'Add Items'
  },
  currency: {
    type: String,
    default: '৳'
  }
})

const emit = defineEmits(['add-item', 'update-item', 'remove-item', 'product-change', 'unit-change'])

const { formatCurrency: formatCurrencyBase } = useFormatter()

const editingIndex = ref(null)
const currentItem = ref({
  product: '',
  unit: '',
  quantity: 0,
  unit_price: 0,
  line_total: 0
})

const grandTotal = computed(() => {
  return props.items.reduce((sum, item) => {
    return sum + parseFloat(item.line_total || (item.quantity * item.unit_price))
  }, 0)
})

const unitOptions = computed(() => {
  return props.availableUnits.map(unit => ({
    id: unit.id,
    label: unit.name + (unit.is_base_unit ? ' (Base)' : '')
  }))
})

const handleProductChange = (productId) => {
  emit('product-change', productId)
}

const calculateLineTotal = () => {
  currentItem.value.line_total = (currentItem.value.quantity * currentItem.value.unit_price).toFixed(2)
}

const handleAddItem = () => {
  if (!currentItem.value.product || !currentItem.value.unit || currentItem.value.quantity <= 0 || currentItem.value.unit_price < 0) {
    alert('Please fill all item fields correctly')
    return
  }

  // Get unit name from availableUnits before adding
  const selectedUnit = props.availableUnits.find(u => u.id === currentItem.value.unit)
  const unitName = selectedUnit ? selectedUnit.name : null

  emit('add-item', { 
    ...currentItem.value,
    unit_name: unitName // Include unit name for display
  })
  
  // Reset current item
  resetCurrentItem()
}

const handleEditItem = (index) => {
  const item = props.items[index]
  if (!item) return
  
  editingIndex.value = index
  
  // Set the current item data
  currentItem.value = {
    product: item.product,
    unit: item.unit,
    quantity: parseFloat(item.quantity),
    unit_price: parseFloat(item.unit_price),
    line_total: parseFloat(item.line_total || (item.quantity * item.unit_price))
  }
  
  // Trigger product-change event to load units (will update availableUnits prop)
  emit('product-change', item.product)
  
  // Recalculate line total
  calculateLineTotal()
}

const handleUpdateItem = () => {
  if (!currentItem.value.product || !currentItem.value.unit || currentItem.value.quantity <= 0 || currentItem.value.unit_price < 0) {
    alert('Please fill all item fields correctly')
    return
  }

  if (editingIndex.value === null) {
    alert('No item selected for editing')
    return
  }

  // Get the original item to preserve unit_name if lookup fails
  const originalItem = props.items[editingIndex.value]
  
  // Get unit name from availableUnits before updating
  const selectedUnit = props.availableUnits.find(u => u.id === currentItem.value.unit)
  const unitName = selectedUnit ? selectedUnit.name : (originalItem?.unit_name || null)

  emit('update-item', editingIndex.value, { 
    ...currentItem.value,
    unit_name: unitName // Include unit name for display
  })
  
  // Reset after update
  resetCurrentItem()
  editingIndex.value = null
}

const handleCancelEdit = () => {
  resetCurrentItem()
  editingIndex.value = null
}

const resetCurrentItem = () => {
  currentItem.value = {
    product: '',
    unit: '',
    quantity: 0,
    unit_price: 0,
    line_total: 0
  }
}

const getProductName = (productId) => {
  const product = props.products.find(p => p.id === productId)
  return product ? product.name : `Product ${productId}`
}

const getUnitName = (unitId, item = null) => {
  // First check if item has unit_name (from API or stored during add/update)
  if (item && item.unit_name) {
    return item.unit_name
  }
  
  // Try to find unit in availableUnits (for current form items)
  if (unitId) {
    const unit = props.availableUnits.find(u => u.id === unitId)
    if (unit) {
      return unit.name
    }
  }
  
  // Final fallback
  return unitId ? `Unit ${unitId}` : 'N/A'
}

const formatCurrency = (amount) => {
  return formatCurrencyBase(amount, props.currency)
}

// Expose currentItem for parent access
defineExpose({
  currentItem,
  editingIndex,
  resetCurrentItem,
  cancelEdit: handleCancelEdit
})
</script>

<style scoped>
.table th {
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}
</style>

