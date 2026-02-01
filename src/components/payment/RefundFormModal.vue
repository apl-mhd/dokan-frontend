<template>
  <div class="modal fade" id="refundFormModal" tabindex="-1" ref="modalRef">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ refundType === 'customer_refund' ? 'Refund to Customer' : 'Refund from Supplier' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <!-- Error Alert -->
            <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show">
              {{ errorMessage }}
              <button type="button" class="btn-close" @click="errorMessage = ''"></button>
            </div>

            <div v-if="refundType === 'customer_refund'" class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              Refund advance to customer. Only customers with negative balance (advance) can receive refunds.
            </div>
            <div v-else class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              Receive refund from supplier. Only suppliers with negative balance (advance) can refund.
            </div>

            <div class="row g-3">
              <!-- Party Selection -->
              <div class="col-md-6">
                <label class="form-label">
                  {{ refundType === 'customer_refund' ? 'Customer' : 'Supplier' }}
                  <span class="text-danger">*</span>
                </label>
                <select
                  v-model="form.party_id"
                  class="form-select"
                  required
                >
                  <option value="">Select {{ refundType === 'customer_refund' ? 'Customer' : 'Supplier' }}</option>
                  <option
                    v-for="party in partiesWithAdvance"
                    :key="party.id"
                    :value="party.id"
                  >
                    {{ party.name }} - {{ party.phone }}
                    (Advance: ৳{{ formatCurrency(Math.abs(party.balance || 0)) }})
                  </option>
                </select>
                <div v-if="partiesWithAdvance.length === 0" class="form-text text-warning">
                  No {{ refundType === 'customer_refund' ? 'customers' : 'suppliers' }} with advance balance found.
                </div>
              </div>

              <!-- Payment Date -->
              <div class="col-md-6">
                <label class="form-label">Refund Date <span class="text-danger">*</span></label>
                <input
                  type="date"
                  v-model="form.date"
                  class="form-control"
                  required
                >
              </div>

              <!-- Payment Method -->
              <div class="col-md-6">
                <label class="form-label">Payment Method <span class="text-danger">*</span></label>
                <select v-model="form.payment_method" class="form-select" required>
                  <option value="cash">💵 Cash</option>
                  <option value="bank">🏦 Bank Transfer</option>
                  <option value="bkash">📱 bKash</option>
                  <option value="nagad">📱 Nagad</option>
                  <option value="rocket">📱 Rocket</option>
                  <option value="upay">📱 Upay</option>
                  <option value="card">💳 Card</option>
                  <option value="cheque">📝 Cheque</option>
                  <option value="others">📋 Others</option>
                </select>
              </div>

              <!-- Amount -->
              <div class="col-md-6">
                <label class="form-label">Refund Amount <span class="text-danger">*</span></label>
                <input
                  type="number"
                  v-model.number="form.amount"
                  class="form-control"
                  step="0.01"
                  min="0.01"
                  required
                  :placeholder="maxRefundAmount ? `Max: ৳${formatCurrency(maxRefundAmount)}` : ''"
                >
                <div v-if="selectedParty" class="form-text">
                  Maximum refund: ৳{{ formatCurrency(Math.abs(selectedParty.balance || 0)) }}
                </div>
              </div>

              <!-- Reference Number -->
              <div v-if="form.payment_method !== 'cash'" class="col-md-6">
                <label class="form-label">
                  {{ getReferenceLabel() }}
                  <span v-if="requiresReference" class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  v-model="form.reference_number"
                  class="form-control"
                  :placeholder="getReferencePlaceholder()"
                  :required="requiresReference"
                >
              </div>

              <!-- MFS Fields -->
              <template v-if="isMFSMethod">
                <div class="col-md-6">
                  <label class="form-label">Mobile Number <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    v-model="form.account_number"
                    class="form-control"
                    placeholder="01712345678"
                    required
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Account Holder Name</label>
                  <input
                    type="text"
                    v-model="form.account_holder_name"
                    class="form-control"
                    placeholder="Account holder name"
                  >
                </div>
              </template>

              <!-- Bank Fields -->
              <template v-if="form.payment_method === 'bank'">
                <div class="col-md-6">
                  <label class="form-label">Bank Name <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    v-model="form.bank_name"
                    class="form-control"
                    placeholder="e.g., Dutch Bangla Bank"
                    required
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Branch Name</label>
                  <input
                    type="text"
                    v-model="form.branch_name"
                    class="form-control"
                    placeholder="e.g., Dhanmondi Branch"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Account Number</label>
                  <input
                    type="text"
                    v-model="form.account_number"
                    class="form-control"
                    placeholder="Bank account number"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Account Holder Name</label>
                  <input
                    type="text"
                    v-model="form.account_holder_name"
                    class="form-control"
                    placeholder="Account holder name"
                  >
                </div>
              </template>

              <!-- Cheque Fields -->
              <template v-if="form.payment_method === 'cheque'">
                <div class="col-md-6">
                  <label class="form-label">Bank Name</label>
                  <input
                    type="text"
                    v-model="form.bank_name"
                    class="form-control"
                    placeholder="Bank name"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Branch Name</label>
                  <input
                    type="text"
                    v-model="form.branch_name"
                    class="form-control"
                    placeholder="Branch name"
                  >
                </div>
              </template>

              <!-- Notes -->
              <div class="col-12">
                <label class="form-label">Notes</label>
                <textarea
                  v-model="form.notes"
                  class="form-control"
                  rows="3"
                  placeholder="Additional notes"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="loading || partiesWithAdvance.length === 0"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ refundType === 'customer_refund' ? 'Refund to Customer' : 'Receive Refund' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { useFormatter } from '../../composables'
