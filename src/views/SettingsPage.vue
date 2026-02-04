<template>
  <div class="settings-page">
    <PageHeader title="Settings" icon="bi-gear" />

    <div class="settings-container">
      <!-- 1. User / Profile section (first) -->
      <section class="settings-section">
        <div class="settings-section__header">
          <div class="settings-section__icon settings-section__icon--user">
            <i class="bi bi-person"></i>
          </div>
          <div>
            <h2 class="settings-section__title">Profile</h2>
            <p class="settings-section__desc">Update your account details and password.</p>
          </div>
        </div>
        <div class="settings-section__body">
          <div v-if="profileError" class="settings-alert settings-alert--error">
            <i class="bi bi-exclamation-circle me-2"></i>{{ profileError }}
            <button type="button" class="settings-alert__close" @click="profileError = null" aria-label="Close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div v-if="profileSuccess" class="settings-alert settings-alert--success">
            <i class="bi bi-check-circle me-2"></i>{{ profileSuccess }}
            <button type="button" class="settings-alert__close" @click="profileSuccess = null" aria-label="Close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <form @submit.prevent="saveProfile" class="settings-form">
            <div class="settings-form__row">
              <div class="settings-field">
                <label class="settings-label">Username</label>
                <input v-model="profile.username" type="text" class="settings-input" :class="{ 'settings-input--invalid': profileErrors.username }" placeholder="Username" required />
                <p v-if="profileErrors.username" class="settings-error">
                  {{ Array.isArray(profileErrors.username) ? profileErrors.username[0] : profileErrors.username }}
                </p>
              </div>
              <div class="settings-field">
                <label class="settings-label">Email</label>
                <input v-model="profile.email" type="email" class="settings-input" :class="{ 'settings-input--invalid': profileErrors.email }" placeholder="you@example.com" />
                <p v-if="profileErrors.email" class="settings-error">
                  {{ Array.isArray(profileErrors.email) ? profileErrors.email[0] : profileErrors.email }}
                </p>
              </div>
            </div>
            <div class="settings-form__row">
              <div class="settings-field">
                <label class="settings-label">First name</label>
                <input v-model="profile.first_name" type="text" class="settings-input" placeholder="First name" />
              </div>
              <div class="settings-field">
                <label class="settings-label">Last name</label>
                <input v-model="profile.last_name" type="text" class="settings-input" placeholder="Last name" />
              </div>
            </div>
            <button type="submit" class="settings-btn settings-btn--primary" :disabled="profileSaving">
              <span v-if="profileSaving" class="settings-spinner"></span>
              <span v-else><i class="bi bi-check2 me-2"></i>Save profile</span>
            </button>
          </form>

          <div class="settings-divider">
            <span>Change password</span>
          </div>

          <div v-if="passwordError" class="settings-alert settings-alert--error">
            <i class="bi bi-exclamation-circle me-2"></i>{{ passwordError }}
            <button type="button" class="settings-alert__close" @click="passwordError = null" aria-label="Close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div v-if="passwordSuccess" class="settings-alert settings-alert--success">
            <i class="bi bi-check-circle me-2"></i>{{ passwordSuccess }}
            <button type="button" class="settings-alert__close" @click="passwordSuccess = null" aria-label="Close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <form @submit.prevent="changePassword" class="settings-form">
            <div class="settings-form__row">
              <div class="settings-field">
                <label class="settings-label">Current password</label>
                <input v-model="passwordForm.old_password" type="password" class="settings-input" :class="{ 'settings-input--invalid': passwordErrors.old_password }" placeholder="Current password" />
                <p v-if="passwordErrors.old_password" class="settings-error">
                  {{ Array.isArray(passwordErrors.old_password) ? passwordErrors.old_password[0] : passwordErrors.old_password }}
                </p>
              </div>
              <div class="settings-field">
                <label class="settings-label">New password</label>
                <input v-model="passwordForm.new_password" type="password" class="settings-input" :class="{ 'settings-input--invalid': passwordErrors.new_password }" placeholder="New password" />
                <p v-if="passwordErrors.new_password" class="settings-error">
                  {{ Array.isArray(passwordErrors.new_password) ? passwordErrors.new_password[0] : passwordErrors.new_password }}
                </p>
              </div>
            </div>
            <div class="settings-field settings-field--half">
              <label class="settings-label">Confirm new password</label>
              <input v-model="passwordForm.confirm_password" type="password" class="settings-input" :class="{ 'settings-input--invalid': passwordConfirmError }" placeholder="Confirm new password" />
              <p v-if="passwordConfirmError" class="settings-error">{{ passwordConfirmError }}</p>
            </div>
            <button type="submit" class="settings-btn settings-btn--secondary" :disabled="passwordSaving">
              <span v-if="passwordSaving" class="settings-spinner settings-spinner--secondary"></span>
              <span v-else><i class="bi bi-key me-2"></i>Change password</span>
            </button>
          </form>
        </div>
      </section>

      <!-- 2. Company section (second) -->
      <section class="settings-section">
        <div class="settings-section__header">
          <div class="settings-section__icon settings-section__icon--company">
            <i class="bi bi-building"></i>
          </div>
          <div>
            <h2 class="settings-section__title">Company</h2>
            <p class="settings-section__desc">Update your business details.</p>
          </div>
        </div>
        <div class="settings-section__body">
          <div v-if="companyLoading && !company.id" class="settings-loading">
            <span class="settings-spinner settings-spinner--lg"></span>
            <span>Loading company…</span>
          </div>
          <template v-else-if="company.id">
            <div v-if="companyError" class="settings-alert settings-alert--error">
              <i class="bi bi-exclamation-circle me-2"></i>{{ companyError }}
              <button type="button" class="settings-alert__close" @click="companyError = null" aria-label="Close">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div v-if="companySuccess" class="settings-alert settings-alert--success">
              <i class="bi bi-check-circle me-2"></i>{{ companySuccess }}
              <button type="button" class="settings-alert__close" @click="companySuccess = null" aria-label="Close">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <form @submit.prevent="saveCompany" class="settings-form">
              <div class="settings-form__row">
                <div class="settings-field">
                  <label class="settings-label">Business name</label>
                  <input v-model="company.name" type="text" class="settings-input" :class="{ 'settings-input--invalid': companyErrors.name }" placeholder="Your business name" required />
                  <p v-if="companyErrors.name" class="settings-error">
                    {{ Array.isArray(companyErrors.name) ? companyErrors.name[0] : companyErrors.name }}
                  </p>
                </div>
                <div class="settings-field">
                  <label class="settings-label">Phone</label>
                  <input v-model="company.phone" type="text" class="settings-input" :class="{ 'settings-input--invalid': companyErrors.phone }" placeholder="Phone number" required />
                  <p v-if="companyErrors.phone" class="settings-error">
                    {{ Array.isArray(companyErrors.phone) ? companyErrors.phone[0] : companyErrors.phone }}
                  </p>
                </div>
              </div>
              <div class="settings-field">
                <label class="settings-label">Email</label>
                <input v-model="company.email" type="email" class="settings-input" placeholder="business@example.com" />
              </div>
              <div class="settings-field">
                <label class="settings-label">Address</label>
                <textarea v-model="company.address" class="settings-input settings-input--textarea" rows="2" placeholder="Address"></textarea>
              </div>
              <div class="settings-field">
                <label class="settings-label">Website</label>
                <input v-model="company.website" type="url" class="settings-input" placeholder="https://..." />
              </div>
              <button type="submit" class="settings-btn settings-btn--primary" :disabled="companySaving">
                <span v-if="companySaving" class="settings-spinner"></span>
                <span v-else><i class="bi bi-check2 me-2"></i>Save company</span>
              </button>
            </form>
          </template>
          <div v-else class="settings-empty">
            <i class="bi bi-building me-2"></i>No company associated with your account.
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import PageHeader from "../components/common/PageHeader.vue";
import { profileApi } from "../api/profile.api.js";

