<template>
  <div>
    <!-- Add Item Section -->
    <div class="card mb-3">
      <div class="card-header bg-light">
        <strong>{{ addItemTitle }}</strong>
      </div>
      <div class="card-body">
        <div class="row align-items-end">
          <div class="col-md-3">
            <label class="form-label">Product</label>
            <select v-model="currentItem.product" class="form-select" @change="$emit('product-change', currentItem.product)">
              <option value="">Select Product</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }}
              </option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label">Unit</label>
            <select v-model="currentItem.unit" class="form-select" @change="$emit('unit-change')">
              <option value="">Select Unit</option>
              <option v-for="unit in availableUnits" :key="unit.id" :value="unit.id">
                {{ unit.name }}
                {{ unit.is_base_unit ? '(Base)' : '' }}
              </option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label">Quantity</label>
            <input
              v-model.number="currentItem.quantity"
              type="number"
              step="0.01"
              class="form-control"
              @input="calculateLineTotal"
            />
            <small v-if="$slots.unitConversion" class="text-muted">
              <slot name="unitConversion"></slot>
            </small>
          </div>

          <div class="col-md-2">
            <label class="form-label">Unit Price</label>
            <input
              v-model.number="currentItem.unit_price"
              type="number"
              step="0.01"
              class="form-control"
              @input="calculateLineTotal"
            />
          </div>

          <div class="col-md-2">
            <label class="form-label">Line Total</label>
            <input v-model="currentItem.line_total" type="number" step="0.01" class="form-control" readonly />
          </div>

          <div class="col-md-1">
            <button type="button" class="btn btn-success w-100" @click="handleAddItem">
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
            <td>
              <slot name="unit-name" :item="item">
                {{ getUnitName(item.unit) }}
              </slot>
            </td>
            <td>{{ item.quantity }}</td>
            <td v-if="showBaseUnitQty">
              <slot name="base-unit-qty" :item="item">
                <span class="badge bg-info">{{ item.base_unit_quantity || '-' }}</span>
              </slot>
            </td>
            <td>{{ formatCurrency(item.unit_price) }}</td>
            <td><strong>{{ formatCurrency(item.line_total || (item.quantity * item.unit_price)) }}</strong></td>
            <td>
              <button type="button" class="btn btn-sm btn-danger" @click="$emit('remove-item', index)">
                <i class="bi bi-trash"></i>
              </button>
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

const emit = defineEmits(['add-item', 'remove-item', 'product-change', 'unit-change'])

const { formatCurrency: formatCurrencyBase } = useFormatter()

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

const calculateLineTotal = () => {
  currentItem.value.line_total = (currentItem.value.quantity * currentItem.value.unit_price).toFixed(2)
}

const handleAddItem = () => {
  if (!currentItem.value.product || !currentItem.value.unit || currentItem.value.quantity <= 0 || currentItem.value.unit_price < 0) {
    alert('Please fill all item fields correctly')
    return
  }

  emit('add-item', { ...currentItem.value })
  
  // Reset current item
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

const getUnitName = (unitId) => {
  const unit = props.availableUnits.find(u => u.id === unitId)
  return unit ? unit.name : `Unit ${unitId}`
}

const formatCurrency = (amount) => {
  return formatCurrencyBase(amount, props.currency)
}

// Expose currentItem for parent access
defineExpose({
  currentItem,
  resetCurrentItem: () => {
    currentItem.value = {
      product: '',
      unit: '',
      quantity: 0,
      unit_price: 0,
      line_total: 0
    }
  }
})
</script>

<style scoped>
.table th {
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}
</style>

