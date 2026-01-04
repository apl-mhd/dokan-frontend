<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <PageHeader title="Unit Management" icon="bi-rulers" />

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-4" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link active"
          id="units-tab"
          data-bs-toggle="tab"
          data-bs-target="#units"
          type="button"
          role="tab"
        >
          <i class="bi bi-rulers me-2"></i>Units
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="unit-categories-tab"
          data-bs-toggle="tab"
          data-bs-target="#unit-categories"
          type="button"
          role="tab"
        >
          <i class="bi bi-collection me-2"></i>Unit Categories
        </button>
      </li>
    </ul>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Units Tab -->
      <div class="tab-pane fade show active" id="units" role="tabpanel">
        <div class="row mb-3">
          <div class="col">
            <button class="btn btn-primary" @click="handleCreateUnit">
              <i class="bi bi-plus-circle me-2"></i>Add Unit
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <LoadingSpinner v-if="unitStore.loading" />

        <!-- Error State -->
        <ErrorAlert :error="unitStore.error" title="Error" dismissible @dismiss="unitStore.error = null" />

        <!-- Units Table -->
        <DataTable
          v-if="!unitStore.loading"
          :columns="unitColumns"
          :items="unitStore.units || []"
          empty-message="No units found. Click 'Add Unit' to create one."
        >
          <template #body="{ items }">
            <tr v-for="unit in items" :key="unit.id">
              <td>{{ unit.id }}</td>
              <td><strong>{{ unit.name }}</strong></td>
              <td>{{ unit.short_name || '-' }}</td>
              <td>{{ unit.category_name || 'Uncategorized' }}</td>
              <td>
                <span v-if="unit.is_base_unit" class="badge bg-primary">Base Unit</span>
                <span v-else class="badge bg-secondary">Derived Unit</span>
              </td>
              <td>
                <button
                  class="btn btn-sm btn-outline-primary me-2"
                  @click="handleEditUnit(unit)"
                  title="Edit"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="handleDeleteUnit(unit)"
                  title="Delete"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </template>
        </DataTable>
      </div>

      <!-- Unit Categories Tab -->
      <div class="tab-pane fade" id="unit-categories" role="tabpanel">
        <div class="row mb-3">
          <div class="col">
            <button class="btn btn-primary" @click="handleCreateCategory">
              <i class="bi bi-plus-circle me-2"></i>Add Unit Category
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <LoadingSpinner v-if="unitStore.loadingCategories" />

        <!-- Error State -->
        <ErrorAlert
          :error="unitStore.categoriesError"
          title="Error"
          dismissible
          @dismiss="unitStore.categoriesError = null"
        />

        <!-- Unit Categories Table -->
        <DataTable
          v-if="!unitStore.loadingCategories"
          :columns="categoryColumns"
          :items="unitStore.unitCategories || []"
          empty-message="No unit categories found. Click 'Add Unit Category' to create one."
        >
          <template #body="{ items }">
            <tr v-for="category in items" :key="category.id">
              <td>{{ category.id }}</td>
              <td><strong>{{ category.name }}</strong></td>
              <td>{{ truncate(category.description, 60) }}</td>
              <td>
                <button
                  class="btn btn-sm btn-outline-primary me-2"
                  @click="handleEditCategory(category)"
                  title="Edit"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="handleDeleteCategory(category)"
                  title="Delete"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Unit Modal -->
    <div class="modal fade" tabindex="-1" aria-hidden="true" ref="unitModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditingUnit ? 'Edit Unit' : 'Add New Unit' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSaveUnit">
              <div class="mb-3">
                <label class="form-label">Unit Name <span class="text-danger">*</span></label>
                <input
                  v-model="unitFormData.name"
                  type="text"
                  class="form-control"
                  placeholder="Enter unit name (e.g., Kilogram)"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Short Name</label>
                <input
                  v-model="unitFormData.short_name"
                  type="text"
                  class="form-control"
                  placeholder="Enter short name (e.g., kg)"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Unit Category</label>
                <select v-model="unitFormData.category" class="form-select">
                  <option value="">Select Category</option>
                  <option v-for="cat in unitStore.unitCategories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <div class="form-check">
                  <input
                    v-model="unitFormData.is_base_unit"
                    type="checkbox"
                    class="form-check-input"
                    id="isBaseUnit"
                  />
                  <label class="form-check-label" for="isBaseUnit">
                    Is Base Unit
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="handleSaveUnit">
              <i class="bi bi-save me-2"></i>{{ isEditingUnit ? 'Update' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    <div class="modal fade" tabindex="-1" aria-hidden="true" ref="categoryModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditingCategory ? 'Edit Category' : 'Add New Category' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSaveCategory">
              <div class="mb-3">
                <label class="form-label">Category Name <span class="text-danger">*</span></label>
                <input
                  v-model="categoryFormData.name"
                  type="text"
                  class="form-control"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea
                  v-model="categoryFormData.description"
                  class="form-control"
                  rows="3"
                  placeholder="Enter category description"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="handleSaveCategory">
              <i class="bi bi-save me-2"></i>{{ isEditingCategory ? 'Update' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUnitStore } from '../stores/unit.store'
import { useModal } from '../composables/useModal'
import { useFormatter } from '../composables/useFormatter'
import { useConfirm } from '../composables/useConfirm'

// Components
import PageHeader from '../components/common/PageHeader.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorAlert from '../components/common/ErrorAlert.vue'
import DataTable from '../components/common/DataTable.vue'

// Stores
const unitStore = useUnitStore()

// Composables
const { truncate } = useFormatter()
const { confirmDelete } = useConfirm()

// Unit Modal
const { modalRef: unitModalRef, show: showUnitModal, hide: hideUnitModal } = useModal()

// Category Modal
const { modalRef: categoryModalRef, show: showCategoryModal, hide: hideCategoryModal } = useModal()

// State
const isEditingUnit = ref(false)
const selectedUnit = ref(null)
const unitFormData = ref({
  name: '',
  short_name: '',
  category: '',
  is_base_unit: false
})

const isEditingCategory = ref(false)
const selectedCategory = ref(null)
const categoryFormData = ref({
  name: '',
  description: ''
})

// Table columns
const unitColumns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Name' },
  { key: 'short_name', label: 'Short Name', width: '120px' },
  { key: 'category', label: 'Category' },
  { key: 'type', label: 'Type', width: '120px' },
  { key: 'actions', label: 'Actions', width: '150px' }
]

const categoryColumns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'actions', label: 'Actions', width: '150px' }
]

