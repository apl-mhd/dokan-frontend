<template>
  <div class="settings-page">
    <PageHeader title="Settings" icon="bi-gear" />

    <div class="settings-container">
      <!-- User section -->
      <section class="settings-section">
        <div class="settings-section__header settings-section__header--with-action">
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <div class="settings-section__icon settings-section__icon--user">
              <i class="bi bi-person"></i>
            </div>
            <div>
              <h2 class="settings-section__title">Users</h2>
              <p class="settings-section__desc">Manage company users.</p>
            </div>
          </div>
          <button v-if="company.id" type="button" class="settings-btn settings-btn--primary" @click="openCreateUserModal">
            <i class="bi bi-person-plus me-2"></i>Add user
          </button>
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

          <div class="settings-table-wrap">
            <table class="settings-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>First name</th>
                  <th>Last name</th>
                  <th>Status</th>
                  <th class="settings-table__actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="companyUsersLoading" key="loading">
                  <td colspan="7" class="text-muted text-center py-4">Loading users…</td>
                </tr>
                <tr v-else-if="!company.id" key="no-company">
                  <td colspan="7" class="text-muted text-center py-4">No company. Create one to manage users.</td>
                </tr>
                <tr v-else-if="companyUsers.length === 0" key="no-users">
                  <td colspan="7" class="text-muted text-center py-4">No users in this company yet. Add a user above.</td>
                </tr>
                <tr v-else v-for="u in companyUsers" :key="u.id" class="settings-table__row" @click="openUserModal(u)">
                  <td>{{ u.username || "—" }}</td>
                  <td>{{ u.email || "—" }}</td>
                  <td>{{ u.phone || "—" }}</td>
                  <td>{{ u.first_name || "—" }}</td>
                  <td>{{ u.last_name || "—" }}</td>
                  <td @click.stop>
                    <span class="settings-badge" :class="u.is_active ? 'settings-badge--active' : 'settings-badge--inactive'">
                      {{ u.is_active ? "Active" : "Inactive" }}
                    </span>
                  </td>
                  <td class="settings-table__actions">
                    <button type="button" class="settings-btn settings-btn--sm settings-btn--secondary me-2" @click.stop="openUserModal(u)" title="Edit user" aria-label="Edit user">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <template v-if="u.user_id !== profile.id">
                      <button type="button" class="settings-btn settings-btn--sm settings-btn--danger" :disabled="companyUserActionLoading" @click.stop="removeCompanyUser(u)" title="Remove from company" aria-label="Remove from company">
                        <i class="bi bi-trash"></i>
                      </button>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- User Edit Modal -->
          <div class="modal fade" tabindex="-1" aria-hidden="true" ref="userModalRef">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Edit user</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <form @submit.prevent="saveUserFromModal" id="user-modal-form">
                    <div class="row g-3">
                      <div class="col-12">
                        <label class="form-label">Username</label>
                        <input v-model="userModalForm.username" type="text" class="form-control" :class="{ 'is-invalid': profileErrors.username }" placeholder="Username" />
                        <div v-if="profileErrors.username" class="invalid-feedback d-block">
                          {{ Array.isArray(profileErrors.username) ? profileErrors.username[0] : profileErrors.username }}
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Email <span class="text-muted">(optional)</span></label>
                        <input v-model="userModalForm.email" type="email" class="form-control" :class="{ 'is-invalid': profileErrors.email }" placeholder="you@example.com" />
                        <div v-if="profileErrors.email" class="invalid-feedback d-block">
                          {{ Array.isArray(profileErrors.email) ? profileErrors.email[0] : profileErrors.email }}
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Phone <span class="text-muted">(optional)</span></label>
                        <input v-model="userModalForm.phone" type="tel" class="form-control" :class="{ 'is-invalid': profileErrors.phone }" placeholder="Phone number" />
                        <div v-if="profileErrors.phone" class="invalid-feedback d-block">
                          {{ Array.isArray(profileErrors.phone) ? profileErrors.phone[0] : profileErrors.phone }}
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">First name</label>
                        <input v-model="userModalForm.first_name" type="text" class="form-control" placeholder="First name" />
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Last name</label>
                        <input v-model="userModalForm.last_name" type="text" class="form-control" placeholder="Last name" />
                      </div>

                      <div class="col-12">
                        <div class="form-check form-switch">
                          <input id="user-active-switch" v-model="userModalForm.is_active" class="form-check-input" type="checkbox" />
                          <label class="form-check-label" for="user-active-switch">Active</label>
                        </div>
                      </div>

                      <div v-if="editingUserId !== profile.id" class="col-12">
                        <label class="form-label">New password <span class="text-muted">(optional)</span></label>
                        <input v-model="userModalForm.new_password" type="password" class="form-control" placeholder="Set a new password" />
                        <div class="form-text">Leave blank to keep the current password.</div>
                      </div>
                    </div>
                  </form>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" form="user-modal-form" class="btn btn-primary" :disabled="profileSaving">
                    <span v-if="profileSaving" class="spinner-border spinner-border-sm me-2"></span>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Create User Modal -->
          <div class="modal fade" tabindex="-1" aria-hidden="true" ref="createUserModalRef">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Add user</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div v-if="createUserError" class="alert alert-danger py-2 mb-3">{{ createUserError }}</div>
                  <form @submit.prevent="saveCreateUser" id="create-user-form">
                    <div class="row g-3">
                      <div class="col-12">
                        <label class="form-label">Username <span class="text-danger">*</span></label>
                        <input v-model="createUserForm.username" type="text" class="form-control" :class="{ 'is-invalid': createUserErrors.username }" placeholder="Username" />
                        <div v-if="createUserErrors.username" class="invalid-feedback d-block">
                          {{ Array.isArray(createUserErrors.username) ? createUserErrors.username[0] : createUserErrors.username }}
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Email <span class="text-muted">(optional)</span></label>
                        <input v-model="createUserForm.email" type="email" class="form-control" :class="{ 'is-invalid': createUserErrors.email }" placeholder="you@example.com" />
                        <div v-if="createUserErrors.email" class="invalid-feedback d-block">
                          {{ Array.isArray(createUserErrors.email) ? createUserErrors.email[0] : createUserErrors.email }}
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Phone <span class="text-muted">(optional)</span></label>
                        <input v-model="createUserForm.phone" type="tel" class="form-control" :class="{ 'is-invalid': createUserErrors.phone }" placeholder="Phone number" />
                        <div v-if="createUserErrors.phone" class="invalid-feedback d-block">
                          {{ Array.isArray(createUserErrors.phone) ? createUserErrors.phone[0] : createUserErrors.phone }}
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">First name</label>
                        <input v-model="createUserForm.first_name" type="text" class="form-control" placeholder="First name" />
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Last name</label>
                        <input v-model="createUserForm.last_name" type="text" class="form-control" placeholder="Last name" />
                      </div>
                      <div class="col-12">
                        <label class="form-label">Password <span class="text-danger">*</span></label>
                        <input v-model="createUserForm.password" type="password" class="form-control" :class="{ 'is-invalid': createUserErrors.password }" placeholder="Password" />
                        <div v-if="createUserErrors.password" class="invalid-feedback d-block">
                          {{ Array.isArray(createUserErrors.password) ? createUserErrors.password[0] : createUserErrors.password }}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" form="create-user-form" class="btn btn-primary" :disabled="createUserSaving">
                    <span v-if="createUserSaving" class="spinner-border spinner-border-sm me-2"></span>
                    Create user
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Company section (minimal update form) -->
      <section class="settings-section">
        <div class="settings-section__header">
          <div class="d-flex align-items-center gap-3">
            <div class="settings-section__icon settings-section__icon--company">
              <i class="bi bi-building"></i>
            </div>
            <div>
              <h2 class="settings-section__title">Company</h2>
              <p class="settings-section__desc">Update company details.</p>
            </div>
          </div>
        </div>
        <div class="settings-section__body">
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

          <form class="settings-form" @submit.prevent="saveCompany">
            <div class="settings-form__grid">
              <div class="settings-field">
                <label class="settings-label">Name</label>
                <input v-model="company.name" type="text" class="settings-input" :class="{ 'settings-input--invalid': companyErrors.name }" placeholder="Business name" required />
                <p v-if="companyErrors.name" class="settings-error">{{ Array.isArray(companyErrors.name) ? companyErrors.name[0] : companyErrors.name }}</p>
              </div>
              <div class="settings-field">
                <label class="settings-label">Phone</label>
                <input v-model="company.phone" type="text" class="settings-input" :class="{ 'settings-input--invalid': companyErrors.phone }" placeholder="Phone number" required />
                <p v-if="companyErrors.phone" class="settings-error">{{ Array.isArray(companyErrors.phone) ? companyErrors.phone[0] : companyErrors.phone }}</p>
              </div>
              <div class="settings-field">
                <label class="settings-label">Email <span class="text-muted">(optional)</span></label>
                <input v-model="company.email" type="email" class="settings-input" :class="{ 'settings-input--invalid': companyErrors.email }" placeholder="you@example.com" />
                <p v-if="companyErrors.email" class="settings-error">{{ Array.isArray(companyErrors.email) ? companyErrors.email[0] : companyErrors.email }}</p>
              </div>
              <div class="settings-field">
                <label class="settings-label">Address <span class="text-muted">(optional)</span></label>
                <input v-model="company.address" type="text" class="settings-input" :class="{ 'settings-input--invalid': companyErrors.address }" placeholder="Address" />
                <p v-if="companyErrors.address" class="settings-error">{{ Array.isArray(companyErrors.address) ? companyErrors.address[0] : companyErrors.address }}</p>
              </div>
              <div class="settings-field">
                <label class="settings-label">Website <span class="text-muted">(optional)</span></label>
                <input v-model="company.website" type="url" class="settings-input" :class="{ 'settings-input--invalid': companyErrors.website }" placeholder="https://example.com" />
                <p v-if="companyErrors.website" class="settings-error">{{ Array.isArray(companyErrors.website) ? companyErrors.website[0] : companyErrors.website }}</p>
              </div>
            </div>

            <button type="submit" class="settings-btn settings-btn--primary" :disabled="companySaving">
              <span v-if="companySaving" class="settings-spinner"></span>
              <span v-else>Save company</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import PageHeader from "../components/common/PageHeader.vue";
