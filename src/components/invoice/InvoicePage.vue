<template>
  <div class="container-fluid">
    <!-- List View -->
    <template v-if="!showFormView">
      <!-- Page Header -->
      <PageHeader :title="config.title" :icon="config.icon">
        <template #actions>
          <button class="btn btn-primary" @click="handleCreate">
            <i class="bi bi-plus-circle me-2"></i>{{ config.buttonLabel }}
          </button>
        </template>
      </PageHeader>

      <!-- Loading State -->
      <LoadingSpinner v-if="invoiceStore.loading" />

      <!-- Error State -->
      <ErrorAlert :error="invoiceStore.error" title="Error" dismissible @dismiss="invoiceStore.error = null" />

      <!-- Data Table -->
      <DataTable v-if="!invoiceStore.loading" :columns="columns" :items="invoiceStore[config.itemsField] || []" :pagination="paginationData" :empty-message="config.emptyMessage" @page-change="handlePageChange">
        <template #filters>
          <!-- eslint-disable-next-line vue/no-v-model-argument -->
          <DataTableFilters v-model:search="filters.search" v-model:status="filters.status" v-model:paymentStatus="filters.paymentStatus" :status-options="config.statusOptions" :payment-status-options="config.paymentStatusOptions" :status-label="getStatusFilterLabel()" :search-placeholder="getSearchPlaceholder()" @filter-change="handleFilterChange" />
        </template>
        <template #body="{ items }">
          <tr v-for="invoice in items" :key="invoice.id">
            <td><strong>{{ invoice.invoice_number || invoice.id }}</strong></td>
            <td>{{ invoice[config.entityNameField] || `${config.entityLabel} ${invoice[config.entityField]}` }}</td>
            <td>{{ invoice.warehouse_name || `Warehouse ${invoice.warehouse}` }}</td>
            <td>{{ formatDate(invoice.invoice_date) }}</td>
            <td>
              <span class="badge" :class="getStatusClass(invoice.status, config.statusClassOptions)">
                {{ invoice.status }}
              </span>
            </td>
            <td>
              <span class="badge" :class="getPaymentStatusClass(invoice.payment_status)">
                {{ invoice.payment_status || 'unpaid' }}
              </span>
            </td>
            <td><strong>{{ formatCurrency(invoice.grand_total) }}</strong></td>
            <td>
              <button class="btn btn-sm btn-outline-success me-2" @click="handleDownloadPDF(invoice)" title="Download PDF">
                <i class="bi bi-file-pdf"></i>
              </button>
              <button class="btn btn-sm btn-outline-info me-2" @click="handleView(invoice)" title="View">
                <i class="bi bi-eye"></i>
              </button>
              <LabelPrinter v-if="props.type === 'sale' || props.type === 'sale_return'" :sale="invoice" :show-button="true" :show-button-text="false" button-class="btn btn-sm btn-outline-warning me-2" button-icon="bi bi-printer" button-title="Print Label" />
              <button v-if="invoice.status !== config.finalStatus" class="btn btn-sm btn-outline-primary me-2" @click="handleEdit(invoice)" title="Edit">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="handleDelete(invoice)" title="Delete">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        </template>
      </DataTable>

      <!-- Modal UI (disabled entirely when fullPage=true) -->
      <div v-if="!fullPage" class="modal fade" tabindex="-1" aria-hidden="true" ref="modalRef">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ config.viewLabels.title(isViewMode ? 'view' : 'edit', isEditing) }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <!-- View Mode (Read-only) -->
              <template v-if="isViewMode">
                <!-- Invoice Header Info -->
                <div class="row mb-4">
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Invoice Number</label>
                    <p class="form-control-plaintext">{{ selectedInvoice?.invoice_number || `#${selectedInvoice?.id}` }}</p>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-bold">{{ config.entityLabel }}</label>
                    <p class="form-control-plaintext">{{ selectedInvoice?.[config.entityNameField] || '-' }}</p>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Warehouse</label>
                    <p class="form-control-plaintext">{{ selectedInvoice?.warehouse_name || '-' }}</p>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Invoice Date</label>
                    <p class="form-control-plaintext">{{ formatDate(selectedInvoice?.invoice_date) }}</p>
                  </div>
                </div>
                <div class="row mb-4">
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Status</label>
                    <p>
                      <span class="badge" :class="getStatusClass(selectedInvoice?.status, config.statusClassOptions)">
                        {{ selectedInvoice?.status }}
                      </span>
                    </p>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Payment Status</label>
                    <p>
                      <span class="badge" :class="getPaymentStatusClass(selectedInvoice?.payment_status)">
                        {{ selectedInvoice?.payment_status || 'unpaid' }}
                      </span>
                    </p>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Paid Amount</label>
                    <p class="form-control-plaintext">{{ formatCurrency(selectedInvoice?.paid_amount || 0) }}</p>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Grand Total</label>
                    <p class="form-control-plaintext fs-5 text-success fw-bold">{{ formatCurrency(selectedInvoice?.grand_total) }}</p>
                  </div>
                </div>
                <div class="row mb-4" v-if="selectedInvoice">
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Balance</label>
                    <p class="form-control-plaintext fs-5" :class="(selectedInvoice.grand_total - (selectedInvoice.paid_amount || 0)) > 0 ? 'text-danger' : 'text-success'">
                      {{ formatCurrency((selectedInvoice.grand_total || 0) - (selectedInvoice.paid_amount || 0)) }}
                    </p>
                  </div>
                </div>

                <!-- Items Table (Read-only) -->
                <div class="table-responsive mb-3">
                  <table class="table table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                        <th>Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in selectedInvoice?.items || []" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ getProductName(item.product) }}</td>
                        <td>{{ item.quantity }}</td>
                        <td>{{ item.unit_name || getUnitName(item.unit) }}</td>
                        <td>{{ formatCurrency(item.unit_price) }}</td>
                        <td><strong>{{ formatCurrency(item.line_total) }}</strong></td>
                      </tr>
                      <tr v-if="!selectedInvoice?.items || selectedInvoice.items.length === 0">
                        <td colspan="6" class="text-center text-muted">No items</td>
                      </tr>
                    </tbody>
                    <tfoot v-if="selectedInvoice?.items && selectedInvoice.items.length > 0">
                      <tr>
                        <td colspan="4" class="text-end"><strong>Sub Total:</strong></td>
                        <td colspan="2"><strong>{{ formatCurrency(selectedInvoice.sub_total || 0) }}</strong></td>
                      </tr>
                      <tr v-if="selectedInvoice.tax > 0">
                        <td colspan="4" class="text-end"><strong>Tax:</strong></td>
                        <td colspan="2"><strong>{{ formatCurrency(selectedInvoice.tax || 0) }}</strong></td>
                      </tr>
                      <tr v-if="selectedInvoice.delivery_charge > 0">
                        <td colspan="4" class="text-end"><strong>Delivery Charge:</strong></td>
                        <td colspan="2"><strong>{{ formatCurrency(selectedInvoice.delivery_charge || 0) }}</strong></td>
                      </tr>
                      <tr v-if="selectedInvoice.discount > 0">
                        <td colspan="4" class="text-end"><strong>Discount:</strong></td>
                        <td colspan="2"><strong class="text-danger">-{{ formatCurrency(selectedInvoice.discount || 0) }}</strong></td>
                      </tr>
                      <tr class="table-success">
                        <td colspan="4" class="text-end"><strong>Grand Total:</strong></td>
                        <td colspan="2"><strong>{{ formatCurrency(selectedInvoice.grand_total) }}</strong></td>
                      </tr>
                      <tr v-if="selectedInvoice.paid_amount > 0">
                        <td colspan="4" class="text-end"><strong>Paid Amount:</strong></td>
                        <td colspan="2"><strong class="text-success">{{ formatCurrency(selectedInvoice.paid_amount || 0) }}</strong></td>
                      </tr>
                      <tr v-if="selectedInvoice.paid_amount > 0">
                        <td colspan="4" class="text-end"><strong>Balance:</strong></td>
                        <td colspan="2">
                          <strong :class="(selectedInvoice.grand_total - (selectedInvoice.paid_amount || 0)) > 0 ? 'text-danger' : 'text-success'">
                            {{ formatCurrency((selectedInvoice.grand_total || 0) - (selectedInvoice.paid_amount || 0)) }}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <!-- Notes (Read-only) -->
                <div v-if="selectedInvoice?.notes" class="mb-3">
                  <label class="form-label fw-bold">Notes</label>
                  <p class="form-control-plaintext">{{ selectedInvoice.notes }}</p>
                </div>
              </template>

              <!-- Edit/Create Mode (Form) -->
              <template v-else>
                <!-- Invoice Header -->
                <div class="row mb-4">
                  <div class="col-md-3">
                    <label class="form-label">{{ config.entityLabel }} <span class="text-danger">*</span></label>
                    <VueSelect v-model="formData[config.entityField]" :options="entityStore[getEntityListName()]" label="name" :reduce="entity => entity.id" :placeholder="`Select ${config.entityLabel}`" />
                  </div>

                  <div class="col-md-3">
                    <label class="form-label">Warehouse <span class="text-danger">*</span></label>
                    <VueSelect v-model="formData.warehouse" :options="warehouseStore.warehouses" label="name" :reduce="warehouse => warehouse.id" placeholder="Select Warehouse" />
                  </div>

                  <div class="col-md-3">
                    <label class="form-label">Invoice Date</label>
                    <input v-model="formData.invoice_date" type="date" class="form-control" />
                  </div>

                  <div class="col-md-3">
                    <label class="form-label">Status</label>
                    <VueSelect v-model="formData.status" :options="config.statusOptions" placeholder="Select Status" />
                  </div>
                </div>

                <!-- Invoice Items -->
                <InvoiceItemsTable ref="invoiceItemsRef" :items="formData.items" :products="productStore.products" :available-units="availableUnits" :show-base-unit-qty="false" :show-base-unit-note="false" add-item-title="Add Items" @add-item="addItem" @update-item="updateItem" @remove-item="removeItem" @product-change="loadProductUnits" @unit-change="handleUnitChange">
                  <template #unit-name="{ item }">
                    {{ getUnitNameFromItem(item) }}
                  </template>
                </InvoiceItemsTable>

                <!-- Financial Summary -->
                <div class="card mb-3 border-0 shadow-sm">
                  <div class="card-header bg-white d-flex align-items-center justify-content-between">
                    <h6 class="mb-0">Financial Summary</h6>
                    <span class="badge" :class="getPaymentStatusClass(formData.payment_status)">
                      {{ formData.payment_status || 'unpaid' }}
                    </span>
                  </div>
                  <div class="card-body">
                    <div class="row g-3">
                      <!-- Left: totals & adjustments -->
                      <div class="col-lg-7">
                        <div class="row g-3">
                          <div class="col-md-6">
                            <label class="form-label">Sub Total</label>
                            <div class="input-group">
                              <span class="input-group-text">৳</span>
                              <input v-model.number="formData.sub_total" type="number" step="0.01" class="form-control text-end bg-light" readonly />
                            </div>
                          </div>
                          <div class="col-md-6">
                            <label class="form-label">Tax</label>
                            <div class="input-group">
                              <span class="input-group-text">৳</span>
                              <input v-model.number="formData.tax" type="number" step="0.01" min="0" class="form-control text-end" @input="calculateGrandTotal" />
                            </div>
                          </div>
                          <div class="col-md-6">
                            <label class="form-label">Delivery Charge</label>
                            <div class="input-group">
                              <span class="input-group-text">৳</span>
                              <input v-model.number="formData.delivery_charge" type="number" step="0.01" min="0" class="form-control text-end" @input="calculateGrandTotal" />
                            </div>
                          </div>
                          <div class="col-md-6">
                            <label class="form-label">Discount</label>
                            <div class="input-group">
                              <span class="input-group-text">৳</span>
                              <input v-model.number="formData.discount" type="number" step="0.01" min="0" class="form-control text-end" @input="calculateGrandTotal" />
                            </div>
                            <div class="form-text">Discount will reduce the grand total.</div>
                          </div>
                        </div>
                      </div>

                      <!-- Right: payment & balance -->
                      <div class="col-lg-5">
                        <div class="p-3 rounded border bg-light">
                          <div class="mb-3">
                            <label class="form-label">Grand Total</label>
                            <div class="input-group input-group-lg">
                              <span class="input-group-text">৳</span>
                              <input :value="formData.grand_total.toFixed(2)" type="text" class="form-control text-end bg-white" readonly />
                            </div>
                          </div>

                          <div class="mb-3">
                            <label class="form-label">Paid Amount</label>
                            <div class="input-group">
                              <span class="input-group-text">৳</span>
                              <input v-model.number="formData.paid_amount" type="number" step="0.01" min="0" class="form-control text-end" @input="updatePaymentStatus" />
                            </div>
                          </div>

                          <hr class="my-3" />

                          <div class="d-flex align-items-center justify-content-between">
                            <div class="fw-semibold">Balance</div>
                            <div class="fs-5 fw-bold" :class="(formData.grand_total - formData.paid_amount) > 0 ? 'text-danger' : 'text-success'">
                              {{ formatCurrency(formData.grand_total - formData.paid_amount) }}
                            </div>
                          </div>
                          <div class="small text-muted mt-1">
                            Balance = Grand Total − Paid Amount
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div class="mb-3">
                  <label class="form-label">Notes</label>
                  <textarea v-model="formData.notes" class="form-control" rows="2" placeholder="Optional notes..."></textarea>
                </div>
              </template>
            </div>
            <div class="modal-footer">
              <div class="me-auto">
                <LabelPrinter v-if="isViewMode && (props.type === 'sale' || props.type === 'sale_return') && selectedInvoice" :sale="selectedInvoice" :show-button="true" :show-button-text="true" button-class="btn btn-warning" button-icon="bi bi-printer me-2" button-text="Print Labels" button-title="Print Labels for All Items" />
              </div>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ isViewMode ? 'Close' : 'Cancel' }}</button>
              <button v-if="!isViewMode" type="button" class="btn btn-primary" @click="handleSave" :disabled="formData.items.length === 0">
                <i class="bi bi-save me-2"></i>{{ config.editLabels.button(isEditing) }}
              </button>
              <button v-if="isViewMode && selectedInvoice?.status !== config.finalStatus" type="button" class="btn btn-primary" @click="switchToEditMode">
                <i class="bi bi-pencil me-2"></i>{{ config.editLabels.editButton }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Full Page Form View -->
    <template v-if="showFormView && fullPage">
      <!-- Page Header with Back Button -->
      <PageHeader :title="config.viewLabels.title(isViewMode ? 'view' : 'edit', isEditing)" :icon="config.icon">
        <template #actions>
          <button class="btn btn-secondary me-2" @click="handleBack">
            <i class="bi bi-arrow-left me-2"></i>Back to List
          </button>
          <button v-if="!isViewMode" type="button" class="btn btn-primary" @click="handleSave" :disabled="formData.items.length === 0">
            <i class="bi bi-save me-2"></i>{{ config.editLabels.button(isEditing) }}
          </button>
          <button v-if="isViewMode && selectedInvoice?.status !== config.finalStatus" type="button" class="btn btn-primary" @click="switchToEditMode">
            <i class="bi bi-pencil me-2"></i>{{ config.editLabels.editButton }}
          </button>
        </template>
      </PageHeader>

      <!-- Error State -->
      <ErrorAlert :error="invoiceStore.error" title="Error" dismissible @dismiss="invoiceStore.error = null" />

      <!-- Form Content -->
      <div class="card">
        <div class="card-body">
          <!-- View Mode (Read-only) -->
          <template v-if="isViewMode">
            <!-- Invoice Header Info -->
            <div class="row mb-4">
              <div class="col-md-3">
                <label class="form-label fw-bold">Invoice Number</label>
                <p class="form-control-plaintext">{{ selectedInvoice?.invoice_number || `#${selectedInvoice?.id}` }}</p>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">{{ config.entityLabel }}</label>
                <p class="form-control-plaintext">{{ selectedInvoice?.[config.entityNameField] || '-' }}</p>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">Warehouse</label>
                <p class="form-control-plaintext">{{ selectedInvoice?.warehouse_name || '-' }}</p>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">Invoice Date</label>
                <p class="form-control-plaintext">{{ formatDate(selectedInvoice?.invoice_date) }}</p>
              </div>
            </div>
            <div class="row mb-4">
              <div class="col-md-3">
                <label class="form-label fw-bold">Status</label>
                <p>
                  <span class="badge" :class="getStatusClass(selectedInvoice?.status, config.statusClassOptions)">
                    {{ selectedInvoice?.status }}
                  </span>
                </p>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">Payment Status</label>
                <p>
                  <span class="badge" :class="getPaymentStatusClass(selectedInvoice?.payment_status)">
                    {{ selectedInvoice?.payment_status || 'unpaid' }}
                  </span>
                </p>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">Paid Amount</label>
                <p class="form-control-plaintext">{{ formatCurrency(selectedInvoice?.paid_amount || 0) }}</p>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">Grand Total</label>
                <p class="form-control-plaintext fs-5 text-success fw-bold">{{ formatCurrency(selectedInvoice?.grand_total) }}</p>
              </div>
            </div>
            <div class="row mb-4" v-if="selectedInvoice">
              <div class="col-md-3">
                <label class="form-label fw-bold">Balance</label>
                <p class="form-control-plaintext fs-5" :class="(selectedInvoice.grand_total - (selectedInvoice.paid_amount || 0)) > 0 ? 'text-danger' : 'text-success'">
                  {{ formatCurrency((selectedInvoice.grand_total || 0) - (selectedInvoice.paid_amount || 0)) }}
                </p>
              </div>
            </div>

            <!-- Items Table (Read-only) -->
            <div class="table-responsive mb-3">
              <table class="table table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in selectedInvoice?.items || []" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ getProductName(item.product) }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ item.unit_name || getUnitName(item.unit) }}</td>
                    <td>{{ formatCurrency(item.unit_price) }}</td>
                    <td><strong>{{ formatCurrency(item.line_total) }}</strong></td>
                  </tr>
                  <tr v-if="!selectedInvoice?.items || selectedInvoice.items.length === 0">
                    <td colspan="6" class="text-center text-muted">No items</td>
                  </tr>
                </tbody>
                <tfoot v-if="selectedInvoice?.items && selectedInvoice.items.length > 0">
                  <tr>
                    <td colspan="4" class="text-end"><strong>Sub Total:</strong></td>
                    <td colspan="2"><strong>{{ formatCurrency(selectedInvoice.sub_total || 0) }}</strong></td>
                  </tr>
                  <tr v-if="selectedInvoice.tax > 0">
                    <td colspan="4" class="text-end"><strong>Tax:</strong></td>
                    <td colspan="2"><strong>{{ formatCurrency(selectedInvoice.tax || 0) }}</strong></td>
                  </tr>
                  <tr v-if="selectedInvoice.delivery_charge > 0">
                    <td colspan="4" class="text-end"><strong>Delivery Charge:</strong></td>
                    <td colspan="2"><strong>{{ formatCurrency(selectedInvoice.delivery_charge || 0) }}</strong></td>
                  </tr>
                  <tr v-if="selectedInvoice.discount > 0">
                    <td colspan="4" class="text-end"><strong>Discount:</strong></td>
                    <td colspan="2"><strong class="text-danger">-{{ formatCurrency(selectedInvoice.discount || 0) }}</strong></td>
                  </tr>
                  <tr class="table-success">
                    <td colspan="4" class="text-end"><strong>Grand Total:</strong></td>
                    <td colspan="2"><strong>{{ formatCurrency(selectedInvoice.grand_total) }}</strong></td>
                  </tr>
                  <tr v-if="selectedInvoice.paid_amount > 0">
                    <td colspan="4" class="text-end"><strong>Paid Amount:</strong></td>
                    <td colspan="2"><strong class="text-success">{{ formatCurrency(selectedInvoice.paid_amount || 0) }}</strong></td>
                  </tr>
                  <tr v-if="selectedInvoice.paid_amount > 0">
                    <td colspan="4" class="text-end"><strong>Balance:</strong></td>
                    <td colspan="2">
                      <strong :class="(selectedInvoice.grand_total - (selectedInvoice.paid_amount || 0)) > 0 ? 'text-danger' : 'text-success'">
                        {{ formatCurrency((selectedInvoice.grand_total || 0) - (selectedInvoice.paid_amount || 0)) }}
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Notes (Read-only) -->
            <div v-if="selectedInvoice?.notes" class="mb-3">
              <label class="form-label fw-bold">Notes</label>
              <p class="form-control-plaintext">{{ selectedInvoice.notes }}</p>
            </div>
          </template>

          <!-- Edit/Create Mode (Form) -->
          <template v-else>
            <!-- Invoice Header -->
            <div class="row mb-4">
              <div class="col-md-3">
                <label class="form-label">{{ config.entityLabel }} <span class="text-danger">*</span></label>
                <VueSelect v-model="formData[config.entityField]" :options="entityStore[getEntityListName()]" label="name" :reduce="entity => entity.id" :placeholder="`Select ${config.entityLabel}`" />
              </div>

              <div class="col-md-3">
                <label class="form-label">Warehouse <span class="text-danger">*</span></label>
                <VueSelect v-model="formData.warehouse" :options="warehouseStore.warehouses" label="name" :reduce="warehouse => warehouse.id" placeholder="Select Warehouse" />
              </div>

              <div class="col-md-3">
                <label class="form-label">Invoice Date</label>
                <input v-model="formData.invoice_date" type="date" class="form-control" />
              </div>

              <div class="col-md-3">
                <label class="form-label">Status</label>
                <VueSelect v-model="formData.status" :options="config.statusOptions" placeholder="Select Status" />
              </div>
            </div>

            <!-- Invoice Items -->
            <InvoiceItemsTable ref="invoiceItemsRef" :items="formData.items" :products="productStore.products" :available-units="availableUnits" :show-base-unit-qty="false" :show-base-unit-note="false" add-item-title="Add Items" @add-item="addItem" @update-item="updateItem" @remove-item="removeItem" @product-change="loadProductUnits" @unit-change="handleUnitChange">
              <template #unit-name="{ item }">
                {{ getUnitNameFromItem(item) }}
              </template>
            </InvoiceItemsTable>

            <!-- Financial Summary -->
            <div class="card mb-3 border-0 shadow-sm">
              <div class="card-header bg-white d-flex align-items-center justify-content-between">
                <h6 class="mb-0">Financial Summary</h6>
                <span class="badge" :class="getPaymentStatusClass(formData.payment_status)">
                  {{ formData.payment_status || 'unpaid' }}
                </span>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <!-- Left: totals & adjustments -->
                  <div class="col-lg-7">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label">Sub Total</label>
                        <div class="input-group">
                          <span class="input-group-text">৳</span>
                          <input v-model.number="formData.sub_total" type="number" step="0.01" class="form-control text-end bg-light" readonly />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Tax</label>
                        <div class="input-group">
                          <span class="input-group-text">৳</span>
                          <input v-model.number="formData.tax" type="number" step="0.01" min="0" class="form-control text-end" @input="calculateGrandTotal" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Delivery Charge</label>
                        <div class="input-group">
                          <span class="input-group-text">৳</span>
                          <input v-model.number="formData.delivery_charge" type="number" step="0.01" min="0" class="form-control text-end" @input="calculateGrandTotal" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Discount</label>
                        <div class="input-group">
                          <span class="input-group-text">৳</span>
                          <input v-model.number="formData.discount" type="number" step="0.01" min="0" class="form-control text-end" @input="calculateGrandTotal" />
                        </div>
                        <div class="form-text">Discount will reduce the grand total.</div>
                      </div>
                    </div>
                  </div>

                  <!-- Right: payment & balance -->
                  <div class="col-lg-5">
                    <div class="p-3 rounded border bg-light">
                      <div class="mb-3">
                        <label class="form-label">Grand Total</label>
                        <div class="input-group input-group-lg">
                          <span class="input-group-text">৳</span>
                          <input :value="formData.grand_total.toFixed(2)" type="text" class="form-control text-end bg-white" readonly />
                        </div>
                      </div>

                      <div class="mb-3">
                        <label class="form-label">Paid Amount</label>
                        <div class="input-group">
                          <span class="input-group-text">৳</span>
                          <input v-model.number="formData.paid_amount" type="number" step="0.01" min="0" class="form-control text-end" @input="updatePaymentStatus" />
                        </div>
                      </div>

                      <hr class="my-3" />

                      <div class="d-flex align-items-center justify-content-between">
                        <div class="fw-semibold">Balance</div>
                        <div class="fs-5 fw-bold" :class="(formData.grand_total - formData.paid_amount) > 0 ? 'text-danger' : 'text-success'">
                          {{ formatCurrency(formData.grand_total - formData.paid_amount) }}
                        </div>
                      </div>
                      <div class="small text-muted mt-1">
                        Balance = Grand Total − Paid Amount
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="mb-3">
              <label class="form-label">Notes</label>
              <textarea v-model="formData.notes" class="form-control" rows="2" placeholder="Optional notes..."></textarea>
            </div>

            <!-- Bottom Actions (Full Page) -->
            <div v-if="fullPage" class="d-flex justify-content-end gap-2 pt-2">
              <button type="button" class="btn btn-outline-secondary" @click="handleBack">
                Cancel
              </button>
              <button type="button" class="btn btn-primary" @click="handleSave" :disabled="formData.items.length === 0">
                <i class="bi bi-save me-2"></i>{{ config.editLabels.button(isEditing) }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../../utility/axios'
import { useInvoicePage } from '../../composables/useInvoicePage'
import { useModal } from '../../composables/useModal'
import { useFormatter } from '../../composables/useFormatter'
import { useConfirm } from '../../composables/useConfirm'
import { usePagination } from '../../composables/usePagination'
import { formatUnitConversion } from '../../utility/unitConverter'

// Components
import PageHeader from '../common/PageHeader.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import ErrorAlert from '../common/ErrorAlert.vue'
import DataTable from '../common/DataTable.vue'
import DataTableFilters from '../common/DataTableFilters.vue'
import LabelPrinter from '../common/LabelPrinter.vue'
import InvoiceItemsTable from '../common/InvoiceItemsTable.vue'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

// Props
const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['purchase', 'sale', 'purchase_return', 'sale_return'].includes(value)
  },
  fullPage: {
    type: Boolean,
    default: false
  }
})

