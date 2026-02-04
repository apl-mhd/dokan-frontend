<template>
  <div class="reg-page">
    <div class="reg-page__card">
      <header class="reg-header">
        <div class="reg-header__icon">
          <i class="bi bi-shop"></i>
        </div>
        <h1 class="reg-header__title">Dokan</h1>
        <p class="reg-header__subtitle">Inventory Management System</p>
      </header>

      <div class="reg-box">
        <div class="reg-box__inner">
          <h2 class="reg-form-title">Create your account</h2>
          <p class="reg-form-desc">Get started with your business in a few steps.</p>

          <div v-if="authStore.error" class="reg-alert reg-alert--error" role="alert">
            <i class="bi bi-exclamation-circle me-2"></i>
            <span>{{ authStore.error }}</span>
            <button type="button" class="reg-alert__close" @click="authStore.error = null" aria-label="Close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <form @submit.prevent="handleRegister" class="reg-form">
            <div class="reg-row">
              <div class="reg-field">
                <label for="phone" class="reg-label">Phone number <span class="reg-required">*</span></label>
                <div class="reg-input-wrap">
                  <i class="bi bi-telephone reg-input-icon"></i>
                  <input v-model="form.phone" type="tel" class="reg-input" :class="{ 'reg-input--invalid': fieldError('phone') }" id="phone" placeholder="01XXXXXXXXX" required :disabled="authStore.loading" autocomplete="tel" />
                </div>
                <p v-if="fieldError('phone')" class="reg-error">{{ fieldError('phone') }}</p>
              </div>
              <div class="reg-field">
                <label for="email" class="reg-label">Email <span class="reg-optional">(optional)</span></label>
                <div class="reg-input-wrap">
                  <i class="bi bi-envelope reg-input-icon"></i>
                  <input v-model="form.email" type="email" class="reg-input" :class="{ 'reg-input--invalid': fieldError('email') }" id="email" placeholder="you@example.com" :disabled="authStore.loading" autocomplete="email" />
                </div>
                <p v-if="fieldError('email')" class="reg-error">{{ fieldError('email') }}</p>
              </div>
            </div>

            <div class="reg-field reg-field--full">
              <label for="business_name" class="reg-label">Business name <span class="reg-required">*</span></label>
              <div class="reg-input-wrap">
                <i class="bi bi-building reg-input-icon"></i>
                <input v-model="form.business_name" type="text" class="reg-input" :class="{ 'reg-input--invalid': fieldError('business_name') || fieldError('name') }" id="business_name" placeholder="Your shop or business name" required :disabled="authStore.loading" autocomplete="organization" />
              </div>
              <p v-if="fieldError('business_name') || fieldError('name')" class="reg-error">
                {{ fieldError('business_name') || fieldError('name') }}
              </p>
            </div>

            <div class="reg-row">
              <div class="reg-field">
                <label for="password" class="reg-label">Password <span class="reg-required">*</span></label>
                <div class="reg-input-wrap">
                  <i class="bi bi-lock reg-input-icon"></i>
                  <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="reg-input" :class="{ 'reg-input--invalid': fieldError('password') || localErrors.password }" id="password" placeholder="Choose a password" required :disabled="authStore.loading" autocomplete="new-password" />
                  <button type="button" class="reg-input-toggle" @click="showPassword = !showPassword" :disabled="authStore.loading" tabindex="-1" :aria-label="showPassword ? 'Hide password' : 'Show password'">
                    <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                </div>
                <p v-if="fieldError('password') || localErrors.password" class="reg-error">
                  {{ fieldError('password') || localErrors.password }}
                </p>
              </div>
              <div class="reg-field">
                <label for="confirm_password" class="reg-label">Confirm password <span class="reg-required">*</span></label>
                <div class="reg-input-wrap">
                  <i class="bi bi-lock-fill reg-input-icon"></i>
                  <input v-model="form.confirm_password" :type="showConfirmPassword ? 'text' : 'password'" class="reg-input" :class="{ 'reg-input--invalid': localErrors.confirm_password }" id="confirm_password" placeholder="Confirm password" required :disabled="authStore.loading" autocomplete="new-password" />
                  <button type="button" class="reg-input-toggle" @click="showConfirmPassword = !showConfirmPassword" :disabled="authStore.loading" tabindex="-1" :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'">
                    <i class="bi" :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                </div>
                <p v-if="localErrors.confirm_password" class="reg-error">{{ localErrors.confirm_password }}</p>
              </div>
            </div>

            <button type="submit" class="reg-submit" :disabled="authStore.loading">
              <span v-if="authStore.loading" class="reg-submit__loading">
                <span class="reg-spinner" aria-hidden="true"></span>
                Creating account...
              </span>
              <span v-else class="reg-submit__text">
                <i class="bi bi-person-plus-fill me-2"></i>Create account
              </span>
            </button>
          </form>

          <div class="reg-footer">
            <span class="reg-footer__text">Already have an account?</span>
            <router-link to="/login" class="reg-footer__link">Sign in</router-link>
          </div>
        </div>
      </div>

      <footer class="reg-copy">
        © 2025 Dokan
      </footer>
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
    // Auto-login with the same credentials
    await authStore.login({
      username: form.phone.trim(),
      password: form.password
    })
    router.push('/')
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
.reg-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(160deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%);
  background-attachment: fixed;
}

