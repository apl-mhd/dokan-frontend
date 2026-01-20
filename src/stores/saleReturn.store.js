import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as saleReturnApi from '../api/saleReturn.api'

export const useSaleReturnStore = defineStore('saleReturn', () => {
  const saleReturns = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })

  /**
   * Fetch all sale returns with optional filters
   */
  const fetchSaleReturns = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await saleReturnApi.fetchSaleReturns(params)
      
      // Handle different response formats
      if (response.data.results) {
        saleReturns.value = response.data.results
        pagination.value = {
          currentPage: params.page || 1,
          pageSize: params.page_size || 10,
          totalItems: response.data.count || 0,
          totalPages: Math.ceil((response.data.count || 0) / (params.page_size || 10))
        }
      } else if (response.data.data) {
        saleReturns.value = response.data.data || []
        if (response.data.count !== undefined && params.page && params.page_size) {
          pagination.value = {
            currentPage: response.data.page || params.page || 1,
            pageSize: response.data.page_size || params.page_size || 10,
            totalItems: response.data.count || saleReturns.value.length,
            totalPages: response.data.total_pages || Math.ceil((response.data.count || saleReturns.value.length) / (params.page_size || 10))
          }
        } else {
          pagination.value.totalItems = saleReturns.value.length
          pagination.value.totalPages = 1
        }
      } else {
        saleReturns.value = response.data || []
        pagination.value.totalItems = saleReturns.value.length
        pagination.value.totalPages = 1
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch sale returns'
      console.error('Error fetching sale returns:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch single sale return
   */
  const fetchSaleReturn = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await saleReturnApi.fetchSaleReturn(id)
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch sale return'
      console.error('Error fetching sale return:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Create sale return
   */
  const createSaleReturn = async (returnData) => {
    loading.value = true
    error.value = null
    try {
      const response = await saleReturnApi.createSaleReturn(returnData)
      await fetchSaleReturns() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.details || err.response?.data?.message || err.response?.data?.error || 'Failed to create sale return'
      console.error('Error creating sale return:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update sale return
   */
  const updateSaleReturn = async (id, returnData) => {
    loading.value = true
    error.value = null
    try {
      const response = await saleReturnApi.updateSaleReturn(id, returnData)
      await fetchSaleReturns() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.details || err.response?.data?.message || err.response?.data?.error || 'Failed to update sale return'
      console.error('Error updating sale return:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete sale return
   */
  const deleteSaleReturn = async (id) => {
    loading.value = true
    error.value = null
    try {
      await saleReturnApi.deleteSaleReturn(id)
      await fetchSaleReturns() // Refresh list
    } catch (err) {
      error.value = err.response?.data?.details || err.response?.data?.message || err.response?.data?.error || 'Failed to delete sale return'
      console.error('Error deleting sale return:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Complete sale return
   */
  const completeSaleReturn = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await saleReturnApi.completeSaleReturn(id)
      await fetchSaleReturns() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.details || err.response?.data?.message || err.response?.data?.error || 'Failed to complete sale return'
      console.error('Error completing sale return:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancel sale return
   */
  const cancelSaleReturn = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await saleReturnApi.cancelSaleReturn(id)
      await fetchSaleReturns() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.details || err.response?.data?.message || err.response?.data?.error || 'Failed to cancel sale return'
      console.error('Error cancelling sale return:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get returnable items for a sale
   */
  const getReturnableItems = async (saleId) => {
    loading.value = true
    error.value = null
    try {
      const response = await saleReturnApi.getReturnableItems(saleId)
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
    saleReturns.value = []
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
    saleReturns,
    loading,
    error,
    pagination,

    // Actions
    fetchSaleReturns,
    fetchSaleReturn,
    createSaleReturn,
    updateSaleReturn,
    deleteSaleReturn,
    completeSaleReturn,
    cancelSaleReturn,
    getReturnableItems,
    resetState
  }
})