import { usePaymentStore } from '../../stores/payment.store'

const props = defineProps({
  refundType: {
    type: String,
    required: true,
    validator: (value) => ['customer_refund', 'supplier_refund'].includes(value)
  },
  parties: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submit', 'close'])
const paymentStore = usePaymentStore()
const { formatCurrency } = useFormatter()
const modalRef = ref(null)
const modalInstance = ref(null)
const loading = ref(false)
const errorMessage = ref('')

const form = ref({
  party_id: '',
  date: new Date().toISOString().split('T')[0],
  payment_method: 'cash',
  amount: '',
  reference_number: '',
  account_number: '',
  account_holder_name: '',
  bank_name: '',
  branch_name: '',
  notes: ''
})

const partiesWithAdvance = computed(() => {
  return props.parties.filter(p => (p.balance || 0) < 0)
})

const selectedParty = computed(() => {
  if (!form.value.party_id) return null
  return props.parties.find(p => p.id === parseInt(form.value.party_id))
})

const maxRefundAmount = computed(() => {
  return selectedParty.value ? Math.abs(selectedParty.value.balance || 0) : 0
})

const isMFSMethod = computed(() => {
  return ['bkash', 'nagad', 'rocket', 'upay'].includes(form.value.payment_method)
})

const requiresReference = computed(() => {
  return ['bkash', 'nagad', 'rocket', 'upay', 'bank'].includes(form.value.payment_method)
})

const getReferenceLabel = () => {
  if (isMFSMethod.value) return 'Transaction ID'
  if (form.value.payment_method === 'bank') return 'Bank Reference'
  if (form.value.payment_method === 'cheque') return 'Cheque Number'
  return 'Reference Number'
}

const getReferencePlaceholder = () => {
  if (isMFSMethod.value) return 'e.g., TRX123456789'
  if (form.value.payment_method === 'bank') return 'e.g., BANK-REF-001'
  if (form.value.payment_method === 'cheque') return 'e.g., CHQ-001'
  return 'Reference number'
}

watch(() => form.value.payment_method, (newMethod, oldMethod) => {
  if (newMethod !== oldMethod) {
    if (!['bkash', 'nagad', 'rocket', 'upay', 'bank'].includes(newMethod)) {
      form.value.account_number = ''
      form.value.account_holder_name = ''
    }
    if (newMethod !== 'bank' && newMethod !== 'cheque') {
      form.value.bank_name = ''
      form.value.branch_name = ''
    }
  }
})

const handleSubmit = async () => {
  loading.value = true
  errorMessage.value = ''

  const payload = {
    payment_type: props.refundType,
    date: form.value.date,
    payment_method: form.value.payment_method,
    amount: form.value.amount,
    status: 'completed',
    notes: form.value.notes
  }

  if (props.refundType === 'customer_refund') {
    payload.customer = parseInt(form.value.party_id)
  } else {
    payload.supplier = parseInt(form.value.party_id)
  }

  if (form.value.reference_number) payload.reference_number = form.value.reference_number
  if (form.value.account_number) payload.account_number = form.value.account_number
  if (form.value.account_holder_name) payload.account_holder_name = form.value.account_holder_name
  if (form.value.bank_name) payload.bank_name = form.value.bank_name
  if (form.value.branch_name) payload.branch_name = form.value.branch_name

  try {
    await paymentStore.createRefund(payload)
    emit('submit', payload)
    closeModal()
  } catch (error) {
    const details = error.response?.data?.details
    errorMessage.value = Array.isArray(details?.amount)
      ? details.amount[0]
      : details?.amount || error.response?.data?.error || 'Failed to create refund'
  } finally {
    loading.value = false
  }
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
  resetForm()
}

const resetForm = () => {
  form.value = {
    party_id: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    amount: '',
    reference_number: '',
    account_number: '',
    account_holder_name: '',
    bank_name: '',
    branch_name: '',
    notes: ''
  }
  errorMessage.value = ''
}

onMounted(() => {
  if (modalRef.value) {
    modalInstance.value = new Modal(modalRef.value)
    modalRef.value.addEventListener('hidden.bs.modal', () => {
      emit('close')
      resetForm()
    })
  }
})

defineExpose({
  openModal,
  closeModal
})
</script>

<style scoped>
.modal-body {
  max-height: 70vh;
  overflow-y: auto;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.text-danger {
  color: #dc3545;
}
</style>