// Lifecycle
onMounted(async () => {
  await Promise.all([
    unitStore.fetchUnits(),
    unitStore.fetchUnitCategories()
  ])
})

// Unit Methods
const handleCreateUnit = () => {
  isEditingUnit.value = false
  selectedUnit.value = null
  resetUnitForm()
  showUnitModal()
}

const handleEditUnit = (unit) => {
  isEditingUnit.value = true
  selectedUnit.value = unit
  unitFormData.value = {
    name: unit.name,
    short_name: unit.short_name || '',
    category: unit.category || '',
    is_base_unit: unit.is_base_unit || false
  }
  showUnitModal()
}

const handleSaveUnit = async () => {
  try {
    if (isEditingUnit.value) {
      await unitStore.updateUnit(selectedUnit.value.id, unitFormData.value)
    } else {
      await unitStore.createUnit(unitFormData.value)
    }
    hideUnitModal()
    resetUnitForm()
  } catch (error) {
    console.error('Error saving unit:', error)
  }
}

const handleDeleteUnit = async (unit) => {
  const confirmed = await confirmDelete(unit.name, 'unit')
  if (confirmed) {
    try {
      await unitStore.deleteUnit(unit.id)
    } catch (error) {
      console.error('Error deleting unit:', error)
    }
  }
}

const resetUnitForm = () => {
  unitFormData.value = {
    name: '',
    short_name: '',
    category: '',
    is_base_unit: false
  }
}

// Category Methods
const handleCreateCategory = () => {
  isEditingCategory.value = false
  selectedCategory.value = null
  resetCategoryForm()
  showCategoryModal()
}

const handleEditCategory = (category) => {
  isEditingCategory.value = true
  selectedCategory.value = category
  categoryFormData.value = {
    name: category.name,
    description: category.description || ''
  }
  showCategoryModal()
}

const handleSaveCategory = async () => {
  try {
    if (isEditingCategory.value) {
      await unitStore.updateUnitCategory(selectedCategory.value.id, categoryFormData.value)
    } else {
      await unitStore.createUnitCategory(categoryFormData.value)
    }
    hideCategoryModal()
    resetCategoryForm()
  } catch (error) {
    console.error('Error saving category:', error)
  }
}

const handleDeleteCategory = async (category) => {
  const confirmed = await confirmDelete(category.name, 'unit category')
  if (confirmed) {
    try {
      await unitStore.deleteUnitCategory(category.id)
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }
}

const resetCategoryForm = () => {
  categoryFormData.value = {
    name: '',
    description: ''
  }
}
</script>

<style scoped>
.nav-tabs .nav-link {
  font-weight: 500;
  color: #495057 !important;
}

.nav-tabs .nav-link:hover {
  color: #0d6efd !important;
}

.nav-tabs .nav-link.active {
  font-weight: 600;
  color: #0d6efd !important;
  background-color: #fff !important;
  border-color: #dee2e6 #dee2e6 #fff !important;
}
</style>