import { useModal } from "../composables/useModal";
import { profileApi } from "../api/profile.api.js";

const { modalRef: userModalRef, show: showUserModal, hide: hideUserModal } = useModal();
const { modalRef: createUserModalRef, show: showCreateUserModal, hide: hideCreateUserModal } = useModal();

const profile = reactive({ id: null, username: "", email: "", phone: "", first_name: "", last_name: "" });
const userModalForm = reactive({
  username: "",
  email: "",
  phone: "",
  first_name: "",
  last_name: "",
  is_active: true,
  new_password: "",
});
const editingUserId = ref(null);

const profileErrors = ref({});
const profileError = ref(null);
const profileSuccess = ref(null);
const profileSaving = ref(false);

const company = reactive({ id: null, name: "", phone: "", email: "", address: "", website: "", is_active: true });
const companyErrors = ref({});
const companyError = ref(null);
const companySuccess = ref(null);
const companySaving = ref(false);
const companyLoading = ref(true);

const companyUsers = ref([]);
const companyUsersLoading = ref(false);
const companyUserActionLoading = ref(false);

const createUserForm = reactive({ username: "", email: "", phone: "", first_name: "", last_name: "", password: "" });
const createUserErrors = ref({});
const createUserError = ref(null);
const createUserSaving = ref(false);