// Use invoice page composable
const { config, invoiceStore, entityStore, warehouseStore, productStore, columns, getEntityListName } = useInvoicePage(props.type)

// Composables
const { modalRef, show: showModal, hide: hideModal } = useModal()
const { formatDate, formatCurrency, getStatusClass } = useFormatter()
const { confirmDelete } = useConfirm()
const pagination = usePagination(10)

// State
const isViewMode = ref(false)
const isEditing = ref(false)
const selectedInvoice = ref(null)
const editingInvoiceId = ref(null) // Store ID when editing
const availableUnits = ref([])
const unitsCache = ref(new Map())
const currentItemConversion = ref('')
const invoiceItemsRef = ref(null)
const showFormView = ref(false) // Control full-page form visibility
const filters = ref({
  search: '',
  status: '',
  paymentStatus: ''
})

const formData = ref({
  [config.entityField]: '',
  warehouse: '',
  invoice_date: new Date().toISOString().split('T')[0],
  status: 'pending',
  sub_total: 0.00,
  tax: 0.00,
  discount: 0.00,
  delivery_charge: 0.00,
  grand_total: 0.00,
  paid_amount: 0.00,
  payment_status: 'unpaid',
  notes: '',
  items: []
})

// Computed pagination data for DataTable
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
  const entityListName = getEntityListName()
  await Promise.all([
    fetchInvoices(),
    entityStore[entityListName === 'suppliers' ? 'fetchSuppliers' : 'fetchCustomers'](),
    warehouseStore.fetchWarehouses(),
    productStore.fetchProducts()
  ])
})

