<template>
  <div class="modal fade" id="paymentViewModal" tabindex="-1" ref="modalRef">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Payment Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        
        <div v-if="payment" class="modal-body">
          <div class="row g-3">
            <!-- Payment Info Card -->
            <div class="col-12">
              <div class="card">
                <div class="card-header bg-primary text-white">
                  <h6 class="mb-0">Payment Information</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="text-muted small">Payment ID</label>
                      <div class="fw-bold">#{{ payment.id }}</div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="text-muted small">Date</label>
                      <div class="fw-bold">{{ formatDate(payment.date) }}</div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="text-muted small">{{ paymentType === 'customer' ? 'Customer' : 'Supplier' }}</label>
                      <div class="fw-bold">
                        {{ payment.customer_name || payment.supplier_name }}
                      </div>
                      <div class="text-muted small">
                        {{ payment.customer_phone || payment.supplier_phone }}
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="text-muted small">Amount</label>
                      <div class="fw-bold fs-4 text-success">
                        ৳{{ formatCurrency(payment.amount) }}
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="text-muted small">Payment Method</label>
                      <div>
                        <span class="badge" :class="getMethodBadgeClass(payment.payment_method)">
                          {{ getMethodIcon(payment.payment_method) }} {{ getMethodLabel(payment.payment_method) }}
                        </span>
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="text-muted small">Status</label>
                      <div>
                        <span class="badge" :class="getStatusBadgeClass(payment.status)">
                          {{ getStatusLabel(payment.status) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Method Details -->
            <div v-if="hasMethodDetails" class="col-12">
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">Payment Details</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div v-if="payment.reference_number" class="col-md-6 mb-3">
                      <label class="text-muted small">{{ getReferenceLabel(payment.payment_method) }}</label>
                      <div class="fw-bold">{{ payment.reference_number }}</div>
                    </div>
                    <div v-if="payment.account_number" class="col-md-6 mb-3">
                      <label class="text-muted small">
                        {{ isMFSMethod(payment.payment_method) ? 'Mobile Number' : 'Account Number' }}
                      </label>
                      <div class="fw-bold">{{ payment.account_number }}</div>
                    </div>
                    <div v-if="payment.account_holder_name" class="col-md-6 mb-3">
                      <label class="text-muted small">Account Holder Name</label>
                      <div class="fw-bold">{{ payment.account_holder_name }}</div>
                    </div>
                    <div v-if="payment.bank_name" class="col-md-6 mb-3">
                      <label class="text-muted small">Bank Name</label>
                      <div class="fw-bold">{{ payment.bank_name }}</div>
                    </div>
                    <div v-if="payment.branch_name" class="col-md-6 mb-3">
                      <label class="text-muted small">Branch Name</label>
                      <div class="fw-bold">{{ payment.branch_name }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Linked Invoice(s) -->
            <div v-if="payment.sale_invoice_number || payment.purchase_invoice_number || (payment.applied_to_invoices && payment.applied_to_invoices.length > 0)" class="col-12">
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">
                    <i class="bi bi-receipt me-2"></i>
                    {{ payment.applied_to_invoices && payment.applied_to_invoices.length > 1 ? 'Applied Invoices (FIFO)' : 'Linked Invoice' }}
                  </h6>
                </div>
                <div class="card-body">
                  <!-- Single invoice (backward compatibility) -->
                  <div v-if="payment.sale_invoice_number || payment.purchase_invoice_number" class="fw-bold">
                    {{ payment.sale_invoice_number || payment.purchase_invoice_number }}
                  </div>
                  
                  <!-- Multiple invoices (FIFO) -->
                  <div v-if="payment.applied_to_invoices && payment.applied_to_invoices.length > 0">
                    <div class="alert alert-info mb-2">
                      <small><i class="bi bi-info-circle me-1"></i>Payment was applied using FIFO (First In First Out) method</small>
                    </div>
                    <div class="list-group">
                      <div 
                        v-for="(invoice, index) in payment.applied_to_invoices" 
                        :key="index"
                        class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{{ invoice.invoice_number || `#${invoice.invoice_id}` }}</strong>
                          <small class="text-muted d-block">Applied: ৳{{ formatCurrency(invoice.applied_amount) }}</small>
                        </div>
                        <span class="badge bg-primary">{{ index + 1 }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="payment.notes" class="col-12">
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">Notes</h6>
                </div>
                <div class="card-body">
                  <p class="mb-0">{{ payment.notes }}</p>
                </div>
              </div>
            </div>

            <!-- Audit Info -->
            <div class="col-12">
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">Audit Information</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6 mb-2">
                      <label class="text-muted small">Created By</label>
                      <div>{{ payment.created_by_username }}</div>
                    </div>
                    <div class="col-md-6 mb-2">
                      <label class="text-muted small">Created At</label>
                      <div>{{ formatDateTime(payment.created_at) }}</div>
                    </div>
                    <div v-if="payment.updated_at" class="col-md-6 mb-2">
                      <label class="text-muted small">Last Updated</label>
                      <div>{{ formatDateTime(payment.updated_at) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { useFormatter } from '../../composables'

const props = defineProps({
  payment: {
    type: Object,
    default: null
  },
  paymentType: {
    type: String,
    required: true,
    validator: (value) => ['customer', 'supplier'].includes(value)
  }
})

const emit = defineEmits(['close'])

const modalRef = ref(null)
const modalInstance = ref(null)
const { formatCurrency, formatDate, formatDateTime } = useFormatter()

const hasMethodDetails = computed(() => {
  if (!props.payment) return false
  return props.payment.reference_number || 
         props.payment.account_number || 
         props.payment.account_holder_name || 
         props.payment.bank_name || 
         props.payment.branch_name
})

const isMFSMethod = (method) => {
  return ['bkash', 'nagad', 'rocket', 'upay'].includes(method)
}

const getMethodIcon = (method) => {
  const icons = {
    cash: '💵',
    bank: '🏦',
    bkash: '📱',
    nagad: '📱',
    rocket: '📱',
    upay: '📱',
    card: '💳',
    cheque: '📝',
    others: '📋'
  }
  return icons[method] || '💰'
}

const getMethodLabel = (method) => {
  const labels = {
    cash: 'Cash',
    bank: 'Bank Transfer',
    bkash: 'bKash',
    nagad: 'Nagad',
    rocket: 'Rocket',
    upay: 'Upay',
    card: 'Card',
    cheque: 'Cheque',
    others: 'Others'
  }
  return labels[method] || method
}

const getMethodBadgeClass = (method) => {
  const classes = {
    cash: 'bg-success',
    bank: 'bg-primary',
    bkash: 'bg-danger',
    nagad: 'bg-warning text-dark',
    rocket: 'bg-info',
    upay: 'bg-secondary',
    card: 'bg-dark',
    cheque: 'bg-light text-dark',
    others: 'bg-secondary'
  }
  return classes[method] || 'bg-secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    completed: '✅ Completed',
    pending: '⏳ Pending',
    failed: '❌ Failed',
    cancelled: '🚫 Cancelled'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    completed: 'bg-success',
    pending: 'bg-warning text-dark',
    failed: 'bg-danger',
    cancelled: 'bg-secondary'
  }
  return classes[status] || 'bg-secondary'
}

const getReferenceLabel = (method) => {
  if (isMFSMethod(method)) return 'Transaction ID'
  if (method === 'bank') return 'Bank Reference'
  if (method === 'cheque') return 'Cheque Number'
  return 'Reference Number'
}

const openModal = () => {
  if (modalInstance.value) {
    modalInstance.value.show()
  }
}

const closeModal = () => {
  if (modalInstance.value) {
    modalInstance.value.hide()
  }
}

onMounted(() => {
  if (modalRef.value) {
    modalInstance.value = new Modal(modalRef.value)
    modalRef.value.addEventListener('hidden.bs.modal', () => {
      emit('close')
    })
  }
})

defineExpose({
  openModal,
  closeModal
})
</script>

<style scoped>
.card {
  border: 1px solid #dee2e6;
  margin-bottom: 1rem;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 0.75rem 1rem;
}

.card-body {
  padding: 1rem;
}

label.text-muted {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  display: block;
}

.badge {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}
</style>
