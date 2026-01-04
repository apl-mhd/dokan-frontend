# Modular Architecture Guide

## Overview

The Dokan frontend has been refactored to follow a modular, maintainable architecture using Vue 3 Composition API, reusable components, and composables. This document explains the structure and how to use it effectively.

## Directory Structure

```
src/
├── components/
│   └── common/              # Reusable UI components
│       ├── DataTable.vue
│       ├── EmptyState.vue
│       ├── ErrorAlert.vue
│       ├── FormModal.vue
│       ├── InvoiceItemsTable.vue
│       ├── LoadingSpinner.vue
│       └── PageHeader.vue
├── composables/             # Reusable logic (Vue composables)
│   ├── useConfirm.js
│   ├── useFormatter.js
│   ├── useModal.js
│   └── usePagination.js
├── stores/                  # Pinia stores for state management
│   ├── authStore.js
│   ├── customer.store.js
│   ├── product.store.js
│   └── ...
├── views/                   # Page components
│   ├── ProductPage.vue
│   ├── CustomerPage.vue
│   └── ...
└── utility/                 # Utility functions
    └── axios.js
```

## Core Concepts

### 1. Composables

Composables are reusable functions that encapsulate stateful logic. They follow the "use" naming convention.

#### **useModal**

Manages Bootstrap modal instances with automatic cleanup.

```javascript
import { useModal } from '@/composables/useModal'

const { modalRef, show, hide, toggle } = useModal()

// In template
<div class="modal" ref="modalRef">...</div>

// In script
show() // Show modal
hide() // Hide modal
```

#### **useFormatter**

Provides consistent formatting functions across the application.

```javascript
import { useFormatter } from '@/composables/useFormatter'

const { formatDate, formatCurrency, formatNumber, truncate, getStatusClass } = useFormatter()

// Usage
formatDate('2025-01-04')              // '1/4/2025'
formatCurrency(1500)                  // '৳1500.00'
formatNumber(1234567, 2)              // '1,234,567.00'
truncate('Long text...', 20)          // 'Long text...'
getStatusClass('completed')           // 'bg-success'
```

#### **useConfirm**

Provides confirmation dialog utilities.

```javascript
import { useConfirm } from '@/composables/useConfirm'

const { confirm, confirmDelete, confirmAction } = useConfirm()

// Usage
const confirmed = await confirmDelete('Product Name', 'product')
if (confirmed) {
  // Delete the item
}
```

#### **usePagination**

Manages pagination state and calculations.

```javascript
import { usePagination } from '@/composables/usePagination'

const pagination = usePagination(10) // 10 items per page

// Properties
pagination.currentPage.value
pagination.totalPages.value
pagination.totalItems.value

// Methods
pagination.goToPage(2)
pagination.nextPage()
pagination.prevPage()
pagination.getParams()              // { page: 1, page_size: 10 }
pagination.updateFromResponse(data) // Update from API response
```

### 2. Reusable Components

#### **PageHeader**

Displays page title with optional icon and action buttons.

```vue
<PageHeader title="Product Management" icon="bi-box-seam">
  <template #actions>
    <button class="btn btn-primary" @click="handleCreate">
      <i class="bi bi-plus-circle me-2"></i>Add Product
    </button>
  </template>
</PageHeader>
```

**Props:**
- `title` (String, required): Page title
- `icon` (String): Bootstrap icon class

**Slots:**
- `actions`: Slot for action buttons

---

#### **LoadingSpinner**

Displays a loading spinner with customizable appearance.

```vue
<LoadingSpinner />
<LoadingSpinner message="Please wait..." show-message />
<LoadingSpinner size="sm" variant="danger" />
```

**Props:**
- `message` (String): Loading message (default: 'Loading...')
- `showMessage` (Boolean): Show message text (default: false)
- `size` (String): 'sm', 'md', 'lg' (default: 'md')
- `variant` (String): Bootstrap color variant (default: 'primary')
- `containerClass` (String): CSS classes for container (default: 'py-5')

---

#### **ErrorAlert**

Displays error messages in a Bootstrap alert.

```vue
<ErrorAlert :error="store.error" title="Error" dismissible @dismiss="store.error = null" />
```

**Props:**
- `error` (String|Object|Error): Error to display
- `title` (String): Alert title
- `variant` (String): 'danger', 'warning', 'info', 'success' (default: 'danger')
- `dismissible` (Boolean): Show dismiss button (default: false)

**Events:**
- `dismiss`: Emitted when dismiss button is clicked

---

#### **DataTable**

