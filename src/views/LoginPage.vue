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
          <h4 class="card-title text-center mb-4">Login to Your Account</h4>

          <!-- Error Alert -->
          <div v-if="authStore.error" class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>{{ authStore.error }}
            <button type="button" class="btn-close" @click="authStore.error = null"></button>
          </div>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="username" class="form-label">
                <i class="bi bi-person me-2"></i>Username
              </label>
              <input v-model="credentials.username" type="text" class="form-control form-control-lg" id="username" placeholder="Enter your username" required :disabled="authStore.loading" autocomplete="username" />
            </div>

            <div class="mb-4">
              <label for="password" class="form-label">
                <i class="bi bi-lock me-2"></i>Password
              </label>
              <div class="input-group">
                <input v-model="credentials.password" :type="showPassword ? 'text' : 'password'" class="form-control form-control-lg" id="password" placeholder="Enter your password" required :disabled="authStore.loading" autocomplete="current-password" />
                <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword" :disabled="authStore.loading" tabindex="-1">
                  <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
              </div>
            </div>

            <div class="d-grid">
              <button type="submit" class="btn btn-primary btn-lg" :disabled="authStore.loading">
                <span v-if="authStore.loading">
                  <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Logging in...
                </span>
                <span v-else>
                  <i class="bi bi-box-arrow-in-right me-2"></i>Login
                </span>
              </button>
            </div>
          </form>

          <div class="text-center mt-4">
            <span class="text-muted">Don't have an account?</span>
            <router-link to="/register" class="ms-2 fw-semibold">Register</router-link>
          </div>
          <div class="text-center mt-2">
            <small class="text-muted">
              Demo: <strong>admin</strong> / <strong>admin123</strong>
            </small>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const credentials = ref({
  username: '',
  password: ''
})

const showPassword = ref(false)

const handleLogin = async () => {
  try {
    await authStore.login(credentials.value)
    // Redirect to dashboard on success
    router.push('/')
  } catch (error) {
    // Error is already handled in the store
    console.error('Login failed:', error)
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
  max-width: 450px;
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