function setProfile(data) {
  profile.id = data.id ?? null;
  profile.username = data.username ?? "";
  profile.email = data.email ?? "";
  profile.phone = data.phone ?? "";
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

async function loadCompanyUsers() {
  if (!company.id) return;
  companyUsersLoading.value = true;
  try {
    const res = await profileApi.getCompanyUsers();
    companyUsers.value = res.data ?? [];
  } catch {
    companyUsers.value = [];
  } finally {
    companyUsersLoading.value = false;
  }
}

async function loadCompany() {
  companyLoading.value = true;
  companyError.value = null;
  try {
    const res = await profileApi.getCurrentCompany();
    setCompany(res.data);
    if (company.id) await loadCompanyUsers();
  } catch (err) {
    if (err.response?.status === 404) {
      company.id = null;
      companyUsers.value = [];
    } else {
      companyError.value = err.response?.data?.detail || "Failed to load company.";
    }
  } finally {
    companyLoading.value = false;
  }
}

function openUserModal(user = null) {
  if (user) {
    editingUserId.value = user.user_id;
    userModalForm.username = user.username ?? "";
    userModalForm.email = user.email ?? "";
    userModalForm.phone = user.phone ?? "";
    userModalForm.first_name = user.first_name ?? "";
    userModalForm.last_name = user.last_name ?? "";
    userModalForm.is_active = user.is_active ?? true;
    userModalForm.new_password = "";
  } else {
    editingUserId.value = profile.id;
    userModalForm.username = profile.username;
    userModalForm.email = profile.email;
    userModalForm.phone = profile.phone ?? "";
    userModalForm.first_name = profile.first_name;
    userModalForm.last_name = profile.last_name;
    userModalForm.is_active = true;
    userModalForm.new_password = "";
  }
  profileErrors.value = {};
  showUserModal();
}

function openCreateUserModal() {
  createUserForm.username = "";
  createUserForm.email = "";
  createUserForm.phone = "";
  createUserForm.first_name = "";
  createUserForm.last_name = "";
  createUserForm.password = "";
  createUserErrors.value = {};
  createUserError.value = null;
  showCreateUserModal();
}

async function saveCreateUser() {
  createUserErrors.value = {};
  createUserError.value = null;
  if (!company.id) {
    createUserError.value = "No company selected.";
    return;
  }
  createUserSaving.value = true;
  try {
    await profileApi.createUser({
      username: createUserForm.username.trim(),
      email: createUserForm.email.trim(),
      phone: createUserForm.phone?.trim() || "",
      password: createUserForm.password,
      first_name: createUserForm.first_name.trim(),
      last_name: createUserForm.last_name.trim(),
      company_id: company.id,
    });
    profileSuccess.value = "User created.";
    hideCreateUserModal();
    await loadCompanyUsers();
  } catch (err) {
    const data = err.response?.data;
    if (data && typeof data === "object" && !data.detail) createUserErrors.value = data;
    else createUserError.value = data?.detail || "Failed to create user.";
  } finally {
    createUserSaving.value = false;
  }
}

async function saveUserFromModal() {
  profileErrors.value = {};
  profileError.value = null;
  profileSuccess.value = null;
  profileSaving.value = true;
  try {
    const payload = {
      username: userModalForm.username.trim(),
      email: userModalForm.email.trim() || undefined,
      phone: userModalForm.phone?.trim() || undefined,
      first_name: userModalForm.first_name.trim(),
      last_name: userModalForm.last_name.trim(),
    };
    const isSelf = (editingUserId.value ?? profile.id) === profile.id;
    const res = isSelf ? await profileApi.updateProfile(payload) : await profileApi.updateCompanyUserProfile(editingUserId.value, payload);
    if (isSelf) setProfile(res.data);
    if (!isSelf) {
      await profileApi.updateCompanyUser(editingUserId.value, { is_active: !!userModalForm.is_active });
      if (userModalForm.new_password) {
        await profileApi.setCompanyUserPassword(editingUserId.value, userModalForm.new_password);
        userModalForm.new_password = "";
      }
    }
    await loadCompanyUsers();
    profileSuccess.value = "User updated.";
    hideUserModal();
  } catch (err) {
    if (err.response?.data && typeof err.response.data === "object" && !err.response.data.detail) profileErrors.value = err.response.data;
    else profileError.value = err.response?.data?.detail || "Failed to update user.";
  } finally {
    profileSaving.value = false;
  }
}

async function removeCompanyUser(u) {
  if (!u?.user_id) return;
  const ok = window.confirm(`Remove "${u.username}" from this company? They will lose access.`);
  if (!ok) return;

  companyUserActionLoading.value = true;
  profileError.value = null;
  profileSuccess.value = null;
  try {
    await profileApi.removeCompanyUser(u.user_id);
    profileSuccess.value = "User removed from company.";
    await loadCompanyUsers();
  } catch (err) {
    profileError.value = err.response?.data?.detail || "Failed to remove user from company.";
  } finally {
    companyUserActionLoading.value = false;
  }
}

async function saveCompany() {
  companyErrors.value = {};
  companyError.value = null;
  companySuccess.value = null;
  companySaving.value = true;
  try {
    const res = await profileApi.updateCurrentCompany({
      name: company.name,
      phone: company.phone,
      email: company.email || null,
      address: company.address || null,
      website: company.website || null,
    });
    setCompany(res.data);
    companySuccess.value = "Company updated.";
  } catch (err) {
    const data = err.response?.data;
    if (data && typeof data === "object" && !data.detail) companyErrors.value = data;
    else companyError.value = data?.detail || "Failed to update company.";
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
  width: 100%;
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
  padding: 1.25rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eef2f7;
}
.settings-section__header--with-action {
  gap: 1rem;
}
.settings-section__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #fff;
}
.settings-section__icon--user {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}
.settings-section__icon--company {
  background: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%);
}
.settings-section__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}
.settings-section__desc {
  margin: 0.2rem 0 0;
  font-size: 0.9rem;
  color: #6b7280;
}
.settings-section__body {
  padding: 1.25rem;
}
.settings-alert {
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.settings-alert--error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}
.settings-alert--success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}
.settings-alert__close {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
}
.settings-table-wrap {
  overflow-x: auto;
  border: 1px solid #eef2f7;
  border-radius: 14px;
}
.settings-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.settings-table thead th {
  background: #f9fafb;
  text-align: left;
  font-size: 0.8rem;
  letter-spacing: 0.02em;
  color: #6b7280;
  padding: 0.85rem 0.9rem;
  border-bottom: 1px solid #eef2f7;
}
.settings-table tbody td {
  padding: 0.85rem 0.9rem;
  border-bottom: 1px solid #eef2f7;
}
.settings-table tbody tr:last-child td {
  border-bottom: none;
}
.settings-table__actions {
  white-space: nowrap;
  width: 1%;
}
.settings-table__row {
  cursor: pointer;
}
.settings-table__row:hover {
  background: #fafafa;
}

.settings-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.settings-badge--active {
  background: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.settings-badge--inactive {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
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
.settings-btn--sm {
  padding: 0.35rem 0.65rem;
  font-size: 0.8125rem;
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
.settings-btn--danger {
  background: #fff;
  color: #dc2626;
  border: 1px solid #dc2626;
}
.settings-btn--danger:hover:not(:disabled) {
  background: #fef2f2;
}
.settings-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}
@media (max-width: 768px) {
  .settings-form__grid {
    grid-template-columns: 1fr;
  }
}
.settings-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.settings-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}
.settings-input {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.6rem 0.75rem;
}
.settings-input--invalid {
  border-color: #fca5a5;
  background: #fef2f2;
}
.settings-error {
  margin: 0;
  font-size: 0.8rem;
  color: #b91c1c;
}
.settings-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: settings-spin 0.7s linear infinite;
}
@keyframes settings-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

