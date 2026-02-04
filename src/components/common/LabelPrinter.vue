<template>
  <div class="label-printer">
    <!-- Print Button -->
    <button v-if="showButton && hasItems" :class="buttonClass" @click="handlePrint" :title="buttonTitle" :disabled="!hasItems">
      <i :class="buttonIcon"></i>
      <span v-if="showButtonText">{{ buttonText }}</span>
    </button>

    <!-- Label Content (hidden until print) -->
    <div class="label-content" ref="labelRef" :style="labelStyle">
      <div v-for="(item, index) in labelItems" :key="index" class="label-item" :style="itemStyle">
        <!-- Company Information (from sale.company_* or props) -->
        <div class="label-company">
          <div class="company-name">{{ companyName }}</div>
          <div v-if="companyAddress" class="company-address">{{ companyAddress }}</div>
          <div v-if="companyPhone" class="company-contact">Ph: {{ companyPhone }}</div>
          <div v-if="companyEmail" class="company-email">{{ companyEmail }}</div>
          <div v-if="companyWebsite" class="company-website">{{ companyWebsite }}</div>
        </div>
        <div class="label-divider"></div>
        <!-- Delivery To (Customer) -->
        <div class="label-delivery-to">
          <div class="delivery-to-label">Delivery To</div>
          <div class="delivery-to-content">
            <div class="customer-name">{{ customerName }}</div>
            <div v-if="customerAddress" class="customer-address">{{ customerAddress }}</div>
            <div v-if="customerPhone" class="customer-phone">Ph: {{ customerPhone }}</div>
          </div>
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
            <span class="product-total-label">Line Total:</span>
            <span class="product-total">{{ formatCurrency(item.line_total) }}</span>
          </div>
        </div>

        <!-- Invoice Summary (subtotal, tax, delivery, total, paid, due) -->
        <div class="label-summary">
          <div class="summary-row">
            <span class="summary-label">Subtotal</span>
            <span class="summary-value">{{ formatCurrency(sale.sub_total || 0) }}</span>
          </div>
          <div v-if="hasTax" class="summary-row">
            <span class="summary-label">Tax</span>
            <span class="summary-value">{{ formatCurrency(sale.tax || 0) }}</span>
          </div>
          <div v-if="hasDeliveryCharge" class="summary-row">
            <span class="summary-label">Delivery</span>
            <span class="summary-value">{{ formatCurrency(sale.delivery_charge || 0) }}</span>
          </div>
          <div v-if="hasDiscount" class="summary-row">
            <span class="summary-label">Discount</span>
            <span class="summary-value">- {{ formatCurrency(sale.discount || 0) }}</span>
          </div>
          <div class="summary-row total">
            <span class="summary-label">Total</span>
            <span class="summary-value">{{ formatCurrency(sale.grand_total || 0) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Paid</span>
            <span class="summary-value">{{ formatCurrency(sale.paid_amount || 0) }}</span>
          </div>
          <div class="summary-row due">
            <span class="summary-label">Due</span>
            <span class="summary-value">{{ formatCurrency(dueAmount) }}</span>
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
  // Label width in mm (Bangladesh common 80mm roll)
  labelWidth: {
    type: Number,
    default: 80
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
  },
  // Optional company information (overrides sale.company_* when set)
  companyName: {
    type: String,
    default: ''
  },
  companyAddress: {
    type: String,
    default: ''
  },
  companyPhone: {
    type: String,
    default: ''
  },
  companyEmail: {
    type: String,
    default: ''
  },
  companyWebsite: {
    type: String,
    default: ''
  },
  // Fallback company object (e.g. from profileApi.getCurrentCompany()); used when sale has no company_address/phone
  company: {
    type: Object,
    default: null
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

const sale = computed(() => props.sale)

// Company info: props > sale (flat company_*) > sale.company (nested) > company prop (current company fallback)
const companyName = computed(() => {
  const v = props.companyName || props.sale?.company_name || props.sale?.company?.name || props.company?.name
  return (v && String(v).trim()) || 'Company'
})
const companyAddress = computed(() => {
  const v = props.companyAddress || props.sale?.company_address || props.sale?.company?.address || props.company?.address
  return (v != null && v !== '') ? String(v).trim() : ''
})
const companyPhone = computed(() => {
  const v = props.companyPhone || props.sale?.company_phone || props.sale?.company?.phone || props.company?.phone
  return (v != null && v !== '') ? String(v).trim() : ''
})
const companyEmail = computed(() => {
  const v = props.companyEmail || props.sale?.company_email || props.sale?.company?.email || props.company?.email
  return (v != null && v !== '') ? String(v).trim() : ''
})
const companyWebsite = computed(() => {
  const v = props.companyWebsite || props.sale?.company_website || props.sale?.company?.website || props.company?.website
  return (v != null && v !== '') ? String(v).trim() : ''
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

const dueAmount = computed(() => {
  const grand = parseFloat(sale.value?.grand_total ?? 0) || 0
  const paid = parseFloat(sale.value?.paid_amount ?? 0) || 0
  return parseFloat((grand - paid).toFixed(2))
})

const hasTax = computed(() => (parseFloat(sale.value?.tax ?? 0) || 0) > 0)
const hasDeliveryCharge = computed(() => (parseFloat(sale.value?.delivery_charge ?? 0) || 0) > 0)
const hasDiscount = computed(() => (parseFloat(sale.value?.discount ?? 0) || 0) > 0)

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
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          font-size: 9px;
          line-height: 1.4;
          color: #1a202c;
          background: #ffffff;
          padding: 4mm;
        }
        
        .label-item {
          width: ${props.labelWidth - 10}mm;
          ${props.labelHeight ? `min-height: ${props.labelHeight - 10}mm;` : ''}
          padding: 3mm;
          margin-bottom: 4mm;
          border: 1px solid #cbd5e0;
          border-radius: 2px;
          background: #f9fafb;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .label-company {
          margin-bottom: 1.5mm;
        }
        
        .company-name {
          font-weight: 700;
          font-size: 10px;
          margin-bottom: 0.3mm;
        }
        
        .company-contact,
        .company-address,
        .company-email,
        .company-website {
          font-size: 7.5px;
          color: #4a5568;
          margin-bottom: 0.4mm;
        }
        
        .label-delivery-to {
          margin-bottom: 1.5mm;
          padding: 1.5mm 2mm;
          background: #f1f5f9;
          border-left: 2px solid #1a365d;
          border-radius: 0 2px 2px 0;
        }
        
        .delivery-to-label {
          font-size: 7.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #1a365d;
          margin-bottom: 0.8mm;
        }
        
        .delivery-to-content {
          font-size: 9px;
          line-height: 1.35;
        }
        
        .label-delivery-to .customer-name {
          font-weight: 700;
          font-size: 10px;
          color: #1a202c;
          margin-bottom: 0.4mm;
        }
        
        .label-delivery-to .customer-address,
        .label-delivery-to .customer-phone {
          font-size: 8px;
          margin-bottom: 0.3mm;
          word-wrap: break-word;
          color: #4a5568;
        }
        
        .label-delivery-to .customer-address:last-child,
        .label-delivery-to .customer-phone:last-child {
          margin-bottom: 0;
        }
        
        .label-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 1.5mm 0;
        }
        
        .label-product {
          margin-bottom: 1.5mm;
        }
        
        .product-name {
          font-weight: 600;
          font-size: 10px;
          margin-bottom: 0.5mm;
          word-wrap: break-word;
        }
        
        .product-details {
          font-size: 8px;
          margin-bottom: 0.8mm;
          color: #4a5568;
        }
        
        .product-qty {
          font-weight: 600;
          margin-right: 1.5mm;
        }
        
        .product-unit {
          color: #718096;
        }
        
        .product-price-row,
        .product-total-row {
          display: flex;
          justify-content: space-between;
          font-size: 8px;
          margin-bottom: 0.5mm;
        }
        
        .product-total-row {
          font-weight: 600;
          margin-top: 0.8mm;
          padding-top: 0.8mm;
          border-top: 1px dashed #cbd5e0;
        }
        
        .label-summary {
          margin-top: 1.5mm;
          padding-top: 1.5mm;
          border-top: 1px dashed #e2e8f0;
          font-size: 8px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.4mm;
        }
        
        .summary-label {
          color: #4a5568;
        }
        
        .summary-value {
          font-weight: 600;
        }
        
        .summary-row.total .summary-value {
          font-weight: 700;
        }
        
        .summary-row.due .summary-value {
          color: #c53030;
        }
        
        .label-invoice {
          margin-top: 1.5mm;
          padding-top: 1.5mm;
          border-top: 1px dashed #e2e8f0;
          font-size: 7.5px;
          color: #718096;
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