// Methods
const fetchInvoices = async () => {
  const params = pagination.getParams()
  
  // Add filter parameters
  if (filters.value.search) {
    params.search = filters.value.search
  }
  if (filters.value.status) {
    params.status = filters.value.status
  }
  if (filters.value.paymentStatus) {
    params.payment_status = filters.value.paymentStatus
  }
  
  await invoiceStore[config.fetchMethod](params)
  if (invoiceStore.pagination) {
    pagination.updateFromResponse(invoiceStore.pagination)
  }
}

const handlePageChange = async (page) => {
  pagination.goToPage(page)
  await fetchInvoices()
}

const handleFilterChange = async () => {
  // Reset to first page when filters change
  pagination.goToPage(1)
  await fetchInvoices()
}

const getStatusFilterLabel = () => {
  // For purchase, it's "Delivery Status" or just "Status"
  // For sale, it's "Delivery Status" 
  if (props.type === 'purchase' || props.type === 'purchase_return') {
    return 'Delivery Status'
  }
  return 'Delivery Status'
}

const getSearchPlaceholder = () => {
  // Different placeholders based on invoice type
  if (props.type === 'purchase' || props.type === 'purchase_return') {
    return 'Search by invoice number, supplier...'
  }
  return 'Search by invoice number, customer...'
}

