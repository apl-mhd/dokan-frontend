<template>
  <div class="receipt-printer">
    <!-- Print Button (visible only when not printing) -->
    <div class="print-controls mb-3">
      <button class="btn btn-primary" @click="handlePrint">
        <i class="bi bi-printer me-2"></i>Print Label
      </button>
    </div>

    <!-- Receipt Content -->
    <div class="receipt-content" ref="receiptRef">
      <!-- Header -->
      <div class="receipt-header">
        <h3 class="receipt-title">{{ invoice?.invoice_number || 'Receipt' }}</h3>
        <p class="receipt-date">{{ formatDate(invoice?.invoice_date) }}</p>
      </div>

      <!-- Customer Information -->
      <div v-if="invoice?.customer_info" class="receipt-section">
        <h4 class="section-title">Customer</h4>
        <div class="section-content">
          <p><strong>{{ invoice.customer_info.name }}</strong></p>
          <p v-if="invoice.customer_info.email">{{ invoice.customer_info.email }}</p>
          <p v-if="invoice.customer_info.phone">{{ invoice.customer_info.phone }}</p>
          <p v-if="invoice.customer_info.address">{{ invoice.customer_info.address }}</p>
        </div>
      </div>

      <!-- Delivery Details -->
      <div v-if="invoice?.delivery_details" class="receipt-section">
        <h4 class="section-title">Delivery</h4>
        <div class="section-content">
          <p v-if="invoice.delivery_details.address">
            <strong>Address:</strong> {{ invoice.delivery_details.address }}
          </p>
          <p v-if="invoice.delivery_details.phone">
            <strong>Phone:</strong> {{ invoice.delivery_details.phone }}
          </p>
          <p v-if="invoice.delivery_details.date">
            <strong>Date:</strong> {{ formatDate(invoice.delivery_details.date) }}
          </p>
          <p v-if="invoice.delivery_details.notes">
            <strong>Notes:</strong> {{ invoice.delivery_details.notes }}
          </p>
        </div>
      </div>

      <!-- Items -->
      <div v-if="invoice?.items && invoice.items.length > 0" class="receipt-section">
        <h4 class="section-title">Items</h4>
        <div class="items-list">
          <div v-for="(item, index) in invoice.items" :key="index" class="item-row">
            <div class="item-name">{{ item.name || item.product_name || 'Item' }}</div>
            <div class="item-details">
              <span class="item-qty">{{ item.quantity }}</span>
              <span v-if="item.unit_name" class="item-unit">x {{ item.unit_name }}</span>
              <span class="item-price">{{ formatCurrency(item.unit_price || item.price) }}</span>
            </div>
            <div class="item-total">{{ formatCurrency(item.line_total || item.total) }}</div>
          </div>
        </div>
      </div>

      <!-- Financials -->
      <div v-if="invoice?.financials" class="receipt-section receipt-financials">
        <div class="financial-row">
          <span>Subtotal:</span>
          <span>{{ formatCurrency(invoice.financials.subtotal) }}</span>
        </div>
        <div v-if="invoice.financials.delivery" class="financial-row">
          <span>Delivery:</span>
          <span>{{ formatCurrency(invoice.financials.delivery) }}</span>
        </div>
        <div class="financial-row total-row">
          <span><strong>Total:</strong></span>
          <span><strong>{{ formatCurrency(invoice.financials.total) }}</strong></span>
        </div>
      </div>

      <!-- Footer -->
      <div class="receipt-footer">
        <p class="thank-you">Thank you for your business!</p>
        <p v-if="invoice?.notes" class="notes">{{ invoice.notes }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFormatter } from '../../composables/useFormatter'

const props = defineProps({
  invoice: {
    type: Object,
    required: true,
    validator: (value) => {
      // Validate that invoice has at least items or financials
      return value && (value.items || value.financials)
    }
  }
})

const { formatDate, formatCurrency } = useFormatter()
const receiptRef = ref(null)

const handlePrint = () => {
  window.print()
}
</script>

<style scoped>
.receipt-printer {
  max-width: 100%;
}

.print-controls {
  text-align: center;
}

.receipt-content {
  background: white;
  padding: 20px;
  max-width: 58mm;
  margin: 0 auto;
  font-family: "Courier New", monospace;
  font-size: 14px;
  line-height: 1.4;
}

.receipt-header {
  text-align: center;
  border-bottom: 2px dashed #333;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.receipt-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 5px 0;
  text-transform: uppercase;
}

.receipt-date {
  font-size: 12px;
  margin: 0;
  color: #666;
}

.receipt-section {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ccc;
}

.receipt-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  border-bottom: 1px solid #333;
  padding-bottom: 3px;
}

.section-content {
  font-size: 12px;
}

.section-content p {
  margin: 4px 0;
}

.items-list {
  margin-top: 8px;
}

.item-row {
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px dotted #ddd;
}

.item-row:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: bold;
  margin-bottom: 3px;
  font-size: 12px;
}

.item-details {
  font-size: 11px;
  color: #666;
  margin-bottom: 3px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.item-qty {
  font-weight: bold;
}

.item-unit {
  color: #888;
}

.item-price {
  margin-left: auto;
}

.item-total {
  text-align: right;
  font-weight: bold;
  font-size: 12px;
}

.receipt-financials {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 2px dashed #333;
}

.financial-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 12px;
}

.financial-row.total-row {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #333;
  font-size: 14px;
}

.receipt-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px dashed #333;
}

.thank-you {
  font-weight: bold;
  font-size: 13px;
  margin: 10px 0;
}

.notes {
  font-size: 11px;
  color: #666;
  font-style: italic;
  margin-top: 10px;
}

/* Print Styles */
@media print {
  @page {
    size: 58mm auto;
    margin: 0;
  }

  body {
    margin: 0;
    padding: 0;
  }

  .receipt-printer {
    margin: 0;
    padding: 0;
  }

  .print-controls {
    display: none !important;
  }

  .receipt-content {
    max-width: 58mm;
    width: 58mm;
    padding: 10px 5px;
    margin: 0;
    font-size: 12px !important;
    color: #000 !important;
    background: white !important;
  }

  .receipt-title {
    font-size: 14px !important;
  }

  .section-title {
    font-size: 11px !important;
  }

  .section-content,
  .item-name,
  .item-total,
  .financial-row {
    font-size: 11px !important;
  }

  .item-details {
    font-size: 10px !important;
  }

  .thank-you {
    font-size: 11px !important;
  }

  .notes {
    font-size: 10px !important;
  }

  /* Force grayscale */
  * {
    color: #000 !important;
    background: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Remove any borders that might not print well */
  .receipt-section {
    border-bottom: 1px solid #000 !important;
  }

  .receipt-header,
  .receipt-financials,
  .receipt-footer {
    border-color: #000 !important;
  }

  /* Ensure no page breaks inside sections */
  .receipt-section,
  .item-row {
    page-break-inside: avoid;
  }
}
</style>