const profile = reactive({
  username: "",
  email: "",
  first_name: "",
  last_name: "",
});
const profileErrors = ref({});
const profileError = ref(null);
const profileSuccess = ref(null);
const profileSaving = ref(false);

const passwordForm = reactive({
  old_password: "",
  new_password: "",
  confirm_password: "",
});
const passwordErrors = ref({});
const passwordError = ref(null);
const passwordSuccess = ref(null);
const passwordSaving = ref(false);

const company = reactive({
  id: null,
  name: "",
  phone: "",
  email: "",
  address: "",
  website: "",
  is_active: true,
});
const companyErrors = ref({});
const companyError = ref(null);
const companySuccess = ref(null);
const companySaving = ref(false);
const companyLoading = ref(true);

const passwordConfirmError = ref("");

function setProfile(data) {
  profile.username = data.username ?? "";
  profile.email = data.email ?? "";
  profile.first_name = data.first_name ?? "";
  profile.last_name = data.last_name ?? "";
}

function setCompany(data) {
  company.id = data.id;
  company.name = data.name ?? "";
  company.phone = data.phone ?? "";
  company.email = data.email ?? "";
  company.address = data.address ?? "";
  company.website = data.website ?? "";
  company.is_active = data.is_active ?? true;
}

async function loadProfile() {
  try {
    const res = await profileApi.getProfile();
    setProfile(res.data);
  } catch (err) {
    profileError.value = err.response?.data?.detail || "Failed to load profile.";
  }
}

async function loadCompany() {
  companyLoading.value = true;
  companyError.value = null;
  try {
    const res = await profileApi.getCurrentCompany();
    setCompany(res.data);
  } catch (err) {
    if (err.response?.status === 404) {
      company.id = null;
    } else {
      companyError.value = err.response?.data?.detail || "Failed to load company.";
    }
  } finally {
    companyLoading.value = false;
  }
}