const handleCreate = () => {
  isViewMode.value = false
  isEditing.value = false
  selectedInvoice.value = null
  editingInvoiceId.value = null
  resetForm()
  if (invoiceItemsRef.value?.cancelEdit) {
    invoiceItemsRef.value.cancelEdit()
  }
  if (props.fullPage) {
    showFormView.value = true
  } else {
    showModal()
  }
}

const handleEdit = async (invoice) => {
  if (invoice.status === config.finalStatus) {
    alert(config.finalStatusMessage)
    return
  }

  isViewMode.value = false
  isEditing.value = true
  selectedInvoice.value = null
  editingInvoiceId.value = invoice.id // Store ID for saving

  if (invoiceItemsRef.value?.cancelEdit) {
    invoiceItemsRef.value.cancelEdit()
  }

  // Load full invoice details
  const fullInvoice = await invoiceStore[config.fetchSingleMethod](invoice.id)

  // Cache unit names from loaded items
  if (fullInvoice.items && fullInvoice.items.length > 0) {
    fullInvoice.items.forEach(item => {
      if (item.unit_name && item.unit) {
        unitsCache.value.set(item.unit, item.unit_name)
      }
    })
  }

  formData.value = {
    [config.entityField]: fullInvoice[config.entityField],
    warehouse: fullInvoice.warehouse,
    invoice_date: fullInvoice.invoice_date,
    status: fullInvoice.status,
    sub_total: parseFloat(fullInvoice.sub_total) || 0.00,
    tax: parseFloat(fullInvoice.tax) || 0.00,
    discount: parseFloat(fullInvoice.discount) || 0.00,
    delivery_charge: parseFloat(fullInvoice.delivery_charge) || 0.00,
    grand_total: parseFloat(fullInvoice.grand_total) || 0.00,
    paid_amount: parseFloat(fullInvoice.paid_amount) || 0.00,
    payment_status: fullInvoice.payment_status || 'unpaid',
    notes: fullInvoice.notes || '',
    items: fullInvoice.items || []
  }
  
  // Recalculate totals from items if needed
  calculateGrandTotal()

  if (props.fullPage) {
    showFormView.value = true
  } else {
    showModal()
  }
}