.reg-page__card {
  width: 100%;
  max-width: 520px;
}

/* Header */
.reg-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.reg-header__icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.reg-header__icon i {
  font-size: 1.75rem;
  color: #fff;
}

.reg-header__title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
  margin: 0 0 0.25rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.reg-header__subtitle {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  font-weight: 400;
}

/* Form box */
.reg-box {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.reg-box__inner {
  padding: 2rem 1.75rem;
}

.reg-form-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem;
  letter-spacing: -0.01em;
}

.reg-form-desc {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1.5rem;
}

/* Alert */
.reg-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
  position: relative;
}

.reg-alert--error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.reg-alert__close {
  margin-left: auto;
  padding: 0.25rem;
  background: none;
  border: none;
  color: inherit;
  opacity: 0.8;
  cursor: pointer;
  border-radius: 6px;
  line-height: 1;
}

.reg-alert__close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.06);
}

/* Form layout */
.reg-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.reg-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 576px) {
  .reg-row {
    grid-template-columns: 1fr;
  }
}

.reg-field {
  min-width: 0;
}

.reg-field--full {
  grid-column: 1 / -1;
}

.reg-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}

.reg-required {
  color: #dc2626;
}

.reg-optional {
  font-weight: 400;
  color: #9ca3af;
}

/* Input */
.reg-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.reg-input-icon {
  position: absolute;
  left: 1rem;
  font-size: 1rem;
  color: #9ca3af;
  pointer-events: none;
  z-index: 1;
  transition: color 0.2s ease;
}

.reg-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.75rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #1f2937;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.reg-input::placeholder {
  color: #9ca3af;
}

.reg-input:hover:not(:disabled) {
  background: #fff;
  border-color: #d1d5db;
}

.reg-input:focus {
  outline: none;
  background: #fff;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.reg-input-wrap:focus-within .reg-input-icon {
  color: #6366f1;
}

.reg-input--invalid {
  border-color: #f87171;
  background: #fff;
}

.reg-input--invalid:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.reg-input-toggle {
  position: absolute;
  right: 0.5rem;
  padding: 0.375rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease, background 0.2s ease;
}

.reg-input-toggle:hover:not(:disabled) {
  color: #374151;
  background: #f3f4f6;
}

.reg-input-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reg-input-wrap .reg-input {
  padding-right: 2.75rem;
}

.reg-error {
  font-size: 0.8125rem;
  color: #dc2626;
  margin: 0.375rem 0 0;
}

/* Submit */
.reg-submit {
  width: 100%;
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.reg-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
}

.reg-submit:active:not(:disabled) {
  transform: translateY(0);
}

.reg-submit:disabled {
  opacity: 0.75;
  cursor: not-allowed;
  transform: none;
}

.reg-submit__loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.reg-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: reg-spin 0.7s linear infinite;
}

@keyframes reg-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Footer link */
.reg-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.reg-footer__text {
  font-size: 0.875rem;
  color: #6b7280;
}

.reg-footer__link {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6366f1;
  text-decoration: none;
  transition: color 0.2s ease;
}

.reg-footer__link:hover {
  color: #4f46e5;
}

.reg-copy {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 576px) {
  .reg-header__title {
    font-size: 1.75rem;
  }

  .reg-box__inner {
    padding: 1.5rem 1.25rem;
  }
}
</style>