async function saveProfile() {
  profileErrors.value = {};
  profileError.value = null;
  profileSuccess.value = null;
  profileSaving.value = true;
  try {
    const res = await profileApi.updateProfile({
      username: profile.username.trim(),
      email: profile.email.trim() || undefined,
      first_name: profile.first_name.trim(),
      last_name: profile.last_name.trim(),
    });
    setProfile(res.data);
    profileSuccess.value = "Profile updated.";
  } catch (err) {
    if (err.response?.data && typeof err.response.data === "object" && !err.response.data.detail) {
      profileErrors.value = err.response.data;
    } else {
      profileError.value = err.response?.data?.detail || "Failed to update profile.";
    }
  } finally {
    profileSaving.value = false;
  }
}

function validatePasswordForm() {
  passwordConfirmError.value = "";
  if (!passwordForm.new_password) return false;
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    passwordConfirmError.value = "Passwords do not match.";
    return false;
  }
  return true;
}

async function changePassword() {
  passwordErrors.value = {};
  passwordError.value = null;
  passwordSuccess.value = null;
  passwordConfirmError.value = "";
  if (!validatePasswordForm()) return;

  passwordSaving.value = true;
  try {
    await profileApi.changePassword(passwordForm.old_password, passwordForm.new_password);
    passwordSuccess.value = "Password updated.";
    passwordForm.old_password = "";
    passwordForm.new_password = "";
    passwordForm.confirm_password = "";
  } catch (err) {
    if (err.response?.data && typeof err.response.data === "object" && !err.response.data.detail) {
      passwordErrors.value = err.response.data;
    } else {
      passwordError.value = err.response?.data?.detail || "Failed to change password.";
    }
  } finally {
    passwordSaving.value = false;
  }
}

async function saveCompany() {
  companyErrors.value = {};
  companyError.value = null;
  companySuccess.value = null;
  companySaving.value = true;
  try {
    const res = await profileApi.updateCurrentCompany({
      name: company.name.trim(),
      phone: company.phone.trim(),
      email: company.email?.trim() || "",
      address: company.address?.trim() || "",
      website: company.website?.trim() || "",
    });
    setCompany(res.data);
    companySuccess.value = "Company updated.";
  } catch (err) {
    if (err.response?.data && typeof err.response.data === "object" && !err.response.data.detail) {
      companyErrors.value = err.response.data;
    } else {
      companyError.value = err.response?.data?.detail || "Failed to update company.";
    }
  } finally {
    companySaving.value = false;
  }
}

onMounted(() => {
  loadProfile();
  loadCompany();
});
</script>

<style scoped>
.settings-page {
  max-width: 720px;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.settings-section {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.settings-section__header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: #fafafa;
  border-bottom: 1px solid #f3f4f6;
}

.settings-section__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.settings-section__icon--user {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
}

.settings-section__icon--company {
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
  color: #fff;
}

.settings-section__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem;
}

.settings-section__desc {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.settings-section__body {
  padding: 1.5rem;
}

.settings-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.settings-alert--error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.settings-alert--success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.settings-alert__close {
  margin-left: auto;
  padding: 0.25rem;
  background: none;
  border: none;
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
  border-radius: 6px;
  line-height: 1;
}

.settings-alert__close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.06);
}

.settings-form {
  margin-bottom: 0;
}

.settings-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 576px) {
  .settings-form__row {
    grid-template-columns: 1fr;
  }
}

.settings-field {
  min-width: 0;
}

.settings-field--half {
  max-width: 50%;
}

@media (max-width: 576px) {
  .settings-field--half {
    max-width: 100%;
  }
}

.settings-field:not(:last-child) {
  margin-bottom: 0;
}

.settings-form .settings-field {
  margin-bottom: 1rem;
}

.settings-form__row .settings-field {
  margin-bottom: 0;
}

.settings-form__row + .settings-btn,
.settings-form .settings-field + .settings-btn {
  margin-top: 0.5rem;
}

.settings-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}

.settings-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #1f2937;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.settings-input::placeholder {
  color: #9ca3af;
}

.settings-input:hover:not(:disabled) {
  background: #fff;
  border-color: #d1d5db;
}

.settings-input:focus {
  outline: none;
  background: #fff;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.settings-input--invalid {
  border-color: #f87171;
  background: #fff;
}

.settings-input--textarea {
  resize: vertical;
  min-height: 60px;
}

.settings-error {
  font-size: 0.8125rem;
  color: #dc2626;
  margin: 0.375rem 0 0;
}

.settings-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.75rem 0 1.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b7280;
}

.settings-divider::before,
.settings-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.settings-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
}

.settings-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.settings-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.settings-btn--primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
}

.settings-btn--primary:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.settings-btn--secondary {
  background: #fff;
  color: #6366f1;
  border: 1px solid #6366f1;
}

.settings-btn--secondary:hover:not(:disabled) {
  background: #f5f3ff;
}

.settings-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: settings-spin 0.7s linear infinite;
}

.settings-spinner--lg {
  width: 1.5rem;
  height: 1.5rem;
  border-width: 2px;
}

.settings-btn--secondary .settings-spinner--secondary {
  border-color: rgba(99, 102, 241, 0.25);
  border-top-color: #6366f1;
}

@keyframes settings-spin {
  to {
    transform: rotate(360deg);
  }
}

.settings-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #6b7280;
  font-size: 0.9375rem;
}

.settings-empty {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.9375rem;
}
</style>