const handleView = async (invoice) => {
  isViewMode.value = true
  isEditing.value = false

  // Load full invoice details
  const fullInvoice = await invoiceStore[config.fetchSingleMethod](invoice.id)

  // Cache unit names from loaded items
  if (fullInvoice.items && fullInvoice.items.length > 0) {
    fullInvoice.items.forEach(item => {
      if (item.unit_name && item.unit) {
        unitsCache.value.set(item.unit, item.unit_name)
      }
    })
  }

  selectedInvoice.value = fullInvoice
  
  // For fullPage mode, show form view; otherwise use modal
  if (props.fullPage) {
    showFormView.value = true
  } else {
    showModal()
  }
}

const switchToEditMode = () => {
  if (selectedInvoice.value?.status === config.finalStatus) {
    alert(config.finalStatusMessage)
    return
  }

  isViewMode.value = false
  isEditing.value = true
  editingInvoiceId.value = selectedInvoice.value.id

  if (invoiceItemsRef.value?.cancelEdit) {
    invoiceItemsRef.value.cancelEdit()
  }

  formData.value = {
    [config.entityField]: selectedInvoice.value[config.entityField],
    warehouse: selectedInvoice.value.warehouse,
    invoice_date: selectedInvoice.value.invoice_date,
    status: selectedInvoice.value.status,
    sub_total: parseFloat(selectedInvoice.value.sub_total) || 0.00,
    tax: parseFloat(selectedInvoice.value.tax) || 0.00,
    discount: parseFloat(selectedInvoice.value.discount) || 0.00,
    delivery_charge: parseFloat(selectedInvoice.value.delivery_charge) || 0.00,
    grand_total: parseFloat(selectedInvoice.value.grand_total) || 0.00,
    paid_amount: parseFloat(selectedInvoice.value.paid_amount) || 0.00,
    payment_status: selectedInvoice.value.payment_status || 'unpaid',
    notes: selectedInvoice.value.notes || '',
    items: selectedInvoice.value.items || []
  }
  
  // Recalculate totals from items if needed
  calculateGrandTotal()
}