Generic table component with pagination support.

```vue
<DataTable
  :columns="columns"
  :items="items"
  :pagination="paginationData"
  empty-message="No data found."
  @page-change="handlePageChange"
>
  <template #body="{ items }">
    <tr v-for="item in items" :key="item.id">
      <td>{{ item.name }}</td>
      <td>{{ item.value }}</td>
    </tr>
  </template>
</DataTable>
```

**Props:**
- `columns` (Array, required): Column definitions
  ```javascript
  [
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'name', label: 'Name' }
  ]
  ```
- `items` (Array, required): Data items
- `loading` (Boolean): Show loading state
- `emptyMessage` (String): Message when no data
- `pagination` (Object): Pagination data

**Slots:**
- `filters`: Search/filter components
- `body`: Table body rows (receives `items` prop)

**Events:**
- `page-change`: Emitted when page changes

---

#### **EmptyState**

Displays an empty state with icon, message, and optional action button.

```vue
<EmptyState
  icon="bi-inbox"
  title="No Data Found"
  message="Start by adding your first item."
  action-text="Add Item"
  @action="handleCreate"
/>
```

**Props:**
- `icon` (String): Bootstrap icon class (default: 'bi-inbox')
- `title` (String): Empty state title
- `message` (String): Empty state message
- `actionText` (String): Action button text
- `actionIcon` (String): Action button icon (default: 'bi-plus-circle')

**Slots:**
- `action`: Custom action content

**Events:**
- `action`: Emitted when action button is clicked

---

#### **InvoiceItemsTable**

Specialized component for invoice line items (purchases, sales).

```vue
<InvoiceItemsTable
  :items="formData.items"
  :products="productStore.products"
  :available-units="availableUnits"
  :show-base-unit-qty="true"
  @add-item="addItem"
  @remove-item="removeItem"
  @product-change="loadProductUnits"
/>
```

**Props:**
- `items` (Array, required): Invoice line items
- `products` (Array): Available products
- `availableUnits` (Array): Available units for selected product
- `showBaseUnitQty` (Boolean): Show base unit quantity column
- `showBaseUnitNote` (Boolean): Show base unit note
- `addItemTitle` (String): Title for add item section
- `currency` (String): Currency symbol (default: '৳')

**Events:**
- `add-item`: Emitted when adding an item
- `remove-item`: Emitted when removing an item
- `product-change`: Emitted when product selection changes
- `unit-change`: Emitted when unit selection changes

---

## Creating a New Page

Follow this template when creating a new CRUD page:

```vue
<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <PageHeader title="Your Title" icon="bi-icon">
      <template #actions>
        <button class="btn btn-primary" @click="handleCreate">
          <i class="bi bi-plus-circle me-2"></i>Add Item
        </button>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <LoadingSpinner v-if="store.loading" />

    <!-- Error State -->
    <ErrorAlert :error="store.error" title="Error" dismissible @dismiss="store.error = null" />

    <!-- Data Table -->
    <DataTable
      v-if="!store.loading"
      :columns="columns"
      :items="store.items"
      :pagination="paginationData"
      empty-message="No items found."
      @page-change="handlePageChange"
    >
      <template #body="{ items }">
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.name }}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-2" @click="handleEdit(item)">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="handleDelete(item)">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <div class="modal fade" tabindex="-1" aria-hidden="true" ref="modalRef">
      <!-- Your modal content -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useYourStore } from '@/stores/your.store'
import { useModal } from '@/composables/useModal'
import { useFormatter } from '@/composables/useFormatter'
import { useConfirm } from '@/composables/useConfirm'
import { usePagination } from '@/composables/usePagination'

// Components
import PageHeader from '@/components/common/PageHeader.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import DataTable from '@/components/common/DataTable.vue'

// Store
const store = useYourStore()

// Composables
const { modalRef, show: showModal, hide: hideModal } = useModal()
const { formatDate, formatCurrency } = useFormatter()
const { confirmDelete } = useConfirm()
const pagination = usePagination(10)

// State
const isEditing = ref(false)
const selectedItem = ref(null)
const formData = ref({ name: '' })

// Table columns
const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Name' },
  { key: 'actions', label: 'Actions', width: '150px' }
]

// Computed
const paginationData = computed(() => ({
  currentPage: pagination.currentPage.value,
  totalPages: pagination.totalPages.value,
  totalItems: pagination.totalItems.value,
  startIndex: pagination.startIndex.value,
  endIndex: pagination.endIndex.value,
  hasNextPage: pagination.hasNextPage.value,
  hasPrevPage: pagination.hasPrevPage.value
}))

// Lifecycle
onMounted(async () => {
  await fetchItems()
})

// Methods
const fetchItems = async () => {
  await store.fetchItems(pagination.getParams())
  if (store.pagination) {
    pagination.updateFromResponse(store.pagination)
  }
}

const handlePageChange = async (page) => {
  pagination.goToPage(page)
  await fetchItems()
}

const handleCreate = () => {
  isEditing.value = false
  selectedItem.value = null
  resetForm()
  showModal()
}

const handleEdit = (item) => {
  isEditing.value = true
  selectedItem.value = item
  formData.value = { ...item }
  showModal()
}

const handleSave = async () => {
  try {
    if (isEditing.value) {
      await store.updateItem(selectedItem.value.id, formData.value)
    } else {
      await store.createItem(formData.value)
    }
    hideModal()
    resetForm()
    await fetchItems()
  } catch (error) {
    console.error('Error saving item:', error)
  }
}

const handleDelete = async (item) => {
  const confirmed = await confirmDelete(item.name, 'item')
  if (confirmed) {
    try {
      await store.deleteItem(item.id)
      await fetchItems()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }
}

const resetForm = () => {
  formData.value = { name: '' }
}
</script>
```

