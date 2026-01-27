<template>
  <div class="modal fade" id="paymentFormModal" tabindex="-1" ref="modalRef">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ isEditMode ? 'Edit Payment' : 'New Payment' }}
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

            <div class="row g-3">
              <!-- Party Selection (Customer or Supplier) -->
              <div class="col-md-6">
                <label class="form-label">
                  {{ paymentType === 'customer' ? 'Customer' : 'Supplier' }}
                  <span class="text-danger">*</span>
                </label>
                <select 
                  v-model="form.party_id" 
                  class="form-select" 
                  required
                  :disabled="isEditMode">
                  <option value="">Select {{ paymentType === 'customer' ? 'Customer' : 'Supplier' }}</option>
                  <option 
                    v-for="party in parties" 
                    :key="party.id" 
                    :value="party.id">
                    {{ party.name }} - {{ party.phone }}
                  </option>
                </select>
              </div>

              <!-- Payment Date -->
              <div class="col-md-6">
                <label class="form-label">Payment Date <span class="text-danger">*</span></label>
                <input 
                  type="date" 
                  v-model="form.date" 
                  class="form-control" 
                  required>
              </div>

              <!-- Payment Method -->
              <div class="col-md-6">
                <label class="form-label">Payment Method <span class="text-danger">*</span></label>
                <select v-model="form.payment_method" class="form-select" required>
                  <option value="cash">💵 Cash (FIFO)</option>
                  <option value="bank">🏦 Bank Transfer</option>
                  <option value="bkash">📱 bKash</option>
                  <option value="nagad">📱 Nagad</option>
                  <option value="rocket">📱 Rocket</option>
                  <option value="upay">📱 Upay</option>
                  <option value="card">💳 Card</option>
                  <option value="cheque">📝 Cheque</option>
                  <option value="others">📋 Others</option>
                </select>
                <div v-if="form.payment_method === 'cash' && form.status === 'completed'" class="form-text text-info">
                  <i class="bi bi-info-circle me-1"></i>
                  Cash payments will be automatically applied using FIFO (oldest invoices first)
                </div>
              </div>

              <!-- Amount -->
              <div class="col-md-6">
                <label class="form-label">Amount <span class="text-danger">*</span></label>
                <input 
                  type="number" 
                  v-model.number="form.amount" 
                  class="form-control" 
                  step="0.01" 
                  min="0.01"
                  required>
              </div>

              <!-- Payment Status -->
              <div class="col-md-6">
                <label class="form-label">Status</label>
                <select v-model="form.status" class="form-select">
                  <option value="completed">✅ Completed</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="failed">❌ Failed</option>
                  <option value="cancelled">🚫 Cancelled</option>
                </select>
              </div>

              <!-- Reference Number (for all methods except cash) -->
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
                  :required="requiresReference">
              </div>

              <!-- Conditional Fields for MFS (bKash, Nagad, Rocket, Upay) -->
              <template v-if="isMFSMethod">
                <div class="col-md-6">
                  <label class="form-label">
                    Mobile Number <span class="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    v-model="form.account_number" 
                    class="form-control"
                    placeholder="01712345678"
                    required>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Account Holder Name</label>
                  <input 
                    type="text" 
                    v-model="form.account_holder_name" 
                    class="form-control"
                    placeholder="Account holder name">
                </div>
              </template>

              <!-- Conditional Fields for Bank Transfer -->
              <template v-if="form.payment_method === 'bank'">
                <div class="col-md-6">
                  <label class="form-label">
                    Bank Name <span class="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    v-model="form.bank_name" 
                    class="form-control"
                    placeholder="e.g., Dutch Bangla Bank"
                    required>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Branch Name</label>
                  <input 
                    type="text" 
                    v-model="form.branch_name" 
                    class="form-control"
                    placeholder="e.g., Dhanmondi Branch">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Account Number</label>
                  <input 
                    type="text" 
                    v-model="form.account_number" 
                    class="form-control"
                    placeholder="Bank account number">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Account Holder Name</label>
                  <input 
                    type="text" 
                    v-model="form.account_holder_name" 
                    class="form-control"
                    placeholder="Account holder name">
                </div>
              </template>

              <!-- Conditional Fields for Cheque -->
              <template v-if="form.payment_method === 'cheque'">
                <div class="col-md-6">
                  <label class="form-label">Bank Name</label>
                  <input 
                    type="text" 
                    v-model="form.bank_name" 
                    class="form-control"
                    placeholder="Bank name">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Branch Name</label>
                  <input 
                    type="text" 
                    v-model="form.branch_name" 
                    class="form-control"
                    placeholder="Branch name">
                </div>
              </template>

              <!-- Notes -->
              <div class="col-12">
                <label class="form-label">Notes</label>
                <textarea 
                  v-model="form.notes" 
                  class="form-control" 
                  rows="3"
                  placeholder="Additional payment notes"></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEditMode ? 'Update Payment' : 'Create Payment' }}
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

const props = defineProps({
  paymentType: {
    type: String,
    required: true,
    validator: (value) => ['customer', 'supplier'].includes(value)
  },
  parties: {
    type: Array,
    default: () => []
  },
  payment: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'close'])

const modalRef = ref(null)
const modalInstance = ref(null)
const loading = ref(false)
const errorMessage = ref('')

const isEditMode = computed(() => !!props.payment)

const form = ref({
  party_id: '',
  date: new Date().toISOString().split('T')[0],
  payment_method: 'cash',
  amount: '',
  status: 'completed',
  reference_number: '',
  account_number: '',
  account_holder_name: '',
  bank_name: '',
  branch_name: '',
  notes: ''
})

// Computed properties
const isMFSMethod = computed(() => {
  return ['bkash', 'nagad', 'rocket', 'upay'].includes(form.value.payment_method)
})

const requiresReference = computed(() => {
  return ['bkash', 'nagad', 'rocket', 'upay', 'bank'].includes(form.value.payment_method)
})

// Helper functions
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

// Reset conditional fields when payment method changes
watch(() => form.value.payment_method, (newMethod, oldMethod) => {
  if (newMethod !== oldMethod) {
    // Clear method-specific fields when switching
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

// Initialize form with payment data if editing
watch(() => props.payment, (newPayment) => {
  if (newPayment) {
    form.value = {
      party_id: props.paymentType === 'customer' ? newPayment.customer : newPayment.supplier,
      date: newPayment.date,
      payment_method: newPayment.payment_method,
      amount: newPayment.amount,
      status: newPayment.status,
      reference_number: newPayment.reference_number || '',
      account_number: newPayment.account_number || '',
      account_holder_name: newPayment.account_holder_name || '',
      bank_name: newPayment.bank_name || '',
      branch_name: newPayment.branch_name || '',
      notes: newPayment.notes || ''
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const payload = {
      [props.paymentType]: form.value.party_id,
      date: form.value.date,
      payment_method: form.value.payment_method,
      amount: form.value.amount,
      status: form.value.status,
      notes: form.value.notes
    }

    // Add conditional fields only if relevant
    if (form.value.reference_number) {
      payload.reference_number = form.value.reference_number
    }
    if (form.value.account_number) {
      payload.account_number = form.value.account_number
    }
    if (form.value.account_holder_name) {
      payload.account_holder_name = form.value.account_holder_name
    }
    if (form.value.bank_name) {
      payload.bank_name = form.value.bank_name
    }
    if (form.value.branch_name) {
      payload.branch_name = form.value.branch_name
    }

    emit('submit', payload, props.payment?.id)
    closeModal()
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to save payment'
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
    status: 'completed',
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