const handleSave = async () => {
  if (!formData.value[config.entityField] || !formData.value.warehouse) {
    alert(`Please select ${config.entityLabel.toLowerCase()} and warehouse`)
    return
  }

  if (formData.value.items.length === 0) {
    alert('Please add at least one item')
    return
  }

  try {
    // payment_status is auto-detected (frontend + backend). Don't send it.
    const payload = { ...formData.value }
    delete payload.payment_status

    if (isEditing.value && editingInvoiceId.value) {
      await invoiceStore[config.updateMethod](editingInvoiceId.value, payload)
    } else {
      await invoiceStore[config.createMethod](payload)
    }
    if (props.fullPage) {
      showFormView.value = false
    } else {
      hideModal()
    }
    resetForm()
    await fetchInvoices()
  } catch (error) {
    console.error(`Error saving ${props.type}:`, error)
  }
}

const handleBack = () => {
  showFormView.value = false
  isViewMode.value = false
  isEditing.value = false
  selectedInvoice.value = null
  editingInvoiceId.value = null
  resetForm()
}

const handleDelete = async (invoice) => {
  const confirmed = await confirmDelete(invoice.invoice_number || `#${invoice.id}`, props.type)
  if (confirmed) {
    try {
      await invoiceStore[config.deleteMethod](invoice.id)
      await fetchInvoices()
    } catch (error) {
      console.error(`Error deleting ${props.type}:`, error)
    }
  }
}

