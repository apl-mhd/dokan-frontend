<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col">
        <h2 class="mb-3">
          <i class="bi bi-rulers me-2"></i>Unit Management
        </h2>
      </div>
    </div>

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
            <button class="btn btn-primary" @click="showCreateUnitModal">
              <i class="bi bi-plus-circle me-2"></i>Add Unit
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="unitStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <!-- Units Table -->
        <div v-else class="card shadow-sm">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Conversion Factor</th>
                    <th>Is Base Unit</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="unit in unitStore.units" :key="unit.id">
                    <td><strong>{{ unit.name }}</strong></td>
                    <td>
                      <span class="badge bg-secondary" v-if="unit.unit_category_name">
                        {{ unit.unit_category_name }}
                      </span>
                      <span class="text-muted" v-else>-</span>
                    </td>
                    <td>{{ unit.conversion_factor }}</td>
                    <td>
                      <span class="badge" :class="unit.is_base_unit ? 'bg-success' : 'bg-secondary'">
                        {{ unit.is_base_unit ? 'Yes' : 'No' }}
                      </span>
                    </td>
                    <td>{{ formatDate(unit.created_at) }}</td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary me-2" @click="editUnit(unit)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteUnit(unit)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="unitStore.units.length === 0">
                    <td colspan="6" class="text-center text-muted py-4">
                      No units found. Click "Add Unit" to create one.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Unit Categories Tab -->
      <div class="tab-pane fade" id="unit-categories" role="tabpanel">
        <div class="row mb-3">
          <div class="col">
            <button class="btn btn-primary" @click="showCreateUnitCategoryModal">
              <i class="bi bi-plus-circle me-2"></i>Add Unit Category
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="unitStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <!-- Unit Categories Grid -->
        <div v-else class="row g-4">
          <div v-for="category in unitStore.unitCategories" :key="category.id" class="col-md-4 col-lg-3">
            <div class="card h-100 shadow-sm unit-category-card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <h5 class="card-title">
                    <i class="bi bi-collection text-info me-2"></i>{{ category.name }}
                  </h5>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-link text-muted" data-bs-toggle="dropdown">
                      <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu">
                      <li>
                        <a class="dropdown-item" href="#" @click.prevent="editUnitCategory(category)">
                          <i class="bi bi-pencil me-2"></i>Edit
                        </a>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li>
                        <a class="dropdown-item text-danger" href="#" @click.prevent="confirmDeleteUnitCategory(category)">
                          <i class="bi bi-trash me-2"></i>Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <p class="text-muted small mt-2">
                  <i class="bi bi-calendar me-1"></i>{{ formatDate(category.created_at) }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="unitStore.unitCategories.length === 0" class="col-12">
            <div class="text-center py-5">
              <i class="bi bi-collection display-1 text-muted"></i>
              <p class="mt-3 text-muted">No unit categories found. Click "Add Unit Category" to create one.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Unit Modal -->
    <div class="modal fade" id="unitModal" tabindex="-1" ref="unitModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-rulers me-2"></i>{{ isEditingUnit ? 'Edit Unit' : 'Add New Unit' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUnit">
              <div class="mb-3">
                <label class="form-label">Unit Name <span class="text-danger">*</span></label>
                <input
                  v-model="unitFormData.name"
                  type="text"
                  class="form-control"
                  placeholder="e.g., kg, liter, piece"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Unit Category</label>
                <select v-model="unitFormData.unit_category" class="form-select">
                  <option :value="null">Select category (optional)</option>
                  <option v-for="cat in unitStore.unitCategories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Conversion Factor <span class="text-danger">*</span></label>
                <input
                  v-model.number="unitFormData.conversion_factor"
                  type="number"
                  step="0.0001"
                  class="form-control"
                  placeholder="e.g., 1.0000"
                  required
                />
                <small class="form-text text-muted">
                  Factor to convert to base unit (e.g., 1 kg = 1000 g, so gram = 0.001)
                </small>
              </div>

              <div class="mb-3 form-check">
                <input
                  v-model="unitFormData.is_base_unit"
                  type="checkbox"
                  class="form-check-input"
                  id="isBaseUnit"
                />
                <label class="form-check-label" for="isBaseUnit">
                  Is Base Unit (conversion factor must be 1.0000)
                </label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveUnit">
              <i class="bi bi-save me-2"></i>{{ isEditingUnit ? 'Update' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Unit Category Modal -->
    <div class="modal fade" id="unitCategoryModal" tabindex="-1" ref="unitCategoryModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-collection me-2"></i>{{ isEditingUnitCategory ? 'Edit Unit Category' : 'Add New Unit Category' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUnitCategory">
              <div class="mb-3">
                <label class="form-label">Category Name <span class="text-danger">*</span></label>
                <input
                  v-model="unitCategoryFormData.name"
                  type="text"
                  class="form-control"
                  placeholder="e.g., Weight, Volume, Length"
                  required
                  maxlength="50"
                />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveUnitCategory">
              <i class="bi bi-save me-2"></i>{{ isEditingUnitCategory ? 'Update' : 'Save' }}
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
import { Modal } from 'bootstrap'

const unitStore = useUnitStore()
const unitModalRef = ref(null)
const unitCategoryModalRef = ref(null)
let unitModalInstance = null
let unitCategoryModalInstance = null

const isEditingUnit = ref(false)
const selectedUnit = ref(null)
const unitFormData = ref({
  name: '',
  unit_category: null,
  conversion_factor: 1.0,
  is_base_unit: false
})

const isEditingUnitCategory = ref(false)
const selectedUnitCategory = ref(null)
const unitCategoryFormData = ref({
  name: ''
})

onMounted(() => {
  unitStore.fetchUnits()
  unitStore.fetchUnitCategories()
})

// Unit Methods
const showCreateUnitModal = () => {
  isEditingUnit.value = false
  selectedUnit.value = null
  resetUnitForm()
  if (!unitModalInstance) {
    unitModalInstance = new Modal(unitModalRef.value)
  }
  unitModalInstance.show()
}

const editUnit = (unit) => {
  isEditingUnit.value = true
  selectedUnit.value = unit
  unitFormData.value = {
    name: unit.name,
    unit_category: unit.unit_category,
    conversion_factor: parseFloat(unit.conversion_factor),
    is_base_unit: unit.is_base_unit
  }
  if (!unitModalInstance) {
    unitModalInstance = new Modal(unitModalRef.value)
  }
  unitModalInstance.show()
}

const saveUnit = async () => {
  try {
    if (isEditingUnit.value) {
      await unitStore.updateUnit(selectedUnit.value.id, unitFormData.value)
    } else {
      await unitStore.createUnit(unitFormData.value)
    }
    unitModalInstance.hide()
    resetUnitForm()
  } catch (error) {
    alert('Error saving unit: ' + (error.response?.data?.details || error.message))
  }
}

const confirmDeleteUnit = async (unit) => {
  if (confirm(`Delete unit "${unit.name}"?`)) {
    try {
      await unitStore.deleteUnit(unit.id)
    } catch (error) {
      alert('Error deleting unit: ' + (error.response?.data?.message || error.message))
    }
  }
}

const resetUnitForm = () => {
  unitFormData.value = {
    name: '',
    unit_category: null,
    conversion_factor: 1.0,
    is_base_unit: false
  }
}

// Unit Category Methods
const showCreateUnitCategoryModal = () => {
  isEditingUnitCategory.value = false
  selectedUnitCategory.value = null
  resetUnitCategoryForm()
  if (!unitCategoryModalInstance) {
    unitCategoryModalInstance = new Modal(unitCategoryModalRef.value)
  }
  unitCategoryModalInstance.show()
}

const editUnitCategory = (category) => {
  isEditingUnitCategory.value = true
  selectedUnitCategory.value = category
  unitCategoryFormData.value = {
    name: category.name
  }
  if (!unitCategoryModalInstance) {
    unitCategoryModalInstance = new Modal(unitCategoryModalRef.value)
  }
  unitCategoryModalInstance.show()
}

const saveUnitCategory = async () => {
  try {
    if (isEditingUnitCategory.value) {
      await unitStore.updateUnitCategory(selectedUnitCategory.value.id, unitCategoryFormData.value)
    } else {
      await unitStore.createUnitCategory(unitCategoryFormData.value)
    }
    unitCategoryModalInstance.hide()
    resetUnitCategoryForm()
  } catch (error) {
    alert('Error saving unit category: ' + (error.response?.data?.message || error.message))
  }
}

const confirmDeleteUnitCategory = async (category) => {
  if (confirm(`Delete unit category "${category.name}"?`)) {
    try {
      await unitStore.deleteUnitCategory(category.id)
    } catch (error) {
      alert('Error deleting unit category: ' + (error.response?.data?.message || error.message))
    }
  }
}

const resetUnitCategoryForm = () => {
  unitCategoryFormData.value = {
    name: ''
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.unit-category-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.unit-category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}
</style>

