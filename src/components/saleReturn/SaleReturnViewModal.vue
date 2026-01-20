<template>
  <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-arrow-return-left me-2"></i>
            Sale Return Details
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>

        <div class="modal-body">
          <!-- Return Header Info -->
          <div class="row mb-4">
            <div class="col-md-3">
              <label class="form-label fw-bold text-muted small">Return Number</label>
              <p class="fs-5 fw-bold">{{ returnData.return_number || `#${returnData.id}` }}</p>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold text-muted small">Sale Invoice</label>
              <p>{{ returnData.sale_invoice_number || `Sale #${returnData.sale}` }}</p>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold text-muted small">Customer</label>
              <p>{{ returnData.customer_name || '-' }}</p>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold text-muted small">Return Date</label>
              <p>{{ formatDate(returnData.return_date) }}</p>
            </div>
          </div>

          <div class="row mb-4">
            <div class="col-md-3">
              <label class="form-label fw-bold text-muted small">Status</label>
              <p>
                <span class="badge" :class="getStatusClass(returnData.status)">
                  {{ returnData.status }}
                </span>
              </p>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold text-muted small">Refund Status</label>
              <p>
                <span class="badge" :class="getRefundStatusClass(returnData.refund_status)">
                  {{ returnData.refund_status?.replace('_', ' ') }}
                </span>
              </p>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold text-muted small">Warehouse</label>
              <p>{{ returnData.warehouse_name || `Warehouse ${returnData.warehouse}` }}</p>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold text-muted small">Created By</label>
              <p>{{ returnData.created_by_username || '-' }}</p>
            </div>
          </div>

          <!-- Return Reason -->
          <div class="mb-4">
            <label class="form-label fw-bold text-muted small">Return Reason</label>
            <div class="card">
              <div class="card-body">
                {{ returnData.return_reason }}
              </div>
            </div>
          </div>

          <!-- Returned Items Table -->
          <div class="mb-4">
            <h6 class="mb-3 fw-bold">Returned Items</h6>
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Condition</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in returnData.items || []" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>
                      {{ item.product_name || `Product ${item.product}` }}
                      <span v-if="item.condition_notes" class="d-block small text-muted">
                        <i class="bi bi-info-circle me-1"></i>{{ item.condition_notes }}
                      </span>
                    </td>
                    <td>{{ item.returned_quantity }}</td>
                    <td>{{ item.unit_name || `Unit ${item.unit}` }}</td>
                    <td>
                      <span class="badge" :class="getConditionClass(item.condition)">
                        {{ item.condition }}
                      </span>
                    </td>
                    <td>{{ formatCurrency(item.unit_price) }}</td>
                    <td><strong>{{ formatCurrency(item.line_total) }}</strong></td>
                  </tr>
                  <tr v-if="!returnData.items || returnData.items.length === 0">
                    <td colspan="7" class="text-center text-muted">No items</td>
                  </tr>
                </tbody>
                <tfoot v-if="returnData.items && returnData.items.length > 0">
                  <tr>
                    <td colspan="5" class="text-end"><strong>Sub Total:</strong></td>
                    <td colspan="2"><strong>{{ formatCurrency(returnData.sub_total || 0) }}</strong></td>
                  </tr>
                  <tr v-if="returnData.tax > 0">
                    <td colspan="5" class="text-end"><strong>Tax:</strong></td>
                    <td colspan="2"><strong>{{ formatCurrency(returnData.tax || 0) }}</strong></td>
                  </tr>
                  <tr v-if="returnData.discount > 0">
                    <td colspan="5" class="text-end"><strong>Discount:</strong></td>
                    <td colspan="2"><strong class="text-danger">-{{ formatCurrency(returnData.discount || 0) }}</strong></td>
                  </tr>
                  <tr class="table-success">
                    <td colspan="5" class="text-end"><strong>Grand Total:</strong></td>
                    <td colspan="2"><strong class="fs-5">{{ formatCurrency(returnData.grand_total) }}</strong></td>
                  </tr>
                  <tr>
                    <td colspan="5" class="text-end"><strong>Refunded Amount:</strong></td>
                    <td colspan="2">
                      <strong :class="returnData.refunded_amount > 0 ? 'text-success' : 'text-muted'">
                        {{ formatCurrency(returnData.refunded_amount || 0) }}
                      </strong>
                    </td>
                  </tr>
                  <tr v-if="returnData.refunded_amount < returnData.grand_total">
                    <td colspan="5" class="text-end"><strong>Balance to Refund:</strong></td>
                    <td colspan="2">
                      <strong class="text-warning">
                        {{ formatCurrency(returnData.grand_total - (returnData.refunded_amount || 0)) }}
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="returnData.notes" class="mb-3">
            <label class="form-label fw-bold text-muted small">Additional Notes</label>
            <div class="card">
              <div class="card-body">
                {{ returnData.notes }}
              </div>
            </div>
          </div>

          <!-- Timestamps -->
          <div class="row">
            <div class="col-md-4">
              <label class="form-label fw-bold text-muted small">Created At</label>
              <p class="small">{{ formatDateTime(returnData.created_at) }}</p>
            </div>
            <div v-if="returnData.completed_at" class="col-md-4">
              <label class="form-label fw-bold text-muted small">Completed At</label>
              <p class="small">{{ formatDateTime(returnData.completed_at) }}</p>
            </div>
            <div v-if="returnData.cancelled_at" class="col-md-4">
              <label class="form-label fw-bold text-muted small">Cancelled At</label>
              <p class="small text-danger">{{ formatDateTime(returnData.cancelled_at) }}</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFormatter } from '../../composables/useFormatter'

// Props
defineProps({
  show: Boolean,
  returnData: {
    type: Object,
    required: true
  }
})

// Composables
const { formatCurrency, formatDate } = useFormatter()

// Methods
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString()
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-warning text-dark',
    completed: 'bg-success',
    cancelled: 'bg-danger'
  }
  return classes[status] || 'bg-secondary'
}

const getRefundStatusClass = (refundStatus) => {
  const classes = {
    not_refunded: 'bg-danger',
    partial: 'bg-warning text-dark',
    refunded: 'bg-success'
  }
  return classes[refundStatus] || 'bg-secondary'
}

const getConditionClass = (condition) => {
  const classes = {
    good: 'bg-success',
    damaged: 'bg-warning text-dark',
    defective: 'bg-danger',
    expired: 'bg-danger',
    wrong_item: 'bg-info'
  }
  return classes[condition] || 'bg-secondary'
}
</script>

<style scoped>
.modal.show {
  display: block;
}

.table th,
.table td {
  vertical-align: middle;
}

.badge {
  text-transform: capitalize;
}

.card-body {
  padding: 1rem;
  background-color: #f8f9fa;
}
</style>