## Best Practices

1. **Component Composition**: Break down complex components into smaller, reusable pieces
2. **Composables for Logic**: Extract reusable logic into composables, not components
3. **Consistent Naming**: Use descriptive names (`handle*` for event handlers, `fetch*` for API calls)
4. **Error Handling**: Always handle errors in try-catch blocks; let stores handle error state
5. **Loading States**: Use `LoadingSpinner` for async operations
6. **Pagination**: Use `usePagination` composable for consistent pagination logic
7. **Formatting**: Use `useFormatter` for all data formatting
8. **Modals**: Use `useModal` composable for modal management

## Benefits

1. **Code Reusability**: Components and composables can be used across multiple pages
2. **Maintainability**: Changes to common functionality only need to be made in one place
3. **Consistency**: UI and UX are consistent across the application
4. **Testability**: Composables and components can be tested independently
5. **Developer Experience**: Faster development with pre-built components
6. **Type Safety**: Easy to add TypeScript support in the future

## Example: Refactored vs Original

### Original (CustomerPage.vue) - 234 lines

```vue
<template>
  <div class="container-fluid">
    <div class="row mb-4">
      <div class="col">
        <h2 class="mb-3">
          <i class="bi bi-person-circle me-2"></i>Customer Management
        </h2>
      </div>
      <div class="col-auto">
        <button class="btn btn-primary" @click="showCreateModal">
          <i class="bi bi-plus-circle me-2"></i>Add Customer
        </button>
      </div>
    </div>

    <div v-if="customerStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-if="customerStore.error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ customerStore.error }}
    </div>

    <!-- Large table markup... -->
    <!-- Large modal markup... -->
    <!-- Repeated logic... -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCustomerStore } from '../stores/customer.store'
import { Modal } from 'bootstrap'

const customerStore = useCustomerStore()
const modalRef = ref(null)
let modalInstance = null
// ... lots of boilerplate code
</script>
```

### Refactored (CustomerPage.vue) - ~150 lines, more readable

```vue
<template>
  <div class="container-fluid">
    <PageHeader title="Customer Management" icon="bi-person-circle">
      <template #actions>
        <button class="btn btn-primary" @click="handleCreate">
          <i class="bi bi-plus-circle me-2"></i>Add Customer
        </button>
      </template>
    </PageHeader>

    <LoadingSpinner v-if="customerStore.loading" />
    <ErrorAlert :error="customerStore.error" dismissible @dismiss="customerStore.error = null" />

    <DataTable :columns="columns" :items="customerStore.customers">
      <template #body="{ items }">
        <!-- Clean, focused table rows -->
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { useCustomerStore } from '@/stores/customer.store'
import { useModal, useFormatter, useConfirm, usePagination } from '@/composables'
import PageHeader from '@/components/common/PageHeader.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import DataTable from '@/components/common/DataTable.vue'

// Clean, organized, reusable code
</script>
```

## Summary

The modular architecture makes the codebase:
- **Easier to understand** - Clear separation of concerns
- **Faster to develop** - Reusable components reduce boilerplate
- **Simpler to maintain** - Changes in one place affect all uses
- **More consistent** - UI/UX patterns are standardized
- **Better tested** - Isolated components and composables

Follow this architecture for all new pages and gradually refactor existing ones.

