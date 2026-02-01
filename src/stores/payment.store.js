import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as paymentApi from '../api/payment.api'

export const usePaymentStore = defineStore('payment', () => {
  const customerPayments = ref([])
  const supplierPayments = ref([])
  const customerRefunds = ref([])
  const supplierRefunds = ref([])
  const currentPayment = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    count: 0,
    page: 1,
    page_size: 10,
    total_pages: 0
  })

  // Fetch customer payments
  const fetchCustomerPayments = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await paymentApi.fetchCustomerPayments(params)
      if (response.data.data) {
        customerPayments.value = response.data.data
        if (response.data.count !== undefined) {
          pagination.value = {
            count: response.data.count,
            page: response.data.page,
            page_size: response.data.page_size,
            total_pages: response.data.total_pages
          }
        }
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch customer payments'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch single customer payment
  const fetchCustomerPayment = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await paymentApi.fetchCustomerPayment(id)
      if (response.data.data) {
        currentPayment.value = response.data.data
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create customer payment
  const createCustomerPayment = async (data) => {
    loading.value = true
    error.value = null
    try {
      const response = await paymentApi.createCustomerPayment(data)
      // If FIFO was applied, multiple payments may have been created
      // We'll refresh the list to show all payments
      if (response.data.data) {
        customerPayments.value.unshift(response.data.data)
      }
      // If FIFO created multiple payments, refresh the list
      if (response.data.applied_to_invoices && response.data.applied_to_invoices.length > 0) {
        // Refresh payments list to show all created payments
        await fetchCustomerPayments()
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update customer payment
  const updateCustomerPayment = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const response = await paymentApi.updateCustomerPayment(id, data)
      if (response.data.data) {
        const index = customerPayments.value.findIndex(p => p.id === id)
        if (index !== -1) {
          customerPayments.value[index] = response.data.data
        }
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete customer payment
  const deleteCustomerPayment = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await paymentApi.deleteCustomerPayment(id)
      customerPayments.value = customerPayments.value.filter(p => p.id !== id)
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch supplier payments
  const fetchSupplierPayments = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await paymentApi.fetchSupplierPayments(params)
      if (response.data.data) {
        supplierPayments.value = response.data.data
        if (response.data.count !== undefined) {
          pagination.value = {
            count: response.data.count,
            page: response.data.page,
            page_size: response.data.page_size,
            total_pages: response.data.total_pages
          }
        }
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch supplier payments'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch single supplier payment
  const fetchSupplierPayment = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await paymentApi.fetchSupplierPayment(id)
      if (response.data.data) {
        currentPayment.value = response.data.data
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create supplier payment
  const createSupplierPayment = async (data) => {
    loading.value = true
    error.value = null
    try {
      const response = await paymentApi.createSupplierPayment(data)
      // If FIFO was applied, multiple payments may have been created
      // We'll refresh the list to show all payments
      if (response.data.data) {
        supplierPayments.value.unshift(response.data.data)
      }
      // If FIFO created multiple payments, refresh the list
      if (response.data.applied_to_invoices && response.data.applied_to_invoices.length > 0) {
        // Refresh payments list to show all created payments
        await fetchSupplierPayments()
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update supplier payment
  const updateSupplierPayment = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const response = await paymentApi.updateSupplierPayment(id, data)
      if (response.data.data) {
        const index = supplierPayments.value.findIndex(p => p.id === id)
        if (index !== -1) {
          supplierPayments.value[index] = response.data.data
        }
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete supplier payment
  const deleteSupplierPayment = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await paymentApi.deleteSupplierPayment(id)
      supplierPayments.value = supplierPayments.value.filter(p => p.id !== id)
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch customer refunds
  const fetchCustomerRefunds = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await paymentApi.fetchCustomerRefunds(params)
      if (response.data.data) {
        customerRefunds.value = response.data.data
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch customer refunds'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch supplier refunds
  const fetchSupplierRefunds = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await paymentApi.fetchSupplierRefunds(params)
      if (response.data.data) {
        supplierRefunds.value = response.data.data
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch supplier refunds'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create refund
  const createRefund = async (data) => {
    loading.value = true
    error.value = null
    try {
      const response = await paymentApi.createRefund(data)
      if (response.data.data) {
        if (data.payment_type === 'customer_refund') {
          customerRefunds.value.unshift(response.data.data)
        } else {
          supplierRefunds.value.unshift(response.data.data)
        }
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create refund'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete refund
  const deleteRefund = async (id, paymentType) => {
    loading.value = true
    error.value = null
    try {
      const response = await paymentApi.deleteRefund(id)
      if (paymentType === 'customer_refund') {
        customerRefunds.value = customerRefunds.value.filter(r => r.id !== id)
      } else {
        supplierRefunds.value = supplierRefunds.value.filter(r => r.id !== id)
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete refund'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reset state
  const resetState = () => {
    customerPayments.value = []
    supplierPayments.value = []
    customerRefunds.value = []
    supplierRefunds.value = []
    currentPayment.value = null
    loading.value = false
    error.value = null
    pagination.value = {
      count: 0,
      page: 1,
      page_size: 10,
      total_pages: 0
    }
  }

  return {
    // State
    customerPayments,
    supplierPayments,
    customerRefunds,
    supplierRefunds,
    currentPayment,
    loading,
    error,
    pagination,

    // Actions
    fetchCustomerPayments,
    fetchCustomerPayment,
    createCustomerPayment,
    updateCustomerPayment,
    deleteCustomerPayment,
    fetchSupplierPayments,
    fetchSupplierPayment,
    createSupplierPayment,
    updateSupplierPayment,
    deleteSupplierPayment,
    fetchCustomerRefunds,
    fetchSupplierRefunds,
    createRefund,
    deleteRefund,
    resetState
  }
})