const handleDownloadPDF = async (invoice) => {
  try {
    const response = await api.get(config.pdfEndpoint(invoice.id), {
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = config.pdfFileName(invoice)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading PDF:', error)
    alert('Failed to download PDF invoice. Please try again.')
  }
}

const loadProductUnits = async (productId) => {
  if (productId) {
    availableUnits.value = await productStore.fetchProductUnits(productId)
    availableUnits.value.forEach(unit => {
      unitsCache.value.set(unit.id, unit.name)
    })
    // Only update unit conversion for purchase types
    if (props.type === 'purchase' || props.type === 'purchase_return') {
      updateUnitConversion()
    }
  }
}

const handleUnitChange = () => {
  // Only update unit conversion for purchase types
  if (props.type === 'purchase' || props.type === 'purchase_return') {
    updateUnitConversion()
  }
}

const updateUnitConversion = () => {
  const currentItem = invoiceItemsRef.value?.currentItem
  if (currentItem?.unit && currentItem?.quantity > 0) {
    const selectedUnit = availableUnits.value.find(u => u.id === currentItem.unit)
    if (selectedUnit) {
      const product = productStore.products.find(p => p.id === currentItem.product)
      const baseUnitName = product?.base_unit_name || 'base unit'
      currentItemConversion.value = formatUnitConversion(
        currentItem.quantity,
        selectedUnit,
        baseUnitName
      )
    }
  } else {
    currentItemConversion.value = ''
  }
}

const getProductName = (productId) => {
  const product = productStore.products.find(p => p.id === productId)
  return product ? product.name : `Product ${productId}`
}

const getUnitName = (unitId) => {
  if (!unitId) return 'N/A'

  const unit = availableUnits.value.find(u => u.id === unitId)
  if (unit) return unit.name

  if (unitsCache.value.has(unitId)) {
    return unitsCache.value.get(unitId)
  }

  return `Unit ${unitId}`
}

const getUnitNameFromItem = (item) => {
  if (item.unit_name) {
    return item.unit_name
  }
  return getUnitName(item.unit)
}

const getPaymentStatusClass = (paymentStatus) => {
  if (!paymentStatus) return 'bg-secondary'
  const status = paymentStatus.toLowerCase()
  const classes = {
    unpaid: 'bg-danger',
    partial: 'bg-warning',
    paid: 'bg-success',
    overpaid: 'bg-info'
  }
  return classes[status] || 'bg-secondary'
}

const calculateGrandTotal = () => {
  // Calculate sub_total from items
  const subTotal = formData.value.items.reduce((sum, item) => {
    return sum + (parseFloat(item.line_total) || 0)
  }, 0)
  
  formData.value.sub_total = parseFloat(subTotal.toFixed(2))
  
  // Calculate grand_total = sub_total + tax + delivery_charge - discount
  const tax = parseFloat(formData.value.tax) || 0
  const deliveryCharge = parseFloat(formData.value.delivery_charge) || 0
  const discount = parseFloat(formData.value.discount) || 0
  
  formData.value.grand_total = parseFloat((subTotal + tax + deliveryCharge - discount).toFixed(2))
  
  // Auto-update payment status
  updatePaymentStatus()
}

const updatePaymentStatus = () => {
  const paidAmount = parseFloat(formData.value.paid_amount) || 0
  const grandTotal = parseFloat(formData.value.grand_total) || 0
  
  if (paidAmount <= 0) {
    formData.value.payment_status = 'unpaid'
  } else if (paidAmount >= grandTotal) {
    if (paidAmount > grandTotal) {
      formData.value.payment_status = 'overpaid'
    } else {
      formData.value.payment_status = 'paid'
    }
  } else {
    formData.value.payment_status = 'partial'
  }
}

const addItem = (item) => {
  formData.value.items.push({ ...item })
  if (item.unit_name && item.unit) {
    unitsCache.value.set(item.unit, item.unit_name)
  }
  availableUnits.value = []
  currentItemConversion.value = ''
  calculateGrandTotal()
}

const updateItem = (index, item) => {
  if (index >= 0 && index < formData.value.items.length) {
    formData.value.items[index] = { ...item }
    if (item.unit_name && item.unit) {
      unitsCache.value.set(item.unit, item.unit_name)
    }
    availableUnits.value = []
    currentItemConversion.value = ''
    calculateGrandTotal()
  }
}

const removeItem = (index) => {
  formData.value.items.splice(index, 1)
  calculateGrandTotal()
}

const resetForm = () => {
  formData.value = {
    [config.entityField]: '',
    warehouse: '',
    invoice_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    sub_total: 0.00,
    tax: 0.00,
    discount: 0.00,
    delivery_charge: 0.00,
    grand_total: 0.00,
    paid_amount: 0.00,
    payment_status: 'unpaid',
    notes: '',
    items: []
  }
  availableUnits.value = []
  currentItemConversion.value = ''
  if (invoiceItemsRef.value) {
    invoiceItemsRef.value.resetCurrentItem()
    if (invoiceItemsRef.value.cancelEdit) {
      invoiceItemsRef.value.cancelEdit()
    }
  }
}
</script>
