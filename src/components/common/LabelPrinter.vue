<template>
  <div class="label-printer">
    <!-- Print Button -->
    <button
      v-if="showButton && hasItems"
      :class="buttonClass"
      @click="handlePrint"
      :title="buttonTitle"
      :disabled="!hasItems"
    >
      <i :class="buttonIcon"></i>
      <span v-if="showButtonText">{{ buttonText }}</span>
    </button>

    <!-- Label Content (hidden until print) -->
    <div class="label-content" ref="labelRef" :style="labelStyle">
      <div
        v-for="(item, index) in labelItems"
        :key="index"
        class="label-item"
        :style="itemStyle"
      >
        <!-- Customer Information -->
        <div class="label-customer">
          <div class="customer-name">{{ customerName }}</div>
          <div v-if="customerPhone" class="customer-phone">{{ customerPhone }}</div>
          <div v-if="customerAddress" class="customer-address">{{ customerAddress }}</div>
        </div>

        <!-- Divider -->
        <div class="label-divider"></div>

        <!-- Product Information -->
        <div class="label-product">
          <div class="product-name">{{ getProductName(item) }}</div>
          <div class="product-details">
            <span class="product-qty">Qty: {{ formatQuantity(item.quantity) }}</span>
            <span v-if="item.unit_name" class="product-unit">{{ item.unit_name }}</span>
          </div>
          <div class="product-price-row">
            <span class="product-price-label">Price:</span>
            <span class="product-price">{{ formatCurrency(item.unit_price) }}</span>
          </div>
          <div v-if="item.line_total" class="product-total-row">
            <span class="product-total-label">Total:</span>
            <span class="product-total">{{ formatCurrency(item.line_total) }}</span>
          </div>
        </div>

        <!-- Invoice Info (optional) -->
        <div v-if="showInvoiceInfo" class="label-invoice">
          <div class="invoice-number">Invoice: {{ invoiceNumber }}</div>
          <div v-if="invoiceDate" class="invoice-date">{{ formatDate(invoiceDate) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFormatter } from '../../composables/useFormatter'

const props = defineProps({
  // Sale invoice data
  sale: {
    type: Object,
    required: true
  },
  // Label width in mm (default 55mm)
  labelWidth: {
    type: Number,
    default: 55
  },
  // Label height in mm (auto if not specified)
  labelHeight: {
    type: Number,
    default: null
  },
  // Show print button
  showButton: {
    type: Boolean,
    default: true
  },
  // Button class/style
  buttonClass: {
    type: String,
    default: 'btn btn-sm btn-outline-secondary'
  },
  // Button icon
  buttonIcon: {
    type: String,
    default: 'bi bi-printer'
  },
  // Button text
  buttonText: {
    type: String,
    default: 'Print Label'
  },
  // Show button text
  showButtonText: {
    type: Boolean,
    default: false
  },
  // Button title/tooltip
  buttonTitle: {
    type: String,
    default: 'Print Label'
  },
  // Show invoice info on label
  showInvoiceInfo: {
    type: Boolean,
    default: true
  },
  // Product name field mapping
  productNameField: {
    type: String,
    default: 'product_name'
  }
})

const { formatDate, formatCurrency } = useFormatter()
const labelRef = ref(null)

// Computed properties
const customerName = computed(() => {
  return props.sale.customer_name || props.sale.customer?.name || 'N/A'
})

const customerPhone = computed(() => {
  if (props.sale.customer && typeof props.sale.customer === 'object') {
    return props.sale.customer.phone || null
  }
  return props.sale.customer_phone || null
})

const customerAddress = computed(() => {
  if (props.sale.customer && typeof props.sale.customer === 'object') {
    return props.sale.customer.address || null
  }
  return props.sale.customer_address || null
})

const invoiceNumber = computed(() => {
  return props.sale.invoice_number || `#${props.sale.id}`
})

const invoiceDate = computed(() => {
  return props.sale.invoice_date || null
})

const labelItems = computed(() => {
  if (!props.sale.items || props.sale.items.length === 0) {
    return []
  }
  return props.sale.items
})

const hasItems = computed(() => {
  return labelItems.value && labelItems.value.length > 0
})

// Label styling
const labelStyle = computed(() => {
  const width = `${props.labelWidth}mm`
  return {
    width: width,
    maxWidth: width
  }
})

const itemStyle = computed(() => {
  const style = {}
  if (props.labelHeight) {
    style.minHeight = `${props.labelHeight}mm`
  }
  return style
})

// Methods
const getProductName = (item) => {
  return item[props.productNameField] || item.product?.name || item.product_name || 'Product'
}

const formatQuantity = (quantity) => {
  if (typeof quantity === 'number') {
    return quantity.toFixed(2).replace(/\.?0+$/, '')
  }
  return quantity
}

const handlePrint = () => {
  if (!labelRef.value) {
    console.error('Label content not found')
    return
  }

  if (!labelItems.value || labelItems.value.length === 0) {
    alert('No items to print')
    return
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank')
  
  if (!printWindow) {
    alert('Please allow popups to print labels')
    return
  }

  // Get label HTML
  const labelHTML = labelRef.value.innerHTML

  // Create print document
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Labels</title>
      <style>
        @page {
          size: ${props.labelWidth}mm auto;
          margin: 0;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 10px;
          line-height: 1.3;
          color: #000;
          background: white;
          padding: 5mm;
        }
        
        .label-item {
          width: ${props.labelWidth - 10}mm;
          ${props.labelHeight ? `min-height: ${props.labelHeight - 10}mm;` : ''}
          padding: 3mm;
          margin-bottom: 5mm;
          border: 1px solid #000;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .label-customer {
          margin-bottom: 2mm;
          padding-bottom: 2mm;
          border-bottom: 1px dashed #000;
        }
        
        .customer-name {
          font-weight: bold;
          font-size: 11px;
          margin-bottom: 1mm;
        }
        
        .customer-phone,
        .customer-address {
          font-size: 9px;
          margin-bottom: 0.5mm;
          word-wrap: break-word;
        }
        
        .label-divider {
          height: 1px;
          background: #000;
          margin: 2mm 0;
        }
        
        .label-product {
          margin-bottom: 2mm;
        }
        
        .product-name {
          font-weight: bold;
          font-size: 11px;
          margin-bottom: 1mm;
          word-wrap: break-word;
        }
        
        .product-details {
          font-size: 9px;
          margin-bottom: 1mm;
        }
        
        .product-qty {
          font-weight: bold;
          margin-right: 2mm;
        }
        
        .product-unit {
          color: #666;
        }
        
        .product-price-row,
        .product-total-row {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          margin-bottom: 0.5mm;
        }
        
        .product-total-row {
          font-weight: bold;
          margin-top: 1mm;
          padding-top: 1mm;
          border-top: 1px dashed #000;
        }
        
        .label-invoice {
          margin-top: 2mm;
          padding-top: 2mm;
          border-top: 1px dashed #000;
          font-size: 8px;
          color: #666;
        }
        
        .invoice-number,
        .invoice-date {
          margin-bottom: 0.5mm;
        }
        
        @media print {
          body {
            padding: 0;
            margin: 0;
          }
          
          .label-item {
            margin-bottom: 0;
            page-break-after: always;
          }
          
          .label-item:last-child {
            page-break-after: auto;
          }
        }
      </style>
    </head>
    <body>
      ${labelHTML}
    </body>
    </html>
  `)

  printWindow.document.close()

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      // Close window after printing (optional)
      // printWindow.close()
    }, 250)
  }
}
</script>

<style scoped>
.label-printer {
  display: inline-block;
}

.label-content {
  display: none;
}

/* Show labels only when printing */
@media print {
  .label-printer {
    display: block;
  }
  
  .label-content {
    display: block;
  }
}
</style>

