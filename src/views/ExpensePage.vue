<template>
  <div class="container-fluid">
    <PageHeader title="Expense" icon="bi-wallet2" />

    <LoadingSpinner v-if="expenseStore.loading || expenseStore.categoriesLoading" />
    <ErrorAlert :error="expenseStore.error" title="Error" dismissible @dismiss="expenseStore.error = null" />

    <!-- Tabbed menu -->
    <ul class="nav nav-tabs mb-3" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'categories' }"
          type="button"
          role="tab"
          aria-selected="activeTab === 'categories'"
          @click="activeTab = 'categories'"
        >
          <i class="bi bi-tags me-1"></i>Expense Categories
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'expense' }"
          type="button"
          role="tab"
          aria-selected="activeTab === 'expense'"
          @click="activeTab = 'expense'"
        >
          <i class="bi bi-wallet2 me-1"></i>Expense
        </button>
      </li>
    </ul>

    <!-- Tab: Expense Categories -->
    <div v-show="activeTab === 'categories'" class="tab-pane">
      <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-primary" @click="handleCreateCategory">
          <i class="bi bi-plus-circle me-2"></i>Add Category
        </button>
      </div>
      <DataTable
        v-if="!expenseStore.categoriesLoading"
        :columns="categoryColumns"
        :items="expenseStore.categories || []"
        :pagination="categoryPaginationData"
        empty-message="No expense categories found. Click 'Add Category' to create one."
        @page-change="handleCategoryPageChange"
      >
        <template #filters>
          <div class="row g-3 mb-3">
            <div class="col-md-5">
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input
                  v-model="categoryFilters.search"
                  type="text"
                  class="form-control"
                  placeholder="Search by name..."
                  @input="handleCategoryFilterChange"
                />
                <button v-if="categoryFilters.search" class="btn btn-outline-secondary" type="button" @click="clearCategorySearch" title="Clear search">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
            <div class="col-md-3">
              <select v-model="categoryFilters.is_active" class="form-select" @change="handleCategoryFilterChange">
                <option value="">All status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div class="col-md-2">
              <button v-if="hasActiveCategoryFilters" class="btn btn-outline-secondary w-100" type="button" @click="clearCategoryFilters">
                <i class="bi bi-x-circle me-1"></i>Clear
              </button>
            </div>
          </div>
        </template>
        <template #body="{ items }">
          <tr v-for="cat in items" :key="cat.id">
            <td>{{ cat.id }}</td>
            <td><strong>{{ cat.name }}</strong></td>
            <td>
              <span class="badge" :class="cat.is_active ? 'bg-success' : 'bg-secondary'">
                {{ cat.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-primary me-2" @click="handleEditCategory(cat)" title="Edit">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteCategory(cat)" title="Delete">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        </template>
      </DataTable>
    </div>

    <!-- Tab: Expense -->
    <div v-show="activeTab === 'expense'" class="tab-pane">
      <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-primary" @click="handleCreate">
          <i class="bi bi-plus-circle me-2"></i>Add Expense
        </button>
      </div>
      <DataTable
        v-if="!expenseStore.loading"
        :columns="columns"
        :items="expenseStore.expenses || []"
        :pagination="paginationData"
        empty-message="No expenses yet. Add a category in the first tab, then add an expense here."
        @page-change="handlePageChange"
      >
        <template #filters>
          <div class="row g-3 mb-3">
            <div class="col-md-2">
              <select v-model="filters.category" class="form-select" @change="handleFilterChange">
                <option value="">All categories</option>
                <option v-for="c in expenseStore.categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
              </select>
            </div>
            <div class="col-md-2">
              <input v-model="filters.date_from" type="date" class="form-control" placeholder="From" @change="handleFilterChange" />
            </div>
            <div class="col-md-2">
              <input v-model="filters.date_to" type="date" class="form-control" placeholder="To" @change="handleFilterChange" />
            </div>
            <div class="col-md-3">
              <input
                v-model="filters.search"
                type="text"
                class="form-control"
                placeholder="Search description or category..."
                @input="handleFilterChange"
              />
            </div>
            <div class="col-md-2">
              <button v-if="hasActiveFilters" class="btn btn-outline-secondary w-100" @click="clearFilters">
                <i class="bi bi-x-circle me-1"></i>Clear
              </button>
            </div>
          </div>
        </template>
        <template #body="{ items }">
          <tr v-for="exp in items" :key="exp.id">
            <td>{{ formatDate(exp.date) }}</td>
            <td>{{ exp.category_name || exp.category?.name || '-' }}</td>
            <td><strong>{{ formatCurrency(exp.amount) }}</strong></td>
            <td>{{ truncate(exp.description, 50) || '-' }}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary me-2" @click="handleEdit(exp)" title="Edit">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="handleDelete(exp)" title="Delete">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        </template>
      </DataTable>
    </div>

    <!-- Add/Edit Category Modal -->
    <div class="modal fade" tabindex="-1" aria-hidden="true" ref="categoryModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditingCategory ? 'Edit Category' : 'Add Category' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="categoryFormErrors && Object.keys(categoryFormErrors).length > 0" class="alert alert-danger">
              <ul class="mb-0 mt-2">
                <li v-for="(errors, field) in categoryFormErrors" :key="field">
                  {{ Array.isArray(errors) ? errors[0] : errors }}
                </li>
              </ul>
            </div>
            <form @submit.prevent="handleSaveCategory">
              <div class="mb-3">
                <label class="form-label">Name <span class="text-danger">*</span></label>
                <input
                  v-model="categoryFormData.name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': categoryFormErrors.name }"
                  placeholder="e.g. Rent, Utilities, Salaries"
                  required
                  maxlength="100"
                />
                <div v-if="categoryFormErrors.name" class="invalid-feedback d-block">{{ Array.isArray(categoryFormErrors.name) ? categoryFormErrors.name[0] : categoryFormErrors.name }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Status</label>
                <select v-model="categoryFormData.is_active" class="form-select">
                  <option :value="true">Active</option>
                  <option :value="false">Inactive</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="handleSaveCategory">
              {{ isEditingCategory ? 'Update' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Expense Modal -->
    <div class="modal fade" tabindex="-1" aria-hidden="true" ref="expenseModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Expense' : 'Add Expense' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="formErrors && Object.keys(formErrors).length > 0" class="alert alert-danger">
              <ul class="mb-0 mt-2">
                <li v-for="(errors, field) in formErrors" :key="field">
                  {{ Array.isArray(errors) ? errors[0] : errors }}
                </li>
              </ul>
            </div>
            <div v-if="!expenseStore.categories?.length && !isEditing" class="alert alert-warning">
              Add at least one expense category in the first tab.
            </div>
            <form v-else @submit.prevent="handleSave">
              <div class="mb-3">
                <label class="form-label">Category <span class="text-danger">*</span></label>
                <select
                  v-model="formData.category"
                  class="form-select"
                  :class="{ 'is-invalid': formErrors.category }"
                  required
                >
                  <option value="">Select category</option>
                  <option v-for="c in expenseStore.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <div v-if="formErrors.category" class="invalid-feedback d-block">{{ Array.isArray(formErrors.category) ? formErrors.category[0] : formErrors.category }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Amount <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text">৳</span>
                  <input
                    v-model.number="formData.amount"
                    type="number"
                    step="0.01"
                    min="0"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.amount }"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div v-if="formErrors.amount" class="invalid-feedback d-block">{{ Array.isArray(formErrors.amount) ? formErrors.amount[0] : formErrors.amount }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Date <span class="text-danger">*</span></label>
                <input
                  v-model="formData.date"
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.date }"
                  required
                />
                <div v-if="formErrors.date" class="invalid-feedback d-block">{{ Array.isArray(formErrors.date) ? formErrors.date[0] : formErrors.date }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <input
                  v-model="formData.description"
                  type="text"
                  class="form-control"
                  placeholder="Optional note"
                  maxlength="255"
                />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!expenseStore.categories?.length && !isEditing"
              @click="handleSave"
            >
              {{ isEditing ? 'Update' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Modal } from 'bootstrap'
import { useExpenseStore } from '../stores/expense.store'
import { useFormatter } from '../composables/useFormatter'
import { useConfirm } from '../composables/useConfirm'
import { usePagination } from '../composables/usePagination'

import PageHeader from '../components/common/PageHeader.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorAlert from '../components/common/ErrorAlert.vue'
import DataTable from '../components/common/DataTable.vue'

const expenseStore = useExpenseStore()
const { formatDate, formatCurrency, truncate } = useFormatter()
const { confirmDelete } = useConfirm()
const pagination = usePagination(10)
const categoryPagination = usePagination(10)

const activeTab = ref('categories')
const isEditing = ref(false)
const selectedExpense = ref(null)
const formErrors = ref({})
const expenseModalRef = ref(null)
let expenseModalInstance = null

// Category CRUD
const isEditingCategory = ref(false)
const selectedCategory = ref(null)
const categoryFormData = ref({ name: '', is_active: true })
const categoryFormErrors = ref({})
const categoryModalRef = ref(null)
let categoryModalInstance = null
const categoryFilters = ref({ search: '', is_active: '' })

const filters = ref({
  category: '',
  date_from: '',
  date_to: '',
  search: ''
})

const formData = ref({
  category: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  description: ''
})

const columns = [
  { key: 'date', label: 'Date', width: '120px' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount', width: '120px' },
  { key: 'description', label: 'Description' },
  { key: 'actions', label: 'Actions', width: '120px' }
]

const categoryColumns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status', width: '100px' },
  { key: 'actions', label: 'Actions', width: '150px' }
]

const hasActiveFilters = computed(() =>
  !!(filters.value.category || filters.value.date_from || filters.value.date_to || filters.value.search)
)

const hasActiveCategoryFilters = computed(() =>
  !!(categoryFilters.value.search || categoryFilters.value.is_active)
)

const paginationData = computed(() => ({
  currentPage: pagination.currentPage.value,
  totalPages: pagination.totalPages.value,
  totalItems: pagination.totalItems.value,
  startIndex: pagination.startIndex.value,
  endIndex: pagination.endIndex.value,
  hasNextPage: pagination.hasNextPage.value,
  hasPrevPage: pagination.hasPrevPage.value
}))

const categoryPaginationData = computed(() => ({
  currentPage: categoryPagination.currentPage.value,
  totalPages: categoryPagination.totalPages.value,
  totalItems: categoryPagination.totalItems.value,
  startIndex: categoryPagination.startIndex.value,
  endIndex: categoryPagination.endIndex.value,
  hasNextPage: categoryPagination.hasNextPage.value,
  hasPrevPage: categoryPagination.hasPrevPage.value
}))

onMounted(async () => {
  await fetchCategories()
  await fetchExpenses()
})

watch(activeTab, (tab) => {
  if (tab === 'expense') {
    fetchExpenses()
    expenseStore.fetchExpenseCategories()
  } else if (tab === 'categories') {
    fetchCategories()
  }
})

async function fetchCategories() {
  const params = categoryPagination.getParams()
  if (categoryFilters.value.search) params.search = categoryFilters.value.search
  if (categoryFilters.value.is_active !== '') params.is_active = categoryFilters.value.is_active
  await expenseStore.fetchExpenseCategories(params)
  if (expenseStore.categoryPagination) {
    categoryPagination.updateFromResponse({
      totalItems: expenseStore.categoryPagination.totalItems,
      currentPage: expenseStore.categoryPagination.currentPage,
      pageSize: expenseStore.categoryPagination.pageSize,
      totalPages: expenseStore.categoryPagination.totalPages
    })
  }
}

async function fetchExpenses() {
  const params = pagination.getParams()
  if (filters.value.category) params.category = filters.value.category
  if (filters.value.date_from) params.date_from = filters.value.date_from
  if (filters.value.date_to) params.date_to = filters.value.date_to
  if (filters.value.search) params.search = filters.value.search
  await expenseStore.fetchExpenses(params)
  if (expenseStore.pagination) {
    pagination.updateFromResponse(expenseStore.pagination)
  }
}

function handleCategoryPageChange(page) {
  categoryPagination.goToPage(page)
  fetchCategories()
}

function handleCategoryFilterChange() {
  categoryPagination.goToPage(1)
  fetchCategories()
}

function clearCategorySearch() {
  categoryFilters.value.search = ''
  handleCategoryFilterChange()
}

function clearCategoryFilters() {
  categoryFilters.value = { search: '', is_active: '' }
  handleCategoryFilterChange()
}

function openCategoryModal() {
  if (!categoryModalInstance && categoryModalRef.value) {
    categoryModalInstance = new Modal(categoryModalRef.value)
  }
  categoryModalInstance?.show()
}

function handleCreateCategory() {
  isEditingCategory.value = false
  selectedCategory.value = null
  categoryFormData.value = { name: '', is_active: true }
  categoryFormErrors.value = {}
  openCategoryModal()
}

function handleEditCategory(cat) {
  isEditingCategory.value = true
  selectedCategory.value = cat
  categoryFormData.value = { name: cat.name, is_active: cat.is_active !== false }
  categoryFormErrors.value = {}
  openCategoryModal()
}

async function handleSaveCategory() {
  categoryFormErrors.value = {}
  const name = (categoryFormData.value.name || '').trim()
  if (!name) {
    categoryFormErrors.value.name = 'Name is required.'
    return
  }
  try {
    const payload = { name, is_active: categoryFormData.value.is_active }
    if (isEditingCategory.value && selectedCategory.value) {
      await expenseStore.updateExpenseCategory(selectedCategory.value.id, payload)
    } else {
      await expenseStore.createExpenseCategory(payload)
    }
    categoryModalInstance?.hide()
    await fetchCategories()
    if (activeTab.value === 'expense') {
      await expenseStore.fetchExpenseCategories()
    }
  } catch (err) {
    const data = err.response?.data
    if (data?.name) categoryFormErrors.value.name = Array.isArray(data.name) ? data.name[0] : data.name
    else if (data?.message) categoryFormErrors.value._general = data.message
  }
}

function handlePageChange(page) {
  pagination.goToPage(page)
  fetchExpenses()
}

function handleFilterChange() {
  pagination.goToPage(1)
  fetchExpenses()
}

function clearFilters() {
  filters.value = { category: '', date_from: '', date_to: '', search: '' }
  handleFilterChange()
}

function openExpenseModal() {
  if (!expenseModalInstance && expenseModalRef.value) {
    expenseModalInstance = new Modal(expenseModalRef.value)
  }
  expenseModalInstance?.show()
}

function handleCreate() {
  isEditing.value = false
  selectedExpense.value = null
  formData.value = {
    category: expenseStore.categories?.[0]?.id || '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  }
  formErrors.value = {}
  openExpenseModal()
}

function handleEdit(exp) {
  isEditing.value = true
  selectedExpense.value = exp
  formData.value = {
    category: exp.category || exp.category_id,
    amount: exp.amount,
    date: (exp.date || '').slice(0, 10),
    description: exp.description || ''
  }
  formErrors.value = {}
  openExpenseModal()
}

async function handleSave() {
  formErrors.value = {}
  if (!formData.value.category || formData.value.amount === '' || formData.value.amount === null) {
    formErrors.value = { _general: 'Category and amount are required.' }
    return
  }
  const amount = Number(formData.value.amount)
  if (isNaN(amount) || amount < 0) {
    formErrors.value = { amount: 'Enter a valid amount.' }
    return
  }
  if (!formData.value.date) {
    formErrors.value = { date: 'Date is required.' }
    return
  }
  try {
    const payload = {
      category: formData.value.category,
      amount: amount,
      date: formData.value.date,
      description: (formData.value.description || '').trim()
    }
    if (isEditing.value && selectedExpense.value) {
      await expenseStore.updateExpense(selectedExpense.value.id, payload)
    } else {
      await expenseStore.createExpense(payload)
    }
    expenseModalInstance?.hide()
    await fetchExpenses()
  } catch (err) {
    const data = err.response?.data
    if (data?.category) formErrors.value.category = data.category
    if (data?.amount) formErrors.value.amount = Array.isArray(data.amount) ? data.amount : [data.amount]
    if (data?.date) formErrors.value.date = Array.isArray(data.date) ? data.date : [data.date]
    if (data?.message) formErrors.value._general = data.message
  }
}

async function handleDelete(exp) {
  const ok = await confirmDelete(`${exp.category_name || 'Expense'} - ${formatCurrency(exp.amount)}`, 'expense')
  if (!ok) return
  try {
    await expenseStore.deleteExpense(exp.id)
    await fetchExpenses()
  } catch (e) {
    // error shown by ErrorAlert
  }
}

async function deleteCategory(cat) {
  const ok = await confirmDelete(cat.name, 'category')
  if (!ok) return
  try {
    await expenseStore.deleteExpenseCategory(cat.id)
    await fetchCategories()
    if (activeTab.value === 'expense') {
      await expenseStore.fetchExpenseCategories()
    }
  } catch (e) {
    // error in store
  }
}
</script>

<style scoped>
/* Expense page tabs: override App.vue sidebar .nav-link so active tab is visible */
.nav-tabs .nav-link {
  font-weight: 500;
  color: #495057 !important;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 0.25rem 0.25rem 0 0;
}

.nav-tabs .nav-link:hover {
  color: #0d6efd !important;
  border-color: #dee2e6 #dee2e6 #fff;
}

.nav-tabs .nav-link.active {
  font-weight: 600;
  color: #0d6efd !important;
  background-color: #fff !important;
  border-color: #dee2e6 #dee2e6 #fff !important;
}

.nav-tabs .nav-link:focus {
  outline: 0;
}
</style>
