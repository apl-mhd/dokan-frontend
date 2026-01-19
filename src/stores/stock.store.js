import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utility/axios'

export const useStockStore = defineStore('stock', () => {
  // State for stocks
  const stocks = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })

  // State for transactions
  const transactions = ref([])
  const loadingTransactions = ref(false)
  const transactionsError = ref(null)
  const transactionsPagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })

  // Fetch all stocks
  const fetchStocks = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/inventory/stocks/', { params })
      
      // Handle paginated response
      if (response.data.count !== undefined && params.page && params.page_size) {
        // Paginated response with metadata
        stocks.value = response.data.data || []
        pagination.value = {
          currentPage: response.data.page || params.page || 1,
          pageSize: response.data.page_size || params.page_size || 10,
          totalItems: response.data.count || stocks.value.length,
          totalPages: response.data.total_pages || Math.ceil((response.data.count || stocks.value.length) / (params.page_size || 10))
        }
      } else if (response.data.results) {
        stocks.value = response.data.results
        pagination.value = {
          currentPage: params.page || 1,
          pageSize: params.page_size || 10,
          totalItems: response.data.count || 0,
          totalPages: Math.ceil((response.data.count || 0) / (params.page_size || 10))
        }
      } else if (response.data.data) {
        stocks.value = response.data.data || []
        pagination.value.totalItems = stocks.value.length
        pagination.value.totalPages = 1
      } else {
        stocks.value = response.data || []
        pagination.value.totalItems = stocks.value.length
        pagination.value.totalPages = 1
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch stocks'
      console.error('Error fetching stocks:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch stock transactions
  const fetchStockTransactions = async (params = {}) => {
    loadingTransactions.value = true
    transactionsError.value = null
    try {
      const response = await api.get('/inventory/transactions/', { params })
      
      // Handle paginated response
      if (response.data.count !== undefined && params.page && params.page_size) {
        // Paginated response with metadata
        transactions.value = response.data.data || []
        transactionsPagination.value = {
          currentPage: response.data.page || params.page || 1,
          pageSize: response.data.page_size || params.page_size || 10,
          totalItems: response.data.count || transactions.value.length,
          totalPages: response.data.total_pages || Math.ceil((response.data.count || transactions.value.length) / (params.page_size || 10))
        }
      } else if (response.data.results) {
        transactions.value = response.data.results
        transactionsPagination.value = {
          currentPage: params.page || 1,
          pageSize: params.page_size || 10,
          totalItems: response.data.count || 0,
          totalPages: Math.ceil((response.data.count || 0) / (params.page_size || 10))
        }
      } else if (response.data.data) {
        transactions.value = response.data.data || []
        transactionsPagination.value.totalItems = transactions.value.length
        transactionsPagination.value.totalPages = 1
      } else {
        transactions.value = response.data || []
        transactionsPagination.value.totalItems = transactions.value.length
        transactionsPagination.value.totalPages = 1
      }
    } catch (err) {
      transactionsError.value = err.response?.data?.message || 'Failed to fetch stock transactions'
      console.error('Error fetching stock transactions:', err)
    } finally {
      loadingTransactions.value = false
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
    // Stock state
    stocks,
    loading,
    error,
    pagination,
    
    // Transactions state
    transactions,
    loadingTransactions,
    transactionsError,
    transactionsPagination,
    
    // Actions
    fetchStocks,
    fetchStockTransactions,
    getStock,
    getProductTransactions
  }
})

