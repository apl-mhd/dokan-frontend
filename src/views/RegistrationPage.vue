<template>
  <div class="login-container">
    <div class="login-card">
      <div class="text-center mb-4">
        <h1 class="brand-title mb-2">
          <i class="bi bi-shop"></i> Dokan
        </h1>
        <p class="text-muted">Inventory Management System</p>
      </div>

      <div class="card shadow-lg">
        <div class="card-body p-4">
          <h4 class="card-title text-center mb-4">Create Your Account</h4>

          <!-- General error (non-field) -->
          <div v-if="authStore.error" class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>{{ authStore.error }}
            <button type="button" class="btn-close" @click="authStore.error = null"></button>
          </div>

          <form @submit.prevent="handleRegister" class="registration-form">
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label for="phone" class="form-label">
                  <i class="bi bi-telephone me-2"></i>Phone number <span class="text-danger">*</span>
                </label>
                <input v-model="form.phone" type="tel" class="form-control form-control-lg" :class="{ 'is-invalid': fieldError('phone') }" id="phone" placeholder="e.g. 01XXXXXXXXX" required :disabled="authStore.loading" autocomplete="tel" />
                <div v-if="fieldError('phone')" class="invalid-feedback d-block">
                  {{ fieldError('phone') }}
                </div>
              </div>
              <div class="col-md-6">
                <label for="email" class="form-label">
                  <i class="bi bi-envelope me-2"></i>Email <span class="text-muted">(optional)</span>
                </label>
                <input v-model="form.email" type="email" class="form-control form-control-lg" :class="{ 'is-invalid': fieldError('email') }" id="email" placeholder="your@email.com" :disabled="authStore.loading" autocomplete="email" />
                <div v-if="fieldError('email')" class="invalid-feedback d-block">
                  {{ fieldError('email') }}
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label for="business_name" class="form-label">
                <i class="bi bi-building me-2"></i>Business name <span class="text-danger">*</span>
              </label>
              <input v-model="form.business_name" type="text" class="form-control form-control-lg" :class="{ 'is-invalid': fieldError('business_name') || fieldError('name') }" id="business_name" placeholder="Your shop or business name" required :disabled="authStore.loading" autocomplete="organization" />
              <div v-if="fieldError('business_name') || fieldError('name')" class="invalid-feedback d-block">
                {{ fieldError('business_name') || fieldError('name') }}
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label for="password" class="form-label">
                  <i class="bi bi-lock me-2"></i>Password <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="form-control form-control-lg" :class="{ 'is-invalid': fieldError('password') || localErrors.password }" id="password" placeholder="Choose a password" required :disabled="authStore.loading" autocomplete="new-password" />
                  <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword" :disabled="authStore.loading" tabindex="-1">
                    <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                </div>
                <div v-if="fieldError('password') || localErrors.password" class="invalid-feedback d-block">
                  {{ fieldError('password') || localErrors.password }}
                </div>
              </div>
              <div class="col-md-6">
                <label for="confirm_password" class="form-label">
                  <i class="bi bi-lock-fill me-2"></i>Confirm password <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input v-model="form.confirm_password" :type="showConfirmPassword ? 'text' : 'password'" class="form-control form-control-lg" :class="{ 'is-invalid': localErrors.confirm_password }" id="confirm_password" placeholder="Confirm your password" required :disabled="authStore.loading" autocomplete="new-password" />
                  <button class="btn btn-outline-secondary" type="button" @click="showConfirmPassword = !showConfirmPassword" :disabled="authStore.loading" tabindex="-1">
                    <i class="bi" :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                </div>
                <div v-if="localErrors.confirm_password" class="invalid-feedback d-block">
                  {{ localErrors.confirm_password }}
                </div>
              </div>
            </div>

            <div class="d-grid">
              <button type="submit" class="btn btn-primary btn-lg" :disabled="authStore.loading">
                <span v-if="authStore.loading">
                  <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Creating account...
                </span>
                <span v-else>
                  <i class="bi bi-person-plus me-2"></i>Register
                </span>
              </button>
            </div>
          </form>

          <div class="text-center mt-4">
            <span class="text-muted">Already have an account?</span>
            <router-link to="/login" class="ms-2 fw-semibold">Login</router-link>
          </div>
        </div>
      </div>

      <div class="text-center mt-3">
        <small class="text-muted">
          © 2025 Dokan Inventory System
        </small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  phone: '',
  email: '',
  business_name: '',
  password: '',
  confirm_password: ''
})

const fieldErrors = ref(null)
const localErrors = reactive({ password: '', confirm_password: '' })
const showPassword = ref(false)
const showConfirmPassword = ref(false)

function fieldError(field) {
  if (!fieldErrors.value || !fieldErrors.value[field]) return ''
  const msg = fieldErrors.value[field]
  return Array.isArray(msg) ? msg[0] : msg
}

function validateForm() {
  localErrors.password = ''
  localErrors.confirm_password = ''
  if (!form.password) {
    localErrors.password = 'Password is required.'
    return false
  }
  if (form.password !== form.confirm_password) {
    localErrors.confirm_password = 'Passwords do not match.'
    return false
  }
  return true
}

const handleRegister = async () => {
  fieldErrors.value = null
  authStore.error = null
  localErrors.password = ''
  localErrors.confirm_password = ''

  if (!validateForm()) return

  try {
    await authStore.register({
      phone: form.phone.trim(),
      email: form.email.trim(),
      business_name: form.business_name.trim(),
      password: form.password
    })
    router.push({ name: 'Login', query: { registered: '1' } })
  } catch (err) {
    const data = err.response?.data
    if (data && typeof data === 'object' && !data.detail) {
      fieldErrors.value = data
    } else {
      authStore.error = data?.detail || 'Registration failed. Please try again.'
    }
    console.error('Registration failed:', err)
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 560px;
}

.brand-title {
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.brand-title i {
  font-size: 2.2rem;
}

.card {
  border: none;
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.card-body {
  padding: 2rem;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback.d-block {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  background: linear-gradient(135deg, #5568d3 0%, #6a3f8c 100%);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.input-group .btn-outline-secondary {
  border-color: #ced4da;
}

.input-group .btn-outline-secondary:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

@media (max-width: 576px) {
  .brand-title {
    font-size: 2rem;
  }

  .card-body {
    padding: 1.5rem;
  }
}
</style>
