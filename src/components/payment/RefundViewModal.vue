<template>
  <div class="modal fade" id="refundViewModal" tabindex="-1" ref="modalRef">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ refundType === 'customer_refund' ? 'Customer Refund Details' : 'Supplier Refund Details' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div v-if="refund" class="modal-body">
          <div class="row g-3">
            <!-- Refund Info Card -->
            <div class="col-12">
              <div class="card">
                <div class="card-header" :class="refundType === 'customer_refund' ? 'bg-warning text-dark' : 'bg-info text-white'">
                  <h6 class="mb-0">
                    {{ refundType === 'customer_refund' ? 'Refund to Customer' : 'Refund from Supplier' }}
                  </h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="text-muted small">Refund ID</label>
                      <div class="fw-bold">#{{ refund.id }}</div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="text-muted small">Date</label>
                      <div class="fw-bold">{{ formatDate(refund.date) }}</div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="text-muted small">{{ refundType === 'customer_refund' ? 'Customer' : 'Supplier' }}</label>
                      <div class="fw-bold">
                        {{ refund.customer_name || refund.supplier_name }}
                      </div>
                      <div class="text-muted small">
                        {{ refund.customer_phone || refund.supplier_phone }}
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="text-muted small">Refund Amount</label>
                      <div class="fw-bold fs-4" :class="refundType === 'customer_refund' ? 'text-warning' : 'text-info'">
                        ৳{{ formatCurrency(refund.amount) }}
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="text-muted small">Payment Method</label>
                      <div>
                        <span class="badge" :class="getMethodBadgeClass(refund.payment_method)">
                          {{ getMethodIcon(refund.payment_method) }} {{ getMethodLabel(refund.payment_method) }}
                        </span>
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="text-muted small">Status</label>
                      <div>
                        <span class="badge" :class="getStatusBadgeClass(refund.status)">
                          {{ getStatusLabel(refund.status) }}
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
                    <div v-if="refund.reference_number" class="col-md-6 mb-3">
                      <label class="text-muted small">{{ getReferenceLabel(refund.payment_method) }}</label>
                      <div class="fw-bold">{{ refund.reference_number }}</div>
                    </div>
                    <div v-if="refund.account_number" class="col-md-6 mb-3">
                      <label class="text-muted small">
                        {{ isMFSMethod(refund.payment_method) ? 'Mobile Number' : 'Account Number' }}
                      </label>
                      <div class="fw-bold">{{ refund.account_number }}</div>
                    </div>
                    <div v-if="refund.account_holder_name" class="col-md-6 mb-3">
                      <label class="text-muted small">Account Holder Name</label>
                      <div class="fw-bold">{{ refund.account_holder_name }}</div>
                    </div>
                    <div v-if="refund.bank_name" class="col-md-6 mb-3">
                      <label class="text-muted small">Bank Name</label>
                      <div class="fw-bold">{{ refund.bank_name }}</div>
                    </div>
                    <div v-if="refund.branch_name" class="col-md-6 mb-3">
                      <label class="text-muted small">Branch Name</label>
                      <div class="fw-bold">{{ refund.branch_name }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="refund.notes" class="col-12">
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">Notes</h6>
                </div>
                <div class="card-body">
                  <p class="mb-0">{{ refund.notes }}</p>
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
                      <div>{{ refund.created_by_username }}</div>
                    </div>
                    <div class="col-md-6 mb-2">
                      <label class="text-muted small">Created At</label>
                      <div>{{ formatDateTime(refund.created_at) }}</div>
                    </div>
                    <div v-if="refund.updated_at" class="col-md-6 mb-2">
                      <label class="text-muted small">Last Updated</label>
                      <div>{{ formatDateTime(refund.updated_at) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
  refund: {
    type: Object,
    default: null
  },
  refundType: {
    type: String,
    required: true,
    validator: (value) => ['customer_refund', 'supplier_refund'].includes(value)
  }
})

const emit = defineEmits(['close'])

const modalRef = ref(null)
const modalInstance = ref(null)
const { formatCurrency, formatDate, formatDateTime } = useFormatter()

const hasMethodDetails = computed(() => {
  if (!props.refund) return false
  return props.refund.reference_number ||
    props.refund.account_number ||
    props.refund.account_holder_name ||
    props.refund.bank_name ||
    props.refund.branch_name
})

const isMFSMethod = (method) => {
  return ['bkash', 'nagad', 'rocket', 'upay'].includes(method)
}

const getMethodIcon = (method) => {
  const icons = {
    cash: '💵', bank: '🏦', bkash: '📱', nagad: '📱',
    rocket: '📱', upay: '📱', card: '💳', cheque: '📝', others: '📋'
  }
  return icons[method] || '💰'
}

const getMethodLabel = (method) => {
  const labels = {
    cash: 'Cash', bank: 'Bank Transfer', bkash: 'bKash', nagad: 'Nagad',
    rocket: 'Rocket', upay: 'Upay', card: 'Card', cheque: 'Cheque', others: 'Others'
  }
  return labels[method] || method
}

const getMethodBadgeClass = (method) => {
  const classes = {
    cash: 'bg-success', bank: 'bg-primary', bkash: 'bg-danger',
    nagad: 'bg-warning text-dark', rocket: 'bg-info', upay: 'bg-secondary',
    card: 'bg-dark', cheque: 'bg-light text-dark', others: 'bg-secondary'
  }
  return classes[method] || 'bg-secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    completed: '✅ Completed', pending: '⏳ Pending',
    failed: '❌ Failed', cancelled: '🚫 Cancelled'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    completed: 'bg-success', pending: 'bg-warning text-dark',
    failed: 'bg-danger', cancelled: 'bg-secondary'
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
