import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utility/axios'

export const useStockStore = defineStore('stock', () => {
  const stocks = ref([])
  const stockTransactions = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch all stocks
  const fetchStocks = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/inventory/stocks/', { params })
      stocks.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch stocks'
      console.error('Error fetching stocks:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch stock transactions
  const fetchStockTransactions = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/inventory/transactions/', { params })
      stockTransactions.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch stock transactions'
      console.error('Error fetching stock transactions:', err)
    } finally {
      loading.value = false
    }
  }

  // Get stock by product and warehouse
  const getStock = async (productId, warehouseId) => {
    try {
      const response = await api.get('/inventory/stocks/', {
        params: { product: productId, warehouse: warehouseId }
      })
      return response.data.data?.[0] || null
    } catch (err) {
      console.error('Error getting stock:', err)
      return null
    }
  }

  // Get stock transactions for a product
  const getProductTransactions = async (productId) => {
    try {
      const response = await api.get('/inventory/transactions/', {
        params: { product: productId }
      })
      return response.data.data || []
    } catch (err) {
      console.error('Error getting product transactions:', err)
      return []
    }
  }

  return {
    stocks,
    stockTransactions,
    loading,
    error,
    fetchStocks,
    fetchStockTransactions,
    getStock,
    getProductTransactions
  }
})

