import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as purchaseReturnApi from '../api/purchaseReturn.api'

export const usePurchaseReturnStore = defineStore('purchaseReturn', () => {
  const purchaseReturns = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })

  /**
   * Fetch all purchase returns with optional filters
   */
  const fetchPurchaseReturns = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await purchaseReturnApi.fetchPurchaseReturns(params)
      
      // Handle different response formats
      if (response.data.results) {
        purchaseReturns.value = response.data.results
        pagination.value = {
          currentPage: params.page || 1,
          pageSize: params.page_size || 10,
          totalItems: response.data.count || 0,
          totalPages: Math.ceil((response.data.count || 0) / (params.page_size || 10))
        }
      } else if (response.data.data) {
        purchaseReturns.value = response.data.data || []
        if (response.data.count !== undefined && params.page && params.page_size) {
          pagination.value = {
            currentPage: response.data.page || params.page || 1,
            pageSize: response.data.page_size || params.page_size || 10,
            totalItems: response.data.count || purchaseReturns.value.length,
            totalPages: response.data.total_pages || Math.ceil((response.data.count || purchaseReturns.value.length) / (params.page_size || 10))
          }
        } else {
          pagination.value.totalItems = purchaseReturns.value.length
          pagination.value.totalPages = 1
        }
      } else {
        purchaseReturns.value = response.data || []
        pagination.value.totalItems = purchaseReturns.value.length
        pagination.value.totalPages = 1
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch purchase returns'
      console.error('Error fetching purchase returns:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch single purchase return
   */
  const fetchPurchaseReturn = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await purchaseReturnApi.fetchPurchaseReturn(id)
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch purchase return'
      console.error('Error fetching purchase return:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Create purchase return
   */
  const createPurchaseReturn = async (returnData) => {
    loading.value = true
    error.value = null
    try {
      const response = await purchaseReturnApi.createPurchaseReturn(returnData)
      await fetchPurchaseReturns() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.details || err.response?.data?.message || err.response?.data?.error || 'Failed to create purchase return'
      console.error('Error creating purchase return:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update purchase return
   */
  const updatePurchaseReturn = async (id, returnData) => {
    loading.value = true
    error.value = null
    try {
      const response = await purchaseReturnApi.updatePurchaseReturn(id, returnData)
      await fetchPurchaseReturns() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.details || err.response?.data?.message || err.response?.data?.error || 'Failed to update purchase return'
      console.error('Error updating purchase return:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete purchase return
   */
  const deletePurchaseReturn = async (id) => {
    loading.value = true
    error.value = null
    try {
      await purchaseReturnApi.deletePurchaseReturn(id)
      await fetchPurchaseReturns() // Refresh list
    } catch (err) {
      error.value = err.response?.data?.details || err.response?.data?.message || err.response?.data?.error || 'Failed to delete purchase return'
      console.error('Error deleting purchase return:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Complete purchase return
   */
  const completePurchaseReturn = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await purchaseReturnApi.completePurchaseReturn(id)
      await fetchPurchaseReturns() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.details || err.response?.data?.message || err.response?.data?.error || 'Failed to complete purchase return'
      console.error('Error completing purchase return:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancel purchase return
   */
  const cancelPurchaseReturn = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await purchaseReturnApi.cancelPurchaseReturn(id)
      await fetchPurchaseReturns() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.details || err.response?.data?.message || err.response?.data?.error || 'Failed to cancel purchase return'
      console.error('Error cancelling purchase return:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get returnable items for a purchase
   */
  const getReturnableItems = async (purchaseId) => {
    loading.value = true
    error.value = null
    try {
      const response = await purchaseReturnApi.getReturnableItems(purchaseId)
      return response.data.data || response.data || []
    } catch (err) {
      error.value = err.response?.data?.details || err.response?.data?.message || err.response?.data?.error || 'Failed to fetch returnable items'
      console.error('Error fetching returnable items:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset store state
   */
  const resetState = () => {
    purchaseReturns.value = []
    loading.value = false
    error.value = null
    pagination.value = {
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0
    }
  }

  return {
    // State
    purchaseReturns,
    loading,
    error,
    pagination,

    // Actions
    fetchPurchaseReturns,
    fetchPurchaseReturn,
    createPurchaseReturn,
    updatePurchaseReturn,
    deletePurchaseReturn,
    completePurchaseReturn,
    cancelPurchaseReturn,
    getReturnableItems,
    resetState
  }
})
