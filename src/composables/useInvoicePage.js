import { computed } from 'vue'
import { usePurchaseStore } from '../stores/purchase.store'
import { useSaleStore } from '../stores/sale.store'
import { useSupplierStore } from '../stores/supplier.store'
import { useCustomerStore } from '../stores/customer.store'
import { useWarehouseStore } from '../stores/warehouse.store'
import { useProductStore } from '../stores/product.store'

/**
 * Composable for invoice page configuration based on type
 * Supports: purchase, sale, purchase_return, sale_return
 */
export function useInvoicePage(type) {
  const configs = {
    purchase: {
      title: 'Purchase Management',
      icon: 'bi-bag-plus',
      buttonLabel: 'New Purchase',
      emptyMessage: 'No purchases found. Click \'New Purchase\' to create one.',
      entityLabel: 'Supplier',
      entityField: 'supplier',
      entityNameField: 'supplier_name',
      entityStore: () => useSupplierStore(),
      invoiceStore: () => usePurchaseStore(),
      itemsField: 'purchases',
      fetchMethod: 'fetchPurchases',
      fetchSingleMethod: 'fetchPurchase',
      createMethod: 'createPurchase',
      updateMethod: 'updatePurchase',
      deleteMethod: 'deletePurchase',
      apiEndpoint: '/purchases/',
      pdfEndpoint: (id) => `/purchases/${id}/pdf/`,
      pdfFileName: (invoice) => `purchase_invoice_${invoice.invoice_number || invoice.id}.pdf`,
      statusOptions: ['pending', 'completed', 'cancelled'],
      paymentStatusOptions: ['unpaid', 'partial', 'paid', 'overpaid'],
      finalStatus: 'completed',
      finalStatusMessage: 'Cannot edit a completed purchase',
      viewLabels: {
        title: (mode, editing) => {
          if (mode === 'view') return 'View Purchase'
          return editing ? 'Edit Purchase' : 'New Purchase'
        },
        entity: 'Supplier'
      },
      editLabels: {
        entity: 'Supplier',
        save: (editing) => editing ? 'Update' : 'Save',
        button: (editing) => `${editing ? 'Update' : 'Save'} Purchase`,
        editButton: 'Edit Purchase'
      }
    },
    sale: {
      title: 'Sale Management',
      icon: 'bi-cash-coin',
      buttonLabel: 'New Sale',
      emptyMessage: 'No sales found. Click \'New Sale\' to create one.',
      entityLabel: 'Customer',
      entityField: 'customer',
      entityNameField: 'customer_name',
      entityStore: () => useCustomerStore(),
      invoiceStore: () => useSaleStore(),
      itemsField: 'sales',
      fetchMethod: 'fetchSales',
      fetchSingleMethod: 'fetchSale',
      createMethod: 'createSale',
      updateMethod: 'updateSale',
      deleteMethod: 'deleteSale',
      apiEndpoint: '/sales/',
      pdfEndpoint: (id) => `/sales/${id}/pdf/`,
      pdfFileName: (invoice) => `invoice_${invoice.invoice_number || invoice.id}.pdf`,
      statusOptions: ['pending', 'delivered', 'partial_return', 'returned', 'cancelled'],
      formStatusOptions: ['pending', 'delivered', 'cancelled'], // Only these options in form (status field not required)
      paymentStatusOptions: ['unpaid', 'partial', 'paid', 'overpaid'],
      finalStatus: 'delivered',
      finalStatusMessage: 'Cannot edit a delivered sale',
      viewLabels: {
        title: (mode, editing) => {
          if (mode === 'view') return 'View Sale'
          return editing ? 'Edit Sale' : 'New Sale'
        },
        entity: 'Customer'
      },
      editLabels: {
        entity: 'Customer',
        save: (editing) => editing ? 'Update' : 'Save',
        button: (editing) => `${editing ? 'Update' : 'Save'} Sale`,
        editButton: 'Edit Sale'
      },
      statusClassOptions: { delivered: 'bg-success' }
    },
    purchase_return: {
      title: 'Purchase Return Management',
      icon: 'bi-box-arrow-left',
      buttonLabel: 'New Purchase Return',
      emptyMessage: 'No purchase returns found. Click \'New Purchase Return\' to create one.',
      entityLabel: 'Supplier',
      entityField: 'supplier',
      entityNameField: 'supplier_name',
      entityStore: () => useSupplierStore(),
      invoiceStore: () => usePurchaseStore(), // Same store, different endpoint
      itemsField: 'purchases',
      fetchMethod: 'fetchPurchases',
      fetchSingleMethod: 'fetchPurchase',
      createMethod: 'createPurchase',
      updateMethod: 'updatePurchase',
      deleteMethod: 'deletePurchase',
      apiEndpoint: '/purchases/returns/', // Different endpoint
      pdfEndpoint: (id) => `/purchases/returns/${id}/pdf/`,
      pdfFileName: (invoice) => `purchase_return_${invoice.invoice_number || invoice.id}.pdf`,
      statusOptions: ['pending', 'completed', 'cancelled'],
      paymentStatusOptions: ['unpaid', 'partial', 'paid', 'overpaid'],
      finalStatus: 'completed',
      finalStatusMessage: 'Cannot edit a completed purchase return',
      viewLabels: {
        title: (mode, editing) => {
          if (mode === 'view') return 'View Purchase Return'
          return editing ? 'Edit Purchase Return' : 'New Purchase Return'
        },
        entity: 'Supplier'
      },
      editLabels: {
        entity: 'Supplier',
        save: (editing) => editing ? 'Update' : 'Save',
        button: (editing) => `${editing ? 'Update' : 'Save'} Purchase Return`,
        editButton: 'Edit Purchase Return'
      }
    },
    sale_return: {
      title: 'Sale Return Management',
      icon: 'bi-box-arrow-in-left',
      buttonLabel: 'New Sale Return',
      emptyMessage: 'No sale returns found. Click \'New Sale Return\' to create one.',
      entityLabel: 'Customer',
      entityField: 'customer',
      entityNameField: 'customer_name',
      entityStore: () => useCustomerStore(),
      invoiceStore: () => useSaleStore(), // Same store, different endpoint
      itemsField: 'sales',
      fetchMethod: 'fetchSales',
      fetchSingleMethod: 'fetchSale',
      createMethod: 'createSale',
      updateMethod: 'updateSale',
      deleteMethod: 'deleteSale',
      apiEndpoint: '/sales/returns/', // Different endpoint
      pdfEndpoint: (id) => `/sales/returns/${id}/pdf/`,
      pdfFileName: (invoice) => `sale_return_${invoice.invoice_number || invoice.id}.pdf`,
      statusOptions: ['pending', 'delivered', 'cancelled'],
      paymentStatusOptions: ['unpaid', 'partial', 'paid', 'overpaid'],
      finalStatus: 'delivered',
      finalStatusMessage: 'Cannot edit a delivered sale return',
      viewLabels: {
        title: (mode, editing) => {
          if (mode === 'view') return 'View Sale Return'
          return editing ? 'Edit Sale Return' : 'New Sale Return'
        },
        entity: 'Customer'
      },
      editLabels: {
        entity: 'Customer',
        save: (editing) => editing ? 'Update' : 'Save',
        button: (editing) => `${editing ? 'Update' : 'Save'} Sale Return`,
        editButton: 'Edit Sale Return'
      },
      statusClassOptions: { delivered: 'bg-success' }
    }
  }

  const config = configs[type]
  if (!config) {
    throw new Error(`Invalid invoice type: ${type}. Must be one of: purchase, sale, purchase_return, sale_return`)
  }

  // Initialize stores
  const invoiceStore = config.invoiceStore()
  const entityStore = config.entityStore()
  const warehouseStore = useWarehouseStore()
  const productStore = useProductStore()

  // Helper to get entity list name
  const getEntityListName = () => {
    return type === 'purchase' || type === 'purchase_return' ? 'suppliers' : 'customers'
  }

  // Table columns based on type
  const columns = computed(() => {
    const base = [
      { key: 'invoice_number', label: 'Invoice #', width: '120px' },
      { key: config.entityField, label: config.entityLabel },
      { key: 'warehouse', label: 'Warehouse' },
      { key: 'invoice_date', label: 'Date', width: '120px' },
      { key: 'status', label: 'Status', width: '100px' }
    ]

    // Removed return_status column - now shown in status column

    base.push(
      { key: 'payment_status', label: 'Payment', width: '100px' },
      { key: 'grand_total', label: 'Grand Total', width: '120px' },
      { key: 'actions', label: 'Actions', width: '180px' }
    )

    return base
  })

  return {
    config,
    invoiceStore,
    entityStore,
    warehouseStore,
    productStore,
    columns,
    getEntityListName
  }
}

